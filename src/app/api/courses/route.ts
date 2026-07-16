import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { requireRole, apiError, apiSuccess } from '@/lib/auth';
import { createCourseSchema, courseQuerySchema } from '@/lib/validations';
import { UserRole } from '@prisma/client';
import { cache } from '@/lib/redis';

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const searchParams = Object.fromEntries(url.searchParams.entries());

    // Validate query parameters
    const query = courseQuerySchema.parse(searchParams);

    const where: any = {};

    // Apply search filter (case-insensitive title or description)
    if (query.search) {
      where.OR = [
        { title: { contains: query.search, mode: 'insensitive' } },
        { description: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    // Apply category filter (by slug or ID)
    if (query.category && query.category !== 'All') {
      where.category = {
        OR: [
          { id: query.category },
          { name: query.category },
          { slug: query.category },
        ],
      };
    }

    // Apply level filter
    if (query.level) {
      where.level = query.level;
    }

    // Apply status filter (default: published only, unless admin/instructor requesting)
    if (query.status && query.status !== 'all') {
      try {
        await requireRole(UserRole.instructor, UserRole.admin, UserRole.super_admin);
        where.status = query.status;
      } catch {
        where.status = 'published';
      }
    } else if (query.status === 'all') {
      try {
        await requireRole(UserRole.instructor, UserRole.admin, UserRole.super_admin);
        // Do not set where.status to fetch all statuses
      } catch {
        where.status = 'published';
      }
    } else {
      where.status = 'published';
    }

    // Dynamic Cache Key based on query params
    const cacheKey = `courses:list:search=${query.search || ''}&cat=${query.category || ''}&lvl=${query.level || ''}&sort=${query.sort}&page=${query.page}&limit=${query.limit}&status=${where.status || 'all'}`;
    
    // Attempt to serve from cache
    const cachedRaw = await cache.get(cacheKey);
    if (cachedRaw) {
      console.log(`[Cache Hit] Serving courses list for: ${cacheKey}`);
      return apiSuccess(JSON.parse(cachedRaw));
    }

    // Determine sorting
    let orderBy: any = {};
    if (query.sort === 'rating') {
      orderBy = { ratingAvg: 'desc' };
    } else if (query.sort === 'price_asc') {
      orderBy = { price: 'asc' };
    } else if (query.sort === 'price_desc') {
      orderBy = { price: 'desc' };
    } else if (query.sort === 'newest') {
      orderBy = { createdAt: 'desc' };
    } else {
      // Default sorting: popular (by students enrolled)
      orderBy = { studentsEnrolled: 'desc' };
    }

    // Fetch database courses matching the query
    const dbCoursesRaw = await prisma.course.findMany({
      where,
      include: {
        category: { select: { name: true, slug: true, icon: true } },
        instructor: { select: { firstName: true, lastName: true, avatarUrl: true } },
        modules: {
          select: {
            lessons: {
              select: {
                id: true
              }
            }
          }
        }
      },
    });

    const dbCourses = dbCoursesRaw.map((course: any) => {
      const lessonsCount = course.modules?.reduce((acc: number, mod: any) => acc + (mod.lessons?.length || 0), 0) || 0;
      const { modules, ...rest } = course;
      return {
        ...rest,
        _count: {
          lessons: lessonsCount
        }
      };
    });

    // Check if the current user is a student (or guest student)
    const { getCurrentUser } = await import('@/lib/auth');
    const dbUser = await getCurrentUser().catch(() => null);
    const isStudent = !dbUser || dbUser.role === 'student';

    // Retrieve and filter mock courses if student
    let filteredMock: any[] = [];
    if (isStudent) {
      const { MOCK_COURSES } = await import('@/data/mockCourses');
      filteredMock = MOCK_COURSES.filter((course) => {
        // Search filter
        if (query.search) {
          const searchLower = query.search.toLowerCase();
          const matchesSearch =
            course.title.toLowerCase().includes(searchLower) ||
            course.description.toLowerCase().includes(searchLower);
          if (!matchesSearch) return false;
        }

        // Category filter
        if (query.category && query.category !== 'All') {
          const catLower = query.category.toLowerCase();
          const matchesCategory =
            course.category.name.toLowerCase() === catLower ||
            course.category.slug.toLowerCase() === catLower ||
            course.categoryId.toLowerCase() === catLower;
          if (!matchesCategory) return false;
        }

        // Level filter
        if (query.level) {
          if (course.level !== query.level) return false;
        }

        return true;
      });
    }

    // Combine courses
    const combined = [...dbCourses, ...filteredMock];

    // Sort the combined list
    if (query.sort === 'rating') {
      combined.sort((a, b) => (b.ratingAvg || 0) - (a.ratingAvg || 0));
    } else if (query.sort === 'price_asc') {
      combined.sort((a, b) => (a.price || 0) - (b.price || 0));
    } else if (query.sort === 'price_desc') {
      combined.sort((a, b) => (b.price || 0) - (a.price || 0));
    } else if (query.sort === 'newest') {
      // For mock courses, we just sort them below or assume they are newer
      combined.sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateB - dateA;
      });
    } else {
      // Default: popular (by students enrolled)
      combined.sort((a, b) => (b.studentsEnrolled || 0) - (a.studentsEnrolled || 0));
    }

    const total = combined.length;
    const skip = (query.page - 1) * query.limit;
    const paginatedCourses = combined.slice(skip, skip + query.limit);

    const result = {
      courses: paginatedCourses,
      pagination: {
        total,
        page: query.page,
        limit: query.limit,
        totalPages: Math.ceil(total / query.limit),
      },
    };

    // Store in cache for 30 seconds (keep catalog fresh while keeping it fast under high traffic)
    await cache.set(cacheKey, JSON.stringify(result), 30);

    return apiSuccess(result);
  } catch (error: any) {
    console.error('Error fetching courses:', error);
    return apiError(error?.message || 'Failed to fetch courses', 400);
  }
}

export async function POST(req: Request) {
  try {
    // Restrict course creation to instructors, admins, and super_admins
    const user = await requireRole(UserRole.instructor, UserRole.admin, UserRole.super_admin);

    const body = await req.json();
    const validatedData = createCourseSchema.parse(body);

    // Create unique slug from title
    const baseSlug = validatedData.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
    
    // Ensure uniqueness of slug
    let slug = baseSlug;
    let count = 0;
    while (await prisma.course.findUnique({ where: { slug } })) {
      count++;
      slug = `${baseSlug}-${count}`;
    }

    const course = await prisma.course.create({
      data: {
        ...validatedData,
        slug,
        instructorId: user.id,
        status: 'draft', // New courses are draft by default
      },
    });

    // Invalidate cached courses catalog
    await cache.flushPattern('courses:list:*');

    console.log(`Course created: ${course.title} (ID: ${course.id})`);
    return apiSuccess({ success: true, course }, 201);
  } catch (error: any) {
    console.error('Error creating course:', error);
    return apiError(error?.message || 'Failed to create course', 400);
  }
}
