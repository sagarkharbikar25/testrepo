import { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ghost' | 'danger';
}

export function Button({ variant = 'primary', className = '', ...props }: ButtonProps) {
  const base = "inline-flex items-center justify-center rounded-lg px-4 py-2 font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    primary: "bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white",
    ghost: "bg-transparent border border-[var(--color-border)] hover:bg-[var(--color-card)] text-[var(--color-foreground)]",
    danger: "bg-[var(--color-danger)] hover:bg-red-700 text-white"
  };

  return (
    <button className={`${base} ${variants[variant]} ${className}`} {...props} />
  );
}
