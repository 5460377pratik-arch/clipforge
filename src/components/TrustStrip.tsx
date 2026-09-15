import { Container } from './ui/Container';

const TRUST_ITEMS = [
  {
    icon: (
      <svg width='14' height='14' viewBox='0 0 14 14' fill='none' aria-hidden='true'>
        <circle cx='7' cy='7' r='6' stroke='currentColor' strokeWidth='1.2' />
        <path d='M4 7L6 9L10 5' stroke='currentColor' strokeWidth='1.2' strokeLinecap='round' strokeLinejoin='round' />
      </svg>
    ),
    text: 'No credit card required',
  },
  {
    icon: (
      <svg width='14' height='14' viewBox='0 0 14 14' fill='none' aria-hidden='true'>
        <rect x='1' y='3' width='12' height='8' rx='2' stroke='currentColor' strokeWidth='1.2' />
        <path d='M5 6.5L7 8L9 5' stroke='currentColor' strokeWidth='1.2' strokeLinecap='round' strokeLinejoin='round' />
      </svg>
    ),
    text: 'Works with MP4 & MOV',
  },
  {
    icon: (
      <svg width='14' height='14' viewBox='0 0 14 14' fill='none' aria-hidden='true'>
        <rect x='4' y='1' width='6' height='12' rx='1.5' stroke='currentColor' strokeWidth='1.2' />
        <path d='M6 4h2M6 7h2M6 10h2' stroke='currentColor' strokeWidth='1.2' strokeLinecap='round' />
      </svg>
    ),
    text: 'Built for Shorts, Reels & TikTok',
  },
];

export function TrustStrip() {
  return (
    <div className='border-y border-white/[0.05] bg-[#07070A]'>
      <Container>
        <div className='flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-10 py-5'>
          {TRUST_ITEMS.map((item, i) => (
            <div key={i} className='flex items-center gap-2 text-white/38'>
              <span className='text-white/30'>{item.icon}</span>
              <span className='text-[13px]'>{item.text}</span>
            </div>
          ))}
        </div>
      </Container>
    </div>
  );
}