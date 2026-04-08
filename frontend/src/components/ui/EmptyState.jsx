export default function EmptyState({ icon: Icon, message, action, onAction }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center gap-3">
      {Icon && <Icon className="w-8 h-8 text-text-tertiary" />}
      <p className="text-text-tertiary text-sm">{message}</p>
      {action && onAction && (
        <button
          onClick={onAction}
          className="mt-2 px-4 py-2 text-xs uppercase tracking-wider border border-border text-text-secondary hover:text-text-primary hover:border-border-hover transition-colors"
        >
          {action}
        </button>
      )}
    </div>
  )
}
