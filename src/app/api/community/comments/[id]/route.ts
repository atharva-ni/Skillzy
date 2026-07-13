import { requireAuth, apiError, apiSuccess } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { NextRequest } from 'next/server';

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireAuth();
    const { id } = await params;

    const comment = await prisma.comment.findUnique({
      where: { id }
    });

    if (!comment) {
      return apiError('Comment not found', 404);
    }

    // Verify user is author or has admin role
    if (comment.authorId !== user.id && user.role !== 'admin' && user.role !== 'super_admin') {
      return apiError('Forbidden: you are not authorized to delete this comment', 403);
    }

    await prisma.$transaction([
      prisma.comment.delete({
        where: { id }
      }),
      prisma.communityPost.update({
        where: { id: comment.postId },
        data: { commentsCount: { decrement: 1 } }
      })
    ]);

    return apiSuccess({ message: 'Comment deleted successfully' });
  } catch (err: any) {
    return apiError(err.message, 500);
  }
}
