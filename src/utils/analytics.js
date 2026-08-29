import { MONTHS } from '../data/constants'
import { deriveTripTotals } from '../data/trips'

/**
 * Pure reporting analytics — PHASE 2E.
 *
 * Every function accepts a trips array (raw Firestore rows are fine — totals
 * and year/month are derived internally) so Dashboard, Reports, Trip History
 * and any future consumer all compute from ONE live dataset with ONE maths.
 * Return shapes are identical to the Phase 1 module they replace
 * (src/data/analytics.js, kept as reference).
 *
 * Business rules preserved exactly:
 *   • Revenue  = travellers × pricePerPerson (the trip's OWN snapshot)
 *   • Expenses = Σ five expense heads on the trip
 *   • Profit   = Revenue − Expenses; cancelled trips contribute expenses but
 *     no revenue
 */

export const CHART_COLORS = [
  '#c81e2b',
  '#0b1b33',
  '#d19a2b',
  '#3d5480',
  '#e26a74',
  '#2f7d68',
  '#8a6bbd',
  '#c2703a',
]

const isBillable = (trip) => trip.status !== 'Cancelled'

/** Roll a list of trips into one totals object. */
export function totalsFor(list) {
  return (list ?? []).reduce(
    (acc, trip) => {
      const totals = deriveTripTotals(trip)
      acc.trips += 1
      acc.travellers += Number(trip.travellers) || 0
      acc.expenses += totals.totalExpenses
      if (isBillable(trip)) acc.revenue += totals.totalRevenue
      return acc
    },
    { trips: 0, travellers: 0, revenue: 0, expenses: 0 },
  )
}

/** Add derived profit and margin to a totals object. */
export function withProfit(totals) {
  const profit = totals.revenue - totals.expenses
  return {
    ...totals,
    profit,
    margin: totals.revenue > 0 ? Math.round((profit / totals.revenue) * 1000) / 10 : 0,
  }
}

/** Percentage change between two numbers, rounded to one decimal. */
export function percentChange(current, previous) {
  if (!previous) return null
  return Math.round(((current - previous) / previous) * 1000) / 10
}

/* ── Year helpers (safe on empty collections) ─────────────────────────────── */

/** The latest year present in the ledger; falls back to the calendar year. */
export function currentYear(trips) {
  const years = (trips ?? []).map((trip) => Number(String(trip.date ?? '').slice(0, 4)))
  return years.length > 0 ? Math.max(...years) : new Date().getFullYear()
}

/** All years in the ledger, newest first. Empty for an empty ledger. */
export function availableYears(trips) {
  const years = [...new Set((trips ?? []).map((trip) => Number(String(trip.date ?? '').slice(0, 4))))]
  return years.sort((a, b) => b - a)
}

function inYear(trips, year) {
  return (trips ?? []).filter((trip) => Number(String(trip.date ?? '').slice(0, 4)) === year)
}

/* ── Headline figures ─────────────────────────────────────────────────────── */

/** Headline figures for the dashboard cards — the full ledger. */
export function lifetimeTotals(trips) {
  return withProfit(totalsFor(trips))
}

/** Same figures, restricted to the latest year. */
export function currentYearTotals(trips) {
  const year = currentYear(trips)
  return withProfit(totalsFor(inYear(trips, year)))
}

/** Previous year, so the dashboard can show a year-on-year delta. */
export function previousYearTotals(trips) {
  const year = currentYear(trips) - 1
  return withProfit(totalsFor(inYear(trips, year)))
}

/* ── Series ───────────────────────────────────────────────────────────────── */

/**
 * 12 rows, Jan → Dec, for one year.
 * Shape: { month, trips, travellers, revenue, expenses, profit, margin }
 */
export function monthlySeries(trips, year = currentYear(trips)) {
  return MONTHS.map((label, index) => ({
    month: label,
    ...withProfit(totalsFor(inYear(trips, year).filter((trip) => Number(String(trip.date ?? '').slice(5, 7)) === index + 1))),
  }))
}

/** One row per year in the ledger, oldest first. */
export function yearlySeries(trips) {
  return availableYears(trips)
    .sort((a, b) => a - b)
    .map((year) => ({ year: String(year), ...withProfit(totalsFor(inYear(trips, year))) }))
}

function groupBy(list, keyOf) {
  const grouped = new Map()
  for (const trip of list ?? []) {
    const key = keyOf(trip)
    if (!grouped.has(key)) grouped.set(key, [])
    grouped.get(key).push(trip)
  }
  return [...grouped.entries()]
}

/** One row per destination, highest revenue first. Pass `year` to scope. */
export function destinationSeries(trips, year = null) {
  const scope = year ? inYear(trips, year) : trips ?? []
  return groupBy(scope, (trip) => trip.destination)
    .map(([destination, list]) => ({ destination, ...withProfit(totalsFor(list)) }))
    .sort((a, b) => b.revenue - a.revenue)
}

/** One row per group type, highest traveller count first. */
export function groupTypeSeries(trips, year = null) {
  const scope = year ? inYear(trips, year) : trips ?? []
  return groupBy(scope, (trip) => trip.groupType)
    .map(([groupType, list]) => ({ groupType, ...withProfit(totalsFor(list)) }))
    .sort((a, b) => b.travellers - a.travellers)
}

/** One row per package, for the package-performance table. */
export function packageSeries(trips, year = null) {
  const scope = year ? inYear(trips, year) : trips ?? []
  return groupBy(scope, (trip) => trip.packageName)
    .map(([packageName, list]) => ({
      packageName,
      destination: list[0]?.destination,
      /** Lowest and highest price actually charged — shows price drift over time. */
      lowestPrice: Math.min(...list.map((t) => t.pricePerPerson)),
      highestPrice: Math.max(...list.map((t) => t.pricePerPerson)),
      ...withProfit(totalsFor(list)),
    }))
    .sort((a, b) => b.revenue - a.revenue)
}

/** Trip counts by status, for the dashboard status donut. */
export function statusSeries(trips, year = null) {
  const scope = year ? inYear(trips, year) : trips ?? []
  const counts = scope.reduce((acc, trip) => {
    acc[trip.status] = (acc[trip.status] || 0) + 1
    return acc
  }, {})
  return Object.entries(counts).map(([status, count]) => ({ status, count }))
}
