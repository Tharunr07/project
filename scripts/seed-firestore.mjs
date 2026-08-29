#!/usr/bin/env node
/**
 * Avengers Holidays — one-time Firestore seeder (PHASE 2A).
 *
 * Pushes the Phase 1 mock data into Firestore so the real database starts
 * life identical to what was tested. Uses ONLY the Firebase Web SDK — no
 * Admin SDK, no service accounts.
 *
 *   npm run seed              → seed every empty collection
 *   npm run seed -- --check   → connection test only (read-only)
 *   npm run seed -- --force   → overwrite even non-empty collections
 *                               (fixed doc ids ⇒ still no duplicates)
 *   npm run seed -- --only=packages,destinations
 *
 * Duplicate protection: every document is written with its existing
 * human-readable id (TRP-2026-041, ooty-classic-3d, …), so re-running can
 * only overwrite — never duplicate. Collections that already contain data
 * abort the run unless --force is given.
 *
 * Remove or ignore this script once real data entry begins (see STEP 24).
 */

import { existsSync, readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { initializeApp } from 'firebase/app'
import { collection, doc, getDocs, getFirestore, limit, query, writeBatch } from 'firebase/firestore'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')

/** Dynamic-import helper that is safe on Windows absolute paths. */
async function importFromSrc(relativePath) {
  return import(pathToFileURL(resolve(ROOT, 'src', relativePath)).href)
}

/* ── env loading (.env.local is NOT auto-read by plain Node) ─────────────── */

function loadEnvFile(path) {
  if (!existsSync(path)) return {}
  const vars = {}
  for (const line of readFileSync(path, 'utf8').split(/\r?\n/)) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const equals = trimmed.indexOf('=')
    if (equals === -1) continue
    const key = trimmed.slice(0, equals).trim()
    let value = trimmed.slice(equals + 1).trim()
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1)
    }
    vars[key] = value
  }
  return vars
}

const FILE_VARS = loadEnvFile(resolve(ROOT, '.env.local'))
const env = (key) => process.env[key] ?? FILE_VARS[key]

const REQUIRED_KEYS = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_STORAGE_BUCKET',
  'VITE_FIREBASE_MESSAGING_SENDER_ID',
  'VITE_FIREBASE_APP_ID',
]

for (const key of REQUIRED_KEYS) {
  if (!env(key)) {
    console.error(`✗ Missing ${key}. Add it to .env.local (copy .env.example) or export it.`)
    process.exit(1)
  }
}

/* ── Phase 1 mock data (plain ESM — Node-importable) ─────────────────────── */

const packagesModule = await importFromSrc('data/packages.js')
const destinationsModule = await importFromSrc('data/destinations.js')
const reviewsModule = await importFromSrc('data/reviews.js')
const galleryModule = await importFromSrc('data/gallery.js')
const companyModule = await importFromSrc('data/company.js')
const tripsModule = await importFromSrc('data/trips.js')
const expensesModule = await importFromSrc('data/expenses.js')
const billsModule = await importFromSrc('data/bills.js')
const enquiriesModule = await importFromSrc('data/enquiries.js')

/** Derived fields are recomputed by the app (STEP 21) — never stored twice. */
function stripDerived(trip) {
  const { totalRevenue, totalExpenses, profit, margin, year, month, ...raw } = trip
  void totalRevenue
  void totalExpenses
  void profit
  void margin
  void year
  void month
  return raw
}

/** Bills keep their "/"-style number as a field; the doc id is path-safe. */
function toBillDoc(bill) {
  const { id, ...rest } = bill
  return { id: id.replaceAll('/', '-'), payload: { ...rest, billNumber: id } }
}

function withoutId(item, extra = {}) {
  const { id, ...rest } = item
  void id
  return { ...rest, ...extra }
}

const TARGETS = [
  { name: 'packages', docs: packagesModule.packages.map((item, index) => ({ id: item.id, payload: withoutId(item, { sortOrder: index }) })) },
  { name: 'destinations', docs: destinationsModule.destinations.map((item, index) => ({ id: item.id, payload: withoutId(item, { sortOrder: index }) })) },
  { name: 'reviews', docs: reviewsModule.reviews.map((item, index) => ({ id: item.id, payload: withoutId(item, { sortOrder: index }) })) },
  { name: 'gallery', docs: galleryModule.galleryItems.map((item, index) => ({ id: item.id, payload: withoutId(item, { sortOrder: index, published: true }) })) },
  { name: 'company', docs: [{ id: 'profile', payload: { ...companyModule.company } }] },
  { name: 'trips', docs: tripsModule.trips.map((trip) => ({ id: trip.id, payload: withoutId(stripDerived(trip)) })) },
  { name: 'expenses', docs: expensesModule.expenses.map((item) => ({ id: item.id, payload: withoutId(item) })) },
  { name: 'bills', docs: billsModule.bills.map((bill) => toBillDoc(bill)) },
  { name: 'enquiries', docs: enquiriesModule.enquiries.map((item) => ({ id: item.id, payload: withoutId(item, { referenceNumber: item.id }) })) },
]

/* ── CLI flags ───────────────────────────────────────────────────────────── */

const args = process.argv.slice(2)
const CHECK_ONLY = args.includes('--check')
const FORCE = args.includes('--force')
const ONLY_FLAG = args.find((arg) => arg.startsWith('--only='))
const ONLY = ONLY_FLAG ? ONLY_FLAG.split('=')[1].split(',').map((s) => s.trim()) : null

const selected = ONLY ? TARGETS.filter((target) => ONLY.includes(target.name)) : TARGETS
if (ONLY && selected.length !== ONLY.length) {
  console.error(`✗ Unknown --only collection(s): ${ONLY.join(', ')}`)
  process.exit(1)
}

/* ── connect ─────────────────────────────────────────────────────────────── */

const app = initializeApp({
  apiKey: env('VITE_FIREBASE_API_KEY'),
  authDomain: env('VITE_FIREBASE_AUTH_DOMAIN'),
  projectId: env('VITE_FIREBASE_PROJECT_ID'),
  storageBucket: env('VITE_FIREBASE_STORAGE_BUCKET'),
  messagingSenderId: env('VITE_FIREBASE_MESSAGING_SENDER_ID'),
  appId: env('VITE_FIREBASE_APP_ID'),
})
const db = getFirestore(app)

function describe(error) {
  if (error?.code === 'permission-denied') {
    return 'permission-denied — create the Firestore database (Native mode) in test mode from the Firebase Console first.'
  }
  if (error?.code === 'unavailable' || /network|fetch/i.test(String(error))) {
    return 'cannot reach Firestore — check your internet connection.'
  }
  return error?.message ?? String(error)
}

async function ping() {
  try {
    await getDocs(query(collection(db, 'packages'), limit(1)))
    console.log(`✔ Connection OK — project "${env('VITE_FIREBASE_PROJECT_ID')}" is reachable.`)
    return true
  } catch (error) {
    console.error(`✗ Connection failed: ${describe(error)}`)
    return false
  }
}

if (CHECK_ONLY) {
  const ok = await ping()
  process.exit(ok ? 0 : 1)
}

console.log(`Seeding ${selected.length} collection(s) into project ${env('VITE_FIREBASE_PROJECT_ID')}…`)
if (!(await ping())) process.exit(1)

/* ── duplicate guard + batched writes ────────────────────────────────────── */

let totalWritten = 0
const skipped = []

for (const target of selected) {
  const reference = collection(db, target.name)
  const existing = await getDocs(query(reference, limit(1)))

  if (existing.size > 0 && !FORCE) {
    skipped.push(target.name)
    continue
  }

  // setDoc with fixed ids overwrites in place — reruns never duplicate.
  for (let start = 0; start < target.docs.length; start += 400) {
    const chunk = target.docs.slice(start, start + 400)
    const batch = writeBatch(db)
    for (const { id, payload } of chunk) batch.set(doc(db, target.name, id), payload)
    await batch.commit()
  }
  totalWritten += target.docs.length
  console.log(`  ✔ ${target.name.padEnd(12)} ${String(target.docs.length).padStart(4)} documents`)
}

if (skipped.length > 0) {
  console.log(`\n⚠ Skipped non-empty collection(s): ${skipped.join(', ')}`)
  console.log('  Run again with --force to overwrite them (ids are stable — no duplicates).')
}

console.log(`\nDone — ${totalWritten} documents written.`)
console.log('\nNext steps:')
console.log('  • users/ is NOT seeded — create your 4 admin/staff auth users in the Firebase')
console.log('    Console, then add matching users/{uid} docs: { email, name, role, active }.')
console.log('  • Delete this seeder before going live.')
process.exit(0)
