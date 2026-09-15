// =============================================================================
// CLIPFORGE — UNIFIED TYPE SYSTEM
// Single source of truth for all data shapes across frontend and backend.
// =============================================================================

// ─── Auth ────────────────────────────────────────────────────────────────────

export interface User {
  id: string;
  email: string;
  name: string | null;
  avatarUrl: string | null;
  plan: PlanId;
  createdAt: string; // ISO 8601
}

export interface AuthSession {
  user: User;
  accessToken: string;
  expiresAt: number; // unix ms
}

// ─── Plans ───────────────────────────────────────────────────────────────────

export type PlanId = 'free' | 'creator' | 'studio';

export interface Plan {
  id: PlanId;
  name: string;
  price: { monthly: number; yearly: number };
  description: string;
  limits: PlanLimits;
  features: string[];
  highlighted?: boolean;
  badge?: string;
  cta: string;
}

export interface PlanLimits {
  clipsPerMonth: number;       // -1 = unlimited
  maxVideoMinutes: number;     // -1 = unlimited
  maxFileSizeMb: number;
  maxExportResolution: '720p' | '1080p' | '4k';
  watermark: boolean;
  captionStyles: 'basic' | 'all';
  priorityProcessing: boolean;
  teamSeats: number;
  apiAccess: boolean;
}

// ─── Video Sources ────────────────────────────────────────────────────────────

export type VideoSourceType = 'upload' | 'youtube' | 'url';

export interface UploadSource {
  type: 'upload';
  filename: string;
  fileSizeMb: number;
  mimeType: string;
  // uploadUrl is a pre-signed URL provided by storage service on project creation
  uploadUrl?: string;
}

export interface YoutubeSource {
  type: 'youtube';
  url: string;
  videoId: string;
  // These are populated after the backend fetches metadata
  title?: string;
  durationSeconds?: number;
  thumbnailUrl?: string;
  channelName?: string;
}

export interface ExternalUrlSource {
  type: 'url';
  url: string;
  provider?: string;
}

export type VideoSource = UploadSource | YoutubeSource | ExternalUrlSource;

// ─── Projects ─────────────────────────────────────────────────────────────────

export type ProjectStatus =
  | 'draft'        // created, source not yet confirmed
  | 'ready'        // source confirmed, processing not started
  | 'queued'       // job submitted, waiting in queue
  | 'processing'   // worker is active
  | 'completed'    // all clips generated
  | 'failed';      // terminal failure

export interface Project {
  id: string;
  userId: string;
  title: string;
  status: ProjectStatus;
  source: VideoSource;
  config: GenerationConfig;
  clipCount: number;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  errorMessage?: string;
  thumbnailUrl?: string;
}

// ─── Generation Configuration ─────────────────────────────────────────────────

export type AspectRatio = '9:16' | '1:1' | '16:9';
export type CaptionStyle = 'minimal' | 'bold' | 'highlight' | 'none';
export type Language = 'en' | 'es' | 'fr' | 'de' | 'pt' | 'auto';

export interface GenerationConfig {
  targetClipCount: number;        // 1–10
  minClipDurationSec: number;     // default 20
  maxClipDurationSec: number;     // default 90
  aspectRatio: AspectRatio;
  captionStyle: CaptionStyle;
  language: Language;
  viralityThreshold: number;      // 0–100, minimum score to include
}

export const DEFAULT_CONFIG: GenerationConfig = {
  targetClipCount: 5,
  minClipDurationSec: 20,
  maxClipDurationSec: 90,
  aspectRatio: '9:16',
  captionStyle: 'highlight',
  language: 'auto',
  viralityThreshold: 60,
};

// ─── Processing Jobs ──────────────────────────────────────────────────────────

export type JobStatus =
  | 'queued'
  | 'preparing'
  | 'transcribing'
  | 'analyzing'
  | 'generating'
  | 'captioning'
  | 'optimizing'
  | 'finalizing'
  | 'completed'
  | 'failed';

export interface ProcessingJob {
  id: string;
  projectId: string;
  status: JobStatus;
  stageLabel: string;            // human-readable current stage
  progressPercent: number;       // 0–100
  startedAt: string;
  updatedAt: string;
  completedAt?: string;
  errorCode?: string;
  errorMessage?: string;
}

// ─── Clips ────────────────────────────────────────────────────────────────────

export type ClipStatus = 'pending' | 'ready' | 'exporting' | 'exported' | 'failed';

export interface Caption {
  id: string;
  startMs: number;
  endMs: number;
  text: string;
  confidence: number; // 0–1
}

export interface Clip {
  id: string;
  projectId: string;
  title: string;
  hookText?: string;
  startMs: number;
  endMs: number;
  durationMs: number;
  viralityScore: number;         // 0–100
  status: ClipStatus;
  aspectRatio: AspectRatio;
  captions: Caption[];
  thumbnailUrl?: string;
  previewUrl?: string;           // low-res preview video
  downloadUrl?: string;          // full-res export
  createdAt: string;
}

// ─── Exports ──────────────────────────────────────────────────────────────────

export type ExportPlatform = 'tiktok' | 'reels' | 'shorts' | 'generic';

export interface ExportJob {
  id: string;
  clipId: string;
  platform: ExportPlatform;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  downloadUrl?: string;
  expiresAt?: string;
  createdAt: string;
}

// ─── API Responses ────────────────────────────────────────────────────────────

export interface ApiSuccess<T> {
  success: true;
  data: T;
}

export interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
    field?: string;
  };
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError;

// ─── Pagination ───────────────────────────────────────────────────────────────

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

// ─── URL Validation ───────────────────────────────────────────────────────────

export type UrlValidationState =
  | 'idle'
  | 'validating'
  | 'valid'
  | 'invalid'
  | 'unsupported'
  | 'analyzing'
  | 'error';

export interface UrlValidationResult {
  valid: boolean;
  sourceType?: VideoSourceType;
  videoId?: string;
  provider?: string;
  reason?: string;
}
