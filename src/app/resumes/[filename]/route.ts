import { NextRequest } from 'next/server';
import fs from 'fs';
import path from 'path';

interface RouteParams {
  params: Promise<{ filename: string }>;
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const { filename } = await params;
    
    // Always resolve relative to process.cwd() (project directory) to bypass Turbopack root inference issues
    const filePath = path.join(process.cwd(), 'public', 'resumes', filename);
    
    if (!fs.existsSync(filePath)) {
      return new Response('Resume file not found', { status: 404 });
    }
    
    const htmlContent = fs.readFileSync(filePath, 'utf-8');
    
    return new Response(htmlContent, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8'
      }
    });
  } catch (err: any) {
    return new Response(err.message, { status: 500 });
  }
}
