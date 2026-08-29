/**
 * Central image registry.
 *
 * PHASE 1: every image below is a plain CDN photo URL — no image API client,
 * key or SDK is involved. Phase 2 can swap these strings for Firebase Storage
 * download URLs without touching a single component, because nothing outside
 * this file knows where an image lives.
 *
 * `SmartImage` renders a branded gradient placeholder whenever a URL fails to
 * load, so the UI never shows a broken-image icon.
 */

const CDN = 'https://images.unsplash.com/photo-'

/** Photo ids, named by what they depict. */
const PHOTO_IDS = {
  heroValley: '1506905925346-21bda4d32df4',
  heroForest: '1441974231531-c6227db76b6e',
  heroMist: '1470071459604-3b5ec3a7fe05',
  heroLake: '1501785888041-af3ef285b470',
  sunbeam: '1469474968028-56623f02e42e',
  greenHills: '1472214103451-9374bd1c798e',
  forestPath: '1447752875215-b2761acb3c5d',
  valley: '1426604966848-d7adac402bff',
  roadTrip: '1454391304352-2bf4678b1a7a',
  peaks: '1493246507139-91e8fad9978e',
  nightSky: '1519681393784-d120267933ba',
  beach: '1507525428034-b723cf961d3e',
  coastline: '1505228395891-9a51e7e86bf6',
  mountainRoad: '1476514525535-07fb3b4ae5f1',
  monument: '1524492412937-b28074a5d7da',
  backwaters: '1596176530529-78163a4f7af2',
  teaEstate: '1602216056096-3b40cc0c9944',
  keralaBoat: '1590050752117-238cb0fb12b1',
  temple: '1544550581-5f7ceaf7f992',
  street: '1587474260584-136574528ed5',
  waterfall: '1512343879784-a960bf40e7f2',
  resortPool: '1544735716-392fe2489ffa',
  hotelRoom: '1517824806704-9040b037703b',
  campfire: '1571536802807-30451e3955d8',
  boatJetty: '1593693411515-c20261bcad6e',
  spiceGarden: '1609920658906-8223bd289001',
  hillTown: '1585506942812-e72b29cef752',
  lakeBoats: '1558431382-27e303142255',
  canyon: '1464822759023-fed622ff2c3b',
  pineForest: '1533587851505-d119e13fa0d7',
  sunsetRidge: '1526772662000-3f88f10405ff',
  cliffWalk: '1516426122078-c23e76319801',
  groupTrek: '1502920917128-1aa500764cbd',
  friendsVan: '1528181304800-259b08848526',
  familyBeach: '1533105079780-92b9be482077',
  busJourney: '1518684079-3c830dcef090',
  meadow: '1483347756197-71ef80e95f73',
  sunriseHill: '1548013146-72479768bada',
  starTrail: '1477587458883-47145ed94245',
  aerialCoast: '1477601263568-180e2c6d046e',
  jungleRiver: '1523395243481-163f8f6155ab',
  heritageFort: '1566073771259-6a8506099945',
  lakeSunset: '1542314831-068cd1dbfeeb',
  palmGrove: '1571003123894-1f0594d2b5d9',
  ridgeWalk: '1445019980597-93fa8acb246c',
  resortLawn: '1560347876-aeef00ee58a1',
  breakfastSpread: '1578683010236-d716f9a3f461',
  viewpoint: '1540541338287-41700207dee6',
  hillRailway: '1583417319070-4a69db38a482',
  wildlife: '1449824913935-59a10b8d2000',
}

const DEFAULT_WIDTH = 1200

/** Build a sized URL for a registry key. Falls back to the key itself if it is already a URL. */
export function imageUrl(key, width = DEFAULT_WIDTH) {
  if (!key) return ''
  if (key.startsWith('http') || key.startsWith('/') || key.startsWith('data:')) return key
  const id = PHOTO_IDS[key]
  if (!id) return ''
  return `${CDN}${id}?auto=format&fit=crop&w=${width}&q=72`
}

/** `img.teaEstate` → a ready-to-use 1200px wide URL. */
export const img = Object.fromEntries(
  Object.keys(PHOTO_IDS).map((key) => [key, imageUrl(key)]),
)

/** Every registry key — used by the admin image-picker UI. */
export const imageKeys = Object.keys(PHOTO_IDS)

export default img
