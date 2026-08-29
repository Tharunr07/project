import { ImagePlus, MapPinned, Pencil, Plus, Trash2, X } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { CellStack, DataTable } from '../../components/admin/DataTable'
import ImagePickerModal from '../../components/admin/ImagePickerModal'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import FormInput from '../../components/ui/FormInput'
import Modal from '../../components/ui/Modal'
import SearchInput from '../../components/ui/SearchInput'
import SelectInput from '../../components/ui/SelectInput'
import SmartImage from '../../components/ui/SmartImage'
import TextArea from '../../components/ui/TextArea'
import { useToast } from '../../context/AdminToastContext'
import { PACKAGE_CATEGORIES } from '../../data/constants'
import {
  deleteDestination as deleteDestinationDoc,
  saveDestination as saveDestinationDoc,
  updateDestinationFields,
  useDestinations,
} from '../../firebase/collections/destinations'
import { formatCurrency } from '../../utils/format'

/**
 * Destination catalogue manager. Lighter than the package form — the heavy
 * editorial content (attractions, highlights) is edited as simple rows.
 * Rows stream live from Firestore; mutations write straight through.
 */
export default function AdminDestinations() {
  const toast = useToast()
  const { rows, loading, error, reload } = useDestinations()

  const [query, setQuery] = useState('')
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [deleting, setDeleting] = useState(null)
  const [values, setValues] = useState(emptyForm())
  const [errors, setErrors] = useState({})
  const [pickerField, setPickerField] = useState(null)
  const [saving, setSaving] = useState(false)

  function emptyForm() {
    return {
      id: '',
      name: '',
      state: '',
      category: 'Hill Station',
      tagline: '',
      shortDescription: '',
      description: '',
      startingPrice: '',
      days: '',
      bestTime: '',
      altitude: '',
      distanceFromBase: '',
      heroImage: '',
      cardImage: '',
      attractions: [{ name: '', note: '' }],
      highlights: '',
      published: true,
      featured: false,
    }
  }

  useEffect(() => {
    if (!formOpen) return
    if (editing) {
      setValues({
        ...emptyForm(),
        ...editing,
        attractions: editing.attractions?.length ? editing.attractions : [{ name: '', note: '' }],
        highlights: (editing.highlights ?? []).join('\n'),
      })
    } else {
      setValues(emptyForm())
    }
    setErrors({})
  }, [formOpen, editing])

  const set = (field) => (eventOrValue) => {
    const value = eventOrValue?.target !== undefined ? eventOrValue.target.value : eventOrValue
    setValues((current) => ({ ...current, [field]: value }))
    setErrors((current) => ({ ...current, [field]: undefined }))
  }

  const visible = useMemo(() => {
    const term = query.trim().toLowerCase()
    if (!term) return rows
    return rows.filter((destination) =>
      [destination.name, destination.state, destination.tagline]
        .join(' ')
        .toLowerCase()
        .includes(term),
    )
  }, [rows, query])

  const openAdd = () => {
    setEditing(null)
    setFormOpen(true)
  }
  const openEdit = (destination) => {
    setEditing(destination)
    setFormOpen(true)
  }

  /** Persist to Firestore — the live subscription refreshes the table. */
  const save = async () => {
    const found = {}
    if (values.name.trim().length < 3) found.name = 'Name must be at least 3 characters'
    if (!values.state.trim()) found.state = 'State is required'
    if (!Number(values.startingPrice)) found.startingPrice = 'Enter a starting price'
    if (!Number(values.days) || Number(values.days) < 1) found.days = 'Enter trip length in days'
    setErrors(found)
    if (Object.keys(found).length > 0) return

    const next = {
      ...values,
      name: values.name.trim(),
      state: values.state.trim(),
      startingPrice: Number(values.startingPrice),
      days: Number(values.days),
      duration: `${Math.max(Number(values.days) - 1, 0)} Nights / ${values.days} Days`,
      attractions: values.attractions.filter((row) => row.name.trim()),
      highlights: values.highlights
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean),
    }

    setSaving(true)
    try {
      await saveDestinationDoc(next, editing ?? null)
      toast(`${next.name} saved`)
      setFormOpen(false)
    } catch (err) {
      toast(err.message ?? 'Could not save the destination', 'error')
    } finally {
      setSaving(false)
    }
  }

  const togglePublished = (destination) => {
    updateDestinationFields(destination.id, { published: !destination.published })
      .then(() => toast(`${destination.name} ${destination.published ? 'unpublished' : 'published'}`, 'info'))
      .catch((err) => toast(err.message ?? 'Could not update the destination', 'error'))
  }

  const remove = async () => {
    const target = deleting
    try {
      await deleteDestinationDoc(target.id)
      toast(`${target.name} deleted`, 'info')
    } catch (err) {
      toast(err.message ?? 'Could not delete the destination', 'error')
    } finally {
      setDeleting(null)
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm font-semibold text-navy-500">
          <span className="font-extrabold text-navy-900">{visible.length}</span> of {rows.length}{' '}
          destinations
        </p>
        <Button variant="primary" size="sm" icon={Plus} onClick={openAdd}>
          Add Destination
        </Button>
      </div>

      <div className="rounded-3xl bg-white p-4 shadow-card sm:p-5">
        <SearchInput
          value={query}
          onChange={setQuery}
          placeholder="Search by name, state or tagline…"
          label="Search destinations"
        />
      </div>

      <DataTable
        columns={[
          {
            key: 'name',
            header: 'Destination',
            minWidth: 250,
            emphasis: true,
            render: (destination) => (
              <div className="flex items-center gap-3.5 py-0.5">
                <SmartImage
                  src={destination.cardImage}
                  alt=""
                  ratio="aspect-square"
                  className="size-12 shrink-0 rounded-xl"
                />
                <CellStack primary={destination.name} secondary={`${destination.state} · /${destination.id}`} />
              </div>
            ),
          },
          {
            key: 'tagline',
            header: 'Tagline',
            minWidth: 240,
            render: (destination) => (
              <span className="line-clamp-2 text-xs leading-relaxed">{destination.tagline}</span>
            ),
          },
          {
            key: 'startingPrice',
            header: 'From',
            align: 'right',
            render: (destination) => (
              <span className="font-bold text-navy-900 tabular-nums">
                {formatCurrency(destination.startingPrice)}
              </span>
            ),
          },
          {
            key: 'duration',
            header: 'Duration',
          },
          {
            key: 'flags',
            header: 'Flags',
            align: 'center',
            render: (destination) =>
              destination.featured ? <Badge tone="gold" size="xs">Featured</Badge> : <span className="text-navy-300">—</span>,
          },
          {
            key: 'published',
            header: 'Status',
            align: 'center',
            render: (destination) => (
              <button type="button" onClick={() => togglePublished(destination)} className="cursor-pointer" title="Toggle publish">
                <Badge status={destination.published ? 'Published' : 'Unpublished'} dot />
              </button>
            ),
          },
          {
            key: 'actions',
            header: '',
            align: 'right',
            minWidth: 100,
            render: (destination) => (
              <span className="inline-flex gap-1.5">
                <button
                  type="button"
                  onClick={() => openEdit(destination)}
                  aria-label={`Edit ${destination.name}`}
                  className="grid size-9 cursor-pointer place-content-center rounded-xl text-navy-400 transition-colors hover:bg-sand-100 hover:text-navy-900"
                >
                  <Pencil size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => setDeleting(destination)}
                  aria-label={`Delete ${destination.name}`}
                  className="grid size-9 cursor-pointer place-content-center rounded-xl text-navy-400 transition-colors hover:bg-crimson-50 hover:text-crimson-600"
                >
                  <Trash2 size={16} />
                </button>
              </span>
            ),
          },
        ]}
        rows={visible}
        loading={loading}
        error={error}
        onRetry={reload}
        emptyIcon={MapPinned}
        emptyTitle={query.trim() ? 'No destinations match that search' : 'No destinations yet'}
        emptyMessage={
          query.trim() ? 'Try a different keyword.' : 'Add a destination to start building packages.'
        }
        emptyAction={
          query.trim() ? (
            <Button variant="outline" size="sm" onClick={() => setQuery('')}>
              Clear search
            </Button>
          ) : null
        }
      />

      {/* Add / edit modal */}
      <Modal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        size="full"
        title={editing ? `Edit destination — ${editing.name}` : 'Add a new destination'}
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setFormOpen(false)} disabled={saving}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={save} disabled={saving}>
              {saving ? 'Saving…' : editing ? 'Save changes' : 'Create destination'}
            </Button>
          </>
        }
      >
        <div className="space-y-8">
          <section className="grid gap-5 sm:grid-cols-2">
            <h3 className="text-xs font-bold tracking-[0.16em] text-navy-400 uppercase sm:col-span-2">Basics</h3>

            <FormInput id="dest-name" label="Name" required value={values.name} onChange={set('name')} error={errors.name} placeholder="e.g. Ooty" />
            <FormInput id="dest-state" label="State" required value={values.state} onChange={set('state')} error={errors.state} placeholder="Tamil Nadu" />

            <SelectInput
              id="dest-category"
              label="Category"
              value={values.category}
              onChange={set('category')}
              options={PACKAGE_CATEGORIES}
            />
            <FormInput id="dest-tagline" label="Card tagline" value={values.tagline} onChange={set('tagline')} placeholder="The Queen of Hill Stations…" />

            <TextArea id="dest-short" label="Short description" value={values.shortDescription} onChange={set('shortDescription')} rows={3} maxLength={160} className="sm:col-span-2" />
            <TextArea id="dest-long" label="Full description" value={values.description} onChange={set('description')} rows={6} className="sm:col-span-2" />

            <FormInput id="dest-price" type="number" label="Starting price" required prefix="₹" value={values.startingPrice} onChange={set('startingPrice')} error={errors.startingPrice} min="500" />
            <FormInput id="dest-days" type="number" label="Days" required value={values.days} onChange={set('days')} error={errors.days} min="1" hint={`Shown as ${Math.max(Number(values.days) - 1 || 0, 0)} Nights / ${Number(values.days) || '?'} Days`} />

            <FormInput id="dest-bestTime" label="Best time to visit" value={values.bestTime} onChange={set('bestTime')} placeholder="October to June" />
            <FormInput id="dest-altitude" label="Altitude" value={values.altitude} onChange={set('altitude')} placeholder="2,240 m" />

            <FormInput id="dest-distance" label="Distance note" value={values.distanceFromBase} onChange={set('distanceFromBase')} placeholder="160 km from Coimbatore" className="sm:col-span-2" />
          </section>

          <section className="flex flex-wrap gap-4 rounded-3xl border border-dashed border-sand-300 p-5">
            {[
              ['heroImage', 'Hero image', values.heroImage],
              ['cardImage', 'Card image', values.cardImage],
            ].map(([field, labelText, current]) => (
              <div key={field} className="min-w-56 flex-1 space-y-3">
                <p className="text-sm font-bold text-navy-900">{labelText}</p>
                {current ? (
                  <SmartImage src={current} alt="" ratio="aspect-16/10" className="rounded-2xl shadow-card" />
                ) : (
                  <span className="grid h-28 place-content-center rounded-2xl bg-sand-100 text-navy-300">
                    <ImagePlus size={24} aria-hidden="true" />
                  </span>
                )}
                <Button variant="outline" size="xs" icon={ImagePlus} onClick={() => setPickerField(field)}>
                  {current ? 'Change' : `Choose ${labelText.toLowerCase()}`}
                </Button>
              </div>
            ))}
          </section>

          <section>
            <div className="mb-4 flex items-center justify-between gap-3">
              <h3 className="text-xs font-bold tracking-[0.16em] text-navy-400 uppercase">Best attractions</h3>
              <Button
                variant="subtle"
                size="xs"
                icon={Plus}
                onClick={() => set('attractions')([...values.attractions, { name: '', note: '' }])}
              >
                Add attraction
              </Button>
            </div>

            <div className="space-y-3">
              {values.attractions.map((attraction, index) => (
                <div key={index} className="flex items-end gap-3">
                  <FormInput
                    id={`attraction-name-${index}`}
                    value={attraction.name}
                    onChange={(event) =>
                      set('attractions')(
                        values.attractions.map((row, i) =>
                          i === index ? { ...row, name: event.target.value } : row,
                        ),
                      )
                    }
                    placeholder="Attraction name, e.g. Botanical Gardens"
                    className="w-64 shrink-0 sm:w-72"
                  />
                  <FormInput
                    id={`attraction-note-${index}`}
                    value={attraction.note}
                    onChange={(event) =>
                      set('attractions')(
                        values.attractions.map((row, i) =>
                          i === index ? { ...row, note: event.target.value } : row,
                        ),
                      )
                    }
                    placeholder="One-line note for travellers"
                    className="flex-1"
                  />
                  <button
                    type="button"
                    aria-label={`Remove attraction ${index + 1}`}
                    onClick={() => set('attractions')(values.attractions.filter((_, i) => i !== index))}
                    className="mb-0.5 grid size-10 shrink-0 cursor-pointer place-content-center rounded-xl text-navy-400 transition-colors hover:bg-crimson-50 hover:text-crimson-600"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
          </section>

          <section className="grid items-start gap-5 sm:grid-cols-[1fr_16rem]">
            <TextArea
              id="dest-highlights"
              label="Trip highlights"
              value={values.highlights}
              onChange={set('highlights')}
              rows={4}
              placeholder={'One highlight per line'}
            />
            <div className="space-y-3 rounded-3xl bg-sand-50 p-4 ring-1 ring-inset ring-sand-200">
              {[
                ['published', 'Published'],
                ['featured', 'Featured on home page'],
              ].map(([field, labelText]) => (
                <label key={field} className="flex cursor-pointer items-center gap-3 text-sm font-bold text-navy-900">
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
          </section>
        </div>
      </Modal>

      <ImagePickerModal
        open={Boolean(pickerField)}
        onClose={() => setPickerField(null)}
        title="Pick an image"
        folder="destinations"
        entityId={editing?.id ?? null}
        onSelect={(url) => set(pickerField)(url)}
      />

      <ConfirmDialog
        open={Boolean(deleting)}
        onCancel={() => setDeleting(null)}
        onConfirm={remove}
        title={`Delete ${deleting?.name ?? 'destination'}?`}
        message="The destination disappears from the customer website immediately."
        detail="Existing packages and past trips are not deleted — only their link to this destination card."
      />
    </div>
  )
}
