import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
  display: 'swap',
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'ClipForge — One Video. Endless Content.',
  description:
    'ClipForge turns long-form podcasts, interviews and tutorials into scroll-stopping Shorts, Reels and TikToks. AI finds the moments. You post the content.',
  keywords: ['video repurposing', 'short-form content', 'AI video', 'clips', 'reels', 'shorts', 'tiktok'],
  openGraph: {
    title: 'ClipForge — One Video. Endless Content.',
    description: 'Turn long-form video into a week of short-form content with AI.',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang='en'
      className={`${geistSans.variable} ${geistMono.variable}`}
    >
      <body className='min-h-screen bg-[#07070A] text-[#F5F5F7] antialiased'>
        {children}
      </body>
    </html>
  );
}