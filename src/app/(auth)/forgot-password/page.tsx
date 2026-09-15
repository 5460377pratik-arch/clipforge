'use client';
import { authService } from '@/services/auth';

import { useState, type FormEvent } from 'react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    const result = await authService.forgotPassword(email);
    if (result.success) {
      setSubmitted(true);
    } else {
      setError(result.error.message);
    }
    setLoading(false);
  }

  if (submitted) {
    return (
      <div className="w-full max-w-[400px] text-center">
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-5"
          style={{ background: 'rgba(74,222,128,0.10)', border: '1px solid rgba(74,222,128,0.20)' }}
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
            <path d="M4 10l4 4 8-8" stroke="rgba(74,222,128,0.9)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <h1 className="text-[22px] font-semibold mb-2" style={{ color: '#F5F5F7' }}>Check your email</h1>
        <p className="text-[14px] mb-6" style={{ color: 'rgba(255,255,255,0.50)' }}>
          If an account exists for <strong style={{ color: 'rgba(255,255,255,0.75)' }}>{email}</strong>, you will receive a password reset link shortly.
        </p>
        <a href="/login" className="btn-accent px-6 py-2.5 rounded-lg text-[14px] font-medium">Back to sign in</a>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[400px]">
      <div className="text-center mb-8">
        <h1 className="text-[24px] font-semibold mb-2" style={{ color: '#F5F5F7' }}>Reset your password</h1>
        <p className="text-[14px]" style={{ color: 'rgba(255,255,255,0.45)' }}>
          Enter your email and we&apos;ll send you a reset link.
        </p>
      </div>

      <div className="rounded-xl px-6 py-7" style={{ background: '#0D0D12', border: '1px solid rgba(255,255,255,0.08)' }}>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
          <div>
            <label htmlFor="email" className="block text-[13px] font-medium mb-1.5" style={{ color: 'rgba(255,255,255,0.60)' }}>Email</label>
            <input
              id="email" type="email" value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com" required autoComplete="email"
              className="w-full h-11 px-3.5 rounded-lg text-[14px] transition-all duration-150"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.10)', color: '#F5F5F7', outline: 'none' }}
              onFocus={(e) => { e.currentTarget.style.borderColor = 'rgba(99,102,241,0.5)'; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.10)'; }}
            />
          </div>
          {error && (
            <div className="rounded-lg px-3.5 py-2.5 text-[13px]" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.18)', color: 'rgba(252,165,165,0.9)' }} role="alert">{error}</div>
          )}
          <button type="submit" disabled={loading || !email} className="btn-accent h-11 rounded-lg text-[14px] font-medium mt-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none">
            {loading ? 'Sending...' : 'Send reset link'}
          </button>
        </form>
        <div className="mt-5 pt-5" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <p className="text-center text-[13px]" style={{ color: 'rgba(255,255,255,0.40)' }}>
            <a href="/login" style={{ color: 'rgba(165,180,252,0.88)' }}>Back to sign in</a>
          </p>
        </div>
      </div>
    </div>
  );
}