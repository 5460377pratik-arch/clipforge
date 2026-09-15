import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { ExportButton } from './ExportButton';

export default async function ClipEditorPage({ params }: { params: Promise<{ id: string, clipId: string }> }) {
  const { id: projectId, clipId } = await params;
  
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const { data: clip, error } = await supabase
    .from('clips')
    .select('*, projects!inner(user_id)')
    .eq('id', clipId)
    .eq('project_id', projectId)
    .eq('projects.user_id', user.id)
    .single();

  if (error || !clip) {
    return (
      <div className="py-12 max-w-2xl mx-auto text-center">
        <h1 className="text-[20px] font-semibold text-white mb-3">Clip Not Found</h1>
        <Link href={`/dashboard/projects/${projectId}`} className="text-indigo-400">Back to Project</Link>
      </div>
    );
  }

  let videoUrl = '';
  if (clip.storage_path) {
    const { data: signedData } = await supabase.storage
      .from('videos')
      .createSignedUrl(clip.storage_path, 3600);
    if (signedData?.signedUrl) {
      videoUrl = signedData.signedUrl;
    }
  }

  return (
    <div className="py-6 h-[calc(100vh-64px)] flex flex-col animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4 mb-6">
        <div>
          <Link href={`/dashboard/projects/${projectId}`} className="text-white/40 hover:text-white mb-3 inline-flex items-center text-[13px] font-medium transition-colors">
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="mr-1">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Project
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-[24px] font-semibold text-white tracking-tight">{clip.title || 'Clip Editor'}</h1>
            <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[11px] font-medium">
              Score: {clip.score}
            </span>
          </div>
        </div>
        <ExportButton clipId={clip.id} />
      </div>
      
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-0">
        <div className="lg:col-span-2 cf-surface rounded-2xl flex flex-col overflow-hidden border border-white/5 shadow-xl">
          {/* Video Player Area */}
          <div className="flex-1 bg-[#050505] relative flex items-center justify-center p-6 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white/5 to-transparent">
             <div className="aspect-[9/16] h-full max-h-full rounded-xl overflow-hidden flex flex-col items-center justify-center relative shadow-2xl border border-white/10 bg-black">
               {videoUrl ? (
                 <video controls src={videoUrl} className="w-full h-full object-cover" playsInline />
               ) : (
                 <>
                   <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-3">
                     <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="text-white/20">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                     </svg>
                   </div>
                   <span className="text-white/30 text-[13px] font-medium">Video Preview Unavailable</span>
                   <span className="text-white/20 text-[11px] mt-1 font-mono">{clip.aspect_ratio}</span>
                 </>
               )}
             </div>
          </div>
          {/* Timeline Area */}
          <div className="h-36 border-t border-white/5 bg-[#0D0D12] p-5">
             <div className="text-[12px] font-medium text-white/50 mb-3 flex justify-between items-center">
               <span className="uppercase tracking-wider">Timeline</span>
               <span className="font-mono bg-white/5 px-2 py-1 rounded text-white/70">
                 {clip.duration ? (
                   (() => {
                     const totalSeconds = clip.duration / 1000;
                     const minutes = Math.floor(totalSeconds / 60);
                     const seconds = (totalSeconds % 60).toFixed(1).replace(/\.0$/, '');
                     return `${minutes.toString().padStart(2, '0')}:${seconds.padStart(2, '0')}`;
                   })()
                 ) : '00:00'}
               </span>
             </div>
             <div className="h-14 bg-[#131318] rounded-lg relative border border-white/5 overflow-hidden">
                {/* Trim Handles Mock */}
                <div className="absolute top-0 bottom-0 left-[20%] right-[20%] bg-indigo-500/10 border-l-[3px] border-r-[3px] border-indigo-500 flex items-center justify-between">
                  <div className="w-1.5 h-4 bg-indigo-400 rounded-full ml-1" />
                  <div className="w-1.5 h-4 bg-indigo-400 rounded-full mr-1" />
                </div>
             </div>
          </div>
        </div>
        
        {/* Sidebar Controls */}
        <div className="cf-surface rounded-2xl p-6 overflow-y-auto border border-white/5 shadow-xl">
           <h3 className="text-[16px] font-medium text-white mb-6 flex items-center gap-2">
             <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
             </svg>
             Clip Settings
           </h3>
           
           <div className="space-y-8">
             <div>
               <label className="text-[13px] font-medium text-white/70 block mb-3">Aspect Ratio</label>
               <div className="grid grid-cols-3 gap-3">
                 <button className={`py-2.5 text-[13px] font-medium rounded-lg border transition-all ${clip.aspect_ratio === '9:16' ? 'bg-indigo-500/20 border-indigo-500 text-indigo-300 shadow-[0_0_15px_rgba(99,102,241,0.2)]' : 'bg-white/5 border-white/10 text-white/50 hover:text-white hover:bg-white/10'}`}>9:16</button>
                 <button className={`py-2.5 text-[13px] font-medium rounded-lg border transition-all ${clip.aspect_ratio === '1:1' ? 'bg-indigo-500/20 border-indigo-500 text-indigo-300 shadow-[0_0_15px_rgba(99,102,241,0.2)]' : 'bg-white/5 border-white/10 text-white/50 hover:text-white hover:bg-white/10'}`}>1:1</button>
                 <button className={`py-2.5 text-[13px] font-medium rounded-lg border transition-all ${clip.aspect_ratio === '16:9' ? 'bg-indigo-500/20 border-indigo-500 text-indigo-300 shadow-[0_0_15px_rgba(99,102,241,0.2)]' : 'bg-white/5 border-white/10 text-white/50 hover:text-white hover:bg-white/10'}`}>16:9</button>
               </div>
             </div>

             <div>
               <label className="text-[13px] font-medium text-white/70 block mb-3">Caption Style</label>
               <div className="relative">
                 <select className="w-full bg-[#0D0D12] border border-white/10 rounded-lg p-3 text-[13px] text-white focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 appearance-none shadow-inner cursor-pointer transition-all">
                   <option>Highlight (Default)</option>
                   <option>Minimal</option>
                   <option>Bold</option>
                   <option>None</option>
                 </select>
                 <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-white/30">
                   <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                   </svg>
                 </div>
               </div>
             </div>
             
             <div>
                <label className="text-[13px] font-medium text-white/70 block mb-3">AI Analysis</label>
                <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
                      <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="text-[13px] font-medium text-emerald-400 mb-1">Score: {clip.score}</h4>
                      <p className="text-[12px] text-emerald-400/70 leading-relaxed">
                        This segment was identified as highly engaging based on transcript sentiment and vocal delivery.
                      </p>
                    </div>
                  </div>
                </div>
             </div>
           </div>
        </div>
      </div>
    </div>
  );
}