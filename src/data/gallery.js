import img from './images.js'

/**
 * Gallery items — PHASE 1 mock data.
 * Maps to Firestore `gallery/{id}` + Storage paths in Phase 2.
 * `category` must be one of GALLERY_CATEGORIES in data/constants.js.
 */
export const galleryItems = [
  { id: 'gl-01', src: img.greenHills, title: 'Tea slopes above Coonoor', category: 'Destinations', destination: 'Ooty', date: '2026-06-12' },
  { id: 'gl-02', src: img.groupTrek, title: 'Chembra Peak trek — CIT batch of 2026', category: 'Groups', destination: 'Wayanad', date: '2026-03-08' },
  { id: 'gl-03', src: img.teaEstate, title: 'Kanan Valley estate at first light', category: 'Destinations', destination: 'Munnar', date: '2026-05-21' },
  { id: 'gl-04', src: img.hotelRoom, title: 'Deluxe room, Nilgiri Ridge Resort', category: 'Hotels', destination: 'Ooty', date: '2026-04-02' },
  { id: 'gl-05', src: img.campfire, title: 'Campfire night at the coffee estate', category: 'Moments', destination: 'Coorg', date: '2026-02-21' },
  { id: 'gl-06', src: img.backwaters, title: 'Vembanad canals from the sundeck', category: 'Destinations', destination: 'Kerala Backwaters', date: '2026-05-27' },
  { id: 'gl-07', src: img.friendsVan, title: 'ECR drive down to Pondicherry', category: 'Trips', destination: 'Pondicherry', date: '2026-01-17' },
  { id: 'gl-08', src: img.resortPool, title: 'Pool deck, Sea Crest Beach Resort', category: 'Hotels', destination: 'Kerala Backwaters', date: '2026-05-30' },
  { id: 'gl-09', src: img.hillRailway, title: 'Nilgiri Mountain Railway, Ketti valley', category: 'Trips', destination: 'Ooty', date: '2025-06-07' },
  { id: 'gl-10', src: img.waterfall, title: 'Soochipara Falls after the first rain', category: 'Destinations', destination: 'Wayanad', date: '2025-07-16' },
  { id: 'gl-11', src: img.familyBeach, title: 'Raghavan family at Kovalam', category: 'Groups', destination: 'Kerala Backwaters', date: '2025-04-19' },
  { id: 'gl-12', src: img.monument, title: 'Amba Vilas Palace, Mysore', category: 'Destinations', destination: 'Mysore', date: '2025-11-15' },
  { id: 'gl-13', src: img.breakfastSpread, title: 'Estate breakfast in Madikeri', category: 'Moments', destination: 'Coorg', date: '2026-02-22' },
  { id: 'gl-14', src: img.cliffWalk, title: "Coaker's Walk at 6:40 AM", category: 'Destinations', destination: 'Kodaikanal', date: '2025-10-24' },
  { id: 'gl-15', src: img.busJourney, title: 'Coach one, Erode school group', category: 'Trips', destination: 'Ooty', date: '2025-06-06' },
  { id: 'gl-16', src: img.resortLawn, title: 'Lawn setup for a corporate offsite', category: 'Hotels', destination: 'Mysore', date: '2025-11-16' },
  { id: 'gl-17', src: img.boatJetty, title: 'Boarding at Alleppey jetty', category: 'Moments', destination: 'Kerala Backwaters', date: '2026-05-26' },
  { id: 'gl-18', src: img.wildlife, title: 'Muthanga safari, first jeep out', category: 'Trips', destination: 'Wayanad', date: '2025-07-18' },
  { id: 'gl-19', src: img.coastline, title: 'Promenade sunrise, Pondicherry', category: 'Destinations', destination: 'Pondicherry', date: '2026-01-18' },
  { id: 'gl-20', src: img.spiceGarden, title: 'Cardamom grading demonstration', category: 'Moments', destination: 'Munnar', date: '2026-05-23' },
  { id: 'gl-21', src: img.keralaBoat, title: 'Houseboat moored for the night', category: 'Hotels', destination: 'Kerala Backwaters', date: '2026-05-27' },
  { id: 'gl-22', src: img.viewpoint, title: 'Doddabetta before the queue', category: 'Trips', destination: 'Ooty', date: '2026-06-13' },
  { id: 'gl-23', src: img.pineForest, title: 'Kodai pine stand', category: 'Destinations', destination: 'Kodaikanal', date: '2025-10-25' },
  { id: 'gl-24', src: img.heritageFort, title: 'Srirangapatna fort walls', category: 'Destinations', destination: 'Mysore', date: '2024-12-10' },
  { id: 'gl-25', src: img.sunriseHill, title: 'Top Station above the clouds', category: 'Moments', destination: 'Munnar', date: '2025-12-29' },
  { id: 'gl-26', src: img.jungleRiver, title: 'Barapole before the rafting run', category: 'Trips', destination: 'Coorg', date: '2025-08-14' },
  { id: 'gl-27', src: img.palmGrove, title: 'Marari village walk', category: 'Moments', destination: 'Kerala Backwaters', date: '2025-04-20' },
  { id: 'gl-28', src: img.street, title: 'Rue Dumas, White Town', category: 'Destinations', destination: 'Pondicherry', date: '2026-01-19' },
]

/** All distinct categories present in the data, with counts. */
export const galleryCategoryCounts = galleryItems.reduce((acc, item) => {
  acc[item.category] = (acc[item.category] || 0) + 1
  return acc
}, {})

export default galleryItems
