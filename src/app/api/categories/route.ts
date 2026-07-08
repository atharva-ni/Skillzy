import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { apiSuccess, apiError } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { sortOrder: 'asc' },
    });
    return apiSuccess({ categories });
  } catch (error: any) {
    return apiError(error?.message || 'Failed to fetch categories', 500);
  }
}
