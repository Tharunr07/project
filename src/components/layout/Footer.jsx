import { ArrowUpRight, Mail, MapPin, MessageCircle, Phone } from 'lucide-react'
import { Link } from 'react-router-dom'
import { addressLine, company, whatsappLink } from '../../data/company'
import Logo from '../ui/Logo'

const QUICK_LINKS = [
  { label: 'Destinations', to: '/destinations' },
  { label: 'Tour Packages', to: '/packages' },
  { label: 'Photo Gallery', to: '/gallery' },
  { label: 'Traveller Reviews', to: '/reviews' },
  { label: 'About Us', to: '/about' },
  { label: 'Contact Us', to: '/contact' },
]

const SOCIAL_ICONS = {
  Instagram: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
    </svg>
  ),
  Facebook: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  ),
  YouTube: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  ),
  X: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  ),
}

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
      <div className="shell grid gap-12 py-16 sm:grid-cols-2 lg:grid-cols-3 lg:gap-10 lg:py-20">
        {/* Left — Brand */}
        <div>
          <Logo size="lg" tone="light" />
          <p className="mt-6 max-w-xs text-sm leading-relaxed text-navy-200">
            Avengers Holidays plans and operates group tours across South India — hill stations,
            backwaters, wildlife and heritage circuits — for colleges, schools, families, friends
            and corporate teams.
          </p>

          <div className="mt-7 flex flex-wrap gap-2">
            {company.socials.map((social) => (
              <a
                key={social.label}
                href={social.href}
                aria-label={social.label}
                className="grid size-9 place-content-center rounded-full bg-white/8 text-navy-100 ring-1 ring-inset ring-white/12 transition-colors hover:bg-crimson-600 hover:text-white hover:ring-crimson-600"
              >
                {SOCIAL_ICONS[social.label]}
              </a>
            ))}
          </div>
        </div>

        {/* Center — Quick Links */}
        <div>
          <h3 className="text-xs font-bold tracking-[0.18em] text-bone-200 uppercase">
            Quick Links
          </h3>
          <ul className="mt-5 space-y-3">
            {QUICK_LINKS.map((link) => (
              <FooterLink key={link.to} to={link.to}>
                {link.label}
              </FooterLink>
            ))}
          </ul>
        </div>

        {/* Right — Contact Info */}
        <div>
          <h3 className="text-xs font-bold tracking-[0.18em] text-bone-200 uppercase">
            Contact Info
          </h3>
          <div className="mt-5 space-y-4 text-sm">
            <a
              href={`tel:${company.phonePrimary.replace(/\s/g, '')}`}
              className="flex items-center gap-2.5 text-navy-200 transition-colors hover:text-white"
            >
              <Phone size={15} strokeWidth={2.2} aria-hidden="true" className="shrink-0" />
              {company.phonePrimary}
            </a>
            <a
              href={`mailto:${company.emailGeneral}`}
              className="flex items-center gap-2.5 text-navy-200 transition-colors hover:text-white"
            >
              <Mail size={15} strokeWidth={2.2} aria-hidden="true" className="shrink-0" />
              {company.emailGeneral}
            </a>
            <p className="flex gap-2.5 leading-relaxed text-navy-200">
              <MapPin size={15} strokeWidth={2.2} aria-hidden="true" className="mt-0.5 shrink-0" />
              {addressLine}
            </p>
            <a
              href={whatsappLink()}
              target="_blank"
              rel="noreferrer noopener"
              className="flex items-center gap-2.5 text-navy-200 transition-colors hover:text-white"
            >
              <MessageCircle size={15} strokeWidth={2.2} aria-hidden="true" className="shrink-0" />
              WhatsApp {company.whatsapp}
            </a>
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
