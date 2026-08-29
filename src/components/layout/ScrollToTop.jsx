import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

/**
 * Resets scroll position on route change. Without this, react-router keeps the
 * previous scroll offset and a deep page opens half-way down.
 */
export default function ScrollToTop() {
  const { pathname, hash } = useLocation()

  useEffect(() => {
    if (hash) {
      const target = document.getElementById(hash.slice(1))
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' })
        return
      }
    }
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
  }, [pathname, hash])

  return null
}
