import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { imageUrl } from '../../data/images'
import Rating from '../ui/Rating'
import SmartImage from '../ui/SmartImage'

const TESTI_BG = imageUrl('mountainRoad', 1600)
const AUTOPLAY_MS = 5000

const SLIDES = [
  {
    name: 'Priya & Arjun Mehta',
    meta: 'Family trip · Munnar & Thekkady',
    groupType: 'Family of 5',
    review:
      'Our family had the most wonderful time exploring Munnar and Thekkady. The kids loved the elephant sanctuary and we all enjoyed the houseboat ride. Avengers Holidays handled every detail — the resorts were beautiful, the driver was punctual and friendly, and we never once had to worry about logistics. It truly felt like a stress-free holiday.',
    image: imageUrl('familyBeach', 1200),
  },
  {
    name: 'Vikram Rajesh & Friends',
    meta: 'Group trip · Coorg & Wayanad',
    groupType: 'Friends group of 8',
    review:
      'Eight of us booked a weekend escape to Coorg and Wayanad, and the whole trip was seamlessly organised. The jungle safari, the coffee plantation walk, the campfire night — every activity was perfectly timed. What impressed us most was how the team adapted on the fly when one campsite was fully booked and upgraded us without any hassle.',
    image: imageUrl('friendsVan', 1200),
  },
  {
    name: 'Loyola College, Chennai',
    meta: 'College trip · Ooty & Coonoor',
    groupType: 'Student group of 42',
    review:
      'Our college group of 42 students had an incredible time in Ooty and Coonoor. Avengers Holidays managed the entire itinerary — buses, meals, accommodation, and activities — without a single hiccup. The students loved the toy train ride and the botanical gardens. The coordination was top-notch and the pricing was very student-friendly.',
    image: imageUrl('hillRailway', 1200),
  },
]

export default function TestimonialCarousel() {
  const [active, setActive] = useState(0)
  const [transitioning, setTransitioning] = useState(false)
  const [paused, setPaused] = useState(false)
  const sectionRef = useRef(null)
  const timerRef = useRef(null)
  const [inView, setInView] = useState(false)

  const total = SLIDES.length

  /* Respect prefers-reduced-motion */
  const reducedMotion = useMemo(() => {
    if (typeof window === 'undefined') return false
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches
  }, [])

  /* IntersectionObserver — only animate when visible */
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
    setTimeout(() => {
      setActive(index)
      setTimeout(() => setTransitioning(false), 50)
    }, reducedMotion ? 0 : 400)
  }, [active, transitioning, reducedMotion])

  const prev = useCallback(() => {
    goTo(active === 0 ? total - 1 : active - 1)
  }, [active, total, goTo])

  const next = useCallback(() => {
    goTo(active === total - 1 ? 0 : active + 1)
  }, [active, total, goTo])

  /* Autoplay timer */
  useEffect(() => {
    if (reducedMotion || paused || transitioning) {
      clearInterval(timerRef.current)
      timerRef.current = null
      return undefined
    }
    timerRef.current = setInterval(() => {
      setActive((cur) => (cur === total - 1 ? 0 : cur + 1))
      setTransitioning(true)
      setTimeout(() => setTransitioning(false), 50)
    }, AUTOPLAY_MS)
    return () => clearInterval(timerRef.current)
  }, [paused, transitioning, reducedMotion, total])

  /* Pause on hover */
  const onEnter = useCallback(() => setPaused(true), [])
  const onLeave = useCallback(() => setPaused(false), [])

  const slide = SLIDES[active]

  return (
    <section
      ref={sectionRef}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      className={`testi-editorial ${inView ? 'testi-editorial--in' : ''}`}
    >
      {/* Dark travel background */}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-20 bg-cover bg-center bg-no-repeat opacity-30"
        style={{ backgroundImage: `url(${TESTI_BG})` }}
      />

      {/* Dark vignette overlay */}
      <span
        aria-hidden="true"
        className="absolute inset-0 -z-10"
        style={{
          background:
            'radial-gradient(ellipse 70% 60% at 50% 40%, rgba(8,8,10,0.50) 0%, rgba(6,6,8,0.75) 60%, rgba(4,4,6,0.90) 100%)',
        }}
      />

      {/* Subtle crimson glow — upper-right */}
      <span
        aria-hidden="true"
        className="absolute -top-20 -right-16 -z-[5] size-[26rem] rounded-full bg-crimson-600/[0.08] blur-[100px]"
      />
      {/* Subtle amber glow — lower-left */}
      <span
        aria-hidden="true"
        className="absolute -bottom-24 -left-20 -z-[5] size-[22rem] rounded-full bg-amber-500/[0.06] blur-[90px]"
      />

      <div className="shell relative z-10 px-4 sm:px-6">
        {/* ---- Editorial header ---- */}
        <div className="testi-editorial__header">
          <p className="testi-editorial__eyebrow">Happy clients</p>
          <h2 className="testi-editorial__heading">Memories that made the journey worth it.</h2>
          <p className="testi-editorial__lead">
            Real experiences from students, teachers, and coordinators who travelled with Avengers Holidays.
          </p>
        </div>

        {/* ---- Carousel body ---- */}
        <div className="testi-editorial__body">
          {/* LEFT: quote + info */}
          <div className="testi-editorial__content">
            {/* Large decorative quote */}
            <span aria-hidden="true" className="testi-editorial__quote-mark">&ldquo;</span>

            {/* Testimonial text — crossfade */}
            <blockquote
              className={`testi-editorial__text ${!transitioning ? 'testi-editorial__text--in' : ''}`}
            >
              {slide.review}
            </blockquote>

            {/* Traveller info — crossfade */}
            <div className={`testi-editorial__traveller ${!transitioning ? 'testi-editorial__traveller--in' : ''}`}>
              <div className="testi-editorial__avatar">
                <span className="grid size-full place-content-center rounded-full text-sm font-bold text-bone-100 bg-white/10">
                  {slide.name.split(' ').map((w) => w[0]).join('').slice(0, 2)}
                </span>
              </div>

              <div>
                <p className="testi-editorial__name">{slide.name}</p>
                <p className="testi-editorial__meta">
                  {slide.meta}
                  {slide.groupType && <>{' · '}{slide.groupType}</>}
                </p>
              </div>

              <div className="ml-auto">
                <Rating value={5} size="sm" />
              </div>
            </div>
          </div>

          {/* RIGHT: image — crossfade */}
          <div className="testi-editorial__image-wrap">
            <div
              className="testi-editorial__image-inner testi-editorial__image-inner--in"
              style={{ transition: `opacity ${reducedMotion ? '0s' : '0.6s'} ease` }}
            >
              <SmartImage
                src={slide.image}
                alt={`Travel photo — ${slide.meta}`}
                className="testi-editorial__img testi-editorial__img--ready"
              />
            </div>
          </div>
        </div>

        {/* ---- Navigation ---- */}
        <div className="testi-editorial__nav">
          <button
            type="button"
            onClick={prev}
            aria-label="Previous testimonial"
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
            aria-label="Next testimonial"
            className="testi-editorial__nav-btn"
          >
            <span>Next</span>
            <ChevronRight size={18} strokeWidth={2} aria-hidden="true" />
          </button>
        </div>

        {/* ---- Progress line ---- */}
        <div className="testi-editorial__progress">
          <div
            className="testi-editorial__progress-fill"
            style={{ width: `${((active + 1) / total) * 100}%` }}
          />
        </div>
      </div>
    </section>
  )
}
