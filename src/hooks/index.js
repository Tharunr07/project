import { useEffect, useRef, useState } from 'react'

/**
 * Reveal-on-scroll. Adds the `reveal-in` class the first time an element
 * enters the viewport, then stops observing it.
 *
 * Usage:  const ref = useReveal();  <div ref={ref} className="reveal">…</div>
 */
export function useReveal({ threshold = 0.12, rootMargin = '0px 0px -40px 0px' } = {}) {
  const ref = useRef(null)

  useEffect(() => {
    const node = ref.current
    if (!node) return undefined

    // Respect reduced-motion and older browsers: show immediately.
    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    if (reduced || typeof IntersectionObserver === 'undefined') {
      node.classList.add('reveal-in')
      return undefined
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add('reveal-in')
            observer.unobserve(entry.target)
          }
        }
      },
      { threshold, rootMargin },
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [threshold, rootMargin])

  return ref
}

/** Lock body scroll while a modal or drawer is open. */
export function useScrollLock(active) {
  useEffect(() => {
    if (!active) return undefined
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previous
    }
  }, [active])
}

/** Fire a callback on Escape. */
export function useEscapeKey(handler, active = true) {
  useEffect(() => {
    if (!active) return undefined
    const onKey = (event) => {
      if (event.key === 'Escape') handler(event)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [handler, active])
}

/**
 * Count from 0 to `target` when the element scrolls into view.
 * Used by the home-page live-stat strip.
 */
export function useCountUp(target, { duration = 1600 } = {}) {
  const ref = useRef(null)
  const [value, setValue] = useState(0)

  useEffect(() => {
    const node = ref.current
    if (!node) return undefined

    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    if (reduced || typeof IntersectionObserver === 'undefined') {
      setValue(target)
      return undefined
    }

    let frame
    const run = () => {
      const start = performance.now()
      const step = (now) => {
        const progress = Math.min((now - start) / duration, 1)
        // easeOutExpo — fast start, gentle settle
        const eased = progress === 1 ? 1 : 1 - 2 ** (-10 * progress)
        setValue(Math.round(target * eased))
        if (progress < 1) frame = requestAnimationFrame(step)
      }
      frame = requestAnimationFrame(step)
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          run()
          observer.disconnect()
        }
      },
      { threshold: 0.4 },
    )
    observer.observe(node)

    return () => {
      observer.disconnect()
      if (frame) cancelAnimationFrame(frame)
    }
  }, [target, duration])

  return [ref, value]
}

/**
 * Simulated async load — PHASE 1 only.
 *
 * Every screen that will later read from Firestore goes through this hook, so
 * the loading and empty states are real UI rather than decoration. Phase 2
 * swaps the body for a Firestore listener and every call site keeps working.
 *
 * @returns {{ data: any, loading: boolean, error: Error|null, reload: function }}
 */
export function useMockQuery(loader, deps = [], { delay = 260 } = {}) {
  const [state, setState] = useState({ data: null, loading: true, error: null })
  const [nonce, setNonce] = useState(0)
  const loaderRef = useRef(loader)
  loaderRef.current = loader

  useEffect(() => {
    let cancelled = false
    setState({ data: null, loading: true, error: null })

    const timer = setTimeout(() => {
      if (cancelled) return
      try {
        setState({ data: loaderRef.current(), loading: false, error: null })
      } catch (error) {
        setState({ data: null, loading: false, error })
      }
    }, delay)

    return () => {
      cancelled = true
      clearTimeout(timer)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, nonce, delay])

  return { ...state, reload: () => setNonce((n) => n + 1) }
}

/**
 * Mock list that admin pages can edit locally.
 *
 * PHASE 1: loads mock data through the simulated query, then hands back a
 * mutable copy so add/edit/delete/publish all work against plain React state.
 * Phase 2 replaces this hook with Firestore listeners — the `{ rows, setRows }`
 * contract keeps every screen unchanged.
 */
export function useCollection(loader, deps = []) {
  const query = useMockQuery(loader, deps)
  const [rows, setRows] = useState([])

  useEffect(() => {
    if (query.data) setRows(query.data)
  }, [query.data])

  return { ...query, rows }
}
