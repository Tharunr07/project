import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { img } from '../../data/images'
import { destinations } from '../../data/destinations'

const ROUTE_STOPS = [
  {
    id: 'ooty', name: 'Ooty', state: 'Tamil Nadu',
    duration: '2N / 3D', price: '₹9,500',
    image: img.greenHills,
  },
  {
    id: 'kodaikanal', name: 'Kodaikanal', state: 'Tamil Nadu',
    duration: '2N / 3D', price: '₹8,800',
    image: img.heroMist,
  },
  {
    id: 'munnar', name: 'Munnar', state: 'Kerala',
    duration: '3N / 4D', price: '₹11,200',
    image: img.teaEstate,
  },
  {
    id: 'coorg', name: 'Coorg', state: 'Karnataka',
    duration: '2N / 3D', price: '₹10,500',
    image: img.forestPath,
  },
  {
    id: 'pondicherry', name: 'Pondicherry', state: 'Puducherry',
    duration: '2N / 3D', price: '₹8,200',
    image: img.beach,
  },
  {
    id: 'kerala', name: 'Kerala Backwaters', state: 'Kerala',
    duration: '4N / 5D', price: '₹13,500',
    image: img.keralaBoat,
  },
]

const ROUTE_STATS = [
  { value: '723 km', label: 'Total Distance', icon: '↗' },
  { value: '19.5 hrs', label: 'Total Drive Time', icon: '◷' },
  { value: '6', label: 'Destinations', icon: '◉' },
  { value: '1', label: 'Epic Journey', icon: '◆' },
]

const VIEWBOX_W = 1200
const VIEWBOX_H = 600

const ROUTE_PATH = 'M100,80 C160,100 240,200 300,240 C360,280 430,270 500,260 C580,249 630,170 690,130 C740,95 800,115 860,170 C910,215 920,310 930,380'

const DEST_POSITIONS = [
  { x: 100, y: 80, cardDir: 'below' },
  { x: 300, y: 240, cardDir: 'above' },
  { x: 500, y: 260, cardDir: 'below' },
  { x: 690, y: 130, cardDir: 'above' },
  { x: 860, y: 170, cardDir: 'below' },
  { x: 930, y: 380, cardDir: 'above' },
]

const MAP_OUTLINE = 'M280,20 L340,15 L420,30 L520,25 L620,40 L720,35 L800,50 L880,40 L940,60 L960,90 L970,130 L965,180 L950,230 L930,270 L920,310 L940,340 L930,380 L910,420 L880,460 L850,490 L810,510 L760,530 L700,540 L640,535 L580,545 L520,540 L460,530 L400,540 L340,530 L290,510 L250,480 L220,440 L200,400 L180,350 L160,300 L140,250 L130,200 L125,150 L140,110 L160,70 L200,40 L240,25 Z'

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

  const destLinks = useMemo(() => (
    ROUTE_STOPS.map((stop) => {
      const dest = destinations.find((d) => d.id === stop.id)
      return dest ? `/destinations/${dest.id}` : `/destinations/${stop.id}`
    })
  ), [])

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
      activeIdxRef.current = ROUTE_STOPS.length - 1
      setActiveIdx(ROUTE_STOPS.length - 1)

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
      DEST_POSITIONS.forEach((pos) => {
        const el = document.getElementById(`dest-glow-${pos.x}-${pos.y}`)
        if (el) el.setAttribute('fill', 'rgba(222,36,56,0.12)')
        const dot = document.getElementById(`dest-dot-${pos.x}-${pos.y}`)
        if (dot) {
          dot.setAttribute('fill', '#de2438')
          dot.setAttribute('stroke', '#de2438')
          dot.style.filter = 'drop-shadow(0 0 4px rgba(222,36,56,0.5))'
        }
      })
      if (completionRef.current) completionRef.current.style.opacity = '1'
    }
  }, [prefersReduced])

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
        : lerp(current, target, 0.1)

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

        const segLen = len / (ROUTE_STOPS.length - 1)
        const idx = Math.min(Math.floor(curLen / segLen), ROUTE_STOPS.length - 1)

        DEST_POSITIONS.forEach((pos, i) => {
          const reached = i <= idx
          const glowEl = document.getElementById(`dest-glow-${pos.x}-${pos.y}`)
          if (glowEl) glowEl.setAttribute('fill', reached ? 'rgba(222,36,56,0.12)' : 'none')
          const dotEl = document.getElementById(`dest-dot-${pos.x}-${pos.y}`)
          if (dotEl) {
            dotEl.setAttribute('fill', reached ? '#de2438' : 'rgba(255,255,255,0.15)')
            dotEl.setAttribute('stroke', reached ? '#de2438' : 'rgba(255,255,255,0.1)')
            dotEl.style.filter = reached
              ? 'drop-shadow(0 0 4px rgba(222,36,56,0.5))'
              : 'none'
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
  }, [prefersReduced])

  useEffect(() => () => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
  }, [])

  return (
    <section
      ref={sectionRef}
      className="relative"
      style={{ height: '280vh' }}
    >
      <div className="sticky top-[4.5rem] h-screen overflow-hidden bg-[#080706]">
        <div className="mx-auto h-full w-full max-w-[80rem] px-5 sm:px-8 lg:px-10">

          <div className="pt-10 sm:pt-12 lg:pt-14">
            <p className="mb-3 text-[0.6875rem] font-semibold tracking-[0.2em] uppercase text-[#de2438]">
              South India, by road
            </p>
            <h2 className="font-['Fraunces',Georgia,serif] text-2xl font-bold text-[#fff2f1] sm:text-3xl lg:text-[2.5rem] lg:leading-[1.1]">
              Six destinations.
            </h2>
            <h2 className="font-['Fraunces',Georgia,serif] text-2xl font-bold text-[#e3ae3c] sm:text-3xl lg:text-[2.5rem] lg:leading-[1.1]">
              One unforgettable journey.
            </h2>
            <p className="mt-3 max-w-lg text-[0.9375rem] leading-relaxed text-[#b9b0ac]/60">
              Follow the road our coaches take across South India — from the Nilgiri hill stations to the Kerala backwaters.
            </p>
          </div>

          {/* ── Desktop SVG Map Route ─────────────────────────────── */}
          <div className="hidden lg:block">
            <div className="relative mt-6" style={{ height: 'clamp(300px, 38vw, 440px)' }}>
              <svg
                viewBox={`0 0 ${VIEWBOX_W} ${VIEWBOX_H}`}
                className="absolute inset-0 h-full w-full"
                preserveAspectRatio="xMidYMid meet"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d={MAP_OUTLINE} stroke="rgba(227,174,60,0.06)" strokeWidth="1.5" fill="none" />
                <path d={ROUTE_PATH} stroke="rgba(255,255,255,0.06)" strokeWidth="3" strokeLinecap="round" fill="none" />

                <path
                  ref={pathRef}
                  d={ROUTE_PATH}
                  stroke="#de2438"
                  strokeWidth="3"
                  strokeLinecap="round"
                  fill="none"
                  strokeDasharray="1"
                  strokeDashoffset="1"
                  style={{ filter: 'drop-shadow(0 0 6px rgba(222,36,56,0.4))' }}
                />

                <path
                  ref={glowRef}
                  d={ROUTE_PATH}
                  stroke="rgba(222,36,56,0.15)"
                  strokeWidth="12"
                  strokeLinecap="round"
                  fill="none"
                  strokeDasharray="1"
                  strokeDashoffset="1"
                  style={{ filter: 'blur(8px)' }}
                />

                {DEST_POSITIONS.map((pos, i) => (
                  <g key={ROUTE_STOPS[i].id}>
                    <circle id={`dest-glow-${pos.x}-${pos.y}`} cx={pos.x} cy={pos.y} r="14" fill="none" />
                    <circle
                      id={`dest-dot-${pos.x}-${pos.y}`}
                      cx={pos.x} cy={pos.y} r="5"
                      fill="rgba(255,255,255,0.15)"
                      stroke="rgba(255,255,255,0.1)"
                      strokeWidth="2"
                      style={{ transition: 'fill 0.4s ease, stroke 0.4s ease' }}
                    />
                  </g>
                ))}
              </svg>

              {/* Bus */}
              <div
                ref={busRef}
                className="absolute z-20 -translate-x-1/2 -translate-y-1/2"
                style={{ left: '0%', top: '0%' }}
              >
                <div className="relative">
                  <div className="absolute -inset-3 rounded-full bg-[#de2438]/15 blur-lg" />
                  <img
                    src="/sample.png"
                    alt="Avengers Holidays coach"
                    className="relative h-12 w-auto object-contain drop-shadow-[0_4px_16px_rgba(222,36,56,0.4)]"
                    draggable={false}
                  />
                </div>
              </div>

              {/* Destination cards */}
              {DEST_POSITIONS.map((pos, i) => {
                const stop = ROUTE_STOPS[i]
                const reached = i <= activeIdx
                const active = i === activeIdx
                const isBelow = pos.cardDir === 'below'
                const left = `${(pos.x / VIEWBOX_W) * 100}%`
                const top = `${(pos.y / VIEWBOX_H) * 100}%`

                return (
                  <div
                    key={stop.id}
                    className="absolute z-10"
                    style={{
                      left,
                      top,
                      transform: isBelow
                        ? 'translate(-50%, 12px)'
                        : 'translate(-50%, calc(-100% - 12px))',
                      transition: 'opacity 0.5s ease',
                      opacity: reached ? 1 : 0.3,
                    }}
                  >
                    <div
                      className={`absolute left-1/2 -translate-x-1/2 w-px ${
                        isBelow ? '-top-3 h-3' : '-bottom-3 h-3'
                      } ${reached ? 'bg-[#de2438]/50' : 'bg-white/[0.08]'}`}
                      style={{ transition: 'background-color 0.4s ease' }}
                    />

                    <Link
                      to={destLinks[i]}
                      className={`group block w-36 rounded-xl overflow-hidden border transition-all duration-400 ${
                        active
                          ? 'border-[#de2438]/40 shadow-[0_0_20px_rgba(222,36,56,0.2)]'
                          : reached
                            ? 'border-white/[0.08] hover:border-[#de2438]/30'
                            : 'border-white/[0.04]'
                      }`}
                      style={{ background: 'rgba(24,21,19,0.95)' }}
                    >
                      <div className="relative h-16 w-full overflow-hidden">
                        <img
                          src={stop.image}
                          alt={stop.name}
                          className={`h-full w-full object-cover transition-all duration-700 ${
                            reached ? 'opacity-100 scale-100' : 'opacity-30 scale-105'
                          } group-hover:scale-105`}
                          loading="lazy"
                          draggable={false}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#181513] via-transparent to-transparent" />
                        <div className={`absolute top-1.5 left-1.5 flex h-5 w-5 items-center justify-center rounded-full text-[0.5625rem] font-bold ${
                          active
                            ? 'bg-[#de2438] text-white'
                            : reached
                              ? 'bg-[#de2438]/80 text-white'
                              : 'bg-white/10 text-white/40'
                        }`} style={{ transition: 'background-color 0.4s ease' }}>
                          {String(i + 1).padStart(2, '0')}
                        </div>
                      </div>

                      <div className="px-2.5 py-2">
                        <p className={`text-[0.6875rem] font-bold tracking-wide uppercase ${
                          reached ? 'text-[#fff2f1]' : 'text-white/30'
                        }`} style={{ transition: 'color 0.4s ease' }}>
                          {stop.name}
                        </p>
                        <p className={`mt-0.5 text-[0.5625rem] ${
                          reached ? 'text-[#b9b0ac]/60' : 'text-white/20'
                        }`} style={{ transition: 'color 0.4s ease' }}>
                          {stop.state}
                        </p>

                        <div
                          className="overflow-hidden transition-all duration-500"
                          style={{
                            maxHeight: active ? '80px' : '0',
                            opacity: active ? 1 : 0,
                            marginTop: active ? '0.5rem' : '0',
                          }}
                        >
                          <div className="border-t border-white/[0.06] pt-2">
                            <div className="flex items-center justify-between">
                              <span className="text-[0.5625rem] text-[#b9b0ac]/50">{stop.duration}</span>
                              <span className="text-[0.625rem] font-bold text-[#de2438]">{stop.price}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </div>
                )
              })}

              {/* Completion overlay */}
              <div
                ref={completionRef}
                className="absolute inset-0 z-30 flex items-center justify-center pointer-events-none"
                style={{ opacity: 0, transition: 'opacity 0.8s ease' }}
              >
                <div className="text-center">
                  <p className="font-['Fraunces',Georgia,serif] text-xl font-bold text-[#e3ae3c] sm:text-2xl">
                    One epic journey.
                  </p>
                  <span className="mt-2 block h-px w-12 mx-auto bg-[#e3ae3c]/30" />
                </div>
              </div>
            </div>
          </div>

          {/* ── Mobile Vertical Journey ────────────────────────────── */}
          <div className="lg:hidden">
            <div className="relative mt-6 pl-10">
              <div className="absolute top-0 bottom-0 left-[18px] w-px bg-white/[0.06]" />

              <div
                className="absolute top-0 left-[18px] w-px bg-[#de2438]"
                id="mobile-active-path"
                style={{ height: '0%', boxShadow: '0 0 8px rgba(222,36,56,0.3)' }}
              />

              <div
                className="absolute left-[18px] z-20 -translate-x-1/2"
                id="mobile-bus"
                style={{ top: '0%' }}
              >
                <div className="relative">
                  <div className="absolute -inset-2 rounded-full bg-[#de2438]/15 blur-md" />
                  <img
                    src="/sample.png"
                    alt="Avengers Holidays coach"
                    className="relative h-9 w-auto rounded-md object-contain drop-shadow-[0_2px_10px_rgba(222,36,56,0.35)]"
                    draggable={false}
                  />
                </div>
              </div>

              <div className="relative space-y-5">
                {ROUTE_STOPS.map((stop, i) => {
                  const reached = i <= activeIdx
                  const active = i === activeIdx

                  return (
                    <div key={stop.id} className="group relative">
                      <div
                        className={`absolute left-[-28px] top-3 z-10 grid h-5 w-5 place-content-center rounded-full border-2 transition-all duration-400 ${
                          active
                            ? 'border-[#de2438] bg-[#de2438] text-white shadow-[0_0_10px_rgba(222,36,56,0.4)]'
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
                            ? 'border-[#de2438]/30 shadow-[0_0_16px_rgba(222,36,56,0.15)]'
                            : reached
                              ? 'border-white/[0.06]'
                              : 'border-white/[0.03]'
                        }`}
                        style={{ background: 'rgba(24,21,19,0.95)' }}
                      >
                        <div className="flex gap-3 p-3">
                          <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg">
                            <img
                              src={stop.image}
                              alt={stop.name}
                              className={`h-full w-full object-cover transition-all duration-600 ${
                                reached ? 'opacity-100' : 'opacity-25'
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
                              reached ? 'text-[#fff2f1]' : 'text-white/25'
                            }`}>
                              {stop.name}
                            </p>
                            <p className={`mt-0.5 text-[0.6875rem] ${
                              reached ? 'text-[#b9b0ac]/50' : 'text-white/15'
                            }`}>
                              {stop.state}
                            </p>

                            {active && (
                              <div className="mt-2 flex items-center gap-3 border-t border-white/[0.06] pt-2">
                                <span className="text-[0.625rem] text-[#b9b0ac]/50">{stop.duration}</span>
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
                className="mt-8 text-center"
                style={{ opacity: 0, transition: 'opacity 0.8s ease' }}
              >
                <p className="font-['Fraunces',Georgia,serif] text-lg font-bold text-[#e3ae3c]">
                  One epic journey.
                </p>
                <span className="mt-2 block h-px w-10 mx-auto bg-[#e3ae3c]/30" />
              </div>
            </div>
          </div>

          {/* ── Bottom Statistics ───────────────────────────────────── */}
          <div className="mt-auto border-t border-white/[0.06] pb-6 pt-6 sm:pb-8">
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 sm:gap-0">
              {ROUTE_STATS.map((stat) => (
                <div
                  key={stat.label}
                  className="flex flex-col items-center text-center sm:border-r sm:border-white/[0.06] sm:last:border-r-0 sm:px-4"
                >
                  <span className="mb-1.5 text-base text-[#de2438]">{stat.icon}</span>
                  <span className="text-lg font-bold text-[#fff2f1] sm:text-xl">{stat.value}</span>
                  <span className="mt-1 text-[0.625rem] tracking-wider uppercase text-[#b9b0ac]/40">
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
