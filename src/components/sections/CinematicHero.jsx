import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { whatsappLink } from '../../data/company'

const IMAGES = [
  '/1.jpeg',
  '/2.jpeg',
  '/3.jpeg',
  '/4.jpeg',
  '/5.jpeg',
]

const DISPLAY_MS = 2000
const COUNT = IMAGES.length

export default function CinematicHero() {
  const [active, setActive] = useState(0)
  const timerRef = useRef(null)
  const pausedRef = useRef(false)

  const startTimer = useCallback(() => {
    clearInterval(timerRef.current)
    timerRef.current = setInterval(() => {
      if (!pausedRef.current) {
        setActive((prev) => (prev + 1) % COUNT)
      }
    }, DISPLAY_MS)
  }, [])

  const stopTimer = useCallback(() => {
    clearInterval(timerRef.current)
    timerRef.current = null
  }, [])

  useEffect(() => {
    const mq = window.matchMedia?.('(prefers-reduced-motion: reduce)')
    if (!mq?.matches) startTimer()
    return stopTimer
  }, [startTimer, stopTimer])

  useEffect(() => {
    const id = setTimeout(() => {
      window.dispatchEvent(new Event('hero-complete'))
    }, 600)
    return () => clearTimeout(id)
  }, [])

  const goTo = useCallback(
    (next) => {
      setActive(next)
      if (!pausedRef.current) startTimer()
    },
    [startTimer],
  )

  const next = useCallback(() => goTo((active + 1) % COUNT), [goTo, active])
  const prev = useCallback(() => goTo((active - 1 + COUNT) % COUNT), [goTo, active])

  const pauseAutoplay = useCallback(() => {
    pausedRef.current = true
    stopTimer()
  }, [stopTimer])

  const resumeAutoplay = useCallback(() => {
    pausedRef.current = false
    startTimer()
  }, [startTimer])

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'ArrowLeft') prev()
      else if (e.key === 'ArrowRight') next()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [next, prev])

  const touchX = useRef(0)
  const onTouchStart = useCallback((e) => {
    touchX.current = e.touches[0].clientX
  }, [])
  const onTouchEnd = useCallback(
    (e) => {
      const diff = touchX.current - e.changedTouches[0].clientX
      if (Math.abs(diff) > 50) {
        if (diff > 0) next(); else prev()
      }
    },
    [next, prev],
  )

  return (
    <section
      className="cinematic-hero"
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      role="region"
      aria-label="Hero slider"
    >
      <div className="cinematic-hero__bg" aria-hidden="true">
        {IMAGES.map((src, i) => (
          <div
            key={i}
            className={`cinematic-hero__slide ${i === active ? 'cinematic-hero__slide--active' : ''}`}
          >
            <img src={src} alt="" className="cinematic-hero__img" />
          </div>
        ))}
      </div>

      <span className="cinematic-hero__scrim" aria-hidden="true" />

      <div className="cinematic-hero__content">
        <div className="cinematic-hero__text cinematic-hero__text--active">
          <h1 className="cinematic-hero__heading">
            <span className="cinematic-hero__brand">Avengers</span>
            <span className="cinematic-hero__tagline">Your Journey Our Adventure.</span>
          </h1>

          <p className="cinematic-hero__body">
            India is full of places waiting to be discovered,<br />
            let Avengers turn every destination into your next unforgettable story.
          </p>

          <div className="cinematic-hero__ctas">
            <Link to="/contact" className="cinematic-hero__cta-primary">
              CONTACT US
              <span aria-hidden="true" className="cinematic-hero__cta-arrow">&rarr;</span>
            </Link>

            <div className="cinematic-hero__cta-social">
              <a
                href={whatsappLink()}
                target="_blank"
                rel="noopener noreferrer"
                className="cinematic-hero__cta-whatsapp"
                aria-label="Chat on WhatsApp"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" width="15" height="15">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                WhatsApp
              </a>
              <a
                href="https://www.instagram.com/avengers_holidays?stkn=MXEydTk4dG43dmdrbA=="
                target="_blank"
                rel="noopener noreferrer"
                className="cinematic-hero__cta-instagram"
                aria-label="Follow on Instagram"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" width="15" height="15">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
                Instagram
              </a>
            </div>
          </div>
        </div>
      </div>

      <button type="button" className="cinematic-hero__nav cinematic-hero__nav--prev" onClick={prev} aria-label="Previous slide">
        <ChevronLeft size={20} />
      </button>
      <button type="button" className="cinematic-hero__nav cinematic-hero__nav--next" onClick={next} aria-label="Next slide">
        <ChevronRight size={20} />
      </button>

      <div className="cinematic-hero__scroll" aria-hidden="true">
        <span className="cinematic-hero__scroll-text">Scroll to explore</span>
        <svg className="cinematic-hero__scroll-icon" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M7 1v12M3 9l4 4 4-4" />
        </svg>
      </div>
    </section>
  )
}
