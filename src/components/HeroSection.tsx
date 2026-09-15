'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { validateVideoUrl } from '@/lib/url-validation';

export default function HeroSection() {
  const router = useRouter();
  const [tab, setTab] = useState<'upload' | 'youtube'>('youtube');
  const [url, setUrl] = useState('');
  const [urlError, setUrlError] = useState('');
  const [fileError, setFileError] = useState('');
  const [isDragging, setIsDragging] = useState(false);

  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const result = validateVideoUrl(url);
    if (!result.valid) {
      setUrlError(result.reason || 'Invalid URL');
      return;
    }
    router.push('/login'); // Redirect to auth to continue
  };

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (!file) return;
    validateAndSelectFile(file);
  };
  
  const validateAndSelectFile = (file: File) => {
    setFileError('');
    if (!file.type.startsWith('video/')) {
      setFileError('Please select a valid video file (MP4, MOV, WebM).');
      return;
    }
    router.push('/login'); // Redirect to auth to continue
  };

  return (
    <section className="relative pt-32 pb-20 md:pt-24 md:pb-16 sm:pt-20 sm:pb-12 overflow-hidden flex flex-col items-center dot-grid" style={{ minHeight: '90vh' }}>
      
      {/* Background radial gradient */}
      <div 
        className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[800px] h-[600px] pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 70%)' }}
        aria-hidden="true"
      />

      <div className="max-w-[1200px] w-full mx-auto px-10 md:px-8 sm:px-5 relative z-10 text-center flex flex-col items-center">
        
        {/* Badge */}
        <div className="mb-8 animate-fade-up">
          <span 
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[12px] font-medium"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.7)' }}
          >
            <div className="w-1.5 h-1.5 rounded-full" style={{ background: 'linear-gradient(135deg, #7C3AED, #3B82F6)' }} />
            AI Video Repurposing SaaS
          </span>
        </div>

        {/* Headline */}
        <h1 
          className="font-semibold tracking-tight leading-[1.05] mb-6 animate-fade-up delay-75"
          style={{ fontSize: 'clamp(40px, 6vw, 72px)', color: '#F5F5F7', maxWidth: '860px' }}
        >
          Turn Long Videos Into Short-Form Content That <span className="gradient-text">Gets Watched.</span>
        </h1>

        {/* Supporting text */}
        <p 
          className="text-[18px] sm:text-[16px] leading-relaxed mb-12 animate-fade-up delay-150"
          style={{ color: 'rgba(255,255,255,0.5)', maxWidth: '640px' }}
        >
          Upload a video or paste a YouTube link. ClipForge finds the strongest moments, turns them into vertical clips, adds captions, and gets them ready to publish.
        </p>

        {/* The Product Input Experience */}
        <div className="w-full max-w-[600px] surface p-1 shadow-2xl shadow-indigo-500/10 rounded-2xl animate-fade-up delay-300 relative text-left">
          
          <div className="absolute -top-3 left-6 px-3 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-indigo-500 text-white shadow-sm shadow-indigo-500/20">
            Create your first clips
          </div>

          <div className="flex p-1 gap-1 mb-4 border-b border-[rgba(255,255,255,0.06)] pt-6 px-4">
            <button
              onClick={() => setTab('youtube')}
              className={`flex-1 py-2 text-[13px] font-medium rounded-md transition-colors ${
                tab === 'youtube' ? 'bg-[rgba(255,255,255,0.08)] text-white' : 'text-[rgba(255,255,255,0.5)] hover:text-white'
              }`}
            >
              Paste YouTube URL
            </button>
            <button
              onClick={() => setTab('upload')}
              className={`flex-1 py-2 text-[13px] font-medium rounded-md transition-colors ${
                tab === 'upload' ? 'bg-[rgba(255,255,255,0.08)] text-white' : 'text-[rgba(255,255,255,0.5)] hover:text-white'
              }`}
            >
              Upload Video
            </button>
          </div>

          <div className="px-5 pb-5">
            {tab === 'youtube' ? (
              <form onSubmit={handleUrlSubmit} className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1">
                  <input
                    type="text"
                    value={url}
                    onChange={(e) => { setUrl(e.target.value); setUrlError(''); }}
                    placeholder="https://www.youtube.com/watch?v=..."
                    className="w-full h-12 px-4 rounded-lg text-[14px] bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.1)] focus:outline-none focus:border-indigo-500 transition-colors text-white"
                  />
                  {urlError && <p className="mt-2 text-[12px] text-red-400 absolute">{urlError}</p>}
                </div>
                <button type="submit" disabled={!url} className="btn-accent h-12 px-6 rounded-lg whitespace-nowrap disabled:opacity-50">
                  Generate Clips
                </button>
              </form>
            ) : (
              <div 
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleFileDrop}
                className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
                  isDragging ? 'border-indigo-500 bg-[rgba(99,102,241,0.05)]' : 'border-[rgba(255,255,255,0.1)] hover:border-[rgba(255,255,255,0.2)]'
                }`}
              >
                <p className="text-[14px] font-medium text-white mb-1">Drag & drop your video</p>
                <p className="text-[12px] text-[rgba(255,255,255,0.4)] mb-4">MP4, MOV, WebM up to 2GB</p>
                <label className="btn-accent h-9 px-5 inline-flex items-center cursor-pointer text-[13px] rounded-md">
                  Choose a file
                  <input type="file" className="hidden" accept="video/mp4,video/quicktime,video/webm" onChange={(e) => { if(e.target.files?.[0]) validateAndSelectFile(e.target.files[0]); }} />
                </label>
                {fileError && <p className="mt-3 text-[12px] text-red-400">{fileError}</p>}
              </div>
            )}
          </div>
        </div>

        {/* Secondary Links */}
        <div className="mt-8 flex items-center justify-center gap-6 animate-fade-up delay-500">
          <a href="#how-it-works" className="text-[14px] text-[rgba(255,255,255,0.5)] hover:text-white transition-colors">
            See How It Works &rarr;
          </a>
        </div>

      </div>
    </section>
  );
}