import { ArrowLeft, Download, FileText, Plus, Printer, Trash2 } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { CellStack, DataTable } from '../../components/admin/DataTable'
import BillPreview from '../../components/admin/BillPreview'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import FormInput from '../../components/ui/FormInput'
import Modal from '../../components/ui/Modal'
import SearchInput from '../../components/ui/SearchInput'
import SelectInput from '../../components/ui/SelectInput'
import TextArea from '../../components/ui/TextArea'
import { useEscapeKey } from '../../hooks'
import { useToast } from '../../context/AdminToastContext'
import { deriveBillTotals } from '../../data/bills'
import { BILL_STATUSES, PAYMENT_MODES } from '../../data/constants'
import {
  billDocId,
  billNumberOf,
  deleteBill as deleteBillDoc,
  nextBillNumber,
  saveBill as saveBillDoc,
  updateBillFields,
  useBills,
} from '../../firebase/collections/bills'
import { useTrips } from '../../firebase/collections/trips'
import { formatCurrency, formatDate } from '../../utils/format'

export default function AdminBills() {
  const toast = useToast()
  const { rows, loading, error, reload } = useBills()
  const { rows: trips } = useTrips()

  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('All')
  const [previewing, setPreviewing] = useState(null)
  const [deleting, setDeleting] = useState(null)
  const [generatorOpen, setGeneratorOpen] = useState(false)
  const [saving, setSaving] = useState(false)

  const visible = useMemo(() => {
    const term = query.trim().toLowerCase()
    return rows.filter((bill) => {
      const matchesStatus = status === 'All' || bill.status === status
      const matchesTerm =
        !term ||
        [billNumberOf(bill), bill.customerName, bill.tripId, bill.destination]
          .join(' ')
          .toLowerCase()
          .includes(term)
      return matchesStatus && matchesTerm
    })
  }, [rows, query, status])

  /** Slash-form human number for the NEXT bill, e.g. AH/2026-27/0153. */
  const nextBillId = () => nextBillNumber(rows)

  /** Persist the snapshot payload; the doc id becomes the dash-safe form. */
  const issueBill = async (bill) => {
    const humanNumber = String(bill.id) // slash-form AH/2026-27/NNNN from the generator
    setSaving(true)
    try {
      const docId = await saveBillDoc({ ...bill, billNumber: humanNumber })
      setGeneratorOpen(false)
      // Preview immediately with the saved shape (doc id + billNumber field),
      // so later status cycles match the live rows.
      setPreviewing({ ...bill, id: docId, billNumber: humanNumber })
      toast(`Bill ${humanNumber} generated`)
      return true
    } catch (err) {
      toast(err.message ?? 'Could not save the bill', 'error')
      return false
    } finally {
      setSaving(false)
    }
  }

  /** Click the status badge to walk it through Draft → Issued → Paid → Cancelled. */
  const cycleStatus = (bill) => {
    const next = BILL_STATUSES[(BILL_STATUSES.indexOf(bill.status) + 1) % BILL_STATUSES.length]
    updateBillFields(bill.id, { status: next })
      .then(() => toast(`${billNumberOf(bill)} marked ${next}`, 'info'))
      .catch((err) => toast(err.message ?? 'Could not update the status', 'error'))
    if (previewing?.id === bill.id) setPreviewing({ ...previewing, status: next })
  }

  const removeBill = async () => {
    const target = deleting
    try {
      await deleteBillDoc(target.id)
      toast(`Bill ${billNumberOf(target)} deleted`, 'info')
    } catch (err) {
      toast(err.message ?? 'Could not delete the bill', 'error')
    } finally {
      setDeleting(null)
    }
  }

  const hasFilters = query.trim() !== '' || status !== 'All'

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm font-semibold text-navy-500">
          <span className="font-extrabold text-navy-900">{visible.length}</span> of {rows.length}{' '}
          bills
        </p>
        <Button variant="primary" size="sm" icon={Plus} onClick={() => setGeneratorOpen(true)}>
          Generate Bill
        </Button>
      </div>

      <div className="rounded-3xl bg-white p-4 shadow-card sm:p-5">
        <div className="grid gap-3 lg:grid-cols-[1fr_14rem]">
          <SearchInput
            value={query}
            onChange={setQuery}
            placeholder="Search by bill no, customer or trip…"
            label="Search bills"
          />
          <select
            id="bill-status"
            aria-label="Filter by status"
            value={status}
            onChange={(event) => setStatus(event.target.value)}
            className="h-12 cursor-pointer rounded-full border border-sand-300 bg-white px-4 text-sm font-semibold text-navy-900 focus:border-navy-500 focus:outline-none"
          >
            <option value="All">All statuses</option>
            {BILL_STATUSES.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
      </div>

      <DataTable
        minWidth={980}
        columns={[
          {
            key: 'id',
            header: 'Bill no.',
            minWidth: 160,
            emphasis: true,
            render: (bill) => (
              <span className="font-mono text-xs font-bold whitespace-nowrap text-navy-900">
                {billNumberOf(bill)}
              </span>
            ),
          },
          { key: 'date', header: 'Issued', render: (bill) => formatDate(bill.date) },
          {
            key: 'customerName',
            header: 'Customer / group',
            minWidth: 210,
            render: (bill) => (
              <CellStack
                primary={bill.customerName}
                secondary={<Badge tone="navy" size="xs">{bill.groupType}</Badge>}
              />
            ),
          },
          {
            key: 'tripId',
            header: 'Trip ref.',
            render: (bill) => (
              <span className="font-mono text-xs font-semibold">{bill.tripId}</span>
            ),
          },
          {
            key: 'destination',
            header: 'Destination · package',
            minWidth: 220,
            render: (bill) => (
              <CellStack primary={bill.destination} secondary={bill.packageName} />
            ),
          },
          {
            key: 'grandTotal',
            header: 'Grand total',
            align: 'right',
            render: (bill) => {
              const totals = deriveBillTotals(bill)
              return (
                <CellStack
                  primary={
                    <span className="font-bold whitespace-nowrap text-navy-900 tabular-nums">
                      {formatCurrency(totals.grandTotal)}
                    </span>
                  }
                  secondary={totals.balanceDue > 0 ? `${formatCurrency(totals.balanceDue)} due` : 'Settled'}
                />
              )
            },
          },
          {
            key: 'status',
            header: 'Status',
            align: 'center',
            render: (bill) => (
              <button
                type="button"
                onClick={() => cycleStatus(bill)}
                title="Click to advance status"
                className="cursor-pointer"
              >
                <Badge status={bill.status} dot />
              </button>
            ),
          },
          {
            key: 'actions',
            header: '',
            align: 'right',
            minWidth: 100,
            render: (bill) => (
              <span className="inline-flex gap-1.5">
                <button
                  type="button"
                  onClick={() => setPreviewing(bill)}
                  aria-label={`Preview ${bill.id}`}
                  title="Preview & print"
                  className="grid size-9 cursor-pointer place-content-center rounded-xl text-navy-400 transition-colors hover:bg-sand-100 hover:text-navy-900"
                >
                  <FileText size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => setDeleting(bill)}
                  aria-label={`Delete ${bill.id}`}
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
        emptyIcon={FileText}
        emptyTitle={hasFilters ? 'No bills match those filters' : 'No bills issued yet'}
        emptyMessage={
          hasFilters
            ? 'Try a different search term or clear the filters.'
            : 'Generate a bill from any completed trip — its agreed price is snapshotted automatically.'
        }
        emptyAction={
          hasFilters ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setQuery('')
                setStatus('All')
              }}
            >
              Clear filters
            </Button>
          ) : null
        }
      />

      <BillGeneratorModal
        open={generatorOpen}
        onClose={() => setGeneratorOpen(false)}
        onIssue={issueBill}
        nextBillId={nextBillId}
        trips={trips}
        busy={saving}
      />

      <PrintOverlay bill={previewing} onClose={() => setPreviewing(null)} />

      <ConfirmDialog
        open={Boolean(deleting)}
        onCancel={() => setDeleting(null)}
        onConfirm={removeBill}
        title={`Delete bill ${deleting ? billNumberOf(deleting) : ''}?`}
        message="The invoice record will be removed from this ledger. The underlying trip is not affected."
      />
    </div>
  )
}

/**
 * Step-1 form for a fresh bill. The trip's own pricePerPerson is snapshotted —
 * never re-read from the packages collection — which keeps old invoices
 * correct forever. Trips come from the live Firestore ledger.
 */
function BillGeneratorModal({ open, onClose, onIssue, nextBillId, trips, busy = false }) {
  const safeTrips = Array.isArray(trips) ? trips : []
  const completedTrips = useMemo(
    () =>
      safeTrips
        .filter((trip) => trip.status === 'Completed')
        .sort((a, b) => String(b.date).localeCompare(String(a.date))),
    [safeTrips],
  )

  const blankDraft = () => ({
    customerName: '',
    customerAddress: '',
    customerPhone: '',
    customerEmail: '',
    customerGstin: '',
    extraCharges: [],
    discount: 0,
    advancePaid: '',
    paymentMode: 'UPI',
    paymentRef: '',
    notes: '',
    snapshot: null,
  })

  const [tripId, setTripId] = useState('')
  const [values, setValues] = useState(blankDraft)

  // Re-prefill commercial fields whenever the selected trip changes.
  useEffect(() => {
    if (!tripId) return
    const trip = safeTrips.find((item) => item.id === tripId)
    if (!trip) return
    setValues((current) => ({
      ...current,
      customerName: trip.customerName,
      snapshot: {
        travellers: trip.travellers,
        days: trip.days,
        pricePerPerson: trip.pricePerPerson,
      },
    }))
  }, [tripId, safeTrips])

  const set = (field) => (event) => {
    setValues((current) => ({ ...current, [field]: event.target.value }))
  }

  const trip = safeTrips.find((item) => item.id === tripId)

  const handleIssue = async () => {
    if (!trip || !values.snapshot || busy) return
    const today = new Date().toISOString().slice(0, 10)
    const issued = await onIssue({
      id: nextBillId(),
      tripId: trip.id,
      date: today,
      status: 'Draft',
      customerName: values.customerName.trim(),
      customerAddress: values.customerAddress,
      customerPhone: values.customerPhone,
      customerEmail: values.customerEmail,
      customerGstin: values.customerGstin,
      groupType: trip.groupType,
      destination: trip.destination,
      packageName: trip.packageName,
      travelDate: trip.date,
      travellers: Number(values.snapshot.travellers),
      days: Number(values.snapshot.days),
      /* THE SNAPSHOT — frozen at issue time */
      pricePerPerson: Number(values.snapshot.pricePerPerson),
      extraCharges: values.extraCharges.filter((charge) => charge.label.trim()),
      discount: Number(values.discount) || 0,
      advancePaid: Number(values.advancePaid) || 0,
      paymentMode: values.paymentMode,
      paymentRef: values.paymentRef,
      notes: values.notes,
    })
    // `issued` is the slash-form number the service persisted; only reset the
    // form when the write succeeded so nothing is lost on failure.
    if (issued !== false) {
      setTripId('')
      setValues(blankDraft())
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="lg"
      title="Generate a bill"
      description="Pick the completed trip, add billing details, then preview and print."
      footer={
        <>
          <Button variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" size="sm" disabled={!trip} onClick={handleIssue}>
            Create &amp; preview
          </Button>
        </>
      }
    >
      <div className="space-y-5">
        <SelectInput
          id="gen-trip"
          label="Completed trip"
          required
          value={tripId}
          onChange={(event) => setTripId(event.target.value)}
          options={completedTrips.map((item) => ({
            value: item.id,
            label: `${item.id} · ${item.customerName} · ${formatDate(item.date)}`,
          }))}
          placeholder={`${completedTrips.length} completed trips available`}
          hint="Only Completed trips can be billed."
        />

        {values.snapshot && (
          <>
            <p className="rounded-2xl bg-gold-50 px-4 py-3 text-xs leading-relaxed text-gold-700 ring-1 ring-inset ring-gold-200">
              Snapshot locked at issue:{' '}
              <strong className="tabular-nums">
                {values.snapshot.travellers} pax × ₹
                {values.snapshot.pricePerPerson.toLocaleString('en-IN')}
              </strong>{' '}
              — this trip's agreed rate, independent of today's package price.
            </p>

            <FormInput
              id="gen-name"
              label="Billed-to name"
              value={values.customerName}
              onChange={set('customerName')}
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <FormInput id="gen-phone" label="Phone" value={values.customerPhone} onChange={set('customerPhone')} placeholder="+91 …" />
              <FormInput
                id="gen-email"
                type="email"
                label="Email"
                value={values.customerEmail}
                onChange={set('customerEmail')}
                placeholder="accounts@…"
              />
              <FormInput
                id="gen-address"
                label="Address"
                value={values.customerAddress}
                onChange={set('customerAddress')}
                className="sm:col-span-2"
              />
              <FormInput
                id="gen-gstin"
                label="Customer GSTIN (optional)"
                value={values.customerGstin}
                onChange={set('customerGstin')}
                placeholder="32ABCDE1234F1Z5"
                className="sm:col-span-2"
              />
              <FormInput id="gen-discount" type="number" label="Discount" prefix="₹" min="0" value={values.discount} onChange={set('discount')} />
              <FormInput
                id="gen-advance"
                type="number"
                label="Advance received"
                prefix="₹"
                min="0"
                value={values.advancePaid}
                onChange={set('advancePaid')}
              />
              <SelectInput
                id="gen-mode"
                label="Payment mode"
                value={values.paymentMode}
                onChange={set('paymentMode')}
                options={PAYMENT_MODES}
              />
              <FormInput
                id="gen-ref"
                label="Payment reference"
                value={values.paymentRef}
                onChange={set('paymentRef')}
                placeholder="NEFT / UPI / cheque no."
              />
            </div>

            <TextArea
              id="gen-notes"
              label="Notes on the bill"
              value={values.notes}
              onChange={set('notes')}
              rows={3}
              maxLength={300}
              placeholder="e.g. Balance settled on …; GST invoice issued separately."
            />
          </>
        )}
      </div>
    </Modal>
  )
}

/**
 * Full-screen preview rendered through a portal. While open, `<body>` gets
 * `bill-open` so the print stylesheet hides #root and prints only the sheet.
 */
function PrintOverlay({ bill, onClose }) {
  const toast = useToast()
  useEscapeKey(onClose, Boolean(bill))

  useEffect(() => {
    if (!bill) return undefined
    document.body.classList.add('bill-open')
    return () => document.body.classList.remove('bill-open')
  }, [bill])

  if (!bill) return null

  return createPortal(
    <div className="admin-bill-overlay fixed inset-0 z-150 overflow-y-auto bg-navy-950/75 p-4 backdrop-blur-sm sm:p-8">
      <div className="mx-auto w-full max-w-3xl space-y-5">
        <div className="no-print flex flex-wrap items-center justify-between gap-3">
          <Button variant="light" size="sm" icon={ArrowLeft} onClick={onClose}>
            Back to bills
          </Button>

          <p className="text-[0.6875rem] font-bold tracking-[0.14em] text-white/70 uppercase">
            Bill preview · {billNumberOf(bill)}
          </p>

          <div className="flex gap-2">
            <Button
              variant="light"
              size="sm"
              icon={Download}
              onClick={() =>
                toast('PDF export is coming soon — use Print → Save as PDF for now.', 'info')
              }
            >
              Download
            </Button>
            <Button variant="primary" size="sm" icon={Printer} onClick={() => window.print()}>
              Print
            </Button>
          </div>
        </div>

        <BillPreview bill={bill} />
      </div>
    </div>,
    document.body,
  )
}
