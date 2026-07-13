import { requireRole, apiError, apiSuccess } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { NextRequest } from 'next/server';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireRole('recruiter', 'admin', 'super_admin');
    const { id } = await params;
    const body = await req.json();

    const { status, recruiterNotes } = body;

    const application = await prisma.application.findUnique({
      where: { id },
      include: {
        job: true
      }
    });

    if (!application) {
      return apiError('Application not found', 404);
    }

    // Recruiters can only modify applications for jobs they posted
    if (user.role === 'recruiter' && application.job.recruiterId !== user.id) {
      return apiError('Forbidden', 403);
    }

    const updated = await prisma.application.update({
      where: { id },
      data: {
        status: status !== undefined ? status : application.status,
        recruiterNotes: recruiterNotes !== undefined ? recruiterNotes : application.recruiterNotes
      }
    });

    return apiSuccess(updated);
  } catch (err: any) {
    return apiError(err.message, 500);
  }
}
