import {
  Briefcase,
  Compass,
  GraduationCap,
  School,
  Users,
  UsersRound,
} from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'

const WINDOWS = [
  {
    key: 'College', number: '01', label: 'College Trips', icon: GraduationCap,
    size: '40 – 200 students',
    body: 'Batch tours with student pricing, separate staff rooms and a night-security briefing before departure.',
    cta: 'Plan a college trip',
  },
  {
    key: 'School', number: '02', label: 'School Trips', icon: School,
    size: '30 – 150 students',
    body: 'Excursions built around school approvals — teacher ratios, first-aid cover and parent circulars handled.',
    cta: 'Plan a school trip',
  },
  {
    key: 'Family', number: '03', label: 'Family Trips', icon: Users,
    size: '4 – 40 people',
    body: 'Multi-generation pacing so grandparents, kids and everyone between get a plan that actually works.',
    cta: 'Plan a family trip',
  },
  {
    key: 'Friends', number: '04', label: 'Friends Trips', icon: UsersRound,
    size: '6 – 30 people',
    body: 'Weekend runs and adventure blocks — rafting, treks and campfires, with the logistics kept invisible.',
    cta: 'Plan a friends trip',
  },
  {
    key: 'Corporate', number: '05', label: 'Corporate Trips', icon: Briefcase,
    size: '20 – 200 people',
    body: 'Offsites and team outings with venue setups, activity facilitators and invoice-ready GST billing.',
    cta: 'Plan a corporate trip',
  },
  {
    key: 'Other', number: '06', label: 'Other Trips', icon: Compass,
    size: 'Any size',
    body: 'Pilgrimages, wedding guest movements, senior-citizen circuits — if a group can name it, we can run it.',
    cta: 'Plan your trip',
  },
]

function useInView(t = 0.08) {
  const r = useRef(null)
  const [v, s] = useState(false)
  useEffect(() => {
    const n = r.current
    if (!n) return undefined
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) s(true) }, { threshold: t })
    io.observe(n)
    return () => io.disconnect()
  }, [t])
  return [r, v]
}

function useReduced() {
  const [r, s] = useState(() => {
    if (typeof window === 'undefined') return false
    return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false
  })
  useEffect(() => {
    const mq = window.matchMedia?.('(prefers-reduced-motion: reduce)')
    if (!mq) return undefined
    const h = (e) => s(e.matches)
    mq.addEventListener('change', h)
    return () => mq.removeEventListener('change', h)
  }, [])
  return r
}

export default function TravellerBusInterior() {
  const [ref, inView] = useInView(0.08)
  const reduced = useReduced()
  const [revealed, setRevealed] = useState(false)
  const [hovered, setHovered] = useState(-1)

  useEffect(() => {
    if (inView && !reduced) {
      const t = setTimeout(() => setRevealed(true), 50)
      return () => clearTimeout(t)
    }
    if (reduced) setRevealed(true)
    return undefined
  }, [inView, reduced])

  return (
    <section ref={ref} className="relative overflow-hidden py-10 sm:py-14 lg:py-16">

      {/* ═══════════════════════════════════════════════════════════
          REAL BUS INTERIOR PHOTO — background
          ═══════════════════════════════════════════════════════════ */}
      <div
        className="absolute inset-0 transition-opacity duration-[1200ms]"
        style={{
          opacity: revealed ? 1 : 0,
          backgroundImage: 'url(/background.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center 40%',
          backgroundRepeat: 'no-repeat',
        }}
      />

      {/* ── Very subtle dark overlay for text readability ──────── */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: 'rgba(6,4,2,0.25)' }}
      />

      {/* ═══════════════════════════════════════════════════════════
          CONTENT — overlaid on the photo
          ═══════════════════════════════════════════════════════════ */}
      <div className="relative z-10 mx-auto max-w-[82rem] px-4 sm:px-6 lg:px-8">

        {/* ═══════════════════════════════════════════════════════
            WINDOWS GRID — positioned over photo's windows
            ═══════════════════════════════════════════════════════ */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 lg:gap-6 lg:px-[6%]">

          {WINDOWS.map((win, i) => {
            const Icon = win.icon
            const delay = 200 + i * 100
            const isOn = hovered === i
            const isDim = hovered >= 0 && !isOn

            return (
              <Link
                key={win.key}
                to={`/enquire?groupType=${encodeURIComponent(win.key)}`}
                className="group relative block"
                onMouseEnter={() => setHovered(i)}
                onMouseLeave={() => setHovered(-1)}
                style={{
                  opacity: revealed ? 1 : 0,
                  transform: revealed ? 'translateY(0)' : 'translateY(16px)',
                  transition: `opacity 0.55s ease ${delay}ms, transform 0.55s ease ${delay}ms`,
                }}
              >
                {/* ── BUS WINDOW PANEL ──────────────────────────── */}
                <div
                  className="relative overflow-hidden transition-all duration-400"
                  style={{
                    borderRadius: '16px',
                    aspectRatio: '4 / 3.2',
                    background: isOn
                      ? 'rgba(10,8,5,0.55)'
                      : 'rgba(10,8,5,0.65)',
                    boxShadow: isOn
                      ? '0 0 0 1px rgba(230,57,70,0.15), 0 0 30px rgba(230,57,70,0.05), inset 0 1px 0 rgba(255,255,255,0.06), inset 0 -1px 0 rgba(0,0,0,0.3)'
                      : '0 0 0 1px rgba(255,255,255,0.04), inset 0 1px 0 rgba(255,255,255,0.04), inset 0 -1px 0 rgba(0,0,0,0.2)',
                    opacity: isDim ? 0.55 : 1,
                  }}
                >
                  {/* ── Warm top light reflection ────────────────── */}
                  <div className="absolute top-0 inset-x-0 h-[2px] transition-all duration-400"
                    style={{
                      background: isOn
                        ? 'linear-gradient(90deg, transparent 5%, rgba(255,200,100,0.45) 50%, transparent 95%)'
                        : 'linear-gradient(90deg, transparent 10%, rgba(255,200,100,0.15) 50%, transparent 90%)',
                    }}
                  />
                  <div className="absolute top-0 inset-x-0 h-4 pointer-events-none transition-all duration-400"
                    style={{
                      background: isOn
                        ? 'radial-gradient(ellipse 60% 100% at 50% 0%, rgba(255,200,100,0.08) 0%, transparent 70%)'
                        : 'radial-gradient(ellipse 60% 100% at 50% 0%, rgba(255,200,100,0.02) 0%, transparent 70%)',
                    }}
                  />

                  {/* ── Glass reflection — diagonal ──────────────── */}
                  <div className="absolute inset-0 pointer-events-none transition-opacity duration-400"
                    style={{
                      borderRadius: '16px',
                      background: 'linear-gradient(135deg, rgba(255,255,255,0.045) 0%, rgba(255,255,255,0.012) 10%, transparent 30%)',
                      opacity: isOn ? 1 : 0.5,
                    }}
                  />

                  {/* ── Glass horizontal bar ─────────────────────── */}
                  <div className="absolute pointer-events-none transition-opacity duration-400"
                    style={{
                      top: '28%', left: '12px', right: '12px', height: '1px',
                      background: 'linear-gradient(90deg, transparent 5%, rgba(255,255,255,0.035) 50%, transparent 95%)',
                      opacity: isOn ? 1 : 0.3,
                    }}
                  />

                  {/* ── Red glow border ──────────────────────────── */}
                  <div className="absolute inset-0 pointer-events-none transition-opacity duration-400"
                    style={{
                      borderRadius: '16px',
                      boxShadow: isOn
                        ? 'inset 0 0 0 1px rgba(230,57,70,0.12)'
                        : 'inset 0 0 0 1px rgba(230,57,70,0.02)',
                    }}
                  />

                  {/* ═══ CONTENT ══════════════════════════════════ */}
                  <div
                    className="absolute inset-0 z-10 flex flex-col justify-between p-5 sm:p-6 transition-transform duration-400"
                    style={{ transform: isOn ? 'translateY(-2px)' : 'translateY(0)' }}
                  >
                    {/* ── Top: number badge ──────────────────────── */}
                    <div className="flex items-start justify-between">
                      <span
                        className="inline-flex items-center justify-center size-7 rounded-lg text-[0.625rem] font-bold transition-all duration-400"
                        style={{
                          background: isOn ? 'rgba(230,57,70,0.18)' : 'rgba(0,0,0,0.45)',
                          color: isOn ? '#e63946' : 'rgba(255,255,255,0.45)',
                          border: isOn ? '1px solid rgba(230,57,70,0.25)' : '1px solid rgba(255,255,255,0.08)',
                          boxShadow: isOn ? '0 0 8px rgba(230,57,70,0.15)' : 'none',
                        }}
                      >
                        {win.number}
                      </span>
                      <span
                        className="grid size-9 place-content-center rounded-xl transition-all duration-400"
                        style={{
                          background: isOn ? 'rgba(230,57,70,0.12)' : 'rgba(230,57,70,0.04)',
                          color: isOn ? '#e63946' : 'rgba(230,57,70,0.5)',
                          filter: isOn ? 'drop-shadow(0 0 4px rgba(230,57,70,0.2))' : 'none',
                        }}
                      >
                        <Icon size={18} strokeWidth={1.8} />
                      </span>
                    </div>

                    {/* ── Middle: label + size ────────────────────── */}
                    <div>
                      <h3
                        className="font-['Inter',system-ui,sans-serif] text-[0.9375rem] font-bold leading-tight uppercase tracking-wide transition-colors duration-400 sm:text-[1rem]"
                        style={{ color: isOn ? '#ffffff' : 'rgba(255,255,255,0.88)' }}
                      >
                        {win.label}
                      </h3>
                      <p
                        className="mt-1.5 text-[0.6875rem] font-semibold tracking-wide transition-colors duration-400"
                        style={{ color: isOn ? '#d4a72c' : 'rgba(212,167,44,0.5)' }}
                      >
                        {win.size}
                      </p>
                    </div>

                    {/* ── Bottom: description + CTA ──────────────── */}
                    <div>
                      <p
                        className="text-[0.6875rem] leading-[1.5] transition-colors duration-400 line-clamp-2"
                        style={{ color: isOn ? 'rgba(255,255,255,0.55)' : 'rgba(255,255,255,0.3)' }}
                      >
                        {win.body}
                      </p>
                      <span
                        className="mt-2 inline-flex items-center gap-1 text-[0.625rem] font-bold transition-all duration-400"
                        style={{
                          color: isOn ? '#e63946' : 'rgba(230,57,70,0.45)',
                          gap: isOn ? '0.5rem' : '0.15rem',
                        }}
                      >
                        {win.cta}
                        <span className="transition-transform duration-400" style={{ transform: isOn ? 'translateX(2px)' : 'none' }}>&rarr;</span>
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>

        {/* ═══════════════════════════════════════════════════════
            CLOSING
            ═══════════════════════════════════════════════════════ */}
        <div
          className="mt-8 sm:mt-10 text-center transition-all duration-700 ease-out"
          style={{ opacity: revealed ? 1 : 0, transform: revealed ? 'translateY(0)' : 'translateY(8px)', transitionDelay: '0.9s' }}
        >
          <div className="inline-flex items-center justify-center size-7 rounded-full mb-2"
            style={{ background: 'rgba(0,0,0,0.35)', border: '1px solid rgba(255,255,255,0.06)' }}
          >
            <Users size={13} strokeWidth={1.8} style={{ color: '#e63946' }} />
          </div>
          <p className="text-[0.8125rem] text-white/40 sm:text-[0.875rem]">
            Trusted by thousands of travellers across South India.
          </p>
        </div>
      </div>
    </section>
  )
}
