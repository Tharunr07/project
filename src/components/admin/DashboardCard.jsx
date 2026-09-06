import { TrendingDown, TrendingUp } from 'lucide-react'

/**
 * KPI tile for the dashboard. `delta` is a percentage (positive = growth);
 * pass null when there is nothing to compare against.
 */
const TONES = {
  navy: 'bg-navy-100 text-navy-700',
  crimson: 'bg-crimson-50 text-crimson-600',
  gold: 'bg-gold-100 text-gold-700',
  green: 'bg-emerald-50 text-emerald-600',
  red: 'bg-crimson-50 text-crimson-600',
}

export default function DashboardCard({ icon: Icon, label, value, delta = null, tone = 'navy' }) {
  const positive = delta === null ? true : delta >= 0

  return (
    <article className="rounded-3xl bg-white p-5 shadow-card transition-shadow duration-300 hover:shadow-lift sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <span
          aria-hidden="true"
          className={`grid size-11 place-content-center rounded-2xl ${TONES[tone] ?? TONES.navy}`}
        >
          {Icon && <Icon size={20} strokeWidth={2} />}
        </span>

        {delta !== null && (
          <span
            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[0.6875rem] font-extrabold tabular-nums ${
              positive ? 'bg-emerald-50 text-emerald-700' : 'bg-crimson-50 text-crimson-700'
            }`}
          >
            {positive ? (
              <TrendingUp size={12} strokeWidth={2.5} aria-hidden="true" />
            ) : (
              <TrendingDown size={12} strokeWidth={2.5} aria-hidden="true" />
            )}
            {Math.abs(delta).toFixed(1)}%
          </span>
        )}
      </div>

      <p className="mt-4 font-display text-3xl leading-none font-extrabold text-navy-900 tabular-nums">
        {value}
      </p>
      <p className="mt-2 text-xs font-bold tracking-[0.14em] text-navy-400 uppercase">{label}</p>
    </article>
  )
}
