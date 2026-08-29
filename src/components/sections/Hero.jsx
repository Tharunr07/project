import { ChevronDown, ChevronRight } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import SmartImage from '../ui/SmartImage'

/**
 * Cinematic hero used by every customer page.
 *
 *   size="full"    home page — near-full-viewport, optional slow image rotation
 *   size="detail"  destination / package detail pages
 *   size="page"    inner page banner (About, Gallery, Contact …)
 *
 * One component rather than three so the overlay, type scale and breadcrumb
 * behaviour stay identical across the site.
 */

const SIZES = {
  full: 'min-h-[38rem] py-28 sm:min-h-[42rem] lg:min-h-[92svh] lg:py-32',
  detail: 'min-h-[26rem] py-24 sm:min-h-[32rem] lg:py-28',
  page: 'min-h-[18rem] py-20 sm:min-h-[22rem] lg:py-24',
}

/** Visual cadence — a crossfade fires only on ticks where the target is ready. */
const TICK_MS = 700
/** Safety valve: after ~15s of skipped ticks, jump to the nearest READY slide. */
const VALVE_TICKS = Math.round(15000 / TICK_MS)

export default function Hero({
  image,
  images,
  eyebrow,
  title,
  lead,
  size = 'page',
  align = 'left',
  breadcrumb,
  meta,
  actions,
  children,
  className = '',
}) {
  const slides = images?.length ? images : [image].filter(Boolean)
  const [active, setActive] = useState(0)
  const [readySet, setReadySet] = useState(() => new Set())
  const [pending, setPending] = useState(null)
  const skippedTicksRef = useRef(0)

  /** SmartImage reports each frame as decoded; used to gate every transition. */
  const handleSlideReady = useCallback((index) => {
    setReadySet((current) => {
      if (current.has(index)) return current
      const next = new Set(current)
      next.add(index)
      return next
    })
  }, [])

  // Readiness-aware autoplay — replaces the blind interval. The current slide
  // stays fully visible until the NEXT image has decoded; only then does the
  // crossfade run. Valve: if the next frame stays undecoded for ~15s, jump to
  // the nearest READY slide (never an unprepared one), so rotation cannot
  // freeze yet also can never flash a blank/skeleton frame.
  useEffect(() => {
    if (slides.length < 2) return undefined
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return undefined

    const timer = setInterval(() => {
      setActive((current) => {
        if (pending != null) return current // user intent wins over autoplay

        const count = slides.length
        const next = (current + 1) % count
        if (readySet.has(next)) {
          skippedTicksRef.current = 0
          return next
        }

        skippedTicksRef.current += 1
        if (skippedTicksRef.current < VALVE_TICKS) return current
        for (let step = 2; step < count; step += 1) {
          const candidate = (current + step) % count
          if (readySet.has(candidate)) {
            skippedTicksRef.current = 0
            return candidate
          }
        }
        return current // nothing else ready — keep showing the current photo
      })
    }, TICK_MS)

    return () => clearInterval(timer)
  }, [slides.length, readySet, pending])

  // A manually-selected slide transitions only once its image is ready.
  useEffect(() => {
    if (pending == null || !readySet.has(pending)) return
    setActive(pending)
    setPending(null)
    skippedTicksRef.current = 0
  }, [pending, readySet])

  const selectSlide = useCallback(
    (index) => {
      skippedTicksRef.current = 0
      if (index === active) return
      // Unready targets are queued, never shown blank.
      setPending(readySet.has(index) ? null : index)
      setActive(readySet.has(index) ? index : active)
    },
    [active, readySet],
  )

  const centered = align === 'center'

  return (
    <section
      className={`relative isolate flex flex-col justify-end overflow-hidden bg-navy-950 ${
        SIZES[size] ?? SIZES.page
      } ${className}`}
    >
      {/* Background frames.
          `absolute!` is deliberate: SmartImage hard-codes `relative` on its
          wrapper and Tailwind emits `.relative` after `.absolute`, so a plain
          `absolute` loses the cascade — the frames would stack vertically in
          normal flow and every slide after the first would fall outside the
          section's overflow-hidden box, showing bg-navy-950 instead of a photo.

          All frames load eagerly so the next one is decoded before it fades in
          — only the hero is prioritised, the rest of the site stays lazy. */}
      <div className="absolute inset-0 -z-10" aria-hidden="true">
        {slides.map((src, index) => (
          <SmartImage
            key={src}
            src={src}
            alt=""
            loading="eager"
            fetchPriority={index === 0 ? 'high' : 'low'}
            onReady={() => handleSlideReady(index)}
            fallbackSrc={slides[(index + 1) % slides.length]}
            className={`absolute! inset-0 transition-opacity duration-[1600ms] ease-out ${
              index === active ? 'opacity-100' : 'opacity-0'
            }`}
            imgClassName="animate-ken-burns"
          />
        ))}
      </div>

      {/* Legibility scrims — vertical for text, side wash for brand depth */}
      <span
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-linear-to-t from-navy-950 via-navy-950/60 to-navy-950/35"
      />
      <span
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-linear-to-r from-navy-950/80 via-navy-950/20 to-transparent"
      />

      <div className="shell relative">
        <div className={`${centered ? 'mx-auto max-w-3xl text-center' : 'max-w-3xl'}`}>
          {breadcrumb && breadcrumb.length > 0 && (
            <nav
              aria-label="Breadcrumb"
              className={`mb-6 animate-fade-in ${centered ? 'flex justify-center' : ''}`}
            >
              <ol className="flex flex-wrap items-center gap-1.5 text-[0.8125rem] font-medium text-navy-200">
                {breadcrumb.map((crumb, index) => (
                  <li key={crumb.label} className="flex items-center gap-1.5">
                    {index > 0 && (
                      <ChevronRight size={13} className="text-navy-400" aria-hidden="true" />
                    )}
                    {crumb.to ? (
                      <Link to={crumb.to} className="transition-colors hover:text-white">
                        {crumb.label}
                      </Link>
                    ) : (
                      <span className="text-white">{crumb.label}</span>
                    )}
                  </li>
                ))}
              </ol>
            </nav>
          )}

          {eyebrow && (
            <p
              className={`mb-5 inline-flex animate-fade-up items-center gap-2.5 rounded-full bg-white/10 py-2 pr-4 pl-3 text-xs font-bold tracking-[0.16em] text-bone-200 uppercase ring-1 ring-inset ring-white/20 backdrop-blur-sm`}
            >
              <span aria-hidden="true" className="size-1.5 rounded-full bg-brand-500" />
              {eyebrow}
            </p>
          )}

          <h1
            className={`animate-fade-up text-balance text-white ${
              size === 'full'
                ? 'text-[2.5rem] leading-[1.05] sm:text-6xl lg:text-[4.25rem]'
                : size === 'detail'
                  ? 'text-4xl leading-[1.08] sm:text-5xl lg:text-[3.5rem]'
                  : 'text-[2rem] leading-[1.1] sm:text-4xl lg:text-5xl'
            }`}
            style={{ animationDelay: '80ms' }}
          >
            {title}
          </h1>

          {lead && (
            <p
              className={`mt-6 animate-fade-up text-pretty text-[1.0625rem] leading-relaxed text-navy-100 sm:text-lg ${
                centered ? 'mx-auto max-w-2xl' : 'max-w-2xl'
              }`}
              style={{ animationDelay: '160ms' }}
            >
              {lead}
            </p>
          )}

          {meta && meta.length > 0 && (
            <dl
              className={`mt-7 flex animate-fade-up flex-wrap items-center gap-x-6 gap-y-3 ${
                centered ? 'justify-center' : ''
              }`}
              style={{ animationDelay: '200ms' }}
            >
              {meta.map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex items-center gap-2.5">
                  {Icon && (
                    <span
                      aria-hidden="true"
                      className="grid size-9 place-content-center rounded-xl bg-white/10 text-bone-200 ring-1 ring-inset ring-white/15"
                    >
                      <Icon size={16} strokeWidth={2} />
                    </span>
                  )}
                  <div>
                    <dt className="text-[0.625rem] font-bold tracking-[0.14em] text-navy-300 uppercase">
                      {label}
                    </dt>
                    <dd className="text-sm font-bold text-white">{value}</dd>
                  </div>
                </div>
              ))}
            </dl>
          )}

          {actions && (
            <div
              className={`mt-9 flex animate-fade-up flex-wrap gap-3 ${
                centered ? 'justify-center' : ''
              }`}
              style={{ animationDelay: '260ms' }}
            >
              {actions}
            </div>
          )}

          {children}
        </div>
      </div>

      {/* Frame indicators + scroll cue, home page only */}
      {size === 'full' && (
        <div className="shell relative mt-14 flex items-center justify-between gap-6">
          {slides.length > 1 ? (
            <div className="flex items-center gap-2" role="tablist" aria-label="Hero images">
              {slides.map((src, index) => {
                // A queued (not-yet-ready) selection stays highlighted so the
                // click is acknowledged; the fade lands once it decodes.
                const shown = pending ?? active
                return (
                  <button
                    key={src}
                    type="button"
                    role="tab"
                    aria-selected={index === shown}
                    aria-label={`Hero image ${index + 1}`}
                    onClick={() => selectSlide(index)}
                    className={`h-1 cursor-pointer rounded-full transition-all duration-500 ${
                      index === shown ? 'w-10 bg-crimson-500' : 'w-5 bg-white/35 hover:bg-white/60'
                    }`}
                  />
                )
              })}
            </div>
          ) : (
            <span />
          )}

          <span
            aria-hidden="true"
            className="hidden animate-float items-center gap-2 text-[0.6875rem] font-bold tracking-[0.2em] text-navy-200 uppercase sm:flex"
          >
            Scroll
            <ChevronDown size={14} />
          </span>
        </div>
      )}
    </section>
  )
}
