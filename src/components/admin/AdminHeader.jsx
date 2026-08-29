import { ExternalLink, LogOut, Menu } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import { useAdminAuth } from '../../context/AdminAuthContext'
import { initials } from '../../utils/format'
import { NAV_LOOKUP } from './nav'

/** Sticky admin top bar — menu (mobile), page title, view-site, user, logout. */
export default function AdminHeader({ onMenu }) {
  const { user, logout } = useAdminAuth()
  const { pathname } = useLocation()
  const title = NAV_LOOKUP.get(pathname) ?? 'Admin'

  return (
    <header className="no-print sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-sand-200 bg-white/90 px-4 backdrop-blur sm:px-6 lg:px-8">
      <button
        type="button"
        onClick={onMenu}
        aria-label="Open navigation"
        className="grid size-10 shrink-0 cursor-pointer place-content-center rounded-xl text-navy-700 transition-colors hover:bg-sand-100 lg:hidden"
      >
        <Menu size={20} />
      </button>

      <div className="min-w-0 flex-1">
        <h1 className="truncate font-display text-lg font-extrabold text-navy-900">{title}</h1>
      </div>

      <Link
        to="/"
        target="_blank"
        rel="noreferrer"
        className="hidden items-center gap-1.5 rounded-full px-3 py-2 text-xs font-bold text-navy-500 transition-colors hover:bg-sand-100 hover:text-navy-900 sm:inline-flex"
      >
        <ExternalLink size={13} aria-hidden="true" />
        View website
      </Link>

      <span aria-hidden="true" className="hidden h-6 w-px bg-sand-200 sm:block" />

      <div className="flex items-center gap-2.5">
        <span className="hidden min-w-0 text-right sm:block">
          <span className="block truncate text-sm font-bold text-navy-900 capitalize">
            {user?.name}
          </span>
          <span className="block text-[0.6875rem] font-semibold text-navy-400 capitalize">
            {user?.role}
          </span>
        </span>
        <span
          aria-hidden="true"
          className="grid size-9 shrink-0 place-content-center rounded-full bg-navy-900 text-xs font-bold text-white uppercase"
        >
          {initials(user?.name ?? 'AH')}
        </span>
      </div>

      <button
        type="button"
        onClick={logout}
        title="Sign out"
        aria-label="Sign out"
        className="grid size-10 shrink-0 cursor-pointer place-content-center rounded-xl text-navy-400 transition-colors hover:bg-crimson-50 hover:text-crimson-600"
      >
        <LogOut size={18} />
      </button>
    </header>
  )
}
