import { requireAuth, apiError, apiSuccess } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { NextRequest } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth();

    if (user.role === 'recruiter' || user.role === 'admin' || user.role === 'super_admin') {
      // Recruiter/Admin view: Return applications received for jobs they posted (or all jobs for admin)
      const applications = await prisma.application.findMany({
        where: user.role === 'recruiter' ? {
          job: {
            recruiterId: user.id
          }
        } : {},
        include: {
          job: {
            select: {
              title: true,
              company: true,
              location: true,
              jobType: true,
              salaryDisplay: true
            }
          },
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              avatarUrl: true
            }
          }
        },
        orderBy: { appliedAt: 'desc' }
      });
      return apiSuccess(applications);
    }

    // Student view: Return applications submitted by current user
    const applications = await prisma.application.findMany({
      where: { userId: user.id },
      include: {
        job: true
      },
      orderBy: { appliedAt: 'desc' }
    });
    return apiSuccess(applications);
  } catch (err: any) {
    return apiError(err.message, 500);
  }
}
