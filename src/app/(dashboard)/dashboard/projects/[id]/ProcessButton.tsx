"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export function ProcessButton({ projectId, label = "Generate AI Clips" }: { projectId: string, label?: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleProcess = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/projects/${projectId}/process`, {
        method: "POST",
      });
      const data = await res.json();
      if (!data.success) {
        alert("Failed to start processing: " + data.error.message);
      } else {
        router.refresh();
      }
    } catch (err: any /* eslint-disable-line @typescript-eslint/no-explicit-any */) {
      alert("Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button 
      onClick={handleProcess} 
      disabled={loading}
      className="btn-accent h-10 px-6 text-[14px] rounded-lg disabled:opacity-50 transition-all shadow-lg hover:shadow-indigo-500/25 flex items-center justify-center font-medium"
    >
      {loading ? (
        <span className="flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          Starting...
        </span>
      ) : (
        <span className="flex items-center gap-2">
          <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          {label}
        </span>
      )}
    </button>
  );
}