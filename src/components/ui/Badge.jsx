import { STATUS_TONE } from '../../data/constants'

/**
 * Small status / label pill.
 * Pass `status` to pick up the shared colour map, or `tone` for a fixed colour.
 */

const TONES = {
  neutral: 'bg-paper-200 text-ink-700 ring-paper-300',
  navy: 'bg-ink-100 text-ink-800 ring-ink-200',
  crimson: 'bg-brand-50 text-brand-700 ring-brand-200',
  /* Solid red — reserved for the one thing on a card that must be read first */
  brand: 'bg-brand-600 text-white ring-brand-600',
  gold: 'bg-gold-100 text-gold-700 ring-gold-200',
  green: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  dark: 'bg-ink-900 text-white ring-ink-900',
  glass: 'bg-white/15 text-white ring-white/25 backdrop-blur-sm',
}

const SIZES = {
  xs: 'px-2 py-0.5 text-[0.625rem]',
  sm: 'px-2.5 py-1 text-[0.6875rem]',
  md: 'px-3 py-1.5 text-xs',
}

export default function Badge({
  status,
  tone = 'neutral',
  size = 'sm',
  icon: Icon,
  dot = false,
  className = '',
  children,
}) {
  const palette = status ? (STATUS_TONE[status] ?? TONES.neutral) : (TONES[tone] ?? TONES.neutral)

  return (
    <span
      className={`font-utility inline-flex items-center gap-1.5 rounded-full font-bold tracking-[0.08em] whitespace-nowrap uppercase ring-1 ring-inset ${palette} ${
        SIZES[size] ?? SIZES.sm
      } ${className}`}
    >
      {dot && <span aria-hidden="true" className="size-1.5 rounded-full bg-current" />}
      {Icon && <Icon size={12} strokeWidth={2.5} aria-hidden="true" />}
      {children ?? status}
    </span>
  )
}
