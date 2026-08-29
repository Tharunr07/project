import { Compass, Home as HomeIcon } from 'lucide-react'
import Button from '../components/ui/Button'

/** 404 — rendered inside CustomerLayout so the header and footer stay put. */
export default function NotFound() {
  return (
    <section className="shell flex min-h-[60vh] flex-col items-center justify-center py-24 text-center">
      <span
        aria-hidden="true"
        className="grid size-16 place-content-center rounded-3xl bg-crimson-50 text-crimson-600"
      >
        <Compass size={30} strokeWidth={1.8} />
      </span>

      <p className="mt-8 font-display text-[4.5rem] leading-none font-extrabold text-navy-900 sm:text-7xl">
        404
      </p>
      <h1 className="mt-3 text-2xl text-navy-900 sm:text-3xl">This route isn&apos;t on our map</h1>
      <p className="mt-4 max-w-md text-[0.9375rem] leading-relaxed text-navy-500">
        The page you are looking for has moved or never existed. Let&apos;s get you back to
        planning the trip instead.
      </p>

      <div className="mt-9 flex flex-wrap justify-center gap-3">
        <Button to="/" variant="primary" size="md" icon={HomeIcon}>
          Back to Home
        </Button>
        <Button to="/packages" variant="outline" size="md" icon={Compass}>
          Browse Packages
        </Button>
      </div>
    </section>
  )
}
