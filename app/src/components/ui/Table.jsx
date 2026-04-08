import { clsx } from 'clsx';

export function Table({ children, className }) {
  return (
    <div className="overflow-x-auto">
      <table className={clsx('w-full text-sm', className)}>{children}</table>
    </div>
  );
}

export function Thead({ children }) {
  return (
    <thead className="border-b border-border">
      <tr className="text-left text-text-secondary text-xs uppercase tracking-wider">
        {children}
      </tr>
    </thead>
  );
}

export function Th({ children, className, onClick, sortable }) {
  return (
    <th
      onClick={onClick}
      className={clsx(
        'px-4 py-3 font-medium',
        sortable && 'cursor-pointer hover:text-text-primary transition-colors',
        className
      )}
    >
      {children}
    </th>
  );
}

export function Tbody({ children }) {
  return <tbody className="divide-y divide-border">{children}</tbody>;
}

export function Tr({ children, className, onClick }) {
  return (
    <tr
      onClick={onClick}
      className={clsx(
        'hover:bg-bg-tertiary transition-colors duration-150',
        onClick && 'cursor-pointer',
        className
      )}
    >
      {children}
    </tr>
  );
}

export function Td({ children, className }) {
  return (
    <td className={clsx('px-4 py-3 text-text-primary', className)}>
      {children}
    </td>
  );
}
