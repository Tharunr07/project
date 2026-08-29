import { MONTHS } from './constants'
import trips from './trips'

/**
 * Reporting aggregates.
 *
 * Everything here is DERIVED from the trip ledger rather than hand-written, so
 * the dashboard cards, the seven dashboard charts and all four report screens
 * can never disagree with each other or with Trip History.
 *
 * Cancelled trips are excluded from revenue and profit, but their (sunk)
 * expenses are still counted — that is how the business actually experiences a
 * cancellation.
 *
 * Phase 2 note: replace these functions with Firestore aggregation queries or a
 * pre-computed `reports/*` collection. The return shapes are what the charts
 * consume, so keep them identical.
 */

const isBillable = (trip) => trip.status !== 'Cancelled'

/** The latest year present in the ledger — treated as "this year" everywhere. */
export const currentYear = Math.max(...trips.map((t) => t.year))

export const availableYears = [...new Set(trips.map((t) => t.year))].sort((a, b) => b - a)

/** Roll a list of trips into one totals object. */
export function totalsFor(list) {
  return list.reduce(
    (acc, trip) => {
      acc.trips += 1
      acc.travellers += trip.travellers
      acc.expenses += trip.totalExpenses
      if (isBillable(trip)) acc.revenue += trip.totalRevenue
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

/** Headline figures for the dashboard cards — the full ledger. */
export const lifetimeTotals = withProfit(totalsFor(trips))

/** Same figures, restricted to the current year. */
export const currentYearTotals = withProfit(totalsFor(trips.filter((t) => t.year === currentYear)))

/** Previous year, so the dashboard cards can show a year-on-year delta. */
export const previousYearTotals = withProfit(
  totalsFor(trips.filter((t) => t.year === currentYear - 1)),
)

/** Percentage change between two numbers, rounded to one decimal. */
export function percentChange(current, previous) {
  if (!previous) return null
  return Math.round(((current - previous) / previous) * 1000) / 10
}

/**
 * 12 rows, Jan → Dec, for one year.
 * Shape: { month, trips, travellers, revenue, expenses, profit, margin }
 */
export function monthlySeries(year = currentYear) {
  return MONTHS.map((label, index) => {
    const monthTrips = trips.filter((t) => t.year === year && t.month === index + 1)
    return { month: label, ...withProfit(totalsFor(monthTrips)) }
  })
}

/** One row per year in the ledger, oldest first — for the yearly report. */
export function yearlySeries() {
  return [...availableYears]
    .sort((a, b) => a - b)
    .map((year) => ({
      year: String(year),
      ...withProfit(totalsFor(trips.filter((t) => t.year === year))),
    }))
}

/** One row per destination, highest revenue first. */
export function destinationSeries(year = null) {
  const scope = year ? trips.filter((t) => t.year === year) : trips
  const grouped = new Map()
  for (const trip of scope) {
    if (!grouped.has(trip.destination)) grouped.set(trip.destination, [])
    grouped.get(trip.destination).push(trip)
  }
  return [...grouped.entries()]
    .map(([destination, list]) => ({ destination, ...withProfit(totalsFor(list)) }))
    .sort((a, b) => b.revenue - a.revenue)
}

/** One row per group type, highest traveller count first. */
export function groupTypeSeries(year = null) {
  const scope = year ? trips.filter((t) => t.year === year) : trips
  const grouped = new Map()
  for (const trip of scope) {
    if (!grouped.has(trip.groupType)) grouped.set(trip.groupType, [])
    grouped.get(trip.groupType).push(trip)
  }
  return [...grouped.entries()]
    .map(([groupType, list]) => ({ groupType, ...withProfit(totalsFor(list)) }))
    .sort((a, b) => b.travellers - a.travellers)
}

/** One row per package, for the package-performance table. */
export function packageSeries(year = null) {
  const scope = year ? trips.filter((t) => t.year === year) : trips
  const grouped = new Map()
  for (const trip of scope) {
    if (!grouped.has(trip.packageName)) grouped.set(trip.packageName, [])
    grouped.get(trip.packageName).push(trip)
  }
  return [...grouped.entries()]
    .map(([packageName, list]) => ({
      packageName,
      destination: list[0].destination,
      /** Lowest and highest price actually charged — shows price drift over time. */
      lowestPrice: Math.min(...list.map((t) => t.pricePerPerson)),
      highestPrice: Math.max(...list.map((t) => t.pricePerPerson)),
      ...withProfit(totalsFor(list)),
    }))
    .sort((a, b) => b.revenue - a.revenue)
}

/** Trip counts by status, for the dashboard status donut. */
export function statusSeries(year = null) {
  const scope = year ? trips.filter((t) => t.year === year) : trips
  const counts = scope.reduce((acc, trip) => {
    acc[trip.status] = (acc[trip.status] || 0) + 1
    return acc
  }, {})
  return Object.entries(counts).map(([status, count]) => ({ status, count }))
}

/** Chart palette, ordered. Shared by every Recharts surface in the admin portal. */
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
