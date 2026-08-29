import { AlertOctagon, RefreshCw, SearchX } from 'lucide-react'
import Button from './Button'

/**
 * Loading / empty / error states.
 *
 * Every list and detail screen routes through these three so nothing ever shows
 * a blank rectangle. Grouped in one file because they are always considered
 * together — a screen that uses one uses all three.
 */

/** Grey shimmer block. */
export function Skeleton({ className = '' }) {
  return <div aria-hidden="true" className={`skeleton rounded-xl ${className}`} />
}

/** Card-shaped placeholder grid, matching the real card proportions. */
export function CardSkeletonGrid({ count = 6, className = 'sm:grid-cols-2 lg:grid-cols-3' }) {
  return (
    <div className={`grid gap-6 ${className}`} aria-hidden="true">
      {Array.from({ length: count }, (_, index) => (
        <div key={index} className="overflow-hidden rounded-3xl bg-white shadow-card">
          <Skeleton className="aspect-4/3 rounded-none" />
          <div className="space-y-3 p-5">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-5/6" />
            <div className="flex items-center justify-between pt-2">
              <Skeleton className="h-6 w-24" />
              <Skeleton className="h-9 w-28 rounded-full" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

/** Table-shaped placeholder, for admin list screens. */
export function TableSkeleton({ rows = 8, columns = 5 }) {
  return (
    <div className="space-y-px overflow-hidden rounded-2xl bg-sand-100" aria-hidden="true">
      {Array.from({ length: rows }, (_, r) => (
        <div key={r} className="flex items-center gap-4 bg-white px-5 py-4">
          {Array.from({ length: columns }, (_, c) => (
            <Skeleton key={c} className={`h-4 ${c === 0 ? 'w-40' : 'flex-1'}`} />
          ))}
        </div>
      ))}
    </div>
  )
}

/** Centred spinner with a message — for whole-panel loads. */
export function LoadingState({ label = 'Loading…', className = '' }) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={`grid place-items-center gap-4 py-20 text-center ${className}`}
    >
      <span
        aria-hidden="true"
        className="size-9 animate-spin rounded-full border-[3px] border-sand-300 border-t-crimson-600"
      />
      <p className="text-sm font-medium text-navy-500">{label}</p>
    </div>
  )
}

/** Nothing to show — optionally with a call to action. */
export function EmptyState({
  icon: Icon = SearchX,
  title = 'Nothing here yet',
  message,
  action,
  className = '',
}) {
  return (
    <div
      className={`grid place-items-center gap-4 rounded-3xl border border-dashed border-sand-300 bg-sand-50 px-6 py-16 text-center ${className}`}
    >
      <span
        aria-hidden="true"
        className="grid size-14 place-content-center rounded-2xl bg-white text-navy-300 shadow-card"
      >
        <Icon size={24} strokeWidth={1.7} />
      </span>
      <div className="max-w-sm">
        <h3 className="text-lg text-navy-900">{title}</h3>
        {message && <p className="mt-2 text-sm leading-relaxed text-navy-500">{message}</p>}
      </div>
      {action}
    </div>
  )
}

/** Something failed — always offers a retry. */
export function ErrorState({
  title = 'Something went wrong',
  message = 'We could not load this section. Please try again.',
  onRetry,
  className = '',
}) {
  return (
    <div
      role="alert"
      className={`grid place-items-center gap-4 rounded-3xl border border-crimson-200 bg-crimson-50 px-6 py-16 text-center ${className}`}
    >
      <span
        aria-hidden="true"
        className="grid size-14 place-content-center rounded-2xl bg-white text-crimson-600 shadow-card"
      >
        <AlertOctagon size={24} strokeWidth={1.7} />
      </span>
      <div className="max-w-sm">
        <h3 className="text-lg text-navy-900">{title}</h3>
        <p className="mt-2 text-sm leading-relaxed text-navy-600">{message}</p>
      </div>
      {onRetry && (
        <Button variant="outline" size="sm" icon={RefreshCw} onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  )
}
