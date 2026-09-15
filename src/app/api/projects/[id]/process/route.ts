import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import type { ApiResponse } from '@/lib/types';

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(
  request: NextRequest,
  { params }: RouteContext
): Promise<NextResponse<ApiResponse<{ jobId: string, message: string }>>> {
  try {
    const { id: projectId } = await params;
    
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ success: false, error: { code: 'UNAUTHORIZED', message: 'You must be logged in' } }, { status: 401 });
    }

    // Verify Project Ownership
    const { data: project, error: projError } = await supabase
      .from('projects')
      .select('id, user_id, status')
      .eq('id', projectId)
      .single();

    if (projError || !project) {
      return NextResponse.json({ success: false, error: { code: 'NOT_FOUND', message: 'Project not found' } }, { status: 404 });
    }

    if (project.user_id !== user.id) {
      return NextResponse.json({ success: false, error: { code: 'FORBIDDEN', message: 'You do not have permission to modify this project' } }, { status: 403 });
    }

    if (project.status === 'processing') {
      return NextResponse.json({ success: false, error: { code: 'BAD_REQUEST', message: 'Project is already processing' } }, { status: 400 });
    }

    // 1. Check if there is an existing failed job for this project to resume from its checkpoints
    const { data: existingJobs } = await supabase
      .from('processing_jobs')
      .select('id, status, result_data')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false })
      .limit(1);

    const latestJob = existingJobs?.[0];
    let jobId: string;

    if (latestJob && latestJob.status === 'failed') {
      // Resume existing failed job: preserve result_data checkpoints, reset status to queued
      const { data: updatedJob, error: updateError } = await supabase
        .from('processing_jobs')
        .update({
          status: 'queued',
          stage: 'preparing',
          error_message: null
        })
        .eq('id', latestJob.id)
        .select('id')
        .single();

      if (updateError || !updatedJob) {
        return NextResponse.json({ success: false, error: { code: 'DB_ERROR', message: `Failed to resume processing job: ${updateError?.message || 'Unknown error'}` } }, { status: 500 });
      }
      jobId = updatedJob.id;
    } else {
      // Create new processing job, carrying forward any existing checkpoints if available
      const { data: newJob, error: newJobError } = await supabase
        .from('processing_jobs')
        .insert({
          project_id: projectId,
          type: 'analysis',
          status: 'queued',
          stage: 'preparing',
          result_data: latestJob?.result_data || {}
        })
        .select('id')
        .single();

      if (newJobError || !newJob) {
        return NextResponse.json({ success: false, error: { code: 'DB_ERROR', message: `Failed to create processing job: ${newJobError?.message || 'Unknown error'}` } }, { status: 500 });
      }
      jobId = newJob.id;
    }

    // 2. Update project status to queued
    await supabase.from('projects').update({ status: 'queued' }).eq('id', projectId);

    // 3. Queue the job (External Integration Boundary)
    const QUEUE_URL = process.env.WORKER_QUEUE_URL;
    if (!QUEUE_URL) {
      // Return a 202 Accepted but denote that it's unconfigured.
      return NextResponse.json(
        { 
          success: true, 
          data: { 
            jobId: jobId, 
            message: 'WORKER QUEUE NOT CONFIGURED. Job created in database but will not be processed.' 
          } 
        }, 
        { status: 202 }
      );
    }

    // Attempt actual queuing if configured
    try {
      const qRes = await fetch(QUEUE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobId: jobId, projectId: projectId })
      });
      if (!qRes.ok) {
        throw new Error('Queue provider rejected request');
      }
    } catch (err: any /* eslint-disable-line @typescript-eslint/no-explicit-any */) {
       await supabase.from('processing_jobs').update({ status: 'failed', error_message: 'Failed to dispatch to queue' }).eq('id', jobId);
       await supabase.from('projects').update({ status: 'failed' }).eq('id', projectId);
       return NextResponse.json({ success: false, error: { code: 'QUEUE_ERROR', message: err.message || 'Worker dispatch failed' } }, { status: 500 });
    }

    return NextResponse.json({ success: true, data: { jobId: jobId, message: 'Processing job successfully queued.' } });

  } catch (err: any /* eslint-disable-line @typescript-eslint/no-explicit-any */) {
    console.error('[POST /api/projects/[id]/process]', err);
    return NextResponse.json({ success: false, error: { code: 'INTERNAL_ERROR', message: err.message || 'An unexpected error occurred.' } }, { status: 500 });
  }
}