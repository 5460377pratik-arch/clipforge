'use client';

import { useRef, useEffect } from 'react';

function useReveal() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.style.transition = 'opacity 0.55s ease, transform 0.55s ease';
          el.style.opacity = '1';
          el.style.transform = 'translateY(0)';
          obs.disconnect();
        }
      },
      { threshold: 0.08 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return ref;
}

const CLIPS = [
  {
    hook: 'The biggest mistake creators make with long-form content',
    time: '0:12–0:38',
    platform: 'TikTok',
    color: '#EE1D52',
    score: 94,
    label: 'Hook',
  },
  {
    hook: 'Nobody tells you this about growing on YouTube Shorts',
    time: '2:44–3:10',
    platform: 'Reels',
    color: '#E1306C',
    score: 88,
    label: 'Insight',
  },
  {
    hook: 'This completely changed my content workflow in 30 days',
    time: '6:21–6:52',
    platform: 'Shorts',
    color: '#FF0000',
    score: 91,
    label: 'Story',
  },
];

function ClipCard({ clip }: { clip: typeof CLIPS[0] }) {
  return (
    <div
      className="flex-shrink-0 w-[138px] rounded-xl overflow-hidden"
      style={{ border: '1px solid rgba(255,255,255,0.09)', background: '#0D0D12' }}
    >
      {/* 9:16 preview area */}
      <div className="relative overflow-hidden" style={{ aspectRatio: '9/16', maxHeight: '196px', background: '#131318' }}>
        {/* Speaker silhouette */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div>
            <div className="rounded-full mx-auto" style={{ width: '32px', height: '32px', background: 'rgba(99,102,241,0.18)', border: '1px solid rgba(99,102,241,0.28)' }} />
            <div style={{ width: '56px', height: '22px', background: 'rgba(99,102,241,0.12)', borderRadius: '28px 28px 0 0', marginTop: '4px', border: '1px solid rgba(99,102,241,0.18)', borderBottomColor: 'transparent' }} />
          </div>
        </div>
        {/* Platform badge */}
        <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded text-[9px] font-bold text-white" style={{ background: clip.color }}>
          {clip.platform}
        </div>
        {/* Gradient overlay */}
        <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, transparent 40%, rgba(7,7,10,0.88) 100%)' }} />
        {/* Caption */}
        <div className="absolute bottom-0 left-0 right-0 px-2 py-2">
          <p className="text-[9px] leading-tight" style={{ color: 'rgba(255,255,255,0.80)' }}>{clip.hook}</p>
        </div>
        {/* Progress bar */}
        <div className="absolute bottom-0 left-0 right-0 h-[2px]" style={{ background: 'rgba(255,255,255,0.08)' }}>
          <div className="h-full" style={{ width: '38%', background: 'linear-gradient(90deg,#7C3AED,#3B82F6)' }} />
        </div>
      </div>
      {/* Footer */}
      <div className="px-2.5 py-2" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="flex items-center justify-between">
          <span className="text-[10px]" style={{ color: 'rgba(255,255,255,0.32)' }}>{clip.time}</span>
          <div className="flex items-center gap-1">
            <span className="text-[10px] font-semibold" style={{ color: '#818CF8' }}>{clip.score}</span>
            <span className="text-[9px]" style={{ color: 'rgba(255,255,255,0.28)' }}>{clip.label}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function TransformShowcase() {
  const headRef = useReveal();
  const bodyRef = useReveal();

  return (
    <section
      id="showcase"
      aria-labelledby="showcase-heading"
      className="py-32 md:py-24 sm:py-16 overflow-hidden"
      style={{ background: '#07070A' }}
    >
      <div className="max-w-[1200px] mx-auto px-10 md:px-8 sm:px-5">
        {/* Heading */}
        <div ref={headRef} className="text-center mb-16 md:mb-12">
          <p className="text-[12px] font-semibold tracking-widest uppercase mb-3" style={{ color: 'rgba(165,180,252,0.8)' }}>
            The transformation
          </p>
          <h2
            id="showcase-heading"
            className="font-semibold tracking-tight leading-[1.1]"
            style={{ fontSize: 'clamp(32px, 4.5vw, 52px)', color: '#F5F5F7' }}
          >
            Your content is already there.
          </h2>
          <p className="mt-4 max-w-md mx-auto" style={{ fontSize: '17px', color: 'rgba(255,255,255,0.50)', lineHeight: '1.65' }}>
            One long-form video becomes an entire week of short-form content.
            ClipForge finds the moments automatically.
          </p>
        </div>

        {/* Pipeline */}
        <div ref={bodyRef}>
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-6 lg:gap-5">

            {/* LEFT: long video */}
            <div className="flex-1">
              <div className="rounded-xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.08)', background: '#0D0D12' }}>
                {/* Window bar */}
                <div className="flex items-center gap-2 px-4 py-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', background: '#131318' }}>
                  <div className="flex gap-1.5">
                    {[0,1,2].map(i => <div key={i} className="w-2.5 h-2.5 rounded-full" style={{ background: 'rgba(255,255,255,0.09)' }} />)}
                  </div>
                  <span className="ml-2 text-[11px]" style={{ color: 'rgba(255,255,255,0.28)' }}>podcast_episode_82.mp4</span>
                  <span className="ml-auto text-[11px] font-mono" style={{ color: 'rgba(255,255,255,0.22)' }}>1:24:12</span>
                </div>
                {/* 16:9 video preview */}
                <div className="relative" style={{ aspectRatio: '16/9', background: '#0A0A10' }}>
                  <div className="absolute inset-0 flex items-center justify-center gap-8 sm:gap-5">
                    {/* Speaker 1 */}
                    <div className="flex flex-col items-center gap-2">
                      <div className="rounded-full" style={{ width: '44px', height: '44px', background: 'rgba(124,58,237,0.18)', border: '1.5px solid rgba(124,58,237,0.25)' }} />
                      <div style={{ width: '72px', height: '28px', background: 'rgba(124,58,237,0.10)', borderRadius: '36px 36px 0 0', border: '1px solid rgba(124,58,237,0.18)', borderBottomColor: 'transparent' }} />
                      <div className="flex items-end gap-0.5" style={{ height: '16px' }}>
                        {[3,5,8,6,9,5,7,4].map((h,i) => (
                          <div key={i} className="w-1 rounded-sm" style={{ height: `${h*10}%`, background: 'rgba(124,58,237,0.50)' }} />
                        ))}
                      </div>
                    </div>
                    {/* Mic */}
                    <div style={{ opacity: 0.35 }}>
                      <svg width="14" height="18" viewBox="0 0 14 18" fill="none" aria-hidden="true">
                        <rect x="3" y="1" width="8" height="10" rx="4" stroke="rgba(255,255,255,0.5)" strokeWidth="1.2" />
                        <path d="M1 9c0 3 2.7 5.5 6 5.5S13 12 13 9" stroke="rgba(255,255,255,0.5)" strokeWidth="1.2" strokeLinecap="round" />
                        <line x1="7" y1="14.5" x2="7" y2="17" stroke="rgba(255,255,255,0.5)" strokeWidth="1.2" strokeLinecap="round" />
                      </svg>
                    </div>
                    {/* Speaker 2 */}
                    <div className="flex flex-col items-center gap-2">
                      <div className="rounded-full" style={{ width: '44px', height: '44px', background: 'rgba(59,130,246,0.18)', border: '1.5px solid rgba(59,130,246,0.25)' }} />
                      <div style={{ width: '72px', height: '28px', background: 'rgba(59,130,246,0.10)', borderRadius: '36px 36px 0 0', border: '1px solid rgba(59,130,246,0.18)', borderBottomColor: 'transparent' }} />
                      <div className="flex items-end gap-0.5" style={{ height: '16px' }}>
                        {[5,8,4,9,6,8,3,7].map((h,i) => (
                          <div key={i} className="w-1 rounded-sm" style={{ height: `${h*10}%`, background: 'rgba(59,130,246,0.50)' }} />
                        ))}
                      </div>
                    </div>
                  </div>
                  {/* Timeline */}
                  <div className="absolute bottom-0 left-0 right-0 px-4 pb-3 pt-2" style={{ background: 'linear-gradient(transparent, rgba(7,7,10,0.75))' }}>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono" style={{ color: 'rgba(255,255,255,0.30)' }}>18:47</span>
                      <div className="flex-1 h-[3px] rounded-full" style={{ background: 'rgba(255,255,255,0.07)' }}>
                        <div className="h-full rounded-full" style={{ width: '22%', background: 'linear-gradient(90deg,#7C3AED,#3B82F6)' }} />
                      </div>
                      <span className="text-[10px] font-mono" style={{ color: 'rgba(255,255,255,0.30)' }}>1:24:12</span>
                    </div>
                  </div>
                </div>
                {/* Card footer */}
                <div className="px-4 py-2.5 flex items-center justify-between" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                  <span className="text-[11px] px-2 py-0.5 rounded" style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.38)' }}>
                    84 min podcast
                  </span>
                  <span className="text-[11px]" style={{ color: 'rgba(255,255,255,0.22)' }}>Long-form</span>
                </div>
              </div>
            </div>

            {/* CENTER: AI */}
            <div className="flex flex-row lg:flex-col items-center justify-center gap-3 flex-shrink-0 lg:py-4">
              <div className="lg:hidden h-px w-12" style={{ background: 'linear-gradient(90deg, transparent, rgba(99,102,241,0.4), transparent)' }} />
              <div className="hidden lg:block w-px h-10" style={{ background: 'linear-gradient(180deg, transparent, rgba(99,102,241,0.4))' }} />

              <div
                className="rounded-xl px-4 py-3.5 flex flex-col items-center gap-2.5 flex-shrink-0"
                style={{ background: '#0D0D12', border: '1px solid rgba(99,102,241,0.22)', minWidth: '112px' }}
              >
                <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.20)' }}>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                    <path d="M8 2C4.7 2 2 4.7 2 8s2.7 6 6 6 6-2.7 6-6-2.7-6-6-6z" stroke="rgba(129,140,248,0.7)" strokeWidth="1.2" />
                    <path d="M5.5 8l2 2L10.5 6" stroke="rgba(129,140,248,0.9)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <div className="text-center">
                  <p className="text-[11px] font-medium mb-1.5" style={{ color: 'rgba(255,255,255,0.65)' }}>ClipForge AI</p>
                  {['Analysing...', 'Finding hooks...', 'Generating clips...'].map((s, i) => (
                    <div key={i} className="flex items-center gap-1.5 mb-1">
                      <div className="w-1 h-1 rounded-full animate-pulse-soft" style={{ background: 'rgba(129,140,248,0.55)', animationDelay: `${i*350}ms` }} />
                      <span className="text-[9px]" style={{ color: 'rgba(255,255,255,0.28)' }}>{s}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="hidden lg:block w-px h-10" style={{ background: 'linear-gradient(180deg, rgba(99,102,241,0.4), transparent)' }} />
              <div className="lg:hidden h-px w-12" style={{ background: 'linear-gradient(90deg, rgba(99,102,241,0.4), transparent)' }} />
            </div>

            {/* RIGHT: short clips */}
            <div className="flex-1">
              <div className="flex gap-3 justify-center lg:justify-start overflow-x-auto pb-2">
                {CLIPS.map((clip, i) => <ClipCard key={i} clip={clip} />)}
              </div>
              <div className="mt-3 flex justify-center lg:justify-start">
                <span
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px]"
                  style={{ background: 'rgba(34,197,94,0.07)', border: '1px solid rgba(34,197,94,0.16)', color: 'rgba(134,239,172,0.80)' }}
                >
                  <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#4ade80' }} />
                  3 clips ready to post
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
