import { requireAuth, apiError, apiSuccess } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { NextRequest } from 'next/server';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireAuth();
    const { id: postId } = await params;
    const body = await req.json();

    const { action } = body; // action can be 'like'

    if (action !== 'like') {
      return apiError('Invalid action', 400);
    }

    const post = await prisma.communityPost.findUnique({
      where: { id: postId }
    });

    if (!post) {
      return apiError('Post not found', 404);
    }

    // Toggle Post Like
    const existingLike = await prisma.postLike.findUnique({
      where: {
        userId_postId: {
          userId: user.id,
          postId
        }
      }
    });

    if (existingLike) {
      // Unlike
      await prisma.$transaction([
        prisma.postLike.delete({
          where: {
            userId_postId: {
              userId: user.id,
              postId
            }
          }
        }),
        prisma.communityPost.update({
          where: { id: postId },
          data: { likesCount: { decrement: 1 } }
        })
      ]);
      return apiSuccess({ liked: false });
    } else {
      // Like
      await prisma.$transaction([
        prisma.postLike.create({
          data: {
            userId: user.id,
            postId
          }
        }),
        prisma.communityPost.update({
          where: { id: postId },
          data: { likesCount: { increment: 1 } }
        })
      ]);
      return apiSuccess({ liked: true });
    }
  } catch (err: any) {
    return apiError(err.message, 500);
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireAuth();
    const { id: postId } = await params;

    const post = await prisma.communityPost.findUnique({
      where: { id: postId }
    });

    if (!post) {
      return apiError('Post not found', 404);
    }

    // Verify user owns the post or is admin/super_admin
    if (post.authorId !== user.id && user.role !== 'admin' && user.role !== 'super_admin') {
      return apiError('Forbidden: you are not authorized to delete this post', 403);
    }

    await prisma.communityPost.delete({
      where: { id: postId }
    });

    return apiSuccess({ message: 'Post deleted successfully' });
  } catch (err: any) {
    return apiError(err.message, 500);
  }
}
