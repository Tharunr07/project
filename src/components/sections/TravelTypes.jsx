import {
  ArrowRight,
  Briefcase,
  Compass,
  GraduationCap,
  School,
  Users,
  UsersRound,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { GROUP_TYPES } from '../../data/constants'
import Button from '../ui/Button'
import SectionTitle from '../ui/SectionTitle'
import { useReveal } from '../../hooks'

/**
 * Group-segment picker for the homepage. Each card deep-links into the enquiry
 * form with `?groupType=`, which pre-selects the matching option so a visitor
 * who self-identifies here does not have to answer the same question twice.
 *
 * Card order follows GROUP_TYPES so the site and the admin filters never drift.
 */

const DETAIL = {
  College: {
    icon: GraduationCap,
    size: '40 – 200 students',
    body: 'Batch tours with student pricing, separate staff rooms and a night-security briefing before departure.',
  },
  School: {
    icon: School,
    size: '30 – 150 students',
    body: 'Excursions built around school approvals — teacher ratios, first-aid cover and parent circulars handled.',
  },
  Family: {
    icon: Users,
    size: '4 – 40 people',
    body: 'Multi-generation pacing so grandparents, kids and everyone between get a plan that actually works.',
  },
  Friends: {
    icon: UsersRound,
    size: '6 – 30 people',
    body: 'Weekend runs and adventure blocks — rafting, treks and campfires, with the logistics kept invisible.',
  },
  Corporate: {
    icon: Briefcase,
    size: '20 – 200 people',
    body: 'Offsites and team outings with venue setups, activity facilitators and invoice-ready GST billing.',
  },
  Other: {
    icon: Compass,
    size: 'Any size',
    body: 'Pilgrimages, wedding guest movements, senior-citizen circuits — if a group can name it, we can run it.',
  },
}

function TypeCard({ type, index }) {
  const ref = useReveal()
  const { icon: Icon, size, body } = DETAIL[type] ?? DETAIL.Other

  return (
    <li ref={ref} className="reveal" style={{ transitionDelay: `${index * 60}ms` }}>
      <Link
        to={`/enquire?groupType=${encodeURIComponent(type)}`}
        className="group flex h-full flex-col rounded-3xl bg-sand-50 p-6 ring-1 ring-sand-200 ring-inset transition-all duration-400 hover:-translate-y-1 hover:bg-white hover:shadow-lift sm:p-7"
      >
        <div className="flex items-start justify-between gap-4">
          <span
            aria-hidden="true"
            className="grid size-12 place-content-center rounded-2xl bg-crimson-50 text-crimson-600 transition-colors duration-400 group-hover:bg-crimson-600 group-hover:text-white"
          >
            <Icon size={22} strokeWidth={1.9} />
          </span>
          <span className="rounded-full bg-white px-3 py-1.5 text-[0.6875rem] font-bold text-navy-600 ring-1 ring-sand-200 ring-inset transition-colors duration-400 group-hover:bg-brand-600 group-hover:text-white group-hover:ring-brand-600">
            {size}
          </span>
        </div>

        <h3 className="mt-5 text-lg text-navy-900">{type} trips</h3>
        <p className="mt-2 flex-1 text-[0.9375rem] leading-relaxed text-navy-500">{body}</p>

        <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-bold text-crimson-600">
          Plan a {type.toLowerCase()} trip
          <ArrowRight
            size={15}
            strokeWidth={2.4}
            aria-hidden="true"
            className="transition-transform duration-400 group-hover:translate-x-1"
          />
        </span>
      </Link>
    </li>
  )
}

export default function TravelTypes({ className = '' }) {
  return (
    <section className={`bg-white py-16 sm:py-20 lg:py-24 ${className}`}>
      <div className="shell">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <SectionTitle
            eyebrow="Who we travel with"
            title="Six kinds of groups, one standard of care"
            lead="Pick the one that sounds like yours — the pacing, the food, the rooming and the paperwork all change with it."
          />
          <Button to="/enquire" variant="outline" size="md">
            Start an Enquiry
          </Button>
        </div>

        <ul className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
          {GROUP_TYPES.map((type, index) => (
            <TypeCard key={type} type={type} index={index} />
          ))}
        </ul>
      </div>
    </section>
  )
}
