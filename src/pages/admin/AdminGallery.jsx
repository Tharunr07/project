import { CalendarDays, Images, MapPin, Plus, Trash2 } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import ImagePickerModal from '../../components/admin/ImagePickerModal'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import FormInput from '../../components/ui/FormInput'
import Modal from '../../components/ui/Modal'
import SelectInput from '../../components/ui/SelectInput'
import SmartImage from '../../components/ui/SmartImage'
import { useToast } from '../../context/AdminToastContext'
import { GALLERY_CATEGORIES } from '../../data/constants'
import { addGalleryItem, deleteGalleryItem, useGallery } from '../../firebase/collections/gallery'
import { useDestinations } from '../../firebase/collections/destinations'

export default function AdminGallery() {
  const toast = useToast()
  const { rows, loading, error, reload } = useGallery()
  const { data: destinationRows } = useDestinations()

  const [category, setCategory] = useState('All')
  const [deleting, setDeleting] = useState(null)
  const [addOpen, setAddOpen] = useState(false)
  const [pickerOpen, setPickerOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [draft, setDraft] = useState(blankDraft())

  function blankDraft() {
    return {
      src: '',
      storagePath: null,
      title: '',
      category: 'Destinations',
      destination: '',
      date: new Date().toISOString().slice(0, 10),
    }
  }

  useEffect(() => {
    if (addOpen) setDraft(blankDraft())
  }, [addOpen])

  const options = useMemo(
    () => [
      { value: 'All', label: 'All', count: rows.length },
      ...GALLERY_CATEGORIES.filter((name) => rows.some((item) => item.category === name)).map(
        (name) => ({
          value: name,
          label: name,
          count: rows.filter((item) => item.category === name).length,
        }),
      ),
    ],
    [rows],
  )

  const visible = useMemo(
    () => rows.filter((item) => category === 'All' || item.category === category),
    [rows, category],
  )

  /** Persist to Firestore — the live subscription refreshes the grid. */
  const addImage = async () => {
    if (!draft.src || !draft.title.trim() || saving) return
    setSaving(true)
    try {
      await addGalleryItem({
        src: draft.src,
        storagePath: draft.storagePath ?? null,
        title: draft.title.trim(),
        category: draft.category,
        destination: draft.destination || '—',
        date: draft.date,
        published: true,
      })
      toast(`Photo added to ${draft.category}`)
      setAddOpen(false)
    } catch (err) {
      toast(err.message ?? 'Could not save the photo', 'error')
    } finally {
      setSaving(false)
    }
  }

  /** Removes the Firestore doc; the service also deletes the uploaded file. */
  const removeImage = async () => {
    const target = deleting
    try {
      await deleteGalleryItem(target)
      toast('Photo removed', 'info')
    } catch (err) {
      toast(err.message ?? 'Could not remove the photo', 'error')
    } finally {
      setDeleting(null)
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm font-semibold text-navy-500">
          <span className="font-extrabold text-navy-900">{visible.length}</span> of {rows.length}{' '}
          photos · shown on the public gallery
        </p>
        <Button variant="primary" size="sm" icon={Plus} onClick={() => setAddOpen(true)}>
          Add Image
        </Button>
      </div>

      {/* Category tabs */}
      <div className="rounded-3xl bg-white p-4 shadow-card sm:p-5">
        <div className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1 py-1">
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              aria-pressed={category === option.value}
              onClick={() => setCategory(option.value)}
              className={`inline-flex shrink-0 cursor-pointer items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold transition-all ${
                category === option.value
                  ? 'bg-navy-900 text-white shadow-card'
                  : 'bg-sand-100 text-navy-600 hover:bg-sand-200 hover:text-navy-900'
              }`}
            >
              {option.label}
              <span
                className={`rounded-full px-1.5 py-0.5 text-[0.625rem] font-bold ${
                  category === option.value ? 'bg-white/15 text-white' : 'bg-white text-navy-500'
                }`}
              >
                {option.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Grid / states */}
      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }, (_, index) => (
            <div key={index} className="skeleton aspect-4/3 rounded-3xl" />
          ))}
        </div>
      ) : error ? (
        <ErrorPanel onRetry={reload} />
      ) : visible.length === 0 ? (
        <EmptyGrid onAdd={() => setAddOpen(true)} />
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {visible.map((item) => (
            <li key={item.id}>
              <article className="group overflow-hidden rounded-3xl bg-white shadow-card ring-1 ring-inset ring-sand-200 transition-shadow hover:shadow-lift">
                <div className="relative">
                  <SmartImage src={item.src} alt={item.title} ratio="aspect-4/3" />
                  <button
                    type="button"
                    onClick={() => setDeleting(item)}
                    aria-label={`Delete ${item.title}`}
                    className="absolute top-3 right-3 grid size-9 cursor-pointer place-content-center rounded-full bg-white/90 text-crimson-600 opacity-0 backdrop-blur transition-opacity group-hover:opacity-100 focus-visible:opacity-100"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
                <div className="space-y-2 p-4">
                  <p className="truncate text-sm font-bold text-navy-900" title={item.title}>
                    {item.title}
                  </p>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[0.6875rem] font-semibold text-navy-400">
                    <Badge tone="navy" size="xs">{item.category}</Badge>
                    <span className="inline-flex items-center gap-1">
                      <MapPin size={11} aria-hidden="true" />
                      {item.destination}
                    </span>
                    <span className="inline-flex items-center gap-1 tabular-nums">
                      <CalendarDays size={11} aria-hidden="true" />
                      {item.date}
                    </span>
                  </div>
                </div>
              </article>
            </li>
          ))}
        </ul>
      )}

      {/* Add-image modal */}
      <Modal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        size="lg"
        title="Add a gallery image"
        description="Upload to Firebase Storage, pick a previously uploaded photo, or paste any image URL."
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setAddOpen(false)} disabled={saving}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" disabled={!draft.src || !draft.title.trim()} loading={saving} onClick={addImage}>
              {saving ? 'Saving…' : 'Add to gallery'}
            </Button>
          </>
        }
      >
        <div className="space-y-5">
          {draft.src ? (
            <SmartImage src={draft.src} alt="" ratio="aspect-16/9" className="rounded-2xl shadow-card" />
          ) : (
            <button
              type="button"
              onClick={() => setPickerOpen(true)}
              className="grid h-44 w-full cursor-pointer place-content-center gap-2 rounded-2xl border-2 border-dashed border-sand-300 bg-sand-50 text-navy-400 transition-colors hover:border-crimson-300 hover:text-crimson-500"
            >
              <Images size={26} aria-hidden="true" />
              <span className="text-sm font-semibold">Choose an image</span>
            </button>
          )}

          {draft.src && (
            <Button variant="outline" size="xs" icon={Images} onClick={() => setPickerOpen(true)}>
              Change image
            </Button>
          )}

          <FormInput
            id="gal-title"
            label="Caption"
            required
            value={draft.title}
            onChange={(event) => setDraft({ ...draft, title: event.target.value })}
            placeholder="e.g. Chembra Peak trek — CIT batch of 2026"
          />

          <div className="grid gap-4 sm:grid-cols-3">
            <SelectInput
              id="gal-category"
              label="Category"
              required
              value={draft.category}
              onChange={(event) => setDraft({ ...draft, category: event.target.value })}
              options={GALLERY_CATEGORIES}
            />
            <SelectInput
              id="gal-destination"
              label="Destination"
              value={draft.destination}
              onChange={(event) => setDraft({ ...draft, destination: event.target.value })}
              options={(destinationRows ?? []).map((destination) => destination.name)}
              placeholder="Optional tag"
            />
            <FormInput
              id="gal-date"
              type="date"
              label="Taken on"
              value={draft.date}
              onChange={(event) => setDraft({ ...draft, date: event.target.value })}
            />
          </div>
        </div>
      </Modal>

      <ImagePickerModal
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        folder="gallery"
        onSelect={(url, meta) =>
          setDraft((current) => ({ ...current, src: url, storagePath: meta?.storagePath ?? null }))
        }
      />

      <ConfirmDialog
        open={Boolean(deleting)}
        onCancel={() => setDeleting(null)}
        onConfirm={removeImage}
        title="Remove this photo?"
        message={deleting?.title ? `"${deleting.title}" will disappear from the public gallery.` : undefined}
      />
    </div>
  )
}

function ErrorPanel({ onRetry }) {
  return (
    <div role="alert" className="rounded-3xl border border-crimson-200 bg-crimson-50 px-6 py-16 text-center">
      <p className="font-display text-lg font-extrabold text-navy-900">Could not load the gallery</p>
      <p className="mt-2 text-sm text-navy-600">Something went wrong while fetching photos.</p>
      <div className="mt-6">
        <Button variant="outline" size="sm" onClick={onRetry}>
          Try again
        </Button>
      </div>
    </div>
  )
}

function EmptyGrid({ onAdd }) {
  return (
    <div className="rounded-3xl border border-dashed border-sand-300 bg-sand-50 px-6 py-16 text-center">
      <p className="font-display text-lg font-extrabold text-navy-900">No photos in this category</p>
      <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-navy-500">
        Add trip albums after every season so the customer gallery stays fresh.
      </p>
      <div className="mt-6">
        <Button variant="primary" size="sm" icon={Plus} onClick={onAdd}>
          Add Image
        </Button>
      </div>
    </div>
  )
}
