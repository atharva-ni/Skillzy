import { currentUser } from '@clerk/nextjs/server';
import { getCurrentUser, syncClerkUser, apiError, apiSuccess } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    let dbUser = await getCurrentUser();

    // On-demand sync fallback: if logged in with Clerk but not yet synced to database
    if (!dbUser) {
      const clerkUser = await currentUser();
      if (clerkUser) {
        console.log(`On-demand sync triggered for Clerk user: ${clerkUser.id}`);
        dbUser = await syncClerkUser({
          id: clerkUser.id,
          emailAddresses: clerkUser.emailAddresses,
          firstName: clerkUser.firstName,
          lastName: clerkUser.lastName,
          username: clerkUser.username,
          imageUrl: clerkUser.imageUrl,
        });
      }
    }

    if (!dbUser) {
      return apiError('Unauthorized', 401);
    }

    // Fetch enrollments with course details
    const enrollments = await prisma.enrollment.findMany({
      where: { userId: dbUser.id, status: 'active' },
      select: { courseId: true },
    });

    const enrolledCourseIds = enrollments.map((e) => e.courseId);

    // Fetch payment records
    const payments = await prisma.payment.findMany({
      where: { userId: dbUser.id },
      orderBy: { createdAt: 'desc' },
    });

    // Fetch latest submissions with their AI reviews
    const latestSubmission = await prisma.submission.findFirst({
      where: { userId: dbUser.id },
      orderBy: { submittedAt: 'desc' },
      include: {
        aiReviews: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
        assignment: {
          select: { title: true }
        }
      }
    });

    const recentAiFeedback = latestSubmission && latestSubmission.aiReviews.length > 0 ? {
      title: latestSubmission.assignment?.title || 'Coding Practice Lab',
      score: latestSubmission.aiReviews[0].overallScore || 0,
      summary: latestSubmission.aiReviews[0].summary || '',
      strengths: latestSubmission.aiReviews[0].strengths || [],
      improvements: latestSubmission.aiReviews[0].improvements || [],
      styleFeedback: latestSubmission.aiReviews[0].styleFeedback || '',
    } : null;

    return apiSuccess({
      user: {
        id: dbUser.id,
        clerkId: dbUser.clerkId,
        email: dbUser.email,
        firstName: dbUser.firstName,
        lastName: dbUser.lastName,
        name: `${dbUser.firstName ?? ''} ${dbUser.lastName ?? ''}`.trim() || dbUser.username || 'User',
        username: dbUser.username,
        avatarUrl: dbUser.avatarUrl,
        avatar: dbUser.avatarUrl || '🎓', // fallback for avatar emoji
        role: dbUser.role,
        bio: dbUser.bio,
        phone: dbUser.phone,
        isVerified: dbUser.isVerified,
      },
      enrolledCourseIds,
      payments,
      recentAiFeedback,
    });
  } catch (error: any) {
    console.error('Error fetching /api/users/me:', error);
    return apiError(error?.message || 'Internal Server Error', 500);
  }
}
