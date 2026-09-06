import { Menu, MessageCircle, Phone, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { telLink, whatsappLink } from '../../data/company'
import { useEscapeKey, useScrollLock } from '../../hooks'
import Logo from '../ui/Logo'

/**
 * Dynamic Island + Liquid Glass navigation.
 *
 * - Floating centered pill shape
 * - Hidden during landing video, fades in after hero completes
 * - Scroll-aware glass intensity
 * - Mobile: compact pill with glass drawer
 */

export const NAV_LINKS = [
  { label: 'Home', to: '/' },
  { label: 'Destinations', to: '/destinations' },
  { label: 'Packages', to: '/packages' },
  { label: 'About', to: '/about' },
  { label: 'Reviews', to: '/reviews' },
  { label: 'Contact', to: '/contact' },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const [visible, setVisible] = useState(false)
  const { pathname } = useLocation()
  const isHome = pathname === '/'

  /* Scroll detection */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  /* Close mobile menu on route change */
  useEffect(() => {
    setOpen(false)
  }, [pathname])

  /* On non-home pages, show immediately. On home page, wait for hero-complete. */
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
      className={`navbar-island ${scrolled ? 'navbar-island--scrolled' : ''} ${
        visible ? 'navbar-island--visible' : ''
      }`}
      role="banner"
    >
      <div className="navbar-island__inner">
        {/* Logo */}
        <Logo size="sm" tone="light" showTagline={false} />

        {/* Desktop nav */}
        <nav aria-label="Main" className="hidden items-center gap-0.5 lg:flex">
          {NAV_LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === '/'}
              className={({ isActive }) =>
                `relative px-3.5 py-2 text-[0.8125rem] font-medium tracking-wide transition-colors duration-200 ${
                  isActive
                    ? 'text-white'
                    : 'text-white/60 hover:text-white'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {link.label}
                  <span
                    aria-hidden="true"
                    className={`absolute bottom-1 left-1/2 h-px -translate-x-1/2 rounded-full transition-all duration-300 ${
                      isActive
                        ? 'w-4 bg-gold-400'
                        : 'w-0 bg-transparent group-hover:w-3'
                    }`}
                  />
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Desktop CTA */}
        <div className="hidden items-center gap-3 lg:flex">
          <Link
            to="/enquire"
            className="navbar-island__cta"
          >
            Plan Your Trip
          </Link>
        </div>

        {/* Mobile right side */}
        <div className="flex items-center gap-2.5 lg:hidden">
          <Link
            to="/enquire"
            className="navbar-island__cta navbar-island__cta--mobile"
          >
            Plan Your Trip
          </Link>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? 'Close menu' : 'Open menu'}
            className="navbar-island__burger"
          >
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {/* Mobile drawer — liquid glass */}
      {open && (
        <div
          id="mobile-nav"
          className="navbar-island__drawer"
        >
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
                className="flex items-center justify-center rounded-full bg-brand-600 py-3.5 text-[0.875rem] font-semibold text-white transition-all hover:bg-brand-700 active:bg-brand-800"
              >
                Plan Your Trip
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
                  <MessageCircle size={15} strokeWidth={2} />
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
                  Call
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
