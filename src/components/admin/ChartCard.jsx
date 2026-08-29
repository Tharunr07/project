import { ResponsiveContainer } from 'recharts'

/**
 * White panel wrapper for every Recharts surface. The chart itself is passed
 * as children and gets a responsive container of the given height.
 */
export default function ChartCard({
  title,
  subtitle,
  actions,
  height = 300,
  className = '',
  children,
}) {
  return (
    <section className={`rounded-3xl bg-white p-5 shadow-card sm:p-6 ${className}`}>
      {(title || actions) && (
        <header className="mb-5 flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            {title && <h2 className="font-display text-base font-extrabold text-navy-900">{title}</h2>}
            {subtitle && <p className="mt-0.5 text-xs font-medium text-navy-400">{subtitle}</p>}
          </div>
          {actions}
        </header>
      )}

      <div style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          {children}
        </ResponsiveContainer>
      </div>
    </section>
  )
}

/** Shared axis/tooltip styling so every chart reads identically. */
export const AXIS_PROPS = {
  tick: { fontSize: 11, fill: '#93a6c6', fontFamily: 'inherit' },
  stroke: '#eae4d9',
  tickLine: false,
}

export function tooltipStyle() {
  return {
    contentStyle: {
      borderRadius: 14,
      border: '1px solid #eae4d9',
      boxShadow: '0 12px 32px -18px rgba(11,27,51,0.28)',
      fontSize: 12,
      fontWeight: 600,
    },
    labelStyle: { color: '#0b1b33', fontWeight: 800, marginBottom: 4 },
    itemStyle: { padding: 0 },
    cursor: { fill: 'rgba(11,27,51,0.04)' },
  }
}
