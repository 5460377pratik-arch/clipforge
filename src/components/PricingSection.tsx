'use client';

import { useState, useRef, useEffect } from 'react';

const PLANS = [
  {
    name: 'Free',
    price: { monthly: 0, yearly: 0 },
    description: 'Get started and try ClipForge',
    highlight: false,
    features: [
      '3 clips per month',
      'Up to 30 min video length',
      '720p export quality',
      'Auto captions',
      'ClipForge watermark',
    ],
    cta: 'Start free',
  },
  {
    name: 'Creator',
    price: { monthly: 29, yearly: 19 },
    description: 'For consistent content creators',
    highlight: true,
    badge: 'Most popular',
    features: [
      '50 clips per month',
      'Up to 3 hour video length',
      '4K export quality',
      'Animated captions + styles',
      'No watermark',
      'Hook title generation',
      'Priority processing',
    ],
    cta: 'Start free trial',
  },
  {
    name: 'Studio',
    price: { monthly: 79, yearly: 55 },
    description: 'For teams and agencies',
    highlight: false,
    features: [
      'Unlimited clips',
      'Unlimited video length',
      '4K export quality',
      'All caption styles',
      'No watermark',
      'Hook generation + A/B titles',
      'Team workspace (5 seats)',
      'API access',
    ],
    cta: 'Contact sales',
  },
];

export default function PricingSection() {
  const [yearly, setYearly] = useState(false);
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
      { threshold: 0.08 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <section
      id="pricing"
      aria-labelledby="pricing-heading"
      className="py-32 md:py-24 sm:py-16"
      style={{ background: '#07070A', borderTop: '1px solid rgba(255,255,255,0.05)' }}
    >
      <div className="max-w-[1200px] mx-auto px-10 md:px-8 sm:px-5" ref={ref}>
        <div className="text-center mb-12">
          <p className="text-[12px] font-semibold tracking-widest uppercase mb-3" style={{ color: 'rgba(165,180,252,0.80)' }}>
            Pricing
          </p>
          <h2
            id="pricing-heading"
            className="font-semibold tracking-tight leading-[1.1]"
            style={{ fontSize: 'clamp(30px, 4vw, 48px)', color: '#F5F5F7' }}
          >
            Start free.{' '}
            <span className="gradient-text">Scale when ready.</span>
          </h2>
          <p className="mt-4 text-[16px]" style={{ color: 'rgba(255,255,255,0.48)' }}>No hidden fees. Cancel any time.</p>

          {/* Toggle */}
          <div
            className="mt-8 inline-flex items-center p-1 rounded-lg"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
          >
            {[{id:false,label:'Monthly'},{id:true,label:'Yearly'}].map(({id, label}) => (
              <button
                key={label}
                onClick={() => setYearly(id)}
                className="relative px-5 py-2 rounded-md text-[13px] font-medium transition-all duration-150"
                style={{
                  background: yearly === id ? 'rgba(255,255,255,0.08)' : 'transparent',
                  border: yearly === id ? '1px solid rgba(255,255,255,0.10)' : '1px solid transparent',
                  color: yearly === id ? 'rgba(255,255,255,0.88)' : 'rgba(255,255,255,0.40)',
                }}
                aria-pressed={yearly === id}
              >
                {label}
                {id && (
                  <span
                    className="ml-2 text-[10px] font-bold px-1.5 py-0.5 rounded"
                    style={{ background: 'rgba(74,222,128,0.12)', color: 'rgba(134,239,172,0.85)' }}
                  >
                    Save 33%
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-3 md:grid-cols-1 gap-4 md:max-w-md md:mx-auto">
          {PLANS.map((plan, i) => (
            <div
              key={i}
              className="relative rounded-xl overflow-hidden"
              style={{
                background: plan.highlight ? '#0D0D14' : '#0D0D12',
                border: plan.highlight
                  ? '1px solid rgba(99,102,241,0.35)'
                  : '1px solid rgba(255,255,255,0.07)',
                boxShadow: plan.highlight ? '0 0 0 1px rgba(99,102,241,0.10), 0 16px 40px rgba(99,102,241,0.08)' : 'none',
              }}
            >
              {plan.highlight && (
                <>
                  <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(99,102,241,0.6), transparent)' }} />
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                    <span
                      className="px-3 py-1 rounded-full text-[11px] font-semibold text-white"
                      style={{ background: 'linear-gradient(135deg, #7C3AED, #6366F1)' }}
                    >
                      {plan.badge}
                    </span>
                  </div>
                </>
              )}
              <div className="p-7 pt-8">
                <div className="mb-5">
                  <h3 className="text-[16px] font-semibold mb-1" style={{ color: '#F5F5F7' }}>{plan.name}</h3>
                  <p className="text-[13px]" style={{ color: 'rgba(255,255,255,0.40)' }}>{plan.description}</p>
                </div>
                <div className="mb-6">
                  <div className="flex items-end gap-1">
                    <span className="text-[44px] font-bold leading-none" style={{ color: '#F5F5F7' }}>
                      {plan.price.monthly === 0 ? 'Free' : `$${yearly ? plan.price.yearly : plan.price.monthly}`}
                    </span>
                    {plan.price.monthly > 0 && (
                      <span className="text-[14px] mb-1.5" style={{ color: 'rgba(255,255,255,0.35)' }}>/mo</span>
                    )}
                  </div>
                  {plan.price.monthly > 0 && yearly && (
                    <p className="text-[12px] mt-1" style={{ color: 'rgba(134,239,172,0.75)' }}>
                      Billed annually &mdash; save ${(plan.price.monthly - plan.price.yearly) * 12}/yr
                    </p>
                  )}
                </div>
                <a
                  href="#"
                  className={`block w-full py-2.5 rounded-lg text-[14px] font-medium text-center transition-all duration-150 ${plan.highlight ? 'btn-accent' : ''}`}
                  style={!plan.highlight ? {
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.10)',
                    color: 'rgba(255,255,255,0.70)',
                  } : undefined}
                  onMouseEnter={!plan.highlight ? (e) => {
                    const el = e.currentTarget as HTMLAnchorElement;
                    el.style.background = 'rgba(255,255,255,0.08)';
                    el.style.color = 'rgba(255,255,255,0.88)';
                  } : undefined}
                  onMouseLeave={!plan.highlight ? (e) => {
                    const el = e.currentTarget as HTMLAnchorElement;
                    el.style.background = 'rgba(255,255,255,0.05)';
                    el.style.color = 'rgba(255,255,255,0.70)';
                  } : undefined}
                >
                  {plan.cta}
                </a>
                <ul className="mt-6 flex flex-col gap-2.5">
                  {plan.features.map((f, j) => (
                    <li key={j} className="flex items-start gap-2">
                      <div
                        className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                        style={{
                          background: plan.highlight ? 'rgba(99,102,241,0.15)' : 'rgba(255,255,255,0.06)',
                          border: plan.highlight ? '1px solid rgba(99,102,241,0.25)' : '1px solid rgba(255,255,255,0.08)',
                        }}
                      >
                        <svg width="8" height="8" viewBox="0 0 8 8" fill="none" aria-hidden="true">
                          <path d="M1.5 4L3.5 6L6.5 2.5" stroke={plan.highlight ? 'rgba(165,180,252,0.85)' : 'rgba(255,255,255,0.45)'} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>
                      <span className="text-[13px]" style={{ color: 'rgba(255,255,255,0.55)' }}>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>

        <p className="text-center text-[12px] mt-8" style={{ color: 'rgba(255,255,255,0.25)' }}>
          All plans include a 7-day free trial. No credit card required to start.
        </p>
      </div>
    </section>
  );
}
