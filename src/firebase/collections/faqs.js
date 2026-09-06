import { addDoc, collection, getDocs, query, serverTimestamp } from 'firebase/firestore'
import {
  deleteDocById,
  pruneUndefined,
  subscribeCollection,
  updateDocFields,
} from '../firestore'
import { db } from '../config'
import { useSubscription } from '../hooks'

/**
 * `faqs` collection service.
 *
 * Documents:
 *   question, answer, order, isActive, createdAt, updatedAt
 */

const COLLECTION = 'faqs'

const SEED_FAQS = [
  {
    question: 'What destinations do Avengers Holidays offer?',
    answer: 'We organize group and customized trips across popular destinations in South India, including hill stations, beaches, backwaters, heritage destinations, and other travel locations.',
  },
  {
    question: 'Do you provide customized tour packages?',
    answer: 'Yes. We can customize the destination, duration, itinerary, accommodation, transportation, activities, and group requirements based on your travel plans.',
  },
  {
    question: 'Do you provide transportation for group trips?',
    answer: 'Yes. We arrange comfortable transportation based on your group size and trip requirements, including options suitable for colleges, schools, families, friends, and corporate groups.',
  },
  {
    question: 'Can colleges and schools book educational trips?',
    answer: 'Yes. We organize college and school trips with group-oriented planning, transportation, itinerary coordination, safety considerations, and requirements for teachers or coordinators.',
  },
  {
    question: 'Do you organize family and friends trips?',
    answer: 'Yes. We plan family and friends trips with flexible itineraries designed around group size, preferred destinations, travel pace, activities, and budget.',
  },
  {
    question: 'Do you organize corporate trips?',
    answer: 'Yes. We arrange corporate outings, team trips, offsites, and group travel with transportation, itinerary planning, activities, and other required arrangements.',
  },
  {
    question: 'How can I book a trip with Avengers Holidays?',
    answer: 'You can contact us through the Plan Your Trip option, Contact Us, WhatsApp, or the available enquiry form. Share your destination, travel dates, group size, and requirements, and our team can help plan your trip.',
  },
  {
    question: 'How far in advance should I book my trip?',
    answer: 'We recommend booking as early as possible, especially for large groups, peak travel seasons, school or college trips, and popular destinations, so transportation and accommodation can be arranged smoothly.',
  },
  {
    question: 'Can you plan trips for large groups?',
    answer: 'Yes. We handle different group sizes and can customize transportation, accommodation, food, activities, and itineraries according to the group\'s requirements.',
  },
  {
    question: 'Can the itinerary be changed after booking?',
    answer: 'Yes, itinerary changes can be discussed with our team. Changes may depend on availability, travel dates, accommodation, transportation, and the specific requirements of the trip.',
  },
  {
    question: 'Do you provide accommodation as part of the trip?',
    answer: 'Accommodation can be included depending on the selected package and your requirements. Options can be planned according to group size, destination, budget, and availability.',
  },
  {
    question: 'Do you provide food during the trip?',
    answer: 'Food arrangements can be included or customized depending on the trip package and group requirements. Specific meal preferences can be discussed during trip planning.',
  },
  {
    question: 'Do you offer affordable travel packages?',
    answer: 'Yes. We can create travel plans according to different group sizes and budgets while considering transportation, accommodation, activities, and itinerary requirements.',
  },
  {
    question: 'Can I contact Avengers Holidays through WhatsApp?',
    answer: 'Yes. You can use the WhatsApp option available on the website to contact our team and discuss your travel requirements.',
  },
  {
    question: 'What information do I need to provide for a trip enquiry?',
    answer: 'Please provide your preferred destination, travel dates, approximate group size, trip type, duration, and any special requirements. This helps us prepare a suitable travel plan for you.',
  },
  {
    question: 'Do you arrange trips for different types of groups?',
    answer: 'Yes. We organize trips for college groups, school groups, families, friends, corporate groups, and other group travel requirements.',
  },
  {
    question: 'Can I request a trip for a destination that is not listed on the website?',
    answer: 'Yes. Contact our team with your preferred destination and requirements. We can check the feasibility and create a suitable travel plan.',
  },
  {
    question: 'How can I get a quotation for my trip?',
    answer: 'Submit your trip requirements through the enquiry or contact options on the website. Our team can review your requirements and provide a suitable quotation.',
  },
]

export { SEED_FAQS }

function byOrder(list) {
  return [...list].sort((a, b) => (a.order ?? 999999) - (b.order ?? 999999))
}

/** All FAQs — admin screen. No server-side filters. */
export function subscribeFaqs() {
  return (onData, onError) =>
    subscribeCollection(COLLECTION, { onData: (list) => onData(byOrder(list)), onError })
}

/** Create or update a FAQ. Auto-ID on create. */
export async function saveFaq(next, existing = null) {
  const clean = pruneUndefined({ ...next })

  if (existing) {
    const { id: ignoredId, ...fields } = clean
    void ignoredId
    try {
      await updateDocFields(COLLECTION, existing.id, fields)
    } catch (error) {
      throw Object.assign(new Error('Could not update the FAQ.'), { cause: error })
    }
    return existing.id
  }

  const payload = {
    ...clean,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  }
  try {
    const reference = await addDoc(collection(db, COLLECTION), payload)
    return reference.id
  } catch (error) {
    throw Object.assign(new Error('Could not save the FAQ.'), { cause: error })
  }
}

/** Partial update. */
export async function updateFaqFields(id, fields) {
  try {
    await updateDocFields(COLLECTION, id, fields)
  } catch (error) {
    throw Object.assign(new Error('Could not update the FAQ.'), { cause: error })
  }
}

/** Delete a FAQ. */
export async function deleteFaq(id) {
  try {
    await deleteDocById(COLLECTION, id)
  } catch (error) {
    throw Object.assign(new Error('Could not delete the FAQ.'), { cause: error })
  }
}

/**
 * Seed the default FAQs. Skips any question that already exists.
 * Returns the number of records inserted.
 */
export async function seedFaqs() {
  try {
    const existing = await getDocs(query(collection(db, COLLECTION)))
    const existingQuestions = new Set(existing.docs.map((d) => d.data().question))

    let inserted = 0
    for (let i = 0; i < SEED_FAQS.length; i++) {
      const item = SEED_FAQS[i]
      if (existingQuestions.has(item.question)) continue

      await addDoc(collection(db, COLLECTION), {
        ...item,
        order: i + 1,
        isActive: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })
      inserted++
    }
    console.log(`[FAQ] Seeded ${inserted} of ${SEED_FAQS.length} default FAQs`)
    return inserted
  } catch (error) {
    console.error('[FAQ] Seed failed:', error.code ?? error.message, error)
    throw Object.assign(new Error('Could not seed FAQs.'), { cause: error })
  }
}

/* ── React hooks ─────────────────────────────────────────────────────────── */

export function useFaqs() {
  return useSubscription(subscribeFaqs())
}
