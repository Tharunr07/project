import { GripVertical, ImagePlus, Plus, Trash2, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import Button from '../ui/Button'
import FormInput from '../ui/FormInput'
import Modal from '../ui/Modal'
import SelectInput from '../ui/SelectInput'
import SmartImage from '../ui/SmartImage'
import TextArea from '../ui/TextArea'
import ImagePickerModal from './ImagePickerModal'
import { PACKAGE_CATEGORIES } from '../../data/constants'
import { useDestinations } from '../../firebase/collections/destinations'
import { rules, validate } from '../../utils/validation'

/**
 * Create/edit form for tour packages — covers price, itinerary days, hotel
 * blocks, transport, inclusions/exclusions and imagery. `onSave` receives the
 * plain object; the parent persists it to Firestore (Phase 2) and closes this
 * form on success. While the write is in flight, `busy` disables the footer.
 */

const packageRules = {
  name: [rules.required('Package name'), rules.minLength('Package name', 4)],
  destinationId: [rules.required('Destination')],
  category: [rules.required('Category')],
  price: [rules.required('Price per person'), rules.min('Price', 500), rules.integer('Price')],
  days: [rules.required('Days'), rules.integer('Days'), rules.min('Days', 1)],
}

const EMPTY = {
  name: '',
  destinationId: '',
  destination: '',
  category: '',
  price: '',
  days: '',
  minGroupSize: 6,
  rating: 4.5,
  published: true,
  featured: false,
  popular: false,
  tags: '',
  image: '',
  gallery: [],
  shortDescription: '',
  overview: '',
  itinerary: [{ day: 1, title: '', details: '' }],
  hotels: [],
  transport: { vehicle: '', driver: '', pickup: '', notes: '' },
  inclusions: '',
  exclusions: '',
}

/** `['a','b']` ⇄ one-per-line textarea text. */
const linesToText = (list) => (Array.isArray(list) ? list.join('\n') : list ?? '')
const textToLines = (text) =>
  String(text)
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)

function toFormState(pkg) {
  if (!pkg) return { ...EMPTY }
  return {
    ...pkg,
    tags: (pkg.tags ?? []).join(', '),
    itinerary: (pkg.itinerary ?? []).map((entry) => ({
      day: entry.day,
      title: entry.title,
      details: (entry.details ?? []).join('\n'),
    })),
    hotels: pkg.hotels ?? [],
    transport: { ...EMPTY.transport, ...pkg.transport },
    inclusions: linesToText(pkg.inclusions),
    exclusions: linesToText(pkg.exclusions),
  }
}

function toPackage(values, existing, destinationRows = []) {
  const slug =
    existing?.id ??
    values.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')

  return {
    ...(existing ?? {}),
    id: slug,
    name: values.name.trim(),
    destinationId: values.destinationId,
    destination:
      (destinationRows ?? []).find((d) => d.id === values.destinationId)?.name ?? '',
    category: values.category,
    price: Number(values.price),
    days: Number(values.days),
    nights: Math.max(Number(values.days) - 1, 0),
    duration: `${Math.max(Number(values.days) - 1, 0)} Nights / ${values.days} Days`,
    minGroupSize: Number(values.minGroupSize) || 6,
    rating: Number(values.rating) || 4.5,
    published: Boolean(values.published),
    featured: Boolean(values.featured),
    popular: Boolean(values.popular),
    tags: values.tags
      .split(',')
      .map((tag) => tag.trim())
      .filter(Boolean),
    image: values.image,
    gallery: values.gallery.filter(Boolean),
    shortDescription: values.shortDescription.trim(),
    overview: values.overview.trim(),
    itinerary: values.itinerary.map((entry, index) => ({
      day: index + 1,
      title: entry.title.trim() || `Day ${index + 1}`,
      details: textToLines(entry.details),
    })),
    hotels: values.hotels,
    transport: { ...values.transport, notes: textToLines(values.transport.notes) },
    inclusions: textToLines(values.inclusions),
    exclusions: textToLines(values.exclusions),
  }
}

export default function PackageForm({ open, onClose, onSave, initial = null, busy = false }) {
  const [values, setValues] = useState(EMPTY)
  const [errors, setErrors] = useState({})
  const [pickerOpen, setPickerOpen] = useState(false)
  const editing = Boolean(initial)
  // Destination options come live from Firestore.
  const { data: destinationRows } = useDestinations()

  useEffect(() => {
    if (open) {
      setValues(toFormState(initial))
      setErrors({})
    }
  }, [open, initial])

  const set = (field) => (eventOrValue) => {
    const value = eventOrValue?.target !== undefined ? eventOrValue.target.value : eventOrValue
    setValues((current) => ({ ...current, [field]: value }))
    setErrors((current) => ({ ...current, [field]: undefined }))
  }

  const patchList = (field, index, patch) => {
    setValues((current) => ({
      ...current,
      [field]: current[field].map((item, i) => (i === index ? { ...item, ...patch } : item)),
    }))
  }

  const handleSubmit = () => {
    const found = validate(values, packageRules)
    setErrors(found)
    if (Object.keys(found).length > 0) return
    onSave(toPackage(values, initial, destinationRows))
  }

  const destinationOptions = (destinationRows ?? []).map((destination) => ({
    value: destination.id,
    label: `${destination.name} · ${destination.state}`,
  }))

  return (
    <>
      <Modal
        open={open}
        onClose={onClose}
        size="full"
        title={editing ? `Edit package — ${initial?.name}` : 'Add a new package'}
        description="Changes apply to future quotations only. Trips already in the ledger keep their original agreed prices."
        footer={
          <>
            <Button variant="outline" size="sm" onClick={onClose} disabled={busy}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleSubmit} disabled={busy}>
              {busy ? 'Saving…' : editing ? 'Save changes' : 'Create package'}
            </Button>
          </>
        }
      >
        <div className="space-y-8">
          {/* Basics */}
          <section className="grid gap-5 sm:grid-cols-2">
            <h3 className="text-xs font-bold tracking-[0.16em] text-navy-400 uppercase sm:col-span-2">
              Basics
            </h3>

            <FormInput
              id="pkg-name"
              label="Package name"
              required
              value={values.name}
              onChange={set('name')}
              error={errors.name}
              placeholder="e.g. Ooty Classic Escape"
              className="sm:col-span-2"
            />

            <SelectInput
              id="pkg-destination"
              label="Destination"
              required
              value={values.destinationId}
              onChange={set('destinationId')}
              options={destinationOptions}
              error={errors.destinationId}
              placeholder="Which destination?"
            />

            <SelectInput
              id="pkg-category"
              label="Category"
              required
              value={values.category}
              onChange={set('category')}
              options={PACKAGE_CATEGORIES}
              error={errors.category}
              placeholder="e.g. Hill Station"
            />

            <FormInput
              id="pkg-price"
              type="number"
              label="Current price per person"
              required
              prefix="₹"
              value={values.price}
              onChange={set('price')}
              error={errors.price}
              min="500"
            />

            <FormInput
              id="pkg-days"
              type="number"
              label="Number of days"
              required
              value={values.days}
              onChange={set('days')}
              error={errors.days}
              min="1"
              max="30"
              hint={`Shown as ${Math.max(Number(values.days) - 1 || 0, 0)} Nights / ${Number(values.days) || '?'} Days`}
            />

            <FormInput
              id="pkg-minGroupSize"
              type="number"
              label="Minimum group size"
              value={values.minGroupSize}
              onChange={set('minGroupSize')}
              min="1"
              suffix="pax"
            />

            <FormInput
              id="pkg-rating"
              type="number"
              label="Display rating"
              value={values.rating}
              onChange={set('rating')}
              min="1"
              max="5"
              step="0.1"
              suffix="/ 5"
            />

            <FormInput
              id="pkg-tags"
              label="Tags"
              value={values.tags}
              onChange={set('tags')}
              placeholder="Best Seller, Family Friendly"
              hint="Comma-separated badges shown on the card."
            />
          </section>

          {/* Visibility toggles */}
          <section className="grid gap-3 rounded-3xl bg-sand-50 p-5 ring-1 ring-inset ring-sand-200 sm:grid-cols-3">
            {[
              ['published', 'Published', 'Visible on the customer website'],
              ['featured', 'Featured', 'Appears in home-page highlights'],
              ['popular', 'Popular', 'Shows in popular packages row'],
            ].map(([field, label, hint]) => (
              <label key={field} className="flex cursor-pointer items-start gap-3">
                <input
                  type="checkbox"
                  checked={Boolean(values[field])}
                  onChange={(event) => set(field)(event.target.checked)}
                  className="mt-0.5 size-4 shrink-0 accent-crimson-600"
                />
                <span>
                  <span className="block text-sm font-bold text-navy-900">{label}</span>
                  <span className="mt-0.5 block text-xs leading-relaxed text-navy-400">{hint}</span>
                </span>
              </label>
            ))}
          </section>

          {/* Imagery */}
          <section>
            <h3 className="mb-4 text-xs font-bold tracking-[0.16em] text-navy-400 uppercase">
              Imagery
            </h3>
            <div className="flex flex-wrap items-center gap-5 rounded-3xl border border-dashed border-sand-300 p-5">
              {values.image ? (
                <SmartImage
                  src={values.image}
                  alt="Card image"
                  ratio="aspect-16/10"
                  className="w-56 shrink-0 rounded-2xl shadow-card"
                />
              ) : (
                <span className="grid h-32 w-56 place-content-center rounded-2xl bg-sand-100 text-navy-300">
                  <ImagePlus size={26} aria-hidden="true" />
                </span>
              )}

              <div className="min-w-0 space-y-3">
                <Button variant="outline" size="sm" icon={ImagePlus} onClick={() => setPickerOpen(true)}>
                  {values.image ? 'Change card image' : 'Upload card image'}
                </Button>
                <p className="text-xs leading-relaxed text-navy-400">
                  Card image is used on listing pages; the first six gallery images appear on the
                  package detail page.
                </p>
                {values.gallery.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {values.gallery.map((url) => (
                      <span key={url} className="relative">
                        <SmartImage src={url} alt="" ratio="aspect-square" className="size-14 rounded-xl" />
                        <button
                          type="button"
                          aria-label="Remove gallery photo"
                          onClick={() =>
                            set('gallery')(values.gallery.filter((item) => item !== url))
                          }
                          className="absolute -top-1.5 -right-1.5 grid size-5 cursor-pointer place-content-center rounded-full bg-crimson-600 text-white shadow-card hover:bg-crimson-700"
                        >
                          <X size={11} strokeWidth={2.5} />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
                <div>
                  <Button
                    variant="subtle"
                    size="xs"
                    icon={Plus}
                    onClick={() => setPickerOpen(true)}
                    disabled={!values.image}
                  >
                    Add gallery photo
                  </Button>
                </div>
              </div>
            </div>
          </section>

          {/* Copy */}
          <section className="grid gap-5 sm:grid-cols-2">
            <h3 className="text-xs font-bold tracking-[0.16em] text-navy-400 uppercase sm:col-span-2">
              Descriptions
            </h3>
            <TextArea
              id="pkg-shortDescription"
              label="Short description"
              value={values.shortDescription}
              onChange={set('shortDescription')}
              rows={3}
              maxLength={180}
              placeholder="One or two lines for the card."
            />
            <TextArea
              id="pkg-overview"
              label="Overview paragraph"
              value={values.overview}
              onChange={set('overview')}
              rows={3}
              placeholder="Longer intro shown on the package page."
            />
          </section>

          {/* Itinerary editor */}
          <section>
            <div className="mb-4 flex items-center justify-between gap-3">
              <h3 className="text-xs font-bold tracking-[0.16em] text-navy-400 uppercase">
                Day-by-day itinerary
              </h3>
              <Button
                variant="subtle"
                size="xs"
                icon={Plus}
                onClick={() =>
                  set('itinerary')([
                    ...values.itinerary,
                    { day: values.itinerary.length + 1, title: '', details: '' },
                  ])
                }
              >
                Add day
              </Button>
            </div>

            <div className="space-y-3">
              {values.itinerary.map((entry, index) => (
                <div key={index} className="rounded-3xl bg-white p-4 ring-1 ring-inset ring-sand-200 sm:p-5">
                  <div className="flex items-center gap-3">
                    <span
                      aria-hidden="true"
                      className="grid size-9 shrink-0 place-content-center rounded-xl bg-brand-600 text-sm font-extrabold text-white tabular-nums"
                    >
                      {index + 1}
                    </span>
                    <FormInput
                      id={`pkg-day-title-${index}`}
                      value={entry.title}
                      onChange={(event) => patchList('itinerary', index, { title: event.target.value })}
                      placeholder={`Day ${index + 1} title, e.g. Arrival & Botanical Gardens`}
                      className="flex-1"
                    />
                    <button
                      type="button"
                      aria-label={`Remove day ${index + 1}`}
                      disabled={values.itinerary.length === 1}
                      onClick={() =>
                        set('itinerary')(values.itinerary.filter((_, i) => i !== index))
                      }
                      className="grid size-9 shrink-0 cursor-pointer place-content-center rounded-xl text-navy-400 transition-colors hover:bg-crimson-50 hover:text-crimson-600 disabled:pointer-events-none disabled:opacity-40"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  <TextArea
                    id={`pkg-day-details-${index}`}
                    value={entry.details}
                    onChange={(event) => patchList('itinerary', index, { details: event.target.value })}
                    rows={4}
                    className="mt-3"
                    placeholder="One activity per line…"
                  />
                </div>
              ))}
            </div>
          </section>

          {/* Hotels editor */}
          <section>
            <div className="mb-4 flex items-center justify-between gap-3">
              <h3 className="text-xs font-bold tracking-[0.16em] text-navy-400 uppercase">
                Hotels / accommodation
              </h3>
              <Button
                variant="subtle"
                size="xs"
                icon={Plus}
                onClick={() =>
                  set('hotels')([
                    ...values.hotels,
                    { city: '', name: '', category: '3 Star', nights: 1, roomType: '', mealPlan: '', note: '' },
                  ])
                }
              >
                Add hotel block
              </Button>
            </div>

            {values.hotels.length === 0 && (
              <p className="rounded-2xl border border-dashed border-sand-300 px-4 py-6 text-center text-sm text-navy-400">
                No hotel blocks yet — add where guests will stay.
              </p>
            )}

            <div className="space-y-3">
              {values.hotels.map((hotel, index) => (
                <fieldset key={index} className="rounded-3xl bg-white p-4 ring-1 ring-inset ring-sand-200">
                  <div className="flex items-center justify-between gap-3 pb-3">
                    <legend className="flex items-center gap-2 text-sm font-bold text-navy-900">
                      <GripVertical size={15} className="text-sand-300" aria-hidden="true" />
                      Hotel block {index + 1}
                    </legend>
                    <button
                      type="button"
                      aria-label={`Remove hotel block ${index + 1}`}
                      onClick={() => set('hotels')(values.hotels.filter((_, i) => i !== index))}
                      className="grid size-9 cursor-pointer place-content-center rounded-xl text-navy-400 transition-colors hover:bg-crimson-50 hover:text-crimson-600"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    <FormInput
                      id={`hotel-city-${index}`}
                      label="City"
                      value={hotel.city}
                      onChange={(event) => patchList('hotels', index, { city: event.target.value })}
                      placeholder="Ooty"
                    />
                    <FormInput
                      id={`hotel-name-${index}`}
                      label="Hotel name"
                      value={hotel.name}
                      onChange={(event) => patchList('hotels', index, { name: event.target.value })}
                      placeholder="Nilgiri Ridge Resort"
                    />
                    <SelectInput
                      id={`hotel-category-${index}`}
                      label="Category"
                      value={hotel.category}
                      onChange={(event) => patchList('hotels', index, { category: event.target.value })}
                      options={['Budget', '2 Star', '3 Star', '4 Star', 'Premium', 'Homestay']}
                    />
                    <FormInput
                      id={`hotel-nights-${index}`}
                      type="number"
                      label="Nights"
                      value={hotel.nights}
                      onChange={(event) => patchList('hotels', index, { nights: Number(event.target.value) })}
                      min="1"
                    />
                    <FormInput
                      id={`hotel-room-${index}`}
                      label="Room type"
                      value={hotel.roomType}
                      onChange={(event) => patchList('hotels', index, { roomType: event.target.value })}
                      placeholder="Deluxe double / triple sharing"
                    />
                    <FormInput
                      id={`hotel-meal-${index}`}
                      label="Meal plan"
                      value={hotel.mealPlan}
                      onChange={(event) => patchList('hotels', index, { mealPlan: event.target.value })}
                      placeholder="Breakfast and dinner (MAP)"
                    />
                    <FormInput
                      id={`hotel-note-${index}`}
                      label="Note"
                      value={hotel.note}
                      onChange={(event) => patchList('hotels', index, { note: event.target.value })}
                      placeholder="Anything coordinators should know"
                      className="sm:col-span-2"
                    />
                  </div>
                </fieldset>
              ))}
            </div>
          </section>

          {/* Transport */}
          <section className="rounded-3xl bg-sand-50 p-5 ring-1 ring-inset ring-sand-200">
            <h3 className="mb-4 text-xs font-bold tracking-[0.16em] text-navy-400 uppercase">
              Transportation
            </h3>
            <div className="grid gap-4 sm:grid-cols-3">
              <FormInput
                id="pkg-vehicle"
                label="Vehicle"
                value={values.transport.vehicle}
                onChange={(event) =>
                  set('transport')({ ...values.transport, vehicle: event.target.value })
                }
                placeholder="Innova / Tempo Traveller as per group size"
              />
              <FormInput
                id="pkg-driver"
                label="Driver"
                value={values.transport.driver}
                onChange={(event) =>
                  set('transport')({ ...values.transport, driver: event.target.value })
                }
                placeholder="Experienced hill-route driver"
              />
              <FormInput
                id="pkg-pickup"
                label="Pick-up point"
                value={values.transport.pickup}
                onChange={(event) =>
                  set('transport')({ ...values.transport, pickup: event.target.value })
                }
                placeholder="Coimbatore railway station / airport"
              />
            </div>
            <TextArea
              id="pkg-transport-notes"
              label="Transport notes"
              value={linesToText(values.transport.notes)}
              onChange={(event) =>
                set('transport')({
                  ...values.transport,
                  notes: event.target.value.split('\n'),
                })
              }
              rows={3}
              className="mt-4"
              placeholder={'One note per line, e.g. All toll, parking and driver bata included.'}
            />
          </section>

          {/* Inclusions / exclusions */}
          <section className="grid gap-5 sm:grid-cols-2">
            <TextArea
              id="pkg-inclusions"
              label="Included services"
              value={values.inclusions}
              onChange={set('inclusions')}
              rows={7}
              placeholder={'One item per line, e.g.\nDaily breakfast and dinner'}
            />
            <TextArea
              id="pkg-exclusions"
              label="Excluded services"
              value={values.exclusions}
              onChange={set('exclusions')}
              rows={7}
              placeholder={'One item per line, e.g.\nTrain or flight tickets'}
            />
          </section>
        </div>
      </Modal>

      <ImagePickerModal
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        title={values.image ? 'Pick an image' : 'Pick a card image'}
        folder="packages"
        entityId={initial?.id ?? null}
        onSelect={(url) => {
          if (!values.image) {
            set('image')(url)
          } else {
            set('gallery')([...values.gallery, url])
          }
        }}
      />
    </>
  )
}
