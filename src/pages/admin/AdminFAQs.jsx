import { Pencil, Plus, Trash2 } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import FormInput from '../../components/ui/FormInput'
import Modal from '../../components/ui/Modal'
import TextArea from '../../components/ui/TextArea'
import { useToast } from '../../context/AdminToastContext'
import {
  deleteFaq,
  saveFaq as saveFaqDoc,
  seedFaqs,
  updateFaqFields,
  useFaqs,
} from '../../firebase/collections/faqs'

const blankForm = () => ({
  question: '',
  answer: '',
  isActive: true,
  order: 0,
})

export default function AdminFAQs() {
  const toast = useToast()
  const { rows, loading, error, reload } = useFaqs()

  // Development-only diagnostic logging
  if (import.meta.env.DEV) {
    if (error) {
      console.error('[AdminFAQs] FAQ subscription error:', error.code ?? error.message, error)
    } else if (!loading) {
      console.log('[AdminFAQs] FAQ documents loaded:', rows.length)
    }
  }

  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [deleting, setDeleting] = useState(null)
  const [values, setValues] = useState(blankForm)
  const [saving, setSaving] = useState(false)
  const [seeding, setSeeding] = useState(false)

  const handleSeed = async () => {
    setSeeding(true)
    try {
      const count = await seedFaqs()
      toast(count > 0 ? `Loaded ${count} default FAQs` : 'All default FAQs already exist')
    } catch (err) {
      console.error('[AdminFAQs] Seed failed:', err.code ?? err.message, err)
      toast(err.message ?? 'Could not load default FAQs', 'error')
    } finally {
      setSeeding(false)
    }
  }

  useEffect(() => {
    if (!formOpen) return
    if (editing) {
      setValues({ ...blankForm(), ...editing })
    } else {
      const nextOrder = rows.length > 0 ? Math.max(...rows.map((r) => r.order ?? 0)) + 1 : 0
      setValues({ ...blankForm(), order: nextOrder })
    }
  }, [formOpen, editing, rows])

  const set = (field) => (eventOrValue) => {
    const value =
      eventOrValue?.target !== undefined && eventOrValue?.type !== undefined
        ? eventOrValue.target.value
        : eventOrValue
    setValues((current) => ({ ...current, [field]: value }))
  }

  const save = async () => {
    if (values.question.trim().length < 5 || values.answer.trim().length < 10) {
      toast('Question and answer are required', 'info')
      return
    }

    const next = {
      ...values,
      question: values.question.trim(),
      answer: values.answer.trim(),
      order: Number(values.order) || 0,
    }

    setSaving(true)
    try {
      await saveFaqDoc(next, editing ?? null)
      toast(editing ? 'FAQ saved' : 'FAQ added')
      setFormOpen(false)
    } catch (err) {
      toast(err.message ?? 'Could not save the FAQ', 'error')
    } finally {
      setSaving(false)
    }
  }

  const toggleActive = (faq) => {
    updateFaqFields(faq.id, { isActive: !faq.isActive })
      .then(() => toast(`FAQ ${faq.isActive ? 'deactivated' : 'activated'}`, 'info'))
      .catch((err) => toast(err.message ?? 'Could not update the FAQ', 'error'))
  }

  const removeFaq = async () => {
    const target = deleting
    try {
      await deleteFaq(target.id)
      toast('FAQ deleted', 'info')
    } catch (err) {
      toast(err.message ?? 'Could not delete the FAQ', 'error')
    } finally {
      setDeleting(null)
    }
  }

  const activeCount = useMemo(() => rows.filter((r) => r.isActive).length, [rows])

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm font-semibold text-navy-500">
          <span className="font-extrabold text-navy-900">{activeCount}</span>{' '}
          active of {rows.length} total
        </p>
        <Button
          variant="primary"
          size="sm"
          icon={Plus}
          onClick={() => {
            setEditing(null)
            setFormOpen(true)
          }}
        >
          Add FAQ
        </Button>
      </div>

      {loading ? (
        <TablePlaceholder />
      ) : error ? (
        <ErrorPanel onRetry={reload} />
      ) : rows.length === 0 ? (
        <EmptyList onSeed={handleSeed} seeding={seeding} />
      ) : (
        <ul className="space-y-px overflow-hidden rounded-3xl bg-sand-200 ring-1 ring-inset ring-sand-200">
          {rows.map((faq) => (
            <li
              key={faq.id}
              className="flex flex-wrap items-start gap-x-5 gap-y-3 bg-white px-4 py-4 transition-colors hover:bg-sand-50/70 sm:px-6"
            >
              {/* Order badge */}
              <span className="grid size-10 shrink-0 place-content-center rounded-xl bg-navy-100 text-xs font-bold text-navy-700 tabular-nums">
                {String(faq.order ?? 0).padStart(2, '0')}
              </span>

              {/* Question + answer preview */}
              <div className="min-w-0 flex-1 basis-64">
                <p className="truncate text-sm font-bold text-navy-900">{faq.question}</p>
                <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-navy-400">
                  {faq.answer}
                </p>
              </div>

              {/* Status toggle */}
              <button
                type="button"
                onClick={() => toggleActive(faq)}
                className="cursor-pointer"
                title={`Click to ${faq.isActive ? 'deactivate' : 'activate'}`}
              >
                <Badge status={faq.isActive ? 'Active' : 'Inactive'} dot />
              </button>

              {/* Actions */}
              <span className="inline-flex gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    setEditing(faq)
                    setFormOpen(true)
                  }}
                  aria-label={`Edit FAQ: ${faq.question}`}
                  className="grid size-9 cursor-pointer place-content-center rounded-xl text-navy-400 transition-colors hover:bg-sand-100 hover:text-navy-900"
                >
                  <Pencil size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => setDeleting(faq)}
                  aria-label={`Delete FAQ: ${faq.question}`}
                  className="grid size-9 cursor-pointer place-content-center rounded-xl text-navy-400 transition-colors hover:bg-crimson-50 hover:text-crimson-600"
                >
                  <Trash2 size={16} />
                </button>
              </span>
            </li>
          ))}
        </ul>
      )}

      {/* Add / edit modal */}
      <Modal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        size="lg"
        title={editing ? 'Edit FAQ' : 'Add a new FAQ'}
        description="FAQs appear on the Home page below the Final CTA section."
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setFormOpen(false)} disabled={saving}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={save} loading={saving} disabled={saving}>
              {saving ? 'Saving…' : editing ? 'Save changes' : 'Add FAQ'}
            </Button>
          </>
        }
      >
        <div className="space-y-5">
          <FormInput
            id="faq-question"
            label="Question"
            required
            value={values.question}
            onChange={set('question')}
            placeholder="e.g. Why choose Avengers Holidays for your trip?"
          />

          <TextArea
            id="faq-answer"
            label="Answer"
            required
            value={values.answer}
            onChange={set('answer')}
            rows={5}
            placeholder="Provide a clear, helpful answer…"
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <FormInput
              id="faq-order"
              type="number"
              label="Display order"
              value={values.order}
              onChange={set('order')}
              min={0}
            />

            <label className="flex items-end gap-2.5 pb-1 text-sm font-semibold text-navy-800">
              <input
                type="checkbox"
                checked={Boolean(values.isActive)}
                onChange={(e) => set('isActive')(e.target.checked)}
                className="size-4 accent-crimson-600"
              />
              Active — visible on the website
            </label>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={Boolean(deleting)}
        onCancel={() => setDeleting(null)}
        onConfirm={removeFaq}
        title="Delete this FAQ?"
        message="This permanently removes the FAQ from the admin ledger and the public site."
      />
    </div>
  )
}

function TablePlaceholder() {
  return (
    <div className="space-y-px overflow-hidden rounded-3xl bg-sand-200 ring-1 ring-inset ring-sand-200" aria-hidden="true">
      {Array.from({ length: 5 }, (_, row) => (
        <div key={row} className="flex items-center gap-5 bg-white px-6 py-4">
          <div className="skeleton size-10 rounded-xl" />
          <div className="skeleton h-4 w-64" />
          <div className="skeleton ml-auto h-6 w-16 rounded-full" />
        </div>
      ))}
    </div>
  )
}

function ErrorPanel({ onRetry }) {
  return (
    <div role="alert" className="rounded-3xl border border-crimson-200 bg-crimson-50 px-6 py-16 text-center">
      <p className="font-display text-lg font-extrabold text-navy-900">Could not load FAQs</p>
      <p className="mt-2 text-sm text-navy-600">Something went wrong while fetching the FAQ list.</p>
      <div className="mt-6">
        <Button variant="outline" size="sm" onClick={onRetry}>
          Try again
        </Button>
      </div>
    </div>
  )
}

function EmptyList({ onSeed, seeding }) {
  return (
    <div className="rounded-3xl border border-dashed border-sand-300 bg-sand-50 px-6 py-16 text-center">
      <p className="font-display text-lg font-extrabold text-navy-900">No FAQs yet</p>
      <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-navy-500">
        Add frequently asked questions that will appear on the Home page, or load the default set.
      </p>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <Button variant="primary" size="sm" icon={Plus} onClick={onSeed} loading={seeding} disabled={seeding}>
          {seeding ? 'Loading…' : 'Load default FAQs'}
        </Button>
      </div>
    </div>
  )
}
