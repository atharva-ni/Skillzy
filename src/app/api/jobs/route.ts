import { getCurrentUser, requireRole, apiError, apiSuccess } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { NextRequest } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    const { searchParams } = new URL(req.url);
    const manage = searchParams.get('manage') === 'true';

    if (manage) {
      if (!user || (user.role !== 'recruiter' && user.role !== 'admin' && user.role !== 'super_admin')) {
        return apiError('Forbidden', 403);
      }
      // If recruiter, return their own jobs. If admin/super_admin, return all jobs.
      const jobs = await prisma.job.findMany({
        where: user.role === 'recruiter' ? { recruiterId: user.id } : {},
        orderBy: { createdAt: 'desc' }
      });
      return apiSuccess(jobs);
    }

    // Default: Student/visitor job board view (only active jobs)
    const jobs = await prisma.job.findMany({
      where: { status: 'active' },
      orderBy: { createdAt: 'desc' }
    });
    return apiSuccess(jobs);
  } catch (err: any) {
    return apiError(err.message, 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireRole('recruiter', 'admin', 'super_admin');
    const body = await req.json();
    
    const { 
      title, company, companyLogo, location, jobType,
      salaryMin, salaryMax, salaryDisplay, description, requirements, skills 
    } = body;

    if (!title || !company || !description) {
      return apiError('Missing required fields (title, company, description)', 400);
    }

    const job = await prisma.job.create({
      data: {
        recruiterId: user.id,
        title,
        company,
        companyLogo: companyLogo || null,
        location: location || 'Remote',
        jobType: jobType || 'full_time',
        salaryMin: salaryMin ? parseInt(salaryMin) : null,
        salaryMax: salaryMax ? parseInt(salaryMax) : null,
        salaryDisplay: salaryDisplay || null,
        description,
        requirements: requirements || null,
        skills: skills || [],
        status: 'active',
        publishedAt: new Date()
      }
    });

    return apiSuccess(job, 201);
  } catch (err: any) {
    return apiError(err.message, 500);
  }
}
