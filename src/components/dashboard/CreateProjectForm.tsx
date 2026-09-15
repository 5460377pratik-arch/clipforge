'use client';

import { useState } from 'react';
import type { GenerationConfig, VideoSource } from '@/lib/types';
import { CLIP_COUNT_OPTIONS, ASPECT_RATIO_OPTIONS, CAPTION_STYLE_OPTIONS, LANGUAGE_OPTIONS } from '@/lib/constants';
import { DEFAULT_CONFIG } from '@/lib/types';
import { projectService } from '@/services/projects';
import { storageService } from '@/services/storage';
import { useRouter } from 'next/navigation';

export default function CreateProjectForm({ source, file }: { source: VideoSource, file: File | null }) {
  const [config, setConfig] = useState<GenerationConfig>(DEFAULT_CONFIG);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [progress, setProgress] = useState<number | null>(null);
  const [statusText, setStatusText] = useState('Creating Project...');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    setProgress(null);
    setStatusText('Creating Project...');

    try {
      // 1. Create the project record in the database
      const res = await projectService.createProject({
        source,
        config
      });
      
      if (!res.success) {
        setError(res.error.message);
        setIsSubmitting(false);
        return;
      }

      const project = res.data;

      // 2. If it's an upload, handle the file upload now
      if (source.type === 'upload' && file) {
        setStatusText('Uploading Video...');
        setProgress(0);
        
        const uploadRes = await storageService.uploadVideo(file, project.id, (pct) => {
          setProgress(pct);
        });

        if (!uploadRes.success) {
          setError(`Upload failed: ${uploadRes.error.message}. Project was created but source is pending.`);
          setIsSubmitting(false);
          return;
        }
        
        setStatusText('Upload Complete. Finalizing...');
        
        const confirmRes = await projectService.confirmUpload(project.id, uploadRes.data.path);
        if (!confirmRes.success) {
          setError('Upload confirmation failed: ' + confirmRes.error.message);
          setIsSubmitting(false);
          return;
        }
      }
      
      // 3. Redirect to the project page
      router.push(`/dashboard/projects/${project.id}`);
      
    } catch (err: any /* eslint-disable-line @typescript-eslint/no-explicit-any */) {
      setError(err.message || 'An unexpected error occurred.');
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-8">
      <div className="surface p-6">
        <h3 className="text-[15px] font-semibold text-white mb-6">Generation Settings</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Target Clips */}
          <div>
            <label className="block text-[13px] font-medium text-[rgba(255,255,255,0.7)] mb-3">Target Clips</label>
            <div className="flex flex-wrap gap-2">
              {CLIP_COUNT_OPTIONS.map(num => (
                <button
                  key={num}
                  type="button"
                  onClick={() => setConfig({...config, targetClipCount: num})}
                  className={`w-10 h-10 rounded-md text-[13px] font-medium transition-colors ${
                    config.targetClipCount === num 
                      ? 'bg-indigo-500 text-white' 
                      : 'bg-[rgba(255,255,255,0.04)] text-[rgba(255,255,255,0.6)] border border-[rgba(255,255,255,0.08)] hover:bg-[rgba(255,255,255,0.08)]'
                  }`}
                >
                  {num}
                </button>
              ))}
            </div>
          </div>

          {/* Aspect Ratio */}
          <div>
            <label className="block text-[13px] font-medium text-[rgba(255,255,255,0.7)] mb-3">Aspect Ratio</label>
            <div className="grid grid-cols-3 gap-2">
              {ASPECT_RATIO_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setConfig({...config, aspectRatio: opt.value})}
                  className={`p-3 rounded-md border text-left transition-colors ${
                    config.aspectRatio === opt.value
                      ? 'bg-[rgba(99,102,241,0.1)] border-indigo-500 text-white'
                      : 'bg-[rgba(255,255,255,0.02)] border-[rgba(255,255,255,0.08)] text-[rgba(255,255,255,0.5)] hover:border-[rgba(255,255,255,0.2)]'
                  }`}
                >
                  <div className="text-[13px] font-medium mb-1">{opt.label}</div>
                  <div className="text-[11px] opacity-70">{opt.description}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Caption Style */}
          <div>
            <label className="block text-[13px] font-medium text-[rgba(255,255,255,0.7)] mb-3">Caption Style</label>
            <select
              value={config.captionStyle}
              onChange={(e) => setConfig({...config, captionStyle: e.target.value as any /* eslint-disable-line @typescript-eslint/no-explicit-any */})}
              className="w-full h-11 px-3 rounded-md bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] text-[14px] text-white focus:border-indigo-500 focus:outline-none"
            >
              {CAPTION_STYLE_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value} className="bg-[#131318]">{opt.label} {opt.description ? `(${opt.description})` : ''}</option>
              ))}
            </select>
          </div>

          {/* Language */}
          <div>
            <label className="block text-[13px] font-medium text-[rgba(255,255,255,0.7)] mb-3">Language</label>
            <select
              value={config.language}
              onChange={(e) => setConfig({...config, language: e.target.value as any /* eslint-disable-line @typescript-eslint/no-explicit-any */})}
              className="w-full h-11 px-3 rounded-md bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] text-[14px] text-white focus:border-indigo-500 focus:outline-none"
            >
              {LANGUAGE_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value} className="bg-[#131318]">{opt.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
      
      {error && (
        <div className="p-4 rounded-lg bg-[rgba(239,68,68,0.1)] border border-[rgba(239,68,68,0.2)] text-red-400 text-[13px]">
          {error}
        </div>
      )}

      {isSubmitting && progress !== null && (
        <div className="w-full bg-[rgba(255,255,255,0.05)] rounded-full h-2 mb-2">
          <div className="bg-indigo-500 h-2 rounded-full transition-all duration-300" style={{ width: `${progress}%` }}></div>
          <p className="text-right text-[11px] text-[rgba(255,255,255,0.5)] mt-1">{Math.round(progress)}% uploaded</p>
        </div>
      )}

      <div className="flex justify-end">
        <button type="submit" disabled={isSubmitting} className="btn-accent h-12 px-8 text-[14px] disabled:opacity-50 min-w-[160px]">
          {isSubmitting ? statusText : 'Create Project'}
        </button>
      </div>
    </form>
  );
}