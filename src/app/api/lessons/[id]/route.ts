import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { requireRole, apiError, apiSuccess } from '@/lib/auth';
import { createLessonSchema } from '@/lib/validations';
import { UserRole } from '@prisma/client';
import { cache } from '@/lib/redis';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PUT(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const dbUser = await requireRole(UserRole.instructor, UserRole.admin, UserRole.super_admin);

    const lessonItem = await prisma.lesson.findUnique({
      where: { id },
      include: {
        module: {
          include: { course: true },
        },
      },
    });

    if (!lessonItem) {
      return apiError('Lesson not found', 404);
    }

    const isCreator = lessonItem.module.course.instructorId === dbUser.id;
    const isAdmin = dbUser.role === UserRole.admin || dbUser.role === UserRole.super_admin;

    if (!isCreator && !isAdmin) {
      return apiError('Forbidden: you are not authorized to edit this lesson', 403);
    }

    const body = await req.json();
    const updateSchema = createLessonSchema.partial();
    const validatedData = updateSchema.parse(body);

    // Sanitize moduleId to prevent empty string fk violation
    if (validatedData.moduleId === '' || !validatedData.moduleId) {
      delete validatedData.moduleId;
    }

    // If updating module, verify the new module belongs to the same course
    if (validatedData.moduleId && validatedData.moduleId !== lessonItem.moduleId) {
      const newModule = await prisma.module.findUnique({
        where: { id: validatedData.moduleId },
      });
      if (!newModule || newModule.courseId !== lessonItem.module.courseId) {
        return apiError('Invalid target module: Must belong to the same course', 400);
      }
    }

    const updatedLesson = await prisma.lesson.update({
      where: { id },
      data: validatedData,
    });

    // Invalidate course detail cache
    await cache.del(`course:detail:${lessonItem.module.courseId}`);

    console.log(`Lesson updated: ${updatedLesson.title} (ID: ${updatedLesson.id})`);
    return apiSuccess({ success: true, lesson: updatedLesson });
  } catch (error: any) {
    console.error('Error updating lesson:', error);
    return apiError(error?.message || 'Failed to update lesson', 400);
  }
}

export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const dbUser = await requireRole(UserRole.instructor, UserRole.admin, UserRole.super_admin);

    const lessonItem = await prisma.lesson.findUnique({
      where: { id },
      include: {
        module: {
          include: { course: true },
        },
      },
    });

    if (!lessonItem) {
      return apiError('Lesson not found', 404);
    }

    const isCreator = lessonItem.module.course.instructorId === dbUser.id;
    const isAdmin = dbUser.role === UserRole.admin || dbUser.role === UserRole.super_admin;

    if (!isCreator && !isAdmin) {
      return apiError('Forbidden: you are not authorized to delete this lesson', 403);
    }

    await prisma.lesson.delete({
      where: { id },
    });

    // Invalidate course detail cache
    await cache.del(`course:detail:${lessonItem.module.courseId}`);

    console.log(`Lesson deleted: ${lessonItem.title} (ID: ${lessonItem.id})`);
    return apiSuccess({ success: true, message: 'Lesson deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting lesson:', error);
    return apiError(error?.message || 'Failed to delete lesson', 400);
  }
}
