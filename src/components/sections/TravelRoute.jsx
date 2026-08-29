import { Bus, MapPin } from 'lucide-react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { usePublishedDestinations } from '../../firebase/collections/destinations'

const ROUTE_STOPS = [
  { id: 'ooty', name: 'Ooty', state: 'Tamil Nadu', distance: '500 km' },
  { id: 'kodaikanal', name: 'Kodaikanal', state: 'Tamil Nadu', distance: '350 km' },
  { id: 'munnar', name: 'Munnar', state: 'Kerala', distance: '280 km' },
  { id: 'coorg', name: 'Coorg', state: 'Karnataka', distance: '420 km' },
  { id: 'pondicherry', name: 'Pondicherry', state: 'Puducherry', distance: '310 km' },
  { id: 'kerala', name: 'Kerala Backwaters', state: 'Kerala', distance: '380 km' },
]

function useScrollReveal(threshold = 0.2) {
  const ref = useRef(null)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const node = ref.current
    if (!node) return undefined
    const io = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setInView(true) },
      { threshold },
    )
    io.observe(node)
    return () => io.disconnect()
  }, [threshold])

  return [ref, inView]
}

export default function TravelRoute() {
  const [sectionRef, inView] = useScrollReveal(0.15)
  const [activeStop, setActiveStop] = useState(-1)
  const timersRef = useRef([])
  const prefersReduced = typeof window !== 'undefined'
    && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

  const { data: publishedDestinations } = usePublishedDestinations()

  const destMap = useMemo(() => {
    const map = new Map()
    ;(publishedDestinations ?? []).forEach((d) => map.set(d.id, d))
    return map
  }, [publishedDestinations])

  const getDest = useCallback((id) => destMap.get(id) ?? null, [destMap])

  useEffect(() => {
    if (!inView || prefersReduced) {
      if (prefersReduced) setActiveStop(ROUTE_STOPS.length - 1)
      return undefined
    }

    timersRef.current.forEach(clearTimeout)
    timersRef.current = []

    ROUTE_STOPS.forEach((_, i) => {
      timersRef.current.push(
        setTimeout(() => setActiveStop(i), 1200 + i * 650),
      )
    })

    return () => {
      timersRef.current.forEach(clearTimeout)
      timersRef.current = []
    }
  }, [inView, prefersReduced])

  useEffect(() => () => {
    timersRef.current.forEach(clearTimeout)
    timersRef.current = []
  }, [])

  const reached = prefersReduced ? ROUTE_STOPS.length - 1 : activeStop
  const progress = ROUTE_STOPS.length > 1
    ? ((reached + 1) / (ROUTE_STOPS.length - 1)) * 100
    : 0

  return (
    <section
      ref={sectionRef}
      className={`bg-ink-950 py-10 sm:py-12 lg:py-16 overflow-hidden ${inView ? 'tr-route--in' : ''}`}
    >
      <div className="shell">
        {/* ---- Heading ---- */}
        <div className={`mb-8 lg:mb-12 transition-all duration-700 ease-out ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <p className="mb-3 text-[0.6875rem] font-semibold tracking-[0.2em] uppercase text-gold-400">
            The Road Ahead
          </p>
          <h2 className="font-display text-2xl font-bold text-bone-100 sm:text-3xl lg:text-4xl">
            Six places. One road. Endless memories.
          </h2>
          <p className="mt-3 max-w-xl text-[0.9375rem] leading-relaxed text-bone-300/60">
            Follow the road our coaches take across South India. Pick a stop and start your journey.
          </p>
        </div>

        {/* ---- Desktop Route ---- */}
        <div className="hidden lg:block">
          <div className="relative py-16">
            {/* Route line background */}
            <div className="absolute top-1/2 left-0 right-0 h-px -translate-y-1/2 bg-white/[0.06]" />

            {/* Animated route fill */}
            <div
              className="absolute top-1/2 left-0 h-px -translate-y-1/2 bg-brand-500 transition-all duration-500 ease-out"
              style={{ width: `${Math.min(progress, 100)}%` }}
            />

            {/* Stops */}
            <div className="relative flex justify-between">
              {ROUTE_STOPS.map((stop, i) => {
                const isReached = i <= reached
                const dest = getDest(stop.id)
                const to = dest ? `/destinations/${dest.id}` : `/destinations/${stop.id}`

                return (
                  <div key={stop.id} className="group relative flex flex-col items-center" style={{ flex: '1 1 0' }}>
                    {/* Tooltip */}
                    <div className="absolute bottom-full mb-4 w-52 opacity-0 pointer-events-none transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0 translate-y-1 z-10">
                      <div className="rounded-xl bg-ink-800 border border-white/[0.08] p-3.5 shadow-lg">
                        <p className="text-[0.6875rem] font-semibold tracking-[0.12em] uppercase text-gold-400">
                          {stop.state}
                        </p>
                        <p className="mt-1 text-sm font-semibold text-bone-100">{stop.name}</p>
                        {dest?.shortDescription && (
                          <p className="mt-1.5 text-[0.75rem] leading-relaxed text-bone-300/60 line-clamp-2">
                            {dest.shortDescription}
                          </p>
                        )}
                        <p className="mt-2 text-[0.6875rem] text-bone-300/40">
                          {stop.distance} of scenic roads
                        </p>
                      </div>
                    </div>

                    {/* Connector line up to stop */}
                    <div className={`absolute bottom-1/2 left-1/2 h-8 w-px -translate-x-1/2 transition-all duration-500 ${isReached ? 'bg-brand-500/40' : 'bg-white/[0.06]'}`} style={{ transitionDelay: `${i * 100}ms` }} />

                    {/* Marker */}
                    <Link
                      to={to}
                      className={`relative z-10 grid size-9 place-content-center rounded-full border-2 transition-all duration-500 ${
                        isReached
                          ? 'border-brand-500 bg-brand-500 text-white shadow-[0_0_12px_rgba(222,36,56,0.35)]'
                          : 'border-white/[0.12] bg-ink-900 text-bone-300/40'
                      } group-hover:scale-110 group-hover:border-brand-400 group-hover:shadow-[0_0_20px_rgba(222,36,56,0.5)]`}
                      style={{ transitionDelay: `${i * 80}ms` }}
                    >
                      {isReached ? (
                        <Bus size={14} strokeWidth={2} />
                      ) : (
                        <MapPin size={12} strokeWidth={2} />
                      )}
                    </Link>

                    {/* Stop label */}
                    <div className="mt-4 text-center">
                      <Link
                        to={to}
                        className={`block text-[0.8125rem] font-semibold transition-all duration-300 group-hover:text-brand-400 ${
                          isReached ? 'text-bone-100' : 'text-bone-300/40'
                        }`}
                      >
                        {stop.name}
                      </Link>
                      <p className={`mt-0.5 text-[0.6875rem] transition-colors duration-300 ${
                        isReached ? 'text-bone-300/50' : 'text-bone-300/25'
                      }`}>
                        {stop.state}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* ---- Mobile Route ---- */}
        <div className="lg:hidden">
          <div className="relative pl-8">
            {/* Vertical line background */}
            <div className="absolute top-0 bottom-0 left-[14px] w-px bg-white/[0.06]" />

            {/* Animated vertical fill */}
            <div
              className="absolute top-0 left-[14px] w-px bg-brand-500 transition-all duration-500 ease-out"
              style={{ height: `${Math.min(progress, 100)}%` }}
            />

            {/* Stops */}
            <div className="relative space-y-6">
              {ROUTE_STOPS.map((stop, i) => {
                const isReached = i <= reached
                const dest = getDest(stop.id)
                const to = dest ? `/destinations/${dest.id}` : `/destinations/${stop.id}`

                return (
                  <div key={stop.id} className="group relative flex items-start gap-4">
                    {/* Marker */}
                    <Link
                      to={to}
                      className={`relative z-10 grid size-7 shrink-0 place-content-center rounded-full border-2 transition-all duration-500 ${
                        isReached
                          ? 'border-brand-500 bg-brand-500 text-white shadow-[0_0_10px_rgba(222,36,56,0.3)]'
                          : 'border-white/[0.12] bg-ink-900 text-bone-300/40'
                      } group-active:scale-95`}
                      style={{ transitionDelay: `${i * 80}ms` }}
                    >
                      {isReached ? (
                        <Bus size={12} strokeWidth={2} />
                      ) : (
                        <MapPin size={10} strokeWidth={2} />
                      )}
                    </Link>

                    {/* Content */}
                    <div className="min-w-0 pt-0.5">
                      <Link
                        to={to}
                        className={`block text-[0.875rem] font-semibold transition-colors duration-300 group-active:text-brand-400 ${
                          isReached ? 'text-bone-100' : 'text-bone-300/40'
                        }`}
                      >
                        {stop.name}
                      </Link>
                      <p className={`mt-0.5 text-[0.75rem] transition-colors duration-300 ${
                        isReached ? 'text-bone-300/50' : 'text-bone-300/25'
                      }`}>
                        {stop.state} &middot; {stop.distance}
                      </p>
                      {dest?.shortDescription && isReached && (
                        <p className="mt-1.5 text-[0.75rem] leading-relaxed text-bone-300/40 line-clamp-1 group-active:text-bone-300/60">
                          {dest.shortDescription}
                        </p>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
