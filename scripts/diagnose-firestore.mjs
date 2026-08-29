#!/usr/bin/env node
/**
 * TEMPORARY diagnostic — reproduces the admin portal's Firestore reads
 * against the LIVE project, both as a signed-in admin and as ANONYMOUS:
 *
 *   ADMIN   : unconstrained lists of packages/destinations  (admin pages)
 *   ADMIN   : single-document get                           (detail/edit)
 *   PUBLIC  : where('published','==',true) queries          (customer pages)
 *   PUBLIC  : unconstrained list attempt                    (must be DENIED)
 *
 * Usage:  node scripts/diagnose-firestore.mjs <email> <password>
 * DELETE after diagnosis. Imported by nothing.
 */

import { existsSync, readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { initializeApp } from 'firebase/app'
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth'
import { collection, doc, getDoc, getDocs, getFirestore, query, where } from 'firebase/firestore'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const FILE_VARS = (() => {
  if (!existsSync(resolve(ROOT, '.env.local'))) return {}
  const vars = {}
  for (const line of readFileSync(resolve(ROOT, '.env.local'), 'utf8').split(/\r?\n/)) {
    const eq = line.indexOf('=')
    if (eq > 0 && !line.trim().startsWith('#')) vars[line.slice(0, eq).trim()] = line.slice(eq + 1).trim()
  }
  return vars
})()
const env = (k) => process.env[k] ?? FILE_VARS[k]

const [email, password] = process.argv.slice(2)
if (!email || !password) {
  console.error('Usage: node scripts/diagnose-firestore.mjs <email> <password>')
  process.exit(1)
}

const config = {
  apiKey: env('VITE_FIREBASE_API_KEY'),
  authDomain: env('VITE_FIREBASE_AUTH_DOMAIN'),
  projectId: env('VITE_FIREBASE_PROJECT_ID'),
  storageBucket: env('VITE_FIREBASE_STORAGE_BUCKET'),
  messagingSenderId: env('VITE_FIREBASE_MESSAGING_SENDER_ID'),
  appId: env('VITE_FIREBASE_APP_ID'),
}

/* ── signed-in admin context ──────────────────────────────────────────────── */
const app = initializeApp(config, 'admin')
const db = getFirestore(app)

console.log(`Project: ${env('VITE_FIREBASE_PROJECT_ID')}`)

let uid = null
try {
  const credential = await signInWithEmailAndPassword(getAuth(app), email, password)
  uid = credential.user.uid
  console.log(`AUTH     ✔ signed in as ${email} (uid=${uid})`)
} catch (error) {
  console.log(`AUTH     ✗ ${error.code} — cannot proceed as admin`)
}

async function probe(label, q) {
  try {
    const snapshot = await getDocs(q)
    console.log(`${label.padEnd(42)} ✔ ${snapshot.size} docs`)
    return snapshot.size
  } catch (error) {
    console.log(`${label.padEnd(42)} ✗ ${error.code}`)
    return -1
  }
}

async function probeGet(label, ref) {
  try {
    const snapshot = await getDoc(ref)
    console.log(`${label.padEnd(42)} ✔ exists=${snapshot.exists()}`)
    return snapshot.exists() ? 1 : 0
  } catch (error) {
    console.log(`${label.padEnd(42)} ✗ ${error.code}`)
    return -1
  }
}

if (uid) {
  try {
    const snap = await getDoc(doc(db, 'users', uid))
    console.log(`USERS    ✔ users/${uid} → role=${JSON.stringify(snap.data()?.role)} active=${JSON.stringify(snap.data()?.active)}`)
  } catch (error) {
    console.log(`USERS    ✗ ${error.code}`)
  }

  console.log('—'.repeat(66))
  console.log('ADMIN CONTEXT (what the admin pages run):')
  await probe('list /packages (unconstrained)', collection(db, 'packages'))
  await probe('list /destinations (unconstrained)', collection(db, 'destinations'))
  await probeGet('get /packages/ooty-classic-3d', doc(db, 'packages', 'ooty-classic-3d'))
  await probe('list /trips (operations check)', collection(db, 'trips'))
}

/* ── anonymous public context ─────────────────────────────────────────────── */
const anonApp = initializeApp(config, 'anon')
const anonDb = getFirestore(anonApp)

console.log('—'.repeat(66))
console.log('PUBLIC CONTEXT (what customer pages run):')
await probe('query /packages published==true', query(collection(anonDb, 'packages'), where('published', '==', true)))
await probe('query /destinations published==true', query(collection(anonDb, 'destinations'), where('published', '==', true)))
await probe('DENIED-CHECK list /packages all (anon)', collection(anonDb, 'packages'))
await probe('DENIED-CHECK list /trips (anon)', collection(anonDb, 'trips'))

process.exit(0)
