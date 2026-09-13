import { Mail, Menu, Phone, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { company, telLink, whatsappLink } from '../../data/company'
import { useEscapeKey, useScrollLock } from '../../hooks'
import Logo from '../ui/Logo'

export const NAV_LINKS = [
  { label: 'Home', to: '/' },
  { label: 'Destinations', to: '/destinations' },
  { label: 'Packages', to: '/packages' },
  { label: 'Reviews', to: '/reviews' },
  { label: 'About', to: '/about' },
  { label: 'Contact Us', to: '/contact' },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const [visible, setVisible] = useState(false)
  const { pathname } = useLocation()
  const isHome = pathname === '/'

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    setOpen(false)
  }, [pathname])

  useEffect(() => {
    if (!isHome) {
      setVisible(true)
      return
    }
    setVisible(false)
    const onHeroComplete = () => setVisible(true)
    window.addEventListener('hero-complete', onHeroComplete)
    return () => window.removeEventListener('hero-complete', onHeroComplete)
  }, [isHome])

  useScrollLock(open)
  useEscapeKey(() => setOpen(false), open)

  return (
    <header
      className={`site-header ${scrolled ? 'site-header--scrolled' : ''} ${
        visible ? 'site-header--visible' : ''
      }`}
      role="banner"
    >
      {/* ── Top contact bar ──────────────────────────────────── */}
      <div className="site-header__topbar">
        <div className="site-header__topbar-inner">
          <div className="site-header__topbar-left">
            <a href={telLink} className="site-header__topbar-item">
              <Phone size={13} strokeWidth={2} />
              <span>{company.phonePrimary}</span>
            </a>
            <span className="site-header__topbar-divider" aria-hidden="true" />
            <a href={`mailto:${company.emailGeneral}`} className="site-header__topbar-item">
              <Mail size={13} strokeWidth={2} />
              <span>{company.emailGeneral}</span>
            </a>
          </div>
          <div className="site-header__topbar-right">
            <a href="https://facebook.com/avengersholidays" target="_blank" rel="noopener noreferrer" className="site-header__topbar-icon" aria-label="Facebook">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
            </a>
            <a href="https://www.instagram.com/avengers_holidays?stkn=MXEydTk4dG43dmdrbA==" target="_blank" rel="noopener noreferrer" className="site-header__topbar-icon" aria-label="Instagram">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
            </a>
            <a href="https://youtube.com/@avengersholidays" target="_blank" rel="noopener noreferrer" className="site-header__topbar-icon" aria-label="YouTube">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
            </a>
          </div>
        </div>
      </div>

      {/* ── Main navigation ──────────────────────────────────── */}
      <div className="site-header__navbar">
        <div className="site-header__navbar-inner">
          {/* Logo */}
          <Link to="/" className="site-header__logo" aria-label="Avengers Holidays home">
            <Logo size="lg" tone="light" showTagline={false} />
          </Link>

          {/* Desktop nav */}
          <nav aria-label="Main" className="hidden items-center gap-1 lg:flex">
            {NAV_LINKS.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === '/'}
                className={({ isActive }) =>
                  `site-header__link ${isActive ? 'site-header__link--active' : ''}`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          {/* Desktop CTA */}
          <div className="hidden items-center gap-3 lg:flex">
            <Link to="/enquire" className="site-header__cta">
              Enquire Now!
            </Link>
          </div>

          {/* Mobile right side */}
          <div className="flex items-center gap-2.5 lg:hidden">
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              aria-controls="mobile-nav"
              aria-label={open ? 'Close menu' : 'Open menu'}
              className="site-header__burger"
            >
              {open ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div id="mobile-nav" className="site-header__drawer">
          <nav aria-label="Mobile" className="flex flex-col px-6 py-6">
            {NAV_LINKS.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === '/'}
                className={({ isActive }) =>
                  `py-3.5 text-[0.9375rem] font-medium tracking-wide transition-colors ${
                    isActive ? 'text-white' : 'text-white/50 hover:text-white'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}

            <div className="mt-6 flex flex-col gap-3">
              <Link
                to="/enquire"
                className="flex items-center justify-center rounded-full py-3.5 text-[0.875rem] font-semibold text-ink-900 transition-all hover:brightness-110 active:brightness-95"
                style={{ background: 'var(--color-gold-400)' }}
              >
                Enquire Now!
              </Link>
              <div className="grid grid-cols-2 gap-3">
                <a
                  href={whatsappLink()}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="flex items-center justify-center gap-2 rounded-full py-3 text-[0.8125rem] font-medium text-white/60 transition-colors hover:text-white"
                  style={{
                    background: 'rgba(255,255,255,0.06)',
                    boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.08)',
                  }}
                >
                  WhatsApp
                </a>
                <a
                  href={telLink}
                  className="flex items-center justify-center gap-2 rounded-full py-3 text-[0.8125rem] font-medium text-white/60 transition-colors hover:text-white"
                  style={{
                    background: 'rgba(255,255,255,0.06)',
                    boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.08)',
                  }}
                >
                  <Phone size={15} strokeWidth={2} />
                  Call Us
                </a>
              </div>
              <Link
                to="/admin/login"
                className="mt-2 text-center text-[0.6875rem] font-medium text-white/25 transition-colors hover:text-white/50"
              >
                Staff / Admin login
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}
