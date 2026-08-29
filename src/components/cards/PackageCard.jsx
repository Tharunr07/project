import { ArrowRight, CalendarDays, MapPin, MessageCircle, Moon, Users } from 'lucide-react'
import { Link } from 'react-router-dom'
import { whatsappLink } from '../../data/company'
import { useReveal } from '../../hooks'
import { formatCurrency } from '../../utils/format'
import Badge from '../ui/Badge'
import Button from '../ui/Button'
import Rating from '../ui/Rating'
import SmartImage from '../ui/SmartImage'

/**
 * Package tile used on the home page, the packages listing and the destination
 * detail page. `compact` drops the description for tighter grids.
 */
export default function PackageCard({ pkg, compact = false, delay = 0 }) {
  const ref = useReveal()
  const href = `/packages/${pkg.id}`
  const enquireHref = `/enquire?package=${pkg.id}&destination=${pkg.destinationId}`
  const waMessage = `Hi Avengers Holidays, I'm interested in the ${pkg.name} package (${pkg.duration}) to ${pkg.destination}. Could you share the details?`

  return (
    <article
      ref={ref}
      className="reveal group flex flex-col overflow-hidden rounded-3xl bg-white shadow-card transition-all duration-400 hover:-translate-y-1.5 hover:shadow-lift"
      style={{ transitionDelay: `${delay}ms` }}
    >
      <Link to={href} className="relative block" tabIndex={-1} aria-hidden="true">
        <SmartImage
          src={pkg.image}
          alt={pkg.name}
          ratio="aspect-16/10"
          imgClassName="transition-transform duration-700 ease-out group-hover:scale-107"
        />
        <span
          aria-hidden="true"
          className="absolute inset-0 bg-linear-to-t from-navy-950/60 via-transparent to-navy-950/20"
        />

        <span className="absolute top-4 left-4 flex flex-wrap gap-2">
          <Badge tone="glass" size="sm" icon={MapPin}>
            {pkg.destination}
          </Badge>
          {pkg.popular && (
            <Badge tone="brand" size="sm">
              Most Booked
            </Badge>
          )}
        </span>

        <span className="absolute right-4 bottom-4 inline-flex items-center gap-1.5 rounded-full bg-navy-950/70 px-3 py-1.5 text-[0.6875rem] font-bold tracking-wide text-white uppercase backdrop-blur-sm">
          {pkg.category}
        </span>
      </Link>

      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-display text-xl leading-snug font-bold text-navy-900">
            <Link to={href} className="transition-colors hover:text-crimson-600">
              {pkg.name}
            </Link>
          </h3>
        </div>

        <Rating
          value={pkg.rating}
          size="xs"
          count={pkg.reviewCount}
          className="mt-2"
        />

        {!compact && (
          <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-navy-500">
            {pkg.shortDescription}
          </p>
        )}

        {/* Trip shape at a glance — days, nights, minimum group */}
        <dl className="mt-4 grid grid-cols-3 gap-2 rounded-2xl bg-sand-50 p-3 text-center">
          <div>
            <dt className="sr-only">Days</dt>
            <dd className="flex flex-col items-center gap-1">
              <CalendarDays size={15} className="text-crimson-600" aria-hidden="true" />
              <span className="text-[0.8125rem] font-bold text-navy-900">{pkg.days} Days</span>
            </dd>
          </div>
          <div className="border-x border-sand-200">
            <dt className="sr-only">Nights</dt>
            <dd className="flex flex-col items-center gap-1">
              <Moon size={15} className="text-crimson-600" aria-hidden="true" />
              <span className="text-[0.8125rem] font-bold text-navy-900">{pkg.nights} Nights</span>
            </dd>
          </div>
          <div>
            <dt className="sr-only">Minimum group size</dt>
            <dd className="flex flex-col items-center gap-1">
              <Users size={15} className="text-crimson-600" aria-hidden="true" />
              <span className="text-[0.8125rem] font-bold text-navy-900">
                Min {pkg.minGroupSize}
              </span>
            </dd>
          </div>
        </dl>

        <div className="mt-auto pt-5">
          <div className="flex items-end justify-between gap-3">
            <div>
              <p className="text-[0.6875rem] font-semibold tracking-wide text-navy-400 uppercase">
                Per person
              </p>
              <p className="font-display text-2xl font-bold text-navy-900">
                {formatCurrency(pkg.price)}
              </p>
            </div>
            <Link
              to={href}
              className="inline-flex items-center gap-1.5 text-sm font-bold text-crimson-600 transition-all hover:gap-2.5 hover:text-crimson-700"
            >
              View Details
              <ArrowRight size={16} strokeWidth={2.4} aria-hidden="true" />
            </Link>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2.5">
            <Button to={enquireHref} variant="dark" size="sm">
              Enquire
            </Button>
            <Button
              href={whatsappLink(waMessage)}
              variant="whatsapp"
              size="sm"
              icon={MessageCircle}
            >
              WhatsApp
            </Button>
          </div>
        </div>
      </div>
    </article>
  )
}
