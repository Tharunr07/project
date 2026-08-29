import { Link } from 'react-router-dom'

/**
 * The single button in the app. Renders as <button>, <a> or react-router <Link>
 * depending on which of `to` / `href` / `onClick` is supplied, so nothing
 * downstream ever needs to re-style an anchor to look like a button.
 */

const VARIANTS = {
  primary:
    'bg-brand-600 text-white hover:bg-brand-700 active:bg-brand-800 shadow-glow hover:shadow-lift',
  dark: 'bg-ink-900 text-white hover:bg-ink-800 active:bg-ink-950 shadow-card hover:shadow-lift',
  /* For use on red or ink bands — a warm white that keeps the page to two colours */
  bone: 'bg-bone-50 text-ink-900 hover:bg-white active:bg-bone-100 shadow-card hover:shadow-lift',
  /* Amber. Admin status actions only — never part of the customer-facing brand */
  gold: 'bg-gold-400 text-ink-900 hover:bg-gold-300 active:bg-gold-500 shadow-card hover:shadow-lift',
  outline:
    'border border-ink-200 bg-white text-ink-900 hover:border-brand-600 hover:bg-brand-50 hover:text-brand-700 active:bg-brand-100',
  ghost: 'text-ink-700 hover:bg-ink-100 active:bg-ink-200',
  light:
    'bg-white/10 text-white ring-1 ring-inset ring-white/30 backdrop-blur-sm hover:bg-white/20 active:bg-white/25',
  whatsapp: 'bg-[#1faa59] text-white hover:bg-[#1b9750] active:bg-[#178443] shadow-card hover:shadow-lift',
  danger: 'bg-brand-700 text-white hover:bg-brand-800 active:bg-brand-900 shadow-card',
  subtle: 'bg-paper-100 text-ink-800 hover:bg-paper-200 active:bg-paper-300',
}

const SIZES = {
  xs: 'h-8 gap-1.5 px-3 text-xs',
  sm: 'h-10 gap-2 px-4 text-sm',
  md: 'h-12 gap-2 px-6 text-[0.9375rem]',
  lg: 'h-14 gap-2.5 px-8 text-base',
}

export default function Button({
  variant = 'primary',
  size = 'md',
  to,
  href,
  type = 'button',
  icon: Icon,
  iconRight: IconRight,
  fullWidth = false,
  disabled = false,
  loading = false,
  className = '',
  children,
  ...rest
}) {
  const classes = [
    'inline-flex shrink-0 items-center justify-center rounded-xl font-semibold tracking-tight',
    'transition-all duration-200 ease-out will-change-transform',
    'hover:-translate-y-0.5 active:translate-y-0',
    'disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none',
    VARIANTS[variant] ?? VARIANTS.primary,
    SIZES[size] ?? SIZES.md,
    fullWidth ? 'w-full' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  const iconSize = size === 'xs' ? 14 : size === 'lg' ? 20 : 17

  const content = (
    <>
      {loading ? (
        <span
          aria-hidden="true"
          className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent"
        />
      ) : (
        Icon && <Icon size={iconSize} strokeWidth={2.2} aria-hidden="true" />
      )}
      {children}
      {IconRight && !loading && <IconRight size={iconSize} strokeWidth={2.2} aria-hidden="true" />}
    </>
  )

  if (to && !disabled) {
    return (
      <Link to={to} className={classes} {...rest}>
        {content}
      </Link>
    )
  }

  if (href && !disabled) {
    return (
      <a href={href} target="_blank" rel="noreferrer noopener" className={classes} {...rest}>
        {content}
      </a>
    )
  }

  return (
    <button type={type} className={classes} disabled={disabled || loading} {...rest}>
      {content}
    </button>
  )
}
