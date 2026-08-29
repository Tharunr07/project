import { ArrowUp, MessageCircle, Phone } from 'lucide-react'
import { useEffect, useState } from 'react'
import { telLink, whatsappLink } from '../../data/company'

/**
 * Floating contact rail — WhatsApp and call are always reachable, and a
 * back-to-top button appears once the visitor is well down the page.
 */
export default function FloatingActions() {
  const [showTop, setShowTop] = useState(false)

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 900)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div className="no-print fixed right-4 bottom-4 z-40 flex flex-col items-end gap-3 sm:right-6 sm:bottom-6">
      {showTop && (
        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          aria-label="Back to top"
          className="grid size-11 animate-scale-in cursor-pointer place-content-center rounded-full bg-navy-900 text-white shadow-lift transition-transform hover:-translate-y-0.5 hover:bg-navy-800"
        >
          <ArrowUp size={18} strokeWidth={2.4} aria-hidden="true" />
        </button>
      )}

      <a
        href={telLink}
        aria-label="Call Avengers Holidays"
        className="grid size-12 place-content-center rounded-full bg-white text-crimson-600 shadow-lift ring-1 ring-sand-200 transition-transform hover:-translate-y-0.5 sm:size-13"
      >
        <Phone size={20} strokeWidth={2.2} aria-hidden="true" />
      </a>

      <a
        href={whatsappLink()}
        target="_blank"
        rel="noreferrer noopener"
        className="group flex items-center gap-2.5 rounded-full bg-[#1faa59] py-3 pr-4 pl-3.5 text-white shadow-lift transition-transform hover:-translate-y-0.5 hover:bg-[#1b9750]"
      >
        <MessageCircle size={21} strokeWidth={2.2} aria-hidden="true" />
        <span className="hidden text-sm font-bold sm:inline">Chat on WhatsApp</span>
        <span className="sr-only sm:hidden">Chat on WhatsApp</span>
      </a>
    </div>
  )
}
