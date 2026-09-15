'use client';

import { useState } from 'react';
import { validateVideoUrl } from '@/lib/url-validation';
import type { VideoSource } from '@/lib/types';

interface SourceSelectorProps {
  onSelect: (source: VideoSource, file?: File) => void;
}

export default function SourceSelector({ onSelect }: SourceSelectorProps) {
  const [tab, setTab] = useState<'upload' | 'youtube'>('youtube');
  
  // YouTube state
  const [url, setUrl] = useState('');
  const [urlError, setUrlError] = useState('');
  
  // Upload state
  const [isDragging, setIsDragging] = useState(false);
  const [fileError, setFileError] = useState('');

  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const result = validateVideoUrl(url);
    if (!result.valid) {
      setUrlError(result.reason || 'Invalid URL');
      return;
    }
    
    if (result.sourceType === 'youtube' && result.videoId) {
      onSelect({
        type: 'youtube',
        url: url.trim(),
        videoId: result.videoId
      });
    }
  };

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (!file) return;
    
    validateAndSelectFile(file);
  };
  
  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    validateAndSelectFile(file);
  };

  const validateAndSelectFile = (file: File) => {
    setFileError('');
    if (!file.type.startsWith('video/')) {
      setFileError('Please select a valid video file (MP4, MOV, WebM).');
      return;
    }
    
    const sizeMb = file.size / (1024 * 1024);
    if (sizeMb > 2000) { // 2GB limit for this UI check
      setFileError('File size exceeds the 2GB limit. Upgrade to a larger plan for larger files.');
      return;
    }

    onSelect({
      type: 'upload',
      filename: file.name,
      fileSizeMb: sizeMb,
      mimeType: file.type
    }, file);
  };

  return (
    <div className="cf-surface p-1 rounded-2xl border border-white/5 overflow-hidden shadow-lg relative group">
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
      
      <div className="flex p-1.5 gap-1.5 mb-2 relative z-10 border-b border-white/5">
        <button
          onClick={() => setTab('youtube')}
          className={`flex-1 py-3 text-[13px] font-medium rounded-xl transition-all duration-300 flex items-center justify-center gap-2 ${
            tab === 'youtube' 
              ? 'bg-white/10 text-white shadow-sm border border-white/5' 
              : 'text-white/40 hover:text-white/80 hover:bg-white/5 border border-transparent'
          }`}
        >
          <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24">
            <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.5 12 3.5 12 3.5s-7.505 0-9.377.55a3.016 3.016 0 0 0-2.122 2.136C0 8.07 0 12 0 12s0 3.93.501 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.55 9.377.55 9.377.55s7.505 0 9.377-.55a3.016 3.016 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
          </svg>
          YouTube URL
        </button>
        <button
          onClick={() => setTab('upload')}
          className={`flex-1 py-3 text-[13px] font-medium rounded-xl transition-all duration-300 flex items-center justify-center gap-2 ${
            tab === 'upload' 
              ? 'bg-white/10 text-white shadow-sm border border-white/5' 
              : 'text-white/40 hover:text-white/80 hover:bg-white/5 border border-transparent'
          }`}
        >
          <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
          Upload Video
        </button>
      </div>

      <div className="p-5 sm:p-8 relative z-10">
        {tab === 'youtube' ? (
          <form onSubmit={handleUrlSubmit} className="flex flex-col gap-5 animate-fade-in">
            <div>
              <label htmlFor="url" className="block text-[13px] font-medium text-white mb-2">Paste YouTube Link</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="text-white/30">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                </div>
                <input
                  id="url"
                  type="url"
                  placeholder="https://www.youtube.com/watch?v=..."
                  value={url}
                  onChange={(e) => { setUrl(e.target.value); setUrlError(''); }}
                  className="w-full bg-[#0D0D12] border border-white/10 rounded-xl py-3.5 pl-10 pr-4 text-[14px] text-white placeholder-white/20 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all shadow-inner"
                  required
                />
              </div>
              {urlError && <p className="mt-2 text-[12px] text-red-400 font-medium">{urlError}</p>}
            </div>
            <button 
              type="submit" 
              disabled={!url.trim()} 
              className="btn-accent h-12 rounded-xl text-[14px] font-medium disabled:opacity-50 transition-all shadow-[0_4px_20px_rgba(99,102,241,0.2)] hover:shadow-[0_8px_30px_rgba(99,102,241,0.3)] flex items-center justify-center gap-2 mt-2"
            >
              Continue with URL
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </form>
        ) : (
          <div className="animate-fade-in">
            <div
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={(e) => { e.preventDefault(); setIsDragging(false); }}
              onDrop={handleFileDrop}
              className={`border-2 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center text-center transition-all duration-300 ${
                isDragging 
                  ? 'border-indigo-500 bg-indigo-500/10 scale-[1.02]' 
                  : 'border-white/10 bg-[#0D0D12] hover:border-indigo-500/30 hover:bg-[#131318]'
              }`}
            >
              <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 transition-all duration-300 ${isDragging ? 'bg-indigo-500 text-white shadow-[0_0_30px_rgba(99,102,241,0.5)]' : 'bg-white/5 text-white/30'}`}>
                <svg width="32" height="32" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
              <h3 className="text-[16px] font-medium text-white mb-2">Drag and drop your video here</h3>
              <p className="text-[13px] text-white/40 mb-6 max-w-sm">
                Supports MP4, MOV, and WebM up to 2GB. For longer videos, we recommend pasting a YouTube link.
              </p>
              
              <label className="btn-accent h-11 px-8 rounded-xl text-[14px] cursor-pointer inline-flex items-center justify-center font-medium shadow-[0_4px_20px_rgba(99,102,241,0.2)] hover:shadow-[0_8px_30px_rgba(99,102,241,0.3)] transition-all">
                Browse Files
                <input
                  type="file"
                  accept="video/*"
                  onChange={handleFileInput}
                  className="hidden"
                />
              </label>
            </div>
            {fileError && <p className="mt-4 text-[13px] text-red-400 font-medium text-center">{fileError}</p>}
          </div>
        )}
      </div>
    </div>
  );
}