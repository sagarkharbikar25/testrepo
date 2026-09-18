import { TextareaHTMLAttributes, forwardRef } from 'react';

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className = '', ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        className={`w-full bg-[#0D0D12] border border-white/15 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-zinc-500 shadow-inner transition-all duration-150 focus:outline-none focus:border-white focus:ring-2 focus:ring-white/20 disabled:opacity-40 disabled:bg-zinc-900 min-h-[110px] resize-y leading-relaxed ${className}`}
        {...props}
      />
    );
  }
);

Textarea.displayName = 'Textarea';
