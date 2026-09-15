import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export default async function ClipsLibraryPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Fetch real clips joined with project info
  const { data: clips, error } = await supabase
    .from('clips')
    .select(`
      *,
      projects!inner(id, title)
    `)
    .eq('projects.user_id', user.id)
    .order('created_at', { ascending: false });

  const hasClips = clips && clips.length > 0;

  return (
    <div className="py-6 h-full flex flex-col">
      <div className="mb-8">
        <h1 className="text-[28px] font-semibold text-white mb-2 tracking-tight">Your Clips</h1>
        <p className="text-[14px] text-[rgba(255,255,255,0.5)]">All generated short-form clips across your projects.</p>
      </div>

      {error ? (
        <div className="surface p-8 text-center flex flex-col items-center justify-center border-dashed rounded-xl">
          <p className="text-[13px] text-red-400">Failed to load clips: {error.message}</p>
        </div>
      ) : !hasClips ? (
        <div className="cf-surface rounded-2xl p-12 text-center border-dashed border-indigo-500/20 relative overflow-hidden group max-w-3xl mx-auto w-full mt-8">
          <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/5 to-transparent pointer-events-none" />
          <div className="relative z-10 max-w-sm mx-auto">
            <div className="w-16 h-16 mx-auto bg-gradient-to-br from-[#1A1A24] to-[#2A2A35] rounded-2xl flex items-center justify-center mb-6 shadow-[0_0_20px_rgba(0,0,0,0.5)] border border-white/5">
              <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="text-white/40">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-[20px] font-semibold text-white mb-2">No clips yet</h3>
            <p className="text-[14px] text-white/50 mb-8 leading-relaxed">
              Turn your long-form videos into ready-to-share short clips. Create a project to get started.
            </p>
            <Link href="/dashboard/create" className="btn-accent h-11 px-8 text-[14px] inline-flex items-center justify-center rounded-lg shadow-[0_4px_20px_rgba(99,102,241,0.3)] hover:shadow-[0_8px_30px_rgba(99,102,241,0.4)] transition-all">
              Create your first project
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {clips.map((clip, idx) => (
            <Link 
              key={clip.id} 
              href={`/dashboard/projects/${clip.project_id}/clips/${clip.id}`} 
              className="block group opacity-0 animate-[cf-fade-up_0.5s_ease_both]" 
              style={{ animationDelay: `${idx * 100}ms` }}
            >
              <div className="cf-surface rounded-xl overflow-hidden group-hover:border-indigo-500/50 group-hover:shadow-[0_8px_30px_rgba(99,102,241,0.15)] group-hover:-translate-y-1 transition-all duration-300">
                <div className="aspect-[9/16] bg-black relative overflow-hidden flex items-center justify-center">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20 z-10" />
                  
                  <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur flex items-center justify-center group-hover:scale-110 group-hover:bg-indigo-500/80 transition-all duration-300 z-20">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>

                  <div className="absolute top-3 right-3 z-20 px-2 py-1 rounded bg-black/60 backdrop-blur-sm text-[11px] font-medium text-white border border-white/10 flex items-center gap-1.5 shadow-sm">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                    Score: {clip.score}
                  </div>
                  
                  <div className="absolute bottom-3 left-3 z-20">
                    <div className="text-[11px] font-medium px-2 py-1 rounded bg-black/60 backdrop-blur-sm border border-white/10 shadow-sm inline-block">
                      {clip.duration ? `${(clip.duration / 1000).toFixed(1).replace(/\.0$/, '')}s` : '0:00'}
                    </div>
                  </div>
                </div>
                
                <div className="p-4 bg-gradient-to-b from-white/[0.02] to-transparent">
                  <h3 className="text-[14px] font-medium text-white mb-1 truncate group-hover:text-indigo-300 transition-colors" title={clip.title || 'Untitled Clip'}>
                    {clip.title || 'Untitled Clip'}
                  </h3>
                  <div className="text-[12px] text-white/50 flex items-center gap-2 truncate mt-1">
                    <span className="truncate">{clip.projects?.title || 'Unknown Project'}</span>
                    <span>&middot;</span>
                    <span>{new Date(clip.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}