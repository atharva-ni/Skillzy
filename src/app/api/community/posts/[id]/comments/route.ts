import { requireAuth, apiError, apiSuccess } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { NextRequest } from 'next/server';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: postId } = await params;
    
    const comments = await prisma.comment.findMany({
      where: { postId, isDeleted: false },
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
            username: true,
            role: true
          }
        }
      },
      orderBy: { createdAt: 'asc' }
    });

    return apiSuccess(comments);
  } catch (err: any) {
    return apiError(err.message, 500);
  }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireAuth();
    const { id: postId } = await params;
    const body = await req.json();

    const { content } = body;

    if (!content || !content.trim()) {
      return apiError('Comment content cannot be empty', 400);
    }

    const postExists = await prisma.communityPost.findUnique({
      where: { id: postId }
    });

    if (!postExists) {
      return apiError('Post not found', 404);
    }

    const [comment] = await prisma.$transaction([
      prisma.comment.create({
        data: {
          postId,
          authorId: user.id,
          content: content.trim(),
          likesCount: 0
        },
        include: {
          author: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              avatarUrl: true,
              username: true,
              role: true
            }
          }
        }
      }),
      prisma.communityPost.update({
        where: { id: postId },
        data: { commentsCount: { increment: 1 } }
      })
    ]);

    return apiSuccess(comment, 201);
  } catch (err: any) {
    return apiError(err.message, 500);
  }
}
