import { Outlet } from 'react-router-dom'
import FloatingActions from './FloatingActions'
import Footer from './Footer'
import Navbar from './Navbar'
import ScrollToTop from './ScrollToTop'

/** Shell for every public page: header, page content, footer, floating actions. */
export default function CustomerLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-sand-50">
      <ScrollToTop />

      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-100 focus:rounded-full focus:bg-navy-900 focus:px-5 focus:py-3 focus:text-sm focus:font-semibold focus:text-white"
      >
        Skip to content
      </a>

      <Navbar />

      {/*
        Floating navbar sits above all content via position:fixed.
        pt-[4.5rem] pushes inner-page content below the navbar.
        scroll-padding-top on html handles anchor navigation offset.
      */}
      <main id="main" className="flex-1 pt-[4.5rem]">
        <Outlet />
      </main>

      <Footer />
      <FloatingActions />
    </div>
  )
}
