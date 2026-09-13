import { ChevronDown } from 'lucide-react'
import { useCallback, useMemo, useRef, useState } from 'react'
import { SEED_FAQS, useFaqs } from '../../firebase/collections/faqs'

/**
 * Frequently Asked Questions section for the Home page.
 *
 * Data strategy:
 * 1. Subscribe to the full `faqs` Firestore collection (no index required).
 * 2. Filter active FAQs on the client: `isActive === true` (strict boolean check).
 * 3. Sort by `order` field on the client.
 * 4. Only use SEED_FAQS when Firestore genuinely returns no documents
 *    (empty array = collection has never been seeded) or returns an error.
 *    When Firestore has documents (even if all inactive), those documents
 *    are authoritative — SEED_FAQS must NOT override them.
 */

function normalize(raw) {
  return raw
    .filter((faq) => faq.isActive === true)
    .sort((a, b) => (a.order ?? 999999) - (b.order ?? 999999))
}

const FALLBACK = SEED_FAQS.map((faq, i) => ({ ...faq, id: `seed-${i}`, order: i + 1, isActive: true }))

export default function FAQSection() {
  const { data: rawFaqs, loading, error } = useFaqs()
  const [openId, setOpenId] = useState(null)

  const toggle = useCallback(
    (id) => setOpenId((current) => (current === id ? null : id)),
    [],
  )

  const faqs = useMemo(() => {
    // Firestore returned documents — they are authoritative, even if all inactive.
    if (Array.isArray(rawFaqs)) {
      return normalize(rawFaqs)
    }

    // Firestore returned nothing (empty collection before seeding).
    // Use SEED_FAQS fallback only when the collection is genuinely empty.
    if (!error && rawFaqs !== null && rawFaqs !== undefined && rawFaqs.length === 0) {
      return normalize(FALLBACK)
    }

    // Firestore error or still loading — use fallback for resilience.
    if (error) {
      console.error('[FAQSection] Firestore error, using fallback:', error)
    }
    return normalize(FALLBACK)
  }, [rawFaqs, error])

  if (loading) {
    return (
      <section className="relative overflow-hidden bg-white py-16 sm:py-20 lg:py-24">
        <div className="shell px-4 sm:px-6 text-center">
          <div className="mx-auto max-w-2xl animate-pulse">
            <div className="mx-auto mb-4 h-3 w-24 rounded bg-navy-200" />
            <div className="mx-auto h-8 w-64 rounded bg-navy-200" />
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="relative overflow-hidden bg-white py-16 sm:py-20 lg:py-24">
      <span
        aria-hidden="true"
        className="absolute -top-32 left-1/2 -z-10 size-[40rem] -translate-x-1/2 rounded-full bg-crimson-600/[0.03] blur-[120px]"
      />

      <div className="shell relative z-10 px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <p className="mb-4 inline-flex items-center gap-2.5 text-[0.6875rem] font-bold tracking-[0.2em] uppercase text-crimson-600">
            <span aria-hidden="true" className="h-px w-8 bg-crimson-500/50" />
            Need to know
            <span aria-hidden="true" className="h-px w-8 bg-crimson-500/50" />
          </p>
          <h2 className="font-[family-name:var(--font-display)] text-3xl font-bold leading-[1.12] text-navy-900 sm:text-4xl lg:text-[2.75rem]">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="mx-auto mt-12 max-w-3xl divide-y divide-sand-200">
          {faqs.map((faq, index) => (
            <FAQItem
              key={faq.id}
              faq={faq}
              index={index}
              isOpen={openId === faq.id}
              onToggle={toggle}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

function FAQItem({ faq, index, isOpen, onToggle }) {
  const contentRef = useRef(null)
  const [height, setHeight] = useState(0)

  const reduced = useMemo(() => {
    if (typeof window === 'undefined') return false
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches
  }, [])

  const handleToggle = () => {
    if (!isOpen && contentRef.current) {
      setHeight(contentRef.current.scrollHeight)
    }
    onToggle(faq.id)
  }

  const num = String(index + 1).padStart(2, '0')

  return (
    <div className="group">
      <button
        type="button"
        onClick={handleToggle}
        aria-expanded={isOpen}
        className="flex w-full items-center gap-4 py-5 text-left sm:gap-6 sm:py-6"
      >
        <span className="shrink-0 font-[family-name:var(--font-display)] text-sm font-bold text-crimson-600 tabular-nums">
          {num}
        </span>

        <span className="flex-1 font-[family-name:var(--font-display)] text-[0.9375rem] font-semibold leading-snug text-navy-800 transition-colors group-hover:text-navy-950 sm:text-base">
          {faq.question}
        </span>

        <ChevronDown
          size={18}
          strokeWidth={2}
          className="shrink-0 text-navy-400 transition-transform"
          style={{
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: reduced ? 'none' : 'transform 0.3s ease',
          }}
          aria-hidden="true"
        />
      </button>

      <div
        role="region"
        aria-hidden={!isOpen}
        style={{
          height: isOpen ? `${height}px` : '0px',
          opacity: isOpen ? 1 : 0,
          transition: reduced ? 'none' : 'height 0.35s cubic-bezier(0.4,0,0.2,1), opacity 0.3s ease',
        }}
        onTransitionEnd={() => {
          if (!isOpen && contentRef.current) {
            setHeight(0)
          }
        }}
      >
        <div ref={contentRef} className="overflow-hidden">
          <div className="pb-5 pl-10 pr-4 sm:pb-6 sm:pl-12">
            <p className="text-[0.9375rem] leading-relaxed text-navy-600 sm:text-base">
              {faq.answer}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
