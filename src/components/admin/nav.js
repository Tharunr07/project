import {
  BarChart3,
  History,
  Images,
  LayoutDashboard,
  MapPinned,
  MessagesSquare,
  Package,
  ReceiptText,
  Route,
  Star,
  Wallet,
} from 'lucide-react'

/**
 * Single source of admin navigation. The sidebar renders it, the header reads
 * the current page title from it, and the route table in App.jsx mirrors it.
 */
export const NAV_SECTIONS = [
  {
    label: 'Overview',
    items: [{ to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard }],
  },
  {
    label: 'Catalogue',
    items: [
      { to: '/admin/packages', label: 'Packages', icon: Package },
      { to: '/admin/destinations', label: 'Destinations', icon: MapPinned },
    ],
  },
  {
    label: 'Operations',
    items: [
      { to: '/admin/trips', label: 'Trips', icon: Route },
      { to: '/admin/expenses', label: 'Expenses', icon: Wallet },
      { to: '/admin/bills', label: 'Bills', icon: ReceiptText },
    ],
  },
  {
    label: 'CRM',
    items: [{ to: '/admin/enquiries', label: 'Enquiries', icon: MessagesSquare }],
  },
  {
    label: 'Content',
    items: [
      { to: '/admin/gallery', label: 'Gallery', icon: Images },
      { to: '/admin/reviews', label: 'Reviews', icon: Star },
    ],
  },
  {
    label: 'Insights',
    items: [
      { to: '/admin/reports', label: 'Reports', icon: BarChart3 },
      { to: '/admin/trip-history', label: 'Trip History', icon: History },
    ],
  },
]

/** `{ pathname → label }` for the header title. */
export const NAV_LOOKUP = new Map(
  NAV_SECTIONS.flatMap((section) => section.items).map((item) => [item.to, item.label]),
)
