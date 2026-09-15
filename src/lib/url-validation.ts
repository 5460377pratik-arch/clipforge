import { YOUTUBE_PATTERNS } from './constants';
import type { UrlValidationResult } from './types';

// Pure client-side URL validation helpers. No network calls.

/** Extract YouTube video ID from a supported URL pattern */
export function extractYouTubeVideoId(url: string): string | null {
  for (const pattern of YOUTUBE_PATTERNS) {
    const match = url.match(pattern);
    if (match) {
      return match[2] ?? match[1] ?? null;
    }
  }
  return null;
}

export function isYouTubeUrl(url: string): boolean {
  return extractYouTubeVideoId(url) !== null;
}

export function isValidHttpUrl(url: string): boolean {
  try {
    const u = new URL(url.trim());
    return u.protocol === 'http:' || u.protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * Validate a video URL client-side.
 * Does NOT make network requests. Server validates further.
 */
export function validateVideoUrl(url: string): UrlValidationResult {
  const trimmed = url.trim();

  if (!trimmed) {
    return { valid: false, reason: 'URL is empty' };
  }

  if (!isValidHttpUrl(trimmed)) {
    return {
      valid: false,
      reason: 'This does not look like a valid URL. Make sure it starts with https://',
    };
  }

  const videoId = extractYouTubeVideoId(trimmed);
  if (videoId) {
    return { valid: true, sourceType: 'youtube', videoId, provider: 'YouTube' };
  }

  // Conservative: do not claim support for platforms not yet implemented.
  return {
    valid: false,
    sourceType: 'url',
    reason: 'This video source is not yet supported. Currently supported: YouTube links.',
  };
}

export function youTubeWatchUrl(videoId: string): string {
  return `https://www.youtube.com/watch?v=${videoId}`;
}

export function youTubeThumbnailUrl(videoId: string): string {
  return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
}