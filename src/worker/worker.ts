import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { DefaultTranscriptionProvider, type TranscriptionResult } from '../services/pipeline/transcription';
import { DefaultHighlightDetectionProvider, type HighlightCandidate } from '../services/pipeline/highlights';
import { FFmpegClipGenerationService } from '../services/pipeline/clip-generation';
import { YouTubeIngestionService } from '../services/pipeline/youtube-ingestion';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('WORKER FATAL ERROR: SUPABASE_SERVICE_ROLE_KEY is required for the worker to bypass RLS and process jobs.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

const transcriptionProvider = new DefaultTranscriptionProvider();
const highlightProvider = new DefaultHighlightDetectionProvider();
const clipGenerator = new FFmpegClipGenerationService();
const youtubeIngestion = new YouTubeIngestionService();

// Helper to limit concurrency
async function asyncMap<T, R>(array: T[], mapper: (item: T, index: number) => Promise<R>, limit: number): Promise<R[]> {
  const results: R[] = new Array(array.length);
  let index = 0;

  const worker = async () => {
    while (index < array.length) {
      const currentIndex = index++;
      results[currentIndex] = await mapper(array[currentIndex], currentIndex);
    }
  };

  const workers = Array(Math.min(limit, array.length)).fill(null).map(worker);
  await Promise.all(workers);
  return results;
}

interface JobCheckpoint {
  transcript?: TranscriptionResult;
  highlights?: HighlightCandidate[];
}

async function processJob(job: any /* eslint-disable-line @typescript-eslint/no-explicit-any */) {
  const perfStartTime = performance.now();
  console.log(`[PERF] job start: ${job.id} for project ${job.project_id}`);
  let localVideoPath: string | null = null;
  
  try {
    // 1. Mark as processing
    await supabase.from('processing_jobs').update({ status: 'processing', stage: 'preparing' }).eq('id', job.id);
    await supabase.from('projects').update({ status: 'processing' }).eq('id', job.project_id);

    // Read existing checkpoint data (resuming support)
    const checkpoint: JobCheckpoint = (job.result_data as JobCheckpoint) || {};

    // Fetch user_id from project for storage isolation
    const { data: projData, error: projError } = await supabase.from('projects').select('user_id').eq('id', job.project_id).single();
    if (projError) throw new Error(`Failed to fetch project for user_id: ${projError.message}`);
    const userId = projData?.user_id || 'unknown_user';

    // 2. Fetch video source
    const { data: sources, error: sourceError } = await supabase.from('video_sources').select('*').eq('project_id', job.project_id);
    if (sourceError) throw new Error(`Failed to fetch video source: ${sourceError.message}`);
    const source = sources?.[0];
    
    if (!source) throw new Error('Video source missing for this project');

    // Helper to ensure local source video is downloaded only when genuinely needed
    const ensureLocalVideo = async (): Promise<string> => {
      if (localVideoPath && fs.existsSync(localVideoPath)) return localVideoPath;

      await supabase.from('processing_jobs').update({ stage: 'downloading_source' }).eq('id', job.id);

      if (source.type === 'youtube') {
        if (!source.original_url) throw new Error('YouTube URL is missing');
        console.log(`[Worker] Downloading YouTube video directly to local processing asset: ${source.original_url}`);
        const downloadResult = await youtubeIngestion.download(source.original_url, job.project_id);
        localVideoPath = downloadResult.localFilePath;
      } else if (source.type === 'upload') {
        if (!source.storage_path) throw new Error('Uploaded video storage path is missing');
        console.log(`[Worker] Downloading uploaded video from Supabase storage: ${source.storage_path}`);
        const dlStart = performance.now();
        const { data: videoData, error: downloadError } = await supabase.storage.from("videos").download(source.storage_path);
        if (downloadError || !videoData) {
          throw new Error(`Failed to download source video from storage: ${downloadError?.message}`);
        }
        localVideoPath = path.join(os.tmpdir(), `${uuidv4()}_source.mp4`);
        fs.writeFileSync(localVideoPath, Buffer.from(await videoData.arrayBuffer()));
        const dlElapsed = (performance.now() - dlStart).toFixed(1);
        console.log(`[PERF] source download end: ${dlElapsed}ms`);
      } else {
        throw new Error(`Unsupported video source type: ${source.type}`);
      }

      if (!localVideoPath || !fs.existsSync(localVideoPath)) {
        throw new Error('Local video file not available after download');
      }
      return localVideoPath;
    };

    // -------------------------------------------------------------
    // STAGE 1: Transcription (Resume checkpoint if available)
    // -------------------------------------------------------------
    let transcript: TranscriptionResult;
    if (checkpoint.transcript && Array.isArray(checkpoint.transcript.segments) && checkpoint.transcript.segments.length > 0) {
      console.log(`[Resume] Existing transcript found (${checkpoint.transcript.segments.length} segments) — skipping download & Whisper transcription.`);
      transcript = checkpoint.transcript;
    } else {
      const videoPath = await ensureLocalVideo();
      await supabase.from('processing_jobs').update({ stage: 'transcribing' }).eq('id', job.id);
      console.log(`[Worker] Starting Whisper transcription...`);
      transcript = await transcriptionProvider.transcribe(videoPath);
      console.log(`[Worker] Transcription finished with ${transcript.segments?.length || 0} segments`);

      // Persist transcript checkpoint immediately
      console.log(`[PERF] transcript checkpoint start`);
      const tCpStart = performance.now();
      checkpoint.transcript = transcript;
      await supabase.from('processing_jobs').update({ result_data: checkpoint }).eq('id', job.id);
      console.log(`[PERF] transcript checkpoint end: ${(performance.now() - tCpStart).toFixed(1)}ms`);
    }

    // -------------------------------------------------------------
    // STAGE 2: Highlight Detection (Resume checkpoint if available)
    // -------------------------------------------------------------
    let highlights: HighlightCandidate[] = [];
    if (checkpoint.highlights && Array.isArray(checkpoint.highlights) && checkpoint.highlights.length > 0) {
      console.log(`[Resume] Existing highlights found (${checkpoint.highlights.length} highlights) — skipping Gemini detection.`);
      highlights = checkpoint.highlights;
    } else {
      await supabase.from('processing_jobs').update({ stage: 'detecting_highlights' }).eq('id', job.id);
      console.log(`[PERF] Gemini start`);
      const gStart = performance.now();
      highlights = await highlightProvider.detectHighlights(transcript, 3);
      console.log(`[PERF] Gemini end: ${(performance.now() - gStart).toFixed(1)}ms`);
      console.log(`[Worker] Highlight detection finished. Found ${highlights.length} highlights.`);

      // Persist highlights checkpoint immediately
      console.log(`[PERF] highlight checkpoint start`);
      const hCpStart = performance.now();
      checkpoint.highlights = highlights;
      await supabase.from('processing_jobs').update({ result_data: checkpoint }).eq('id', job.id);
      console.log(`[PERF] highlight checkpoint end: ${(performance.now() - hCpStart).toFixed(1)}ms`);
    }

    // -------------------------------------------------------------
    // STAGE 3: Clip Generation (Idempotent per clip)
    // -------------------------------------------------------------
    await supabase.from('processing_jobs').update({ stage: 'generating_clips' }).eq('id', job.id);

    // Query existing clips in database to avoid re-generating already completed clips
    const { data: existingClips } = await supabase
      .from('clips')
      .select('id, start_time, end_time, storage_path, status')
      .eq('project_id', job.project_id)
      .eq('status', 'ready');

    const remainingHighlights = highlights.filter(h => {
      const alreadyExists = existingClips?.some(
        c => c.start_time === h.startMs && c.end_time === h.endMs && c.storage_path
      );
      if (alreadyExists) {
        console.log(`[Resume] Existing clip found for highlight [${h.startMs}ms - ${h.endMs}ms] — skipping generation.`);
      }
      return !alreadyExists;
    });

    if (remainingHighlights.length > 0) {
      console.log(`[Worker] Generating ${remainingHighlights.length} remaining clips with concurrency 2`);
      const videoPath = await ensureLocalVideo();

      await asyncMap(remainingHighlights, async (highlight, idx) => {
        const clipIdx = idx + 1;
        console.log(`[PERF] FFmpeg clip ${clipIdx} start: [${highlight.startMs}ms - ${highlight.endMs}ms]`);
        const clipStoragePath = await clipGenerator.generateClip(job.project_id, userId, videoPath, highlight);

        // Save clip to DB
        const dbStart = performance.now();
        await supabase.from('clips').insert({
          project_id: job.project_id,
          job_id: job.id,
          title: highlight.title,
          storage_path: clipStoragePath,
          duration: highlight.endMs - highlight.startMs,
          start_time: highlight.startMs,
          end_time: highlight.endMs,
          score: highlight.score,
          status: 'ready'
        });
        console.log(`[PERF] insert clip ${clipIdx} db end: ${(performance.now() - dbStart).toFixed(1)}ms`);
      }, 2);
    } else {
      console.log(`[Resume] All clips already generated — skipping FFmpeg.`);
    }

    // -------------------------------------------------------------
    // STAGE 4: Completion
    // -------------------------------------------------------------
    console.log(`[PERF] database finalization start`);
    const fStart = performance.now();
    await supabase.from('processing_jobs').update({ status: 'completed', stage: 'finalizing' }).eq('id', job.id);
    await supabase.from('projects').update({ status: 'ready' }).eq('id', job.project_id);
    console.log(`[PERF] database finalization end: ${(performance.now() - fStart).toFixed(1)}ms`);

    const totalElapsed = (performance.now() - perfStartTime).toFixed(1);
    console.log(`[PERF] TOTAL: ${totalElapsed}ms (${(Number(totalElapsed) / 1000).toFixed(1)}s)`);

  } catch (err: any /* eslint-disable-line @typescript-eslint/no-explicit-any */) {
    console.error(`[Worker] Job ${job.id} failed:`, err.message);
    await supabase.from('processing_jobs').update({ 
      status: 'failed', 
      error_message: err.message 
    }).eq('id', job.id);
    await supabase.from('projects').update({ status: 'failed' }).eq('id', job.project_id);
  } finally {
    // Guaranteed cleanup of temporary local source video
    if (localVideoPath && fs.existsSync(localVideoPath)) {
      console.log(`[Worker] Cleaning up temporary local source video file: ${localVideoPath}`);
      try {
        fs.unlinkSync(localVideoPath);
      } catch (cleanupErr: any /* eslint-disable-line @typescript-eslint/no-explicit-any */) {
        console.error(`[Worker] Error removing temporary file ${localVideoPath}:`, cleanupErr.message);
      }
    }
  }
}

let isPolling = false;
let idlePollCount = 0;

async function pollJobs() {
  if (isPolling) return;
  isPolling = true;
  try {
    const { data: jobs, error } = await supabase
      .from('processing_jobs')
      .select('*')
      .eq('status', 'queued')
      .order('created_at', { ascending: true })
      .limit(1);

    if (error) {
      console.error('[Worker] Error polling jobs from database:', error.message);
      return;
    }

    if (jobs && jobs.length > 0) {
      const job = jobs[0];

      // Atomic lock/claim: only claim if still in 'queued' status
      const { data: claimedJob, error: claimError } = await supabase
        .from('processing_jobs')
        .update({ status: 'processing', stage: 'preparing' })
        .eq('id', job.id)
        .eq('status', 'queued')
        .select()
        .single();

      if (claimError || !claimedJob) {
        // Another cycle or worker already claimed it
        return;
      }

      idlePollCount = 0;
      console.log(`[Worker] Claimed queued job ${claimedJob.id} for project ${claimedJob.project_id}`);
      await processJob(claimedJob);
    } else {
      idlePollCount++;
      if (idlePollCount === 1 || idlePollCount % 10 === 0) {
        console.log('[Worker] Worker polling for jobs... (no queued jobs)');
      }
    }
  } catch (err: any /* eslint-disable-line @typescript-eslint/no-explicit-any */) {
    console.error('[Worker] Unexpected error during poll cycle:', err.message);
  } finally {
    isPolling = false;
  }
}

// Startup
console.log('[Worker] Worker startup initialized.');
console.log('[Worker] Entering polling loop (interval: 3000ms)...');

// Preload Whisper model in background so the first job doesn't suffer cold model download/init
transcriptionProvider.preloadModel?.().catch((err: any) => {
  console.warn('[Worker] Whisper background preload warning:', err.message);
});

// Perform immediate initial poll
pollJobs();

// Recurring poll interval
setInterval(pollJobs, 3000);