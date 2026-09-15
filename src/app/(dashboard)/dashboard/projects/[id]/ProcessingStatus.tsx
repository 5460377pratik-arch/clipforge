"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ProcessButton } from "./ProcessButton";

const STAGES = [
  { id: "preparing", label: "Preparing" },
  { id: "downloading_source", label: "Downloading source" },
  { id: "transcribing", label: "Transcribing" },
  { id: "detecting_highlights", label: "Finding highlights" },
  { id: "generating_clips", label: "Creating clips" },
  { id: "finalizing", label: "Finalizing" }
];

const TIPS = [
  "Tip: Strong clips usually start with a clear hook.",
  "Tip: Shorter intros can improve viewer retention.",
  "Tip: Vertical framing works especially well for Shorts, Reels and TikTok.",
  "Did you know?\nClipForge analyzes your video's transcript to identify potentially strong moments.",
  "While ClipForge works:\nYour original video remains safely stored in your private workspace."
];

export function ProcessingStatus({ 
  projectId, 
  initialJob,
  initialProjectStatus
}: { 
  projectId: string, 
  initialJob: any /* eslint-disable-line @typescript-eslint/no-explicit-any */ | null,
  initialProjectStatus: string
}) {
  const router = useRouter();
  const [job, setJob] = useState<any /* eslint-disable-line @typescript-eslint/no-explicit-any */ | null>(initialJob);
  const [tipIndex, setTipIndex] = useState(0);


  useEffect(() => {
    if (job?.status !== "queued" && job?.status !== "processing") return;
    const interval = setInterval(() => {
      setTipIndex(i => (i + 1) % TIPS.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [job?.status]);

  // We intentionally use this variable to indicate prop changes without using it directly
  void initialProjectStatus;

  // IMPORTANT: We only seed the initial state once.
  // We do NOT continuously overwrite `job` with `initialJob` during render,
  // because that would cause a render loop every time a poll updates the local state.
  useEffect(() => {
    if (initialJob && initialJob.id && (!job || job.id !== initialJob.id)) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setJob(initialJob);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialJob?.id]); // Only run if the job ID changes (e.g. user started a new job)

  useEffect(() => {
    let isMounted = true;
    let timerId: NodeJS.Timeout;
    const abortController = new AbortController();
    
    // Check if we need to poll
    if (!job || (job.status !== "queued" && job.status !== "processing")) {
      return;
    }

    console.log(`[ProcessingStatus] mounted ${job.id}`);
    console.log(`[ProcessingStatus] poll started ${job.id}`);

    const pollJob = async () => {
      // Skip if tab is hidden
      if (document.visibilityState === 'hidden') {
        if (isMounted) timerId = setTimeout(pollJob, 2500);
        return;
      }

      try {
        console.log(`[ProcessingStatus] request ${job.id}`);
        const res = await fetch(`/api/jobs/${job.id}`, { 
          cache: "no-store",
          signal: abortController.signal
        });
        
        if (!res.ok) throw new Error("Failed to fetch");
        const json = await res.json();
        
        if (json.success && json.data && isMounted) {
          const updatedJob = json.data;
          console.log(`[ProcessingStatus] response ${updatedJob.status} ${updatedJob.stage}`);
          
          if (updatedJob.status !== job.status || updatedJob.stage !== job.stage) {
            console.log(`[ProcessingStatus] state update ${updatedJob.status} ${updatedJob.stage}`);
            setJob(updatedJob);
          }
          
          if (updatedJob.status === "completed" || updatedJob.status === "failed") {
            // Stop polling immediately and refresh server state to show clips or new buttons
            console.log(`[ProcessingStatus] polling stopped completed or failed`);
            router.refresh();
            console.log(`[ProcessingStatus] refresh completed`);
            return; // Do NOT schedule another poll
          }
        }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (err: any) {
        if (err.name === 'AbortError') {
           console.log(`[ProcessingStatus] request aborted`);
           return;
        }
        console.error("Polling error:", err);
      }
      
      // Schedule next poll only if still mounted
      if (isMounted) {
        timerId = setTimeout(pollJob, 2500);
      }
    };

    // Immediately poll if visibility changes to visible
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        clearTimeout(timerId); // Clear existing timer to prevent duplicates
        pollJob(); // Poll immediately
      }
    };
    
    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Start the loop
    timerId = setTimeout(pollJob, 2500);

    return () => {
      isMounted = false;
      clearTimeout(timerId);
      abortController.abort();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      console.log(`[ProcessingStatus] unmounted ${job?.id}`);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [job?.id, job?.status, router]);

  if (!job) return null;

  if (job.status === "completed") {
    return (
      <div className="mb-8 p-6 rounded-2xl bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 text-center animate-fade-in">
        <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 mx-auto mb-3">
          <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-emerald-400 mb-1">Your clips are ready</h3>
        <p className="text-sm text-emerald-400/60">Scroll down to view and export your generated clips.</p>
      </div>
    );
  }

  if (job.status === "failed") {
    return (
      <div className="mb-8 p-6 rounded-2xl bg-gradient-to-r from-red-500/10 to-orange-500/10 border border-red-500/20">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center text-red-400 shrink-0">
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="text-base font-medium text-red-400 mb-1">Processing Failed</h3>
            <p className="text-sm text-red-400/70 mb-4">{job.error_message || "An unknown error occurred during processing."}</p>
            <ProcessButton projectId={projectId} label="Retry Processing" />
          </div>
        </div>
      </div>
    );
  }

  // Active status (queued or processing)
  const currentStageIndex = STAGES.findIndex(s => s.id === job.stage);
  
  return (
    <div className="mb-10 surface p-6 md:p-10 rounded-3xl border border-indigo-500/30 shadow-[0_0_60px_rgba(99,102,241,0.1)] relative overflow-hidden group">
      {/* Animated background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80%] h-[200px] bg-indigo-500/20 blur-[120px] rounded-full opacity-50 group-hover:opacity-70 transition-opacity duration-1000" />
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/10" />
      
      <div className="relative z-10 flex flex-col items-center text-center gap-2 mb-12 mt-4">
        <div className="relative w-16 h-16 mb-4 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full border-[3px] border-indigo-500/20 border-t-indigo-500 animate-[spin_3s_linear_infinite]" />
          <div className="absolute inset-2 rounded-full border-[3px] border-purple-500/20 border-b-purple-500 animate-[spin_4s_linear_infinite_reverse]" />
          <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="url(#gradient)" className="animate-pulse">
            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#818CF8" />
                <stop offset="100%" stopColor="#C084FC" />
              </linearGradient>
            </defs>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
          </svg>
        </div>
        <h3 className="text-[22px] font-semibold text-white tracking-tight">AI is working on your video</h3>
        <p className="text-[15px] text-indigo-200/70 max-w-sm h-[48px] flex items-center justify-center transition-opacity duration-500">
          {TIPS[tipIndex].split('\n').map((line, i) => (
            <span key={i} className="block">{line}</span>
          ))}
        </p>
      </div>

      <div className="relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative">
          {/* Connecting line */}
          <div className="hidden md:block absolute top-1/2 left-0 right-0 h-[2px] bg-white/5 -translate-y-1/2 z-0" />
          
          {STAGES.map((stage, idx) => {
            const isCompleted = currentStageIndex > idx;
            const isCurrent = currentStageIndex === idx || (job.status === "queued" && idx === 0);
            
            return (
              <div key={stage.id} className="relative z-10 flex flex-row md:flex-col items-center gap-3 md:gap-4 flex-1 w-full group/stage">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-all duration-500 ${
                  isCompleted 
                    ? "bg-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.3)] text-white scale-100" 
                    : isCurrent 
                      ? "bg-indigo-500 shadow-[0_0_30px_rgba(99,102,241,0.5)] text-white scale-110" 
                      : "bg-[#1A1A24] border-2 border-white/10 text-white/30 scale-90"
                }`}>
                  {isCompleted ? (
                    <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                    </svg>
                  ) : isCurrent ? (
                    <div className="w-3 h-3 rounded-full bg-white animate-ping" />
                  ) : (
                    <span className="text-[11px] font-medium">{idx + 1}</span>
                  )}
                </div>
                <div className="text-left md:text-center">
                  <span className={`block text-[13px] font-semibold transition-colors duration-300 ${
                    isCompleted ? "text-emerald-400" : isCurrent ? "text-indigo-300" : "text-white/40"
                  }`}>
                    {stage.label}
                  </span>
                  {isCurrent && (
                    <span className="block text-[11px] text-indigo-300/60 mt-0.5 animate-pulse">In progress...</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      
      <div className="relative z-10 mt-12 pt-6 border-t border-white/5 flex flex-wrap gap-4 justify-center">
        <span className="text-[12px] text-white/40 uppercase tracking-wider font-semibold mr-2 self-center">While you wait</span>
        <button className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-[13px] text-white/70 transition-colors border border-white/5">
          Explore your clips
        </button>
        <button className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-[13px] text-white/70 transition-colors border border-white/5">
          Open ClipForge guide
        </button>
      </div>
    </div>
  );
}