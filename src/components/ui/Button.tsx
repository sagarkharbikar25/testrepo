import { ButtonHTMLAttributes, forwardRef } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg';
}

const variants = {
  primary:
    'bg-white text-black hover:bg-zinc-200 shadow-[0_0_24px_rgba(255,255,255,0.25)] border border-white font-semibold',
  secondary:
    'bg-white/[0.06] hover:bg-white/[0.12] text-white border border-white/20 font-medium backdrop-blur-md shadow-xs',
  ghost:
    'bg-transparent hover:bg-white/[0.06] text-zinc-300 hover:text-white font-medium border border-transparent',
  danger:
    'bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 font-medium shadow-xs',
  success:
    'bg-[#2EEA8D]/20 hover:bg-[#2EEA8D]/30 text-[#2EEA8D] border border-[#2EEA8D]/30 font-medium shadow-xs',
};

const sizes = {
  sm: 'px-3.5 py-1.5 text-xs gap-1.5',
  md: 'px-5 py-2.5 text-sm gap-2',
  lg: 'px-7 py-3 text-base gap-2.5',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', className = '', children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled}
        className={`inline-flex items-center justify-center rounded-full cursor-pointer transition-all duration-200 active:scale-[0.98] disabled:opacity-40 disabled:pointer-events-none disabled:cursor-not-allowed ${variants[variant]} ${sizes[size]} ${className}`}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
