import { Eye, Pencil, Plus, Route as RouteIcon, Trash2 } from 'lucide-react'
import { useMemo, useState } from 'react'
import { CellStack, DataTable } from '../../components/admin/DataTable'
import TripForm from '../../components/admin/TripForm'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import FilterPills from '../../components/ui/FilterPills'
import Modal from '../../components/ui/Modal'
import SearchInput from '../../components/ui/SearchInput'
import { useToast } from '../../context/AdminToastContext'
import { TRIP_STATUSES } from '../../data/constants'
import { EXPENSE_FIELDS } from '../../data/trips'
import {
  deleteTrip as deleteTripDoc,
  saveTrip as saveTripDoc,
  useTrips,
  withDerivedTrip,
} from '../../firebase/collections/trips'
import { useDestinations } from '../../firebase/collections/destinations'
import { formatCurrency, formatDate } from '../../utils/format'

export default function AdminTrips() {
  const toast = useToast()
  const { rows, loading, error, reload } = useTrips()
  const { data: destinationRows } = useDestinations()

  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('All')
  const [destination, setDestination] = useState('All')
  const [viewing, setViewing] = useState(null)
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [deleting, setDeleting] = useState(null)
  const [saving, setSaving] = useState(false)

  /** Derived figures are recomputed from raw rows on every render. */
  const ledger = useMemo(() => rows.map(withDerivedTrip), [rows])

  const statusOptions = useMemo(
    () => [
      { value: 'All', label: 'All', count: rows.length },
      ...TRIP_STATUSES.map((name) => ({
        value: name,
        label: name,
        count: rows.filter((trip) => trip.status === name).length,
      })),
    ],
    [rows],
  )

  const visible = useMemo(() => {
    const term = query.trim().toLowerCase()
    return ledger.filter((trip) => {
      const matchesStatus = status === 'All' || trip.status === status
      const matchesDestination = destination === 'All' || trip.destination === destination
      const matchesTerm =
        !term ||
        [trip.id, trip.customerName, trip.destination, trip.packageName]
          .join(' ')
          .toLowerCase()
          .includes(term)
      return matchesStatus && matchesDestination && matchesTerm
    })
  }, [ledger, query, status, destination])

  const totalsRow = useMemo(
    () =>
      visible.reduce(
        (acc, trip) => ({
          revenue: acc.revenue + trip.totalRevenue,
          expenses: acc.expenses + trip.totalExpenses,
          profit: acc.profit + trip.profit,
        }),
        { revenue: 0, expenses: 0, profit: 0 },
      ),
    [visible],
  )

  /** Persist to Firestore — the live subscription refreshes the ledger. */
  const saveTrip = async (next) => {
    setSaving(true)
    try {
      await saveTripDoc(next, editing ?? null)
      toast(`Trip ${next.id} saved`)
      setFormOpen(false)
      setEditing(null)
    } catch (err) {
      toast(err.message ?? 'Could not save the trip', 'error')
    } finally {
      setSaving(false)
    }
  }

  const removeTrip = async () => {
    const target = deleting
    try {
      await deleteTripDoc(target.id)
      toast(`Trip ${target.id} deleted`, 'info')
    } catch (err) {
      toast(err.message ?? 'Could not delete the trip', 'error')
    } finally {
      setDeleting(null)
    }
  }

  const hasFilters = query.trim() !== '' || status !== 'All' || destination !== 'All'

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm font-semibold text-navy-500">
          <span className="font-extrabold text-navy-900">{visible.length}</span> of {rows.length}{' '}
          trips
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
          Add Trip
        </Button>
      </div>

      <div className="rounded-3xl bg-white p-4 shadow-card sm:p-5">
        <div className="grid gap-3 lg:grid-cols-[1fr_14rem]">
          <SearchInput
            value={query}
            onChange={setQuery}
            placeholder="Search by ID, customer, destination or package…"
            label="Search trips"
          />
          <select
            id="trips-destination"
            aria-label="Filter by destination"
            value={destination}
            onChange={(event) => setDestination(event.target.value)}
            className="h-12 cursor-pointer rounded-full border border-sand-300 bg-white px-4 text-sm font-semibold text-navy-900 focus:border-navy-500 focus:outline-none"
          >
            <option value="All">All destinations</option>
            {(destinationRows ?? []).map((item) => (
              <option key={item.id} value={item.name}>
                {item.name}
              </option>
            ))}
          </select>
        </div>

        <div className="mt-3 border-t border-sand-200 pt-3">
          <FilterPills label="Trip status" options={statusOptions} value={status} onChange={setStatus} />
        </div>
      </div>

      <DataTable
        columns={[
          {
            key: 'id',
            header: 'Trip',
            minWidth: 190,
            emphasis: true,
            render: (trip) => (
              <CellStack primary={trip.id} secondary={formatDate(trip.date)} />
            ),
          },
          {
            key: 'customerName',
            header: 'Customer / group',
            minWidth: 220,
            render: (trip) => (
              <CellStack
                primary={trip.customerName}
                secondary={<Badge tone="navy" size="xs">{trip.groupType}</Badge>}
              />
            ),
          },
          {
            key: 'destination',
            header: 'Destination · package',
            minWidth: 230,
            render: (trip) => (
              <CellStack primary={trip.destination} secondary={trip.packageName} />
            ),
          },
          {
            key: 'pax',
            header: 'Pax × rate',
            align: 'right',
            render: (trip) => (
              <span className="whitespace-nowrap tabular-nums">
                {trip.travellers} × {formatCurrency(trip.pricePerPerson)}
              </span>
            ),
          },
          {
            key: 'totalRevenue',
            header: 'Revenue',
            align: 'right',
            render: (trip) => (
              <span className="font-bold text-navy-900 tabular-nums">
                {formatCurrency(trip.totalRevenue)}
              </span>
            ),
          },
          {
            key: 'totalExpenses',
            header: 'Expenses',
            align: 'right',
            render: (trip) => <span className="tabular-nums">{formatCurrency(trip.totalExpenses)}</span>,
          },
          {
            key: 'profit',
            header: 'Profit',
            align: 'right',
            render: (trip) => (
              <span
                className={`font-bold tabular-nums ${
                  trip.profit > 0
                    ? 'text-emerald-600'
                    : trip.profit < 0
                      ? 'text-crimson-600'
                      : 'text-navy-900'
                }`}
              >
                {formatCurrency(trip.profit)}
              </span>
            ),
          },
          {
            key: 'status',
            header: 'Status',
            align: 'center',
            render: (trip) => <Badge status={trip.status} dot />,
          },
          {
            key: 'actions',
            header: '',
            align: 'right',
            minWidth: 120,
            render: (trip) => (
              <span className="inline-flex gap-1.5">
                <button
                  type="button"
                  onClick={() => setViewing(trip)}
                  aria-label={`View ${trip.id}`}
                  className="grid size-9 cursor-pointer place-content-center rounded-xl text-navy-400 transition-colors hover:bg-sand-100 hover:text-navy-900"
                >
                  <Eye size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEditing(trip)
                    setFormOpen(true)
                  }}
                  aria-label={`Edit ${trip.id}`}
                  className="grid size-9 cursor-pointer place-content-center rounded-xl text-navy-400 transition-colors hover:bg-sand-100 hover:text-navy-900"
                >
                  <Pencil size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => setDeleting(trip)}
                  aria-label={`Delete ${trip.id}`}
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
        emptyIcon={RouteIcon}
        emptyTitle={hasFilters ? 'No trips match those filters' : 'No trips in the ledger yet'}
        emptyMessage={
          hasFilters
            ? 'Try a different search term or clear the filters.'
            : 'Create a trip to start tracking revenue and profit.'
        }
        emptyAction={
          hasFilters ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setQuery('')
                setStatus('All')
                setDestination('All')
              }}
            >
              Clear filters
            </Button>
          ) : null
        }
        footer={[
          { content: `${visible.length} trips`, colSpan: 4 },
          null,
          { content: formatCurrency(totalsRow.revenue), align: 'right' },
          { content: formatCurrency(totalsRow.expenses), align: 'right' },
          { content: formatCurrency(totalsRow.profit), align: 'right' },
          { content: '', colSpan: 2 },
        ]}
      />

      {/* View modal */}
      <Modal
        open={Boolean(viewing)}
        onClose={() => setViewing(null)}
        size="lg"
        title={`Trip ${viewing?.id ?? ''}`}
        description={viewing && `${viewing.customerName} · ${formatDate(viewing.date, { long: true })}`}
      >
        {viewing && (
          <div className="space-y-6">
            <dl className="grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-3">
              {[
                ['Status', <Badge key="status" status={viewing.status} dot />],
                ['Destination', viewing.destination],
                ['Package', viewing.packageName],
                ['Starting point', viewing.startingLocation],
                ['Group type', viewing.groupType],
                ['Travellers', `${viewing.travellers} pax`],
                ['Days', `${viewing.days} days`],
                ['Price per person', formatCurrency(viewing.pricePerPerson)],
                ['Total revenue', formatCurrency(viewing.totalRevenue)],
              ].map(([label, value]) => (
                <div key={label}>
                  <dt className="text-[0.625rem] font-bold tracking-[0.14em] text-navy-400 uppercase">{label}</dt>
                  <dd className="mt-1 text-sm font-bold text-navy-900">{value}</dd>
                </div>
              ))}
            </dl>

            <div>
              <h3 className="mb-3 text-xs font-bold tracking-[0.14em] text-navy-400 uppercase">Expense breakdown</h3>
              <ul className="space-y-2.5">
                {EXPENSE_FIELDS.map((field) => {
                  const amount = Number(viewing[field.key]) || 0
                  const share = viewing.totalExpenses ? Math.round((amount / viewing.totalExpenses) * 100) : 0
                  return (
                    <li key={field.key}>
                      <div className="flex items-center justify-between text-xs font-semibold">
                        <span className="text-navy-500">{field.label}</span>
                        <span className="text-navy-900 tabular-nums">
                          {formatCurrency(amount)} · {share}%
                        </span>
                      </div>
                      <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-sand-200">
                        <div className="h-full rounded-full bg-crimson-500" style={{ width: `${share}%` }} />
                      </div>
                    </li>
                  )
                })}
              </ul>
              <div className="mt-4 flex items-center justify-between rounded-2xl bg-navy-950 px-5 py-3.5 text-white">
                <span className="text-sm font-bold">Profit</span>
                <span className={`font-display text-lg font-extrabold tabular-nums ${viewing.profit >= 0 ? 'text-emerald-400' : 'text-crimson-400'}`}>
                  {formatCurrency(viewing.profit)} <span className="text-sm font-bold text-bone-200">· {viewing.margin}%</span>
                </span>
              </div>
            </div>

            {viewing.notes && (
              <div className="rounded-2xl bg-sand-100 p-4">
                <p className="text-[0.625rem] font-bold tracking-[0.14em] text-navy-400 uppercase">Notes</p>
                <p className="mt-1.5 text-sm leading-relaxed text-navy-700">{viewing.notes}</p>
              </div>
            )}
          </div>
        )}
      </Modal>

      <TripForm
        open={formOpen}
        initial={editing}
        busy={saving}
        allTrips={rows}
        onClose={() => {
          setFormOpen(false)
          setEditing(null)
        }}
        onSave={saveTrip}
      />

      <ConfirmDialog
        open={Boolean(deleting)}
        onCancel={() => setDeleting(null)}
        onConfirm={removeTrip}
        title={`Delete trip ${deleting?.id ?? ''}?`}
        message="The trip and its expense breakdown will be removed from the ledger."
        detail="Reports and dashboard figures are derived from this ledger, so they will update immediately."
      />
    </div>
  )
}
