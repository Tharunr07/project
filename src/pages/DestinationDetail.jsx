import {
  CalendarRange,
  Camera,
  Check,
  Clock,
  IndianRupee,
  MapPin,
  MessageCircle,
  Mountain,
  Navigation,
  Phone,
  Sparkles,
  Star,
} from 'lucide-react'
import { useMemo } from 'react'
import { useParams } from 'react-router-dom'
import PackageCard from '../components/cards/PackageCard'
import CTASection from '../components/sections/CTASection'
import GalleryGrid from '../components/sections/GalleryGrid'
import Hero from '../components/sections/Hero'
import Button from '../components/ui/Button'
import SectionTitle from '../components/ui/SectionTitle'
import { EmptyState, ErrorState, LoadingState } from '../components/ui/States'
import { telLink, whatsappLink } from '../data/company'
import { useDestination } from '../firebase/collections/destinations'
import { usePublishedPackages } from '../firebase/collections/packages'
import { usePublishedReviews } from '../firebase/collections/reviews'
import { formatCurrency } from '../utils/format'
import ReviewCard from '../components/cards/ReviewCard'

export default function DestinationDetail() {
  const { id } = useParams()

  // Live Firestore subscription — single destination doc.
  const { data: fetchedDestination, loading, error, reload } = useDestination(id)
  const { data: publishedPackages } = usePublishedPackages()
  const { data: publishedReviews } = usePublishedReviews()

  const data = useMemo(() => {
    if (!fetchedDestination) return null
    return {
      destination: fetchedDestination,
      packages: (publishedPackages ?? []).filter((pkg) => pkg.destinationId === fetchedDestination.id),
      reviews: (publishedReviews ?? [])
        .filter((review) => review.destination === fetchedDestination.name)
        .slice(0, 3),
    }
  }, [fetchedDestination, publishedPackages, publishedReviews])

  // Development-only diagnostic logging
  if (import.meta.env.DEV && data) {
    const attrs = data.destination.attractions
    console.log(`[DestinationDetail] "${data.destination.name}" attractions:`, Array.isArray(attrs) ? attrs.length : typeof attrs, attrs)
  }

  if (loading) {
    return (
      <div className="pt-32 pb-24">
        <LoadingState label="Loading destination…" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="shell pt-32 pb-24">
        <ErrorState title="Could not load this destination" message={error.message} onRetry={reload} />
      </div>
    )
  }

  if (!data) {
    return (
      <div className="shell pt-32 pb-24">
        <EmptyState
          icon={MapPin}
          title="We could not find that destination"
          message="The link may be out of date. Browse the full destination list to find what you are looking for."
          action={
            <Button to="/destinations" variant="primary" size="md">
              All Destinations
            </Button>
          }
        />
      </div>
    )
  }

  const { destination, packages, reviews: destinationReviews } = data
  const attractions = Array.isArray(destination.attractions) ? destination.attractions : []
  const waMessage = `Hi Avengers Holidays, I'd like details and a quote for a ${destination.name} trip.`

  return (
    <>
      <Hero
        size="detail"
        image={destination.heroImage}
        eyebrow={`${destination.category} · ${destination.state}`}
        title={destination.name}
        lead={destination.tagline}
        breadcrumb={[
          { label: 'Home', to: '/' },
          { label: 'Destinations', to: '/destinations' },
          { label: destination.name },
        ]}
        meta={[
          { icon: IndianRupee, label: 'Starts from', value: `${formatCurrency(destination.startingPrice)} / person` },
          { icon: Clock, label: 'Duration', value: destination.duration },
          { icon: CalendarRange, label: 'Best time', value: destination.bestTime },
          { icon: Star, label: 'Rating', value: `${destination.rating} (${destination.reviewCount})` },
        ]}
        actions={
          <>
            <Button to={`/enquire?destination=${destination.id}`} variant="primary" size="lg">
              Send an Enquiry
            </Button>
            <Button
              href={whatsappLink(waMessage)}
              variant="whatsapp"
              size="lg"
              icon={MessageCircle}
            >
              WhatsApp
            </Button>
            <Button href={telLink} variant="light" size="lg" icon={Phone} target={undefined}>
              Call Now
            </Button>
          </>
        }
      />

      {/* ------------------------------------------------------------ overview */}
      <section className="shell py-14 sm:py-20">
        <div className="grid gap-12 lg:grid-cols-[1.6fr_1fr] lg:gap-16">
          <div>
            <SectionTitle
              eyebrow="About the destination"
              title={`Why groups keep going back to ${destination.name}`}
            />
            <p className="mt-6 text-[1.0625rem] leading-relaxed text-navy-600">
              {destination.description}
            </p>

            <ul className="mt-8 grid gap-3 sm:grid-cols-2">
              {destination.highlights.map((highlight) => (
                <li
                  key={highlight}
                  className="flex items-start gap-3 rounded-2xl bg-white p-4 shadow-card"
                >
                  <span
                    aria-hidden="true"
                    className="mt-0.5 grid size-6 shrink-0 place-content-center rounded-full bg-crimson-600 text-white"
                  >
                    <Check size={14} strokeWidth={3} />
                  </span>
                  <span className="text-sm leading-relaxed font-medium text-navy-700">
                    {highlight}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick facts */}
          <aside className="lg:sticky lg:top-28 lg:self-start">
            <div className="overflow-hidden rounded-3xl bg-navy-900 text-white shadow-lift">
              <div className="border-b border-white/10 px-6 py-5">
                <p className="text-xs font-bold tracking-[0.16em] text-bone-200 uppercase">
                  Trip snapshot
                </p>
              </div>

              <dl className="divide-y divide-white/8 px-6">
                {[
                  { icon: IndianRupee, label: 'Starting price', value: `${formatCurrency(destination.startingPrice)} per person` },
                  { icon: Clock, label: 'Typical duration', value: destination.duration },
                  { icon: CalendarRange, label: 'Best season', value: destination.bestTime },
                  { icon: Mountain, label: 'Altitude', value: destination.altitude },
                  { icon: Navigation, label: 'Distance', value: destination.distanceFromBase },
                  { icon: Sparkles, label: 'Packages available', value: `${packages.length} itineraries` },
                ].map((row) => (
                  <div key={row.label} className="flex items-start gap-3.5 py-4">
                    <span
                      aria-hidden="true"
                      className="grid size-9 shrink-0 place-content-center rounded-xl bg-white/8 text-bone-200"
                    >
                      <row.icon size={16} strokeWidth={2} />
                    </span>
                    <div>
                      <dt className="text-[0.625rem] font-bold tracking-[0.14em] text-navy-300 uppercase">
                        {row.label}
                      </dt>
                      <dd className="mt-0.5 text-sm font-bold text-white">{row.value}</dd>
                    </div>
                  </div>
                ))}
              </dl>

              <div className="space-y-2.5 bg-navy-950/60 px-6 py-6">
                <Button
                  to={`/enquire?destination=${destination.id}`}
                  variant="primary"
                  size="md"
                  fullWidth
                >
                  Get a Quote
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
                  variant="light"
                  size="md"
                  icon={Phone}
                  fullWidth
                  target={undefined}
                >
                  Call Now
                </Button>
              </div>
            </div>
          </aside>
        </div>
      </section>

      {/* --------------------------------------------------------- attractions */}
      <section className="bg-sand-100 py-14 sm:py-20">
        <div className="shell">
          <SectionTitle
            eyebrow="Best attractions"
            title={`What we cover in ${destination.name}`}
            lead="Every stop below appears in at least one of our itineraries, with entry tickets already included where applicable."
          />

          {attractions.length > 0 ? (
            <ol className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {attractions.map((attraction, index) => (
                <li
                  key={attraction.name}
                  className="group relative rounded-3xl bg-white p-6 shadow-card transition-all duration-400 hover:-translate-y-1 hover:shadow-lift"
                >
                  <span
                    aria-hidden="true"
                    className="font-display text-4xl font-extrabold text-sand-300 transition-colors duration-400 group-hover:text-crimson-200"
                  >
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <h3 className="mt-3 text-lg leading-snug text-navy-900">{attraction.name}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-navy-500">{attraction.note}</p>
                </li>
              ))}
            </ol>
          ) : (
            <p className="mt-10 text-center text-sm text-navy-400">Attractions for this destination will appear here soon.</p>
          )}
        </div>
      </section>

      {/* ------------------------------------------------------------ packages */}
      <section className="shell py-14 sm:py-20">
        <SectionTitle
          eyebrow="Available packages"
          title={`${packages.length} ready itineraries for ${destination.name}`}
          lead="Prices are per person on twin sharing and include stay, travel, listed meals and entry tickets. Every itinerary can be re-costed for your group size."
        />

        {packages.length === 0 ? (
          <div className="mt-10">
            <EmptyState
              title="No published packages yet"
              message={`We run custom ${destination.name} trips on request — send an enquiry and we will build one for your group.`}
              action={
                <Button to={`/enquire?destination=${destination.id}`} variant="primary" size="sm">
                  Request an itinerary
                </Button>
              }
            />
          </div>
        ) : (
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {packages.map((pkg, index) => (
              <PackageCard key={pkg.id} pkg={pkg} delay={index * 70} />
            ))}
          </div>
        )}
      </section>

      {/* ------------------------------------------------------------- gallery */}
      <section className="bg-sand-100 py-14 sm:py-20">
        <div className="shell">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <SectionTitle
              eyebrow="Photo gallery"
              title={`${destination.name} through our travellers' cameras`}
            />
            <Button to="/gallery" variant="outline" size="md" icon={Camera}>
              Full Gallery
            </Button>
          </div>

          <div className="mt-12">
            <GalleryGrid
              items={destination.gallery.map((src, index) => ({
                id: `${destination.id}-${index}`,
                src,
                title: `${destination.name} — frame ${index + 1}`,
                destination: destination.name,
                category: destination.category,
              }))}
            />
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------- reviews */}
      {destinationReviews.length > 0 && (
        <section className="shell py-14 sm:py-20">
          <SectionTitle
            eyebrow="Traveller reviews"
            title={`Groups who travelled to ${destination.name} with us`}
          />
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {destinationReviews.map((review, index) => (
              <ReviewCard key={review.id} review={review} delay={index * 70} />
            ))}
          </div>
        </section>
      )}

      <CTASection
        eyebrow={`Plan your ${destination.name} trip`}
        title={`Tell us your dates and we will hold a ${destination.name} slot for your group`}
        lead="Weekends and school-holiday weeks fill early, especially for larger groups. Send an enquiry and we will confirm availability before you commit to anything."
        image={destination.gallery[2] ?? destination.heroImage}
        whatsappMessage={waMessage}
      />
    </>
  )
}
