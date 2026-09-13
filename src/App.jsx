import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import ErrorBoundary from './components/admin/ErrorBoundary'
import RequireAuth from './components/admin/RequireAuth'
import AdminLayout from './components/admin/AdminLayout'
import { AdminAuthProvider } from './context/AdminAuthContext'
import CustomerLayout from './components/layout/CustomerLayout'
import About from './pages/About'
import Contact from './pages/Contact'
import DestinationDetail from './pages/DestinationDetail'
import Destinations from './pages/Destinations'
import Enquiry from './pages/Enquiry'
import Gallery from './pages/Gallery'
import Home from './pages/Home'
import NotFound from './pages/NotFound'
import PackageDetail from './pages/PackageDetail'
import Packages from './pages/Packages'
import Reviews from './pages/Reviews'
import AdminBills from './pages/admin/AdminBills'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminDestinations from './pages/admin/AdminDestinations'
import AdminEnquiries from './pages/admin/AdminEnquiries'
import AdminExpenses from './pages/admin/AdminExpenses'
import AdminFAQs from './pages/admin/AdminFAQs'
import AdminGallery from './pages/admin/AdminGallery'
import AdminLogin from './pages/admin/AdminLogin'
import AdminPackages from './pages/admin/AdminPackages'
import AdminReports from './pages/admin/AdminReports'
import AdminHappyClients from './pages/admin/AdminHappyClients'
import AdminReviews from './pages/admin/AdminReviews'
import AdminRouteDestinations from './pages/admin/AdminRouteDestinations'
import AdminTripHistory from './pages/admin/AdminTripHistory'
import AdminTrips from './pages/admin/AdminTrips'

/**
 * Full route map.
 *
 * Public pages share CustomerLayout (navbar + footer + floating actions).
 * /admin/login stands alone; every other /admin route sits behind the
 * Firebase Authentication gate (RequireAuth) inside AdminLayout. PHASE 2C.
 */
export default function App() {
  return (
    <AdminAuthProvider>
      <BrowserRouter>
        <Routes>
          {/* ── Customer website ─────────────────────────────────────────── */}
          <Route element={<CustomerLayout />}>
            <Route index element={<Home />} />
            <Route path="destinations" element={<Destinations />} />
            <Route path="destinations/:id" element={<DestinationDetail />} />
            <Route path="packages" element={<Packages />} />
            <Route path="packages/:id" element={<PackageDetail />} />
            <Route path="about" element={<About />} />
            <Route path="gallery" element={<Gallery />} />
            <Route path="reviews" element={<Reviews />} />
            <Route path="contact" element={<Contact />} />
            <Route path="enquire" element={<Enquiry />} />
            <Route path="*" element={<NotFound />} />
          </Route>

          {/* ── Admin portal ─────────────────────────────────────────────── */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route
            path="/admin"
            element={
              <ErrorBoundary>
                <RequireAuth>
                  <AdminLayout />
                </RequireAuth>
              </ErrorBoundary>
            }
          >
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="packages" element={<AdminPackages />} />
            <Route path="destinations" element={<AdminDestinations />} />
            <Route path="trips" element={<AdminTrips />} />
            <Route path="expenses" element={<AdminExpenses />} />
            <Route path="bills" element={<AdminBills />} />
            <Route path="enquiries" element={<AdminEnquiries />} />
            <Route path="gallery" element={<AdminGallery />} />
            <Route path="reviews" element={<AdminReviews />} />
            <Route path="happy-clients" element={<AdminHappyClients />} />
            <Route path="faqs" element={<AdminFAQs />} />
            <Route path="route-destinations" element={<AdminRouteDestinations />} />
            <Route path="reports" element={<AdminReports />} />
            <Route path="trip-history" element={<AdminTripHistory />} />
            <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AdminAuthProvider>
  )
}
