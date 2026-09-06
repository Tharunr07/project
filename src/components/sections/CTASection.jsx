import { MessageCircle, ArrowRight } from 'lucide-react'
import { company, whatsappLink } from '../../data/company'
import { useReveal } from '../../hooks'
import Button from '../ui/Button'

/**
 * Closing call-to-action band. Reused at the bottom of nearly every customer
 * page, so the phone / WhatsApp routes are always one tap away.
 */

const CTA_BG = '/cta-bg.png'

export default function CTASection({
  eyebrow = "LET'S START YOUR JOURNEY",
  title = 'Ready to plan your next journey?',
  lead = "Tell us where you want to go, who you're travelling with, and we'll take care of the rest.",
  image,
  whatsappMessage,
  className = '',
}) {
  const ref = useReveal({ threshold: 0.01 })

  return (
    <section
      className={`relative overflow-hidden bg-[#070709] py-14 sm:py-18 lg:py-24 ${className}`}
    >
      {/* Full-bleed cinematic travel landscape background */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${image || CTA_BG})` }}
      />

      {/* Atmospheric vignette & cinematic gradient overlays for contrast & depth */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[#040406]/75 via-black/30 to-[#040406]/65"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#060608]/70 via-transparent to-[#060608]/75"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 75% 65% at 50% 50%, rgba(6,6,8,0.20) 0%, rgba(6,6,8,0.50) 70%, rgba(4,4,6,0.75) 100%)',
        }}
      />

      {/* Subtle crimson sunset glow — upper right */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 -right-20 size-[30rem] rounded-full bg-crimson-600/15 blur-[120px]"
      />
      {/* Subtle warm amber glow — lower left */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-24 -left-20 size-[26rem] rounded-full bg-amber-500/10 blur-[100px]"
      />

      {/* CTA content */}
      <div className="shell relative z-10 flex justify-center px-4 sm:px-6">
        <div
          ref={ref}
          className="reveal w-full max-w-3xl text-center"
        >
          {/* Centered CTA transparent dark glass panel */}
          <div
            className="relative overflow-hidden rounded-3xl border border-white/10 px-6 py-12 shadow-[0_16px_56px_rgba(0,0,0,0.55)] backdrop-blur-md sm:px-12 sm:py-16 lg:px-16 lg:py-20"
            style={{
              background: 'rgba(10, 10, 10, 0.52)',
            }}
          >
            {/* Inner crimson glow — top center */}
            <span
              aria-hidden="true"
              className="pointer-events-none absolute -top-16 left-1/2 -z-10 size-64 -translate-x-1/2 rounded-full bg-crimson-500/[0.08] blur-[60px]"
            />

            {/* Eyebrow */}
            <p className="mb-5 inline-flex items-center gap-2.5 text-[0.6875rem] font-bold tracking-[0.2em] text-bone-200/80 uppercase">
              <span aria-hidden="true" className="h-px w-8 bg-bone-200/40" />
              {eyebrow}
              <span aria-hidden="true" className="h-px w-8 bg-bone-200/40" />
            </p>

            {/* Heading */}
            <h2 className="mx-auto max-w-lg font-[family-name:var(--font-display)] text-3xl font-bold leading-[1.14] tracking-tight text-white sm:text-4xl lg:text-[2.625rem]">
              {title}
            </h2>

            {/* Description */}
            <p className="mx-auto mt-5 max-w-md text-[0.9375rem] leading-relaxed text-bone-200/70 sm:text-[1.0625rem]">
              {lead}
            </p>

            {/* Row 1: Primary CTAs */}
            <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
              <Button to="/enquire" variant="primary" size="lg">
                Plan Your Trip
                <ArrowRight size={18} strokeWidth={2.2} aria-hidden="true" className="ml-1 transition-transform group-hover:translate-x-0.5" />
              </Button>
              <Button to="/contact" variant="light" size="lg">
                Contact Us
              </Button>
            </div>

            {/* Row 2: Social CTAs */}
            <div className="mt-4 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
              <a
                href={whatsappLink(whatsappMessage)}
                target="_blank"
                rel="noreferrer noopener"
                className="inline-flex h-12 items-center gap-2 rounded-xl bg-[#25D366] px-6 font-semibold text-white shadow-[0_2px_12px_rgba(37,211,102,0.3)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#20bd5a] hover:shadow-[0_4px_20px_rgba(37,211,102,0.4)] active:translate-y-0"
              >
                <MessageCircle size={18} strokeWidth={2.2} aria-hidden="true" />
                WhatsApp
              </a>
              <a
                href="https://instagram.com/avengersholidays"
                target="_blank"
                rel="noreferrer noopener"
                className="inline-flex h-12 items-center gap-2 rounded-xl bg-gradient-to-br from-[#f09433] via-[#dc2743] to-[#bc1888] px-6 font-semibold text-white shadow-[0_2px_12px_rgba(220,39,67,0.25)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_4px_20px_rgba(220,39,67,0.35)] active:translate-y-0"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                </svg>
                Instagram
              </a>
            </div>

            {/* Phone note */}
            <p className="mt-6 text-center text-xs font-medium text-bone-200/50">
              {company.phonePrimary} · Trip support open 24×7 while you travel
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
