import {
  BadgeCheck,
  Bus,
  CalendarCheck,
  Compass,
  FileText,
  GraduationCap,
  Headset,
  Hotel,
  MapPinned,
  Route,
  School,
  ShieldCheck,
  Ticket,
  TreePalm,
  UtensilsCrossed,
  Users,
  UsersRound,
  Briefcase,
} from 'lucide-react'
import StatsCard from '../components/cards/StatsCard'
import CTASection from '../components/sections/CTASection'
import Hero from '../components/sections/Hero'
import Button from '../components/ui/Button'
import SectionTitle from '../components/ui/SectionTitle'
import SmartImage from '../components/ui/SmartImage'
import { company } from '../data/company'
import { img } from '../data/images'
import { usePublishedDestinations } from '../firebase/collections/destinations'
import { useReveal } from '../hooks'

const STAT_ICONS = {
  travellers: Users,
  years: CalendarCheck,
  destinations: MapPinned,
  trips: Route,
}

const SERVICES = [
  {
    icon: Compass,
    title: 'Group tour packages',
    body: 'Ready-run and fully custom itineraries across South India — priced per person, in writing, before anyone packs a bag.',
  },
  {
    icon: Bus,
    title: 'Our own transport desk',
    body: 'Innovas, Tempo Travellers and 45-seat coaches with hill-route drivers. Toll, parking and driver stay are always included.',
  },
  {
    icon: Hotel,
    title: 'Handpicked stays',
    body: 'Every hotel and homestay is inspected in person before it enters an itinerary — and re-checked every season.',
  },
  {
    icon: Ticket,
    title: 'Permits & entry tickets',
    body: 'Forest-department jeeps, boating slots, palace passes and park entries arranged ahead of arrival, not on the spot.',
  },
  {
    icon: UtensilsCrossed,
    title: 'Meal planning',
    body: 'Fixed menus with veg/non-veg counts locked per day. Group kitchens, banana-leaf sadyas and packed breakfasts for early starts.',
  },
  {
    icon: Headset,
    title: '24×7 trip support',
    body: 'One phone number that stays live through the entire trip — route changes, medical help or a forgotten charger at 2 AM.',
  },
]

const TRIP_TYPES = [
  {
    icon: GraduationCap,
    type: 'College',
    body: 'Batch trips of 40–200 with student pricing, separate staff rooms and night-security briefings.',
  },
  {
    icon: School,
    type: 'School',
    body: 'Excursions built around school approvals — teacher ratios, first-aid kits and parent circulars handled.',
  },
  {
    icon: Users,
    type: 'Family',
    body: 'Multi-generation pacing: grandparents, kids and everyone in between get a plan that actually works.',
  },
  {
    icon: UsersRound,
    type: 'Friends',
    body: 'Weekend runs and adventure blocks — rafting, treks and campfires with the boring logistics made invisible.',
  },
  {
    icon: Briefcase,
    type: 'Corporate',
    body: 'Offsites and team outings with venue setups, activity facilitators and invoice-ready billing.',
  },
  {
    icon: Compass,
    type: 'Other',
    body: 'Pilgrimages, wedding guest movements, senior-citizen circuits — if a group can name it, we can run it.',
  },
]

const WHY_POINTS = [
  {
    title: 'Quotes that hold',
    body: 'The price we write is the price you pay. Season changes are flagged at the quote stage, never discovered at check-in.',
  },
  {
    title: 'Coordinators, not call centres',
    body: 'A named coordinator travels with or shadows every group. You always know exactly who to call.',
  },
  {
    title: 'Local since day one',
    body: `Operating out of Coimbatore since ${company.since} — our drivers have run the Nilgiris and Western Ghats roads thousands of times.`,
  },
  {
    title: 'Built for Indian groups',
    body: 'Rooming lists, meal counts, split coaches and last-minute headcount changes are routine work here, not emergencies.',
  },
]

function WhyRow({ index, title, body }) {
  const ref = useReveal()
  return (
    <div
      ref={ref}
      className="reveal flex gap-5 rounded-3xl bg-white p-6 shadow-card transition-shadow duration-400 hover:shadow-lift sm:p-7"
    >
      <span
        aria-hidden="true"
        className="font-display text-4xl leading-none font-extrabold text-crimson-600/25 tabular-nums"
      >
        {String(index + 1).padStart(2, '0')}
      </span>
      <div>
        <h3 className="text-lg text-navy-900">{title}</h3>
        <p className="mt-1.5 text-[0.9375rem] leading-relaxed text-navy-500">{body}</p>
      </div>
    </div>
  )
}

export default function About() {
  // Live Firestore subscription — published destinations for the circuits list.
  const { data: publishedDestinations } = usePublishedDestinations()

  return (
    <>
      <Hero
        size="page"
        image={img.mountainRoad}
        eyebrow="About us"
        title="Twelve years of showing South India to the people who live in it"
        lead={`Avengers Holidays is a Coimbatore-based travel company operating since ${company.since} — built for groups, priced honestly, and run by coordinators who personally know every hotel and driver on your itinerary.`}
        breadcrumb={[{ label: 'Home', to: '/' }, { label: 'About' }]}
      />

      {/* Story */}
      <section className="shell py-12 sm:py-16 lg:py-20">
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <div>
            <SectionTitle
              eyebrow="Our story"
              title="It started with one college batch and a borrowed van"
              lead="In 2013 we ran a single Ooty trip for 46 students. The quotes were honest, the bus arrived on time, and the college called back the next semester. Twelve years later that same rule runs everything we do."
            />
            <div className="mt-6 space-y-4 text-[0.9375rem] leading-relaxed text-navy-600">
              <p>
                Today Avengers Holidays operates over{' '}
                <strong className="font-semibold text-navy-900">2,100 group trips</strong> across
                Tamil Nadu, Kerala and Karnataka — hill stations, backwaters, heritage towns and
                wildlife reserves. We are still small enough that the founders answer the phone,
                and established enough to move 200 people through Munnar without a hiccup.
              </p>
              <p>
                We deliberately stayed group-first. Individual honeymooners are lovely, but our
                craft is logistics at scale: rooming lists, meal counts, split coaches, permits and
                the hundred small things that decide whether a large group has a good time.
              </p>
            </div>

            <div className="mt-7 flex flex-wrap gap-3">
              <span className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-bold text-navy-700 ring-1 ring-inset ring-sand-300">
                <BadgeCheck size={14} className="text-crimson-600" aria-hidden="true" />
                Reg. {company.registration}
              </span>
              <span className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-bold text-navy-700 ring-1 ring-inset ring-sand-300">
                <FileText size={14} className="text-crimson-600" aria-hidden="true" />
                GSTIN {company.gstin}
              </span>
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <Button to="/destinations" variant="primary" size="md">
                Explore Destinations
              </Button>
              <Button to="/contact" variant="outline" size="md">
                Visit Our Office
              </Button>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-lg lg:max-w-none">
            <SmartImage
              src={img.groupTrek}
              alt="Avengers Holidays group on a Wayanad trek"
              ratio="aspect-4/3"
              className="rounded-4xl shadow-lift"
            />
            <SmartImage
              src={img.busJourney}
              alt="Avengers Holidays coach departing Coimbatore"
              ratio="aspect-16/10"
              className="absolute -bottom-8 -left-2 hidden w-[46%] rounded-3xl shadow-lift ring-6 ring-sand-50 sm:block"
            />
            <span className="absolute -top-5 -right-3 rotate-2 rounded-2xl bg-navy-900 px-5 py-3 text-center shadow-lift">
              <span className="block font-display text-2xl font-extrabold text-bone-300">12+</span>
              <span className="block text-[0.625rem] font-bold tracking-[0.14em] text-navy-200 uppercase">
                Years on the road
              </span>
            </span>
          </div>
        </div>
      </section>

      {/* Live-stat strip */}
      <section className="bg-navy-950 py-14 sm:py-16">
        <div className="shell">
          <SectionTitle
            align="center"
            tone="dark"
            eyebrow="By the numbers"
            title="What twelve years adds up to"
            className="mx-auto mb-10"
          />
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {company.stats.map((stat, index) => (
              <StatsCard
                key={stat.id}
                value={stat.value}
                label={stat.label}
                suffix={stat.suffix}
                icon={STAT_ICONS[stat.id]}
                tone="dark"
                delay={index * 70}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="shell py-12 sm:py-16 lg:py-20">
        <SectionTitle
          eyebrow="What we handle"
          title="Everything between your doorstep and the summit"
          lead="One team owns the whole chain — planning, transport, stays, food, tickets and support — so nothing gets lost between vendors."
        />
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {SERVICES.map((service, index) => (
            <ServiceCard key={service.title} {...service} delay={index * 60} />
          ))}
        </div>
      </section>

      {/* Trip types */}
      <section className="bg-white py-12 sm:py-16 lg:py-20">
        <div className="shell">
          <SectionTitle
            eyebrow="Who we travel with"
            title="Six kinds of groups, one standard of care"
            lead="Each group type gets its own playbook — pacing, food, safety and paperwork tuned to who is actually on the bus."
          />
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {TRIP_TYPES.map((item, index) => (
              <ServiceCard key={item.type} {...item} delay={index * 60} />
            ))}
          </div>
        </div>
      </section>

      {/* South India coverage */}
      <section className="shell py-12 sm:py-16 lg:py-20">
        <div className="grid items-center gap-10 lg:grid-cols-[1fr_1.15fr] lg:gap-16">
          <div>
            <SectionTitle
              eyebrow="Where we go"
              title="All of South India, within a night's drive"
              lead="Our base in Coimbatore sits at the junction of three states — most of our destinations are reached before breakfast."
            />
            <p className="mt-6 text-[0.9375rem] leading-relaxed text-navy-600">
              These eight circuits are our best-known runs, but we operate custom trips across the
              peninsula — Rameswaram, Kanyakumari, Hampi, Gokarna, Chikmagalur, Vagamon and beyond.
              If it is drivable from Coimbatore, it is in our range.
            </p>
          </div>

          <div className="rounded-4xl bg-white p-7 shadow-panel sm:p-9">
            <p className="flex items-center gap-2 text-xs font-bold tracking-[0.16em] text-navy-400 uppercase">
              <TreePalm size={15} className="text-crimson-600" aria-hidden="true" />
              Signature circuits
            </p>
            <ul className="mt-5 flex flex-wrap gap-2.5">
              {(publishedDestinations ?? []).map((destination) => (
                <li key={destination.id}>
                  <Button to={`/destinations/${destination.id}`} variant="subtle" size="sm">
                    {destination.name}
                  </Button>
                </li>
              ))}
            </ul>
            <dl className="mt-7 grid grid-cols-3 gap-px overflow-hidden rounded-2xl bg-sand-200">
              {[
                { label: 'Tamil Nadu', value: '4 circuits' },
                { label: 'Kerala', value: '3 circuits' },
                { label: 'Karnataka', value: '2 circuits' },
              ].map((row) => (
                <div key={row.label} className="bg-sand-50 px-4 py-4 text-center">
                  <dt className="text-[0.625rem] font-bold tracking-[0.14em] text-navy-400 uppercase">
                    {row.label}
                  </dt>
                  <dd className="mt-1 font-display text-lg font-extrabold text-navy-900">
                    {row.value}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      {/* Why choose */}
      <section className="bg-white py-12 sm:py-16 lg:py-20">
        <div className="shell">
          <SectionTitle
            eyebrow="Why Avengers Holidays"
            title="Four habits customers keep coming back for"
            align="center"
            className="mx-auto"
          />
          <div className="mx-auto mt-10 grid max-w-4xl gap-5 sm:grid-cols-2">
            {WHY_POINTS.map((point, index) => (
              <WhyRow key={point.title} index={index} {...point} />
            ))}
          </div>
          <p className="mt-8 flex items-center justify-center gap-2 text-center text-sm font-semibold text-navy-500">
            <ShieldCheck size={17} className="text-emerald-600" aria-hidden="true" />
            Registered tour operator · GST-compliant billing · vetted drivers on every route
          </p>
        </div>
      </section>

      {/* Mission / Vision */}
      <section className="shell pb-12 sm:pb-16 lg:pb-20">
        <div className="grid gap-5 lg:grid-cols-2">
          <MissionCard
            eyebrow="Our mission"
            body={company.mission}
            icon={Compass}
            accent="text-bone-200"
            className="bg-navy-900 text-white"
            muted="text-navy-200"
          />
          <MissionCard
            eyebrow="Our vision"
            body={company.vision}
            icon={MapPinned}
            accent="text-crimson-700"
            className="border border-paper-200 bg-paper-100 text-navy-900"
            muted="text-navy-600"
          />
        </div>
      </section>

      <CTASection
        eyebrow="Travel with us"
        title="Bring us a group. We will bring the plan."
        lead="Tell us who is travelling and when — a coordinator will call back with a costed itinerary and an honest quote."
        image={img.sunriseHill}
      />
    </>
  )
}

function ServiceCard({ icon: Icon, title, body, delay = 0 }) {
  const ref = useReveal()
  return (
    <article
      ref={ref}
      className="reveal group rounded-3xl bg-sand-50 p-6 ring-1 ring-inset ring-sand-200 transition-all duration-400 hover:-translate-y-1 hover:bg-white hover:shadow-lift sm:p-7"
      style={{ transitionDelay: `${delay}ms` }}
    >
      <span
        aria-hidden="true"
        className="grid size-12 place-content-center rounded-2xl bg-crimson-50 text-crimson-600 transition-colors duration-400 group-hover:bg-crimson-600 group-hover:text-white"
      >
        <Icon size={22} strokeWidth={1.9} />
      </span>
      <h3 className="mt-5 text-lg text-navy-900">{title}</h3>
      <p className="mt-2 text-[0.9375rem] leading-relaxed text-navy-500">{body}</p>
    </article>
  )
}

function MissionCard({ eyebrow, body, icon: Icon, accent, className, muted }) {
  const ref = useReveal()
  return (
    <div
      ref={ref}
      className={`reveal relative isolate overflow-hidden rounded-4xl p-8 shadow-card sm:p-10 ${className}`}
    >
      <Icon
        size={120}
        strokeWidth={0.6}
        aria-hidden="true"
        className={`absolute -right-6 -bottom-8 opacity-10 ${muted}`}
      />
      <p
        className={`relative flex items-center gap-2.5 text-xs font-bold tracking-[0.18em] uppercase ${accent}`}
      >
        <span aria-hidden="true" className="h-px w-8 bg-current opacity-60" />
        {eyebrow}
      </p>
      <p className={`relative mt-5 text-lg leading-relaxed font-medium sm:text-xl ${muted}`}>
        “{body}”
      </p>
    </div>
  )
}
