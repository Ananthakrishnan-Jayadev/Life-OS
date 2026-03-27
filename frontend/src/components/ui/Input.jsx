import { clsx } from 'clsx';
import { forwardRef } from 'react';

const Input = forwardRef(({ label, className, error, ...props }, ref) => {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-sm text-text-secondary font-body">{label}</label>
      )}
      <input
        ref={ref}
        className={clsx(
          'bg-bg-input border border-border rounded-none px-3 py-2 text-sm text-text-primary font-body',
          'placeholder:text-text-tertiary',
          'focus:outline-none focus:border-accent-cream transition-colors duration-200',
          error && 'border-accent-rose',
          className
        )}
        {...props}
      />
      {error && <span className="text-xs text-accent-rose">{error}</span>}
    </div>
  );
});

Input.displayName = 'Input';
export default Input;
