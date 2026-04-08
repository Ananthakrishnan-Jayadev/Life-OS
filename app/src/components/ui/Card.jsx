import { clsx } from 'clsx';

export default function Card({ children, className, header, footer, onClick, hover = false }) {
  return (
    <div
      onClick={onClick}
      className={clsx(
        'bg-bg-secondary border border-border rounded-none',
        hover && 'hover:bg-bg-tertiary hover:-translate-y-[1px] transition-all duration-200 cursor-pointer',
        onClick && 'cursor-pointer',
        className
      )}
    >
      {header && (
        <div className="px-5 py-3 border-b border-border">
          {typeof header === 'string' ? (
            <h3 className="font-display text-text-primary text-lg">{header}</h3>
          ) : header}
        </div>
      )}
      <div className="p-5">{children}</div>
      {footer && (
        <div className="px-5 py-3 border-t border-border">{footer}</div>
      )}
    </div>
  );
}
