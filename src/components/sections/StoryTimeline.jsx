import { ArrowRight, Quote } from 'lucide-react'
import { company } from '../../data/company'
import { img } from '../../data/images'
import Button from '../ui/Button'
import SectionTitle from '../ui/SectionTitle'
import SmartImage from '../ui/SmartImage'
import { useReveal } from '../../hooks'
import { formatNumber } from '../../utils/format'

/**
 * Condensed company story for the homepage — five milestones on a rail, with
 * the long-form version living on /about. Dark band, so it also breaks up the
 * run of light sections between Packages and How-it-works.
 */

const MILESTONES = [
  {
    year: String(company.since),
    title: 'One batch, one borrowed van',
    body: 'A single Ooty trip for 46 students from a Coimbatore college. Honest quote, bus on time — they called back the next semester.',
  },
  {
    year: '2016',
    title: 'Kerala joins the map',
    body: 'Munnar, Thekkady and the Alleppey backwaters become regular runs. The first 45-seat coach enters the fleet.',
  },
  {
    year: '2019',
    title: 'Transport moves in-house',
    body: 'Our own vehicles, our own hill-route drivers. Quotes stop depending on what a third-party operator feels like charging.',
  },
  {
    year: '2022',
    title: 'A coordinator on every trip',
    body: 'A named coordinator and a 24×7 support line become standard on all group departures, not an add-on.',
  },
  {
    year: 'Today',
    title: `${formatNumber(company.stats[3].value)}+ trips later`,
    body: `${formatNumber(company.stats[0].value)}+ travellers across ${company.stats[2].value}+ destinations — still Coimbatore-based, still group-first.`,
  },
]

function Milestone({ item, index, isLast }) {
  const ref = useReveal()

  return (
    <li
      ref={ref}
      className="reveal relative pb-9 pl-10 last:pb-0"
      style={{ transitionDelay: `${index * 70}ms` }}
    >
      {/* rail */}
      {!isLast && (
        <span aria-hidden="true" className="absolute top-4 bottom-0 left-[0.4375rem] w-px bg-white/12" />
      )}
      <span
        aria-hidden="true"
        className="absolute top-2.5 left-0 size-3.5 rounded-full bg-brand-500 ring-4 ring-brand-500/25"
      />

      <p className="font-display text-sm font-extrabold tracking-[0.14em] text-bone-300 uppercase tabular-nums">
        {item.year}
      </p>
      <h3 className="mt-1.5 font-display text-lg font-bold text-white">{item.title}</h3>
      <p className="mt-1.5 text-[0.9375rem] leading-relaxed text-navy-200">{item.body}</p>
    </li>
  )
}

export default function StoryTimeline({ className = '' }) {
  const asideRef = useReveal()

  return (
    <section className={`relative isolate overflow-hidden bg-navy-950 py-16 sm:py-20 lg:py-24 ${className}`}>
      <SmartImage
        src={img.mountainRoad}
        alt=""
        aria-hidden="true"
        className="absolute inset-0 -z-10 opacity-20"
      />
      <span
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-linear-to-r from-navy-950 via-navy-950/92 to-navy-950/70"
      />
      <span
        aria-hidden="true"
        className="absolute -top-20 -right-24 -z-10 size-80 rounded-full bg-crimson-600/20 blur-3xl"
      />

      <div className="shell">
        <div className="grid gap-12 lg:grid-cols-[1fr_1.05fr] lg:gap-16">
          <div ref={asideRef} className="reveal">
            <SectionTitle
              tone="dark"
              eyebrow="Our story"
              title="Twelve years of getting South India right"
              lead="Avengers Holidays did not start as a travel company. It started as a favour to one college that could not find a bus."
            />

            <figure className="mt-8 rounded-3xl bg-white/5 p-6 ring-1 ring-white/10 ring-inset backdrop-blur-sm sm:p-7">
              <Quote
                size={26}
                strokeWidth={2}
                aria-hidden="true"
                className="text-brand-400"
              />
              <blockquote className="mt-4 text-lg leading-relaxed font-medium text-white">
                “We are still small enough that the founders answer the phone, and established
                enough to move 200 people through Munnar without a hiccup.”
              </blockquote>
              <figcaption className="mt-4 text-xs font-bold tracking-[0.14em] text-navy-300 uppercase">
                {company.legalName} · Coimbatore
              </figcaption>
            </figure>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <SmartImage
                src={img.busJourney}
                alt="An Avengers Holidays coach leaving Coimbatore at dawn"
                ratio="aspect-4/3"
                className="rounded-3xl shadow-lift"
              />
              <SmartImage
                src={img.groupTrek}
                alt="A student group on a guided Nilgiris trail"
                ratio="aspect-4/3"
                className="rounded-3xl shadow-lift"
              />
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <Button to="/about" variant="bone" size="md" iconRight={ArrowRight}>
                Read our full story
              </Button>
              <Button to="/reviews" variant="light" size="md">
                Traveller Reviews
              </Button>
            </div>
          </div>

          <ol className="lg:pt-4">
            {MILESTONES.map((item, index) => (
              <Milestone
                key={item.year}
                item={item}
                index={index}
                isLast={index === MILESTONES.length - 1}
              />
            ))}
          </ol>
        </div>
      </div>
    </section>
  )
}
