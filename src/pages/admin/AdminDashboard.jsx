import {
  IndianRupee,
  MapPinned,
  PiggyBank,
  Receipt,
  Users,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import {
  Area,
  AreaChart,
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
import ChartCard, { AXIS_PROPS, tooltipStyle } from '../../components/admin/ChartCard'
import DashboardCard from '../../components/admin/DashboardCard'
import { LoadingState, ErrorState } from '../../components/ui/States'
import { useTrips, withDerivedTrip } from '../../firebase/collections/trips'
import {
  availableYears,
  CHART_COLORS,
  currentYearTotals,
  destinationSeries,
  groupTypeSeries,
  lifetimeTotals,
  monthlySeries,
  percentChange,
  previousYearTotals,
} from '../../utils/analytics'
import { formatCompactCurrency, formatCurrency } from '../../utils/format'

const compactTick = (value) => formatCompactCurrency(value)

/** Legend text styling shared by the labelled charts. */
const legendStyle = { fontSize: 12, fontWeight: 600, paddingTop: 8 }

export default function AdminDashboard() {
  // ONE live trips subscription — the same source Trip History and Reports use.
  const { data: rawTrips, loading, error, reload } = useTrips()
  const ledger = useMemo(() => (rawTrips ?? []).map(withDerivedTrip), [rawTrips])

  const years = useMemo(() => availableYears(ledger), [ledger])
  const [selectedYear, setSelectedYear] = useState('')
  /** Falls back to the newest ledger year until the user picks one. */
  const year = selectedYear || String(years[0] ?? new Date().getFullYear())

  const monthly = useMemo(() => monthlySeries(ledger, Number(year)), [ledger, year])
  const destinations = useMemo(() => destinationSeries(ledger, Number(year)).slice(0, 6), [ledger, year])
  const groupTypes = useMemo(() => groupTypeSeries(ledger, Number(year)), [ledger, year])

  const lifetime = useMemo(() => lifetimeTotals(ledger), [ledger])
  const thisYear = useMemo(() => currentYearTotals(ledger), [ledger])
  const lastYear = useMemo(() => previousYearTotals(ledger), [ledger])

  if (loading) {
    return (
      <div className="py-16">
        <LoadingState label="Crunching the ledger…" />
      </div>
    )
  }

  if (error) {
    return (
      <ErrorState
        title="Could not load dashboard figures"
        message={error.message}
        onRetry={reload}
      />
    )
  }

  /** KPI cards compare the latest ledger year against the year before it. */
  const cards = [
    {
      icon: MapPinned,
      label: 'Total Trips',
      value: lifetime.trips.toLocaleString('en-IN'),
      delta: percentChange(thisYear.trips, lastYear.trips),
      tone: 'navy',
    },
    {
      icon: Users,
      label: 'Total Travellers',
      value: lifetime.travellers.toLocaleString('en-IN'),
      delta: percentChange(thisYear.travellers, lastYear.travellers),
      tone: 'navy',
    },
    {
      icon: IndianRupee,
      label: 'Total Revenue',
      value: formatCompactCurrency(lifetime.revenue),
      delta: percentChange(thisYear.revenue, lastYear.revenue),
      tone: 'crimson',
    },
    {
      icon: Receipt,
      label: 'Total Expenses',
      value: formatCompactCurrency(lifetime.expenses),
      delta: percentChange(thisYear.expenses, lastYear.expenses),
      tone: 'gold',
    },
    {
      icon: PiggyBank,
      label: 'Total Profit',
      value: formatCompactCurrency(lifetime.profit),
      delta: percentChange(thisYear.profit, lastYear.profit),
      tone: lifetime.profit >= 0 ? 'green' : 'red',
    },
  ]

  return (
    <div className="space-y-6">
      {/* Heading + chart-year selector */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="font-display text-xl font-extrabold text-navy-900">Business overview</h2>
          <p className="mt-1 text-sm font-medium text-navy-500">
            Lifetime figures below · charts show{' '}
            <span className="font-bold text-navy-800">{year}</span>
          </p>
        </div>

        <label className="flex items-center gap-2 text-sm font-semibold text-navy-500">
          Chart year
          <select
            id="dash-year"
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
      </div>

      {/* KPI cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {cards.map((card) => (
          <DashboardCard key={card.label} {...card} />
        ))}
      </div>

      {/* Charts */}
      <div className="grid gap-5 lg:grid-cols-2">
        <ChartCard title="Monthly trips" subtitle={`Trips operated per month · ${year}`}>
          <BarChart data={monthly} margin={{ top: 4, right: 8, left: -18, bottom: 0 }}>
            <CartesianGrid vertical={false} stroke="#eae4d9" />
            <XAxis dataKey="month" {...AXIS_PROPS} />
            <YAxis allowDecimals={false} {...AXIS_PROPS} />
            <Tooltip {...tooltipStyle()} formatter={(value) => [`${value} trips`, null]} />
            <Bar dataKey="trips" name="Trips" fill={CHART_COLORS[0]} radius={[6, 6, 0, 0]} maxBarSize={34} />
          </BarChart>
        </ChartCard>

        <ChartCard title="Revenue, expenses & profit" subtitle={`Monthly P&L · ${year}`}>
          <ComposedChart data={monthly} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid vertical={false} stroke="#eae4d9" />
            <XAxis dataKey="month" {...AXIS_PROPS} />
            <YAxis {...AXIS_PROPS} tickFormatter={compactTick} />
            <Tooltip
              {...tooltipStyle()}
              formatter={(value, name) => [formatCurrency(value), name]}
            />
            <Legend wrapperStyle={legendStyle} iconType="circle" iconSize={8} />
            <Bar dataKey="revenue" name="Revenue" fill={CHART_COLORS[0]} radius={[5, 5, 0, 0]} maxBarSize={22} />
            <Bar dataKey="expenses" name="Expenses" fill={CHART_COLORS[3]} radius={[5, 5, 0, 0]} maxBarSize={22} />
            <Line
              dataKey="profit"
              name="Profit"
              stroke={CHART_COLORS[2]}
              strokeWidth={2.6}
              dot={false}
              type="monotone"
            />
          </ComposedChart>
        </ChartCard>

        <ChartCard title="Traveller count" subtitle={`People moved per month · ${year}`}>
          <AreaChart data={monthly} margin={{ top: 4, right: 8, left: -18, bottom: 0 }}>
            <defs>
              <linearGradient id="dash-travellers" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={CHART_COLORS[3]} stopOpacity={0.35} />
                <stop offset="100%" stopColor={CHART_COLORS[3]} stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} stroke="#eae4d9" />
            <XAxis dataKey="month" {...AXIS_PROPS} />
            <YAxis allowDecimals={false} {...AXIS_PROPS} />
            <Tooltip {...tooltipStyle()} formatter={(value) => [`${value} travellers`, null]} />
            <Area
              dataKey="travellers"
              name="Travellers"
              stroke={CHART_COLORS[3]}
              strokeWidth={2.4}
              fill="url(#dash-travellers)"
              type="monotone"
            />
          </AreaChart>
        </ChartCard>

        <ChartCard title="Group type distribution" subtitle={`Share of travellers · ${year}`}>
          <PieChart>
            <Tooltip
              {...tooltipStyle()}
              formatter={(value, name) => [`${value} travellers`, name]}
            />
            <Legend wrapperStyle={legendStyle} iconType="circle" iconSize={8} />
            <Pie
              data={groupTypes}
              dataKey="travellers"
              nameKey="groupType"
              innerRadius="52%"
              outerRadius="80%"
              paddingAngle={2}
              stroke="none"
            >
              {groupTypes.map((entry, index) => (
                <Cell key={entry.groupType} fill={CHART_COLORS[index % CHART_COLORS.length]} />
              ))}
            </Pie>
          </PieChart>
        </ChartCard>
      </div>

      <ChartCard
        title="Destination performance"
        subtitle={`Top destinations by revenue · ${year}`}
        height={280}
      >
        <BarChart
          data={destinations}
          layout="vertical"
          margin={{ top: 4, right: 16, left: 8, bottom: 0 }}
        >
          <CartesianGrid horizontal={false} stroke="#eae4d9" />
          <XAxis type="number" {...AXIS_PROPS} tickFormatter={compactTick} />
          <YAxis type="category" dataKey="destination" width={120} {...AXIS_PROPS} />
          <Tooltip
            {...tooltipStyle()}
            cursor={{ fill: 'rgba(11,27,51,0.04)' }}
            formatter={(value, name, item) =>
              name === 'Revenue'
                ? [formatCurrency(value), `Revenue · ${item?.payload?.trips ?? 0} trips`]
                : [value, name]
            }
          />
          <Bar dataKey="revenue" name="Revenue" fill={CHART_COLORS[0]} radius={[0, 7, 7, 0]} maxBarSize={26}>
            {destinations.map((entry, index) => (
              <Cell key={entry.destination} fill={index === 0 ? CHART_COLORS[0] : '#e26a74'} />
            ))}
          </Bar>
        </BarChart>
      </ChartCard>
    </div>
  )
}
