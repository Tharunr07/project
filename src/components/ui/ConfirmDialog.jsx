import { AlertTriangle } from 'lucide-react'
import Button from './Button'
import Modal from './Modal'

/**
 * Destructive-action confirmation. Used by every delete in the admin portal so
 * nothing is ever removed on a single click.
 */
export default function ConfirmDialog({
  open,
  onCancel,
  onConfirm,
  title = 'Are you sure?',
  message,
  detail,
  confirmLabel = 'Delete',
  cancelLabel = 'Cancel',
  tone = 'danger',
}) {
  return (
    <Modal
      open={open}
      onClose={onCancel}
      size="sm"
      footer={
        <>
          <Button variant="outline" size="sm" onClick={onCancel}>
            {cancelLabel}
          </Button>
          <Button variant={tone} size="sm" onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </>
      }
    >
      <div className="flex gap-4">
        <span
          aria-hidden="true"
          className={`grid size-11 shrink-0 place-content-center rounded-full ${
            tone === 'danger' ? 'bg-crimson-50 text-crimson-600' : 'bg-gold-100 text-gold-600'
          }`}
        >
          <AlertTriangle size={21} />
        </span>
        <div className="min-w-0">
          <h2 className="text-lg text-navy-900">{title}</h2>
          {message && <p className="mt-2 text-sm leading-relaxed text-navy-600">{message}</p>}
          {detail && (
            <p className="mt-3 rounded-xl bg-sand-100 px-3.5 py-2.5 text-[0.8125rem] leading-relaxed text-navy-500">
              {detail}
            </p>
          )}
        </div>
      </div>
    </Modal>
  )
}
