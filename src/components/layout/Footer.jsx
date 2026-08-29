import { ArrowUpRight, Clock, Mail, MapPin, MessageCircle, Phone } from 'lucide-react'
import { Link } from 'react-router-dom'
import { addressLine, company, whatsappLink } from '../../data/company'
import Logo from '../ui/Logo'

/**
 * Site footer. Splits contact routes into general enquiries and on-trip support
 * because those reach different desks at the agency.
 */

const EXPLORE = [
  { label: 'Destinations', to: '/destinations' },
  { label: 'Tour Packages', to: '/packages' },
  { label: 'Photo Gallery', to: '/gallery' },
  { label: 'Traveller Reviews', to: '/reviews' },
]

const COMPANY_LINKS = [
  { label: 'About Us', to: '/about' },
  { label: 'Contact Us', to: '/contact' },
  { label: 'Send an Enquiry', to: '/enquire' },
  { label: 'Admin Login', to: '/admin/login' },
]

const POPULAR = [
  { label: 'Ooty', to: '/destinations/ooty' },
  { label: 'Kodaikanal', to: '/destinations/kodaikanal' },
  { label: 'Munnar', to: '/destinations/munnar' },
  { label: 'Coorg', to: '/destinations/coorg' },
  { label: 'Wayanad', to: '/destinations/wayanad' },
  { label: 'Mysore', to: '/destinations/mysore' },
  { label: 'Pondicherry', to: '/destinations/pondicherry' },
  { label: 'Kerala', to: '/destinations/kerala' },
]

function FooterLink({ to, children }) {
  return (
    <li>
      <Link
        to={to}
        className="group inline-flex items-center gap-1.5 text-sm text-navy-200 transition-colors hover:text-white"
      >
        {children}
        <ArrowUpRight
          size={13}
          aria-hidden="true"
          className="opacity-0 transition-opacity group-hover:opacity-100"
        />
      </Link>
    </li>
  )
}

export default function Footer() {
  return (
    <footer className="bg-navy-950 text-white">
      <div className="shell grid gap-12 py-16 lg:grid-cols-[1.4fr_1fr_1fr_1.3fr] lg:gap-10 lg:py-20">
        {/* Brand */}
        <div>
          <Logo size="lg" tone="light" />
          <p className="mt-6 max-w-sm text-sm leading-relaxed text-navy-200">
            Avengers Holidays plans and operates group tours across South India — hill stations,
            backwaters, wildlife and heritage circuits — for colleges, schools, families, friends
            and corporate teams. Every trip is run by our own coordinators on the ground.
          </p>

          <dl className="mt-7 space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <dt className="font-semibold text-navy-300">Since</dt>
              <dd className="font-bold text-white">{company.since}</dd>
            </div>
            <div className="flex items-center gap-2">
              <dt className="font-semibold text-navy-300">GSTIN</dt>
              <dd className="font-bold text-white">{company.gstin}</dd>
            </div>
            <div className="flex items-center gap-2">
              <dt className="font-semibold text-navy-300">Reg. No.</dt>
              <dd className="font-bold text-white">{company.registration}</dd>
            </div>
          </dl>

          <div className="mt-7 flex flex-wrap gap-2">
            {company.socials.map((social) => (
              <a
                key={social.label}
                href={social.href}
                aria-label={`${social.label} — ${social.handle}`}
                className="rounded-full bg-white/8 px-3.5 py-2 text-xs font-bold tracking-wide text-navy-100 uppercase ring-1 ring-inset ring-white/12 transition-colors hover:bg-crimson-600 hover:text-white hover:ring-crimson-600"
              >
                {social.label}
              </a>
            ))}
          </div>
        </div>

        {/* Explore */}
        <div>
          <h3 className="text-xs font-bold tracking-[0.18em] text-bone-200 uppercase">Explore</h3>
          <ul className="mt-5 space-y-3">
            {EXPLORE.map((link) => (
              <FooterLink key={link.to} to={link.to}>
                {link.label}
              </FooterLink>
            ))}
          </ul>

          <h3 className="mt-9 text-xs font-bold tracking-[0.18em] text-bone-200 uppercase">
            Company
          </h3>
          <ul className="mt-5 space-y-3">
            {COMPANY_LINKS.map((link) => (
              <FooterLink key={link.to} to={link.to}>
                {link.label}
              </FooterLink>
            ))}
          </ul>
        </div>

        {/* Popular destinations */}
        <div>
          <h3 className="text-xs font-bold tracking-[0.18em] text-bone-200 uppercase">
            Popular Trips
          </h3>
          <ul className="mt-5 space-y-3">
            {POPULAR.map((link) => (
              <FooterLink key={link.to} to={link.to}>
                {link.label}
              </FooterLink>
            ))}
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h3 className="text-xs font-bold tracking-[0.18em] text-bone-200 uppercase">
            Talk to us
          </h3>

          <div className="mt-5 space-y-5 text-sm">
            <div>
              <p className="text-[0.6875rem] font-bold tracking-wide text-navy-400 uppercase">
                General Enquiries
              </p>
              <a
                href={`tel:${company.phonePrimary.replace(/\s/g, '')}`}
                className="mt-1.5 flex items-center gap-2.5 font-bold text-white transition-colors hover:text-bone-200"
              >
                <Phone size={15} strokeWidth={2.2} aria-hidden="true" />
                {company.phonePrimary}
              </a>
              <a
                href={`mailto:${company.emailGeneral}`}
                className="mt-1.5 flex items-center gap-2.5 text-navy-200 transition-colors hover:text-white"
              >
                <Mail size={15} strokeWidth={2.2} aria-hidden="true" />
                {company.emailGeneral}
              </a>
            </div>

            <div>
              <p className="text-[0.6875rem] font-bold tracking-wide text-navy-400 uppercase">
                On-Trip Support
              </p>
              <a
                href={`tel:${company.phoneSecondary.replace(/\s/g, '')}`}
                className="mt-1.5 flex items-center gap-2.5 font-bold text-white transition-colors hover:text-bone-200"
              >
                <Phone size={15} strokeWidth={2.2} aria-hidden="true" />
                {company.phoneSecondary}
              </a>
              <a
                href={`mailto:${company.emailSupport}`}
                className="mt-1.5 flex items-center gap-2.5 text-navy-200 transition-colors hover:text-white"
              >
                <Mail size={15} strokeWidth={2.2} aria-hidden="true" />
                {company.emailSupport}
              </a>
              <a
                href={whatsappLink()}
                target="_blank"
                rel="noreferrer noopener"
                className="mt-1.5 flex items-center gap-2.5 text-navy-200 transition-colors hover:text-white"
              >
                <MessageCircle size={15} strokeWidth={2.2} aria-hidden="true" />
                WhatsApp {company.whatsapp}
              </a>
            </div>

            <div>
              <p className="text-[0.6875rem] font-bold tracking-wide text-navy-400 uppercase">
                Office
              </p>
              <p className="mt-1.5 flex gap-2.5 leading-relaxed text-navy-200">
                <MapPin size={15} strokeWidth={2.2} aria-hidden="true" className="mt-0.5 shrink-0" />
                {addressLine}
              </p>
            </div>

            <div>
              <p className="text-[0.6875rem] font-bold tracking-wide text-navy-400 uppercase">
                Business Hours
              </p>
              <ul className="mt-1.5 space-y-1 text-navy-200">
                {company.hours.map((row) => (
                  <li key={row.days} className="flex gap-2.5">
                    <Clock
                      size={15}
                      strokeWidth={2.2}
                      aria-hidden="true"
                      className="mt-0.5 shrink-0 text-navy-400"
                    />
                    <span>
                      <span className="font-semibold text-white">{row.days}</span> — {row.time}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="shell flex flex-col items-center justify-between gap-3 py-6 text-xs text-navy-300 sm:flex-row">
          <p>
            © {company.since}–2026 {company.legalName}. All rights reserved.
          </p>
          <p className="text-center sm:text-right">
            Demonstration website · prices and availability are indicative and confirmed at the time
            of enquiry.
          </p>
        </div>
      </div>
    </footer>
  )
}
