import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useActiveHappyClients } from '../../firebase/collections/happyClients'
import SmartImage from '../ui/SmartImage'

const ADVANCE_MS = 2500


export default function TestimonialCarousel() {
  const { data: clients, loading, error } = useActiveHappyClients()
  const list = useMemo(() => clients ?? [], [clients])
  const total = list.length

  const [active, setActive] = useState(0)
  const [paused, setPaused] = useState(false)
  const [reducedMotion, setReducedMotion] = useState(false)
  const timerRef = useRef(null)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReducedMotion(mq.matches)
    const handler = (e) => setReducedMotion(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  const advance = useCallback(() => {
    if (total <= 1) return
    setActive((p) => (p + 1) % total)
  }, [total])

  useEffect(() => {
    clearInterval(timerRef.current)
    if (!paused && !reducedMotion && total > 1) {
      timerRef.current = setInterval(advance, ADVANCE_MS)
    }
    return () => clearInterval(timerRef.current)
  }, [paused, reducedMotion, total, advance])

  const go = useCallback(
    (idx) => {
      setActive(idx)
      clearInterval(timerRef.current)
      if (!paused && total > 1) {
        timerRef.current = setInterval(advance, ADVANCE_MS)
      }
    },
    [paused, total, advance],
  )

  const prev = useCallback(() => {
    if (total <= 1) return
    go((active - 1 + total) % total)
  }, [active, total, go])

  const nextSlide = useCallback(() => {
    if (total <= 1) return
    go((active + 1) % total)
  }, [active, total, go])

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'ArrowLeft') prev()
      else if (e.key === 'ArrowRight') nextSlide()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [nextSlide, prev])

  const onEnter = useCallback(() => setPaused(true), [])
  const onLeave = useCallback(() => setPaused(false), [])

  const activeClient = list[active] ?? null

  return (
    <section className="hc-section">
      <div className="hc-section__bg" aria-hidden="true">
        <div className="hc-grid" />
      </div>

      <div className="hc-section__inner">
        <div className="hc-header">
          <p className="hc-header__eyebrow">Memorable journeys. Happy travellers.</p>
          <h2 className="hc-header__title">HAPPY CLIENTS</h2>
          <p className="hc-header__lead">
            Experiences from groups who travelled with Avengers Holidays.
          </p>
        </div>

        {loading ? (
          <div className="hc-gallery" aria-label="Loading testimonials">
            <div className="skeleton hc-skeleton-center" />
          </div>
        ) : error ? (
          <div className="hc-empty">Could not load testimonials</div>
        ) : list.length === 0 ? (
          <div className="hc-empty">Testimonials will appear here once published.</div>
        ) : (
          <>
            {/* Logo Gallery */}
            <div
              className="hc-gallery"
            >
              {list.map((client, i) => {
                let offset = i - active
                if (offset > total / 2) offset -= total
                if (offset < -total / 2) offset += total

                const absOffset = Math.abs(offset)
                const isLeft = offset < 0
                const sign = isLeft ? 1 : (offset > 0 ? -1 : 0)

                const photoSrc = client.logoUrl || `/logo${(i % 5) + 1}.jpg`
                return (
                  <div
                    key={client.id}
                    className={`hc-photo ${absOffset === 0 ? 'hc-photo--active' : ''}`}
                    onClick={() => absOffset !== 0 && go(i)}
                    role={absOffset !== 0 ? 'button' : undefined}
                    tabIndex={absOffset !== 0 ? 0 : undefined}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && absOffset !== 0) go(i)
                    }}
                    aria-label={
                      absOffset !== 0 ? `View ${client.organizationName}` : undefined
                    }
                    data-offset={offset}
                    data-abs-offset={absOffset}
                    style={{
                      '--offset': offset,
                      '--abs-offset': absOffset,
                      '--sign': sign,
                    }}
                  >
                    {photoSrc ? (
                      <SmartImage
                        src={photoSrc}
                        alt={`${client.organizationName} logo`}
                        className="hc-photo-img"
                        loading={absOffset <= 2 ? 'eager' : 'lazy'}
                      />
                    ) : (
                      <div
                        className="hc-photo-img hc-logo-frame--fallback"
                        style={{ display: 'grid', placeContent: 'center' }}
                      >
                        <span>{client.organizationName?.slice(0, 2).toUpperCase()}</span>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            {/* Client Info */}
            {activeClient && (
              <div className="hc-info" key={activeClient.id}>
                <p className="hc-info__name">{activeClient.organizationName}</p>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  )
}
