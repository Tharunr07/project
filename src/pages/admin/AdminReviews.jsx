import { Pencil, Plus, Star, Trash2 } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import ImagePickerModal from '../../components/admin/ImagePickerModal'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import FormInput from '../../components/ui/FormInput'
import Modal from '../../components/ui/Modal'
import Rating from '../../components/ui/Rating'
import SearchInput from '../../components/ui/SearchInput'
import SelectInput from '../../components/ui/SelectInput'
import TextArea from '../../components/ui/TextArea'
import { useToast } from '../../context/AdminToastContext'
import { GROUP_TYPES } from '../../data/constants'
import {
  deleteReview,
  saveReview as saveReviewDoc,
  updateReviewFields,
  useReviews,
} from '../../firebase/collections/reviews'
import { usePackages } from '../../firebase/collections/packages'
import { formatDate } from '../../utils/format'

const blankForm = () => ({
  name: '',
  hometown: '',
  rating: 5,
  trip: '',
  destination: '',
  groupType: 'Family',
  date: new Date().toISOString().slice(0, 10),
  avatar: '',
  avatarStoragePath: null,
  review: '',
  published: true,
  featured: false,
})

export default function AdminReviews() {
  const toast = useToast()
  const { rows, loading, error, reload } = useReviews()
  const { data: packageRows } = usePackages()

  const [query, setQuery] = useState('')
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [deleting, setDeleting] = useState(null)
  const [values, setValues] = useState(blankForm)
  const [pickerOpen, setPickerOpen] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!formOpen) return
    if (editing) {
      setValues({ ...blankForm(), ...editing, avatarStoragePath: editing.storagePath ?? null })
    } else {
      setValues(blankForm())
    }
  }, [formOpen, editing])

  const visible = useMemo(() => {
    const term = query.trim().toLowerCase()
    if (!term) return rows
    return rows.filter((review) =>
      [review.name, review.hometown, review.trip, review.destination]
        .join(' ')
        .toLowerCase()
        .includes(term),
    )
  }, [rows, query])

  const set = (field) => (eventOrValue) => {
    const value =
      eventOrValue?.target !== undefined && eventOrValue?.type !== undefined
        ? eventOrValue.target.value
        : eventOrValue
    setValues((current) => ({ ...current, [field]: value }))
  }

  /** Persist to Firestore — the live subscription refreshes the list. */
  const save = async () => {
    if (values.name.trim().length < 3 || values.review.trim().length < 20 || !values.trip) {
      toast('Name, trip and a review of at least 20 characters are required', 'info')
      return
    }

    const next = {
      ...values,
      name: values.name.trim(),
      hometown: values.hometown.trim(),
      trip: values.trip,
      review: values.review.trim(),
    }
    // Destination follows the chosen package automatically.
    next.destination =
      (packageRows ?? []).find((pkg) => pkg.name === next.trip)?.destination ?? next.destination
    // storagePath is the doc field; the form tracks it as avatarStoragePath.
    next.storagePath = values.avatarStoragePath ?? null

    setSaving(true)
    try {
      await saveReviewDoc(next, editing ?? null)
      toast(editing ? 'Review saved' : 'Review added')
      setFormOpen(false)
    } catch (err) {
      toast(err.message ?? 'Could not save the review', 'error')
    } finally {
      setSaving(false)
    }
  }

  const toggleField = (review, field) => {
    updateReviewFields(review.id, { [field]: !review[field] })
      .then(() =>
        toast(`Review by ${review.name} ${review[field] ? 'un-' : ''}${field === 'published' ? 'published' : 'featured'}`, 'info'),
      )
      .catch((err) => toast(err.message ?? 'Could not update the review', 'error'))
  }

  /** Deletes the Firestore doc; the service also removes the uploaded photo. */
  const removeReview = async () => {
    const target = deleting
    try {
      await deleteReview(target)
      toast(`Review by ${target.name} deleted`, 'info')
    } catch (err) {
      toast(err.message ?? 'Could not delete the review', 'error')
    } finally {
      setDeleting(null)
    }
  }

  const tripChoices = (packageRows ?? []).map((pkg) => ({
    value: pkg.name,
    label: `${pkg.name} · ${pkg.destination}`,
  }))

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm font-semibold text-navy-500">
          <span className="font-extrabold text-navy-900">{rows.filter((r) => r.published).length}</span>{' '}
          published of {rows.length} total
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
          Add Review
        </Button>
      </div>

      <div className="rounded-3xl bg-white p-4 shadow-card sm:p-5">
        <SearchInput
          value={query}
          onChange={setQuery}
          placeholder="Search by reviewer, hometown or trip…"
          label="Search reviews"
        />
      </div>

      {/* List */}
      {loading ? (
        <TablePlaceholder />
      ) : error ? (
        <ErrorPanel onRetry={reload} />
      ) : visible.length === 0 ? (
        <EmptyList hasQuery={query.trim() !== ''} onClear={() => setQuery('')} />
      ) : (
        <ul className="space-y-px overflow-hidden rounded-3xl bg-sand-200 ring-1 ring-inset ring-sand-200">
          {visible.map((review) => (
            <li key={review.id} className="flex flex-wrap items-center gap-x-5 gap-y-3 bg-white px-4 py-4 transition-colors hover:bg-sand-50/70 sm:px-6">
              <span
                aria-hidden="true"
                className="grid size-11 shrink-0 place-content-center rounded-full bg-navy-100 text-xs font-bold text-navy-700 uppercase"
              >
                {review.avatar ? (
                  <img src={review.avatar} alt="" className="size-full rounded-full object-cover" loading="lazy" />
                ) : (
                  review.name.split(' ').map((part) => part[0]).slice(0, 2).join('')
                )}
              </span>

              <div className="min-w-40 flex-1 basis-52">
                <p className="truncate text-sm font-bold text-navy-900">{review.name}</p>
                <p className="mt-0.5 truncate text-xs text-navy-400">{review.hometown}</p>
              </div>

              <Rating value={review.rating} size="sm" />

              <div className="hidden min-w-36 flex-1 basis-36 lg:block">
                <p className="truncate text-xs font-bold text-navy-700">{review.trip}</p>
                <p className="mt-0.5 text-[0.6875rem] font-semibold text-navy-400 tabular-nums">
                  {formatDate(review.date)} · {review.groupType}
                </p>
              </div>

              <button type="button" onClick={() => toggleField(review, 'featured')} title="Toggle featured" aria-label="Toggle featured" className="cursor-pointer">
                <Star
                  size={18}
                  strokeWidth={2}
                  className={review.featured ? 'fill-brand-500 text-brand-500' : 'text-navy-300 hover:text-brand-400'}
                />
              </button>

              <button type="button" onClick={() => toggleField(review, 'published')} className="cursor-pointer" title="Toggle publish">
                <Badge status={review.published ? 'Published' : 'Unpublished'} dot />
              </button>

              <span className="inline-flex gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    setEditing(review)
                    setFormOpen(true)
                  }}
                  aria-label={`Edit review by ${review.name}`}
                  className="grid size-9 cursor-pointer place-content-center rounded-xl text-navy-400 transition-colors hover:bg-sand-100 hover:text-navy-900"
                >
                  <Pencil size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => setDeleting(review)}
                  aria-label={`Delete review by ${review.name}`}
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
        title={editing ? `Edit review — ${editing.name}` : 'Add a customer review'}
        description="Only published reviews appear on the website; featured ones enter the home-page carousel."
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setFormOpen(false)} disabled={saving}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={save} loading={saving} disabled={saving}>
              {saving ? 'Saving…' : editing ? 'Save changes' : 'Add review'}
            </Button>
          </>
        }
      >
        <div className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <FormInput id="rev-name" label="Customer name" required value={values.name} onChange={(event) => set('name')(event)} placeholder="e.g. Priya Raghavan" />
            <FormInput id="rev-hometown" label="Hometown" value={values.hometown} onChange={(event) => set('hometown')(event)} placeholder="Coimbatore, Tamil Nadu" />

            <SelectInput
              id="rev-trip"
              label="Trip / package"
              required
              value={values.trip}
              onChange={(event) => set('trip')(event)}
              options={tripChoices}
              placeholder="Which package?"
            />

            <SelectInput
              id="rev-groupType"
              label="Group type"
              value={values.groupType}
              onChange={(event) => set('groupType')(event)}
              options={GROUP_TYPES}
            />

            <FormInput id="rev-date" type="date" label="Review date" value={values.date} onChange={(event) => set('date')(event)} />
          </div>

          <div className="flex items-end justify-between gap-4 rounded-2xl bg-sand-50 p-4 ring-1 ring-inset ring-sand-200">
            <div>
              <p className="mb-2 text-[0.8125rem] font-semibold text-navy-800">Rating</p>
              <Rating value={values.rating} size="lg" interactive onRate={(value) => set('rating')(value)} showValue />
            </div>
            {values.avatar && (
              <img src={values.avatar} alt="" className="size-14 rounded-2xl object-cover shadow-card" />
            )}
            <Button variant="outline" size="xs" icon={Star} onClick={() => setPickerOpen(true)}>
              {values.avatar ? 'Change photo' : 'Customer photo'}
            </Button>
          </div>

          <TextArea
            id="rev-text"
            label="The review"
            required
            value={values.review}
            onChange={(event) => set('review')(event)}
            rows={5}
            maxLength={800}
            placeholder="Paste the customer's words here — publish exactly what they said."
          />

          <div className="flex flex-wrap gap-6">
            {[
              ['published', 'Published — visible on the website'],
              ['featured', 'Featured — home-page carousel'],
            ].map(([field, labelText]) => (
              <label key={field} className="flex cursor-pointer items-center gap-2.5 text-sm font-semibold text-navy-800">
                <input
                  type="checkbox"
                  checked={Boolean(values[field])}
                  onChange={(event) => set(field)(event.target.checked)}
                  className="size-4 accent-crimson-600"
                />
                {labelText}
              </label>
            ))}
          </div>
        </div>
      </Modal>

      <ImagePickerModal
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        folder="reviews"
        entityId={editing?.id ?? null}
        onSelect={(url, meta) => {
          set('avatar')(url)
          setValues((current) => ({ ...current, avatarStoragePath: meta?.storagePath ?? null }))
        }}
      />

      <ConfirmDialog
        open={Boolean(deleting)}
        onCancel={() => setDeleting(null)}
        onConfirm={removeReview}
        title={`Delete review by ${deleting?.name ?? 'customer'}?`}
        message="This permanently removes the review from the admin ledger and the public site."
      />
    </div>
  )
}

function TablePlaceholder() {
  return (
    <div className="space-y-px overflow-hidden rounded-3xl bg-sand-200 ring-1 ring-inset ring-sand-200" aria-hidden="true">
      {Array.from({ length: 7 }, (_, row) => (
        <div key={row} className="flex items-center gap-5 bg-white px-6 py-4">
          <div className="skeleton size-11 rounded-full" />
          <div className="skeleton h-4 w-44" />
          <div className="skeleton ml-auto h-4 w-24" />
          <div className="skeleton h-4 w-32" />
          <div className="skeleton h-6 w-20 rounded-full" />
        </div>
      ))}
    </div>
  )
}

function ErrorPanel({ onRetry }) {
  return (
    <div role="alert" className="rounded-3xl border border-crimson-200 bg-crimson-50 px-6 py-16 text-center">
      <p className="font-display text-lg font-extrabold text-navy-900">Could not load reviews</p>
      <p className="mt-2 text-sm text-navy-600">Something went wrong while fetching the review book.</p>
      <div className="mt-6">
        <Button variant="outline" size="sm" icon={Star} onClick={onRetry}>
          Try again
        </Button>
      </div>
    </div>
  )
}

function EmptyList({ hasQuery, onClear }) {
  return (
    <div className="rounded-3xl border border-dashed border-sand-300 bg-sand-50 px-6 py-16 text-center">
      <p className="font-display text-lg font-extrabold text-navy-900">No reviews found</p>
      <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-navy-500">
        {hasQuery ? 'No reviewers match that search.' : 'Reviews collected after each trip can be added here.'}
      </p>
      {hasQuery && (
        <div className="mt-6">
          <Button variant="outline" size="sm" onClick={onClear}>
            Clear search
          </Button>
        </div>
      )}
    </div>
  )
}
