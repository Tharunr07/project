import {
  BedDouble,
  Bus,
  CalendarDays,
  Check,
  ChevronDown,
  Clock,
  IndianRupee,
  Info,
  MapPin,
  MessageCircle,
  Moon,
  PackageSearch,
  Phone,
  Star,
  UsersRound,
  Utensils,
  X,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import PackageCard from '../components/cards/PackageCard'
import CTASection from '../components/sections/CTASection'
import GalleryGrid from '../components/sections/GalleryGrid'
import Hero from '../components/sections/Hero'
import Button from '../components/ui/Button'
import Badge from '../components/ui/Badge'
import Rating from '../components/ui/Rating'
import SectionTitle from '../components/ui/SectionTitle'
import { EmptyState, ErrorState, LoadingState } from '../components/ui/States'
import { telLink, whatsappLink } from '../data/company'
import { useDestination } from '../firebase/collections/destinations'
import { usePackage, usePublishedPackages } from '../firebase/collections/packages'
import { formatCurrency } from '../utils/format'

function ItineraryDay({ day, defaultOpen }) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <li className="overflow-hidden rounded-3xl bg-white shadow-card">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        className="flex w-full cursor-pointer items-center gap-4 px-5 py-5 text-left transition-colors hover:bg-sand-50 sm:px-6"
      >
        <span
          aria-hidden="true"
          className={`grid size-12 shrink-0 place-content-center rounded-2xl font-display text-sm leading-none font-bold transition-colors ${
            open ? 'bg-crimson-600 text-white' : 'bg-brand-600 text-white'
          }`}
        >
          <span className="block text-[0.5625rem] tracking-widest uppercase opacity-70">Day</span>
          <span className="block text-center text-base">{day.day}</span>
        </span>

        <span className="min-w-0 flex-1">
          <span className="block font-display text-lg leading-snug font-bold text-navy-900">
            {day.title}
          </span>
          <span className="mt-0.5 block text-xs font-semibold text-navy-400">
            {day.details.length} planned stops
          </span>
        </span>

        <ChevronDown
          size={20}
          strokeWidth={2.2}
          aria-hidden="true"
          className={`shrink-0 text-navy-400 transition-transform duration-300 ${
            open ? 'rotate-180' : ''
          }`}
        />
      </button>

      {open && (
        <div className="animate-slide-down border-t border-sand-200 px-5 py-5 sm:px-6">
          <ul className="space-y-3">
            {day.details.map((detail) => (
              <li key={detail} className="flex gap-3.5">
                <span
                  aria-hidden="true"
                  className="mt-2 size-1.5 shrink-0 rounded-full bg-crimson-500"
                />
                <span className="text-sm leading-relaxed text-navy-600">{detail}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </li>
  )
}

export default function PackageDetail() {
  const { id } = useParams()

  const { data: fetchedPkg, loading, error, reload } = usePackage(id)
  const { data: publishedPackages } = usePublishedPackages()
  // Sidebar destination card — resolved live from Firestore.
  const destinationId = fetchedPkg?.destinationId ?? null
  const { data: linkedDestination } = useDestination(destinationId)

  const data = useMemo(() => {
    if (!fetchedPkg) return null
    return {
      pkg: fetchedPkg,
      destination: linkedDestination,
      related: (publishedPackages ?? [])
        .filter((item) => item.id !== fetchedPkg.id)
        .filter((item) => item.destinationId === fetchedPkg.destinationId || item.category === fetchedPkg.category)
        .slice(0, 3),
    }
  }, [fetchedPkg, publishedPackages, linkedDestination])

  if (loading) {
    return (
      <div className="pt-32 pb-24">
        <LoadingState label="Loading package…" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="shell pt-32 pb-24">
        <ErrorState
          title="Could not load this package"
          message={error.message}
          onRetry={reload}
        />
      </div>
    )
  }

  if (!data) {
    return (
      <div className="shell pt-32 pb-24">
        <EmptyState
          icon={PackageSearch}
          title="We could not find that package"
          message="It may have been renamed or unpublished. Browse all current packages to find a comparable trip."
          action={
            <Button to="/packages" variant="primary" size="md">
              All Packages
            </Button>
          }
        />
      </div>
    )
  }

  const { pkg, destination, related } = data
  const waMessage = `Hi Avengers Holidays, I'd like a quote for the ${pkg.name} package (${pkg.duration}, ${formatCurrency(pkg.price)} per person).`
  const enquireHref = `/enquire?package=${pkg.id}&destination=${pkg.destinationId}`

  return (
    <>
      <Hero
        size="detail"
        image={pkg.image}
        eyebrow={`${pkg.category} · ${pkg.destination}`}
        title={pkg.name}
        lead={pkg.shortDescription}
        breadcrumb={[
          { label: 'Home', to: '/' },
          { label: 'Packages', to: '/packages' },
          { label: pkg.name },
        ]}
        meta={[
          { icon: IndianRupee, label: 'Per person', value: formatCurrency(pkg.price) },
          { icon: Clock, label: 'Duration', value: pkg.duration },
          { icon: UsersRound, label: 'Minimum group', value: `${pkg.minGroupSize} travellers` },
          { icon: Star, label: 'Rating', value: `${pkg.rating} (${pkg.reviewCount})` },
        ]}
        actions={
          <>
            <Button to={enquireHref} variant="primary" size="lg">
              Send an Enquiry
            </Button>
            <Button href={whatsappLink(waMessage)} variant="whatsapp" size="lg" icon={MessageCircle}>
              WhatsApp
            </Button>
            <Button href={telLink} variant="light" size="lg" icon={Phone} target={undefined}>
              Call Now
            </Button>
          </>
        }
      />

      <div className="shell py-12 sm:py-16">
        <div className="grid gap-12 lg:grid-cols-[1.65fr_1fr] lg:gap-14">
          {/* ------------------------------------------------------------ main */}
          <div className="min-w-0">
            {/* Overview */}
            <section>
              <div className="flex flex-wrap items-center gap-2.5">
                {pkg.tags?.map((tag) => (
                  <Badge key={tag} tone="crimson" size="md">
                    {tag}
                  </Badge>
                ))}
                <Rating value={pkg.rating} size="sm" showValue count={pkg.reviewCount} />
              </div>

              <h2 className="mt-6 text-2xl text-navy-900 sm:text-3xl">Trip overview</h2>
              <p className="mt-4 text-[1.0625rem] leading-relaxed text-navy-600">{pkg.overview}</p>

              <dl className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {[
                  { icon: CalendarDays, label: 'Days', value: `${pkg.days} days` },
                  { icon: Moon, label: 'Nights', value: `${pkg.nights} nights` },
                  { icon: MapPin, label: 'Base', value: pkg.destination },
                  { icon: UsersRound, label: 'Min. group', value: `${pkg.minGroupSize} pax` },
                ].map((row) => (
                  <div key={row.label} className="rounded-2xl bg-white p-4 shadow-card">
                    <row.icon size={18} className="text-crimson-600" aria-hidden="true" />
                    <dt className="mt-3 text-[0.625rem] font-bold tracking-[0.14em] text-navy-400 uppercase">
                      {row.label}
                    </dt>
                    <dd className="mt-0.5 font-display text-base font-bold text-navy-900">
                      {row.value}
                    </dd>
                  </div>
                ))}
              </dl>
            </section>

            {/* Itinerary */}
            <section className="mt-14">
              <SectionTitle
                eyebrow="Day by day"
                title="The full itinerary"
                lead="Timings are planned around traffic and crowd patterns rather than a fixed template. Your coordinator can reorder days on the ground if the weather turns."
                as="h2"
              />

              <ol className="mt-8 space-y-3">
                {pkg.itinerary.map((day, index) => (
                  <ItineraryDay key={day.day} day={day} defaultOpen={index === 0} />
                ))}
              </ol>
            </section>

            {/* Hotels */}
            <section className="mt-14">
              <SectionTitle eyebrow="Where you stay" title="Hotel details" as="h2" />

              <div className="mt-8 grid gap-4">
                {pkg.hotels.map((hotel) => (
                  <article
                    key={`${hotel.city}-${hotel.name}`}
                    className="rounded-3xl bg-white p-5 shadow-card sm:p-6"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="text-xs font-bold tracking-wide text-crimson-600 uppercase">
                          {hotel.city} · {hotel.nights} {hotel.nights === 1 ? 'night' : 'nights'}
                        </p>
                        <h3 className="mt-1.5 text-xl text-navy-900">{hotel.name}</h3>
                      </div>
                      <Badge tone="gold" size="md">
                        {hotel.category}
                      </Badge>
                    </div>

                    <dl className="mt-5 grid gap-4 sm:grid-cols-2">
                      <div className="flex items-start gap-3">
                        <BedDouble
                          size={17}
                          className="mt-0.5 shrink-0 text-navy-400"
                          aria-hidden="true"
                        />
                        <div>
                          <dt className="text-[0.625rem] font-bold tracking-[0.14em] text-navy-400 uppercase">
                            Room
                          </dt>
                          <dd className="mt-0.5 text-sm font-semibold text-navy-800">
                            {hotel.roomType}
                          </dd>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <Utensils
                          size={17}
                          className="mt-0.5 shrink-0 text-navy-400"
                          aria-hidden="true"
                        />
                        <div>
                          <dt className="text-[0.625rem] font-bold tracking-[0.14em] text-navy-400 uppercase">
                            Meals
                          </dt>
                          <dd className="mt-0.5 text-sm font-semibold text-navy-800">
                            {hotel.mealPlan}
                          </dd>
                        </div>
                      </div>
                    </dl>

                    {hotel.note && (
                      <p className="mt-4 rounded-2xl bg-sand-50 p-4 text-sm leading-relaxed text-navy-500">
                        {hotel.note}
                      </p>
                    )}
                  </article>
                ))}
              </div>
            </section>

            {/* Transport */}
            <section className="mt-14">
              <SectionTitle eyebrow="Getting around" title="Transportation" as="h2" />

              <div className="mt-8 rounded-3xl bg-navy-900 p-6 text-white shadow-lift sm:p-8">
                <dl className="grid gap-6 sm:grid-cols-3">
                  {[
                    { icon: Bus, label: 'Vehicle', value: pkg.transport.vehicle },
                    { icon: UsersRound, label: 'Driver', value: pkg.transport.driver },
                    { icon: MapPin, label: 'Pick-up', value: pkg.transport.pickup },
                  ].map((row) => (
                    <div key={row.label}>
                      <span
                        aria-hidden="true"
                        className="grid size-10 place-content-center rounded-xl bg-white/8 text-bone-200"
                      >
                        <row.icon size={17} strokeWidth={2} />
                      </span>
                      <dt className="mt-3 text-[0.625rem] font-bold tracking-[0.14em] text-navy-300 uppercase">
                        {row.label}
                      </dt>
                      <dd className="mt-1 text-sm leading-relaxed font-semibold text-white">
                        {row.value}
                      </dd>
                    </div>
                  ))}
                </dl>

                <ul className="mt-7 space-y-2.5 border-t border-white/10 pt-6">
                  {pkg.transport.notes.map((note) => (
                    <li key={note} className="flex gap-3 text-sm leading-relaxed text-navy-200">
                      <Info size={15} className="mt-0.5 shrink-0 text-bone-200" aria-hidden="true" />
                      {note}
                    </li>
                  ))}
                </ul>
              </div>
            </section>

            {/* Inclusions / exclusions */}
            <section className="mt-14">
              <SectionTitle
                eyebrow="What the price covers"
                title="Included and excluded services"
                as="h2"
              />

              <div className="mt-8 grid gap-5 lg:grid-cols-2">
                <div className="rounded-3xl border border-emerald-200 bg-emerald-50/60 p-6">
                  <h3 className="flex items-center gap-2.5 text-lg text-emerald-800">
                    <span
                      aria-hidden="true"
                      className="grid size-7 place-content-center rounded-full bg-emerald-600 text-white"
                    >
                      <Check size={15} strokeWidth={3} />
                    </span>
                    Included
                  </h3>
                  <ul className="mt-5 space-y-3">
                    {pkg.inclusions.map((item) => (
                      <li key={item} className="flex gap-3 text-sm leading-relaxed text-navy-700">
                        <Check
                          size={16}
                          strokeWidth={2.6}
                          className="mt-0.5 shrink-0 text-emerald-600"
                          aria-hidden="true"
                        />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="rounded-3xl border border-crimson-200 bg-crimson-50/60 p-6">
                  <h3 className="flex items-center gap-2.5 text-lg text-crimson-800">
                    <span
                      aria-hidden="true"
                      className="grid size-7 place-content-center rounded-full bg-crimson-600 text-white"
                    >
                      <X size={15} strokeWidth={3} />
                    </span>
                    Not included
                  </h3>
                  <ul className="mt-5 space-y-3">
                    {pkg.exclusions.map((item) => (
                      <li key={item} className="flex gap-3 text-sm leading-relaxed text-navy-700">
                        <X
                          size={16}
                          strokeWidth={2.6}
                          className="mt-0.5 shrink-0 text-crimson-600"
                          aria-hidden="true"
                        />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </section>

            {/* Terms */}
            <section className="mt-14">
              <SectionTitle eyebrow="Before you confirm" title="Terms and notes" as="h2" />

              <ol className="mt-8 space-y-3 rounded-3xl bg-white p-6 shadow-card sm:p-7">
                {pkg.terms.map((term, index) => (
                  <li key={term} className="flex gap-4">
                    <span
                      aria-hidden="true"
                      className="grid size-6 shrink-0 place-content-center rounded-full bg-sand-200 text-[0.6875rem] font-bold text-navy-600"
                    >
                      {index + 1}
                    </span>
                    <span className="text-sm leading-relaxed text-navy-600">{term}</span>
                  </li>
                ))}
              </ol>

              <p className="mt-5 flex gap-3 rounded-2xl bg-sand-100 p-5 text-sm leading-relaxed text-navy-500">
                <Info size={17} className="mt-0.5 shrink-0 text-navy-400" aria-hidden="true" />
                Bookings are confirmed over phone or WhatsApp with a written quote and a signed
                confirmation — there is no online payment on this website. Your coordinator will walk
                you through the advance and balance schedule before anything is committed.
              </p>
            </section>
          </div>

          {/* ---------------------------------------------------------- sidebar */}
          <aside className="lg:sticky lg:top-28 lg:self-start">
            <div className="overflow-hidden rounded-3xl bg-white shadow-lift">
              <div className="bg-navy-900 px-6 py-6 text-white">
                <p className="text-[0.6875rem] font-bold tracking-[0.16em] text-bone-200 uppercase">
                  Current price
                </p>
                <p className="mt-2 font-display text-4xl font-extrabold">
                  {formatCurrency(pkg.price)}
                </p>
                <p className="mt-1 text-sm font-medium text-navy-200">
                  per person · twin sharing · min {pkg.minGroupSize} travellers
                </p>
              </div>

              <dl className="divide-y divide-sand-200 px-6">
                {[
                  { label: 'Duration', value: pkg.duration },
                  { label: 'Destination', value: pkg.destination },
                  { label: 'Trip type', value: pkg.category },
                  { label: 'Hotels', value: `${pkg.hotels.length} property / ${pkg.nights} nights` },
                ].map((row) => (
                  <div key={row.label} className="flex items-center justify-between gap-4 py-3.5">
                    <dt className="text-sm font-medium text-navy-500">{row.label}</dt>
                    <dd className="text-right text-sm font-bold text-navy-900">{row.value}</dd>
                  </div>
                ))}
              </dl>

              <div className="space-y-2.5 px-6 pt-2 pb-6">
                <Button to={enquireHref} variant="primary" size="md" fullWidth>
                  Enquire About This Trip
                </Button>
                <Button
                  href={whatsappLink(waMessage)}
                  variant="whatsapp"
                  size="md"
                  icon={MessageCircle}
                  fullWidth
                >
                  WhatsApp Us
                </Button>
                <Button
                  href={telLink}
                  variant="outline"
                  size="md"
                  icon={Phone}
                  fullWidth
                  target={undefined}
                >
                  Call Now
                </Button>

                <p className="pt-2 text-center text-xs leading-relaxed text-navy-400">
                  No online booking or payment. A coordinator confirms availability and pricing with
                  you first.
                </p>
              </div>
            </div>

            {destination && (
              <Link
                to={`/destinations/${destination.id}`}
                className="group mt-5 block rounded-3xl bg-sand-100 p-5 transition-colors hover:bg-sand-200"
              >
                <p className="text-xs font-bold tracking-wide text-navy-400 uppercase">
                  More about the destination
                </p>
                <p className="mt-1.5 font-display text-lg font-bold text-navy-900 group-hover:text-crimson-600">
                  {destination.name} travel guide
                </p>
                <p className="mt-1.5 text-sm leading-relaxed text-navy-500">
                  Attractions, best season and every other itinerary we run there.
                </p>
              </Link>
            )}
          </aside>
        </div>
      </div>

      {/* ------------------------------------------------------------- gallery */}
      <section className="bg-sand-100 py-14 sm:py-20">
        <div className="shell">
          <SectionTitle eyebrow="Photo gallery" title={`${pkg.name} in pictures`} />
          <div className="mt-12">
            <GalleryGrid
              items={pkg.gallery.map((src, index) => ({
                id: `${pkg.id}-${index}`,
                src,
                title: `${pkg.name} — frame ${index + 1}`,
                destination: pkg.destination,
                category: pkg.category,
              }))}
            />
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------- related */}
      {related.length > 0 && (
        <section className="shell py-14 sm:py-20">
          <SectionTitle
            eyebrow="You may also like"
            title="Similar trips groups compare with this one"
          />
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((item, index) => (
              <PackageCard key={item.id} pkg={item} delay={index * 70} />
            ))}
          </div>
        </section>
      )}

      <CTASection
        eyebrow="Ready when you are"
        title={`Get a written quote for ${pkg.name}`}
        lead="Send your dates and traveller count. You will get a costed itinerary you can circulate to the group before anyone pays anything."
        image={pkg.gallery[3] ?? pkg.image}
        whatsappMessage={waMessage}
      />
    </>
  )
}
