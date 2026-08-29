/**
 * Shared enums and option lists.
 * Keeping these in one place means the customer enquiry form, the admin trip
 * form and the reports screens can never drift out of sync.
 */

export const GROUP_TYPES = ['College', 'School', 'Family', 'Friends', 'Corporate', 'Other']

export const TRIP_STATUSES = ['Upcoming', 'Ongoing', 'Completed', 'Cancelled']

export const ENQUIRY_STATUSES = ['New', 'Contacted', 'Quoted', 'Converted', 'Closed']

export const EXPENSE_CATEGORIES = [
  'Vehicle',
  'Hotel',
  'Food',
  'Entry Fees',
  'Guide',
  'Permits',
  'Miscellaneous',
]

export const BILL_STATUSES = ['Draft', 'Issued', 'Paid', 'Cancelled']

export const PAYMENT_MODES = ['Cash', 'UPI', 'Bank Transfer', 'Cheque']

export const GALLERY_CATEGORIES = [
  'Destinations',
  'Trips',
  'Groups',
  'Hotels',
  'Moments',
]

export const PACKAGE_CATEGORIES = ['Hill Station', 'Beach', 'Heritage', 'Wildlife', 'Backwaters']

export const MONTHS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
]

/** Tailwind classes per status, shared by every badge in the app. */
export const STATUS_TONE = {
  Upcoming: 'bg-navy-100 text-navy-700 ring-navy-200',
  Ongoing: 'bg-gold-100 text-gold-700 ring-gold-200',
  Completed: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  Cancelled: 'bg-crimson-50 text-crimson-700 ring-crimson-200',
  New: 'bg-crimson-50 text-crimson-700 ring-crimson-200',
  Contacted: 'bg-navy-100 text-navy-700 ring-navy-200',
  Quoted: 'bg-gold-100 text-gold-700 ring-gold-200',
  Converted: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  Closed: 'bg-sand-200 text-navy-600 ring-sand-300',
  Draft: 'bg-sand-200 text-navy-600 ring-sand-300',
  Issued: 'bg-navy-100 text-navy-700 ring-navy-200',
  Paid: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  Published: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  Unpublished: 'bg-sand-200 text-navy-600 ring-sand-300',
}
