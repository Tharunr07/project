import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ComposedChart,
  Legend,
  Line,
  Pie,
  PieChart,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { useMemo, useState } from 'react'
import ChartCard, { AXIS_PROPS, tooltipStyle } from '../../components/admin/ChartCard'
import { DataTable, CellStack } from '../../components/admin/DataTable'
import { ErrorState, LoadingState } from '../../components/ui/States'
import { useTrips, withDerivedTrip } from '../../firebase/collections/trips'
import {
  availableYears,
  CHART_COLORS,
  destinationSeries,
  groupTypeSeries,
  monthlySeries,
  yearlySeries,
} from '../../utils/analytics'
import { formatCompactCurrency, formatCurrency } from '../../utils/format'

const TABS = [
  { value: 'monthly', label: 'Monthly' },
  { value: 'yearly', label: 'Yearly' },
  { value: 'destination', label: 'Destination' },
  { value: 'group', label: 'Group type' },
]

const compactTick = (value) => formatCompactCurrency(value)
const legendStyle = { fontSize: 12, fontWeight: 600, paddingTop: 8 }

/** Stat chips reused at the top of every tab. */
function StatChips({ rows }) {
  const totals = rows.reduce(
    (acc, row) => ({
      trips: acc.trips + row.trips,
      travellers: acc.travellers + row.travellers,
      revenue: acc.revenue + row.revenue,
      expenses: acc.expenses + row.expenses,
      profit: acc.profit + row.profit,
    }),
    { trips: 0, travellers: 0, revenue: 0, expenses: 0, profit: 0 },
  )

  return (
    <dl className="grid grid-cols-2 gap-3 sm:grid-cols-5">
      {[
        ['Trips', totals.trips.toLocaleString('en-IN'), false],
        ['Travellers', totals.travellers.toLocaleString('en-IN'), false],
        ['Revenue', formatCompactCurrency(totals.revenue), true],
        ['Expenses', formatCompactCurrency(totals.expenses), true],
        ['Profit', formatCompactCurrency(totals.profit), true],
      ].map(([label, value, money]) => (
        <div key={label} className="rounded-2xl bg-white px-4 py-3.5 shadow-card">
          <dt className="text-[0.625rem] font-bold tracking-[0.14em] text-navy-400 uppercase">{label}</dt>
          <dd
            className={`mt-1 font-display text-xl font-extrabold tabular-nums ${
              money && label === 'Profit'
                ? totals.profit >= 0
                  ? 'text-emerald-600'
                  : 'text-crimson-600'
                : 'text-navy-900'
            }`}
          >
            {value}
          </dd>
        </div>
      ))}
    </dl>
  )
}

export default function AdminReports() {
  // Same live trips subscription as Dashboard and Trip History — one dataset,
  // one maths, so every report always agrees with the ledger.
  const { data: rawTrips, loading, error, reload } = useTrips()
  const ledger = useMemo(() => (rawTrips ?? []).map(withDerivedTrip), [rawTrips])

  const [tab, setTab] = useState('monthly')
  const years = useMemo(() => availableYears(ledger), [ledger])
  const [selectedYear, setSelectedYear] = useState('')
  const year = selectedYear || String(years[0] ?? new Date().getFullYear())

  const monthly = useMemo(() => monthlySeries(ledger, Number(year)), [ledger, year])
  const yearly = useMemo(() => yearlySeries(ledger), [ledger])
  const byDestination = useMemo(() => destinationSeries(ledger, Number(year)), [ledger, year])
  const byGroup = useMemo(() => groupTypeSeries(ledger, Number(year)), [ledger, year])

  if (loading) {
    return (
      <div className="py-16">
        <LoadingState label="Building reports…" />
      </div>
    )
  }

  if (error) {
    return <ErrorState title="Could not load reports" message={error.message} onRetry={reload} />
  }

  return (
    <div className="space-y-5">
      {/* Tab bar + year scope */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-3xl bg-white p-4 shadow-card sm:p-5">
        <div className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1 py-1" role="tablist" aria-label="Report type">
          {TABS.map((option) => (
            <button
              key={option.value}
              type="button"
              role="tab"
              aria-selected={tab === option.value}
              onClick={() => setTab(option.value)}
              className={`shrink-0 cursor-pointer rounded-full px-5 py-2.5 text-sm font-semibold transition-all ${
                tab === option.value
                  ? 'bg-crimson-600 text-white shadow-glow'
                  : 'bg-sand-100 text-navy-600 hover:bg-sand-200 hover:text-navy-900'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>

        {(tab === 'monthly' || tab === 'destination' || tab === 'group') && (
          <label className="flex items-center gap-2 text-sm font-semibold text-navy-500">
            Year
            <select
              id="reports-year"
              value={year}
              onChange={(event) => setSelectedYear(event.target.value)}
              className="h-11 cursor-pointer rounded-xl border border-sand-300 bg-white px-3 font-bold text-navy-900 focus:border-navy-500 focus:ring-2 focus:ring-navy-200 focus:outline-none"
            >
              {years.map((option) => (
                <option key={option} value={String(option)}>
                  {option}
                </option>
              ))}
            </select>
          </label>
        )}
      </div>

      {/* ── Monthly ─────────────────────────────────────────────────────── */}
      {tab === 'monthly' && (
        <>
          <StatChips rows={monthly} />

          <ChartCard title={`Monthly analysis · ${year}`} subtitle="Revenue, expenses and profit per month">
            <ComposedChart data={monthly} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid vertical={false} stroke="#eae4d9" />
              <XAxis dataKey="month" {...AXIS_PROPS} />
              <YAxis {...AXIS_PROPS} tickFormatter={compactTick} />
              <Tooltip {...tooltipStyle()} formatter={(value, name) => [formatCurrency(value), name]} />
              <Legend wrapperStyle={legendStyle} iconType="circle" iconSize={8} />
              <Bar dataKey="revenue" name="Revenue" fill={CHART_COLORS[0]} radius={[5, 5, 0, 0]} maxBarSize={20} />
              <Bar dataKey="expenses" name="Expenses" fill={CHART_COLORS[3]} radius={[5, 5, 0, 0]} maxBarSize={20} />
              <Line dataKey="profit" name="Profit" stroke={CHART_COLORS[2]} strokeWidth={2.6} dot={false} type="monotone" />
            </ComposedChart>
          </ChartCard>

          <DataTable
            keyField="month"
            minWidth={760}
            columns={[
              { key: 'month', header: 'Month', emphasis: true, render: (row) => <span className="font-bold text-navy-900">{row.month}</span> },
              { key: 'trips', header: 'Trips', align: 'right', render: (row) => row.trips || <span className="text-navy-300">—</span> },
              { key: 'travellers', header: 'Travellers', align: 'right', render: (row) => row.travellers || <span className="text-navy-300">—</span> },
              { key: 'revenue', header: 'Revenue', align: 'right', render: (row) => (row.revenue ? formatCurrency(row.revenue) : <span className="text-navy-300">—</span>) },
              { key: 'expenses', header: 'Expenses', align: 'right', render: (row) => (row.expenses ? formatCurrency(row.expenses) : <span className="text-navy-300">—</span>) },
              {
                key: 'profit',
                header: 'Profit',
                align: 'right',
                render: (row) =>
                  row.revenue || row.expenses ? (
                    <span className={`font-bold tabular-nums ${row.profit >= 0 ? 'text-emerald-600' : 'text-crimson-600'}`}>
                      {formatCurrency(row.profit)}
                    </span>
                  ) : (
                    <span className="text-navy-300">—</span>
                  ),
              },
            ]}
            rows={monthly}
            loading={false}
            error={null}
            emptyTitle={`No activity in ${year}`}
            emptyMessage="Pick another year to see its monthly analysis."
          />
        </>
      )}

      {/* ── Yearly ──────────────────────────────────────────────────────── */}
      {tab === 'yearly' && (
        <>
          <StatChips rows={yearly} />

          <div className="grid gap-5 lg:grid-cols-2">
            <ChartCard title="Year-over-year trips" subtitle="Trips operated per calendar year">
              <BarChart data={yearly} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                <CartesianGrid vertical={false} stroke="#eae4d9" />
                <XAxis dataKey="year" {...AXIS_PROPS} />
                <YAxis allowDecimals={false} {...AXIS_PROPS} />
                <Tooltip {...tooltipStyle()} cursor={{ fill: 'rgba(11,27,51,0.04)' }} formatter={(value) => [`${value} trips`, null]} />
                <Bar dataKey="trips" name="Trips" fill={CHART_COLORS[0]} radius={[6, 6, 0, 0]} maxBarSize={44} />
              </BarChart>
            </ChartCard>

            <ChartCard title="Year-over-year P&L" subtitle="Revenue vs expenses vs profit">
              <ComposedChart data={yearly} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid vertical={false} stroke="#eae4d9" />
                <XAxis dataKey="year" {...AXIS_PROPS} />
                <YAxis {...AXIS_PROPS} tickFormatter={compactTick} />
                <Tooltip {...tooltipStyle()} formatter={(value, name) => [formatCurrency(value), name]} />
                <Legend wrapperStyle={legendStyle} iconType="circle" iconSize={8} />
                <Bar dataKey="revenue" name="Revenue" fill={CHART_COLORS[0]} radius={[5, 5, 0, 0]} maxBarSize={26} />
                <Bar dataKey="expenses" name="Expenses" fill={CHART_COLORS[3]} radius={[5, 5, 0, 0]} maxBarSize={26} />
                <Line dataKey="profit" name="Profit" stroke={CHART_COLORS[2]} strokeWidth={2.6} dot={{ r: 3 }} type="monotone" />
              </ComposedChart>
            </ChartCard>
          </div>

          <DataTable
            keyField="year"
            minWidth={720}
            columns={[
              { key: 'year', header: 'Year', emphasis: true, render: (row) => <span className="font-bold text-navy-900">{row.year}</span> },
              { key: 'trips', header: 'Trips', align: 'right' },
              { key: 'travellers', header: 'Travellers', align: 'right' },
              { key: 'revenue', header: 'Revenue', align: 'right', render: (row) => formatCurrency(row.revenue) },
              { key: 'expenses', header: 'Expenses', align: 'right', render: (row) => formatCurrency(row.expenses) },
              {
                key: 'profit',
                header: 'Profit',
                align: 'right',
                render: (row) => (
                  <span className={`font-bold tabular-nums ${row.profit >= 0 ? 'text-emerald-600' : 'text-crimson-600'}`}>
                    {formatCurrency(row.profit)}
                  </span>
                ),
              },
            ]}
            rows={[...yearly].reverse()}
            loading={false}
            error={null}
            emptyTitle="No historical years yet"
          />
        </>
      )}

      {/* ── Destination-wise ────────────────────────────────────────────── */}
      {tab === 'destination' && (
        <>
          <StatChips rows={byDestination} />

          <ChartCard title={`Destination performance · ${year}`} subtitle="Revenue per destination" height={Math.max(byDestination.length * 46 + 60, 240)}>
            <BarChart data={byDestination} layout="vertical" margin={{ top: 4, right: 16, left: 8, bottom: 0 }}>
              <CartesianGrid horizontal={false} stroke="#eae4d9" />
              <XAxis type="number" {...AXIS_PROPS} tickFormatter={compactTick} />
              <YAxis type="category" dataKey="destination" width={120} {...AXIS_PROPS} />
              <Tooltip {...tooltipStyle()} cursor={{ fill: 'rgba(11,27,51,0.04)' }} formatter={(value) => [formatCurrency(value), 'Revenue']} />
              <Bar dataKey="revenue" name="Revenue" radius={[0, 7, 7, 0]} maxBarSize={26}>
                {byDestination.map((entry, index) => (
                  <Cell key={entry.destination} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ChartCard>

          <DataTable
            keyField="destination"
            minWidth={640}
            columns={[
              { key: 'destination', header: 'Destination', emphasis: true, render: (row) => <CellStack primary={<span className="font-bold text-navy-900">{row.destination}</span>} secondary={`${row.trips} trips`} /> },
              { key: 'travellers', header: 'Travellers', align: 'right' },
              { key: 'revenue', header: 'Revenue', align: 'right', render: (row) => formatCurrency(row.revenue) },
            ]}
            rows={byDestination}
            loading={false}
            error={null}
            emptyTitle={`No trips recorded in ${year}`}
          />
        </>
      )}

      {/* ── Group-type ──────────────────────────────────────────────────── */}
      {tab === 'group' && (
        <>
          <StatChips rows={byGroup} />

          <div className="grid gap-5 lg:grid-cols-[1fr_1.2fr]">
            <ChartCard title="Traveller share" subtitle={`By group type · ${year}`} height={280}>
              <PieChart>
                <Tooltip {...tooltipStyle()} formatter={(value, name, item) => [formatCurrency(item?.payload?.revenue ?? 0), `${name} · revenue`]} />
                <Legend wrapperStyle={legendStyle} iconType="circle" iconSize={8} />
                <Pie data={byGroup} dataKey="travellers" nameKey="groupType" innerRadius="50%" outerRadius="80%" paddingAngle={2} stroke="none">
                  {byGroup.map((entry, index) => (
                    <Cell key={entry.groupType} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
                </Pie>
              </PieChart>
            </ChartCard>

            <DataTable
              keyField="groupType"
              minWidth={520}
              columns={[
                { key: 'groupType', header: 'Group type', emphasis: true, render: (row) => <CellStack primary={<span className="font-bold text-navy-900">{row.groupType}</span>} secondary={`${row.trips} trips`} /> },
                { key: 'travellers', header: 'Travellers', align: 'right' },
                { key: 'revenue', header: 'Revenue', align: 'right', render: (row) => formatCurrency(row.revenue) },
              ]}
              rows={byGroup}
              loading={false}
              error={null}
              emptyTitle={`No group travel in ${year}`}
            />
          </div>
        </>
      )}
    </div>
  )
}
