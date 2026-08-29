import { X } from 'lucide-react'
import { Link, NavLink } from 'react-router-dom'
import { useAdminAuth } from '../../context/AdminAuthContext'
import Logo from '../ui/Logo'
import { NAV_SECTIONS } from './nav'

/**
 * Admin navigation. Static on desktop (lg+), slide-in drawer on mobile —
 * `open`/`onClose` are driven by the hamburger in AdminHeader.
 */
export default function AdminSidebar({ open, onClose }) {
  const { user } = useAdminAuth()

  return (
    <>
      {/* Mobile backdrop */}
      {open && (
        <button
          type="button"
          aria-label="Close menu"
          onClick={onClose}
          className="no-print fixed inset-0 z-40 cursor-default bg-navy-950/60 backdrop-blur-sm animate-fade-in lg:hidden"
        />
      )}

      <aside
        aria-label="Admin navigation"
        className={`no-print fixed inset-y-0 left-0 z-50 flex w-72 max-w-[85vw] flex-col bg-navy-950 transition-transform duration-300 ease-out lg:w-64 lg:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand + close */}
        <div className="flex items-center justify-between gap-3 px-5 pt-6 pb-5">
          <Logo size="sm" tone="light" to="/admin/dashboard" />
          <button
            type="button"
            onClick={onClose}
            aria-label="Close navigation"
            className="grid size-9 cursor-pointer place-content-center rounded-full text-navy-300 transition-colors hover:bg-white/10 hover:text-white lg:hidden"
          >
            <X size={18} />
          </button>
        </div>

        <nav className="min-h-0 flex-1 overflow-y-auto px-3 pb-4">
          {NAV_SECTIONS.map((section) => (
            <div key={section.label} className="mb-5">
              <p className="mb-2 px-3 text-[0.625rem] font-bold tracking-[0.18em] text-navy-500 uppercase">
                {section.label}
              </p>
              <ul className="space-y-1">
                {section.items.map(({ to, label, icon: Icon }) => (
                  <li key={to}>
                    <NavLink
                      to={to}
                      onClick={onClose}
                      className={({ isActive }) =>
                        `group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors ${
                          isActive
                            ? 'bg-white/10 text-white'
                            : 'text-navy-300 hover:bg-white/6 hover:text-white'
                        }`
                      }
                    >
                      {({ isActive }) => (
                        <>
                          <span
                            aria-hidden="true"
                            className={`absolute top-1/2 left-0 h-5 w-1 -translate-y-1/2 rounded-r-full bg-crimson-500 transition-opacity ${
                              isActive ? 'opacity-100' : 'opacity-0'
                            }`}
                          />
                          <Icon
                            size={17}
                            strokeWidth={isActive ? 2.3 : 2}
                            className={`shrink-0 ${isActive ? 'text-brand-400' : 'text-navy-400 group-hover:text-navy-200'}`}
                            aria-hidden="true"
                          />
                          {label}
                        </>
                      )}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>

        {/* Signed-in footer */}
        <div className="border-t border-white/10 px-5 py-4">
          <p className="truncate text-[0.6875rem] font-bold tracking-[0.14em] text-navy-500 uppercase">
            Signed in as
          </p>
          <p className="mt-1 truncate text-sm font-semibold text-white">{user?.name}</p>
          <p className="truncate text-xs text-navy-400">{user?.email}</p>
          <Link
            to="/"
            className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-brand-400 transition-colors hover:text-brand-300"
          >
            ← Back to website
          </Link>
        </div>
      </aside>
    </>
  )
}
