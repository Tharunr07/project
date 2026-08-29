import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { authorizeSession, observeAuth, signIn as firebaseSignIn, signOutUser } from '../firebase/auth'

/**
 * Admin/staff auth — PHASE 2C.
 *
 * Firebase Authentication replaced the Phase 1 sessionStorage dummy. The
 * public API is preserved (`useAdminAuth()` → user / isAuthenticated /
 * login / logout) so no consumer needed rewriting; additions are `authReady`
 * and the real `role` on the user object.
 *
 * Session restore: Firebase persists the session (localStorage by default),
 * and `authReady` flips true after the first onAuthStateChanged callback —
 * RequireAuth waits for it, so refreshing a signed-in admin page never
 * flickers over to /admin/login.
 *
 * `login(email, password)` signs in AND authorises via users/{uid} (see
 * firebase/auth.js). Unauthorised accounts are rejected with a friendly
 * error before any admin route unlocks.
 */
const AdminAuthContext = createContext(null)

export function AdminAuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [authReady, setAuthReady] = useState(false)

  // Restore any existing session on mount; track sign-in/out afterwards.
  useEffect(() => {
    const unsubscribe = observeAuth((firebaseUser) => {
      if (!firebaseUser) {
        setUser(null)
        setAuthReady(true)
        return
      }

      // A raw Firebase session without an authorised profile is possible only
      // through console tampering or races — verify before trusting it.
      authorizeSession(firebaseUser)
        .then((profile) => setUser(profile))
        .finally(() => setAuthReady(true))
    })
    return unsubscribe
  }, [])

  const login = useCallback(async (email, password) => {
    const profile = await firebaseSignIn(email, password)
    setUser(profile)
    return profile
  }, [])

  const logout = useCallback(async () => {
    await signOutUser()
    setUser(null)
  }, [])

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      isAdmin: user?.role === 'admin',
      role: user?.role ?? null,
      authReady,
      login,
      logout,
    }),
    [user, authReady, login, logout],
  )

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext)
  if (!context) throw new Error('useAdminAuth must be used inside <AdminAuthProvider>')
  return context
}
