'use client';
import { authService } from '@/services/auth';

import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';

// Auth provider not yet configured — see src/services/auth.ts
// This page is complete UI-wise. Wire the form submit to authService.login()
// once an auth provider (Clerk / NextAuth / Supabase) is configured.

function InputField({
  label, id, type = 'text', value, onChange, placeholder, required = true,
  autoComplete,
}: {
  label: string; id: string; type?: string; value: string;
  onChange: (v: string) => void; placeholder?: string; required?: boolean;
  autoComplete?: string;
}) {
  return (
    <div>
      <label htmlFor={id} className="block text-[13px] font-medium mb-1.5" style={{ color: 'rgba(255,255,255,0.60)' }}>
        {label}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        autoComplete={autoComplete}
        className="w-full h-11 px-3.5 rounded-lg text-[14px] transition-all duration-150"
        style={{
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.10)',
          color: '#F5F5F7',
          outline: 'none',
        }}
        onFocus={(e) => { e.currentTarget.style.borderColor = 'rgba(99,102,241,0.5)'; }}
        onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.10)'; }}
      />
    </div>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await authService.login({ email, password });
    if (result.success) {
      router.push('/dashboard');
    } else {
      setError(result.error.message);
    }
    setLoading(false);
  }

  return (
    <div className="w-full max-w-[400px]">
      <div className="text-center mb-8">
        <h1 className="text-[24px] font-semibold mb-2" style={{ color: '#F5F5F7' }}>
          Welcome back
        </h1>
        <p className="text-[14px]" style={{ color: 'rgba(255,255,255,0.45)' }}>
          Log in to your ClipForge account
        </p>
      </div>

      <div
        className="rounded-xl px-6 py-7"
        style={{ background: '#0D0D12', border: '1px solid rgba(255,255,255,0.08)' }}
      >
        <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
          <InputField
            label="Email"
            id="email"
            type="email"
            value={email}
            onChange={setEmail}
            placeholder="you@example.com"
            autoComplete="email"
          />
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="password" className="text-[13px] font-medium" style={{ color: 'rgba(255,255,255,0.60)' }}>
                Password
              </label>
              <a href="/forgot-password" className="text-[12px] transition-colors" style={{ color: 'rgba(165,180,252,0.80)' }}>
                Forgot password?
              </a>
            </div>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              autoComplete="current-password"
              className="w-full h-11 px-3.5 rounded-lg text-[14px] transition-all duration-150"
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.10)',
                color: '#F5F5F7',
                outline: 'none',
              }}
              onFocus={(e) => { e.currentTarget.style.borderColor = 'rgba(99,102,241,0.5)'; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.10)'; }}
            />
          </div>

          {error && (
            <div
              className="rounded-lg px-3.5 py-2.5 text-[13px] leading-snug"
              style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.18)', color: 'rgba(252,165,165,0.9)' }}
              role="alert"
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !email || !password}
            className="btn-accent h-11 rounded-lg text-[14px] font-medium mt-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <div className="mt-5 pt-5" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <p className="text-center text-[13px]" style={{ color: 'rgba(255,255,255,0.40)' }}>
            Don&apos;t have an account?{' '}
            <a href="/signup" style={{ color: 'rgba(165,180,252,0.88)' }}>
              Create one free
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}