'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV_ITEMS = [
  { label: 'Overview', href: '/dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
  { label: 'Create', href: '/dashboard/create', icon: 'M12 4v16m8-8H4' },
  { label: 'Projects', href: '/dashboard/projects', icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10' },
  { label: 'Clips', href: '/dashboard/clips', icon: 'M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z' },
  { label: 'Settings', href: '/dashboard/settings', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z' },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 h-full flex flex-col surface border-y-0 border-l-0 rounded-none z-10" style={{ background: '#0D0D12' }}>
      <div className="h-16 flex items-center px-6 border-b border-[rgba(255,255,255,0.05)]">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#7C3AED,#3B82F6)' }}>
            <svg width="12" height="12" viewBox="0 0 14 14" fill="none"><path d="M3 2L11 7L3 12V2Z" fill="white" /></svg>
          </div>
          <span className="font-semibold text-white tracking-tight text-[15px]">ClipForge</span>
        </Link>
      </div>

      <nav className="flex-1 py-6 px-3 flex flex-col gap-1 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-[14px] font-medium transition-colors ${
                isActive ? 'text-white' : 'text-[rgba(255,255,255,0.5)] hover:text-white hover:bg-[rgba(255,255,255,0.03)]'
              }`}
              style={isActive ? { background: 'rgba(255,255,255,0.06)' } : {}}
            >
              <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
              </svg>
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-[rgba(255,255,255,0.05)]">
        <div className="p-3 rounded-lg" style={{ background: 'rgba(99,102,241,0.08)' }}>
          <p className="text-[12px] font-medium text-white mb-1">Creator Plan</p>
          <p className="text-[11px] text-[rgba(255,255,255,0.5)] mb-3">2/50 clips used</p>
          <div className="w-full h-1.5 rounded-full bg-[rgba(255,255,255,0.1)] overflow-hidden">
            <div className="h-full bg-indigo-500 rounded-full" style={{ width: '4%' }}></div>
          </div>
        </div>
      </div>
    </aside>
  );
}