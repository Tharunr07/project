import { MapPinned, Route, Users, CalendarCheck } from 'lucide-react'
import { useMemo } from 'react'
import DestinationCard from '../components/cards/DestinationCard'
import PackageCard from '../components/cards/PackageCard'
import StatsCard from '../components/cards/StatsCard'
import CTASection from '../components/sections/CTASection'
import FAQSection from '../components/sections/FAQSection'
import CompanyIntroSection from '../components/sections/CompanyIntroSection'
import CinematicHero from '../components/sections/CinematicHero'
import TestimonialCarousel from '../components/sections/TestimonialCarousel'
import BusRouteJourney from '../components/sections/BusRouteJourney'
import TrustStrip from '../components/sections/TrustStrip'
import Button from '../components/ui/Button'
import SectionTitle from '../components/ui/SectionTitle'
import { company } from '../data/company'
import { usePublishedReviews } from '../firebase/collections/reviews'
import { usePublishedDestinations } from '../firebase/collections/destinations'
import { usePublishedPackages } from '../firebase/collections/packages'
import { Flame, Mountain, Ship, Sunrise, TrainFront, TreePalm } from 'lucide-react'
import SmartImage from '../components/ui/SmartImage'
import { img } from '../data/images'
import { useReveal } from '../hooks'

const STAT_ICONS = {
  travellers: Users,
  years: CalendarCheck,
  destinations: MapPinned,
  trips: Route,
}

const HIGHLIGHTS = [
  {
    icon: TrainFront,
    title: 'Nilgiri toy train',
    note: 'UNESCO-listed mountain railway between Ooty and Coonoor.',
    image: img.hillRailway,
    span: 'lg:col-span-2 lg:row-span-2',
  },
  {
    icon: Ship,
    title: 'Backwater houseboats',
    note: 'Overnight on the Alleppey canals.',
    image: img.keralaBoat,
    span: '',
  },
  {
    icon: Mountain,
    title: 'Tea-estate walks',
    note: 'Munnar and Coonoor plantation trails.',
    image: img.teaEstate,
    span: '',
  },
  {
    icon: Sunrise,
    title: 'Sunrise viewpoints',
    note: 'Early slots before the crowds reach the ridge.',
    image: img.sunriseHill,
    span: 'lg:col-span-2',
  },
  {
    icon: Flame,
    title: 'Group campfire nights',
    note: 'Arranged on request at hill-station properties.',
    image: img.campfire,
    span: '',
  },
  {
    icon: TreePalm,
    title: 'Wildlife safaris',
    note: 'Wayanad, Mudumalai and Periyar reserves.',
    image: img.wildlife,
    span: '',
  },
]

function HighlightTile({ item, index }) {
  const ref = useReveal()
  const Icon = item.icon

  return (
    <article
      ref={ref}
      className={`reveal group relative isolate min-h-56 overflow-hidden rounded-3xl ${item.span}`}
      style={{ transitionDelay: `${index * 60}ms` }}
    >
      <SmartImage
        src={item.image}
        alt={item.title}
        className="absolute inset-0 -z-10"
        imgClassName="transition-transform duration-700 ease-out group-hover:scale-108"
      />
      <span
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-linear-to-t from-navy-950/88 via-navy-950/35 to-navy-950/5"
      />

      <div className="flex h-full flex-col justify-end p-5 sm:p-6">
        <span
          aria-hidden="true"
          className="grid size-10 place-content-center rounded-xl bg-white/12 text-gold-300 ring-1 ring-inset ring-white/20 backdrop-blur-sm"
        >
          <Icon size={18} strokeWidth={2} />
        </span>
        <h3 className="mt-4 font-display text-xl font-bold text-white">{item.title}</h3>
        <p className="mt-1.5 text-sm leading-relaxed text-navy-200">{item.note}</p>
      </div>
    </article>
  )
}


export default function Home() {
  // Live Firestore data — published destinations, reviews and packages only.
  const { data: publishedDestinations } = usePublishedDestinations()
  const { data: publishedReviews } = usePublishedReviews()
  const { data: publishedPackages } = usePublishedPackages()

  const averageRating = useMemo(() => {
    if (!publishedReviews || publishedReviews.length === 0) return 0
    const total = publishedReviews.reduce((sum, r) => sum + (Number(r.rating) || 0), 0)
    return total / publishedReviews.length
  }, [publishedReviews])

  const reviewCount = (publishedReviews ?? []).length
  const featuredReviews = useMemo(
    () => (publishedReviews ?? []).filter((review) => review.featured),
    [publishedReviews],
  )

  const featuredList = useMemo(
    () => (publishedDestinations ?? []).filter((destination) => destination.featured),
    [publishedDestinations],
  )

  const featuredPackages = useMemo(
    () => (publishedPackages ?? []).filter((pkg) => pkg.featured || pkg.popular).slice(0, 6),
    [publishedPackages],
  )

  return (
    <>
      {/* ── 1. Cinematic Hero ──────────────────────────────────────────── */}
      <CinematicHero />

      {/* ── 2. About Avengers / Company Introduction ───────────────────── */}
      <CompanyIntroSection />

      {/* ── 3. Trust Strip ─────────────────────────────────────────────── */}
      <TrustStrip averageRating={averageRating} reviewCount={reviewCount} />

      {/* ── 4. Statistics ──────────────────────────────────────────────── */}
      <section className="bg-ink-950 py-10 sm:py-12 lg:py-14">
        <div className="shell">
          <div className="mb-6 lg:mb-8">
            <p className="mb-3 text-[0.6875rem] font-semibold tracking-[0.2em] uppercase text-gold-400">
              By the numbers
            </p>
            <h2 className="font-display text-3xl font-bold text-bone-100 sm:text-4xl">
              A decade of South India travel
            </h2>
            <span
              aria-hidden="true"
              className="mt-4 block h-px w-16 bg-gold-400/40"
            />
          </div>

          <div className="grid grid-cols-2 gap-8 lg:grid-cols-4 lg:gap-0">
            {company.stats.map((stat, index) => (
              <StatsCard
                key={stat.id}
                value={stat.value}
                suffix={stat.suffix}
                label={stat.label}
                icon={STAT_ICONS[stat.id]}
                tone="dark"
                delay={index * 80}
              />
            ))}
          </div>

          <p className="mt-6 text-center text-[0.6875rem] text-bone-300/40 lg:text-left">
            Figures as at the last closed financial year, maintained in our internal trip ledger.
          </p>
        </div>
      </section>

      {/* ── 5. Happy Clients / Testimonials ────────────────────────────── */}
      <section>
        <TestimonialCarousel reviews={featuredReviews} />
      </section>

      {/* ── 6. Destination Bus / South India Journey ───────────────────── */}
      <BusRouteJourney />

      {/* ── 7. Destinations ───────────────────────────────────────────── */}
      <section className="shell py-16 sm:py-20 lg:py-24">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <SectionTitle
            eyebrow="Featured destinations"
            title="Six hours from home, and nothing looks the same"
            lead="Every destination below is one we run trips to ourselves, several times a season. Prices shown are the current starting rate per person."
          />
          <Button to="/destinations" variant="outline" size="md">
            All Destinations
          </Button>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {featuredList.map((destination, index) => (
            <DestinationCard
              key={destination.id}
              destination={destination}
              delay={index * 70}
            />
          ))}
        </div>
      </section>

      {/* ── 8. Packages ───────────────────────────────────────────────── */}
      <section className="bg-sand-100 py-16 sm:py-20 lg:py-24">
        <div className="shell">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <SectionTitle
              eyebrow="Popular packages"
              title="Ready itineraries you can book today"
              lead="Every package includes stay, travel, listed meals and entry tickets. Prices are per person on twin sharing."
            />
            <Button to="/packages" variant="outline" size="md">
              View All Packages
            </Button>
          </div>

          {featuredPackages.length > 0 ? (
            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {featuredPackages.map((pkg, index) => (
                <PackageCard key={pkg.id} pkg={pkg} delay={index * 70} />
              ))}
            </div>
          ) : (
            <div className="mt-12 text-center">
              <p className="text-sm text-navy-400">Packages will appear here once published.</p>
            </div>
          )}
        </div>
      </section>

      {/* ── 9. Trip Highlights / Adventure Holidays ────────────────────── */}
      <section className="shell py-16 sm:py-20 lg:py-24">
        <SectionTitle
          eyebrow="Trip highlights"
          title="The moments people actually remember"
          lead="A quick look at what sits inside our itineraries — the experiences we build the driving schedule around."
        />

        <div className="mt-12 grid auto-rows-[14rem] gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {HIGHLIGHTS.map((item, index) => (
            <HighlightTile key={item.title} item={item} index={index} />
          ))}
        </div>
      </section>

      {/* ── 10. Final CTA ─────────────────────────────────────────────── */}
      <CTASection />

      {/* ── 11. FAQ ───────────────────────────────────────────────────── */}
      <FAQSection />
    </>
  )
}
