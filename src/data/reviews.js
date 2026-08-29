import img from './images.js'

/**
 * Customer reviews — PHASE 1 mock data.
 * Maps to Firestore `reviews/{id}` in Phase 2.
 */
export const reviews = [
  {
    id: 'rv-1041',
    name: 'Priya Raghavan',
    hometown: 'Coimbatore, Tamil Nadu',
    rating: 5,
    trip: 'Ooty Classic Escape',
    destination: 'Ooty',
    date: '2026-06-14',
    groupType: 'Family',
    avatar: img.familyBeach,
    review:
      'We travelled with my parents, both above 70, and I was worried about the pace. The coordinator rearranged day two so the climbing stops came first and the rest was easy walking. Small thing, but it made the whole trip work for us. The hotel was clean and the driver, Suresh, was patient every single time we asked to stop for photos.',
    published: true,
    featured: true,
  },
  {
    id: 'rv-1039',
    name: 'Arjun Menon',
    hometown: 'Kochi, Kerala',
    rating: 5,
    trip: 'Kerala Backwaters Grand',
    destination: 'Kerala Backwaters',
    date: '2026-05-28',
    groupType: 'Friends',
    avatar: img.friendsVan,
    review:
      'Seven of us, five days, zero arguments — which for this group is a record. The houseboat was exactly the category they promised, the food on board was genuinely good, and the sunrise canoe ride through the small canals was the best thing we did all year. Booking was over WhatsApp and the quote never changed after we paid.',
    published: true,
    featured: true,
  },
  {
    id: 'rv-1036',
    name: 'Dr. Lakshmi Narayanan',
    hometown: 'Madurai, Tamil Nadu',
    rating: 5,
    trip: 'Wayanad Wild Trails',
    destination: 'Wayanad',
    date: '2026-03-09',
    groupType: 'College',
    avatar: img.groupTrek,
    review:
      'I took 58 final-year students to Wayanad. Avengers handled the permits, the forest-department jeeps and the accommodation split without me having to chase anything. Their coordinator stayed with us for all three days. As a faculty member responsible for a large group, that support is what I was paying for and I got it.',
    published: true,
    featured: true,
  },
  {
    id: 'rv-1033',
    name: 'Sneha Kulkarni',
    hometown: 'Bengaluru, Karnataka',
    rating: 4,
    trip: 'Coorg Coffee Trails',
    destination: 'Coorg',
    date: '2026-02-22',
    groupType: 'Friends',
    avatar: img.campfire,
    review:
      'The plantation homestay was the highlight — waking up inside a coffee estate is completely different from a hotel. Abbey Falls was crowded when we reached at 11 AM, which is my only note; I would ask to go earlier next time. Food at the homestay was outstanding, especially the pandi curry.',
    published: true,
    featured: false,
  },
  {
    id: 'rv-1030',
    name: 'Rahul Varma',
    hometown: 'Chennai, Tamil Nadu',
    rating: 5,
    trip: 'Pondicherry French Coast',
    destination: 'Pondicherry',
    date: '2026-01-19',
    groupType: 'Friends',
    avatar: img.street,
    review:
      'The cycle tour of White Town was a much better idea than driving around, and the guide knew the history properly rather than reading off a card. Paradise Beach boat was well timed — we got there before the day crowd. Villa Marine is a genuinely lovely old building.',
    published: true,
    featured: true,
  },
  {
    id: 'rv-1027',
    name: 'Fathima Beevi',
    hometown: 'Kozhikode, Kerala',
    rating: 5,
    trip: 'Munnar Tea Country Retreat',
    destination: 'Munnar',
    date: '2025-12-30',
    groupType: 'Family',
    avatar: img.teaEstate,
    review:
      'Top Station at sunrise is worth the 5:30 AM start, and we would not have known to do it if the coordinator had not insisted. Eravikulam was well organised, the resort was inside a tea estate exactly as shown on the website. Everything quoted was included; we spent nothing extra except lunches.',
    published: true,
    featured: true,
  },
  {
    id: 'rv-1024',
    name: 'Vikram Shetty',
    hometown: 'Mangalore, Karnataka',
    rating: 4,
    trip: 'Mysore Royal Heritage',
    destination: 'Mysore',
    date: '2025-11-16',
    groupType: 'Corporate',
    avatar: img.monument,
    review:
      'Booked this as a short offsite for 22 people from our office. Two days is tight but they used it well — the market walk was a surprisingly good team activity. The Sunday illumination is genuinely impressive. Only feedback is that breakfast at the hotel could be better for a group that size.',
    published: true,
    featured: false,
  },
  {
    id: 'rv-1021',
    name: 'Ananya Desai',
    hometown: 'Hyderabad, Telangana',
    rating: 5,
    trip: 'Kodaikanal Serene Getaway',
    destination: 'Kodaikanal',
    date: '2025-10-25',
    groupType: 'Family',
    avatar: img.pineForest,
    review:
      'We specifically wanted a slow trip and this delivered. The shola-forest walk with the naturalist was the part my children still talk about. Coaker’s Walk at sunrise with almost nobody around was worth waking up for. Booking was straightforward and the price on the invoice matched the quote exactly.',
    published: true,
    featured: true,
  },
  {
    id: 'rv-1018',
    name: 'Joseph Thomas',
    hometown: 'Thrissur, Kerala',
    rating: 5,
    trip: 'South India Grand Circuit',
    destination: 'Munnar',
    date: '2025-09-12',
    groupType: 'Corporate',
    avatar: img.mountainRoad,
    review:
      'Eight days, 34 colleagues, four properties and roughly 1,100 km of driving. It could easily have been a mess. It was not. Two drivers on rotation was the right call, and having the same coordinator throughout meant nobody had to re-explain anything. Our finance team also appreciated getting one clean consolidated bill.',
    published: true,
    featured: false,
  },
  {
    id: 'rv-1015',
    name: 'Meera Subramanian',
    hometown: 'Salem, Tamil Nadu',
    rating: 4,
    trip: 'Ooty + Kodaikanal Twin Hills',
    destination: 'Ooty',
    date: '2025-08-30',
    groupType: 'Family',
    avatar: img.heroMist,
    review:
      'Good value for covering both hill stations. The transfer day between Ooty and Kodaikanal is long — about six hours — and I wish that had been emphasised more when we booked, though it is written in the itinerary. Everything else was smooth and both hotels were comfortable.',
    published: true,
    featured: false,
  },
  {
    id: 'rv-1012',
    name: 'Karthik Rajan',
    hometown: 'Tiruchirappalli, Tamil Nadu',
    rating: 5,
    trip: 'Wayanad Wild Trails',
    destination: 'Wayanad',
    date: '2025-07-18',
    groupType: 'College',
    avatar: img.wildlife,
    review:
      'Chembra trek and the Muthanga safari on consecutive mornings was intense in the best way. We saw a herd of elephants about 40 metres from the jeep. The campfire night with the whole batch is the memory everyone posted about. Highly recommend for college groups.',
    published: true,
    featured: true,
  },
  {
    id: 'rv-1009',
    name: 'Divya Prakash',
    hometown: 'Erode, Tamil Nadu',
    rating: 5,
    trip: 'Ooty Classic Escape',
    destination: 'Ooty',
    date: '2025-06-08',
    groupType: 'School',
    avatar: img.hillRailway,
    review:
      'Organised this for 92 school students and 8 teachers. Avengers split us across three coaches with a coordinator in each, and they had a first-aid kit and a doctor contact ready. The toy-train tickets were confirmed in advance, which I know is not easy. Parents were happy, and so was our principal.',
    published: true,
    featured: false,
  },
  {
    id: 'rv-1006',
    name: 'Nithya Balakrishnan',
    hometown: 'Puducherry',
    rating: 5,
    trip: 'Kerala Backwaters Grand',
    destination: 'Kerala Backwaters',
    date: '2025-04-21',
    groupType: 'Family',
    avatar: img.backwaters,
    review:
      'Third trip with Avengers and the reason we keep going back is that nothing gets sprung on you at the end. The sadya dinner at Kovalam was arranged properly on a banana leaf, not a token version. Kumarakom at first light was beautiful and almost empty.',
    published: true,
    featured: true,
  },
  {
    id: 'rv-1003',
    name: 'Imran Sheikh',
    hometown: 'Bengaluru, Karnataka',
    rating: 4,
    trip: 'Coorg Coffee Trails',
    destination: 'Coorg',
    date: '2025-02-14',
    groupType: 'Corporate',
    avatar: img.forestPath,
    review:
      'Solid two-night offsite for our 18-person team. The estate walk worked well as a group activity and the campfire was a good closer. Rafting was not running in February, which we knew, but it is worth planning around if that matters to your group.',
    published: true,
    featured: false,
  },
  {
    id: 'rv-1001',
    name: 'Ramesh Gopalan',
    hometown: 'Tirunelveli, Tamil Nadu',
    rating: 5,
    trip: 'Mysore Royal Heritage',
    destination: 'Mysore',
    date: '2024-12-11',
    groupType: 'Family',
    avatar: img.heritageFort,
    review:
      'Short trip, well run. Getting to the palace in the first hour after opening made an enormous difference — we walked through properly instead of shuffling in a queue. Brindavan Gardens in the evening was a good way to finish.',
    published: true,
    featured: false,
  },
  {
    id: 'rv-0998',
    name: 'Aishwarya Nair',
    hometown: 'Kollam, Kerala',
    rating: 5,
    trip: 'Munnar Tea Country Retreat',
    destination: 'Munnar',
    date: '2024-10-02',
    groupType: 'Friends',
    avatar: img.valley,
    review:
      'Booked four days before departure and they still put together a full itinerary with the plantation resort. The spice-garden visit with an actual grower explaining cardamom grading was far more interesting than I expected. Would book again without hesitating.',
    published: true,
    featured: false,
  },
]

/** Reviews chosen for the home-page carousel. */
export const featuredReviews = reviews.filter((r) => r.featured && r.published)

/** Average rating across all published reviews, to one decimal. */
export const averageRating =
  Math.round(
    (reviews.filter((r) => r.published).reduce((sum, r) => sum + r.rating, 0) /
      reviews.filter((r) => r.published).length) *
      10,
  ) / 10

export default reviews
