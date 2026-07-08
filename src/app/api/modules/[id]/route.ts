import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { requireRole, apiError, apiSuccess } from '@/lib/auth';
import { createModuleSchema } from '@/lib/validations';
import { UserRole } from '@prisma/client';
import { cache } from '@/lib/redis';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PUT(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const dbUser = await requireRole(UserRole.instructor, UserRole.admin, UserRole.super_admin);

    const moduleItem = await prisma.module.findUnique({
      where: { id },
      include: { course: true },
    });

    if (!moduleItem) {
      return apiError('Module not found', 404);
    }

    const isCreator = moduleItem.course.instructorId === dbUser.id;
    const isAdmin = dbUser.role === UserRole.admin || dbUser.role === UserRole.super_admin;

    if (!isCreator && !isAdmin) {
      return apiError('Forbidden: you are not authorized to edit this module', 403);
    }

    const body = await req.json();
    const updateSchema = createModuleSchema.partial();
    const validatedData = updateSchema.parse(body);

    const updatedModule = await prisma.module.update({
      where: { id },
      data: validatedData,
    });

    // Invalidate course detail cache
    await cache.del(`course:detail:${moduleItem.courseId}`);

    console.log(`Module updated: ${updatedModule.title} (ID: ${updatedModule.id})`);
    return apiSuccess({ success: true, module: updatedModule });
  } catch (error: any) {
    console.error('Error updating module:', error);
    return apiError(error?.message || 'Failed to update module', 400);
  }
}

export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const dbUser = await requireRole(UserRole.instructor, UserRole.admin, UserRole.super_admin);

    const moduleItem = await prisma.module.findUnique({
      where: { id },
      include: { course: true },
    });

    if (!moduleItem) {
      return apiError('Module not found', 404);
    }

    const isCreator = moduleItem.course.instructorId === dbUser.id;
    const isAdmin = dbUser.role === UserRole.admin || dbUser.role === UserRole.super_admin;

    if (!isCreator && !isAdmin) {
      return apiError('Forbidden: you are not authorized to delete this module', 403);
    }

    await prisma.module.delete({
      where: { id },
    });

    // Invalidate course detail cache
    await cache.del(`course:detail:${moduleItem.courseId}`);

    console.log(`Module deleted: ${moduleItem.title} (ID: ${moduleItem.id})`);
    return apiSuccess({ success: true, message: 'Module deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting module:', error);
    return apiError(error?.message || 'Failed to delete module', 400);
  }
}
