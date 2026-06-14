import * as React from 'react';
import { cn } from '@/lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'ghost' | 'outline' | 'secondary' | 'destructive';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  asChild?: boolean;
}

export function Button({
  className,
  variant = 'default',
  size = 'md',
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center rounded-full font-semibold transition-all duration-200',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-black',
        'disabled:pointer-events-none disabled:opacity-50',
        // Size variants
        size === 'sm' && 'px-3 py-1.5 text-xs',
        size === 'md' && 'px-5 py-2.5 text-sm',
        size === 'lg' && 'px-7 py-3.5 text-base',
        size === 'icon' && 'h-9 w-9 p-0',
        // Color/style variants
        variant === 'default' && 'bg-orange-500 text-black shadow-[0_0_30px_rgba(255,122,24,0.25)] hover:bg-orange-400 hover:shadow-[0_0_40px_rgba(255,122,24,0.35)]',
        variant === 'secondary' && 'bg-white/10 text-white hover:bg-white/15',
        variant === 'ghost' && 'bg-transparent text-white/70 hover:bg-white/8 hover:text-white',
        variant === 'outline' && 'border border-white/15 bg-transparent text-white hover:border-white/30 hover:bg-white/5',
        variant === 'destructive' && 'bg-rose-500/15 text-rose-400 hover:bg-rose-500/25',
        className
      )}
      {...props}
    />
  );
}
