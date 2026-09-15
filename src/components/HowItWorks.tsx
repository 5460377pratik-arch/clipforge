'use client';

import { useRef, useEffect, type ReactNode } from 'react';

interface Step {
  number: string;
  title: string;
  description: string;
  details: string[];
  visual: ReactNode;
}

function UploadVisual() {
  return (
    <div
      className="rounded-xl p-5"
      style={{ background: '#0D0D12', border: '1px solid rgba(255,255,255,0.08)' }}
    >
      <p className="text-[11px] font-medium mb-4" style={{ color: 'rgba(255,255,255,0.40)' }}>
        Create your next short
      </p>
      <div
        className="rounded-lg py-8 flex flex-col items-center gap-3"
        style={{ border: '1.5px dashed rgba(255,255,255,0.10)', background: 'rgba(255,255,255,0.02)' }}
      >
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(99,102,241,0.10)', border: '1px solid rgba(99,102,241,0.18)' }}>
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
            <rect x="1" y="3" width="16" height="12" rx="2.5" stroke="rgba(129,140,248,0.7)" strokeWidth="1.2" />
            <path d="M7.5 7.5L11 9L7.5 10.5V7.5Z" fill="rgba(129,140,248,0.7)" />
          </svg>
        </div>
        <div className="text-center">
          <p className="text-[13px] font-medium" style={{ color: 'rgba(255,255,255,0.65)' }}>Drop your video here</p>
          <p className="text-[12px] mt-0.5" style={{ color: 'rgba(255,255,255,0.30)' }}>MP4, MOV · Up to 500 MB</p>
        </div>
      </div>
      <div className="mt-3 flex gap-2 items-center">
        <div
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[11px]"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.40)' }}
        >
          <svg width="10" height="12" viewBox="0 0 10 12" fill="none" aria-hidden="true">
            <rect x="1" y="1" width="8" height="10" rx="1.5" stroke="currentColor" strokeWidth="1" />
          </svg>
          9:16
        </div>
        <div
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[11px]"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.40)' }}
        >
          Shorts · Reels · TikTok
        </div>
      </div>
    </div>
  );
}

function AnalyzeVisual() {
  const clips = [
    { label: 'Strong hook at 2m 12s', score: 94, color: '#818CF8' },
    { label: 'Key insight at 18m 35s', score: 87, color: '#60A5FA' },
    { label: 'Viral moment at 51m 04s', score: 91, color: '#818CF8' },
  ];
  return (
    <div
      className="rounded-xl p-5"
      style={{ background: '#0D0D12', border: '1px solid rgba(255,255,255,0.08)' }}
    >
      <p className="text-[11px] font-medium mb-3" style={{ color: 'rgba(255,255,255,0.40)' }}>
        Detected moments — podcast_ep82.mp4
      </p>
      {/* Timeline */}
      <div className="flex items-center gap-2 mb-4">
        <span className="text-[10px] font-mono" style={{ color: 'rgba(255,255,255,0.28)' }}>00:00</span>
        <div className="flex-1 h-2.5 rounded-full relative overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)' }}>
          {[{l:'5%',w:'8%'},{l:'30%',w:'11%'},{l:'68%',w:'9%'}].map((s,i) => (
            <div key={i} className="absolute top-0 h-full rounded-full" style={{ left: s.l, width: s.w, background: 'rgba(129,140,248,0.55)' }} />
          ))}
        </div>
        <span className="text-[10px] font-mono" style={{ color: 'rgba(255,255,255,0.28)' }}>1:24:12</span>
      </div>
      {/* Clips list */}
      <div className="flex flex-col gap-2.5">
        {clips.map((clip, i) => (
          <div key={i} className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 flex-1">
              <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: clip.color }} />
              <span className="text-[12px] truncate" style={{ color: 'rgba(255,255,255,0.55)' }}>{clip.label}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-16 h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.07)' }}>
                <div className="h-full rounded-full" style={{ width: `${clip.score}%`, background: clip.color }} />
              </div>
              <span className="text-[11px] font-mono w-7 text-right" style={{ color: clip.color }}>{clip.score}</span>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-3 flex items-center gap-1.5">
        <div className="w-1.5 h-1.5 rounded-full animate-pulse-soft" style={{ background: 'rgba(129,140,248,0.7)' }} />
        <span className="text-[11px]" style={{ color: 'rgba(165,180,252,0.65)' }}>Analysis complete · 3 clips identified</span>
      </div>
    </div>
  );
}

function ExportVisual() {
  const platforms = [
    { name: 'TikTok', color: '#EE1D52' },
    { name: 'Reels', color: '#E1306C' },
    { name: 'Shorts', color: '#FF0000' },
  ];
  return (
    <div
      className="rounded-xl p-5"
      style={{ background: '#0D0D12', border: '1px solid rgba(255,255,255,0.08)' }}
    >
      <p className="text-[11px] font-medium mb-4" style={{ color: 'rgba(255,255,255,0.40)' }}>
        Export &mdash; 3 clips
      </p>
      <div className="flex gap-3 justify-center">
        {platforms.map((p, i) => (
          <div key={i} className="flex flex-col items-center gap-2 flex-1">
            {/* 9:16 card */}
            <div
              className="w-full rounded-lg overflow-hidden"
              style={{ aspectRatio: '9/16', maxHeight: '100px', background: '#131318', border: '1px solid rgba(255,255,255,0.07)' }}
            >
              <div className="px-1.5 py-1 text-[8px] font-bold text-white text-center" style={{ background: p.color }}>{p.name.slice(0,2)}</div>
              <div className="p-1.5 flex flex-col gap-1">
                <div className="h-1 rounded bg-white/15 w-full" />
                <div className="h-1 rounded bg-white/10 w-3/4" />
              </div>
            </div>
            <div className="flex items-center gap-1">
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
                <circle cx="5" cy="5" r="4" stroke="rgba(74,222,128,0.6)" strokeWidth="1" />
                <path d="M3 5l1.5 1.5L7 3.5" stroke="rgba(74,222,128,0.8)" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span className="text-[10px]" style={{ color: 'rgba(255,255,255,0.38)' }}>{p.name}</span>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 flex items-center justify-center gap-2">
        <div className="btn-accent px-4 py-2 rounded-lg text-[12px] font-medium cursor-default">
          Download all clips
        </div>
      </div>
    </div>
  );
}

const STEPS: Step[] = [
  {
    number: '01',
    title: 'Upload or paste a link',
    description: 'Drop any podcast, interview, tutorial or talking-head video. Or paste a supported YouTube link. It takes seconds to get started.',
    details: ['Drag & drop or browse files', 'Paste a YouTube link', 'MP4 and MOV supported'],
    visual: <UploadVisual />,
  },
  {
    number: '02',
    title: 'ClipForge finds the moments',
    description: 'Our AI analyses speech patterns, transcript density and engagement signals to surface your most shareable moments automatically.',
    details: ['Full transcript analysis', 'Virality score for each clip', '9:16 auto-reframe'],
    visual: <AnalyzeVisual />,
  },
  {
    number: '03',
    title: 'Download ready-to-post clips',
    description: 'Each clip comes with captions, a hook title, and is exported at the correct specs for every platform. Upload and post.',
    details: ['TikTok, Reels and Shorts formats', 'Animated captions included', 'Bulk download in one click'],
    visual: <ExportVisual />,
  },
];

function StepRow({ step, index }: { step: Step; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const isEven = index % 2 === 0;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.opacity = '0';
    el.style.transform = `translateX(${isEven ? '-16px' : '16px'})`
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.style.transition = 'opacity 0.55s ease, transform 0.55s ease';
          el.style.opacity = '1';
          el.style.transform = 'translateX(0)';
          obs.disconnect();
        }
      },
      { threshold: 0.08 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [isEven]);

  return (
    <div
      ref={ref}
      className={`grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center ${!isEven ? 'lg:grid-flow-dense' : ''}`}
    >
      {/* Text side */}
      <div className={!isEven ? 'lg:col-start-2' : ''}>
        <div className="flex items-center gap-3 mb-5">
          <span
            className="text-[64px] font-black leading-none select-none"
            style={{
              background: 'linear-gradient(135deg, rgba(99,102,241,0.25) 0%, rgba(59,130,246,0.15) 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            {step.number}
          </span>
          <h3 className="text-[22px] font-semibold leading-tight" style={{ color: '#F5F5F7' }}>
            {step.title}
          </h3>
        </div>
        <p className="leading-relaxed mb-6" style={{ fontSize: '16px', color: 'rgba(255,255,255,0.55)' }}>
          {step.description}
        </p>
        <ul className="flex flex-col gap-2.5">
          {step.details.map((d, j) => (
            <li key={j} className="flex items-center gap-2.5">
              <div
                className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.25)' }}
              >
                <svg width="8" height="8" viewBox="0 0 8 8" fill="none" aria-hidden="true">
                  <path d="M1.5 4L3.5 6L6.5 2.5" stroke="rgba(165,180,252,0.8)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <span className="text-[14px]" style={{ color: 'rgba(255,255,255,0.58)' }}>{d}</span>
            </li>
          ))}
        </ul>
      </div>
      {/* Visual side */}
      <div className={!isEven ? 'lg:col-start-1 lg:row-start-1' : ''}>
        {step.visual}
      </div>
    </div>
  );
}

export default function HowItWorks() {
  const headRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = headRef.current;
    if (!el) return;
    el.style.opacity = '0';
    el.style.transform = 'translateY(18px)';
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.style.transition = 'opacity 0.55s ease, transform 0.55s ease';
          el.style.opacity = '1';
          el.style.transform = 'translateY(0)';
          obs.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <section
      id="how-it-works"
      aria-labelledby="how-heading"
      className="py-32 md:py-24 sm:py-16"
      style={{ background: '#07070A', borderTop: '1px solid rgba(255,255,255,0.05)' }}
    >
      <div className="max-w-[1200px] mx-auto px-10 md:px-8 sm:px-5">
        <div ref={headRef} className="text-center mb-20 md:mb-14">
          <p className="text-[12px] font-semibold tracking-widest uppercase mb-3" style={{ color: 'rgba(165,180,252,0.80)' }}>
            Simple process
          </p>
          <h2
            id="how-heading"
            className="font-semibold tracking-tight leading-[1.1]"
            style={{ fontSize: 'clamp(30px, 4vw, 48px)', color: '#F5F5F7' }}
          >
            Three steps from{' '}
            <span className="gradient-text">upload to viral.</span>
          </h2>
        </div>

        <div className="flex flex-col gap-24 md:gap-16 sm:gap-12">
          {STEPS.map((step, i) => (
            <StepRow key={i} step={step} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
