/** Formatting helpers. Indian numbering throughout — ₹3,40,000, not ₹340,000. */

const inr = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
})

const inrPlain = new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 })

/** 340000 → "₹3,40,000" */
export function formatCurrency(value) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return '—'
  return inr.format(Number(value))
}

/** 340000 → "3,40,000" (no symbol — for table cells that carry their own ₹) */
export function formatNumber(value) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return '—'
  return inrPlain.format(Number(value))
}

/**
 * Compact Indian currency for dashboard cards and chart axes.
 * 14000000 → "₹1.4 Cr", 340000 → "₹3.4 L", 8500 → "₹8,500"
 */
export function formatCompactCurrency(value) {
  const n = Number(value)
  if (!Number.isFinite(n)) return '—'
  const sign = n < 0 ? '-' : ''
  const abs = Math.abs(n)
  if (abs >= 10000000) return `${sign}₹${(abs / 10000000).toFixed(abs >= 100000000 ? 0 : 2)} Cr`
  if (abs >= 100000) return `${sign}₹${(abs / 100000).toFixed(abs >= 10000000 ? 0 : 1)} L`
  if (abs >= 1000) return `${sign}₹${inrPlain.format(abs)}`
  return `${sign}₹${abs}`
}

/** Compact plain number — 48200 → "48.2K" */
export function formatCompactNumber(value) {
  const n = Number(value)
  if (!Number.isFinite(n)) return '—'
  if (Math.abs(n) >= 100000) return `${(n / 100000).toFixed(1)}L`
  if (Math.abs(n) >= 1000) return `${(n / 1000).toFixed(1)}K`
  return String(n)
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

/**
 * "2026-06-12" → "12 Jun 2026".
 * Parsed by hand rather than with `new Date(string)` so the result never shifts
 * by a day depending on the viewer's timezone.
 */
export function formatDate(value, { long = false } = {}) {
  if (!value) return '—'
  const [datePart] = String(value).split('T')
  const [y, m, d] = datePart.split('-').map(Number)
  if (!y || !m || !d) return String(value)
  const name = MONTH_NAMES[m - 1]
  return `${d} ${long ? name : name.slice(0, 3)} ${y}`
}

/** "2026-08-23T09:14:00" → "23 Aug 2026, 9:14 AM" */
export function formatDateTime(value) {
  if (!value) return '—'
  const [datePart, timePart = ''] = String(value).split('T')
  const date = formatDate(datePart)
  const [hh, mm] = timePart.split(':').map(Number)
  if (Number.isNaN(hh)) return date
  const suffix = hh >= 12 ? 'PM' : 'AM'
  const hour12 = hh % 12 === 0 ? 12 : hh % 12
  return `${date}, ${hour12}:${String(mm || 0).padStart(2, '0')} ${suffix}`
}

/** 3 → "2 Nights / 3 Days" */
export function formatDuration(days) {
  const n = Number(days) || 0
  if (n <= 1) return '1 Day'
  return `${n - 1} ${n - 1 === 1 ? 'Night' : 'Nights'} / ${n} Days`
}

/** -12.4 → "−12.4%", 8 → "+8%" */
export function formatPercent(value, { withSign = true } = {}) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return '—'
  const n = Number(value)
  const sign = withSign && n > 0 ? '+' : ''
  return `${sign}${n}%`
}

/** "Kerala Backwaters Grand" → "KB" — avatar and empty-state initials. */
export function initials(name = '') {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0].toUpperCase())
    .join('')
}

/** Truncate to a whole word, appending an ellipsis. */
export function truncate(text = '', max = 140) {
  if (text.length <= max) return text
  return `${text.slice(0, text.lastIndexOf(' ', max))}…`
}
