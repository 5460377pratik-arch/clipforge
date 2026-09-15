const FOOTER_LINKS = {
  Product: [
    { label: 'Features', href: '#features' },
    { label: 'How it works', href: '#how-it-works' },
    { label: 'Pricing', href: '#pricing' },
  ],
  Company: [
    { label: 'About', href: '#' },
    { label: 'Blog', href: '#' },
    { label: 'Contact', href: '#' },
  ],
  Legal: [
    { label: 'Privacy Policy', href: '#' },
    { label: 'Terms of Service', href: '#' },
  ],
};

function ClipForgeMark() {
  return (
    <svg width="24" height="24" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <rect x="1" y="4" width="26" height="20" rx="4" fill="#0D0D12" stroke="rgba(255,255,255,0.14)" strokeWidth="1.5" />
      <rect x="1" y="7" width="4" height="3" rx="0.5" fill="rgba(255,255,255,0.10)" />
      <rect x="1" y="12" width="4" height="3" rx="0.5" fill="rgba(255,255,255,0.10)" />
      <rect x="1" y="17" width="4" height="3" rx="0.5" fill="rgba(255,255,255,0.10)" />
      <rect x="23" y="7" width="4" height="3" rx="0.5" fill="rgba(255,255,255,0.10)" />
      <rect x="23" y="12" width="4" height="3" rx="0.5" fill="rgba(255,255,255,0.10)" />
      <rect x="23" y="17" width="4" height="3" rx="0.5" fill="rgba(255,255,255,0.10)" />
      <path d="M12 10L19 14L12 18V10Z" fill="url(#ft-grad)" />
      <line x1="18" y1="4" x2="14" y2="24" stroke="url(#ft-grad)" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
      <defs>
        <linearGradient id="ft-grad" x1="0" y1="0" x2="1" y2="1" gradientUnits="objectBoundingBox">
          <stop stopColor="#7C3AED" />
          <stop offset="1" stopColor="#3B82F6" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export default function Footer() {
  return (
    <footer
      className="relative pt-14 pb-8 overflow-hidden"
      style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
    >
      <style>{`
        .footer-link { color: rgba(255,255,255,0.45); transition: color 150ms ease; }
        .footer-link:hover { color: rgba(255,255,255,0.75); }
      `}</style>
      <div className="max-w-[1200px] mx-auto px-10 md:px-8 sm:px-5">
        <div className="grid grid-cols-4 sm:grid-cols-2 gap-10 mb-12">
          <div className="col-span-1">
            <a href="#" className="flex items-center gap-2 mb-3 w-fit" aria-label="ClipForge home">
              <ClipForgeMark />
              <span
                className="text-[15px] font-semibold tracking-tight"
                style={{ color: 'rgba(255,255,255,0.88)' }}
              >
                ClipForge
              </span>
            </a>
            <p className="text-[13px] leading-relaxed max-w-[160px]" style={{ color: 'rgba(255,255,255,0.35)' }}>
              One video. Endless content.
            </p>
            <div
              className="mt-4 inline-flex items-center gap-1.5 text-[11px]"
              style={{ color: 'rgba(255,255,255,0.25)' }}
            >
              <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#4ade80' }} />
              All systems operational
            </div>
          </div>

          {Object.entries(FOOTER_LINKS).map(([category, links]) => (
            <div key={category}>
              <p
                className="text-[11px] font-semibold uppercase tracking-widest mb-4"
                style={{ color: 'rgba(255,255,255,0.25)' }}
              >
                {category}
              </p>
              <ul className="flex flex-col gap-2.5">
                {links.map((link) => (
                  <li key={link.label}>
                    <a href={link.href} className="footer-link text-[13px]">
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div
          className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8"
          style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}
        >
          <p className="text-[12px]" style={{ color: 'rgba(255,255,255,0.25)' }}>
            &copy; {new Date().getFullYear()} ClipForge. All rights reserved.
          </p>
          <p className="text-[12px]" style={{ color: 'rgba(255,255,255,0.20)' }}>
            Built for creators. Powered by AI.
          </p>
        </div>
      </div>
    </footer>
  );
}
