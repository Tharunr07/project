import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * Firestore subscription hook — PHASE 2 replacement for useMockQuery().
 *
 * Same contract as useMockQuery: `{ data, loading, error, reload }`. The
 * subscriber receives `(onData, onError)` and returns an unsubscribe
 * function (or nothing for one-shot promises). Because it mirrors the mock
 * contract, every screen keeps its existing skeletons, EmptyState and
 * ErrorState wiring unchanged.
 *
 * @param {(onData: Function, onError: Function) => Function|void} subscribe
 * @param {Array} deps re-subscribe when these change (e.g. route params)
 */
export function useSubscription(subscribe, deps = []) {
  const [state, setState] = useState({ data: null, loading: true, error: null })
  const [nonce, setNonce] = useState(0)
  const subscribeRef = useRef(subscribe)
  subscribeRef.current = subscribe

  useEffect(() => {
    let cancelled = false
    setState((current) => ({ ...current, loading: true, error: null }))

    const unsubscribe = subscribeRef.current(
      (data) => !cancelled && setState({ data, loading: false, error: null }),
      (error) => !cancelled && setState({ data: null, loading: false, error }),
    )

    return () => {
      cancelled = true
      unsubscribe?.()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, nonce])

  const reload = useCallback(() => setNonce((value) => value + 1), [])
  return { ...state, reload }
}
