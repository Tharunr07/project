import { useEffect, useState } from 'react'
import Button from '../ui/Button'
import FormInput from '../ui/FormInput'
import Modal from '../ui/Modal'
import SelectInput from '../ui/SelectInput'
import TextArea from '../ui/TextArea'
import { EXPENSE_CATEGORIES, PAYMENT_MODES } from '../../data/constants'
import { deriveTripTotals } from '../../data/trips'
import { useTrips } from '../../firebase/collections/trips'
import { formatCurrency, formatDate } from '../../utils/format'
import { rules, validate } from '../../utils/validation'

const expenseRules = {
  date: [rules.required('Date')],
  category: [rules.required('Category')],
  amount: [rules.required('Amount'), rules.min('Amount', 1), rules.integer('Amount')],
  tripId: [rules.required('Trip reference')],
}

const EMPTY = {
  date: '',
  tripId: '',
  category: '',
  vendor: '',
  amount: '',
  paidBy: 'Company Account',
  mode: 'UPI',
  note: '',
}

/** Add/edit a standalone expense record against a trip. */
export default function ExpenseForm({ open, onClose, onSave, initial = null, busy = false }) {
  const [values, setValues] = useState(EMPTY)
  const [errors, setErrors] = useState({})
  const editing = Boolean(initial)
  // Trip dropdown reads the live Firestore ledger (newest first).
  const { data: trips } = useTrips()

  useEffect(() => {
    if (!open) return
    setValues(initial ? { ...EMPTY, ...initial } : { ...EMPTY, date: new Date().toISOString().slice(0, 10) })
    setErrors({})
  }, [open, initial])

  const set = (field) => (event) => {
    setValues((current) => ({ ...current, [field]: event.target.value }))
    setErrors((current) => ({ ...current, [field]: undefined }))
  }

  const handleSubmit = () => {
    const found = validate(values, expenseRules)
    setErrors(found)
    if (Object.keys(found).length > 0) return
    onSave({ ...values, amount: Number(values.amount) })
  }

  const tripChoices = (trips ?? []).map((trip) => ({
    value: trip.id,
    label: `${trip.id} · ${trip.customerName} · ${formatDate(trip.date)}`,
  }))

  const selectedTrip = (trips ?? []).find((trip) => trip.id === values.tripId)
  // Raw Firestore rows carry no stored totals — derive the revenue hint live.
  const selectedTotals = selectedTrip ? deriveTripTotals(selectedTrip) : null

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="lg"
      title={editing ? `Edit expense — ${initial?.id}` : 'Record an expense'}
      description="Line-item paper trail. Trip totals on the ledger remain the P&L source of truth."
      footer={
        <>
          <Button variant="outline" size="sm" onClick={onClose} disabled={busy}>
            Cancel
          </Button>
          <Button variant="primary" size="sm" onClick={handleSubmit} disabled={busy}>
            {busy ? 'Saving…' : editing ? 'Save changes' : 'Record expense'}
          </Button>
        </>
      }
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <SelectInput
          id="exp-category"
          label="Expense category"
          required
          value={values.category}
          onChange={set('category')}
          options={EXPENSE_CATEGORIES}
          error={errors.category}
          placeholder="e.g. Vehicle"
        />

        <FormInput
          id="exp-amount"
          type="number"
          label="Amount"
          required
          prefix="₹"
          min="1"
          value={values.amount}
          onChange={set('amount')}
          error={errors.amount}
        />

        <FormInput id="exp-date" type="date" label="Paid on" required value={values.date} onChange={set('date')} error={errors.date} />

        <SelectInput
          id="exp-tripId"
          label="Trip reference"
          required
          value={values.tripId}
          onChange={set('tripId')}
          options={tripChoices}
          error={errors.tripId}
          placeholder="Which trip?"
          hint={
            selectedTrip && selectedTotals
              ? `${selectedTrip.destination} · ${selectedTrip.travellers} pax · ${formatCurrency(selectedTotals.totalRevenue)}`
              : undefined
          }
        />

        <FormInput id="exp-vendor" label="Vendor / payee" value={values.vendor} onChange={set('vendor')} placeholder="e.g. Ganesh Travels, Kochi" className="sm:col-span-2" />

        <SelectInput id="exp-paidBy" label="Paid by" value={values.paidBy} onChange={set('paidBy')} options={['Company Account', 'Coordinator Advance']} />

        <SelectInput id="exp-mode" label="Payment mode" value={values.mode} onChange={set('mode')} options={PAYMENT_MODES} />

        <TextArea
          id="exp-note"
          label="Note"
          value={values.note}
          onChange={(event) => setValues((current) => ({ ...current, note: event.target.value }))}
          rows={3}
          maxLength={240}
          placeholder="What was this for? e.g. 2 Tempo Travellers, 4 days including driver bata"
          className="sm:col-span-2"
        />
      </div>
    </Modal>
  )
}
