'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Container } from './ui/Container';

function ClipForgeMark() {
  return (
    <svg width="24" height="24" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <rect x="1" y="4" width="26" height="20" rx="4" fill="#0D0D12" stroke="rgba(255,255,255,0.14)" strokeWidth="1.5" />
      <rect x="1" y="7" width="4" height="3" rx="0.5" fill="rgba(255,255,255,0.10)" />
      <rect x="1" y="12" width="4" height="3" rx="0.5" fill="rgba(255,255,255,0.10)" />
      <rect x="1" y="17" width="4" height="3" rx="0.5" fill="rgba(255,255,255,0.10)" />
      <rect x="23" y="7" width="4" height="3" rx="0.5" fill="rgba(255,255,255,0.10)" />
      <rect x="23" y="12" width="4" height="3" rx="0.5" fill="rgba(255,255,255,0.10)" />
      <rect x="23" y="17" width="4" height="3" rx="0.5" fill="rgba(255,255,255,0.10)" />
      <path d="M12 10L19 14L12 18V10Z" fill="url(#brand-grad)" />
      <line x1="18" y1="4" x2="14" y2="24" stroke="url(#brand-grad)" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
      <defs>
        <linearGradient id="brand-grad" x1="0" y1="0" x2="1" y2="1" gradientUnits="objectBoundingBox">
          <stop stopColor="#7C3AED" />
          <stop offset="1" stopColor="#3B82F6" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-[rgba(7,7,10,0.8)] backdrop-blur-md border-b border-[rgba(255,255,255,0.06)] py-3' : 'bg-transparent py-5'
      }`}
    >
      <Container>
        <nav className="flex items-center justify-between" aria-label="Main navigation">
          {/* Brand */}
          <Link href="/" className="flex items-center gap-2.5 outline-none focus-visible:ring-2 ring-indigo-500 rounded-md">
            <ClipForgeMark />
            <span className="text-[16px] font-semibold tracking-tight text-white">ClipForge</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-[13px] font-medium text-[rgba(255,255,255,0.55)] hover:text-white transition-colors">Features</a>
            <a href="#how-it-works" className="text-[13px] font-medium text-[rgba(255,255,255,0.55)] hover:text-white transition-colors">How it works</a>
            <a href="#pricing" className="text-[13px] font-medium text-[rgba(255,255,255,0.55)] hover:text-white transition-colors">Pricing</a>
          </div>

          {/* CTA & Auth */}
          <div className="hidden md:flex items-center gap-4">
            <Link href="/login" className="text-[13px] font-medium text-white hover:text-indigo-400 transition-colors">
              Log in
            </Link>
            <Link href="/signup" className="btn-accent px-5 py-2 text-[13px]">
              Start free
            </Link>
          </div>

          {/* Mobile toggle */}
          <button
            className="md:hidden p-2 -mr-2 text-[rgba(255,255,255,0.7)] hover:text-white"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-expanded={mobileMenuOpen}
            aria-label="Toggle navigation menu"
          >
            <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </nav>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 bg-[#07070A] border-b border-[rgba(255,255,255,0.06)] p-5 flex flex-col gap-4 shadow-xl">
            <a href="#features" className="text-[14px] font-medium text-[rgba(255,255,255,0.7)]" onClick={() => setMobileMenuOpen(false)}>Features</a>
            <a href="#how-it-works" className="text-[14px] font-medium text-[rgba(255,255,255,0.7)]" onClick={() => setMobileMenuOpen(false)}>How it works</a>
            <a href="#pricing" className="text-[14px] font-medium text-[rgba(255,255,255,0.7)]" onClick={() => setMobileMenuOpen(false)}>Pricing</a>
            <hr className="border-[rgba(255,255,255,0.06)] my-2" />
            <Link href="/login" className="text-[14px] font-medium text-white" onClick={() => setMobileMenuOpen(false)}>Log in</Link>
            <Link href="/signup" className="text-[14px] font-medium text-indigo-400" onClick={() => setMobileMenuOpen(false)}>Start free</Link>
          </div>
        )}
      </Container>
    </header>
  );
}