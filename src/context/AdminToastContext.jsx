import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react'
import { CircleAlert, CircleCheck, Info, X } from 'lucide-react'

/**
 * Minimal toast system for admin CRUD feedback.
 * Phase 2 keeps this as-is — toasts are presentation, not data. The `error`
 * tone surfaces Firestore/Auth failures alongside the existing success/info.
 */
const AdminToastContext = createContext(null)

const TONES = {
  success: 'border-l-emerald-500',
  info: 'border-l-navy-500',
  error: 'border-l-crimson-600',
}

const ICONS = {
  success: CircleCheck,
  info: Info,
  error: CircleAlert,
}

export function AdminToastProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const counter = useRef(0)

  const dismiss = useCallback((id) => {
    setToasts((current) => current.filter((toast) => toast.id !== id))
  }, [])

  const toast = useCallback(
    (message, tone = 'success') => {
      counter.current += 1
      const id = counter.current
      setToasts((current) => [...current.slice(-3), { id, message, tone }])
      setTimeout(() => dismiss(id), 3600)
    },
    [dismiss],
  )

  const value = useMemo(() => ({ toast }), [toast])

  return (
    <AdminToastContext.Provider value={value}>
      {children}

      {/* Toast stack */}
      <div
        aria-live="polite"
        className="no-print pointer-events-none fixed right-4 bottom-4 z-200 flex w-full max-w-sm flex-col gap-2.5 sm:right-6 sm:bottom-6"
      >
        {toasts.map(({ id, message, tone }) => {
          const Icon = ICONS[tone] ?? Info
          return (
            <div
              key={id}
              className={`pointer-events-auto flex items-center gap-3 rounded-2xl border border-sand-200 border-l-4 bg-white py-3 pr-2 pl-4 shadow-lift animate-slide-down ${
                TONES[tone] ?? TONES.info
              }`}
            >
              <Icon size={17} strokeWidth={2.1} className="shrink-0 text-navy-700" aria-hidden="true" />
              <p className="flex-1 text-sm font-semibold text-navy-900">{message}</p>
              <button
                type="button"
                onClick={() => dismiss(id)}
                aria-label="Dismiss notification"
                className="grid size-8 shrink-0 cursor-pointer place-content-center rounded-full text-navy-400 transition-colors hover:bg-sand-100 hover:text-navy-900"
              >
                <X size={15} />
              </button>
            </div>
          )
        })}
      </div>
    </AdminToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(AdminToastContext)
  if (!context) throw new Error('useToast must be used inside <AdminToastProvider>')
  return context.toast
}
