import { MessageCircle } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import Button from '../ui/Button'
import { company, whatsappLink } from '../../data/company'

/**
 * Cinematic landing hero.
 *
 * Flow: video plays → text reveals during final 1.5s → video ends → final state.
 * The text begins appearing before the video finishes so it synchronises with
 * the bus reaching its final position.
 */
export default function LandingIntro() {
  const videoRef = useRef(null)
  const timersRef = useRef([])
  const revealStartedRef = useRef(false)
  const [reveal, setReveal] = useState({
    eyebrow: false,
    avengers: false,
    holiday: false,
    sub: false,
    lead: false,
    actions: false,
  })

  const prefersReduced =
    typeof window !== 'undefined' &&
    window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

  const showAll = useCallback(() => {
    setReveal({
      eyebrow: true,
      avengers: true,
      holiday: true,
      sub: true,
      lead: true,
      actions: true,
    })
    window.dispatchEvent(new Event('hero-complete'))
  }, [])

  const startReveal = useCallback(() => {
    if (revealStartedRef.current) return
    revealStartedRef.current = true

    const schedule = (cb, ms) => {
      const id = setTimeout(cb, ms)
      timersRef.current.push(id)
    }

    schedule(() => setReveal((p) => ({ ...p, eyebrow: true })), 0)
    schedule(() => setReveal((p) => ({ ...p, avengers: true })), 250)
    schedule(() => setReveal((p) => ({ ...p, holiday: true })), 550)
    schedule(() => setReveal((p) => ({ ...p, sub: true })), 850)
    schedule(() => setReveal((p) => ({ ...p, lead: true })), 1200)
    schedule(() => setReveal((p) => ({ ...p, actions: true })), 1500)
    schedule(() => window.dispatchEvent(new Event('hero-complete')), 1800)
  }, [])

  /* Start reveal 1.5s before video ends */
  const handleTimeUpdate = useCallback(() => {
    if (revealStartedRef.current) return
    const vid = videoRef.current
    if (!vid || !vid.duration || !isFinite(vid.duration)) return
    if (vid.currentTime >= vid.duration - 2.0) {
      startReveal()
    }
  }, [startReveal])

  /* Safety: if onEnded fires and reveal hasn't started yet */
  const handleEnd = useCallback(() => {
    startReveal()
  }, [startReveal])

  const handleError = useCallback(() => {
    showAll()
  }, [showAll])

  useEffect(() => {
    if (prefersReduced) {
      showAll()
      return
    }
    const vid = videoRef.current
    if (!vid) return
    vid.play().catch(showAll)
  }, [prefersReduced, showAll])

  useEffect(() => {
    return () => {
      timersRef.current.forEach(clearTimeout)
      timersRef.current = []
    }
  }, [])

  return (
    <section className="landing-hero">
      {/* ---- Background video ---- */}
      <div className="landing-hero__video-wrap">
        <video
          ref={videoRef}
          src="/final.mp4"
          autoPlay
          muted
          playsInline
          preload="auto"
          onTimeUpdate={handleTimeUpdate}
          onEnded={handleEnd}
          onError={handleError}
          className="landing-hero__video"
        />
      </div>

      {/* ---- Left content ---- */}
      <div className="landing-hero__content">
        <p className={`landing-hero__eyebrow ${reveal.eyebrow ? 'landing-hero__reveal' : ''}`}>
          <span aria-hidden="true" className="landing-hero__eyebrow-dot" />
          South India specialists since {company.since}
        </p>

        <h1 className={`landing-hero__heading ${reveal.avengers ? 'landing-hero__reveal' : ''}`}>
          <span className={`landing-hero__line ${reveal.avengers ? 'landing-hero__reveal' : ''}`}>
            Avengers
          </span>
          <span className={`landing-hero__line landing-hero__line--accent ${reveal.holiday ? 'landing-hero__reveal' : ''}`}>
            Holiday
          </span>
        </h1>

        <p className={`landing-hero__sub ${reveal.sub ? 'landing-hero__reveal' : ''}`}>
          Your Journey Starts Here
        </p>

        <p className={`landing-hero__lead ${reveal.lead ? 'landing-hero__reveal' : ''}`}>
          Hand-built itineraries, inspected hotels, our own coordinators on
          every trip — and one honest price agreed before you travel.
        </p>

        <div className={`landing-hero__actions ${reveal.actions ? 'landing-hero__reveal' : ''}`}>
          <Button to="/packages" variant="primary" size="lg">Explore Packages</Button>
          <Button to="/contact" variant="light" size="lg">Plan Your Trip</Button>
          <Button href={whatsappLink()} variant="whatsapp" size="lg" icon={MessageCircle}>WhatsApp</Button>
        </div>
      </div>
    </section>
  )
}
