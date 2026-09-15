'use client';

import { useState } from 'react';
import SourceSelector from '@/components/dashboard/SourceSelector';
import CreateProjectForm from '@/components/dashboard/CreateProjectForm';
import type { VideoSource } from '@/lib/types';

export default function CreateProjectPage() {
  const [source, setSource] = useState<VideoSource | null>(null);
  const [file, setFile] = useState<File | null>(null);

  return (
    <div className="max-w-3xl mx-auto py-8 lg:py-12 px-4 animate-fade-in">
      <div className="mb-10 text-center md:text-left">
        <h1 className="text-[28px] font-semibold text-white mb-3 tracking-tight">Create New Project</h1>
        <p className="text-[15px] text-white/50 max-w-xl">
          Upload a video or paste a YouTube link. We&apos;ll analyze the transcript and extract your most engaging moments.
        </p>
      </div>

      <div className="flex flex-col gap-10">
        {/* Step 1: Source */}
        <div className={`transition-all duration-500 ${source ? 'opacity-40 grayscale-[50%] pointer-events-none scale-[0.98]' : 'scale-100'}`}>
          <div className="flex items-center gap-4 mb-5">
            <div className="w-8 h-8 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-[13px] font-bold shadow-[0_0_15px_rgba(99,102,241,0.2)]">1</div>
            <h2 className="text-[18px] font-medium text-white">Choose Video Source</h2>
          </div>
          <SourceSelector onSelect={(s, f) => { setSource(s); if (f) setFile(f); }} />
        </div>

        {/* Step 2: Config */}
        {source && (
          <div className="animate-[cf-fade-up_0.5s_ease_both]">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-full bg-indigo-500 text-white flex items-center justify-center text-[13px] font-bold shadow-[0_0_15px_rgba(99,102,241,0.5)]">2</div>
                <h2 className="text-[18px] font-medium text-white">Configure Settings</h2>
              </div>
              <button 
                onClick={() => setSource(null)}
                className="text-[13px] font-medium text-indigo-400 hover:text-indigo-300 transition-colors px-3 py-1.5 rounded-lg hover:bg-indigo-500/10"
              >
                Change source
              </button>
            </div>
            
            <CreateProjectForm source={source} file={file} />
          </div>
        )}
      </div>
    </div>
  );
}