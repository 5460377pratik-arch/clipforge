import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import type { ApiResponse, Project, PaginatedResult } from '@/lib/types';
import type { CreateProjectInput } from '@/services/projects';

export async function GET(request: NextRequest): Promise<NextResponse<ApiResponse<PaginatedResult<Project>>>> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ success: false, error: { code: 'UNAUTHORIZED', message: 'You must be logged in' } }, { status: 401 });
  }

  const { data: projects, error } = await supabase
    .from('projects')
    .select(`
      *,
      video_sources (*)
    `)
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ success: false, error: { code: 'DB_ERROR', message: error.message } }, { status: 500 });
  }

  // Map to frontend type
  const mappedProjects: Project[] = (projects || []).map(p => {
    const source = p.video_sources?.[0];
    return {
      id: p.id,
      userId: p.user_id,
      title: p.title,
      status: p.status as any /* eslint-disable-line @typescript-eslint/no-explicit-any */,
      config: p.config as any /* eslint-disable-line @typescript-eslint/no-explicit-any */,
      clipCount: 0, // Placeholder for now
      createdAt: p.created_at,
      updatedAt: p.updated_at,
      source: source ? {
        type: source.type,
        url: source.original_url || '',
        videoId: source.type === 'youtube' ? source.original_url : undefined, 
        // Note: mapping here is simplified for Phase 1
      } : { type: 'youtube', url: '', videoId: '' } as any /* eslint-disable-line @typescript-eslint/no-explicit-any */
    };
  });

  return NextResponse.json({
    success: true,
    data: {
      items: mappedProjects,
      total: mappedProjects.length,
      page: 1,
      pageSize: 50,
      hasMore: false
    }
  });
}

export async function POST(request: NextRequest): Promise<NextResponse<ApiResponse<Project>>> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ success: false, error: { code: 'UNAUTHORIZED', message: 'You must be logged in' } }, { status: 401 });
    }

    const body: CreateProjectInput = await request.json();

    if (!body.source) {
      return NextResponse.json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'source is required', field: 'source' } }, { status: 400 });
    }

    // 1. Insert Project
    const { data: project, error: projError } = await supabase
      .from('projects')
      .insert({
        user_id: user.id,
        title: body.title || (body.source.type === 'youtube' ? 'YouTube Video' : (body.source as any /* eslint-disable-line @typescript-eslint/no-explicit-any */).filename || 'New Project'),
        status: 'draft',
        config: body.config || {}
      })
      .select()
      .single();

    if (projError || !project) {
      return NextResponse.json({ success: false, error: { code: 'DB_ERROR', message: projError?.message || 'Failed to create project' } }, { status: 500 });
    }

    // 2. Insert Video Source
    const { data: source, error: sourceError } = await supabase
      .from('video_sources')
      .insert({
        project_id: project.id,
        type: body.source.type,
        original_url: body.source.type === 'youtube' ? body.source.url : null,
        filename: body.source.type === 'upload' ? (body.source as any /* eslint-disable-line @typescript-eslint/no-explicit-any */).filename : null,
        mime_type: body.source.type === 'upload' ? (body.source as any /* eslint-disable-line @typescript-eslint/no-explicit-any */).mimeType : null,
        file_size_mb: body.source.type === 'upload' ? (body.source as any /* eslint-disable-line @typescript-eslint/no-explicit-any */).fileSizeMb : null,
        status: body.source.type === 'upload' ? 'pending' : 'ready' // Upload needs storage upload next
      })
      .select()
      .single();

    if (sourceError) {
      // Rollback project theoretically, or just let it be orphaned for now
      return NextResponse.json({ success: false, error: { code: 'DB_ERROR', message: sourceError.message } }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data: {
        id: project.id,
        userId: project.user_id,
        title: project.title,
        status: project.status as any /* eslint-disable-line @typescript-eslint/no-explicit-any */,
        config: project.config as any /* eslint-disable-line @typescript-eslint/no-explicit-any */,
        clipCount: 0,
        createdAt: project.created_at,
        updatedAt: project.updated_at,
        source: body.source // Echo back
      }
    });

  } catch (err: any /* eslint-disable-line @typescript-eslint/no-explicit-any */) {
    console.error('[POST /api/projects]', err);
    return NextResponse.json({ success: false, error: { code: 'INTERNAL_ERROR', message: err.message || 'An unexpected error occurred.' } }, { status: 500 });
  }
}