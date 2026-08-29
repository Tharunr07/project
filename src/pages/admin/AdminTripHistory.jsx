import { History, Info, RotateCcw } from 'lucide-react'
import { useMemo, useState } from 'react'
import { CellStack, DataTable } from '../../components/admin/DataTable'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import FormInput from '../../components/ui/FormInput'
import SearchInput from '../../components/ui/SearchInput'
import { useToast } from '../../context/AdminToastContext'
import { GROUP_TYPES, MONTHS, TRIP_STATUSES } from '../../data/constants'
import { usePackages } from '../../firebase/collections/packages'
import { useTrips, withDerivedTrip } from '../../firebase/collections/trips'
import { formatCurrency, formatDate } from '../../utils/format'

const ALL = 'All'

/**
 * The full ledger with every filter the office actually asks for.
 *
 * The "Booked rate" column is deliberately independent of today's package
 * price: a 2024 Ooty trip keeps its ₹8,500 rate even though the current
 * package sells at ₹9,500 — the delta badge makes that visible at a glance.
 */
export default function AdminTripHistory() {
  const toast = useToast()
  const { rows: rawRows, loading, error, reload } = useTrips()
  const { data: packageRows } = usePackages()

  // Derived figures + year/month facets recomputed from the live rows.
  const rows = useMemo(() => (rawRows ?? []).map(withDerivedTrip), [rawRows])

  const [query, setQuery] = useState('')
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [month, setMonth] = useState(ALL)
  const [year, setYear] = useState(ALL)
  const [destination, setDestination] = useState(ALL)
  const [packageName, setPackageName] = useState(ALL)
  const [groupType, setGroupType] = useState(ALL)
  const [status, setStatus] = useState(ALL)

  /** Distinct values present in the ledger, for the filter dropdowns. */
  const facets = useMemo(() => {
    const unique = (values) => [...new Set(values)].sort()
    return {
      years: unique(rows.map((trip) => String(trip.year))).reverse(),
      destinations: unique(rows.map((trip) => trip.destination)),
      packages: unique(rows.map((trip) => trip.packageName)),
    }
  }, [rows])

  const currentPriceByPackage = useMemo(() => {
    const map = new Map()
    for (const pkg of packageRows ?? []) map.set(pkg.name, pkg.price)
    return map
  }, [packageRows])

  const visible = useMemo(() => {
    const term = query.trim().toLowerCase()
    return rows.filter((trip) => {
      if (term && ![trip.id, trip.customerName].join(' ').toLowerCase().includes(term)) return false
      if (fromDate && trip.date < fromDate) return false
      if (toDate && trip.date > toDate) return false
      if (month !== ALL && trip.month !== MONTHS.indexOf(month) + 1) return false
      if (year !== ALL && String(trip.year) !== year) return false
      if (destination !== ALL && trip.destination !== destination) return false
      if (packageName !== ALL && trip.packageName !== packageName) return false
      if (groupType !== ALL && trip.groupType !== groupType) return false
      if (status !== ALL && trip.status !== status) return false
      return true
    })
  }, [rows, query, fromDate, toDate, month, year, destination, packageName, groupType, status])

  const activeFilters =
    [
      query.trim() !== '',
      fromDate !== '',
      toDate !== '',
      month !== ALL,
      year !== ALL,
      destination !== ALL,
      packageName !== ALL,
      groupType !== ALL,
      status !== ALL,
    ].filter(Boolean).length

  const clearFilters = () => {
    setQuery('')
    setFromDate('')
    setToDate('')
    setMonth(ALL)
    setYear(ALL)
    setDestination(ALL)
    setPackageName(ALL)
    setGroupType(ALL)
    setStatus(ALL)
    toast('Filters cleared', 'info')
  }

  return (
    <div className="space-y-5">
      {/* Data rule explainer */}
      <div className="flex items-start gap-3.5 rounded-3xl bg-navy-950 px-5 py-4 text-white sm:items-center sm:px-6">
        <Info size={19} className="mt-0.5 shrink-0 text-brand-400 sm:mt-0" aria-hidden="true" />
        <p className="text-[0.8125rem] leading-relaxed text-navy-200">
          Historical prices are frozen at booking time. Example:{' '}
          <strong className="font-bold text-white">
            TRP-2024-212 · 40 people × ₹8,500 = ₹3,40,000
          </strong>{' '}
          stays on the old rate even though today's Ooty package lists{' '}
          <strong className="font-bold text-bone-200">₹9,500</strong>. Editing a package never
          rewrites this history.
        </p>
      </div>

      {/* Filter bar */}
      <div className="space-y-4 rounded-3xl bg-white p-4 shadow-card sm:p-5">
        <div className="grid gap-3 lg:grid-cols-[1fr_12rem_12rem]">
          <SearchInput
            value={query}
            onChange={setQuery}
            placeholder="Search customer / group or trip ID…"
            label="Search trips"
          />
          <FormInput id="hist-from" type="date" label="From date" value={fromDate} onChange={(event) => setFromDate(event.target.value)} />
          <FormInput id="hist-to" type="date" label="To date" value={toDate} onChange={(event) => setToDate(event.target.value)} />
        </div>

        <div className="grid gap-3 border-t border-sand-200 pt-4 sm:grid-cols-2 lg:grid-cols-6">
          <FilterSelect id="hist-month" label="Month" value={month} onChange={setMonth} options={[ALL, ...MONTHS]} allLabel={ALL} />
          <FilterSelect id="hist-year" label="Year" value={year} onChange={setYear} options={[ALL, ...facets.years]} allLabel={ALL} />
          <FilterSelect id="hist-destination" label="Destination" value={destination} onChange={setDestination} options={[ALL, ...facets.destinations]} allLabel={ALL} />
          <FilterSelect id="hist-package" label="Package" value={packageName} onChange={setPackageName} options={[ALL, ...facets.packages]} allLabel={ALL} />
          <FilterSelect id="hist-group" label="Group type" value={groupType} onChange={setGroupType} options={[ALL, ...GROUP_TYPES]} allLabel={ALL} />
          <FilterSelect id="hist-status" label="Status" value={status} onChange={setStatus} options={[ALL, ...TRIP_STATUSES]} allLabel={ALL} />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-sand-200 pt-4">
          <p className="text-sm font-semibold text-navy-500">
            <span className="font-extrabold text-navy-900">{visible.length}</span> of {rows.length}{' '}
            trips
            {activeFilters > 0 && (
              <>
                {' '}
                · {activeFilters} filter{activeFilters === 1 ? '' : 's'} active
              </>
            )}
          </p>
          {activeFilters > 0 && (
            <Button variant="outline" size="xs" icon={RotateCcw} onClick={clearFilters}>
              Reset filters
            </Button>
          )}
        </div>
      </div>

      <DataTable
        minWidth={1060}
        columns={[
          {
            key: 'id',
            header: 'Trip',
            minWidth: 180,
            emphasis: true,
            render: (trip) => <CellStack primary={trip.id} secondary={formatDate(trip.date)} />,
          },
          {
            key: 'customerName',
            header: 'Customer / group',
            minWidth: 210,
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
            minWidth: 220,
            render: (trip) => <CellStack primary={trip.destination} secondary={trip.packageName} />,
          },
          {
            key: 'pricePerPerson',
            header: 'Booked rate',
            align: 'right',
            render: (trip) => (
              <span className="whitespace-nowrap font-bold text-navy-900 tabular-nums">
                {formatCurrency(trip.pricePerPerson)}
                <span className="ml-1 font-medium text-navy-400">×{trip.travellers}</span>
              </span>
            ),
          },
          {
            key: 'drift',
            header: 'Rate now',
            align: 'center',
            render: (trip) => {
              const currentPrice = currentPriceByPackage.get(trip.packageName)
              if (currentPrice === undefined || currentPrice === trip.pricePerPerson) {
                return <Badge tone="neutral" size="xs">Same as list</Badge>
              }
              return (
                <button
                  type="button"
                  title={`This trip ran at ${formatCurrency(trip.pricePerPerson)}; the ${trip.packageName} package currently lists at ${formatCurrency(currentPrice)}.`}
                  className="cursor-pointer"
                >
                  <Badge tone="gold" size="xs">Now {formatCurrency(currentPrice)}</Badge>
                </button>
              )
            },
          },
          {
            key: 'totalRevenue',
            header: 'Revenue',
            align: 'right',
            render: (trip) => (
              <span className="font-bold whitespace-nowrap text-navy-900 tabular-nums">
                {formatCurrency(trip.totalRevenue)}
              </span>
            ),
          },
          {
            key: 'profit',
            header: 'Profit',
            align: 'right',
            render: (trip) => (
              <span
                className={`font-bold tabular-nums ${
                  trip.profit >= 0 ? 'text-emerald-600' : 'text-crimson-600'
                }`}
              >
                {formatCurrency(trip.profit)}
              </span>
            ),
          },
          { key: 'status', header: 'Status', align: 'center', render: (trip) => <Badge status={trip.status} dot /> },
        ]}
        rows={visible}
        loading={loading}
        error={error}
        onRetry={reload}
        emptyIcon={History}
        emptyTitle="No trips match those filters"
        emptyMessage="Loosen a filter or reset them to see the whole ledger."
        emptyAction={
          <Button variant="outline" size="sm" icon={RotateCcw} onClick={clearFilters}>
            Reset filters
          </Button>
        }
      />
    </div>
  )
}

function FilterSelect({ id, label, value, onChange, options, allLabel }) {
  return (
    <label htmlFor={id} className="block">
      <span className="mb-1 block text-[0.6875rem] font-bold tracking-[0.1em] text-navy-400 uppercase">
        {label}
      </span>
      <select
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-11 w-full cursor-pointer rounded-xl border border-sand-300 bg-white px-3 text-sm font-semibold text-navy-900 focus:border-navy-500 focus:ring-2 focus:ring-navy-200 focus:outline-none"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option === allLabel ? `All ${label.toLowerCase()}s` : option}
          </option>
        ))}
      </select>
    </label>
  )
}
