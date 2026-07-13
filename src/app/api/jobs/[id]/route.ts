import { requireRole, apiError, apiSuccess } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { NextRequest } from 'next/server';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireRole('recruiter', 'admin', 'super_admin');
    const { id } = await params;
    const body = await req.json();

    const job = await prisma.job.findUnique({
      where: { id }
    });

    if (!job) {
      return apiError('Job not found', 404);
    }

    // Role/ownership check: recruiters can only edit their own jobs
    if (user.role === 'recruiter' && job.recruiterId !== user.id) {
      return apiError('Forbidden: you did not post this job', 403);
    }

    const { 
      title, company, companyLogo, location, jobType,
      salaryMin, salaryMax, salaryDisplay, description, requirements, skills, status 
    } = body;

    const updatedJob = await prisma.job.update({
      where: { id },
      data: {
        title: title !== undefined ? title : job.title,
        company: company !== undefined ? company : job.company,
        companyLogo: companyLogo !== undefined ? companyLogo : job.companyLogo,
        location: location !== undefined ? location : job.location,
        jobType: jobType !== undefined ? jobType : job.jobType,
        salaryMin: salaryMin !== undefined ? (salaryMin ? (typeof salaryMin === 'string' ? parseInt(salaryMin) : salaryMin) : null) : job.salaryMin,
        salaryMax: salaryMax !== undefined ? (salaryMax ? (typeof salaryMax === 'string' ? parseInt(salaryMax) : salaryMax) : null) : job.salaryMax,
        salaryDisplay: salaryDisplay !== undefined ? salaryDisplay : job.salaryDisplay,
        description: description !== undefined ? description : job.description,
        requirements: requirements !== undefined ? requirements : job.requirements,
        skills: skills !== undefined ? skills : job.skills,
        status: status !== undefined ? status : job.status,
      }
    });

    return apiSuccess(updatedJob);
  } catch (err: any) {
    return apiError(err.message, 500);
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireRole('recruiter', 'admin', 'super_admin');
    const { id } = await params;

    const job = await prisma.job.findUnique({
      where: { id }
    });

    if (!job) {
      return apiError('Job not found', 404);
    }

    // Role/ownership check
    if (user.role === 'recruiter' && job.recruiterId !== user.id) {
      return apiError('Forbidden: you did not post this job', 403);
    }

    await prisma.job.delete({
      where: { id }
    });

    return apiSuccess({ message: 'Job deleted successfully' });
  } catch (err: any) {
    return apiError(err.message, 500);
  }
}
