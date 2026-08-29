/**
 * Company profile + contact details.
 * PHASE 1: static mock content. Phase 2 can source this from a Firestore
 * `settings/company` document with the same shape.
 */
export const company = {
  name: 'Avengers Holidays',
  tagline: 'South India, the way it deserves to be seen.',
  shortName: 'Avengers',
  legalName: 'Avengers Holidays Tours & Travels',
  since: 2013,
  gstin: '33AVGHL1234K1ZP',
  registration: 'TN/TOUR/2013/04417',

  phonePrimary: '+91 98430 55120',
  phoneSecondary: '+91 90031 77482',
  whatsapp: '+91 98430 55120',
  /** Digits only — used to build wa.me links. */
  whatsappDigits: '919843055120',
  emailGeneral: 'hello@avengersholidays.in',
  emailSupport: 'support@avengersholidays.in',
  emailGroups: 'groups@avengersholidays.in',

  address: {
    line1: '2nd Floor, Sundaram Arcade',
    line2: '14, Trichy Main Road, Ram Nagar',
    city: 'Coimbatore',
    state: 'Tamil Nadu',
    pincode: '641009',
  },

  mapQuery: 'Ram Nagar, Coimbatore, Tamil Nadu 641009',

  hours: [
    { days: 'Monday – Friday', time: '9:30 AM – 8:00 PM' },
    { days: 'Saturday', time: '9:30 AM – 6:30 PM' },
    { days: 'Sunday', time: '10:00 AM – 2:00 PM' },
    { days: 'Trip support line', time: 'Open 24×7 while your trip is running' },
  ],

  socials: [
    { label: 'Instagram', handle: '@avengersholidays', href: '#' },
    { label: 'Facebook', handle: '/avengersholidays', href: '#' },
    { label: 'YouTube', handle: '/avengersholidays', href: '#' },
    { label: 'X', handle: '@avengersholiday', href: '#' },
  ],

  stats: [
    { id: 'travellers', label: 'Happy Travellers', value: 48200, suffix: '+' },
    { id: 'years', label: 'Years Serving South India', value: 12, suffix: '' },
    { id: 'destinations', label: 'Destinations Covered', value: 36, suffix: '+' },
    { id: 'trips', label: 'Group Trips Operated', value: 2140, suffix: '+' },
  ],

  mission:
    'To make well-planned, honestly-priced South India travel available to every group — a college batch of 60, a family of 6, or a company offsite of 200 — with the same standard of care.',
  vision:
    'To be the travel partner South India recommends by name, known for transparent pricing, dependable ground operations and trips that people talk about for years.',
}

/** Build a wa.me deep link with a pre-filled message. */
export function whatsappLink(message = "Hi Avengers Holidays, I'd like to know more about your tour packages.") {
  return `https://wa.me/${company.whatsappDigits}?text=${encodeURIComponent(message)}`
}

/** Build a tel: link for the primary number. */
export const telLink = `tel:${company.phonePrimary.replace(/\s/g, '')}`

/** Build a mailto: link for general enquiries. */
export const mailLink = `mailto:${company.emailGeneral}`

/** Single-line postal address. */
export const addressLine = [
  company.address.line1,
  company.address.line2,
  `${company.address.city} – ${company.address.pincode}`,
  company.address.state,
].join(', ')

export default company
