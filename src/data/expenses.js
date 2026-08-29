/**
 * Standalone expense records — PHASE 1 mock data.
 *
 * These are line-item expenses booked against a trip. They sit alongside the
 * rolled-up expense heads stored on the trip itself (see data/trips.js): the
 * trip totals are what the P&L uses, while these records are the paper trail.
 *
 * Maps to Firestore `expenses/{id}` in Phase 2.
 */
export const expenses = [
  { id: 'EXP-2026-0891', date: '2026-08-22', tripId: 'TRP-2026-039', category: 'Vehicle', vendor: 'Ganesh Travels, Kochi', amount: 52000, paidBy: 'Company Account', mode: 'Bank Transfer', note: '2 Tempo Travellers, 4 days including driver bata' },
  { id: 'EXP-2026-0890', date: '2026-08-22', tripId: 'TRP-2026-039', category: 'Hotel', vendor: 'Kanan Valley Plantation Resort', amount: 128800, paidBy: 'Company Account', mode: 'Bank Transfer', note: '14 rooms × 3 nights, MAP plan' },
  { id: 'EXP-2026-0889', date: '2026-08-23', tripId: 'TRP-2026-039', category: 'Food', vendor: 'Assorted — on trip', amount: 46200, paidBy: 'Coordinator Advance', mode: 'Cash', note: 'Lunches on days 1–3 plus trail snacks' },
  { id: 'EXP-2026-0888', date: '2026-08-23', tripId: 'TRP-2026-039', category: 'Entry Fees', vendor: 'Eravikulam National Park', amount: 19600, paidBy: 'Coordinator Advance', mode: 'UPI', note: '28 tickets plus shuttle charges' },
  { id: 'EXP-2026-0887', date: '2026-08-21', tripId: 'TRP-2026-039', category: 'Miscellaneous', vendor: 'Resort A/V hire', amount: 14500, paidBy: 'Company Account', mode: 'UPI', note: 'Projector and conference room for the workshop block' },

  { id: 'EXP-2026-0879', date: '2026-07-11', tripId: 'TRP-2026-037', category: 'Vehicle', vendor: 'Kovai Coach Services', amount: 132000, paidBy: 'Company Account', mode: 'Bank Transfer', note: '3 × 32-seat coaches, 3 days' },
  { id: 'EXP-2026-0878', date: '2026-07-11', tripId: 'TRP-2026-037', category: 'Hotel', vendor: 'Nilgiri Ridge Resort', amount: 290400, paidBy: 'Company Account', mode: 'Cheque', note: '30 rooms × 2 nights, school group rate' },
  { id: 'EXP-2026-0877', date: '2026-07-12', tripId: 'TRP-2026-037', category: 'Food', vendor: 'Annapoorna Caterers', amount: 158000, paidBy: 'Company Account', mode: 'Bank Transfer', note: 'All meals for 96, strictly vegetarian' },
  { id: 'EXP-2026-0876', date: '2026-07-12', tripId: 'TRP-2026-037', category: 'Entry Fees', vendor: 'TN Horticulture Dept.', amount: 52800, paidBy: 'Coordinator Advance', mode: 'Cash', note: 'Botanical Gardens, Rose Garden, Doddabetta' },
  { id: 'EXP-2026-0875', date: '2026-07-13', tripId: 'TRP-2026-037', category: 'Permits', vendor: 'Nilgiri Mountain Railway', amount: 21000, paidBy: 'Company Account', mode: 'UPI', note: 'Toy-train block booking, Coonoor–Ketti' },
  { id: 'EXP-2026-0874', date: '2026-07-13', tripId: 'TRP-2026-037', category: 'Miscellaneous', vendor: 'St. John Ambulance', amount: 12000, paidBy: 'Company Account', mode: 'Bank Transfer', note: 'Standby nurse for the school group' },

  { id: 'EXP-2026-0862', date: '2026-06-12', tripId: 'TRP-2026-035', category: 'Vehicle', vendor: 'Suresh — Innova Crysta', amount: 13500, paidBy: 'Company Account', mode: 'UPI', note: '3 days including bata and fuel' },
  { id: 'EXP-2026-0861', date: '2026-06-12', tripId: 'TRP-2026-035', category: 'Hotel', vendor: 'Nilgiri Ridge Resort', amount: 21000, paidBy: 'Company Account', mode: 'UPI', note: '3 rooms × 2 nights' },
  { id: 'EXP-2026-0860', date: '2026-06-13', tripId: 'TRP-2026-035', category: 'Food', vendor: 'Assorted — on trip', amount: 8400, paidBy: 'Coordinator Advance', mode: 'Cash', note: 'Lunches and evening tea' },
  { id: 'EXP-2026-0859', date: '2026-06-13', tripId: 'TRP-2026-035', category: 'Entry Fees', vendor: 'TN Horticulture Dept.', amount: 3600, paidBy: 'Coordinator Advance', mode: 'Cash', note: 'Gardens and Doddabetta for 6' },

  { id: 'EXP-2026-0844', date: '2026-05-26', tripId: 'TRP-2026-034', category: 'Hotel', vendor: 'Alleppey Houseboat Owners Assn.', amount: 22500, paidBy: 'Company Account', mode: 'Bank Transfer', note: 'Deluxe houseboat, 4 bedrooms, 1 night' },
  { id: 'EXP-2026-0843', date: '2026-05-26', tripId: 'TRP-2026-034', category: 'Hotel', vendor: 'Sea Crest Beach Resort', amount: 17000, paidBy: 'Company Account', mode: 'Bank Transfer', note: '4 rooms × 2 nights, Kovalam' },
  { id: 'EXP-2026-0842', date: '2026-05-27', tripId: 'TRP-2026-034', category: 'Vehicle', vendor: 'Ganesh Travels, Kochi', amount: 24000, paidBy: 'Company Account', mode: 'UPI', note: 'Innova, 5 days, Kochi to Trivandrum' },
  { id: 'EXP-2026-0841', date: '2026-05-28', tripId: 'TRP-2026-034', category: 'Guide', vendor: 'Fort Kochi Heritage Walks', amount: 4900, paidBy: 'Coordinator Advance', mode: 'UPI', note: 'Kathakali tickets and the heritage walk guide' },

  { id: 'EXP-2026-0821', date: '2026-04-08', tripId: 'TRP-2026-031', category: 'Vehicle', vendor: 'Kodagu Cabs', amount: 58000, paidBy: 'Company Account', mode: 'Bank Transfer', note: '2 Tempo Travellers from Bengaluru' },
  { id: 'EXP-2026-0820', date: '2026-04-08', tripId: 'TRP-2026-031', category: 'Hotel', vendor: 'Kodagu Estate Homestay', amount: 121600, paidBy: 'Company Account', mode: 'Bank Transfer', note: '16 cottages × 2 nights, all meals' },
  { id: 'EXP-2026-0819', date: '2026-04-09', tripId: 'TRP-2026-031', category: 'Entry Fees', vendor: 'Dubare Elephant Camp', amount: 16000, paidBy: 'Coordinator Advance', mode: 'Cash', note: '32 entries plus coracle crossing' },

  { id: 'EXP-2026-0803', date: '2026-03-08', tripId: 'TRP-2026-029', category: 'Permits', vendor: 'Kerala Forest Dept. — Chembra', amount: 24000, paidBy: 'Company Account', mode: 'Bank Transfer', note: 'Trek permits for 58 plus 4 guides' },
  { id: 'EXP-2026-0802', date: '2026-03-08', tripId: 'TRP-2026-029', category: 'Entry Fees', vendor: 'Muthanga Wildlife Sanctuary', amount: 16600, paidBy: 'Coordinator Advance', mode: 'UPI', note: '10 safari jeeps at dawn' },
  { id: 'EXP-2026-0801', date: '2026-03-09', tripId: 'TRP-2026-029', category: 'Hotel', vendor: 'Rainforest Edge Resort', amount: 191400, paidBy: 'Company Account', mode: 'Cheque', note: '20 cottages × 2 nights, triple sharing' },
  { id: 'EXP-2026-0800', date: '2026-03-09', tripId: 'TRP-2026-029', category: 'Food', vendor: 'Rainforest Edge Resort', amount: 104400, paidBy: 'Company Account', mode: 'Cheque', note: 'All meals for 58 plus packed trail lunch' },
]

export const getExpenseById = (id) => expenses.find((e) => e.id === id)

/** All expense records booked against one trip. */
export const getExpensesByTrip = (tripId) => expenses.filter((e) => e.tripId === tripId)

export default expenses
