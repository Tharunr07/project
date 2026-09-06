import {
  BadgeCheck,
  Bus,
  CalendarCheck,
  Compass,
  Flame,
  HeartHandshake,
  Hotel,
  IndianRupee,
  MapPinned,
  Mountain,
  Route,
  Ship,
  Sunrise,
  TrainFront,
  TreePalm,
  Users,
} from 'lucide-react'
import { useMemo } from 'react'
import DestinationCard from '../components/cards/DestinationCard'
import StatsCard from '../components/cards/StatsCard'
import CTASection from '../components/sections/CTASection'
import FAQSection from '../components/sections/FAQSection'
import CompanyIntroSection from '../components/sections/CompanyIntroSection'
import GalleryPreview from '../components/sections/GalleryPreview'
import CinematicHero from '../components/sections/CinematicHero'
import TestimonialCarousel from '../components/sections/TestimonialCarousel'
import BusRouteJourney from '../components/sections/BusRouteJourney'
import TravellerBusInterior from '../components/sections/TravellerBusInterior'
import TrustStrip from '../components/sections/TrustStrip'
import Button from '../components/ui/Button'
import SectionTitle from '../components/ui/SectionTitle'
import SmartImage from '../components/ui/SmartImage'
import { company } from '../data/company'
import { img } from '../data/images'
import {
  averageRating as computeAverage,
  usePublishedReviews,
} from '../firebase/collections/reviews'
import { usePublishedDestinations } from '../firebase/collections/destinations'
import { useReveal } from '../hooks'
import { formatNumber } from '../utils/format'

const STAT_ICONS = {
  travellers: Users,
  years: CalendarCheck,
  destinations: MapPinned,
  trips: Route,
}

const REASONS = [
  {
    icon: Compass,
    title: 'Our own coordinators on the ground',
    body: 'Every group travels with an Avengers Holidays coordinator who knows the route, the hotel manager and the shortcut around the afternoon traffic. Nothing is handed to a third-party agent.',
  },
  {
    icon: IndianRupee,
    title: 'The quote you get is the price you pay',
    body: 'One written quote covering stay, travel, meals and entry tickets. No service charge appearing at check-in and no “driver bata extra” at the end of the trip.',
  },
  {
    icon: Hotel,
    title: 'Hotels we have actually stayed in',
    body: 'We inspect every property before it enters an itinerary and re-check it each season. If a hotel slips, it comes off the list — even if it is the cheapest option available.',
  },
  {
    icon: Bus,
    title: 'Vehicles matched to your group',
    body: 'From a 6-seater Innova to a 45-seat coach, with hill-route drivers who have run the Nilgiris and the Western Ghats for years. Toll, parking and permits are already in the price.',
  },
  {
    icon: HeartHandshake,
    title: 'Built for groups, not just couples',
    body: 'College batches of 120, school excursions, corporate offsites and joint families — rooming lists, meal counts and split coaches are routine work for us, not a special request.',
  },
  {
    icon: BadgeCheck,
    title: `${company.stats[1].value} years, still answering the phone`,
    body: `Operating since ${company.since} with a 24×7 support line that stays open for the entire duration of your trip — not only during office hours.`,
  },
]

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

function ReasonCard({ reason, index }) {
  const ref = useReveal()
  const Icon = reason.icon

  return (
    <article
      ref={ref}
      className="reveal group rounded-3xl bg-white p-6 shadow-card transition-all duration-400 hover:-translate-y-1 hover:shadow-lift sm:p-7"
      style={{ transitionDelay: `${index * 60}ms` }}
    >
      <span
        aria-hidden="true"
        className="grid size-12 place-content-center rounded-2xl bg-crimson-50 text-crimson-600 transition-colors duration-400 group-hover:bg-crimson-600 group-hover:text-white"
      >
        <Icon size={22} strokeWidth={1.9} />
      </span>
      <h3 className="mt-5 text-lg leading-snug text-navy-900">{reason.title}</h3>
      <p className="mt-2.5 text-sm leading-relaxed text-navy-500">{reason.body}</p>
    </article>
  )
}

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
  const processRef = useReveal()

  // Live Firestore data — published destinations and reviews only.
  const { data: publishedDestinations } = usePublishedDestinations()
  const { data: publishedReviews } = usePublishedReviews()

  const averageRating = computeAverage(publishedReviews)
  const reviewCount = (publishedReviews ?? []).length
  const featuredReviews = useMemo(
    () => (publishedReviews ?? []).filter((review) => review.featured),
    [publishedReviews],
  )

  const featuredList = useMemo(
    () => (publishedDestinations ?? []).filter((destination) => destination.featured),
    [publishedDestinations],
  )

  return (
    <>
      <CinematicHero />

      {/* ------------------------------------------------------- trust strip */}
      <TrustStrip averageRating={averageRating} reviewCount={reviewCount} />

      {/* ---------------------------------------------------------------- stats */}
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

      {/* --------------------------------------------------------- destinations */}
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

      {/* ------------------------------------------------------- bus route journey */}
      <BusRouteJourney />

      {/* -------------------------------------------------- traveller bus interior */}
      <TravellerBusInterior />

      {/* ------------------------------------------------------------ why us */}
      <section className="bg-sand-100 py-16 sm:py-20 lg:py-24">
        <div className="shell">
          <SectionTitle
            eyebrow="Why choose Avengers Holidays"
            title="A travel agency that answers for the whole trip, not just the booking"
            lead="Anyone can send you a rate list. The difference shows up on day two, when the weather turns or a hotel gets it wrong — and someone has to fix it before your group notices."
            align="center"
          />

          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
            {REASONS.map((reason, index) => (
              <ReasonCard key={reason.title} reason={reason} index={index} />
            ))}
          </div>
        </div>
      </section>

      {/* -------------------------------------------------------- highlights */}
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

      {/* ----------------------------------------------------------- process */}
      <section className="shell py-16 sm:py-20 lg:py-24">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <div ref={processRef} className="reveal relative">
            <SmartImage
              src={img.groupTrek}
              alt="An Avengers Holidays group on a guided trail"
              ratio="aspect-4/5"
              className="rounded-4xl shadow-lift"
            />
            <div className="absolute -right-2 -bottom-6 w-56 rounded-3xl bg-white p-5 shadow-lift sm:-right-6 sm:w-64">
              <p className="font-display text-3xl font-extrabold text-navy-900">
                {formatNumber(company.stats[3].value)}+
              </p>
              <p className="mt-1 text-xs font-bold tracking-wide text-navy-400 uppercase">
                Group trips operated
              </p>
              <p className="mt-3 text-[0.8125rem] leading-relaxed text-navy-500">
                Colleges, schools, families and corporate teams across {company.stats[2].value}+
                destinations.
              </p>
            </div>
          </div>

          <div>
            <SectionTitle
              eyebrow="How it works"
              title="Four steps from a phone call to a trip that runs itself"
            />

            <ol className="mt-10 space-y-8">
              {[
                {
                  title: 'Tell us the group and the dates',
                  body: 'A call, a WhatsApp message or the enquiry form — whichever is easiest. We need the group size, rough dates and what kind of trip you want.',
                },
                {
                  title: 'We send a costed itinerary',
                  body: 'A day-by-day plan with the hotel category, the vehicle, the meals and the exact per-person price. Usually within a few working hours.',
                },
                {
                  title: 'You adjust it until it fits',
                  body: 'Swap a day, upgrade the hotel, add a destination, trim the budget. The revised quote comes back the same day.',
                },
                {
                  title: 'We run the trip',
                  body: 'Confirmed vouchers, a coordinator assigned to your group and a support line that stays open until everyone is home.',
                },
              ].map((step, index) => (
                <li key={step.title} className="flex gap-5">
                  <span
                    aria-hidden="true"
                    className="grid size-11 shrink-0 place-content-center rounded-2xl bg-navy-900 font-display text-base font-bold text-gold-400"
                  >
                    {index + 1}
                  </span>
                  <div>
                    <h3 className="text-lg text-navy-900">{step.title}</h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-navy-500">{step.body}</p>
                  </div>
                </li>
              ))}
            </ol>

            <div className="mt-10 flex flex-wrap gap-3">
              <Button to="/enquire" variant="primary" size="md">
                Start an Enquiry
              </Button>
              <Button to="/about" variant="ghost" size="md">
                More about us
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------- testimonials */}
      <section>
        <TestimonialCarousel reviews={featuredReviews} />
      </section>

      {/* ---------------------------------------------------- gallery preview */}
      <GalleryPreview />

      {/* -------------------------------------------------- company intro */}
      <CompanyIntroSection />

      <CTASection />

      {/* ------------------------------------------------------------ faq */}
      <FAQSection />
    </>
  )
}
