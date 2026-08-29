import { Clock3, FileText, MessageCircle, Phone, ShieldCheck, Wallet } from 'lucide-react'
import { useSearchParams } from 'react-router-dom'
import EnquiryForm from '../components/sections/EnquiryForm'
import Hero from '../components/sections/Hero'
import Button from '../components/ui/Button'
import { company, telLink, whatsappLink } from '../data/company'
import { GROUP_TYPES } from '../data/constants'
import { img } from '../data/images'
import { useDestination } from '../firebase/collections/destinations'
import { usePackage } from '../firebase/collections/packages'

const PROMISES = [
  {
    icon: Clock3,
    title: 'A reply the same working day',
    body: 'Enquiries received before 6 PM get a call back the same day. After that, first thing next morning.',
  },
  {
    icon: FileText,
    title: 'A written, itemised quote',
    body: 'Day-by-day plan, hotel category, vehicle type and the per-person price — in writing, not over a phone call you have to remember.',
  },
  {
    icon: Wallet,
    title: 'No pressure, no payment link',
    body: 'Nothing is charged on this website. You confirm only after the itinerary and the price are exactly what you want.',
  },
  {
    icon: ShieldCheck,
    title: 'Your details stay with us',
    body: 'We do not sell or share enquiry details with third-party agents. Ever.',
  },
]

export default function Enquiry() {
  const [searchParams] = useSearchParams()

  // Resolve ?package= / ?destination= against live Firestore documents.
  const { data: destination } = useDestination(searchParams.get('destination') ?? '')
  const { data: pkg } = usePackage(searchParams.get('package') ?? '')

  // A package chosen on a detail page also fixes the destination.
  const defaultDestination = pkg?.destination ?? destination?.name ?? ''
  const defaultPackage = pkg?.name ?? ''

  // ?groupType= arrives from the homepage Travel Types cards.
  const groupTypeParam = searchParams.get('groupType') ?? ''
  const defaultGroupType = GROUP_TYPES.includes(groupTypeParam) ? groupTypeParam : ''

  return (
    <>
      <Hero
        size="page"
        image={img.viewpoint}
        eyebrow="Enquiry"
        title="Tell us about your trip"
        lead="One form, one coordinator, one honest quote. Fill in what you know — we will work out the rest on the call."
        breadcrumb={[{ label: 'Home', to: '/' }, { label: 'Enquiry' }]}
      />

      <section className="shell py-12 sm:py-16 lg:py-20">
        <div className="grid gap-10 lg:grid-cols-[1.55fr_1fr] lg:gap-14">
          <div className="min-w-0">
            {(pkg || destination) && (
              <div className="mb-6 flex flex-wrap items-center gap-3 rounded-2xl bg-crimson-50 px-5 py-4 ring-1 ring-crimson-100 ring-inset">
                <span className="text-sm font-semibold text-crimson-800">
                  Enquiring about{' '}
                  <span className="font-bold">{pkg ? pkg.name : destination.name}</span>
                  {pkg && ` · ${pkg.duration}`}
                </span>
                <Button
                  to={pkg ? `/packages/${pkg.id}` : `/destinations/${destination.id}`}
                  variant="ghost"
                  size="xs"
                  className="ml-auto"
                >
                  View details
                </Button>
              </div>
            )}

            <EnquiryForm
              defaultDestination={defaultDestination}
              defaultPackage={defaultPackage}
              defaultGroupType={defaultGroupType}
            />
          </div>

          <aside className="space-y-6">
            <div className="rounded-3xl bg-navy-900 p-6 text-white shadow-lift sm:p-7">
              <h2 className="text-xl text-white">Prefer to talk?</h2>
              <p className="mt-2.5 text-sm leading-relaxed text-navy-200">
                Group trips are easier to scope over a five-minute call than a form. Reach us
                directly and we will start planning straight away.
              </p>

              <div className="mt-6 space-y-2.5">
                <Button
                  href={whatsappLink()}
                  variant="whatsapp"
                  size="md"
                  icon={MessageCircle}
                  fullWidth
                >
                  WhatsApp {company.whatsapp}
                </Button>
                <Button
                  href={telLink}
                  variant="gold"
                  size="md"
                  icon={Phone}
                  fullWidth
                  target={undefined}
                >
                  Call {company.phonePrimary}
                </Button>
              </div>

              <dl className="mt-7 space-y-3 border-t border-white/10 pt-6 text-sm">
                {company.hours.map((row) => (
                  <div key={row.days} className="flex justify-between gap-4">
                    <dt className="font-medium text-navy-300">{row.days}</dt>
                    <dd className="text-right font-semibold text-white">{row.time}</dd>
                  </div>
                ))}
              </dl>
            </div>

            <div className="rounded-3xl bg-white p-6 shadow-card sm:p-7">
              <p className="inline-flex items-center gap-2.5 text-xs font-bold tracking-[0.18em] text-crimson-600 uppercase">
                <span aria-hidden="true" className="h-px w-8 bg-crimson-600/50" />
                What happens next
              </p>
              <h2 className="mt-3 text-2xl text-navy-900">Our enquiry promise</h2>

              <ul className="mt-6 space-y-5">
                {PROMISES.map((promise) => (
                  <li key={promise.title} className="flex gap-4">
                    <span
                      aria-hidden="true"
                      className="grid size-10 shrink-0 place-content-center rounded-2xl bg-crimson-50 text-crimson-600"
                    >
                      <promise.icon size={18} strokeWidth={2} />
                    </span>
                    <div>
                      <h3 className="text-base text-navy-900">{promise.title}</h3>
                      <p className="mt-1 text-sm leading-relaxed text-navy-500">{promise.body}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </div>
      </section>
    </>
  )
}
