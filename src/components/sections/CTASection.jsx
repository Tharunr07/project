import { MessageCircle, Phone } from 'lucide-react'
import { company, telLink, whatsappLink } from '../../data/company'
import { img } from '../../data/images'
import { useReveal } from '../../hooks'
import Button from '../ui/Button'
import SmartImage from '../ui/SmartImage'

/**
 * Closing call-to-action band. Reused at the bottom of nearly every customer
 * page, so the phone / WhatsApp routes are always one tap away.
 */
export default function CTASection({
  eyebrow = 'Plan your trip',
  title = 'Tell us the group, the dates and the budget. We will handle the rest.',
  lead = 'Share a few details and a trip coordinator will call you back with a plan and an honest quote — usually within a few working hours.',
  primaryLabel = 'Send an Enquiry',
  primaryTo = '/enquire',
  secondaryLabel = 'Browse Packages',
  secondaryTo = '/packages',
  image = img.sunsetRidge,
  whatsappMessage,
  className = '',
}) {
  const ref = useReveal()

  return (
    <section className={`shell py-16 sm:py-20 lg:py-24 ${className}`}>
      <div
        ref={ref}
        className="reveal relative isolate overflow-hidden rounded-4xl bg-navy-900 px-6 py-14 sm:px-12 sm:py-16 lg:px-16 lg:py-20"
      >
        <SmartImage
          src={image}
          alt=""
          className="absolute inset-0 -z-10 opacity-35"
          imgClassName="scale-105"
        />
        <span
          aria-hidden="true"
          className="absolute inset-0 -z-10 bg-linear-to-r from-navy-950 via-navy-950/85 to-navy-900/45"
        />
        {/* Warm brand glow, keeps the panel from reading flat */}
        <span
          aria-hidden="true"
          className="absolute -top-24 -right-16 -z-10 size-72 rounded-full bg-crimson-600/25 blur-3xl"
        />

        <div className="grid items-center gap-10 lg:grid-cols-[1.35fr_1fr]">
          <div>
            <p className="mb-4 inline-flex items-center gap-2.5 text-xs font-bold tracking-[0.18em] text-bone-200 uppercase">
              <span aria-hidden="true" className="h-px w-8 bg-bone-200/55" />
              {eyebrow}
            </p>

            <h2 className="text-balance text-3xl leading-[1.14] text-white sm:text-4xl lg:text-[2.625rem]">
              {title}
            </h2>

            <p className="mt-5 max-w-xl text-[1.0625rem] leading-relaxed text-navy-200">{lead}</p>
          </div>

          <div className="flex flex-col gap-3 lg:items-stretch">
            <Button to={primaryTo} variant="primary" size="lg" fullWidth>
              {primaryLabel}
            </Button>
            <Button to={secondaryTo} variant="light" size="lg" fullWidth>
              {secondaryLabel}
            </Button>

            <div className="mt-1 grid gap-3 sm:grid-cols-2">
              <Button
                href={whatsappLink(whatsappMessage)}
                variant="whatsapp"
                size="md"
                icon={MessageCircle}
                fullWidth
              >
                WhatsApp
              </Button>
              <Button
                href={telLink}
                variant="bone"
                size="md"
                icon={Phone}
                fullWidth
                target={undefined}
              >
                Call Now
              </Button>
            </div>

            <p className="mt-2 text-center text-xs font-medium text-navy-300 lg:text-left">
              {company.phonePrimary} · Trip support open 24×7 while you travel
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
