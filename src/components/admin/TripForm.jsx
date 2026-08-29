import { Calculator } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import Button from '../ui/Button'
import FormInput from '../ui/FormInput'
import Modal from '../ui/Modal'
import SelectInput from '../ui/SelectInput'
import TextArea from '../ui/TextArea'
import { EXPENSE_FIELDS, deriveTripTotals } from '../../data/trips'
import { GROUP_TYPES, TRIP_STATUSES } from '../../data/constants'
import { useDestinations } from '../../firebase/collections/destinations'
import { usePackages } from '../../firebase/collections/packages'
import { formatCurrency } from '../../utils/format'
import { rules, validate } from '../../utils/validation'

const tripRules = {
  date: [rules.required('Trip date')],
  startingLocation: [rules.required('Starting location')],
  destination: [rules.required('Destination')],
  packageName: [rules.required('Package')],
  days: [rules.required('Days'), rules.integer('Days'), rules.min('Days', 1)],
  travellers: [rules.required('Travellers'), rules.integer('Travellers'), rules.min('Travellers', 1)],
  groupType: [rules.required('Group type')],
  pricePerPerson: [rules.required('Price per person'), rules.min('Price', 100)],
}

/** Next ledger id in the sequence, e.g. TRP-2026-042. */
function makeTripId(allTrips, year) {
  const numbers = allTrips
    .map((trip) => /^TRP-(\d{4})-(\d+)$/.exec(trip.id))
    .filter(Boolean)
    .map(([, , seq]) => Number(seq))
  const next = (numbers.length ? Math.max(...numbers) : 0) + 1
  return `TRP-${year}-${String(next).padStart(3, '0')}`
}

const EMPTY = {
  id: '',
  date: '',
  status: 'Upcoming',
  startingLocation: 'Coimbatore',
  destination: '',
  packageName: '',
  customerName: '',
  groupType: '',
  days: '',
  travellers: '',
  pricePerPerson: '',
  vehicleExpense: 0,
  hotelExpense: 0,
  foodExpense: 0,
  entryFeeExpense: 0,
  otherExpenses: 0,
  notes: '',
}

/**
 * Add/edit a trip. The P&L panel recalculates on every keystroke:
 *   Revenue = Travellers × Price/person · Expenses = Σ five heads · Profit = Δ
 * PHASE 2D: onSave receives the plain object; the parent persists it to
 * Firestore via the trips service (derived totals are never stored).
 */
export default function TripForm({ open, onClose, onSave, initial = null, allTrips = [], busy = false }) {
  const [values, setValues] = useState(EMPTY)
  const [errors, setErrors] = useState({})
  const editing = Boolean(initial)

  // Live catalogue — destination days-prefill and package price prefill.
  const { data: destinationRows } = useDestinations()
  const { data: packageRows } = usePackages()

  useEffect(() => {
    if (!open) return
    if (initial) {
      setValues({ ...EMPTY, ...initial })
    } else {
      setValues({
        ...EMPTY,
        id: makeTripId(allTrips, new Date().getFullYear()),
      })
    }
    setErrors({})
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, initial])

  const set = (field) => (event) => {
    const value = event.target.value
    setValues((current) => {
      const next = { ...current, [field]: value }
      // Keep package consistent with the chosen destination.
      if (field === 'destination') {
        const stillValid = (packageRows ?? []).some(
          (pkg) => pkg.name === current.packageName && pkg.destination === value,
        )
        if (!stillValid) next.packageName = ''
        // Prefill the day count from the destination's standard circuit.
        const match = (destinationRows ?? []).find((d) => d.name === value)
        if (match && !current.days) next.days = match.days
      }
      // HISTORICAL PRICE RULE — copy-at-creation only: prefill the CURRENT
      // package price into an empty agreed-price field on NEW trips. Editing
      // an existing trip never rewrites its stored price automatically.
      if (field === 'packageName' && !editing && !current.pricePerPerson) {
        const match = (packageRows ?? []).find((pkg) => pkg.name === value)
        if (match?.price) next.pricePerPerson = match.price
      }
      return next
    })
    setErrors((current) => ({ ...current, [field]: undefined }))
  }

  const totals = useMemo(() => deriveTripTotals(values), [values])

  const packageChoices = (packageRows ?? [])
    .filter((pkg) => !values.destination || pkg.destination === values.destination)
    .map((pkg) => ({ value: pkg.name, label: `${pkg.name} · ${formatCurrency(pkg.price)} now` }))

  const handleSubmit = () => {
    const found = validate(values, tripRules)
    setErrors(found)
    if (Object.keys(found).length > 0) return
    onSave({ ...values, id: values.id || makeTripId(allTrips, Number(values.date.slice(0, 4)) || new Date().getFullYear()) })
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="full"
      title={editing ? `Edit trip — ${initial?.id}` : 'Plan a new trip'}
      description="Revenue, expenses and profit recalculate automatically as you type."
      footer={
        <>
          <Button variant="outline" size="sm" onClick={onClose} disabled={busy}>
            Cancel
          </Button>
          <Button variant="primary" size="sm" onClick={handleSubmit} disabled={busy}>
            {busy ? 'Saving…' : editing ? 'Save changes' : 'Create trip'}
          </Button>
        </>
      }
    >
      <div className="grid gap-8 lg:grid-cols-[1fr_20rem]">
        {/* Fields */}
        <div className="space-y-7">
          <section className="grid gap-5 sm:grid-cols-2">
            <h3 className="text-xs font-bold tracking-[0.16em] text-navy-400 uppercase sm:col-span-2">
              Trip details
            </h3>

            <FormInput id="trip-id" label="Trip ID" value={values.id} onChange={() => {}} disabled hint="Assigned automatically." />

            <FormInput id="trip-date" type="date" label="Trip date" required value={values.date} onChange={set('date')} error={errors.date} />

            <FormInput id="trip-start" label="Starting location" required value={values.startingLocation} onChange={set('startingLocation')} error={errors.startingLocation} placeholder="Coimbatore" />

            <SelectInput id="trip-status" label="Status" value={values.status} onChange={set('status')} options={TRIP_STATUSES} />

            <SelectInput
              id="trip-destination"
              label="Destination"
              required
              value={values.destination}
              onChange={set('destination')}
              options={(destinationRows ?? []).map((destination) => destination.name)}
              error={errors.destination}
              placeholder="Choose the destination"
            />

            <SelectInput
              id="trip-package"
              label="Package"
              required
              value={values.packageName}
              onChange={set('packageName')}
              options={packageChoices}
              error={errors.packageName}
              placeholder={
                values.destination ? `${packageChoices.length} available` : 'Choose a destination first'
              }
              hint="The list price shown is today's rate — this trip's agreed price is entered below."
            />

            <FormInput id="trip-customer" label="Customer / group name" value={values.customerName} onChange={set('customerName')} placeholder="e.g. PSG Tech — Final Year Batch" className="sm:col-span-2" />
          </section>

          <section className="grid gap-5 sm:grid-cols-3">
            <h3 className="text-xs font-bold tracking-[0.16em] text-navy-400 uppercase sm:col-span-3">
              Group &amp; pricing
            </h3>

            <FormInput id="trip-travellers" type="number" label="Number of travellers" required min="1" value={values.travellers} onChange={set('travellers')} error={errors.travellers} suffix="pax" />

            <FormInput id="trip-days" type="number" label="Number of days" required min="1" value={values.days} onChange={set('days')} error={errors.days} suffix="days" />

            <SelectInput id="trip-groupType" label="Group type" required value={values.groupType} onChange={set('groupType')} options={GROUP_TYPES} error={errors.groupType} placeholder="Who is travelling?" />

            <FormInput id="trip-price" type="number" label="Price per person (agreed)" required prefix="₹" min="100" value={values.pricePerPerson} onChange={set('pricePerPerson')} error={errors.pricePerPerson} hint={`Snapshot for THIS trip — prefilled from today's package rate on new trips, then frozen. Editing a trip never re-rates it.`} className="sm:col-span-3" />
          </section>

          <section className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <h3 className="text-xs font-bold tracking-[0.16em] text-navy-400 uppercase sm:col-span-2 lg:col-span-3">
              Expenses
            </h3>

            {EXPENSE_FIELDS.map((field) => (
              <FormInput
                key={field.key}
                id={`trip-${field.key}`}
                type="number"
                label={field.label}
                prefix="₹"
                min="0"
                value={values[field.key]}
                onChange={(event) =>
                  setValues((current) => ({ ...current, [field.key]: event.target.value }))
                }
              />
            ))}
          </section>

          <TextArea
            id="trip-notes"
            label="Notes"
            value={values.notes ?? ''}
            onChange={(event) => setValues((current) => ({ ...current, notes: event.target.value }))}
            rows={4}
            maxLength={600}
            placeholder="Coordinator instructions, special requests, vendor contacts…"
          />
        </div>

        {/* Live P&L panel */}
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-3xl bg-navy-950 p-6 text-white shadow-lift">
            <p className="flex items-center gap-2 text-[0.625rem] font-bold tracking-[0.18em] text-bone-200 uppercase">
              <Calculator size={13} aria-hidden="true" />
              Live trip P&amp;L
            </p>

            <dl className="mt-5 space-y-3.5 text-sm">
              <div className="flex items-center justify-between gap-3">
                <dt className="text-navy-300">Revenue</dt>
                <dd className="font-bold tabular-nums">{formatCurrency(totals.totalRevenue)}</dd>
              </div>
              <p className="-mt-1.5 text-[0.6875rem] leading-relaxed text-navy-400 tabular-nums">
                {Number(values.travellers) || 0} travellers × {formatCurrency(Number(values.pricePerPerson) || 0)}
              </p>

              {EXPENSE_FIELDS.map((field) => (
                <div key={field.key} className="flex items-center justify-between gap-3">
                  <dt className="text-navy-300">{field.label}</dt>
                  <dd className="font-semibold text-navy-100 tabular-nums">
                    {formatCurrency(Number(values[field.key]) || 0)}
                  </dd>
                </div>
              ))}

              <div className="flex items-center justify-between gap-3 border-t border-white/10 pt-3">
                <dt className="font-bold">Total expenses</dt>
                <dd className="font-extrabold tabular-nums">{formatCurrency(totals.totalExpenses)}</dd>
              </div>

              <div className="flex items-end justify-between gap-3 border-t border-white/10 pt-4">
                <dt className="font-bold">Profit</dt>
                <dd className={`font-display text-2xl font-extrabold tabular-nums ${totals.profit >= 0 ? 'text-emerald-400' : 'text-crimson-400'}`}>
                  {formatCurrency(totals.profit)}
                </dd>
              </div>

              <div className="flex items-center justify-between gap-3">
                <dt className="text-navy-300">Margin</dt>
                <dd className="font-bold text-bone-200 tabular-nums">{totals.margin}%</dd>
              </div>
            </dl>

            <p className="mt-5 rounded-xl bg-white/6 px-3.5 py-2.5 text-[0.6875rem] leading-relaxed text-navy-300">
              These figures are derived live from the fields above — they are never stored on the
              trip document, so every screen always shows the same maths.
            </p>
          </div>
        </aside>
      </div>
    </Modal>
  )
}
