/**
 * Trip ledger — PHASE 1 mock data.
 *
 * ────────────────────────────────────────────────────────────────────────────
 * IMPORTANT DATA RULE
 * ────────────────────────────────────────────────────────────────────────────
 * `pricePerPerson` is the price that was ACTUALLY AGREED for that trip on the
 * day it was sold. It is stored on the trip itself and is deliberately NOT read
 * from packages.js.
 *
 * A trip run in 2024 at ₹8,500 per head keeps showing ₹8,500 for ever, even
 * though the current Ooty Classic Escape package now sells at ₹9,500. Editing a
 * package price in the admin portal must never rewrite trip history — the
 * admin Trip History screen surfaces this difference explicitly.
 *
 * Phase 2 note: maps to Firestore `trips/{id}`; keep `pricePerPerson` as a
 * document field rather than a reference to the package.
 */

/** Expense field keys that roll up into `totalExpenses`. */
export const EXPENSE_FIELDS = [
  { key: 'vehicleExpense', label: 'Vehicle' },
  { key: 'hotelExpense', label: 'Hotel' },
  { key: 'foodExpense', label: 'Food' },
  { key: 'entryFeeExpense', label: 'Entry Fees' },
  { key: 'otherExpenses', label: 'Other' },
]

const raw = [
  // ── 2024 · the canonical historical-price example ─────────────────────────
  // Booked at ₹8,500/head when today's Ooty Classic Escape lists ₹9,500.
  {
    id: 'TRP-2024-212', date: '2024-05-18', status: 'Completed',
    startingLocation: 'Coimbatore', destination: 'Ooty', packageName: 'Ooty Classic Escape',
    customerName: 'PSG College of Technology', groupType: 'College',
    days: 3, travellers: 40, pricePerPerson: 8500,
    vehicleExpense: 68000, hotelExpense: 118000, foodExpense: 56000, entryFeeExpense: 19000, otherExpenses: 11000,
    notes: 'Reference trip for the price-independence rule: revenue frozen at 40 × ₹8,500 = ₹3,40,000 regardless of later rate revisions.',
  },

  // ── 2026 ──────────────────────────────────────────────────────────────────
  {
    id: 'TRP-2026-041', date: '2026-09-18', status: 'Upcoming',
    startingLocation: 'Coimbatore', destination: 'Ooty', packageName: 'Ooty Classic Escape',
    customerName: 'Sri Krishna College of Technology', groupType: 'College',
    days: 3, travellers: 64, pricePerPerson: 9500,
    vehicleExpense: 96000, hotelExpense: 224000, foodExpense: 118000, entryFeeExpense: 41600, otherExpenses: 26000,
    notes: 'Three coaches confirmed. Toy-train tickets requested for the Coonoor–Ketti section.',
  },
  {
    id: 'TRP-2026-040', date: '2026-09-05', status: 'Upcoming',
    startingLocation: 'Chennai', destination: 'Pondicherry', packageName: 'Pondicherry French Coast',
    customerName: 'Nandhini & Family', groupType: 'Family',
    days: 3, travellers: 9, pricePerPerson: 8200,
    vehicleExpense: 16500, hotelExpense: 27000, foodExpense: 9800, entryFeeExpense: 4500, otherExpenses: 3200,
    notes: 'Heritage villa requested. Two senior citizens in the group.',
  },
  {
    id: 'TRP-2026-039', date: '2026-08-22', status: 'Ongoing',
    startingLocation: 'Kochi', destination: 'Munnar', packageName: 'Munnar Tea Country Retreat',
    customerName: 'Zephyr Analytics Pvt Ltd', groupType: 'Corporate',
    days: 4, travellers: 28, pricePerPerson: 11200,
    vehicleExpense: 52000, hotelExpense: 128800, foodExpense: 46200, entryFeeExpense: 19600, otherExpenses: 14500,
    notes: 'Offsite with a half-day workshop block on day 3. Projector arranged at the resort.',
  },
  {
    id: 'TRP-2026-037', date: '2026-07-11', status: 'Completed',
    startingLocation: 'Coimbatore', destination: 'Ooty', packageName: 'Ooty Classic Escape',
    customerName: 'Vetri Matriculation School', groupType: 'School',
    days: 3, travellers: 88, pricePerPerson: 9200,
    vehicleExpense: 132000, hotelExpense: 290400, foodExpense: 158000, entryFeeExpense: 52800, otherExpenses: 33000,
    notes: 'School rate applied. Two staff rooms complimentary.',
  },
  {
    id: 'TRP-2026-035', date: '2026-06-12', status: 'Completed',
    startingLocation: 'Coimbatore', destination: 'Ooty', packageName: 'Ooty Classic Escape',
    customerName: 'Raghavan Family', groupType: 'Family',
    days: 3, travellers: 6, pricePerPerson: 9500,
    vehicleExpense: 13500, hotelExpense: 21000, foodExpense: 8400, entryFeeExpense: 3600, otherExpenses: 2400,
    notes: 'Itinerary reordered for elderly travellers. Review received — 5 stars.',
  },
  {
    id: 'TRP-2026-034', date: '2026-05-26', status: 'Completed',
    startingLocation: 'Kochi', destination: 'Kerala Backwaters', packageName: 'Kerala Backwaters Grand',
    customerName: 'Arjun Menon + 6', groupType: 'Friends',
    days: 5, travellers: 7, pricePerPerson: 13500,
    vehicleExpense: 24000, hotelExpense: 39500, foodExpense: 14800, entryFeeExpense: 5600, otherExpenses: 4900,
    notes: 'Deluxe houseboat, one night. Canoe ride operated as planned.',
  },
  {
    id: 'TRP-2026-033', date: '2026-05-21', status: 'Completed',
    startingLocation: 'Kochi', destination: 'Munnar', packageName: 'Munnar Tea Country Retreat',
    customerName: 'Beevi Family', groupType: 'Family',
    days: 4, travellers: 8, pricePerPerson: 11200,
    vehicleExpense: 17800, hotelExpense: 36800, foodExpense: 13200, entryFeeExpense: 5600, otherExpenses: 4100,
    notes: 'Top Station run on day 3 — clear morning.',
  },
  {
    id: 'TRP-2026-031', date: '2026-04-08', status: 'Completed',
    startingLocation: 'Bengaluru', destination: 'Coorg', packageName: 'Coorg Coffee Trails',
    customerName: 'Helix Systems India', groupType: 'Corporate',
    days: 3, travellers: 32, pricePerPerson: 10200,
    vehicleExpense: 58000, hotelExpense: 121600, foodExpense: 51200, entryFeeExpense: 16000, otherExpenses: 18400,
    notes: 'Corporate rate at 10,200 — negotiated against the 10,500 list price.',
  },
  {
    id: 'TRP-2026-029', date: '2026-03-08', status: 'Completed',
    startingLocation: 'Kozhikode', destination: 'Wayanad', packageName: 'Wayanad Wild Trails',
    customerName: 'Coimbatore Institute of Technology', groupType: 'College',
    days: 3, travellers: 58, pricePerPerson: 9400,
    vehicleExpense: 82000, hotelExpense: 191400, foodExpense: 104400, entryFeeExpense: 40600, otherExpenses: 24000,
    notes: 'Chembra permits cleared for 58. Faculty coordinator: Dr. Lakshmi Narayanan.',
  },
  {
    id: 'TRP-2026-027', date: '2026-02-21', status: 'Completed',
    startingLocation: 'Mysore', destination: 'Coorg', packageName: 'Coorg Coffee Trails',
    customerName: 'Sneha Kulkarni + 5', groupType: 'Friends',
    days: 3, travellers: 6, pricePerPerson: 10500,
    vehicleExpense: 14200, hotelExpense: 25200, foodExpense: 9600, entryFeeExpense: 3000, otherExpenses: 2800,
    notes: 'Rafting not operating in February — group informed at booking.',
  },
  {
    id: 'TRP-2026-025', date: '2026-01-17', status: 'Completed',
    startingLocation: 'Chennai', destination: 'Pondicherry', packageName: 'Pondicherry French Coast',
    customerName: 'Rahul Varma + 7', groupType: 'Friends',
    days: 3, travellers: 8, pricePerPerson: 8000,
    vehicleExpense: 15200, hotelExpense: 24800, foodExpense: 8800, entryFeeExpense: 4000, otherExpenses: 3400,
    notes: 'New-year week rate. Cycle tour rated highly in the feedback form.',
  },

  // ── 2025 ──────────────────────────────────────────────────────────────────
  {
    id: 'TRP-2025-098', date: '2025-12-29', status: 'Completed',
    startingLocation: 'Kochi', destination: 'Munnar', packageName: 'Munnar Tea Country Retreat',
    customerName: 'Fathima Beevi Group', groupType: 'Family',
    days: 4, travellers: 12, pricePerPerson: 10800,
    vehicleExpense: 24000, hotelExpense: 54000, foodExpense: 19800, entryFeeExpense: 8400, otherExpenses: 5600,
    notes: 'Peak-season week. Price held at the pre-revision 10,800 rate.',
  },
  {
    id: 'TRP-2025-094', date: '2025-11-15', status: 'Completed',
    startingLocation: 'Bengaluru', destination: 'Mysore', packageName: 'Mysore Royal Heritage',
    customerName: 'Shetty Consulting LLP', groupType: 'Corporate',
    days: 2, travellers: 22, pricePerPerson: 7100,
    vehicleExpense: 28000, hotelExpense: 61600, foodExpense: 24200, entryFeeExpense: 11000, otherExpenses: 8800,
    notes: 'Sunday departure — palace illumination included.',
  },
  {
    id: 'TRP-2025-091', date: '2025-10-24', status: 'Completed',
    startingLocation: 'Madurai', destination: 'Kodaikanal', packageName: 'Kodaikanal Serene Getaway',
    customerName: 'Ananya Desai Family', groupType: 'Family',
    days: 3, travellers: 7, pricePerPerson: 8400,
    vehicleExpense: 14800, hotelExpense: 25200, foodExpense: 9100, entryFeeExpense: 3500, otherExpenses: 2600,
    notes: 'Shola-forest walk cleared by the forest department.',
  },
  {
    id: 'TRP-2025-087', date: '2025-09-12', status: 'Completed',
    startingLocation: 'Coimbatore', destination: 'Munnar', packageName: 'South India Grand Circuit',
    customerName: 'Thomas Enterprises', groupType: 'Corporate',
    days: 8, travellers: 34, pricePerPerson: 23000,
    vehicleExpense: 178000, hotelExpense: 340000, foodExpense: 126000, entryFeeExpense: 47600, otherExpenses: 38400,
    notes: 'Two drivers on rotation. Consolidated single invoice issued.',
  },
  {
    id: 'TRP-2025-083', date: '2025-08-14', status: 'Completed',
    startingLocation: 'Mysore', destination: 'Coorg', packageName: 'Coorg Coffee Trails',
    customerName: 'Imran Sheikh Group', groupType: 'Corporate',
    days: 3, travellers: 18, pricePerPerson: 9800,
    vehicleExpense: 32000, hotelExpense: 68400, foodExpense: 28800, entryFeeExpense: 9000, otherExpenses: 9600,
    notes: 'Monsoon rafting operated on the Barapole.',
  },
  {
    id: 'TRP-2025-079', date: '2025-07-18', status: 'Completed',
    startingLocation: 'Kozhikode', destination: 'Wayanad', packageName: 'Wayanad Wild Trails',
    customerName: 'Karthik Rajan — NIT Trichy batch', groupType: 'College',
    days: 3, travellers: 46, pricePerPerson: 8900,
    vehicleExpense: 64000, hotelExpense: 151800, foodExpense: 82800, entryFeeExpense: 32200, otherExpenses: 19000,
    notes: 'Elephant herd sighting on the Muthanga safari.',
  },
  {
    id: 'TRP-2025-074', date: '2025-06-06', status: 'Completed',
    startingLocation: 'Erode', destination: 'Ooty', packageName: 'Ooty Classic Escape',
    customerName: 'Sri Vidya Mandir School', groupType: 'School',
    days: 3, travellers: 100, pricePerPerson: 8800,
    vehicleExpense: 145000, hotelExpense: 316000, foodExpense: 172000, entryFeeExpense: 60000, otherExpenses: 37000,
    notes: '92 students + 8 teachers. Three coaches, one coordinator each.',
  },
  {
    id: 'TRP-2025-068', date: '2025-04-19', status: 'Completed',
    startingLocation: 'Kochi', destination: 'Kerala Backwaters', packageName: 'Kerala Backwaters Grand',
    customerName: 'Nithya Balakrishnan Family', groupType: 'Family',
    days: 5, travellers: 10, pricePerPerson: 12800,
    vehicleExpense: 31000, hotelExpense: 54000, foodExpense: 20500, entryFeeExpense: 8000, otherExpenses: 6400,
    notes: 'Repeat customer — third booking. Sadya dinner arranged at Kovalam.',
  },
  {
    id: 'TRP-2025-062', date: '2025-02-14', status: 'Completed',
    startingLocation: 'Chennai', destination: 'Pondicherry', packageName: 'Pondicherry French Coast',
    customerName: 'Meridian Design Studio', groupType: 'Corporate',
    days: 3, travellers: 16, pricePerPerson: 7800,
    vehicleExpense: 22000, hotelExpense: 48000, foodExpense: 17600, entryFeeExpense: 8000, otherExpenses: 6800,
    notes: 'Team offsite. Auroville visit on day 2.',
  },
  {
    id: 'TRP-2025-055', date: '2025-01-11', status: 'Cancelled',
    startingLocation: 'Coimbatore', destination: 'Kodaikanal', packageName: 'Kodaikanal Serene Getaway',
    customerName: 'Anand & Friends', groupType: 'Friends',
    days: 3, travellers: 12, pricePerPerson: 8400,
    vehicleExpense: 4000, hotelExpense: 0, foodExpense: 0, entryFeeExpense: 0, otherExpenses: 1500,
    notes: 'Cancelled by the customer 6 days out. Vehicle advance forfeited; hotel advance refunded in full.',
  },

  // ── 2024 (historical rates — deliberately lower than today's list prices) ──
  {
    id: 'TRP-2024-047', date: '2024-12-10', status: 'Completed',
    startingLocation: 'Bengaluru', destination: 'Mysore', packageName: 'Mysore Royal Heritage',
    customerName: 'Gopalan Family', groupType: 'Family',
    days: 2, travellers: 8, pricePerPerson: 6600,
    vehicleExpense: 11000, hotelExpense: 20800, foodExpense: 7200, entryFeeExpense: 4000, otherExpenses: 2400,
    notes: 'Historical 2024 rate — current Mysore package sells at ₹7,400.',
  },
  {
    id: 'TRP-2024-043', date: '2024-11-02', status: 'Completed',
    startingLocation: 'Coimbatore', destination: 'Ooty', packageName: 'Ooty Classic Escape',
    customerName: 'Bharathiar University — Dept. of Commerce', groupType: 'College',
    days: 3, travellers: 40, pricePerPerson: 8500,
    vehicleExpense: 58000, hotelExpense: 128000, foodExpense: 68000, entryFeeExpense: 24000, otherExpenses: 15000,
    notes: 'Historical 2024 rate of ₹8,500 — the Ooty package now sells at ₹9,500. This trip must always report ₹8,500.',
  },
  {
    id: 'TRP-2024-039', date: '2024-10-05', status: 'Completed',
    startingLocation: 'Kochi', destination: 'Kerala Backwaters', packageName: 'Kerala Backwaters Grand',
    customerName: 'Aishwarya Nair + 3', groupType: 'Friends',
    days: 5, travellers: 4, pricePerPerson: 12000,
    vehicleExpense: 18000, hotelExpense: 21600, foodExpense: 8200, entryFeeExpense: 3200, otherExpenses: 3000,
    notes: 'Booked 4 days before departure at the 2024 rate. Ran below the 6-traveller minimum, so the trip closed at a loss — kept in the ledger deliberately.',
  },
  {
    id: 'TRP-2024-034', date: '2024-08-16', status: 'Completed',
    startingLocation: 'Kozhikode', destination: 'Wayanad', packageName: 'Wayanad Wild Trails',
    customerName: 'Govt. Higher Secondary School, Thrissur', groupType: 'School',
    days: 3, travellers: 74, pricePerPerson: 7900,
    vehicleExpense: 98000, hotelExpense: 214600, foodExpense: 118400, entryFeeExpense: 44400, otherExpenses: 26000,
    notes: 'Historical school rate. Current Wayanad package is ₹9,900.',
  },
  {
    id: 'TRP-2024-028', date: '2024-06-21', status: 'Completed',
    startingLocation: 'Coimbatore', destination: 'Ooty', packageName: 'Ooty + Kodaikanal Twin Hills',
    customerName: 'Subramanian Family', groupType: 'Family',
    days: 5, travellers: 11, pricePerPerson: 14200,
    vehicleExpense: 42000, hotelExpense: 66000, foodExpense: 24200, entryFeeExpense: 11000, otherExpenses: 7700,
    notes: 'Twin-hills combo at the 2024 rate of ₹14,200; the package is ₹15,800 today.',
  },
  {
    id: 'TRP-2024-021', date: '2024-04-12', status: 'Completed',
    startingLocation: 'Madurai', destination: 'Kodaikanal', packageName: 'Kodaikanal Serene Getaway',
    customerName: 'Thiagarajar College — Final Year', groupType: 'College',
    days: 3, travellers: 52, pricePerPerson: 7600,
    vehicleExpense: 68000, hotelExpense: 145600, foodExpense: 78000, entryFeeExpense: 26000, otherExpenses: 17000,
    notes: 'Historical 2024 college rate. Kodaikanal package is ₹8,800 today.',
  },
  {
    id: 'TRP-2024-016', date: '2024-03-02', status: 'Completed',
    startingLocation: 'Mysore', destination: 'Coorg', packageName: 'Coorg Coffee Trails',
    customerName: 'Prakash & Family', groupType: 'Family',
    days: 3, travellers: 9, pricePerPerson: 9200,
    vehicleExpense: 18000, hotelExpense: 32400, foodExpense: 13500, entryFeeExpense: 4500, otherExpenses: 3900,
    notes: 'Historical 2024 rate against a current list price of ₹10,500.',
  },
  {
    id: 'TRP-2024-009', date: '2024-02-08', status: 'Completed',
    startingLocation: 'Chennai', destination: 'Pondicherry', packageName: 'Pondicherry French Coast',
    customerName: 'Alumni Meet — MCC Batch of 2014', groupType: 'Other',
    days: 3, travellers: 24, pricePerPerson: 7200,
    vehicleExpense: 28000, hotelExpense: 62400, foodExpense: 24000, entryFeeExpense: 12000, otherExpenses: 9600,
    notes: 'Ten-year alumni reunion. Booked as "Other" group type.',
  },
]

/**
 * Historical filler.
 *
 * The hand-written ledger above carries the detail (real notes, the price-history
 * examples). This block generates the rest of the back catalogue so the admin
 * dashboard, reports and history filters behave like a twelve-year-old agency
 * rather than a demo with nine rows.
 *
 * It is fully deterministic — a small LCG with a fixed seed, no Date.now() and
 * no Math.random() — so every reload, every build and every screenshot shows
 * identical numbers. Phase 2 deletes this block entirely.
 */
const ARCHIVE_TEMPLATES = [
  { destination: 'Ooty', packageName: 'Ooty Classic Escape', days: 3, baseRate: 8200, perHead: 5900 },
  { destination: 'Kodaikanal', packageName: 'Kodaikanal Serene Getaway', days: 3, baseRate: 7400, perHead: 5300 },
  { destination: 'Munnar', packageName: 'Munnar Tea Country Retreat', days: 4, baseRate: 9600, perHead: 7000 },
  { destination: 'Coorg', packageName: 'Coorg Coffee Trails', days: 3, baseRate: 8900, perHead: 6500 },
  { destination: 'Wayanad', packageName: 'Wayanad Wild Trails', days: 3, baseRate: 7700, perHead: 5600 },
  { destination: 'Mysore', packageName: 'Mysore Royal Heritage', days: 2, baseRate: 6400, perHead: 4600 },
  { destination: 'Pondicherry', packageName: 'Pondicherry French Coast', days: 3, baseRate: 7000, perHead: 5000 },
  { destination: 'Kerala Backwaters', packageName: 'Kerala Backwaters Grand', days: 5, baseRate: 11800, perHead: 8700 },
  { destination: 'Ooty', packageName: 'Ooty + Kodaikanal Twin Hills', days: 5, baseRate: 13600, perHead: 10100 },
]

const ARCHIVE_GROUPS = [
  { groupType: 'College', size: [38, 72], label: 'College Group' },
  { groupType: 'School', size: [55, 105], label: 'School Group' },
  { groupType: 'Family', size: [5, 14], label: 'Family Booking' },
  { groupType: 'Friends', size: [6, 16], label: 'Friends Group' },
  { groupType: 'Corporate', size: [16, 40], label: 'Corporate Offsite' },
  { groupType: 'Other', size: [10, 30], label: 'Private Group' },
]

const ARCHIVE_ORIGINS = ['Coimbatore', 'Chennai', 'Madurai', 'Bengaluru', 'Kochi', 'Kozhikode', 'Salem', 'Mysore']

/** Annual price index — why a 2024 trip costs less per head than the same trip today. */
const RATE_INDEX = { 2024: 1, 2025: 1.07, 2026: 1.16 }

/** Trips generated per calendar month, indexed 0–11. Peaks in the Apr–Jun season. */
const MONTHLY_VOLUME = [2, 2, 3, 5, 6, 5, 3, 3, 2, 3, 3, 4]

function makeArchive() {
  let seed = 20130417 // agency founding date — arbitrary but fixed
  const next = (limit) => {
    seed = (seed * 1103515245 + 12345) % 2147483648
    return seed % limit
  }
  const between = ([lo, hi]) => lo + next(hi - lo + 1)

  const out = []
  for (const year of [2024, 2025, 2026]) {
    // 2026 is the current year — the ledger stops at August.
    const lastMonth = year === 2026 ? 8 : 12
    for (let month = 1; month <= lastMonth; month += 1) {
      const count = MONTHLY_VOLUME[month - 1]
      for (let n = 0; n < count; n += 1) {
        const template = ARCHIVE_TEMPLATES[next(ARCHIVE_TEMPLATES.length)]
        const group = ARCHIVE_GROUPS[next(ARCHIVE_GROUPS.length)]
        const travellers = between(group.size)
        const day = 2 + next(26)

        // Historical price: the year's index, nudged by a small per-trip discount.
        const indexed = template.baseRate * RATE_INDEX[year]
        const pricePerPerson = Math.round((indexed * (1 - next(6) / 100)) / 100) * 100

        // Costs scale with head count, with a modest fixed component per trip.
        const cost = template.perHead * RATE_INDEX[year]
        const scale = 1 - next(5) / 100
        out.push({
          id: `TRP-${year}-A${String(month).padStart(2, '0')}${n + 1}`,
          date: `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
          status: 'Completed',
          startingLocation: ARCHIVE_ORIGINS[next(ARCHIVE_ORIGINS.length)],
          destination: template.destination,
          packageName: template.packageName,
          customerName: `${group.label} — ${template.destination} ${year}`,
          groupType: group.groupType,
          days: template.days,
          travellers,
          pricePerPerson,
          vehicleExpense: Math.round((cost * 0.24 * travellers * scale) / 100) * 100,
          hotelExpense: Math.round((cost * 0.42 * travellers * scale) / 100) * 100,
          foodExpense: Math.round((cost * 0.19 * travellers * scale) / 100) * 100,
          entryFeeExpense: Math.round((cost * 0.09 * travellers * scale) / 100) * 100,
          otherExpenses: Math.round((cost * 0.06 * travellers * scale) / 100) * 100,
          notes: 'Archived record. Price shown is the rate agreed at the time of travel.',
          archived: true,
        })
      }
    }
  }
  return out
}

/** Sum the five expense fields on a trip-like object. */
export function sumExpenses(trip) {
  return EXPENSE_FIELDS.reduce((total, field) => total + (Number(trip[field.key]) || 0), 0)
}

/**
 * Derive revenue / expenses / profit from raw trip fields.
 *   totalRevenue  = travellers × pricePerPerson   ← trip's own historical price
 *   totalExpenses = sum of the five expense heads
 *   profit        = totalRevenue − totalExpenses
 */
export function deriveTripTotals(trip) {
  const totalRevenue = (Number(trip.travellers) || 0) * (Number(trip.pricePerPerson) || 0)
  const totalExpenses = sumExpenses(trip)
  const profit = totalRevenue - totalExpenses
  const margin = totalRevenue > 0 ? Math.round((profit / totalRevenue) * 1000) / 10 : 0
  return { totalRevenue, totalExpenses, profit, margin }
}

/** Trips with their computed totals attached, newest first. */
export const trips = [...raw, ...makeArchive()]
  .map((trip) => ({
    ...trip,
    ...deriveTripTotals(trip),
    year: Number(trip.date.slice(0, 4)),
    month: Number(trip.date.slice(5, 7)),
  }))
  .sort((a, b) => b.date.localeCompare(a.date))

/** The nine hand-written trips, used where richer notes read better. */
export const highlightTrips = trips.filter((t) => !t.archived)

export const getTripById = (id) => trips.find((t) => t.id === id)

export default trips
