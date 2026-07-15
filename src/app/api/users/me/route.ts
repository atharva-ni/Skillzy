import { currentUser } from '@clerk/nextjs/server';
import { getCurrentUser, syncClerkUser, apiError, apiSuccess } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { cache } from '@/lib/redis';
import { generateConsolidatedFeedback } from '@/lib/socraticTutorAgent';

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

    // Fetch enrollments with course details (both active and completed)
    const enrollments = await prisma.enrollment.findMany({
      where: {
        userId: dbUser.id,
        status: { in: ['active', 'completed'] },
      },
      select: { courseId: true },
    });

    const enrolledCourseIds = enrollments.map((e) => e.courseId);

    // Fetch payment records
    const payments = await prisma.payment.findMany({
      where: { userId: dbUser.id },
      orderBy: { createdAt: 'desc' },
    });

    // Generate or fetch consolidated AI feedback
    let recentAiFeedback = null;
    try {
      const cacheKey = `user:consolidated-feedback:${dbUser.id}`;
      const cachedFeedback = await cache.get(cacheKey);

      if (cachedFeedback) {
        recentAiFeedback = JSON.parse(cachedFeedback);
      } else {
        // Fetch submissions with AI reviews to build a consolidated view
        const submissions = await prisma.submission.findMany({
          where: { userId: dbUser.id },
          include: {
            aiReviews: {
              orderBy: { createdAt: 'desc' },
            },
            assignment: {
              select: { title: true }
            }
          },
          orderBy: { submittedAt: 'desc' },
        });

        const reviews = submissions
          .flatMap(sub => sub.aiReviews.map(rev => ({
            assignmentTitle: sub.assignment?.title || 'Coding Practice',
            code: sub.code || '',
            language: sub.language || '',
            summary: rev.summary || '',
            strengths: Array.isArray(rev.strengths) ? (rev.strengths as unknown as string[]) : [],
            improvements: Array.isArray(rev.improvements) ? (rev.improvements as unknown as string[]) : [],
            styleFeedback: rev.styleFeedback || ''
          })))
          .slice(0, 10);

        if (reviews.length > 0) {
          const consolidated = await generateConsolidatedFeedback(reviews);
          recentAiFeedback = {
            title: 'Your Socratic Learning Progress',
            score: 100, // Static placeholder score since score displays are hidden
            summary: consolidated.summary,
            strengths: consolidated.strengths,
            improvements: consolidated.improvements,
            styleFeedback: consolidated.styleFeedback,
          };
          // Cache consolidated feedback for 30 minutes
          await cache.set(cacheKey, JSON.stringify(recentAiFeedback), 1800);
        }
      }
    } catch (feedbackErr) {
      console.error('Failed to construct consolidated AI feedback:', feedbackErr);
    }

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
