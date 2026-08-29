import { ArrowRight, Clock, MapPin } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useReveal } from '../../hooks'
import { formatCurrency } from '../../utils/format'
import Badge from '../ui/Badge'
import Rating from '../ui/Rating'
import SmartImage from '../ui/SmartImage'

/** Destination tile used on the home page and the destinations listing. */
export default function DestinationCard({ destination, delay = 0 }) {
  const ref = useReveal()
  const href = `/destinations/${destination.id}`

  return (
    <article
      ref={ref}
      className="reveal group relative flex flex-col overflow-hidden rounded-3xl bg-white shadow-card transition-all duration-400 hover:-translate-y-1.5 hover:shadow-lift"
      style={{ transitionDelay: `${delay}ms` }}
    >
      <Link to={href} className="relative block overflow-hidden" tabIndex={-1} aria-hidden="true">
        <SmartImage
          src={destination.cardImage}
          alt={`${destination.name}, ${destination.state}`}
          ratio="aspect-4/3"
          imgClassName="transition-transform duration-700 ease-out group-hover:scale-107"
        />
        <span
          aria-hidden="true"
          className="absolute inset-0 bg-linear-to-t from-navy-950/75 via-navy-950/10 to-transparent"
        />

        <span className="absolute top-4 left-4">
          <Badge tone="glass" size="sm" icon={MapPin}>
            {destination.state}
          </Badge>
        </span>

        <span className="absolute right-4 bottom-4 rounded-full bg-white/95 px-3 py-1.5 text-xs font-bold text-navy-900 shadow-card backdrop-blur">
          {destination.category}
        </span>

        <div className="absolute bottom-4 left-4 pr-24">
          <h3 className="font-display text-2xl leading-tight font-bold text-white drop-shadow-sm">
            {destination.name}
          </h3>
        </div>
      </Link>

      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <p className="text-sm font-semibold text-crimson-600">{destination.tagline}</p>

        <p className="mt-2.5 line-clamp-3 text-sm leading-relaxed text-navy-500">
          {destination.shortDescription}
        </p>

        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-medium text-navy-500">
          <span className="inline-flex items-center gap-1.5">
            <Clock size={14} className="text-navy-400" aria-hidden="true" />
            {destination.duration}
          </span>
          <Rating value={destination.rating} size="xs" count={destination.reviewCount} />
        </div>

        <div className="mt-5 flex items-end justify-between gap-4 border-t border-sand-200 pt-4">
          <div>
            <p className="text-[0.6875rem] font-semibold tracking-wide text-navy-400 uppercase">
              Starts from
            </p>
            <p className="mt-0.5 font-display text-xl font-bold text-navy-900">
              {formatCurrency(destination.startingPrice)}
              <span className="ml-1 text-xs font-semibold text-navy-400">/ person</span>
            </p>
          </div>

          <Link
            to={href}
            className="inline-flex items-center gap-1.5 rounded-full bg-navy-900 px-4 py-2.5 text-[0.8125rem] font-semibold text-white transition-all hover:gap-2.5 hover:bg-crimson-600"
          >
            View Package
            <ArrowRight size={15} strokeWidth={2.4} aria-hidden="true" />
          </Link>
        </div>
      </div>
    </article>
  )
}
