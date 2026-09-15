'use client';

import { authService } from '@/services/auth';
import { useRouter } from 'next/navigation';

export default function TopBar() {
  const router = useRouter();

  const handleLogout = async () => {
    await authService.logout();
    router.push('/login');
    router.refresh();
  };

  return (
    <header className="h-16 flex items-center justify-between px-6 border-b border-[rgba(255,255,255,0.05)] bg-[rgba(7,7,10,0.8)] backdrop-blur-md sticky top-0 z-10">
      <div className="flex-1 max-w-md">
        <div className="relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[rgba(255,255,255,0.4)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input 
            type="text" 
            placeholder="Search projects..." 
            className="w-full h-9 pl-9 pr-4 rounded-md text-[13px] text-white bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] focus:outline-none focus:border-indigo-500 transition-colors"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="hidden sm:flex items-center gap-2 text-[12px] text-[rgba(255,255,255,0.5)] px-3 py-1.5 rounded-full border border-[rgba(255,255,255,0.08)]">
          <span className="w-2 h-2 rounded-full bg-green-500"></span>
          Connected
        </div>
        
        <button 
          onClick={handleLogout}
          title="Sign out"
          className="w-8 h-8 rounded-full bg-[rgba(255,255,255,0.08)] flex items-center justify-center text-[13px] font-medium text-white hover:bg-[rgba(255,255,255,0.12)] transition-colors"
        >
          <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
        </button>
      </div>
    </header>
  );
}