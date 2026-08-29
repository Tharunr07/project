import { Outlet } from 'react-router-dom'
import { AdminToastProvider } from '../../context/AdminToastContext'
import AdminHeader from './AdminHeader'
import AdminSidebar from './AdminSidebar'
import { useState } from 'react'

/** Shell for every /admin/* page: sidebar + header + content outlet. */
export default function AdminLayout() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <AdminToastProvider>
      <div className="min-h-screen bg-sand-100">
        <AdminSidebar open={menuOpen} onClose={() => setMenuOpen(false)} />

        <div className="flex min-h-screen flex-col lg:pl-64">
          <AdminHeader onMenu={() => setMenuOpen(true)} />

          <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 lg:px-8">
            <Outlet />
          </main>

          <footer className="no-print px-4 pb-6 sm:px-6 lg:px-8">
            <p className="text-center text-xs font-medium text-navy-400">
              Avengers Holidays admin · Phase 1 prototype — all data is local demo content
            </p>
          </footer>
        </div>
      </div>
    </AdminToastProvider>
  )
}
