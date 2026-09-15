"use client";
import { useState } from "react";

export function ExportButton({ clipId }: { clipId: string }) {
  const [loading, setLoading] = useState(false);

  const handleExport = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/clips/${clipId}/export`, {
        method: "POST",
      });
      const data = await res.json();
      if (!data.success) {
        alert(data.error.message);
      } else if (data.data?.downloadUrl) {
        // Trigger download
        window.location.href = data.data.downloadUrl;
      } else {
        alert("Export started!");
      }
    } catch (err: any /* eslint-disable-line @typescript-eslint/no-explicit-any */) {
      alert("Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button 
      onClick={handleExport} 
      disabled={loading}
      className="btn-accent h-9 px-5 text-[13px] disabled:opacity-50 flex items-center gap-2 rounded-lg"
    >
      <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
      </svg>
      {loading ? "Exporting..." : "Export"}
    </button>
  );
}