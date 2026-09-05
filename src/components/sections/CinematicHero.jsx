import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
const SLIDES = [
  {
    eyebrow: 'SOUTH INDIA \u2022 SCHOOL TRIPS',
    headline: 'Memories that last beyond the classroom.',
    body: 'Safe, exciting and memorable journeys designed for students, teachers and schools across South India.',
    cta: 'Explore School Trips',
    ctaTo: '/enquire?groupType=School',
    secondary: 'Enquire Now',
    secondaryTo: '/enquire?groupType=School',
    image: '/school-trip.jpg',
  },
  {
    eyebrow: 'SOUTH INDIA \u2022 COLLEGE TRIPS',
    headline: 'Your crew. Your journey. Your story.',
    body: 'Experience unforgettable college trips with exciting destinations, comfortable travel and carefully planned itineraries.',
    cta: 'Explore College Trips',
    ctaTo: '/enquire?groupType=College',
    secondary: 'Enquire Now',
    secondaryTo: '/enquire?groupType=College',
    image: '/college-trip.jpg',
  },
  {
    eyebrow: 'SOUTH INDIA \u2022 FAMILY TRIPS',
    headline: 'Bring everyone together.',
    body: 'Relax, explore and create unforgettable family memories with journeys planned around your comfort.',
    cta: 'Explore Family Trips',
    ctaTo: '/enquire?groupType=Family',
    secondary: 'Enquire Now',
    secondaryTo: '/enquire?groupType=Family',
    image: '/family-trip.jpg',
  },
  {
    eyebrow: 'SOUTH INDIA \u2022 OTHER TRIPS',
    headline: 'Every journey has a reason.',
    body: 'From friends and corporate groups to customized journeys, we\u2019ll help you plan a trip made for your group.',
    cta: 'Plan Your Trip',
    ctaTo: '/enquire',
    secondary: 'Contact Us',
    secondaryTo: '/contact',
    image: '/other-trip.jpg',
  },
]

const DISPLAY_MS = 2000
const TRANSITION_MS = 1200

export default function CinematicHero() {
  const [active, setActive] = useState(0)
  const [transitioning, setTransitioning] = useState(false)

  const timerRef = useRef(null)
  const transitionRef = useRef(null)
  const pausedRef = useRef(false)
  const activeRef = useRef(0)

  const prefersReduced =
    typeof window !== 'undefined' &&
    window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

  /* ── Clear all timers ──────────────────────────────────────── */
  const clearAll = useCallback(() => {
    clearInterval(timerRef.current)
    clearTimeout(transitionRef.current)
    timerRef.current = null
    transitionRef.current = null
  }, [])

  /* ── Go to slide (with optional immediate skip of transition lock) ─ */
  const goTo = useCallback(
    (index, immediate = false) => {
      if (index === activeRef.current && !immediate) return
      clearAll()
      setTransitioning(true)
      setActive(index)
      activeRef.current = index

      transitionRef.current = setTimeout(() => {
        setTransitioning(false)
        /* Start next autoplay cycle unless paused */
        if (!pausedRef.current && !prefersReduced) {
          timerRef.current = setInterval(() => {
            if (!pausedRef.current) {
              const nextIdx = (activeRef.current + 1) % SLIDES.length
              goTo(nextIdx)
            }
          }, DISPLAY_MS)
        }
      }, TRANSITION_MS)
    },
    [clearAll, prefersReduced],
  )

  /* ── Start initial autoplay ────────────────────────────────── */
  useEffect(() => {
    if (prefersReduced) return undefined
    timerRef.current = setInterval(() => {
      if (!pausedRef.current) {
        goTo((activeRef.current + 1) % SLIDES.length)
      }
    }, DISPLAY_MS)
    return clearAll
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  /* ── Signal navbar to appear (matches old LandingIntro contract) ── */
  useEffect(() => {
    const id = setTimeout(() => {
      window.dispatchEvent(new Event('hero-complete'))
    }, 600)
    return () => clearTimeout(id)
  }, [])

  /* ── Pause / resume ────────────────────────────────────────── */
  const pauseAutoplay = useCallback(() => {
    pausedRef.current = true
    clearInterval(timerRef.current)
    timerRef.current = null
  }, [])

  const resumeAutoplay = useCallback(() => {
    pausedRef.current = false
    if (!transitioning && !prefersReduced) {
      clearInterval(timerRef.current)
      timerRef.current = setInterval(() => {
        if (!pausedRef.current) {
          goTo((activeRef.current + 1) % SLIDES.length)
        }
      }, DISPLAY_MS)
    }
  }, [transitioning, prefersReduced, goTo])

  /* ── Manual navigation ─────────────────────────────────────── */
  const next = useCallback(() => {
    pausedRef.current = false
    goTo((activeRef.current + 1) % SLIDES.length, true)
  }, [goTo])

  const prev = useCallback(() => {
    pausedRef.current = false
    goTo((activeRef.current - 1 + SLIDES.length) % SLIDES.length, true)
  }, [goTo])

  /* ── Keyboard ──────────────────────────────────────────────── */
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'ArrowLeft') prev()
      else if (e.key === 'ArrowRight') next()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [next, prev])

  /* ── Touch swipe ───────────────────────────────────────────── */
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
      onMouseEnter={pauseAutoplay}
      onMouseLeave={resumeAutoplay}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      role="region"
      aria-label="Hero slider"
    >
      {/* ── Background slides ──────────────────────────────────── */}
      <div className="cinematic-hero__bg" aria-hidden="true">
        {SLIDES.map((slide, i) => (
          <div
            key={i}
            className={`cinematic-hero__slide ${i === active ? 'cinematic-hero__slide--active' : ''}`}
          >
            <img src={slide.image} alt="" className="cinematic-hero__img" />
          </div>
        ))}
      </div>

      {/* ── Overlays ───────────────────────────────────────────── */}
      <span className="cinematic-hero__scrim" aria-hidden="true" />
      <span className="cinematic-hero__scrim-side" aria-hidden="true" />
      <span className="cinematic-hero__scrim-bottom" aria-hidden="true" />

      {/* ── Text content ───────────────────────────────────────── */}
      <div className="cinematic-hero__content">
        {SLIDES.map((slide, i) => (
          <div
            key={i}
            className={`cinematic-hero__text ${i === active ? 'cinematic-hero__text--active' : ''}`}
          >
            <p className="cinematic-hero__eyebrow">
              <span className="cinematic-hero__eyebrow-dot" aria-hidden="true" />
              {slide.eyebrow}
            </p>

            <h1 className="cinematic-hero__headline">{slide.headline}</h1>

            <p className="cinematic-hero__body">{slide.body}</p>

            <div className="cinematic-hero__ctas">
              <Link to={slide.ctaTo} className="cinematic-hero__cta-primary">
                {slide.cta}
                <span aria-hidden="true" className="cinematic-hero__cta-arrow">&rarr;</span>
              </Link>
              <Link to={slide.secondaryTo} className="cinematic-hero__cta-secondary">
                {slide.secondary}
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* ── Navigation arrows ──────────────────────────────────── */}
      <button type="button" className="cinematic-hero__nav cinematic-hero__nav--prev" onClick={prev} aria-label="Previous slide">
        <ChevronLeft size={20} />
      </button>
      <button type="button" className="cinematic-hero__nav cinematic-hero__nav--next" onClick={next} aria-label="Next slide">
        <ChevronRight size={20} />
      </button>

      {/* ── Scroll cue ─────────────────────────────────────────── */}
      <div className="cinematic-hero__scroll" aria-hidden="true">
        <span className="cinematic-hero__scroll-text">Scroll to explore</span>
        <svg className="cinematic-hero__scroll-icon" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M7 1v12M3 9l4 4 4-4" />
        </svg>
      </div>
    </section>
  )
}
