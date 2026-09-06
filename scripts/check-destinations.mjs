import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { initializeApp } from 'firebase/app'
import { collection, getDocs, getFirestore, query, where } from 'firebase/firestore'

const ROOT = resolve(process.cwd())

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

const app = initializeApp({
  apiKey: env('VITE_FIREBASE_API_KEY'),
  authDomain: env('VITE_FIREBASE_AUTH_DOMAIN'),
  projectId: env('VITE_FIREBASE_PROJECT_ID'),
  storageBucket: env('VITE_FIREBASE_STORAGE_BUCKET'),
  messagingSenderId: env('VITE_FIREBASE_MESSAGING_SENDER_ID'),
  appId: env('VITE_FIREBASE_APP_ID'),
})
const db = getFirestore(app)

async function inspect() {
  const q = query(collection(db, 'destinations'), where('published', '==', true))
  const snapshot = await getDocs(q)
  console.log(`Found ${snapshot.size} published destinations in Firestore:`)
  snapshot.forEach((doc) => {
    const data = doc.data()
    console.log(`ID: ${doc.id} | Name: ${data.name} | Published: ${data.published} | Attractions count: ${Array.isArray(data.attractions) ? data.attractions.length : 'NOT_ARRAY (' + typeof data.attractions + ')'}`)
    if (Array.isArray(data.attractions)) {
      console.log(`  Attractions (${data.attractions.length}): ${data.attractions.map(a => a.name).join(', ')}`)
    }
  })
}

inspect().catch(console.error)
