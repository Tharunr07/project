import { MessageCircle, SkipForward } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import Button from '../ui/Button'
import { company, whatsappLink } from '../../data/company'

/**
 * Cinematic landing hero — bus RIGHT, content LEFT.
 *
 * Animation sequence:
 *   1. Full-screen video — bus enters from right
 *   2. Bus settles on the right
 *   3. Headlights turn on
 *   4. Content reveals line-by-line on the left
 */
export default function LandingHero() {
  const prefersReduced =
    typeof window !== 'undefined' &&
    window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

  const [phase, setPhase] = useState('entering')
  const videoRef = useRef(null)
  const timersRef = useRef([])

  const clearTimers = useCallback(() => {
    timersRef.current.forEach(clearTimeout)
    timersRef.current = []
  }, [])

  const skip = useCallback(() => {
    clearTimers()
    const vid = videoRef.current
    if (vid) vid.pause()
    setPhase('final')
  }, [clearTimers])

  const onVideoEnd = useCallback(() => {
    if (prefersReduced) {
      setPhase('final')
      return
    }
    setPhase('hold')
    const t1 = setTimeout(() => setPhase('glow'), 600)
    const t2 = setTimeout(() => setPhase('eyebrow'), 1000)
    const t3 = setTimeout(() => setPhase('line1'), 1400)
    const t4 = setTimeout(() => setPhase('line2'), 1800)
    const t5 = setTimeout(() => setPhase('line3'), 2200)
    const t6 = setTimeout(() => setPhase('desc'), 2600)
    const t7 = setTimeout(() => setPhase('final'), 3000)
    timersRef.current = [t1, t2, t3, t4, t5, t6, t7]
  }, [prefersReduced])

  const onVideoError = useCallback(() => {
    setPhase('final')
  }, [])

  useEffect(() => {
    if (phase !== 'entering') return
    const vid = videoRef.current
    if (!vid) return
    vid.play().catch(() => setPhase('final'))
  }, [phase])

  useEffect(() => () => clearTimers(), [clearTimers])

  const settled = phase !== 'entering'
  const headlightOn = phase === 'glow' || phase === 'eyebrow' || phase === 'line1' || phase === 'line2' || phase === 'line3' || phase === 'desc' || phase === 'final'
  const showEyebrow = phase === 'eyebrow' || phase === 'line1' || phase === 'line2' || phase === 'line3' || phase === 'desc' || phase === 'final'
  const isFinal = phase === 'final'

  if (prefersReduced) {
    return (
      <section className="landing-hero landing-hero--settled">
        <div className="landing-hero__text-side">
          <div className="landing-hero__text-inner">
            <p className="landing-hero__eyebrow landing-hero__reveal">
              <span aria-hidden="true" className="landing-hero__eyebrow-dot" />
              South India specialists since {company.since}
            </p>
            <h1 className="landing-hero__heading">
              <span className="landing-hero__line landing-hero__reveal">Avengers</span>
              <span className="landing-hero__line landing-hero__line--accent landing-hero__reveal">Holidays</span>
            </h1>
            <p className="landing-hero__line landing-hero__line--sub landing-hero__reveal">Your Journey Starts Here</p>
            <p className="landing-hero__lead landing-hero__reveal">
              Avengers Holidays plans and runs group tours across the Nilgiris,
              the Western Ghats, the Kerala backwaters and the Coromandel coast.
              Hand-built itineraries, inspected hotels, our own coordinators on
              every trip — and one honest price agreed before you travel.
            </p>
            <div className="landing-hero__actions landing-hero__reveal">
              <Button to="/packages" variant="primary" size="lg">Explore Packages</Button>
              <Button to="/contact" variant="light" size="lg">Plan Your Trip</Button>
              <Button href={whatsappLink()} variant="whatsapp" size="lg" icon={MessageCircle}>WhatsApp</Button>
            </div>
          </div>
        </div>
        <div className="landing-hero__video-side">
          <video src="/final.mp4" muted playsInline preload="metadata" className="landing-hero__video" />
          <span aria-hidden="true" className="landing-hero__scrim" />
          <span aria-hidden="true" className="landing-hero__headlight landing-hero__headlight--on" />
        </div>
      </section>
    )
  }

  return (
    <section className={`landing-hero ${settled ? 'landing-hero--settled' : ''}`}>
      {/* ---- LEFT: content ---- */}
      <div className={`landing-hero__text-side ${settled ? '' : 'landing-hero__text-side--hidden'}`}>
        <div className="landing-hero__text-inner">
          <p className={`landing-hero__eyebrow ${showEyebrow ? 'landing-hero__reveal' : ''}`}>
            <span aria-hidden="true" className="landing-hero__eyebrow-dot" />
            South India specialists since {company.since}
          </p>

          <h1 className="landing-hero__heading">
            <span className={`landing-hero__line ${(phase === 'line1' || phase === 'line2' || phase === 'line3' || phase === 'desc' || phase === 'final') ? 'landing-hero__reveal' : ''}`}>
              Avengers
            </span>
            <span className={`landing-hero__line landing-hero__line--accent ${(phase === 'line2' || phase === 'line3' || phase === 'desc' || phase === 'final') ? 'landing-hero__reveal' : ''}`}>
              Holidays
            </span>
          </h1>

          <p className={`landing-hero__line landing-hero__line--sub ${(phase === 'line3' || phase === 'desc' || phase === 'final') ? 'landing-hero__reveal' : ''}`}>
            Your Journey Starts Here
          </p>

          <p className={`landing-hero__lead ${(phase === 'desc' || phase === 'final') ? 'landing-hero__reveal' : ''}`}>
            Avengers Holidays plans and runs group tours across the Nilgiris,
            the Western Ghats, the Kerala backwaters and the Coromandel coast.
            Hand-built itineraries, inspected hotels, our own coordinators on
            every trip — and one honest price agreed before you travel.
          </p>

          <div className={`landing-hero__actions ${isFinal ? 'landing-hero__reveal' : ''}`}>
            <Button to="/packages" variant="primary" size="lg">Explore Packages</Button>
            <Button to="/contact" variant="light" size="lg">Plan Your Trip</Button>
            <Button href={whatsappLink()} variant="whatsapp" size="lg" icon={MessageCircle}>WhatsApp</Button>
          </div>
        </div>

        {!isFinal && (
          <button
            type="button"
            onClick={skip}
            className="landing-hero__skip"
            aria-label="Skip intro animation"
          >
            Skip Intro
            <SkipForward size={14} />
          </button>
        )}
      </div>

      {/* ---- RIGHT: video + headlight ---- */}
      <div className="landing-hero__video-side">
        <video
          ref={videoRef}
          src="/final.mp4"
          autoPlay
          muted
          playsInline
          preload="auto"
          onEnded={onVideoEnd}
          onError={onVideoError}
          className="landing-hero__video"
        />
        <span aria-hidden="true" className="landing-hero__scrim" />
        <span
          aria-hidden="true"
          className={`landing-hero__headlight ${headlightOn ? 'landing-hero__headlight--on' : ''}`}
        />
      </div>
    </section>
  )
}
