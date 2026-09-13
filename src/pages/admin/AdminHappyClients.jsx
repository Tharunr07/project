import { Pencil, Plus, Trash2 } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import ImagePickerModal from '../../components/admin/ImagePickerModal'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import FormInput from '../../components/ui/FormInput'
import Modal from '../../components/ui/Modal'
import SelectInput from '../../components/ui/SelectInput'
import SmartImage from '../../components/ui/SmartImage'
import TextArea from '../../components/ui/TextArea'
import { useToast } from '../../context/AdminToastContext'
import {
  ORGANIZATION_TYPES,
  deleteHappyClient,
  saveHappyClient as saveHappyClientDoc,
  seedHappyClients,
  updateHappyClientFields,
  useHappyClients,
} from '../../firebase/collections/happyClients'

const blankForm = () => ({
  organizationName: '',
  organizationType: 'College',
  logoUrl: '',
  imageUrl: '',
  review: '',
  destination: '',
  tripType: '',
  location: '',
  displayOrder: 0,
  isFeatured: false,
  isActive: true,
})

export default function AdminHappyClients() {
  const toast = useToast()
  const { rows, loading, error, reload } = useHappyClients()

  if (import.meta.env.DEV) {
    if (error) {
      console.error('[AdminHappyClients] subscription error:', error.code ?? error.message, error)
    } else if (!loading) {
      console.log('[AdminHappyClients] documents loaded:', rows.length)
    }
  }

  const [query, setQuery] = useState('')
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [deleting, setDeleting] = useState(null)
  const [values, setValues] = useState(blankForm)
  const [saving, setSaving] = useState(false)
  const [pickerField, setPickerField] = useState(null)
  const [seeding, setSeeding] = useState(false)

  useEffect(() => {
    if (!formOpen) return
    if (editing) {
      setValues({ ...blankForm(), ...editing })
    } else {
      const nextOrder = rows.length > 0 ? Math.max(...rows.map((r) => r.displayOrder ?? 0)) + 1 : 0
      setValues({ ...blankForm(), displayOrder: nextOrder })
    }
  }, [formOpen, editing, rows])

  const set = (field) => (eventOrValue) => {
    const value =
      eventOrValue?.target !== undefined && eventOrValue?.type !== undefined
        ? eventOrValue.target.value
        : eventOrValue
    setValues((current) => ({ ...current, [field]: value }))
  }

  const visible = useMemo(() => {
    const term = query.trim().toLowerCase()
    if (!term) return rows
    return rows.filter((c) =>
      [c.organizationName, c.destination, c.tripType, c.location]
        .join(' ')
        .toLowerCase()
        .includes(term),
    )
  }, [rows, query])

  const save = async () => {
    if (values.organizationName.trim().length < 2) {
      toast('Organization name is required', 'info')
      return
    }
    if (values.review.trim().length < 5) {
      toast('Review is required', 'info')
      return
    }

    const next = {
      ...values,
      organizationName: values.organizationName.trim(),
      review: values.review.trim(),
      destination: values.destination.trim(),
      tripType: values.tripType.trim(),
      location: values.location.trim(),
      displayOrder: Number(values.displayOrder) || 0,
    }

    setSaving(true)
    try {
      await saveHappyClientDoc(next, editing ?? null)
      toast(editing ? 'Happy Client saved' : 'Happy Client added')
      setFormOpen(false)
    } catch (err) {
      toast(err.message ?? 'Could not save the Happy Client', 'error')
    } finally {
      setSaving(false)
    }
  }

  const toggleActive = (client) => {
    updateHappyClientFields(client.id, { isActive: !client.isActive })
      .then(() => toast(`Happy Client ${client.isActive ? 'deactivated' : 'activated'}`, 'info'))
      .catch((err) => toast(err.message ?? 'Could not update', 'error'))
  }

  const remove = async () => {
    const target = deleting
    try {
      await deleteHappyClient(target.id)
      toast('Happy Client deleted', 'info')
    } catch (err) {
      toast(err.message ?? 'Could not delete the Happy Client', 'error')
    } finally {
      setDeleting(null)
    }
  }

  const activeCount = useMemo(() => rows.filter((r) => r.isActive).length, [rows])

  const handleSeed = async () => {
    setSeeding(true)
    try {
      const count = await seedHappyClients()
      toast(count > 0 ? `Loaded ${count} demo Happy Clients` : 'Demo data already loaded', 'info')
    } catch (err) {
      toast(err.message ?? 'Could not load demo data', 'error')
    } finally {
      setSeeding(false)
    }
  }

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
          Add Happy Client
        </Button>
      </div>

      {rows.length > 0 && (
        <div className="rounded-3xl bg-white p-4 shadow-card sm:p-5">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, destination, type…"
            className="w-full rounded-xl border border-sand-200 bg-sand-50 px-4 py-2.5 text-sm text-navy-800 placeholder:text-navy-300 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-400/20"
          />
        </div>
      )}

      {loading ? (
        <TablePlaceholder />
      ) : error ? (
        <ErrorPanel onRetry={reload} />
      ) : rows.length === 0 ? (
        <EmptyState onSeed={handleSeed} seeding={seeding} />
      ) : (
        <ul className="space-y-px overflow-hidden rounded-3xl bg-sand-200 ring-1 ring-inset ring-sand-200">
          {visible.map((client) => (
            <li
              key={client.id}
              className="flex flex-wrap items-start gap-x-5 gap-y-3 bg-white px-4 py-4 transition-colors hover:bg-sand-50/70 sm:px-6"
            >
              {/* Logo + order */}
              <span className="flex items-center gap-2">
                <span className="grid size-10 shrink-0 place-content-center overflow-hidden rounded-xl bg-navy-100">
                  {client.logoUrl ? (
                    <SmartImage src={client.logoUrl} alt="" className="h-full w-full object-contain p-1" />
                  ) : (
                    <span className="text-[0.5625rem] font-bold text-navy-400">
                      {String(client.displayOrder ?? 0).padStart(2, '0')}
                    </span>
                  )}
                </span>
              </span>

              {/* Name + type + destination */}
              <div className="min-w-0 flex-1 basis-64">
                <p className="truncate text-sm font-bold text-navy-900">{client.organizationName}</p>
                <p className="mt-0.5 text-xs text-navy-400">
                  {client.organizationType}
                  {client.destination && <> · {client.destination}</>}
                  {client.tripType && <> · {client.tripType}</>}
                </p>
              </div>

              {/* Status */}
              <button
                type="button"
                onClick={() => toggleActive(client)}
                className="cursor-pointer"
                title={`Click to ${client.isActive ? 'deactivate' : 'activate'}`}
              >
                <Badge status={client.isActive ? 'Active' : 'Inactive'} dot />
              </button>

              {/* Actions */}
              <span className="inline-flex gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    setEditing(client)
                    setFormOpen(true)
                  }}
                  aria-label={`Edit ${client.organizationName}`}
                  className="grid size-9 cursor-pointer place-content-center rounded-xl text-navy-400 transition-colors hover:bg-sand-100 hover:text-navy-900"
                >
                  <Pencil size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => setDeleting(client)}
                  aria-label={`Delete ${client.organizationName}`}
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
        title={editing ? `Edit — ${editing.organizationName}` : 'Add a Happy Client'}
        description="Happy Clients appear in the Home Page marquee carousel."
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setFormOpen(false)} disabled={saving}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={save} loading={saving} disabled={saving}>
              {saving ? 'Saving…' : editing ? 'Save changes' : 'Add Happy Client'}
            </Button>
          </>
        }
      >
        <div className="space-y-5">
          {/* Images */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-navy-800">Institution Logo</label>
              <button
                type="button"
                onClick={() => setPickerField('logoUrl')}
                className="group flex h-24 w-full items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-sand-300 bg-sand-50 transition-colors hover:border-brand-400 hover:bg-brand-50/30"
              >
                {values.logoUrl ? (
                  <SmartImage src={values.logoUrl} alt="Logo" className="h-full w-full object-contain p-2" />
                ) : (
                  <span className="text-xs font-semibold text-navy-400 group-hover:text-brand-600">Pick logo</span>
                )}
              </button>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-navy-800">Trip Image</label>
              <button
                type="button"
                onClick={() => setPickerField('imageUrl')}
                className="group flex h-24 w-full items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-sand-300 bg-sand-50 transition-colors hover:border-brand-400 hover:bg-brand-50/30"
              >
                {values.imageUrl ? (
                  <SmartImage src={values.imageUrl} alt="Trip" className="h-full w-full object-cover" />
                ) : (
                  <span className="text-xs font-semibold text-navy-400 group-hover:text-brand-600">Pick image</span>
                )}
              </button>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <FormInput
              id="hc-name"
              label="Organization / College Name"
              required
              value={values.organizationName}
              onChange={set('organizationName')}
              placeholder="e.g. Loyola College"
            />
            <SelectInput
              id="hc-type"
              label="Organization Type"
              value={values.organizationType}
              onChange={set('organizationType')}
              options={ORGANIZATION_TYPES.map((t) => ({ value: t, label: t }))}
            />
          </div>

          <TextArea
            id="hc-review"
            label="Short Review"
            required
            value={values.review}
            onChange={set('review')}
            rows={3}
            placeholder="What the group said about their trip…"
          />

          <div className="grid gap-4 sm:grid-cols-3">
            <FormInput
              id="hc-destination"
              label="Destination"
              value={values.destination}
              onChange={set('destination')}
              placeholder="e.g. Ooty"
            />
            <FormInput
              id="hc-tripType"
              label="Trip Type"
              value={values.tripType}
              onChange={set('tripType')}
              placeholder="e.g. College Tour"
            />
            <FormInput
              id="hc-location"
              label="Location"
              value={values.location}
              onChange={set('location')}
              placeholder="e.g. Chennai"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <FormInput
              id="hc-order"
              type="number"
              label="Display Order"
              value={values.displayOrder}
              onChange={set('displayOrder')}
              min={0}
            />
            <label className="flex items-end gap-2.5 pb-1 text-sm font-semibold text-navy-800">
              <input
                type="checkbox"
                checked={Boolean(values.isFeatured)}
                onChange={(e) => set('isFeatured')(e.target.checked)}
                className="size-4 accent-crimson-600"
              />
              Featured
            </label>
            <label className="flex items-end gap-2.5 pb-1 text-sm font-semibold text-navy-800">
              <input
                type="checkbox"
                checked={Boolean(values.isActive)}
                onChange={(e) => set('isActive')(e.target.checked)}
                className="size-4 accent-crimson-600"
              />
              Active — visible on site
            </label>
          </div>
        </div>
      </Modal>

      <ImagePickerModal
        open={Boolean(pickerField)}
        onClose={() => setPickerField(null)}
        title="Pick an image"
        folder="happy-clients"
        entityId={editing?.id ?? null}
        onSelect={(url) => set(pickerField)(url)}
      />

      <ConfirmDialog
        open={Boolean(deleting)}
        onCancel={() => setDeleting(null)}
        onConfirm={remove}
        title={`Delete ${deleting?.organizationName ?? 'this Happy Client'}?`}
        message="This permanently removes the Happy Client from the Home Page carousel."
      />
    </div>
  )
}

function TablePlaceholder() {
  return (
    <div className="space-y-px overflow-hidden rounded-3xl bg-sand-200 ring-1 ring-inset ring-sand-200" aria-hidden="true">
      {Array.from({ length: 4 }, (_, row) => (
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
      <p className="font-display text-lg font-extrabold text-navy-900">Could not load Happy Clients</p>
      <p className="mt-2 text-sm text-navy-600">Something went wrong while fetching the list.</p>
      <div className="mt-6">
        <Button variant="outline" size="sm" onClick={onRetry}>
          Try again
        </Button>
      </div>
    </div>
  )
}

function EmptyState({ onSeed, seeding }) {
  return (
    <div className="rounded-3xl border border-dashed border-sand-300 bg-sand-50 px-6 py-16 text-center">
      <p className="font-display text-lg font-extrabold text-navy-900">No Happy Clients yet</p>
      <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-navy-500">
        Add institutional testimonials that will appear in the Home Page marquee carousel.
      </p>
      <div className="mt-6 flex items-center justify-center gap-3">
        <Button variant="primary" size="sm" icon={Plus} onClick={onSeed} loading={seeding} disabled={seeding}>
          {seeding ? 'Loading…' : 'Load demo data'}
        </Button>
      </div>
      <p className="mt-3 text-[0.6875rem] text-navy-400">
        Demo / placeholder data — replace with real testimonials from Admin.
      </p>
    </div>
  )
}
