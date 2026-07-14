import { requireAuth, apiError, apiSuccess } from '@/lib/auth';
import { beautifyCourseContent } from '@/lib/socraticTutorAgent';
import { z } from 'zod';

const formatContentSchema = z.object({
  text: z.string().min(1, 'Text content is required'),
  type: z.enum(['description', 'lesson']),
});

export async function POST(req: Request) {
  try {
    // 1. Authorize the user (must be logged in)
    const dbUser = await requireAuth();
    
    // Allow only instructors, admins, and super_admins to format content
    if (!['instructor', 'admin', 'super_admin'].includes(dbUser.role)) {
      return apiError('Forbidden: Only instructors and admins can format content', 403);
    }

    // 2. Validate request body
    const body = await req.json();
    const { text, type } = formatContentSchema.parse(body);

    // 3. Format plain text into high-quality Markdown using LLM
    const formattedText = await beautifyCourseContent(text, type);

    return apiSuccess({ formattedText });
  } catch (error: any) {
    console.error('AI formatting API error:', error);
    return apiError(error?.message || 'Failed to auto-format content with AI', 500);
  }
}
