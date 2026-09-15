'use client';

import { useState, useRef, useCallback } from 'react';
import type { UrlValidationState } from '../types/video';

// ---------------------------------------------------------------------------
// URL validation helpers — pure frontend, no backend
// ---------------------------------------------------------------------------

/** Returns true if the string looks like a YouTube watch/shorts URL */
function looksLikeYouTube(url: string): boolean {
  return /^https?:\/\/(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/shorts\/)/.test(url);
}

/** Returns true if the string looks like any supported video URL pattern */
function isLikelySupportedVideoUrl(url: string): boolean {
  try {
    const u = new URL(url);
    const supportedHosts = ['youtube.com', 'youtu.be', 'www.youtube.com'];
    return supportedHosts.some((h) => u.hostname === h || u.hostname.endsWith('.'+h));
  } catch {
    return false;
  }
}

/** Returns true if the string looks like a URL at all */
function looksLikeUrl(url: string): boolean {
  return /^https?:\/\/.+/.test(url.trim());
}

// ---------------------------------------------------------------------------
// Upload drop zone
// ---------------------------------------------------------------------------
interface DropZoneProps {
  onFileSelected: (file: File) => void;
}

function DropZone({ onFileSelected }: DropZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      const file = e.dataTransfer.files[0];
      if (file && (file.type.startsWith('video/') || file.name.endsWith('.mp4') || file.name.endsWith('.mov'))) {
        onFileSelected(file);
      }
    },
    [onFileSelected]
  );

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label="Drop your video file here or press Enter to browse"
      className="relative rounded-xl transition-all duration-200 cursor-pointer"
      style={{
        border: `1.5px dashed ${dragging ? 'rgba(99,102,241,0.5)' : 'rgba(255,255,255,0.12)'}`,
        background: dragging ? 'rgba(99,102,241,0.05)' : 'rgba(255,255,255,0.02)',
        padding: '36px 24px',
      }}
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') inputRef.current?.click(); }}
    >
      <input
        ref={inputRef}
        type="file"
        className="sr-only"
        accept="video/mp4,video/quicktime,.mp4,.mov"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onFileSelected(f);
        }}
        aria-hidden="true"
      />

      {/* Corner accents */}
      <span className="absolute top-2.5 left-2.5 w-3 h-3" style={{ borderTop: '1.5px solid rgba(99,102,241,0.4)', borderLeft: '1.5px solid rgba(99,102,241,0.4)' }} aria-hidden />
      <span className="absolute top-2.5 right-2.5 w-3 h-3" style={{ borderTop: '1.5px solid rgba(99,102,241,0.4)', borderRight: '1.5px solid rgba(99,102,241,0.4)' }} aria-hidden />
      <span className="absolute bottom-2.5 left-2.5 w-3 h-3" style={{ borderBottom: '1.5px solid rgba(99,102,241,0.4)', borderLeft: '1.5px solid rgba(99,102,241,0.4)' }} aria-hidden />
      <span className="absolute bottom-2.5 right-2.5 w-3 h-3" style={{ borderBottom: '1.5px solid rgba(99,102,241,0.4)', borderRight: '1.5px solid rgba(99,102,241,0.4)' }} aria-hidden />

      <div className="flex flex-col items-center gap-3 text-center">
        {/* Video icon */}
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center"
          style={{ background: 'rgba(99,102,241,0.10)', border: '1px solid rgba(99,102,241,0.2)' }}
        >
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
            <rect x="1" y="3" width="20" height="16" rx="3" stroke="rgba(129,140,248,0.7)" strokeWidth="1.3" />
            <path d="M9 8L14.5 11L9 14V8Z" fill="rgba(129,140,248,0.7)" />
          </svg>
        </div>
        <div>
          <p className="text-[14px] font-medium" style={{ color: 'rgba(255,255,255,0.75)' }}>
            Drop your video here
          </p>
          <p className="text-[13px] mt-0.5" style={{ color: 'rgba(255,255,255,0.38)' }}>
            or{' '}
            <span className="text-indigo-400 hover:text-indigo-300 transition-colors underline underline-offset-2">
              browse files
            </span>
          </p>
        </div>
        <p className="text-[12px]" style={{ color: 'rgba(255,255,255,0.25)' }}>
          MP4, MOV &middot; Up to 500 MB
        </p>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// URL input pane
// ---------------------------------------------------------------------------
interface UrlPaneProps {
  value: string;
  onChange: (v: string) => void;
  state: UrlValidationState;
  onAnalyze: () => void;
}

function UrlPane({ value, onChange, state, onAnalyze }: UrlPaneProps) {
  const isYT = looksLikeYouTube(value);

  const stateUI: Record<UrlValidationState, React.ReactNode> = {
    idle: null,
    validating: (
      <span className="flex items-center gap-1.5 text-[12px]" style={{ color: 'rgba(255,255,255,0.40)' }}>
        <span className="w-2 h-2 rounded-full animate-pulse-soft" style={{ background: 'rgba(165,180,252,0.6)' }} />
        Checking URL...
      </span>
    ),
    valid: (
      <span className="flex items-center gap-1.5 text-[12px] text-green-400">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
          <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.2" />
          <path d="M4 7L6 9L10 5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        Video link recognised
      </span>
    ),
    invalid: (
      <span className="text-[12px]" style={{ color: 'rgba(248,113,113,0.9)' }}>
        This doesn&apos;t look like a valid video URL. Please check the link and try again.
      </span>
    ),
    unsupported: (
      <span className="text-[12px]" style={{ color: 'rgba(251,191,36,0.85)' }}>
        This video source isn&apos;t supported yet. Try a YouTube link or upload the video directly.
      </span>
    ),
    analyzing: (
      <span className="flex items-center gap-1.5 text-[12px] text-indigo-300">
        <span className="w-2 h-2 rounded-full animate-pulse-soft" style={{ background: 'rgba(129,140,248,0.8)' }} />
        Ready to analyze &mdash; connect a backend to process
      </span>
    ),
    error: (
      <span className="text-[12px]" style={{ color: 'rgba(248,113,113,0.9)' }}>
        We couldn&apos;t process this video. Please try again or upload the video directly.
      </span>
    ),
  };

  return (
    <div className="flex flex-col gap-3">
      {/* Label */}
      <label htmlFor="video-url" className="text-[13px] font-medium" style={{ color: 'rgba(255,255,255,0.55)' }}>
        {isYT ? 'Paste a YouTube link' : 'Paste a supported video link'}
      </label>

      {/* Input row */}
      <div className="flex gap-2 items-stretch">
        <div className="relative flex-1">
          {/* YouTube icon inside input when YT url */}
          {isYT && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="rgba(239,68,68,0.7)" aria-hidden="true">
                <path d="M23.5 6.2a3 3 0 00-2.1-2.1C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.4.5A3 3 0 00.5 6.2C0 8.1 0 12 0 12s0 3.9.5 5.8a3 3 0 002.1 2.1c1.9.5 9.4.5 9.4.5s7.5 0 9.4-.5a3 3 0 002.1-2.1C24 15.9 24 12 24 12s0-3.9-.5-5.8zM9.7 15.5V8.5l6.3 3.5-6.3 3.5z" />
              </svg>
            </div>
          )}
          <input
            id="video-url"
            type="url"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="https://www.youtube.com/watch?v=..."
            className="w-full h-11 text-[14px] rounded-lg transition-all duration-150"
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.10)',
              color: '#F5F5F7',
              paddingLeft: isYT ? '36px' : '12px',
              paddingRight: '12px',
              outline: 'none',
            }}
            onFocus={(e) => { (e.target as HTMLInputElement).style.borderColor = 'rgba(99,102,241,0.5)'; }}
            onBlur={(e) => { (e.target as HTMLInputElement).style.borderColor = 'rgba(255,255,255,0.10)'; }}
            aria-describedby="url-status"
            autoComplete="off"
            spellCheck={false}
          />
        </div>
        <button
          onClick={onAnalyze}
          disabled={state === 'validating' || state === 'analyzing' || !value.trim()}
          className="btn-accent h-11 px-5 text-[14px] font-medium rounded-lg flex-shrink-0 disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none"
          aria-label="Analyze video"
        >
          {state === 'analyzing' ? 'Analyzing...' : 'Analyze video'}
        </button>
      </div>

      {/* State feedback */}
      <div id="url-status" aria-live="polite" className="min-h-[20px]">
        {stateUI[state]}
      </div>

      {/* Supported sources note */}
      <p className="text-[12px]" style={{ color: 'rgba(255,255,255,0.25)' }}>
        Supported: YouTube links. More sources coming soon.
      </p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// VideoInput — main exported component
// ---------------------------------------------------------------------------
type InputMode = 'upload' | 'url';

interface VideoInputProps {
  className?: string;
}

export function VideoInput({ className = '' }: VideoInputProps) {
  const [mode, setMode] = useState<InputMode>('upload');
  const [urlValue, setUrlValue] = useState('');
  const [urlState, setUrlState] = useState<UrlValidationState>('idle');

  const handleUrlChange = (v: string) => {
    setUrlValue(v);
    if (!v.trim()) {
      setUrlState('idle');
      return;
    }
    setUrlState('validating');
    // Pure frontend validation — no backend call
    const trimmed = v.trim();
    if (!looksLikeUrl(trimmed)) {
      setUrlState('invalid');
    } else if (isLikelySupportedVideoUrl(trimmed)) {
      setUrlState('valid');
    } else if (looksLikeUrl(trimmed)) {
      setUrlState('unsupported');
    } else {
      setUrlState('invalid');
    }
  };

  const handleAnalyze = () => {
    if (urlState !== 'valid') return;
    // Mark as ready for backend — no fake processing
    setUrlState('analyzing');
  };

  const handleFileSelected = (file: File) => {
    // Integration boundary: pass file to future upload handler
    // e.g. onFileSelected(file) prop or upload service
    void file;
  };

  return (
    <div
      className={className}
      style={{
        background: '#0D0D12',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '16px',
        padding: '24px',
      }}
    >
      {/* Tab switcher */}
      <div
        className="flex gap-1 mb-5 p-1 rounded-lg"
        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}
        role="tablist"
        aria-label="Video input mode"
      >
        {(['upload', 'url'] as InputMode[]).map((m) => (
          <button
            key={m}
            role="tab"
            aria-selected={mode === m}
            aria-controls={`panel-${m}`}
            id={`tab-${m}`}
            onClick={() => setMode(m)}
            className="flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-[13px] font-medium transition-all duration-150"
            style={{
              background: mode === m ? 'rgba(255,255,255,0.07)' : 'transparent',
              color: mode === m ? 'rgba(255,255,255,0.90)' : 'rgba(255,255,255,0.40)',
              border: mode === m ? '1px solid rgba(255,255,255,0.10)' : '1px solid transparent',
            }}
          >
            {m === 'upload' ? (
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                <path d="M7 1v8M4 4l3-3 3 3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M1 11v1a1 1 0 001 1h10a1 1 0 001-1v-1" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
              </svg>
            ) : (
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.2" />
                <path d="M4.5 7a4 4 0 003 0M5 5c.5-.7 1-.7 2 0M7 9c.5.7 1 .7 2 0" stroke="currentColor" strokeWidth="1" strokeLinecap="round" opacity=".6" />
              </svg>
            )}
            {m === 'upload' ? 'Upload video' : 'Paste URL'}
          </button>
        ))}
      </div>

      {/* Panels */}
      <div
        id="panel-upload"
        role="tabpanel"
        aria-labelledby="tab-upload"
        hidden={mode !== 'upload'}
      >
        <DropZone onFileSelected={handleFileSelected} />
      </div>
      <div
        id="panel-url"
        role="tabpanel"
        aria-labelledby="tab-url"
        hidden={mode !== 'url'}
      >
        <UrlPane
          value={urlValue}
          onChange={handleUrlChange}
          state={urlState}
          onAnalyze={handleAnalyze}
        />
      </div>
    </div>
  );
}
