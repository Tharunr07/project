import { ShieldCheck, Star, Users, Wallet } from 'lucide-react'
import { company } from '../../data/company'
import Rating from '../ui/Rating'
import { useReveal } from '../../hooks'

/**
 * Credibility strip that sits directly under the full-bleed home hero.
 * Dark editorial aesthetic — continues the same visual language as the
 * "By the Numbers" stats section below it.
 */

function TrustItem({ icon: Icon, label, value, note, children, index }) {
  const ref = useReveal()

  return (
    <div
      ref={ref}
      className="reveal flex gap-4 lg:border-l lg:border-white/[0.08] lg:pl-7 lg:first:border-l-0 lg:first:pl-0"
      style={{ transitionDelay: `${index * 70}ms` }}
    >
      <span
        aria-hidden="true"
        className="grid size-10 shrink-0 place-content-center rounded-lg text-gold-400"
      >
        <Icon size={18} strokeWidth={1.8} />
      </span>

      <div className="min-w-0">
        <p className="text-[0.6875rem] font-semibold tracking-[0.16em] text-bone-300/50 uppercase">
          {label}
        </p>
        <p className="mt-1.5 font-display text-base leading-snug font-extrabold text-bone-100">
          {value}
        </p>
        {children}
        <p className="mt-1 text-[0.8125rem] leading-relaxed text-bone-300/60">{note}</p>
      </div>
    </div>
  )
}

export default function TrustStrip({ averageRating = 0, reviewCount = 0, className = '' }) {
  const hasReviews = reviewCount > 0

  return (
    <section className={`bg-ink-950 py-8 sm:py-10 lg:py-10 ${className}`}>
      <div className="shell">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4 lg:gap-7">
          <TrustItem
            index={0}
            icon={Star}
            label="Traveller rating"
            value={hasReviews ? `${averageRating.toFixed(1)} out of 5` : 'Reviewed after every trip'}
            note={
              hasReviews
                ? `Across ${reviewCount} published reviews from groups who booked directly with us.`
                : 'We publish every review we receive once the group is home safe.'
            }
          >
            {hasReviews && <Rating value={averageRating} size="xs" className="mt-1.5" />}
          </TrustItem>

          <TrustItem
            index={1}
            icon={ShieldCheck}
            label="Registered operator"
            value={`Reg. ${company.registration}`}
            note={`GSTIN ${company.gstin} — every trip is invoiced with GST, in the company name.`}
          />

          <TrustItem
            index={2}
            icon={Users}
            label="Group sizes"
            value="6 to 200 travellers"
            note="From a single Innova to a convoy of 45-seat coaches, priced per person either way."
          />

          <TrustItem
            index={3}
            icon={Wallet}
            label="No online payment"
            value="Nothing is charged here"
            note="You confirm on a call or WhatsApp, only once the itinerary and the price are final."
          />
        </div>
      </div>
    </section>
  )
}
