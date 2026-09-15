import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: {
    template: '%s — ClipForge',
    default: 'ClipForge',
  },
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: '#07070A' }}
    >
      {/* Minimal nav */}
      <header className="flex items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg,#7C3AED,#3B82F6)' }}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
              <path d="M3 2L11 7L3 12V2Z" fill="white" />
            </svg>
          </div>
          <span
            className="text-[15px] font-semibold tracking-tight"
            style={{ color: 'rgba(255,255,255,0.88)' }}
          >
            ClipForge
          </span>
        </Link>
      </header>

      {/* Content */}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        {children}
      </main>

      <footer className="px-6 py-4 text-center">
        <p className="text-[12px]" style={{ color: 'rgba(255,255,255,0.22)' }}>
          &copy; {new Date().getFullYear()} ClipForge. All rights reserved.
        </p>
      </footer>
    </div>
  );
}