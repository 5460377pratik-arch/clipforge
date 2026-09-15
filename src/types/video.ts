// ============================================================
// CLIPFORGE — FUTURE BACKEND TYPE CONTRACTS
// Integration boundary for when a real backend is connected.
// No fake backend or API calls are implemented here.
// ============================================================

export type VideoSourceType = 'upload' | 'url';

export interface UploadVideoSource {
  type: 'upload';
  file: File;
}

export interface UrlVideoSource {
  type: 'url';
  url: string;
}

export type VideoSource = UploadVideoSource | UrlVideoSource;

export type UrlValidationState =
  | 'idle'
  | 'validating'
  | 'valid'
  | 'invalid'
  | 'unsupported'
  | 'analyzing'
  | 'error';

export interface VideoMetadata {
  id: string;
  title?: string;
  duration?: number;
  thumbnailUrl?: string;
  source: VideoSource;
}

export type ProcessingStatus =
  | 'queued'
  | 'transcribing'
  | 'analyzing'
  | 'generating'
  | 'complete'
  | 'failed';

export interface ProcessingJob {
  jobId: string;
  videoId: string;
  status: ProcessingStatus;
  progress?: number;
  createdAt: string;
  updatedAt: string;
  error?: string;
}

export interface Caption {
  startMs: number;
  endMs: number;
  text: string;
}

export type ClipStatus = 'pending' | 'ready' | 'exported';

export interface Clip {
  id: string;
  videoId: string;
  title: string;
  startMs: number;
  endMs: number;
  hookScore: number;
  status: ClipStatus;
  captions: Caption[];
  thumbnailUrl?: string;
}

export interface ExportJob {
  id: string;
  clipId: string;
  platform: 'tiktok' | 'reels' | 'shorts';
  status: 'pending' | 'processing' | 'complete' | 'failed';
  downloadUrl?: string;
}
