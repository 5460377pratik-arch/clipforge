import type { Plan } from './types';

// =============================================================================
// CLIPFORGE — CENTRALIZED CONSTANTS
// Single source of truth for pricing, limits, and configuration.
// Change prices/limits here — nothing else needs to change.
// =============================================================================

// ─── Pricing Plans ────────────────────────────────────────────────────────────
// To update pricing: change values here only.

export const PLANS: Plan[] = [
  {
    id: 'free',
    name: 'Free',
    price: { monthly: 0, yearly: 0 },
    description: 'Get started and see what ClipForge can do',
    limits: {
      clipsPerMonth: 3,
      maxVideoMinutes: 30,
      maxFileSizeMb: 200,
      maxExportResolution: '720p',
      watermark: true,
      captionStyles: 'basic',
      priorityProcessing: false,
      teamSeats: 1,
      apiAccess: false,
    },
    features: [
      '3 clips per month',
      'Up to 30-minute videos',
      '720p export',
      'Auto captions',
      'ClipForge watermark',
    ],
    cta: 'Start free',
  },
  {
    id: 'creator',
    name: 'Creator',
    price: { monthly: 29, yearly: 19 },
    description: 'For consistent content creators',
    highlighted: true,
    badge: 'Most popular',
    limits: {
      clipsPerMonth: 50,
      maxVideoMinutes: 180,
      maxFileSizeMb: 1024,
      maxExportResolution: '1080p',
      watermark: false,
      captionStyles: 'all',
      priorityProcessing: true,
      teamSeats: 1,
      apiAccess: false,
    },
    features: [
      '50 clips per month',
      'Up to 3-hour videos',
      '1080p export',
      'Animated captions + styles',
      'No watermark',
      'Hook title generation',
      'Priority processing',
    ],
    cta: 'Start free trial',
  },
  {
    id: 'studio',
    name: 'Studio',
    price: { monthly: 79, yearly: 55 },
    description: 'For teams and agencies',
    limits: {
      clipsPerMonth: -1,
      maxVideoMinutes: -1,
      maxFileSizeMb: 4096,
      maxExportResolution: '4k',
      watermark: false,
      captionStyles: 'all',
      priorityProcessing: true,
      teamSeats: 5,
      apiAccess: true,
    },
    features: [
      'Unlimited clips',
      'Unlimited video length',
      '4K export',
      'All caption styles',
      'No watermark',
      'Hook generation + A/B titles',
      'Team workspace (5 seats)',
      'API access',
    ],
    cta: 'Contact sales',
  },
];

export const PLAN_MAP = Object.fromEntries(PLANS.map((p) => [p.id, p])) as Record<string, Plan>;

// ─── File Upload ──────────────────────────────────────────────────────────────

export const SUPPORTED_VIDEO_TYPES = [
  'video/mp4',
  'video/quicktime',  // .mov
  'video/x-msvideo', // .avi
  'video/webm',
] as const;

export const SUPPORTED_VIDEO_EXTENSIONS = ['.mp4', '.mov', '.avi', '.webm'] as const;

export const MAX_FILE_SIZE_MB = {
  free: 50,
  creator: 50,
  studio: 50,
} as const;

// ─── Video Sources ────────────────────────────────────────────────────────────

// YouTube URL patterns we recognise and support
export const YOUTUBE_PATTERNS = [
  /^https?:\/\/(www\.)?youtube\.com\/watch\?.*v=([a-zA-Z0-9_-]{11})/,
  /^https?:\/\/youtu\.be\/([a-zA-Z0-9_-]{11})/,
  /^https?:\/\/(www\.)?youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/,
  /^https?:\/\/(www\.)?youtube\.com\/live\/([a-zA-Z0-9_-]{11})/,
] as const;

// ─── Generation Config ────────────────────────────────────────────────────────

export const CLIP_COUNT_OPTIONS = [1, 3, 5, 7, 10] as const;

export const DURATION_PRESETS = [
  { label: '15–30s (Viral hook)', min: 15, max: 30 },
  { label: '30–60s (Standard short)', min: 30, max: 60 },
  { label: '60–90s (Long short)', min: 60, max: 90 },
  { label: 'Custom', min: 15, max: 90 },
] as const;

export const ASPECT_RATIO_OPTIONS = [
  { value: '9:16' as const, label: '9:16', description: 'TikTok, Reels, Shorts' },
  { value: '1:1' as const, label: '1:1', description: 'Instagram square' },
  { value: '16:9' as const, label: '16:9', description: 'YouTube landscape' },
];

export const CAPTION_STYLE_OPTIONS = [
  { value: 'none' as const, label: 'None' },
  { value: 'minimal' as const, label: 'Minimal' },
  { value: 'bold' as const, label: 'Bold' },
  { value: 'highlight' as const, label: 'Highlight', description: 'Recommended' },
];

export const LANGUAGE_OPTIONS = [
  { value: 'auto' as const, label: 'Auto-detect' },
  { value: 'en' as const, label: 'English' },
  { value: 'es' as const, label: 'Español' },
  { value: 'fr' as const, label: 'Français' },
  { value: 'de' as const, label: 'Deutsch' },
  { value: 'pt' as const, label: 'Português' },
];

// ─── Job Stages ───────────────────────────────────────────────────────────────

export const JOB_STAGE_LABELS: Record<string, string> = {
  queued: 'Waiting in queue...',
  preparing: 'Preparing video...',
  transcribing: 'Transcribing audio...',
  analyzing: 'Finding highlights...',
  generating: 'Generating clips...',
  captioning: 'Adding captions...',
  optimizing: 'Optimizing framing...',
  finalizing: 'Finalizing...',
  completed: 'Done',
  failed: 'Failed',
};

// ─── App Config ───────────────────────────────────────────────────────────────

export const APP_NAME = 'ClipForge';
export const APP_DESCRIPTION = 'Turn long-form videos into short-form content that gets watched.';
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';

// ─── API Config ───────────────────────────────────────────────────────────────

/** How often to poll job status when processing (ms) */
export const JOB_POLL_INTERVAL_MS = 3000;

/** Max time to poll before giving up (ms) */
export const JOB_POLL_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes
