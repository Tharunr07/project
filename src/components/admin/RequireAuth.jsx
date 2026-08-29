import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { LoadingState } from '../ui/States'
import { useAdminAuth } from '../../context/AdminAuthContext'

/**
 * Gate for /admin/* — PHASE 2C.
 *
 * Waits for Firebase to restore the session (authReady) BEFORE deciding, so
 * refreshing a signed-in admin page never flickers over to /admin/login.
 * Once ready, unauthenticated visitors are redirected exactly as before.
 */
export default function RequireAuth({ children }) {
  const { isAuthenticated, authReady } = useAdminAuth()
  const location = useLocation()

  if (!authReady) {
    return (
      <div className="grid min-h-screen place-content-center bg-sand-100">
        <LoadingState label="Checking your session…" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" state={{ from: location.pathname }} replace />
  }

  return children ?? <Outlet />
}
