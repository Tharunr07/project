import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import Rating from '../ui/Rating'
import SmartImage from '../ui/SmartImage'
import { initials } from '../../utils/format'

/**
 * Luxury editorial featured testimonial.
 *
 * Displays one dominant review at a time with a destination photograph.
 * Navigation is minimal and editorial (← Previous  01/06  Next →).
 */
export default function TestimonialCarousel({ reviews = [] }) {
  const [active, setActive] = useState(0)
  const [transitioning, setTransitioning] = useState(false)
  const [imageReady, setImageReady] = useState(false)
  const sectionRef = useRef(null)
  const [inView, setInView] = useState(false)

  const total = reviews.length

  /* IntersectionObserver for entrance animation */
  useEffect(() => {
    const node = sectionRef.current
    if (!node) return undefined
    const io = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setInView(true) },
      { threshold: 0.15 },
    )
    io.observe(node)
    return () => io.disconnect()
  }, [])

  const goTo = useCallback((index) => {
    if (transitioning || index === active) return
    setTransitioning(true)
    setImageReady(false)
    setTimeout(() => {
      setActive(index)
      setTimeout(() => setTransitioning(false), 50)
    }, 400)
  }, [active, transitioning])

  const prev = useCallback(() => {
    goTo(active === 0 ? total - 1 : active - 1)
  }, [active, total, goTo])

  const next = useCallback(() => {
    goTo(active === total - 1 ? 0 : active + 1)
  }, [active, total, goTo])

  useEffect(() => {
    setImageReady(false)
  }, [active])

  if (total === 0) return null

  const review = reviews[active]
  const initials_ = initials(review.name)

  return (
    <section
      ref={sectionRef}
      className={`testi-editorial ${inView ? 'testi-editorial--in' : ''}`}
    >
      {/* ---- Editorial header ---- */}
      <div className="testi-editorial__header">
        <p className="testi-editorial__eyebrow">Traveller reviews</p>
        <h2 className="testi-editorial__heading">Stories from the road</h2>
        <p className="testi-editorial__lead">
          Real journeys, shared by travellers who trusted us with theirs.
        </p>
      </div>

      {/* ---- Featured review ---- */}
      <div className="testi-editorial__body">
        {/* LEFT: quote + info */}
        <div className="testi-editorial__content">
          {/* Large decorative quote */}
          <span aria-hidden="true" className="testi-editorial__quote-mark">&ldquo;</span>

          {/* Testimonial text */}
          <blockquote
            className={`testi-editorial__text ${!transitioning ? 'testi-editorial__text--in' : ''}`}
          >
            {review.review}
          </blockquote>

          {/* Traveller info */}
          <div className={`testi-editorial__traveller ${!transitioning ? 'testi-editorial__traveller--in' : ''}`}>
            <div className="testi-editorial__avatar">
              {review.avatar ? (
                <SmartImage
                  src={review.avatar}
                  alt={review.name}
                  className="size-full rounded-full object-cover"
                />
              ) : (
                <span className="grid size-full place-content-center rounded-full text-sm font-bold text-bone-100 bg-white/10">
                  {initials_}
                </span>
              )}
            </div>

            <div>
              <p className="testi-editorial__name">{review.name}</p>
              <p className="testi-editorial__meta">
                {review.destination || review.trip}
                {review.groupType && <>{' · '}{review.groupType}</>}
              </p>
            </div>

            <div className="ml-auto">
              <Rating value={review.rating} size="sm" />
            </div>
          </div>
        </div>

        {/* RIGHT: image */}
        <div className="testi-editorial__image-wrap">
          <div className={`testi-editorial__image-inner ${!transitioning ? 'testi-editorial__image-inner--in' : ''}`}>
            {review.avatar ? (
              <SmartImage
                src={review.avatar}
                alt={`Travel photo for ${review.name}'s trip to ${review.destination || review.trip}`}
                className={`testi-editorial__img ${imageReady ? 'testi-editorial__img--ready' : ''}`}
                onLoad={() => setImageReady(true)}
              />
            ) : (
              <div className="testi-editorial__img testi-editorial__img--placeholder" />
            )}
          </div>
        </div>
      </div>

      {/* ---- Navigation ---- */}
      <div className="testi-editorial__nav">
        <button
          type="button"
          onClick={prev}
          aria-label="Previous review"
          className="testi-editorial__nav-btn"
        >
          <ChevronLeft size={18} strokeWidth={2} aria-hidden="true" />
          <span>Previous</span>
        </button>

        <div className="testi-editorial__counter">
          <span className="testi-editorial__counter-current">
            {String(active + 1).padStart(2, '0')}
          </span>
          <span className="testi-editorial__counter-sep">/</span>
          <span className="testi-editorial__counter-total">
            {String(total).padStart(2, '0')}
          </span>
        </div>

        <button
          type="button"
          onClick={next}
          aria-label="Next review"
          className="testi-editorial__nav-btn"
        >
          <span>Next</span>
          <ChevronRight size={18} strokeWidth={2} aria-hidden="true" />
        </button>
      </div>

      {/* ---- Gold progress line ---- */}
      <div className="testi-editorial__progress">
        <div
          className="testi-editorial__progress-fill"
          style={{ width: `${((active + 1) / total) * 100}%` }}
        />
      </div>
    </section>
  )
}
