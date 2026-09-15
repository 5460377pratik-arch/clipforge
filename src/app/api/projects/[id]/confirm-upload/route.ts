import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import type { ApiResponse } from '@/lib/types';

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(
  request: NextRequest,
  { params }: RouteContext
): Promise<NextResponse<ApiResponse<{ status: string }>>> {
  try {
    const { id: projectId } = await params;
    const body = await request.json();
    const storagePath = body.storagePath;
    
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ success: false, error: { code: 'UNAUTHORIZED', message: 'You must be logged in' } }, { status: 401 });
    }

    // 1. Verify Project Ownership
    const { data: project, error: projError } = await supabase
      .from('projects')
      .select('id, user_id')
      .eq('id', projectId)
      .single();

    if (projError || !project) {
      return NextResponse.json({ success: false, error: { code: 'NOT_FOUND', message: 'Project not found' } }, { status: 404 });
    }

    if (project.user_id !== user.id) {
      return NextResponse.json({ success: false, error: { code: 'FORBIDDEN', message: 'You do not have permission to modify this project' } }, { status: 403 });
    }

    // 2. Fetch the video source record
    const { data: source, error: sourceError } = await supabase
      .from('video_sources')
      .select('id, type, storage_path, status')
      .eq('project_id', projectId)
      .eq('type', 'upload')
      .single();

    if (sourceError || !source) {
      return NextResponse.json({ success: false, error: { code: 'NOT_FOUND', message: 'No upload source found for this project' } }, { status: 404 });
    }

    if (source.status === 'ready') {
      return NextResponse.json({ success: true, data: { status: 'ready' } }); // Already confirmed
    }

    if (!storagePath && !source.storage_path) {
      return NextResponse.json({ success: false, error: { code: 'BAD_REQUEST', message: 'Storage path not provided' } }, { status: 400 });
    }
    const finalPath = storagePath || source.storage_path;

    // 3. Verify the file actually exists in Supabase Storage
    // The path is expected to be e.g. "userId/projectId/filename.mp4"
    // We split it to get the folder and file name for the list() API
    const pathParts = finalPath.split('/');
    const fileName = pathParts.pop();
    const folderPath = pathParts.join('/');

    const { data: files, error: storageError } = await supabase.storage
      .from('videos')
      .list(folderPath, {
        limit: 100,
        search: fileName
      });

    if (storageError) {
      return NextResponse.json({ success: false, error: { code: 'STORAGE_ERROR', message: 'Failed to verify file in storage: ' + storageError.message } }, { status: 500 });
    }

    const fileExists = files && files.some(f => f.name === fileName);

    if (!fileExists) {
      return NextResponse.json({ success: false, error: { code: 'FILE_NOT_FOUND', message: 'The uploaded file could not be found in storage. Please try uploading again.' } }, { status: 400 });
    }

    // 4. Update the video source to 'ready'
    const { error: updateError } = await supabase
      .from('video_sources')
      .update({ status: 'ready', storage_path: finalPath })
      .eq('id', source.id);

    if (updateError) {
      return NextResponse.json({ success: false, error: { code: 'DB_ERROR', message: 'Failed to update source status' } }, { status: 500 });
    }

    // 5. Update Project status to 'ready'
    await supabase.from('projects').update({ status: 'ready', storage_path: finalPath }).eq('id', projectId);

    return NextResponse.json({ success: true, data: { status: 'ready' } });

  } catch (err: any /* eslint-disable-line @typescript-eslint/no-explicit-any */) {
    console.error('[POST /api/projects/[id]/confirm-upload]', err);
    return NextResponse.json({ success: false, error: { code: 'INTERNAL_ERROR', message: err.message || 'An unexpected error occurred.' } }, { status: 500 });
  }
}