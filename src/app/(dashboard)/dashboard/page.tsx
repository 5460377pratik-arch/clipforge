import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export default async function DashboardHome() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Fetch real projects
  const { data: projects, error } = await supabase
    .from('projects')
    .select(`
      id,
      title,
      status,
      created_at,
      video_sources ( type )
    `)
    .order('created_at', { ascending: false })
    .limit(5);

  const hasProjects = projects && projects.length > 0;

  return (
    <div className="py-6">
      <div className="mb-10">
        <h1 className="text-[28px] font-semibold text-white mb-2 tracking-tight">Good morning</h1>
        <p className="text-[14px] text-[rgba(255,255,255,0.5)]">Here&apos;s what&apos;s happening with your content today.</p>
      </div>

      {/* Main Action */}
      <section className="mb-12">
        <div className="surface p-1 rounded-2xl bg-gradient-to-br from-[rgba(124,58,237,0.05)] to-[rgba(59,130,246,0.05)]">
          <div className="p-8 md:p-10 flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-500 flex items-center justify-center mb-6 shadow-lg shadow-indigo-500/20">
              <svg width="32" height="32" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
            </div>
            <h2 className="text-[20px] font-semibold text-white mb-3">Create your next clip</h2>
            <p className="text-[14px] text-[rgba(255,255,255,0.6)] max-w-md mb-8">
              Upload a new video or paste a YouTube link to let AI find your most engaging moments automatically.
            </p>
            <Link href="/dashboard/create" className="btn-accent h-12 px-8 text-[15px] inline-flex items-center justify-center">
              Start new project
            </Link>
          </div>
        </div>
      </section>

      {/* Recent Projects */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-[18px] font-semibold text-white tracking-tight">Recent Projects</h2>
          <Link href="/dashboard/projects" className="text-[13px] text-indigo-400 hover:text-indigo-300 transition-colors">
            View all
          </Link>
        </div>
        
        {error ? (
          <div className="surface p-8 text-center flex flex-col items-center justify-center border-dashed">
            <p className="text-[13px] text-red-400">Failed to load projects: {error.message}</p>
          </div>
        ) : !hasProjects ? (
          <div className="cf-surface rounded-2xl p-12 text-center border-dashed border-indigo-500/20 relative overflow-hidden group mt-4">
            <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/5 to-transparent pointer-events-none" />
            <div className="relative z-10 max-w-sm mx-auto">
              <div className="w-16 h-16 mx-auto bg-gradient-to-br from-[#1A1A24] to-[#2A2A35] rounded-2xl flex items-center justify-center mb-6 shadow-[0_0_20px_rgba(0,0,0,0.5)] border border-white/5">
                <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="text-white/40">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <h3 className="text-[20px] font-semibold text-white mb-2">No projects found</h3>
              <p className="text-[14px] text-white/50 mb-8 leading-relaxed">
                You haven&apos;t created any projects yet. Start by uploading a video or pasting a YouTube link.
              </p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {projects.map(proj => (
              <Link key={proj.id} href={`/dashboard/projects/${proj.id}`} className="cf-surface p-5 rounded-xl flex items-center justify-between hover:border-indigo-500/30 hover:shadow-[0_4px_20px_rgba(99,102,241,0.1)] transition-all group">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/10 flex items-center justify-center text-indigo-400 group-hover:scale-110 group-hover:bg-indigo-500/20 group-hover:text-indigo-300 transition-all duration-300">
                    <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-[15px] font-medium text-white mb-1 group-hover:text-indigo-300 transition-colors">{proj.title}</h3>
                    <div className="flex items-center gap-2 text-[13px] text-white/40">
                      <span>{new Date(proj.created_at).toLocaleDateString()}</span>
                      <span>&middot;</span>
                      <span className={`capitalize ${proj.status === 'ready' ? 'text-emerald-400' : proj.status === 'processing' ? 'text-indigo-400 animate-pulse' : ''}`}>{proj.status}</span>
                    </div>
                  </div>
                </div>
                <div className="text-white/20 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all duration-300">
                  <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}