import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { imageUrl } from '../../data/images'
import { destinations } from '../../data/destinations'
import {
  SEED_ROUTE_DESTINATIONS,
  ROUTE_STATS_DEFAULTS,
  useActiveRouteDestinations,
} from '../../firebase/collections/routeDestinations'

const VIEWBOX_W = 1000
const VIEWBOX_H = 720

/* Straight horizontal road-trip path across South India */
const ROUTE_PATH = 'M 140 420 L 860 420'

/* Geographically accurate South India State SVG Polygons & Coastlines */
const KERALA_PATH = 'M 235 370 C 242 410, 255 450, 270 490 C 290 535, 320 590, 375 650 C 360 620, 345 565, 330 520 C 320 488, 310 455, 295 430 C 280 400, 268 382, 235 370 Z'
const KARNATAKA_PATH = 'M 160 110 C 230 85, 330 65, 420 70 C 418 120, 415 170, 430 230 C 440 280, 460 320, 480 345 C 475 365, 470 370, 465 375 C 415 390, 355 400, 310 395 C 280 388, 260 380, 235 370 C 215 310, 195 240, 180 200 C 170 160, 165 130, 160 110 Z'
const TAMILNADU_PATH = 'M 465 375 C 495 360, 525 340, 665 300 C 655 350, 640 400, 635 415 C 625 455, 610 510, 565 595 C 520 625, 480 645, 415 665 C 375 650, 360 620, 330 520 C 320 488, 310 455, 295 430 C 310 395, 380 400, 465 375 Z'
const ANDHRA_PATH = 'M 665 300 C 680 240, 725 180, 830 110 C 870 80, 895 70, 920 60 L 850 65 C 770 100, 710 130, 600 195 C 525 240, 460 285, 480 345 C 505 342, 525 340, 665 300 Z'
const TELANGANA_PATH = 'M 420 70 C 490 55, 590 50, 850 65 C 770 100, 710 130, 600 195 C 525 240, 460 280, 430 230 C 418 170, 415 120, 420 70 Z'
const COASTLINE_PATH = 'M 160 110 C 180 200, 215 310, 235 370 C 255 450, 290 535, 375 650 C 415 665, 480 645, 565 595 C 610 510, 635 415, 665 300 C 725 180, 830 110, 920 60'
const SRILANKA_PATH = 'M 620 620 C 635 615, 650 625, 655 648 C 650 668, 630 678, 615 662 C 610 642, 615 628, 620 620 Z'

function usePrefersReduced() {
  const [reduced, setReduced] = useState(() => {
    if (typeof window === 'undefined') return false
    return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false
  })

  useEffect(() => {
    const mq = window.matchMedia?.('(prefers-reduced-motion: reduce)')
    if (!mq) return undefined
    const handler = (e) => setReduced(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  return reduced
}

function lerp(a, b, t) {
  return a + (b - a) * t
}

function getCardTransform(cardDir, offsetY = 0) {
  if (cardDir === 'above') {
    return `translate(-50%, calc(-100% - 14px + ${offsetY}px))`
  }
  if (cardDir === 'below') {
    return `translate(-50%, calc(14px + ${offsetY}px))`
  }
  return `translate(-50%, ${offsetY}px)`
}

/**
 * Compute evenly-spaced x positions across the road path.
 * `count` stops are distributed between x=140 and x=860.
 * Cards alternate above/below for visual clarity.
 */
function computeDestPositions(count) {
  const startX = 140
  const endX = 860
  const y = 420
  return Array.from({ length: count }, (_, i) => ({
    x: count === 1 ? (startX + endX) / 2 : startX + (i / (count - 1)) * (endX - startX),
    y,
    cardDir: i % 2 === 0 ? 'below' : 'above',
  }))
}

/**
 * Build a normalised stop list from Firestore data (or seed fallback),
 * resolving image keys to full CDN URLs.
 */
function buildStops(raw) {
  return raw.map((d, i) => ({
    id: d.id || String(i),
    name: d.name || 'Untitled',
    state: d.state || '',
    image: imageUrl(d.image),
    duration: d.duration || '',
    price: d.price || '',
    slug: d.slug || '',
    routeProgress: d.routeProgress ?? Math.round((i / Math.max(1, raw.length - 1)) * 100),
  }))
}

export default function BusRouteJourney() {
  const sectionRef = useRef(null)
  const pathRef = useRef(null)
  const busRef = useRef(null)
  const glowRef = useRef(null)
  const completionRef = useRef(null)
  const activeIdxRef = useRef(0)
  const prefersReduced = usePrefersReduced()

  const [activeIdx, setActiveIdx] = useState(0)

  const pathLengthRef = useRef(0)
  const targetRef = useRef(0)
  const smoothRef = useRef(0)
  const rafRef = useRef(null)

  /* ── Firestore data ──────────────────────────────────────────────────── */
  const { data: rawFiresotre, loading: _loading, error: _error } = useActiveRouteDestinations()

  const stops = useMemo(() => {
    const source = Array.isArray(rawFiresotre) && rawFiresotre.length > 0
      ? rawFiresotre
      : SEED_ROUTE_DESTINATIONS
    return buildStops(source)
  }, [rawFiresotre])

  const numStops = stops.length

  const destPositions = useMemo(() => computeDestPositions(numStops), [numStops])

  const destLinks = useMemo(() => (
    stops.map((stop) => {
      const dest = destinations.find((d) => d.id === stop.slug)
      return dest ? `/destinations/${dest.id}` : `/destinations/${stop.slug || stop.id}`
    })
  ), [stops])

  /* ── Scroll + animation ──────────────────────────────────────────────── */

  useEffect(() => {
    const pathNode = pathRef.current
    if (!pathNode) return

    const len = pathNode.getTotalLength()
    pathLengthRef.current = len

    const pt = pathNode.getPointAtLength(0)
    if (busRef.current) {
      busRef.current.style.left = `${(pt.x / VIEWBOX_W) * 100}%`
      busRef.current.style.top = `${(pt.y / VIEWBOX_H) * 100}%`
    }

    if (glowRef.current) {
      glowRef.current.style.strokeDasharray = String(len)
      glowRef.current.style.strokeDashoffset = String(len)
    }

    if (prefersReduced) {
      smoothRef.current = 100
      targetRef.current = 100
      activeIdxRef.current = numStops - 1
      setActiveIdx(numStops - 1)

      const endPt = pathNode.getPointAtLength(len)
      if (busRef.current) {
        busRef.current.style.left = `${(endPt.x / VIEWBOX_W) * 100}%`
        busRef.current.style.top = `${(endPt.y / VIEWBOX_H) * 100}%`
      }
      if (pathRef.current) {
        pathRef.current.style.strokeDashoffset = '0'
      }
      if (glowRef.current) {
        glowRef.current.style.strokeDashoffset = '0'
      }
      destPositions.forEach((pos, i) => {
        const cardEl = document.getElementById(`dest-card-${i}`)
        if (cardEl) {
          cardEl.style.opacity = '1'
          cardEl.style.transform = getCardTransform(pos.cardDir, 0)
        }
        const el = document.getElementById(`dest-glow-${pos.x}-${pos.y}`)
        if (el) el.setAttribute('fill', 'rgba(222,36,56,0.15)')
        const dot = document.getElementById(`dest-dot-${pos.x}-${pos.y}`)
        if (dot) {
          dot.setAttribute('fill', '#de2438')
          dot.setAttribute('stroke', '#de2438')
          dot.style.filter = 'drop-shadow(0 0 6px rgba(222,36,56,0.6))'
        }
      })
      if (completionRef.current) completionRef.current.style.opacity = '1'
    }
  }, [prefersReduced, numStops, destPositions])

  useEffect(() => {
    if (prefersReduced) return undefined

    function onScroll() {
      const section = sectionRef.current
      if (!section) return

      const rect = section.getBoundingClientRect()
      const maxScroll = Math.max(1, section.offsetHeight - window.innerHeight)
      const scrollDistance = Math.max(0, -rect.top)
      const progress = Math.min(1, scrollDistance / maxScroll)

      targetRef.current = progress * 100
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()

    return () => window.removeEventListener('scroll', onScroll)
  }, [prefersReduced])

  useEffect(() => {
    if (prefersReduced) return undefined

    let running = true

    function tick() {
      if (!running) return

      const target = targetRef.current
      const current = smoothRef.current
      const next = Math.abs(target - current) < 0.05
        ? target
        : lerp(current, target, 0.06)

      smoothRef.current = next

      const pathNode = pathRef.current
      const len = pathLengthRef.current

      if (pathNode && len > 0) {
        const curLen = (next / 100) * len
        const offset = len - curLen

        pathNode.style.strokeDashoffset = String(offset)

        if (glowRef.current) {
          glowRef.current.style.strokeDashoffset = String(offset)
        }

        const pt = pathNode.getPointAtLength(curLen)
        const delta = 2
        const p1 = pathNode.getPointAtLength(Math.max(0, curLen - delta))
        const p2 = pathNode.getPointAtLength(Math.min(len, curLen + delta))
        const angle = Math.atan2(p2.y - p1.y, p2.x - p1.x) * (180 / Math.PI)

        if (busRef.current) {
          busRef.current.style.left = `${(pt.x / VIEWBOX_W) * 100}%`
          busRef.current.style.top = `${(pt.y / VIEWBOX_H) * 100}%`
          busRef.current.style.transform = `translate(-50%,-50%) rotate(${angle}deg)`
        }

        const progressRatio = Math.min(1, Math.max(0, next / 100))
        const segs = numStops - 1
        const idx = Math.min(Math.floor(progressRatio * segs + 0.5), segs)

        destPositions.forEach((pos, i) => {
          const reached = i <= idx
          const glowEl = document.getElementById(`dest-glow-${pos.x}-${pos.y}`)
          if (glowEl) glowEl.setAttribute('fill', reached ? 'rgba(222,36,56,0.15)' : 'none')
          const dotEl = document.getElementById(`dest-dot-${pos.x}-${pos.y}`)
          if (dotEl) {
            dotEl.setAttribute('fill', reached ? '#de2438' : 'rgba(255,255,255,0.2)')
            dotEl.setAttribute('stroke', reached ? '#de2438' : 'rgba(255,255,255,0.15)')
            dotEl.style.filter = reached
              ? 'drop-shadow(0 0 6px rgba(222,36,56,0.6))'
              : 'none'
          }

          const cardEl = document.getElementById(`dest-card-${i}`)
          if (cardEl) {
            let opacity = 0
            let offsetY = 0

            if (i === idx) {
              opacity = 1.0
              offsetY = 0
            } else if (i < idx) {
              opacity = 0.7
              offsetY = 0
            } else {
              const targetP = i / segs
              const fadeStart = Math.max(0, targetP - 0.50)
              const fadeEnd = targetP - 0.20

              if (progressRatio <= fadeStart) {
                opacity = 0
                offsetY = 12
              } else if (progressRatio >= fadeEnd) {
                opacity = 1.0
                offsetY = 0
              } else {
                const factor = (progressRatio - fadeStart) / (fadeEnd - fadeStart)
                opacity = factor
                offsetY = (1 - factor) * 12
              }
            }

            cardEl.style.opacity = String(opacity)
            cardEl.style.transform = getCardTransform(pos.cardDir, offsetY)
          }
        })

        if (idx !== activeIdxRef.current) {
          activeIdxRef.current = idx
          setActiveIdx(idx)
        }
      }

      if (completionRef.current) {
        completionRef.current.style.opacity = next >= 99.5 ? '1' : '0'
      }

      /* Mobile DOM updates */
      const mobilePath = document.getElementById('mobile-active-path')
      if (mobilePath) mobilePath.style.height = `${Math.min(next, 100)}%`
      const mobileBus = document.getElementById('mobile-bus')
      if (mobileBus) mobileBus.style.top = `${Math.min(next, 100)}%`
      const mobileComplete = document.getElementById('mobile-completion')
      if (mobileComplete) mobileComplete.style.opacity = next >= 99.5 ? '1' : '0'

      rafRef.current = requestAnimationFrame(tick)
    }

    rafRef.current = requestAnimationFrame(tick)

    return () => {
      running = false
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [prefersReduced, numStops, destPositions])

  useEffect(() => () => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
  }, [])

  return (
    <section
      ref={sectionRef}
      className="relative"
      style={{ height: '400vh' }}
    >
      <div className="sticky top-[4.5rem] h-[calc(100vh-4.5rem)] overflow-hidden bg-[#080706]">
        <div className="mx-auto h-full w-full max-w-[85rem] px-4 sm:px-6 lg:px-8 flex flex-col justify-between py-4 lg:py-6">

          {/* ── Main Section Grid: Left Content + Right/Center Map ─────── */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:gap-8 items-center flex-1 overflow-hidden">

            {/* ── Left Side Heading & Info ───────────────────────────── */}
            <div className="lg:col-span-4 flex flex-col justify-center z-20 pt-2 lg:pt-0">
              <p className="mb-2 text-[0.6875rem] font-semibold tracking-[0.22em] uppercase text-[#de2438]">
                South India, by road
              </p>
              <h2 className="font-['Fraunces',Georgia,serif] text-2xl font-bold text-[#fff2f1] sm:text-3xl lg:text-[2.25rem] xl:text-[2.5rem] lg:leading-[1.12]">
                {numStops} destinations.
              </h2>
              <h2 className="font-['Fraunces',Georgia,serif] text-2xl font-bold text-[#e3ae3c] sm:text-3xl lg:text-[2.25rem] xl:text-[2.5rem] lg:leading-[1.12]">
                One unforgettable journey.
              </h2>
              <p className="mt-3 max-w-md text-[0.875rem] sm:text-[0.9375rem] leading-relaxed text-[#b9b0ac]/70">
                Follow the road our coaches take across South India — from the Nilgiri hill stations to the Kerala backwaters.
              </p>

              {/* Desktop embedded statistics inside left side */}
              <div className="mt-6 hidden lg:grid grid-cols-2 gap-4 border-t border-white/[0.08] pt-5">
                {ROUTE_STATS_DEFAULTS.map((stat) => (
                  <div key={stat.label} className="flex flex-col">
                    <div className="flex items-center gap-1.5 text-[#de2438]">
                      <span className="text-xs">{stat.icon}</span>
                      <span className="text-base font-bold text-[#fff2f1]">{stat.value}</span>
                    </div>
                    <span className="mt-0.5 text-[0.625rem] tracking-wider uppercase text-[#b9b0ac]/50">
                      {stat.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* ── Right/Center Desktop Map Area ──────────────────────── */}
            <div className="hidden lg:block lg:col-span-8 relative h-full flex items-center justify-center">
              <div className="relative w-full aspect-[1000/720] max-h-[calc(100vh-10rem)]">

                {/* SVG Geographically Correct South India Map */}
                <svg
                  viewBox={`0 0 ${VIEWBOX_W} ${VIEWBOX_H}`}
                  className="absolute inset-0 h-full w-full"
                  preserveAspectRatio="xMidYMid meet"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <defs>
                    <filter id="coast-glow" x="-20%" y="-20%" width="140%" height="140%">
                      <feGaussianBlur stdDeviation="8" result="blur" />
                      <feComposite in="SourceGraphic" in2="blur" operator="over" />
                    </filter>
                    <radialGradient id="ocean-bg" cx="45%" cy="50%" r="55%">
                      <stop offset="0%" stopColor="#141210" />
                      <stop offset="100%" stopColor="#080706" />
                    </radialGradient>
                    <linearGradient id="state-gradient" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="rgba(255,255,255,0.025)" />
                      <stop offset="100%" stopColor="rgba(255,255,255,0.008)" />
                    </linearGradient>
                  </defs>

                  {/* Ocean grid texture lines */}
                  <path d="M 50 150 L 950 150 M 50 300 L 950 300 M 50 450 L 950 450 M 50 600 L 950 600" stroke="rgba(255,255,255,0.02)" strokeWidth="1" strokeDasharray="4 8" />
                  <path d="M 200 50 L 200 680 M 400 50 L 400 680 M 600 50 L 600 680 M 800 50 L 800 680" stroke="rgba(255,255,255,0.02)" strokeWidth="1" strokeDasharray="4 8" />

                  {/* Subtle warm golden edge glow along South India Coastline */}
                  <path d={COASTLINE_PATH} stroke="#e3ae3c" strokeWidth="6" strokeOpacity="0.14" fill="none" filter="url(#coast-glow)" />
                  <path d={COASTLINE_PATH} stroke="#e3ae3c" strokeWidth="1.5" strokeOpacity="0.25" fill="none" />

                  {/* ── State Polygons ───────────────────────────────── */}
                  <path d={KERALA_PATH} fill="url(#state-gradient)" stroke="rgba(255,255,255,0.12)" strokeWidth="1.2" strokeDasharray="3 3" />
                  <path d={KARNATAKA_PATH} fill="url(#state-gradient)" stroke="rgba(255,255,255,0.12)" strokeWidth="1.2" strokeDasharray="3 3" />
                  <path d={TAMILNADU_PATH} fill="url(#state-gradient)" stroke="rgba(255,255,255,0.12)" strokeWidth="1.2" strokeDasharray="3 3" />
                  <path d={ANDHRA_PATH} fill="rgba(255,255,255,0.008)" stroke="rgba(255,255,255,0.08)" strokeWidth="1" strokeDasharray="3 3" />
                  <path d={TELANGANA_PATH} fill="rgba(255,255,255,0.008)" stroke="rgba(255,255,255,0.08)" strokeWidth="1" strokeDasharray="3 3" />
                  <path d={SRILANKA_PATH} fill="rgba(255,255,255,0.015)" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />

                  {/* ── State Typography Labels ──────────────────────── */}
                  <text x="270" y="580" fill="rgba(255,255,255,0.28)" fontSize="11" fontWeight="700" letterSpacing="3.5">KERALA</text>
                  <text x="250" y="155" fill="rgba(255,255,255,0.28)" fontSize="12" fontWeight="700" letterSpacing="4">KARNATAKA</text>
                  <text x="480" y="520" fill="rgba(255,255,255,0.28)" fontSize="13" fontWeight="700" letterSpacing="4">TAMIL NADU</text>
                  <text x="640" y="200" fill="rgba(255,255,255,0.20)" fontSize="11" fontWeight="700" letterSpacing="3">ANDHRA PRADESH</text>
                  <text x="510" y="140" fill="rgba(255,255,255,0.18)" fontSize="10" fontWeight="700" letterSpacing="3">TELANGANA</text>

                  {/* Water Body Labels */}
                  <text x="80" y="440" fill="rgba(227,174,60,0.14)" fontSize="10" fontWeight="600" letterSpacing="3.5">ARABIAN SEA</text>
                  <text x="750" y="470" fill="rgba(227,174,60,0.14)" fontSize="10" fontWeight="600" letterSpacing="3.5">BAY OF BENGAL</text>
                  <text x="400" y="695" fill="rgba(227,174,60,0.14)" fontSize="9" fontWeight="600" letterSpacing="3">INDIAN OCEAN</text>

                  {/* ── Bengaluru City Indicator inside Karnataka ──────── */}
                  <g transform="translate(445, 345)">
                    <circle r="3" fill="#e3ae3c" opacity="0.9" />
                    <circle r="7" fill="none" stroke="#e3ae3c" strokeWidth="1" opacity="0.4" />
                    <text x="11" y="3.5" fill="#e3ae3c" fontSize="10" fontWeight="700" letterSpacing="1.5" opacity="0.8">BENGALURU</text>
                  </g>

                  {/* ── Road Surface (perspective depth) ──────────────── */}
                  <path d={ROUTE_PATH} stroke="rgba(222,36,56,0.08)" strokeWidth="28" strokeLinecap="round" fill="none" style={{ filter: 'blur(10px)' }} />
                  <path d={ROUTE_PATH} stroke="rgba(255,255,255,0.06)" strokeWidth="18" strokeLinecap="round" fill="none" />
                  <path d={ROUTE_PATH} stroke="rgba(40,35,30,0.9)" strokeWidth="14" strokeLinecap="round" fill="none" />
                  <path d={ROUTE_PATH} stroke="rgba(227,174,60,0.18)" strokeWidth="1.5" strokeDasharray="12 8" strokeLinecap="round" fill="none" />

                  {/* ── Base & Active Route Paths ─────────────────────── */}
                  <path
                    ref={pathRef}
                    d={ROUTE_PATH}
                    stroke="#de2438"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    fill="none"
                    strokeDasharray="1"
                    strokeDashoffset="1"
                    style={{ filter: 'drop-shadow(0 0 8px rgba(222,36,56,0.6))' }}
                  />
                  <path
                    ref={glowRef}
                    d={ROUTE_PATH}
                    stroke="rgba(222,36,56,0.25)"
                    strokeWidth="14"
                    strokeLinecap="round"
                    fill="none"
                    strokeDasharray="1"
                    strokeDashoffset="1"
                    style={{ filter: 'blur(8px)' }}
                  />

                  {/* ── Destination Waypoint Dots ─────────────────────── */}
                  {destPositions.map((pos, i) => (
                    <g key={stops[i]?.id ?? i}>
                      <circle id={`dest-glow-${pos.x}-${pos.y}`} cx={pos.x} cy={pos.y} r="16" fill="none" />
                      <circle
                        id={`dest-dot-${pos.x}-${pos.y}`}
                        cx={pos.x} cy={pos.y} r="5"
                        fill="rgba(255,255,255,0.2)"
                        stroke="rgba(255,255,255,0.15)"
                        strokeWidth="2"
                        style={{ transition: 'fill 0.4s ease, stroke 0.4s ease, filter 0.4s ease' }}
                      />
                    </g>
                  ))}
                </svg>

                {/* ── Bus Coach on Glowing Route ──────────────────────── */}
                <div
                  ref={busRef}
                  className="absolute z-20 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
                  style={{ left: '0%', top: '0%' }}
                >
                  <div className="relative">
                    <div className="absolute -inset-2.5 rounded-full bg-[#de2438]/30 blur-md" />
                    <img
                      src="/sample.png"
                      alt="Avengers Holidays coach"
                      className="relative h-8 sm:h-9 w-auto object-contain drop-shadow-[0_4px_16px_rgba(222,36,56,0.5)]"
                      draggable={false}
                    />
                  </div>
                </div>

                {/* ── Destination Cards Overlay ──────────────────────── */}
                {destPositions.map((pos, i) => {
                  const stop = stops[i]
                  if (!stop) return null
                  const isVisited = i < activeIdx
                  const active = i === activeIdx
                  const left = `${(pos.x / VIEWBOX_W) * 100}%`
                  const top = `${(pos.y / VIEWBOX_H) * 100}%`

                  let connectorStyle = 'left-1/2 -translate-x-1/2 -bottom-3.5 h-3.5'
                  if (pos.cardDir === 'above') {
                    connectorStyle = 'left-1/2 -translate-x-1/2 -bottom-3.5 h-3.5'
                  } else if (pos.cardDir === 'below') {
                    connectorStyle = 'left-1/2 -translate-x-1/2 -top-3.5 h-3.5'
                  }

                  return (
                    <div
                      id={`dest-card-${i}`}
                      key={stop.id}
                      className="absolute z-10 pointer-events-auto"
                      style={{
                        left,
                        top,
                        transform: getCardTransform(pos.cardDir, i === 0 ? 0 : 12),
                        transition: 'opacity 0.3s ease, transform 0.3s ease',
                        opacity: i === 0 ? 1 : 0,
                      }}
                    >
                      <div
                        className={`absolute w-px ${connectorStyle} ${
                          active
                            ? 'bg-[#de2438]'
                            : isVisited
                              ? 'bg-[#de2438]/50'
                              : 'bg-white/20'
                        }`}
                        style={{ transition: 'background-color 0.4s ease' }}
                      />

                      <Link
                        to={destLinks[i]}
                        className={`group block w-32 sm:w-36 rounded-xl overflow-hidden border transition-all duration-400 ${
                          active
                            ? 'border-[#de2438]/50 shadow-[0_0_24px_rgba(222,36,56,0.25)] scale-105 z-20'
                            : isVisited
                              ? 'border-white/[0.08] hover:border-[#de2438]/40'
                              : 'border-white/[0.14] hover:border-[#de2438]/40'
                        }`}
                        style={{ background: 'rgba(20,17,15,0.94)', backdropFilter: 'blur(8px)' }}
                      >
                        <div className="relative h-14 sm:h-16 w-full overflow-hidden">
                          <img
                            src={stop.image}
                            alt={stop.name}
                            className={`h-full w-full object-cover transition-all duration-700 ${
                              active
                                ? 'opacity-100 scale-100'
                                : isVisited
                                  ? 'opacity-70 scale-100'
                                  : 'opacity-95 scale-100'
                            } group-hover:scale-105`}
                            loading="lazy"
                            draggable={false}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-[#14110f] via-transparent to-transparent" />
                          <div className={`absolute top-1.5 left-1.5 flex h-5 w-5 items-center justify-center rounded-full text-[0.5625rem] font-bold ${
                            active
                              ? 'bg-[#de2438] text-white shadow-[0_0_8px_rgba(222,36,56,0.6)]'
                              : isVisited
                                ? 'bg-white/10 text-white/50'
                                : 'bg-[#de2438]/80 text-white'
                          }`} style={{ transition: 'background-color 0.4s ease' }}>
                            {String(i + 1).padStart(2, '0')}
                          </div>
                        </div>

                        <div className="px-2.5 py-1.5 sm:py-2">
                          <p className={`text-[0.6875rem] font-bold tracking-wide uppercase truncate ${
                            active
                              ? 'text-[#fff2f1]'
                              : isVisited
                                ? 'text-[#fff2f1]/70'
                                : 'text-[#fff2f1]'
                          }`} style={{ transition: 'color 0.4s ease' }}>
                            {stop.name}
                          </p>
                          <p className={`mt-0.5 text-[0.5625rem] truncate ${
                            active
                              ? 'text-[#b9b0ac]/80'
                              : isVisited
                                ? 'text-[#b9b0ac]/50'
                                : 'text-[#b9b0ac]/70'
                          }`} style={{ transition: 'color 0.4s ease' }}>
                            {stop.state}
                          </p>

                          <div
                            className="overflow-hidden transition-all duration-500"
                            style={{
                              maxHeight: active ? '80px' : '0',
                              opacity: active ? 1 : 0,
                              marginTop: active ? '0.375rem' : '0',
                            }}
                          >
                            <div className="border-t border-white/[0.08] pt-1.5 flex items-center justify-between">
                              <span className="text-[0.5625rem] text-[#b9b0ac]/60">{stop.duration}</span>
                              <span className="text-[0.625rem] font-bold text-[#de2438]">{stop.price}</span>
                            </div>
                          </div>
                        </div>
                      </Link>
                    </div>
                  )
                })}

                {/* Completion Overlay */}
                <div
                  ref={completionRef}
                  className="absolute inset-0 z-30 flex items-center justify-center pointer-events-none"
                  style={{ opacity: 0, transition: 'opacity 0.8s ease' }}
                >
                  <div className="text-center bg-[#080706]/90 px-6 py-4 rounded-2xl border border-[#e3ae3c]/30 backdrop-blur-md shadow-[0_0_30px_rgba(227,174,60,0.15)]">
                    <p className="font-['Fraunces',Georgia,serif] text-xl font-bold text-[#e3ae3c] sm:text-2xl">
                      One epic journey.
                    </p>
                    <span className="mt-2 block h-px w-12 mx-auto bg-[#e3ae3c]/40" />
                  </div>
                </div>

              </div>
            </div>
          </div>

          {/* ── Mobile Vertical Journey ────────────────────────────── */}
          <div className="lg:hidden mt-4 overflow-y-auto max-h-[55vh] px-1">
            <div className="relative pl-8">
              <div className="absolute top-0 bottom-0 left-[14px] w-px bg-white/[0.08]" />

              <div
                className="absolute top-0 left-[14px] w-px bg-[#de2438]"
                id="mobile-active-path"
                style={{ height: '0%', boxShadow: '0 0 8px rgba(222,36,56,0.4)' }}
              />

              <div
                className="absolute left-[14px] z-20 -translate-x-1/2 pointer-events-none"
                id="mobile-bus"
                style={{ top: '0%' }}
              >
                <div className="relative">
                  <div className="absolute -inset-2 rounded-full bg-[#de2438]/20 blur-md" />
                  <img
                    src="/sample.png"
                    alt="Avengers Holidays coach"
                    className="relative h-8 w-auto rounded-md object-contain drop-shadow-[0_2px_10px_rgba(222,36,56,0.4)]"
                    draggable={false}
                  />
                </div>
              </div>

              <div className="relative space-y-4">
                {stops.map((stop, i) => {
                  const reached = i <= activeIdx
                  const active = i === activeIdx

                  return (
                    <div key={stop.id} className="group relative">
                      <div
                        className={`absolute left-[-22px] top-3 z-10 grid h-5 w-5 place-content-center rounded-full border-2 transition-all duration-400 ${
                          active
                            ? 'border-[#de2438] bg-[#de2438] text-white shadow-[0_0_10px_rgba(222,36,56,0.5)]'
                            : reached
                              ? 'border-[#de2438]/60 bg-[#de2438]/60 text-white'
                              : 'border-white/10 bg-[#181513] text-white/30'
                        }`}
                      >
                        <span className="text-[0.4375rem] font-bold">{i + 1}</span>
                      </div>

                      <Link
                        to={destLinks[i]}
                        className={`block overflow-hidden rounded-xl border transition-all duration-400 ${
                          active
                            ? 'border-[#de2438]/40 shadow-[0_0_16px_rgba(222,36,56,0.18)]'
                            : reached
                              ? 'border-white/[0.08]'
                              : 'border-white/[0.03]'
                        }`}
                        style={{ background: 'rgba(20,17,15,0.95)' }}
                      >
                        <div className="flex gap-3 p-2.5">
                          <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg">
                            <img
                              src={stop.image}
                              alt={stop.name}
                              className={`h-full w-full object-cover transition-all duration-600 ${
                                reached ? 'opacity-100' : 'opacity-30'
                              }`}
                              loading="lazy"
                              draggable={false}
                            />
                            <div className={`absolute inset-0 flex items-center justify-center rounded-lg text-[0.5rem] font-bold ${
                              active ? 'bg-[#de2438]/80 text-white' : 'bg-black/40 text-white/40'
                            }`}>
                              {String(i + 1).padStart(2, '0')}
                            </div>
                          </div>

                          <div className="min-w-0 flex-1 pt-0.5">
                            <p className={`text-[0.8125rem] font-bold ${
                              reached ? 'text-[#fff2f1]' : 'text-white/30'
                            }`}>
                              {stop.name}
                            </p>
                            <p className={`mt-0.5 text-[0.6875rem] ${
                              reached ? 'text-[#b9b0ac]/60' : 'text-white/20'
                            }`}>
                              {stop.state}
                            </p>

                            {active && (
                              <div className="mt-2 flex items-center gap-3 border-t border-white/[0.08] pt-1.5">
                                <span className="text-[0.625rem] text-[#b9b0ac]/60">{stop.duration}</span>
                                <span className="text-[0.6875rem] font-bold text-[#de2438]">{stop.price}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </Link>
                    </div>
                  )
                })}
              </div>

              <div
                id="mobile-completion"
                className="mt-6 text-center"
                style={{ opacity: 0, transition: 'opacity 0.8s ease' }}
              >
                <p className="font-['Fraunces',Georgia,serif] text-base font-bold text-[#e3ae3c]">
                  One epic journey.
                </p>
                <span className="mt-1.5 block h-px w-10 mx-auto bg-[#e3ae3c]/30" />
              </div>
            </div>
          </div>

          {/* ── Bottom Statistics Bar for Mobile / Tablet ───────────── */}
          <div className="lg:hidden border-t border-white/[0.08] pt-3 pb-2">
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-0">
              {ROUTE_STATS_DEFAULTS.map((stat) => (
                <div
                  key={stat.label}
                  className="flex flex-col items-center text-center sm:border-r sm:border-white/[0.08] sm:last:border-r-0 sm:px-2"
                >
                  <span className="mb-0.5 text-xs text-[#de2438]">{stat.icon}</span>
                  <span className="text-sm font-bold text-[#fff2f1] sm:text-base">{stat.value}</span>
                  <span className="text-[0.5625rem] tracking-wider uppercase text-[#b9b0ac]/50">
                    {stat.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
