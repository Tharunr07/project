import { Award, ArrowRight } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { img } from '../../data/images'
import { company } from '../../data/company'

const AWARDS = [
  'Favourite Tours and Travels Award \u2014 2022',
  'Young Entrepreneur Award \u2014 2022',
]

/**
 * Hook: triggers a cinematic staggered reveal when the section enters viewport.
 * Returns { sectionRef, revealed } — attach sectionRef to the root element.
 */
function useCinematicReveal(threshold = 0.22) {
  const sectionRef = useRef(null)
  const [revealed, setRevealed] = useState(false)

  useEffect(() => {
    const node = sectionRef.current
    if (!node) return undefined

    const prefersReduced =
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    if (prefersReduced || typeof IntersectionObserver === 'undefined') {
      setRevealed(true)
      return undefined
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setRevealed(true)
          observer.disconnect()
        }
      },
      { threshold },
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [threshold])

  return { sectionRef, revealed }
}

/**
 * Hook: subtle parallax for the image. Moves the image slower than the scroll.
 * Only active when the section is in view. Returns a translateY value.
 */
function useParallax(sectionRef, enabled) {
  const [offset, setOffset] = useState(0)
  const ticking = useRef(false)

  const handleScroll = useCallback(() => {
    if (ticking.current) return
    ticking.current = true
    requestAnimationFrame(() => {
      const node = sectionRef.current
      if (node) {
        const rect = node.getBoundingClientRect()
        const windowH = window.innerHeight
        // Only compute when section is in viewport
        if (rect.top < windowH && rect.bottom > 0) {
          // Progress from 0 (section just entering) to 1 (section leaving)
          const progress = (windowH - rect.top) / (windowH + rect.height)
          // Map to -20px to +20px range
          setOffset((progress - 0.5) * 40)
        }
      }
      ticking.current = false
    })
  }, [sectionRef])

  useEffect(() => {
    if (!enabled) return undefined
    const prefersReduced =
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    if (prefersReduced) return undefined

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [enabled, handleScroll])

  return offset
}

export default function CompanyIntroSection() {
  const { sectionRef, revealed } = useCinematicReveal(0.18)
  const parallaxOffset = useParallax(sectionRef, revealed)

  return (
    <section
      ref={sectionRef}
      className="ci-section bg-white py-16 sm:py-20 lg:py-24"
    >
      <div className="shell">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
          {/* ── Left column — Image ─────────────────────────── */}
          <div
            className={`ci-image-wrap ${revealed ? 'ci-image-wrap--revealed' : ''}`}
          >
            <div className="ci-image-container">
              <img
                src="/OFFICE.png"
                alt="Avengers Holidays — premium travel experiences"
                className="ci-image"
                loading="lazy"
                style={{
                  transform: `translateY(${parallaxOffset}px)`,
                }}
              />
              <div className="ci-image-overlay" aria-hidden="true" />
            </div>

            {/* Floating stat badge */}
            <div
              className={`ci-float-badge ${revealed ? 'ci-float-badge--revealed' : ''}`}
            >
              <span className="ci-float-badge__value">{company.since}</span>
              <span className="ci-float-badge__label">Est. Year</span>
            </div>
          </div>

          {/* ── Right column — Text ────────────────────────── */}
          <div className="ci-text">
            {/* Eyebrow */}
            <p
              className={`ci-eyebrow ${revealed ? 'ci-eyebrow--revealed' : ''}`}
            >
              About Avengers Holidays
            </p>

            {/* Gold accent line */}
            <span
              aria-hidden="true"
              className={`ci-gold-line ${revealed ? 'ci-gold-line--revealed' : ''}`}
            />

            {/* Heading */}
            <h2
              className={`ci-heading ${revealed ? 'ci-heading--revealed' : ''}`}
            >
              Your Journey Our Adventure.
            </h2>

            {/* Description */}
            <p
              className={`ci-desc ${revealed ? 'ci-desc--revealed' : ''}`}
            >
              Looking for the best travel agency in Coimbatore to plan your next
              trip? Welcome to Avengers Holidays, your trusted partner for
              memorable and comfortable journeys. With years of experience in
              the travel industry, we specialize in organizing well-planned
              trips that suit every traveler&rsquo;s needs and budget.
            </p>

            <p
              className={`ci-desc ci-desc--second ${revealed ? 'ci-desc--revealed' : ''}`}
            >
              Whether you are planning a family vacation, a honeymoon trip, a
              pilgrimage tour, or a group holiday, our team ensures that every
              detail of your journey is carefully arranged.
            </p>

            {/* CTA */}
            <div
              className={`ci-cta ${revealed ? 'ci-cta--revealed' : ''}`}
            >
              <Link to="/about" className="ci-cta__btn">
                Know More
                <ArrowRight size={16} strokeWidth={2.2} />
              </Link>
            </div>

            {/* Awards */}
            <div
              className={`ci-awards ${revealed ? 'ci-awards--revealed' : ''}`}
            >
              {AWARDS.map((award) => (
                <div key={award} className="ci-awards__item">
                  <span className="ci-awards__icon">
                    <Award size={14} strokeWidth={2} />
                  </span>
                  <span className="ci-awards__text">{award}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
