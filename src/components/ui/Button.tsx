import { type ReactNode, type ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children: ReactNode;
  asChild?: boolean;
}

export function Button({
  variant = 'primary',
  size = 'md',
  children,
  className = '',
  ...props
}: ButtonProps) {
  const base =
    'inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-all duration-150 focus-visible:outline-2 focus-visible:outline-indigo-500/60 focus-visible:outline-offset-2 disabled:opacity-40 disabled:cursor-not-allowed select-none';

  const variants = {
    primary:
      'btn-accent text-white px-5 py-2.5 text-sm',
    secondary:
      'bg-white/[0.06] hover:bg-white/[0.10] border border-white/10 hover:border-white/20 text-white/80 hover:text-white px-5 py-2.5 text-sm',
    ghost:
      'text-white/60 hover:text-white hover:bg-white/[0.05] px-3 py-2 text-sm',
  };

  const sizes = {
    sm: 'px-4 py-2 text-xs',
    md: 'px-5 py-2.5 text-sm',
    lg: 'px-7 py-3.5 text-base',
  };

  return (
    <button
      className={`${base} ${variants[variant]} ${size !== 'md' ? sizes[size] : ''} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}