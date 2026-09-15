'use client';
import { authService } from '@/services/auth';

import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');

    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    setLoading(true);
    const result = await authService.signup({ email, password, name });
    if (result.success) {
      router.push('/dashboard');
    } else {
      setError(result.error.message);
    }
    setLoading(false);
  }

  return (
    <div className="w-full max-w-[420px]">
      <div className="text-center mb-8">
        <h1 className="text-[24px] font-semibold mb-2" style={{ color: '#F5F5F7' }}>
          Create your account
        </h1>
        <p className="text-[14px]" style={{ color: 'rgba(255,255,255,0.45)' }}>
          Start turning long videos into short-form content
        </p>
      </div>

      <div
        className="rounded-xl px-6 py-7"
        style={{ background: '#0D0D12', border: '1px solid rgba(255,255,255,0.08)' }}
      >
        <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
          {[
            { label: 'Name', id: 'name', type: 'text', value: name, set: setName, placeholder: 'Your name', ac: 'name', req: false },
            { label: 'Email', id: 'email', type: 'email', value: email, set: setEmail, placeholder: 'you@example.com', ac: 'email', req: true },
            { label: 'Password', id: 'password', type: 'password', value: password, set: setPassword, placeholder: 'Min 8 characters', ac: 'new-password', req: true },
          ].map((f) => (
            <div key={f.id}>
              <label htmlFor={f.id} className="block text-[13px] font-medium mb-1.5" style={{ color: 'rgba(255,255,255,0.60)' }}>
                {f.label}
                {!f.req && <span className="ml-1.5 text-[11px]" style={{ color: 'rgba(255,255,255,0.30)' }}>Optional</span>}
              </label>
              <input
                id={f.id}
                type={f.type}
                value={f.value}
                onChange={(e) => f.set(e.target.value)}
                placeholder={f.placeholder}
                required={f.req}
                autoComplete={f.ac}
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
          ))}

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
            {loading ? 'Creating account...' : 'Create free account'}
          </button>

          <p className="text-center text-[12px]" style={{ color: 'rgba(255,255,255,0.30)' }}>
            By creating an account you agree to our{' '}
            <a href="/terms" style={{ color: 'rgba(165,180,252,0.70)' }}>Terms of Service</a>
            {' '}and{' '}
            <a href="/privacy" style={{ color: 'rgba(165,180,252,0.70)' }}>Privacy Policy</a>.
          </p>
        </form>

        <div className="mt-5 pt-5" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <p className="text-center text-[13px]" style={{ color: 'rgba(255,255,255,0.40)' }}>
            Already have an account?{' '}
            <a href="/login" style={{ color: 'rgba(165,180,252,0.88)' }}>Sign in</a>
          </p>
        </div>
      </div>
    </div>
  );
}