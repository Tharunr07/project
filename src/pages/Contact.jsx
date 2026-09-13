import {
  Mail,
  MapPin,
  MessageCircle,
  Navigation,
  Phone,
} from 'lucide-react'
import EnquiryForm from '../components/sections/EnquiryForm'
import Hero from '../components/sections/Hero'
import Button from '../components/ui/Button'
import SectionTitle from '../components/ui/SectionTitle'
import { company, mailLink, telLink, whatsappLink } from '../data/company'
import { img } from '../data/images'

const DIRECTIONS_URL = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(company.mapQuery)}`

export default function Contact() {
  return (
    <>
      <Hero
        size="page"
        image={img.lakeBoats}
        eyebrow="Contact us"
        title="Talk to a coordinator, not a call queue"
        lead={`Call ${company.phonePrimary}, message us on WhatsApp, or drop into the Coimbatore office — the person who plans your trip is the person who answers.`}
        breadcrumb={[{ label: 'Home', to: '/' }, { label: 'Contact' }]}
      />

      <section className="shell py-12 sm:py-16 lg:py-20">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.05fr] lg:gap-14">
          {/* Contact info column */}
          <div className="space-y-6">
            <SectionTitle
              eyebrow="Reach us directly"
              title="Four ways to start planning"
              lead="Pick whichever suits you — every channel reaches the same trip desk."
              className="max-w-none"
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <MethodCard
                icon={Phone}
                label="Call us"
                lines={[company.phonePrimary, company.phoneSecondary]}
                action={{ label: 'Call Now', href: telLink }}
              />
              <MethodCard
                icon={MessageCircle}
                label="WhatsApp"
                lines={[company.whatsapp, 'Quotes & itineraries by chat']}
                action={{
                  label: 'Chat on WhatsApp',
                  href: whatsappLink('Hi Avengers Holidays, I would like to plan a trip.'),
                  whatsapp: true,
                }}
              />
              <MethodCard
                icon={Mail}
                label="Email"
                lines={[company.emailGeneral, company.emailGroups]}
                action={{ label: 'Write to us', href: mailLink }}
              />
              <MethodCard
                icon={MapPin}
                label="Office"
                lines={[
                  company.address.line1,
                  `${company.address.line2}, ${company.address.city} – ${company.address.pincode}`,
                ]}
                action={{ label: 'Get Directions', href: DIRECTIONS_URL }}
              />
            </div>

            {/* Map placeholder — Phase 2 swaps this panel for an embedded map */}
            <div className="relative isolate overflow-hidden rounded-3xl bg-navy-950 shadow-card">
              <img
                src={img.aerialCoast}
                alt=""
                aria-hidden="true"
                loading="lazy"
                className="absolute inset-0 size-full object-cover opacity-25"
              />
              <span
                aria-hidden="true"
                className="absolute inset-0 bg-linear-to-t from-navy-950 via-navy-950/55 to-navy-950/20"
              />

              <div className="relative flex aspect-16/9 flex-col items-center justify-center p-6 text-center sm:aspect-16/8">
                <span
                  aria-hidden="true"
                  className="grid size-14 place-content-center rounded-full bg-crimson-600 text-white shadow-glow ring-8 ring-crimson-600/25"
                >
                  <MapPin size={26} strokeWidth={2} />
                </span>
                <p className="mt-5 font-display text-lg font-bold text-white">
                  {company.address.line1}
                </p>
                <p className="mt-1 max-w-xs text-sm leading-relaxed text-navy-200">
                  {company.address.line2}, {company.address.city} – {company.address.pincode}
                </p>
                <p className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-[0.625rem] font-bold tracking-[0.16em] text-navy-200 uppercase ring-1 ring-inset ring-white/15">
                  <Navigation size={11} aria-hidden="true" />
                  Google Maps embed loads here
                </p>
              </div>

              <div className="relative flex items-center justify-between gap-4 border-t border-white/10 px-6 py-4">
                <p className="text-xs font-semibold text-navy-300">
                  Landmark: opposite Ram Nagar bus stop
                </p>
                <Button href={DIRECTIONS_URL} variant="gold" size="sm" icon={Navigation}>
                  Directions
                </Button>
              </div>
            </div>

          </div>

          {/* Enquiry form column */}
          <div id="enquiry-form" className="lg:sticky lg:top-28 lg:self-start">
            <EnquiryForm />
          </div>
        </div>
      </section>
    </>
  )
}

function MethodCard({ icon: Icon, label, lines, action }) {
  const ActionIcon = action.whatsapp ? MessageCircle : Icon
  return (
    <article className="flex h-full flex-col rounded-3xl bg-white p-6 shadow-card transition-all duration-400 hover:-translate-y-1 hover:shadow-lift">
      <span
        aria-hidden="true"
        className="grid size-11 place-content-center rounded-2xl bg-crimson-50 text-crimson-600"
      >
        <Icon size={20} strokeWidth={1.9} />
      </span>
      <h3 className="mt-4 text-xs font-bold tracking-[0.16em] text-navy-400 uppercase">{label}</h3>
      <div className="mt-2 flex-1 space-y-0.5">
        {lines.map((line) => (
          <p key={line} className="text-sm leading-snug font-semibold break-words text-navy-900">
            {line}
          </p>
        ))}
      </div>
      <Button
        href={action.href}
        variant={action.whatsapp ? 'whatsapp' : 'outline'}
        size="xs"
        icon={ActionIcon}
        className="mt-4 self-start"
      >
        {action.label}
      </Button>
    </article>
  )
}
