'use client';

import { useRef, useEffect, type ReactNode } from 'react';

interface Feature {
  icon: ReactNode;
  eyebrow?: string;
  title: string;
  description: string;
}

const FEATURES: Feature[] = [
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
        <circle cx="9" cy="9" r="7.5" stroke="currentColor" strokeWidth="1.2" />
        <path d="M6 9l2 2 4-4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    title: 'Captions that keep viewers watching',
    description: 'Auto-generated, word-level animated captions optimised for muted playback. Styled for mobile-first viewing on every platform.',
  },
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
        <path d="M9 2L2 6.5L9 11L16 6.5L9 2Z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
        <path d="M2 11.5L9 16L16 11.5" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
        <path d="M2 8.5L9 13L16 8.5" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" opacity=".4" />
      </svg>
    ),
    title: 'AI clip detection',
    description: 'Scans the full transcript and identifies the moments with the highest hook strength and engagement potential. No manual scrubbing.',
  },
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
        <rect x="5.5" y="1" width="7" height="16" rx="2" stroke="currentColor" strokeWidth="1.2" />
        <rect x="1" y="4.5" width="4.5" height="9" rx="1" stroke="currentColor" strokeWidth="1" opacity=".35" />
        <rect x="12.5" y="4.5" width="4.5" height="9" rx="1" stroke="currentColor" strokeWidth="1" opacity=".35" />
      </svg>
    ),
    title: 'Intelligent vertical reframing',
    description: 'Face-tracking reframe converts landscape video to 9:16 automatically. The speaker stays centred and readable on every device.',
  },
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
        <path d="M9 1.5L10.7 6.5H16L11.5 9.5L13.2 14.5L9 11.5L4.8 14.5L6.5 9.5L2 6.5H7.3L9 1.5Z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
      </svg>
    ),
    title: 'Hook writing that stops the scroll',
    description: 'AI generates attention-grabbing opening lines and title overlays tuned for each platform algorithm. First 2 seconds decide everything.',
  },
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
        <rect x="1" y="3" width="16" height="12" rx="2" stroke="currentColor" strokeWidth="1.2" />
        <path d="M1 7h16M6 7v8" stroke="currentColor" strokeWidth="1" strokeLinecap="round" opacity=".4" />
      </svg>
    ),
    title: 'Up to 10 clips from one upload',
    description: 'One long recording becomes a complete batch of short-form content, ranked by predicted virality score so you know what to post first.',
  },
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
        <path d="M9 12V2M6 9l3 3 3-3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M2 15h14" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      </svg>
    ),
    title: 'Ready-to-post exports',
    description: 'Download MP4s at the correct resolution, bitrate and metadata for TikTok, Reels and Shorts. No extra editing required.',
  },
];

function FeatureCard({ feature, delay }: { feature: Feature; delay: number }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.opacity = '0';
    el.style.transform = 'translateY(14px)';
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            if (!el) return;
            el.style.transition = 'opacity 0.45s ease, transform 0.45s ease';
            el.style.opacity = '1';
            el.style.transform = 'translateY(0)';
          }, delay);
          obs.disconnect();
        }
      },
      { threshold: 0.08 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [delay]);

  return (
    <div
      ref={ref}
      className="rounded-xl p-5 transition-colors duration-150"
      style={{ background: '#0D0D12', border: '1px solid rgba(255,255,255,0.07)' }}
      onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(255,255,255,0.12)'; }}
      onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(255,255,255,0.07)'; }}
    >
      <div
        className="w-8 h-8 rounded-lg flex items-center justify-center mb-4"
        style={{ background: 'rgba(99,102,241,0.09)', border: '1px solid rgba(99,102,241,0.14)', color: 'rgba(165,180,252,0.80)' }}
      >
        {feature.icon}
      </div>
      <h3 className="text-[15px] font-semibold mb-2" style={{ color: '#F5F5F7' }}>{feature.title}</h3>
      <p className="text-[13px] leading-relaxed" style={{ color: 'rgba(255,255,255,0.48)' }}>{feature.description}</p>
    </div>
  );
}

export default function FeaturesSection() {
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
      id="features"
      aria-labelledby="features-heading"
      className="py-32 md:py-24 sm:py-16"
      style={{ background: '#07070A', borderTop: '1px solid rgba(255,255,255,0.05)' }}
    >
      <div className="max-w-[1200px] mx-auto px-10 md:px-8 sm:px-5">
        <div ref={headRef} className="text-center mb-14">
          <p className="text-[12px] font-semibold tracking-widest uppercase mb-3" style={{ color: 'rgba(165,180,252,0.80)' }}>
            Features
          </p>
          <h2
            id="features-heading"
            className="font-semibold tracking-tight leading-[1.1]"
            style={{ fontSize: 'clamp(30px, 4vw, 48px)', color: '#F5F5F7' }}
          >
            Everything you need.{' '}
            <span className="gradient-text">Nothing you don&apos;t.</span>
          </h2>
          <p className="mt-4 max-w-md mx-auto text-[17px] leading-relaxed" style={{ color: 'rgba(255,255,255,0.50)' }}>
            A focused set of AI-powered tools built specifically for video repurposing.
          </p>
        </div>

        <div className="grid grid-cols-3 md:grid-cols-2 sm:grid-cols-1 gap-4">
          {FEATURES.map((f, i) => (
            <FeatureCard key={i} feature={f} delay={i * 55} />
          ))}
        </div>
      </div>
    </section>
  );
}
