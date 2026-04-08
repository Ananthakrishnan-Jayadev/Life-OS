import { X } from 'lucide-react'
import { useToastStore } from '../../store/toastStore'

export default function ToastContainer() {
  const { toasts, removeToast } = useToastStore()

  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
      {toasts.map(t => (
        <div
          key={t.id}
          className={`flex items-center justify-between gap-3 px-4 py-3 text-sm font-body min-w-[260px] max-w-sm
            pointer-events-auto shadow-lg
            animate-[slideIn_0.2s_ease-out]
            ${t.type === 'success'
              ? 'bg-accent-sage text-bg-primary'
              : 'bg-accent-rose text-white'
            }`}
          style={{ animation: 'slideIn 0.2s ease-out' }}
        >
          <span>{t.message}</span>
          <button onClick={() => removeToast(t.id)} className="shrink-0 opacity-70 hover:opacity-100">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
    </div>
  )
}
