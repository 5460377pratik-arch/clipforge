import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="py-6">
      <div className="mb-8">
        <h1 className="text-[28px] font-semibold text-white mb-2 tracking-tight">Settings</h1>
        <p className="text-[14px] text-[rgba(255,255,255,0.5)]">Manage your account and preferences.</p>
      </div>

      <div className="cf-surface p-8 sm:p-10 rounded-2xl border border-white/5 max-w-2xl shadow-xl relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
        <div className="relative z-10">
          <h3 className="text-[18px] font-medium text-white mb-6 flex items-center gap-2">
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="text-indigo-400">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            Account Details
          </h3>
          <div className="mb-8">
            <label className="text-[13px] font-medium text-white/60 block mb-2">Email Address</label>
            <div className="text-[14px] text-white bg-[#0D0D12] p-4 rounded-xl border border-white/10 shadow-inner flex items-center justify-between">
              {user.email}
              <span className="text-[11px] font-medium text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">Verified</span>
            </div>
          </div>
          
          <div className="pt-6 border-t border-white/10 flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-indigo-500/10 text-indigo-400 flex items-center justify-center shrink-0 mt-0.5">
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h4 className="text-[14px] font-medium text-white mb-1">More settings coming soon</h4>
              <p className="text-[13px] text-white/40 leading-relaxed">
                Billing, custom templates, and advanced export options are currently in development.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}