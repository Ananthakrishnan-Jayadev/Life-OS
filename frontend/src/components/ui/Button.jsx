import { clsx } from 'clsx';

const variants = {
  primary: 'bg-accent-sage text-white hover:brightness-110',
  secondary: 'border border-border text-text-primary hover:bg-bg-tertiary hover:border-border-hover',
  ghost: 'text-text-secondary hover:bg-bg-tertiary hover:text-text-primary',
  danger: 'bg-accent-rose text-white hover:brightness-110',
};

const sizes = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-base',
};

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  className,
  ...props
}) {
  return (
    <button
      className={clsx(
        'rounded-none font-body font-medium transition-all duration-200 inline-flex items-center gap-2',
        'active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
