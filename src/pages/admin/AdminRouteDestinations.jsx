import { ImagePlus, Pencil, Plus, Trash2 } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import FormInput from '../../components/ui/FormInput'
import ImagePickerModal from '../../components/admin/ImagePickerModal'
import Modal from '../../components/ui/Modal'
import SmartImage from '../../components/ui/SmartImage'
import TextArea from '../../components/ui/TextArea'
import { useToast } from '../../context/AdminToastContext'
import {
  deleteRouteDestination,
  saveRouteDestination as saveRouteDoc,
  seedRouteDestinations,
  updateRouteDestinationFields,
  useRouteDestinations,
} from '../../firebase/collections/routeDestinations'

const blankForm = () => ({
  name: '',
  state: '',
  image: '',
  duration: '',
  price: '',
  description: '',
  slug: '',
  routeProgress: 0,
  isActive: true,
  order: 0,
})

export default function AdminRouteDestinations() {
  const toast = useToast()
  const { rows, loading, error, reload } = useRouteDestinations()

  if (import.meta.env.DEV) {
    if (error) {
      console.error('[AdminRouteDestinations] subscription error:', error.code ?? error.message, error)
    } else if (!loading) {
      console.log('[AdminRouteDestinations] documents loaded:', rows.length)
    }
  }

  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [deleting, setDeleting] = useState(null)
  const [values, setValues] = useState(blankForm)
  const [saving, setSaving] = useState(false)
  const [seeding, setSeeding] = useState(false)
  const [pickerField, setPickerField] = useState(null)

  const handleSeed = async () => {
    setSeeding(true)
    try {
      const count = await seedRouteDestinations()
      toast(count > 0 ? `Loaded ${count} default stops` : 'All default stops already exist')
    } catch (err) {
      console.error('[AdminRouteDestinations] Seed failed:', err.code ?? err.message, err)
      toast(err.message ?? 'Could not load default stops', 'error')
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
    if (values.name.trim().length < 2) {
      toast('Destination name is required', 'info')
      return
    }

    const next = {
      ...values,
      name: values.name.trim(),
      state: values.state.trim(),
      duration: values.duration.trim(),
      price: values.price.trim(),
      description: values.description.trim(),
      slug: values.slug.trim(),
      routeProgress: Number(values.routeProgress) || 0,
      order: Number(values.order) || 0,
    }

    setSaving(true)
    try {
      await saveRouteDoc(next, editing ?? null)
      toast(editing ? 'Stop saved' : 'Stop added')
      setFormOpen(false)
    } catch (err) {
      toast(err.message ?? 'Could not save the stop', 'error')
    } finally {
      setSaving(false)
    }
  }

  const toggleActive = (stop) => {
    updateRouteDestinationFields(stop.id, { isActive: !stop.isActive })
      .then(() => toast(`Stop ${stop.isActive ? 'deactivated' : 'activated'}`, 'info'))
      .catch((err) => toast(err.message ?? 'Could not update the stop', 'error'))
  }

  const removeStop = async () => {
    const target = deleting
    try {
      await deleteRouteDestination(target.id)
      toast('Stop deleted', 'info')
    } catch (err) {
      toast(err.message ?? 'Could not delete the stop', 'error')
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
          Add Stop
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
          {rows.map((stop) => (
            <li
              key={stop.id}
              className="flex flex-wrap items-start gap-x-5 gap-y-3 bg-white px-4 py-4 transition-colors hover:bg-sand-50/70 sm:px-6"
            >
              {/* Thumbnail + order */}
              <span className="flex items-center gap-2">
                <span className="grid size-10 shrink-0 place-content-center overflow-hidden rounded-xl bg-navy-100 text-xs font-bold text-navy-700 tabular-nums">
                  {stop.image ? (
                    <SmartImage
                      src={typeof stop.image === 'string' && !stop.image.startsWith('http') && !stop.image.startsWith('/') ? undefined : stop.image}
                      alt={stop.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    String(stop.order ?? 0).padStart(2, '0')
                  )}
                </span>
                <span className="hidden text-[0.5625rem] text-navy-400 sm:inline">
                  #{stop.order ?? 0}
                </span>
              </span>

              {/* Name + state + description */}
              <div className="min-w-0 flex-1 basis-64">
                <p className="truncate text-sm font-bold text-navy-900">{stop.name}</p>
                <p className="mt-0.5 text-xs text-navy-400">{stop.state}</p>
                {stop.description && (
                  <p className="mt-1 line-clamp-1 text-xs leading-relaxed text-navy-400">
                    {stop.description}
                  </p>
                )}
              </div>

              {/* Duration + price */}
              <div className="hidden shrink-0 flex-col items-end text-right sm:flex">
                <span className="text-xs text-navy-500">{stop.duration}</span>
                <span className="text-xs font-bold text-brand-600">{stop.price}</span>
              </div>

              {/* Status toggle */}
              <button
                type="button"
                onClick={() => toggleActive(stop)}
                className="cursor-pointer"
                title={`Click to ${stop.isActive ? 'deactivate' : 'activate'}`}
              >
                <Badge status={stop.isActive ? 'Active' : 'Inactive'} dot />
              </button>

              {/* Actions */}
              <span className="inline-flex gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    setEditing(stop)
                    setFormOpen(true)
                  }}
                  aria-label={`Edit ${stop.name}`}
                  className="grid size-9 cursor-pointer place-content-center rounded-xl text-navy-400 transition-colors hover:bg-sand-100 hover:text-navy-900"
                >
                  <Pencil size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => setDeleting(stop)}
                  aria-label={`Delete ${stop.name}`}
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
        title={editing ? 'Edit Route Stop' : 'Add a route stop'}
        description="Stops appear on the South India by Road journey section on the Home page."
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setFormOpen(false)} disabled={saving}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={save} loading={saving} disabled={saving}>
              {saving ? 'Saving…' : editing ? 'Save changes' : 'Add Stop'}
            </Button>
          </>
        }
      >
        <div className="space-y-5">
          {/* Image picker */}
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-navy-800">Image</label>
            <button
              type="button"
              onClick={() => setPickerField('image')}
              className="group flex h-28 w-full items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-sand-300 bg-sand-50 transition-colors hover:border-brand-400 hover:bg-brand-50/30"
            >
              {values.image ? (
                <SmartImage
                  src={typeof values.image === 'string' && !values.image.startsWith('http') && !values.image.startsWith('/') ? undefined : values.image}
                  alt="Selected"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex flex-col items-center gap-1.5 text-navy-400 group-hover:text-brand-600">
                  <ImagePlus size={24} />
                  <span className="text-xs font-semibold">Pick an image</span>
                </div>
              )}
            </button>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <FormInput
              id="stop-name"
              label="Destination name"
              required
              value={values.name}
              onChange={set('name')}
              placeholder="e.g. Ooty"
            />
            <FormInput
              id="stop-state"
              label="State / UT"
              value={values.state}
              onChange={set('state')}
              placeholder="e.g. Tamil Nadu"
            />
          </div>

          <TextArea
            id="stop-description"
            label="Short description"
            value={values.description}
            onChange={set('description')}
            rows={2}
            placeholder="One-line description visible on the journey card…"
          />

          <div className="grid gap-4 sm:grid-cols-3">
            <FormInput
              id="stop-duration"
              label="Duration"
              value={values.duration}
              onChange={set('duration')}
              placeholder="e.g. 2N / 3D"
            />
            <FormInput
              id="stop-price"
              label="Price"
              value={values.price}
              onChange={set('price')}
              placeholder="e.g. ₹9,500"
            />
            <FormInput
              id="stop-slug"
              label="Slug (link target)"
              value={values.slug}
              onChange={set('slug')}
              placeholder="e.g. ooty"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <FormInput
              id="stop-order"
              type="number"
              label="Display order"
              value={values.order}
              onChange={set('order')}
              min={0}
            />
            <FormInput
              id="stop-route-progress"
              type="number"
              label="Route progress %"
              value={values.routeProgress}
              onChange={set('routeProgress')}
              min={0}
              max={100}
              hint="0 = start, 100 = end. Evenly spread by default."
            />
            <label className="flex items-end gap-2.5 pb-1 text-sm font-semibold text-navy-800">
              <input
                type="checkbox"
                checked={Boolean(values.isActive)}
                onChange={(e) => set('isActive')(e.target.checked)}
                className="size-4 accent-crimson-600"
              />
              Active — visible on the site
            </label>
          </div>
        </div>
      </Modal>

      <ImagePickerModal
        open={Boolean(pickerField)}
        onClose={() => setPickerField(null)}
        title="Pick a destination image"
        folder="route-destinations"
        entityId={editing?.id ?? null}
        onSelect={(url) => set(pickerField)(url)}
      />

      <ConfirmDialog
        open={Boolean(deleting)}
        onCancel={() => setDeleting(null)}
        onConfirm={removeStop}
        title={`Delete ${deleting?.name ?? 'this stop'}?`}
        message="This permanently removes the stop from the South India by Road journey section."
      />
    </div>
  )
}

function TablePlaceholder() {
  return (
    <div className="space-y-px overflow-hidden rounded-3xl bg-sand-200 ring-1 ring-inset ring-sand-200" aria-hidden="true">
      {Array.from({ length: 6 }, (_, row) => (
        <div key={row} className="flex items-center gap-5 bg-white px-6 py-4">
          <div className="skeleton size-10 rounded-xl" />
          <div className="skeleton h-4 w-48" />
          <div className="skeleton ml-auto h-6 w-16 rounded-full" />
        </div>
      ))}
    </div>
  )
}

function ErrorPanel({ onRetry }) {
  return (
    <div role="alert" className="rounded-3xl border border-crimson-200 bg-crimson-50 px-6 py-16 text-center">
      <p className="font-display text-lg font-extrabold text-navy-900">Could not load route stops</p>
      <p className="mt-2 text-sm text-navy-600">Something went wrong while fetching the stop list.</p>
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
      <p className="font-display text-lg font-extrabold text-navy-900">No route stops yet</p>
      <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-navy-500">
        Add destination stops for the South India by Road journey, or load the default set.
      </p>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <Button variant="primary" size="sm" icon={Plus} onClick={onSeed} loading={seeding} disabled={seeding}>
          {seeding ? 'Loading…' : 'Load default stops'}
        </Button>
      </div>
    </div>
  )
}
