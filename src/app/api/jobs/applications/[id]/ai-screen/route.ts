import { requireRole, apiError, apiSuccess } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { screenCandidate } from '@/lib/aiScreeningAgent';
import { NextRequest } from 'next/server';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(req: NextRequest, { params }: RouteParams) {
  try {
    // 1. Authorize the user (must be recruiter, admin, or super_admin)
    await requireRole('recruiter', 'admin', 'super_admin');
    
    // 2. Fetch the target application details
    const { id } = await params;
    const application = await prisma.application.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            username: true,
            email: true,
          }
        },
        job: {
          select: {
            title: true,
            company: true,
            description: true,
            skills: true,
          }
        }
      }
    });

    if (!application) {
      return apiError('Application not found', 404);
    }

    // 3. Prepare parameters for AI Agent
    const candidateName = `${application.user.firstName || ''} ${application.user.lastName || ''}`.trim() || application.user.username || 'Candidate';
    const skillsRequired = Array.isArray(application.job.skills) ? (application.job.skills as string[]) : [];

    // 4. Run Socratic evaluation/screening agent
    const { result, markdownReport } = await screenCandidate(
      candidateName,
      application.coverLetter || '',
      application.job.title,
      application.job.company,
      application.job.description,
      skillsRequired
    );

    // 5. Update application with match score and evaluation report
    const updatedApplication = await prisma.application.update({
      where: { id },
      data: {
        matchScore: result.matchScore,
        recruiterNotes: markdownReport
      },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            username: true,
            email: true,
          }
        },
        job: {
          select: {
            title: true,
            company: true,
            description: true,
            skills: true,
          }
        }
      }
    });

    console.log(`Candidate AI screening completed. Name: ${candidateName}, Score: ${result.matchScore}%`);
    return apiSuccess({ success: true, application: updatedApplication });
  } catch (error: any) {
    console.error('Candidate AI screening failed:', error);
    return apiError(error?.message || 'AI Screening failed to process', 500);
  }
}
