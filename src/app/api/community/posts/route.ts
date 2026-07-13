import { requireAuth, apiError, apiSuccess } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { NextRequest } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const posts = await prisma.communityPost.findMany({
      where: { isDeleted: false },
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
        },
        likes: {
          select: {
            userId: true
          }
        }
      },
      orderBy: [
        { isPinned: 'desc' },
        { createdAt: 'desc' }
      ]
    });

    return apiSuccess(posts);
  } catch (err: any) {
    return apiError(err.message, 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await req.json();

    const { content, tags } = body;

    if (!content || !content.trim()) {
      return apiError('Post content cannot be empty', 400);
    }

    const post = await prisma.communityPost.create({
      data: {
        authorId: user.id,
        content: content.trim(),
        tags: tags || ['general'],
        likesCount: 0,
        commentsCount: 0
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
    });

    return apiSuccess(post, 201);
  } catch (err: any) {
    return apiError(err.message, 500);
  }
}
