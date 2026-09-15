'use client';

import { useRef, useEffect } from 'react';

export default function CtaSection() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
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
      { threshold: 0.12 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <section
      aria-labelledby="cta-heading"
      className="py-32 md:py-24 sm:py-16 overflow-hidden"
      style={{ background: '#07070A', borderTop: '1px solid rgba(255,255,255,0.05)' }}
    >
      <div className="max-w-[1200px] mx-auto px-10 md:px-8 sm:px-5">
        <div
          ref={ref}
          className="relative rounded-2xl overflow-hidden text-center px-10 py-20 md:py-16 sm:py-12 sm:px-6"
          style={{
            background:
              'linear-gradient(135deg, rgba(124,58,237,0.08) 0%, rgba(99,102,241,0.05) 50%, rgba(59,130,246,0.08) 100%)',
            border: '1px solid rgba(255,255,255,0.07)',
          }}
        >
          {/* Subtle top gradient line */}
          <div
            className="absolute top-0 left-0 right-0 h-px"
            style={{
              background:
                'linear-gradient(90deg, transparent 0%, rgba(99,102,241,0.4) 40%, rgba(59,130,246,0.4) 60%, transparent 100%)',
            }}
            aria-hidden="true"
          />

          <h2
            id="cta-heading"
            className="font-semibold tracking-tight leading-[1.1] mb-5"
            style={{ fontSize: 'clamp(32px, 5vw, 58px)', color: '#F5F5F7' }}
          >
            Your next viral clip is hiding
            <br />
            in your next video.
          </h2>

          <p
            className="mx-auto mb-10 leading-relaxed"
            style={{ maxWidth: '480px', fontSize: '17px', color: 'rgba(255,255,255,0.52)' }}
          >
            Upload once. ClipForge finds the moments, adds captions, and delivers clips
            ready to post across every platform.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <a
              href="#"
              className="btn-accent text-[15px] font-medium px-8 py-3 rounded-lg w-full sm:w-auto text-center"
            >
              Try ClipForge free
            </a>
            <a
              href="#how-it-works"
              className="text-[15px] font-medium px-6 py-3 rounded-lg w-full sm:w-auto text-center transition-colors duration-150"
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.08)',
                color: 'rgba(255,255,255,0.60)',
              }}
            >
              See how it works
            </a>
          </div>

          <p className="mt-6 text-[13px]" style={{ color: 'rgba(255,255,255,0.28)' }}>
            No credit card required &middot; 3 free clips per month
          </p>
        </div>
      </div>
    </section>
  );
}
