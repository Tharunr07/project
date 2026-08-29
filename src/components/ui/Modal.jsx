import { X } from 'lucide-react'
import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { useEscapeKey, useScrollLock } from '../../hooks'

const SIZES = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
  full: 'max-w-6xl',
}

/**
 * Portal dialog with backdrop, Escape handling, scroll lock and focus capture.
 * Every overlay in the app — enquiry success, admin forms, delete confirmation,
 * bill preview, gallery lightbox — is built on this.
 */
export default function Modal({
  open,
  onClose,
  title,
  description,
  size = 'md',
  footer,
  bare = false,
  className = '',
  children,
}) {
  const panelRef = useRef(null)

  useScrollLock(open)
  useEscapeKey(() => onClose?.(), open)

  // Move focus into the dialog so keyboard users are not left behind the backdrop.
  useEffect(() => {
    if (!open) return
    const timer = setTimeout(() => {
      const panel = panelRef.current
      if (!panel) return
      const focusable = panel.querySelector(
        'input, select, textarea, button:not([data-modal-close]), a[href]',
      )
      ;(focusable ?? panel).focus?.()
    }, 40)
    return () => clearTimeout(timer)
  }, [open])

  if (!open) return null

  return createPortal(
    <div className="fixed inset-0 z-100 flex items-end justify-center p-0 sm:items-center sm:p-6">
      <button
        type="button"
        aria-label="Close dialog"
        data-modal-close
        onClick={onClose}
        className="absolute inset-0 cursor-default bg-navy-950/65 backdrop-blur-sm animate-fade-in"
      />

      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={typeof title === 'string' ? title : undefined}
        tabIndex={-1}
        className={`relative z-10 flex max-h-[92vh] w-full flex-col overflow-hidden rounded-t-4xl bg-white shadow-lift outline-none animate-scale-in sm:rounded-3xl ${
          SIZES[size] ?? SIZES.md
        } ${className}`}
      >
        {bare ? (
          children
        ) : (
          <>
            {(title || description) && (
              <header className="flex items-start justify-between gap-4 border-b border-sand-200 px-6 py-5 sm:px-7">
                <div className="min-w-0">
                  {title && <h2 className="truncate text-xl text-navy-900">{title}</h2>}
                  {description && (
                    <p className="mt-1.5 text-sm leading-relaxed text-navy-500">{description}</p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Close"
                  className="-mr-1.5 -mt-1 grid size-9 shrink-0 place-content-center rounded-full text-navy-400 transition-colors hover:bg-sand-100 hover:text-navy-900"
                >
                  <X size={19} />
                </button>
              </header>
            )}

            <div className="min-h-0 flex-1 overflow-y-auto px-6 py-6 sm:px-7">{children}</div>

            {footer && (
              <footer className="flex flex-wrap items-center justify-end gap-3 border-t border-sand-200 bg-sand-50 px-6 py-4 sm:px-7">
                {footer}
              </footer>
            )}
          </>
        )}
      </div>
    </div>,
    document.body,
  )
}
