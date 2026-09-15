import { type ReactNode } from 'react';

interface SectionHeadingProps {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  align?: 'left' | 'center';
  className?: string;
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = 'center',
  className = '',
}: SectionHeadingProps) {
  const alignClass = align === 'center' ? 'text-center items-center' : 'text-left items-start';

  return (
    <div className={`flex flex-col gap-4 ${alignClass} ${className}`}>
      {eyebrow && (
        <p className='text-xs font-semibold tracking-widest uppercase text-indigo-400'>
          {eyebrow}
        </p>
      )}
      <h2 className='text-4xl sm:text-[2.5rem] md:text-[3rem] font-semibold leading-[1.1] tracking-[-0.02em] text-[#F5F5F7]'>
        {title}
      </h2>
      {description && (
        <p className='text-[17px] leading-relaxed text-white/60 max-w-xl'>
          {description}
        </p>
      )}
    </div>
  );
}