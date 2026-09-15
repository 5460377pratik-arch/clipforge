import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { ProcessButton } from './ProcessButton';
import { ProcessingStatus } from './ProcessingStatus';

export default async function ProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const { data: initialProject, error } = await supabase
    .from('projects')
    .select(`
      *,
      video_sources (*),
      processing_jobs (*),
      clips (*)
    `)
    .eq('id', id)
    .eq('user_id', user.id)
    .single();

  let project = initialProject;

  // Fallback: If relations fail due to permissions (e.g. processing_jobs or clips), fetch sequentially
  let queryError = error;
  if (error && (error.code === '42501' || error.message?.includes('relationship'))) {
    // 1. Fetch Project
    const projRes = await supabase.from('projects').select('*').eq('id', id).eq('user_id', user.id).single();
    
    if (projRes.data) {
      project = { ...projRes.data, video_sources: [], processing_jobs: [], clips: [] };
      queryError = null;
      
      // 2. Fetch Video Sources safely
      const vsRes = await supabase.from('video_sources').select('*').eq('project_id', id);
      if (vsRes.data) (project as any /* eslint-disable-line @typescript-eslint/no-explicit-any */).video_sources = vsRes.data;

      // 3. Fetch Processing Jobs safely
      const pjRes = await supabase.from('processing_jobs').select('*').eq('project_id', id);
      if (pjRes.data) (project as any /* eslint-disable-line @typescript-eslint/no-explicit-any */).processing_jobs = pjRes.data;

      // 4. Fetch Clips safely
      const clRes = await supabase.from('clips').select('*').eq('project_id', id);
      if (clRes.data) (project as any /* eslint-disable-line @typescript-eslint/no-explicit-any */).clips = clRes.data;
    }
  }

  if (queryError || !project) {
    return (
      <div className="py-12 max-w-2xl mx-auto text-center">
        <h1 className="text-[20px] font-semibold text-white mb-3">Project Unavailable</h1>
        {queryError && (
          <div className="bg-red-900/50 border border-red-500/50 p-4 rounded-lg mb-6 text-left">
            <p className="text-sm text-red-200 font-mono break-all">{JSON.stringify(queryError, null, 2)}</p>
          </div>
        )}
        <Link href="/dashboard" className="text-indigo-400">Return</Link>
      </div>
    );
  }

  const source = project.video_sources?.[0];
  const jobs = project.processing_jobs || [];
  const clips = project.clips || [];
  const latestJob = jobs.length > 0 
    ? [...jobs].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0] 
    : null;

  return (
    <div className="py-6">
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-[24px] font-semibold text-white mb-2">{project.title}</h1>
          <div className="flex items-center gap-4 text-[13px] text-[rgba(255,255,255,0.5)]">
            <span className="capitalize px-2 py-0.5 rounded-full bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)]">
              {project.status}
            </span>
            <span>&middot;</span>
            <span>{source?.type === 'youtube' ? 'YouTube' : 'Upload'}</span>
          </div>
        </div>
        
        {(!latestJob || (latestJob.status !== 'queued' && latestJob.status !== 'processing')) && (project.status === 'ready' || (project.status === 'draft' && source?.status === 'ready')) && (
          <ProcessButton projectId={project.id} />
        )}
      </div>
      
      {latestJob && (
        <ProcessingStatus projectId={project.id} initialJob={latestJob} initialProjectStatus={project.status} />
      )}

      {clips.length > 0 ? (
        <div className="animate-fade-up">
          <h2 className="text-[18px] font-medium text-white mb-6">Generated Clips</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {clips.map((clip: any /* eslint-disable-line @typescript-eslint/no-explicit-any */, idx: number) => (
              <Link 
                key={clip.id} 
                href={`/dashboard/projects/${project.id}/clips/${clip.id}`} 
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
                      <div className="px-2 py-1 rounded bg-black/60 text-[11px] font-medium text-white backdrop-blur-sm border border-white/10 shadow-sm inline-block">
                        {clip.duration ? `${(clip.duration / 1000).toFixed(1).replace(/\.0$/, '')}s` : '0s'}
                      </div>
                    </div>
                  </div>
                  <div className="p-4 bg-gradient-to-b from-white/[0.02] to-transparent">
                    <h3 className="text-[14px] font-medium text-white truncate group-hover:text-indigo-300 transition-colors">
                      {clip.title || 'Untitled Clip'}
                    </h3>
                    <p className="text-[12px] text-white/50 mt-1">{clip.aspect_ratio} &middot; Auto-generated</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      ) : project.status !== 'processing' && (!latestJob || (latestJob.status !== 'queued' && latestJob.status !== 'processing')) && (
        <div className="cf-surface rounded-2xl p-8 md:p-12 text-center border-dashed border-indigo-500/20 relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/5 to-transparent pointer-events-none" />
          <div className="relative z-10 max-w-lg mx-auto">
            <div className="w-16 h-16 mx-auto bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(99,102,241,0.3)] group-hover:scale-110 group-hover:shadow-[0_0_40px_rgba(99,102,241,0.5)] transition-all duration-500">
              <svg width="32" height="32" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
              </svg>
            </div>
            <h3 className="text-[20px] font-semibold text-white mb-3">Turn this video into clips</h3>
            <p className="text-[14px] text-[rgba(255,255,255,0.6)] mb-8 leading-relaxed">
              Let ClipForge find the strongest moments, create short-form clips, and prepare them for your social channels.
            </p>
            
            <div className="flex flex-col sm:flex-row justify-center gap-4 mb-8 text-[12px] font-medium text-white/50">
              <span className="flex items-center gap-1.5 justify-center"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M5 13l4 4L19 7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg> AI-powered</span>
              <span className="flex items-center gap-1.5 justify-center"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M5 13l4 4L19 7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg> Automatic highlights</span>
              <span className="flex items-center gap-1.5 justify-center"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M5 13l4 4L19 7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg> Vertical-ready clips</span>
            </div>

            {(project.status === 'ready' || (project.status === 'draft' && source?.status === 'ready')) && (
              <ProcessButton projectId={project.id} label="✨ Generate AI Clips" />
            )}
          </div>
        </div>
      )}
    </div>
  );
}