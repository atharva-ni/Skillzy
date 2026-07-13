import { requireAuth, apiError, apiSuccess } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { NextRequest } from 'next/server';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireAuth();
    const { id: jobId } = await params;
    const body = await req.json();

    const { coverLetter, resumeUrl } = body;

    const job = await prisma.job.findUnique({
      where: { id: jobId }
    });

    if (!job) {
      return apiError('Job not found', 404);
    }

    if (job.status !== 'active') {
      return apiError('Applications are closed for this job', 400);
    }

    // Check if duplicate application exists
    const existingApplication = await prisma.application.findUnique({
      where: {
        jobId_userId: {
          jobId,
          userId: user.id
        }
      }
    });

    if (existingApplication) {
      return apiError('You have already applied to this job', 400);
    }

    // Create application
    const application = await prisma.application.create({
      data: {
        jobId,
        userId: user.id,
        coverLetter: coverLetter || null,
        resumeUrl: resumeUrl || null,
        status: 'applied'
      }
    });

    // Increment applicant count on job posting
    await prisma.job.update({
      where: { id: jobId },
      data: {
        applicantCount: {
          increment: 1
        }
      }
    });

    return apiSuccess(application, 201);
  } catch (err: any) {
    return apiError(err.message, 500);
  }
}
