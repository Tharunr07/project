import { Award } from 'lucide-react'
import { useReveal } from '../../hooks'
import { img } from '../../data/images'

const AWARDS = [
  'Favourite Tours and Travels Award \u2014 2022',
  'Young Entrepreneur Award \u2014 2022',
]

export default function CompanyIntroSection() {
  const leftRef = useReveal()
  const rightRef = useReveal()

  return (
    <section className="bg-white py-16 sm:py-20 lg:py-24">
      <div className="shell">
        <div className="grid items-start gap-12 lg:grid-cols-[1fr_0.92fr] lg:gap-16">
          {/* ── Left column — company intro ─────────────────── */}
          <div ref={leftRef} className="reveal">
            <p className="mb-4 text-[0.6875rem] font-semibold tracking-[0.2em] uppercase text-brand-500">
              About Avengers Holidays
            </p>

            <h2 className="font-display text-[1.75rem] font-bold leading-[1.12] tracking-tight text-ink-900 sm:text-[2rem] lg:text-[2.25rem]">
              Best Travel Agency in Coimbatore {'\u2014'} Avengers Holidays
            </h2>

            <span
              aria-hidden="true"
              className="mt-5 block h-px w-14 bg-brand-500/40"
            />

            <p className="mt-6 text-[0.9375rem] leading-[1.75] text-ink-600">
              Looking for the best travel agency in Coimbatore to plan your next trip?
              Welcome to Avengers Holidays, your trusted partner for memorable and
              comfortable journeys. With years of experience in the travel industry, we
              specialize in organizing well-planned trips that suit every traveler&rsquo;s
              needs and budget.
            </p>

            <p className="mt-4 text-[0.9375rem] leading-[1.75] text-ink-600">
              Whether you are planning a family vacation, a honeymoon trip, a pilgrimage
              tour, or a group holiday, our team ensures that every detail of your
              journey is carefully arranged. As a trusted South India travel company, we
              focus on delivering smooth travel experiences with quality service and
              customer satisfaction.
            </p>
          </div>

          {/* ── Right column — image + awards ────────────────── */}
          <div ref={rightRef} className="reveal">
            <div className="overflow-hidden rounded-3xl">
              <img
                src={img.resortLawn}
                alt="Avengers Holidays office"
                className="h-64 w-full object-cover sm:h-80 lg:h-[22rem]"
                loading="lazy"
              />
            </div>

            {/* Awards */}
            <div className="mt-8">
              <h3 className="font-display text-lg font-bold text-ink-900">
                Our Awards
              </h3>
              <span
                aria-hidden="true"
                className="mt-3 block h-px w-10 bg-brand-500/40"
              />

              <ul className="mt-5 space-y-4">
                {AWARDS.map((award) => (
                  <li key={award} className="flex items-start gap-3">
                    <span
                      aria-hidden="true"
                      className="mt-0.5 grid size-8 shrink-0 place-content-center rounded-lg bg-brand-50 text-brand-500"
                    >
                      <Award size={16} strokeWidth={2} />
                    </span>
                    <span className="text-[0.875rem] leading-snug text-ink-600">
                      {award}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
