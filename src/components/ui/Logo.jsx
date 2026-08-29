import { Link } from 'react-router-dom'
import { company } from '../../data/company'

/**
 * Avengers Holidays wordmark. The mark is inline SVG rather than an image file
 * so it stays crisp at every size and can be recoloured for dark headers, the
 * admin sidebar and the printable bill.
 */

const SIZES = {
  sm: { box: 32, title: 'text-[0.9375rem]', sub: 'text-[0.5rem]' },
  md: { box: 40, title: 'text-lg', sub: 'text-[0.5625rem]' },
  lg: { box: 52, title: 'text-2xl', sub: 'text-[0.6875rem]' },
}

export function LogoMark({ size = 40, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      className={className}
      role="img"
      aria-label={`${company.name} emblem`}
    >
      <circle cx="32" cy="32" r="29" fill="currentColor" opacity="0.08" />
      <circle cx="32" cy="32" r="22" fill="none" stroke="currentColor" strokeWidth="3.4" />
      {/* Compass needle — north in gold, south hollow */}
      <path d="M32 10 L43.5 39 L32 32.5 Z" fill="#e4b347" />
      <path d="M32 54 L20.5 25 L32 31.5 Z" fill="currentColor" opacity="0.55" />
      <circle cx="32" cy="32" r="3.6" fill="currentColor" />
    </svg>
  )
}

export default function Logo({
  size = 'md',
  tone = 'dark',
  showTagline = true,
  to = '/',
  className = '',
}) {
  const config = SIZES[size] ?? SIZES.md
  const markColor = tone === 'light' ? 'text-white' : 'text-crimson-600'
  const titleColor = tone === 'light' ? 'text-white' : 'text-navy-900'
  const subColor = tone === 'light' ? 'text-white/60' : 'text-navy-400'

  const inner = (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <LogoMark size={config.box} className={markColor} />
      <span className="flex flex-col leading-none">
        <span
          className={`font-display font-extrabold tracking-tight ${config.title} ${titleColor}`}
        >
          Avengers<span className="text-crimson-500"> Holidays</span>
        </span>
        {showTagline && (
          <span
            className={`mt-1 font-semibold tracking-[0.22em] uppercase ${config.sub} ${subColor}`}
          >
            South India Specialists
          </span>
        )}
      </span>
    </span>
  )

  if (!to) return inner

  return (
    <Link to={to} aria-label={`${company.name} — home`} className="shrink-0">
      {inner}
    </Link>
  )
}
