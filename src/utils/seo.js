/** @typedef {{ title: string, description: string, canonical: string, ogUrl: string, ogTitle: string, ogDescription: string, ogImageAlt: string }} SeoPayload */

const SITE_ORIGIN = 'https://www.bbestatestay.com'
const BUSINESS_NAME = 'BB Estate Homestay'
const OG_IMAGE = `${SITE_ORIGIN}/og-bbestatestay.jpeg`

const BUSINESS_DESCRIPTION =
  'Family-run heritage homestay on a coffee estate near Madikeri—quiet rooms, home-cooked Kodagu food, and slow days among shade trees and plantation walks.'

/** Shared caption for OG / structured data (primary property image). */
const PRIMARY_IMAGE_CAPTION =
  'BB Estate Homestay—heritage estate, verandahs, and gardens in Madikeri, Coorg, Karnataka'

const LODGING_JSON_LD_ID = 'bb-estate-jsonld-lodging-business'

/** @type {Record<string, unknown>} */
const LODGING_BUSINESS_JSON_LD = {
  '@context': 'https://schema.org',
  '@type': 'LodgingBusiness',
  name: BUSINESS_NAME,
  description: BUSINESS_DESCRIPTION,
  url: `${SITE_ORIGIN}/`,
  image: [OG_IMAGE],
  telephone: '+919535661590',
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'Kadagadal, Village',
    addressLocality: 'Madikeri',
    addressRegion: 'Karnataka',
    postalCode: '571201',
    addressCountry: 'IN',
  },
  geo: {
    '@type': 'GeoCoordinates',
    latitude: 12.41211691509007,
    longitude: 75.77294562673941,
  },
  areaServed: {
    '@type': 'AdministrativeArea',
    name: 'Kodagu',
    containedInPlace: {
      '@type': 'AdministrativeArea',
      name: 'Karnataka',
      containedInPlace: {
        '@type': 'Country',
        name: 'India',
      },
    },
  },
}

const FAQ_JSON_LD_ID = 'bb-estate-jsonld-faq-page'

/** @type {Record<string, unknown>} */
const FAQ_PAGE_JSON_LD = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'Where is BB Estate Homestay located?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'BB Estate Homestay is in Kadagadal village, Madikeri, Kodagu (Coorg), Karnataka, India—on a family coffee estate in the Western Ghats hills.',
      },
    },
    {
      '@type': 'Question',
      name: 'What type of stay is BB Estate Homestay?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'It is a family-run heritage homestay on a working plantation: guest rooms in an ancestral home setting, estate walks, home-style Kodagu meals, and a quiet countryside pace.',
      },
    },
    {
      '@type': 'Question',
      name: 'How do I book a stay at BB Estate Homestay?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'On this website, pick your check-in and check-out dates, choose a room, add the stay to your cart, complete the short guest sign-in when asked, and finish with secure online payment at checkout.',
      },
    },
  ],
}

const WEBSITE_JSON_LD_ID = 'bb-estate-jsonld-website'
const IMAGE_OBJECT_JSON_LD_ID = 'bb-estate-jsonld-image-object'
const BREADCRUMB_JSON_LD_ID = 'bb-estate-jsonld-breadcrumb-list'

/** @type {Record<string, unknown>} */
const WEB_SITE_JSON_LD = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: BUSINESS_NAME,
  alternateName: 'BB Estate Stay',
  url: `${SITE_ORIGIN}/`,
  description: BUSINESS_DESCRIPTION,
  inLanguage: 'en-IN',
  publisher: {
    '@type': 'Organization',
    name: BUSINESS_NAME,
    url: `${SITE_ORIGIN}/`,
    logo: OG_IMAGE,
  },
}

/** @type {Record<string, unknown>} */
const PROPERTY_IMAGE_OBJECT_JSON_LD = {
  '@context': 'https://schema.org',
  '@type': 'ImageObject',
  url: OG_IMAGE,
  contentUrl: OG_IMAGE,
  encodingFormat: 'image/jpeg',
  name: `${BUSINESS_NAME} — primary property photograph`,
  caption: PRIMARY_IMAGE_CAPTION,
  copyrightHolder: {
    '@type': 'Organization',
    name: BUSINESS_NAME,
    url: `${SITE_ORIGIN}/`,
  },
}

/**
 * @param {{ isCart: boolean, isMyBookings: boolean }} routes
 * @returns {Record<string, unknown>}
 */
function getBreadcrumbJsonLd({ isCart, isMyBookings }) {
  if (isMyBookings) {
    return {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Home',
          item: `${SITE_ORIGIN}/`,
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: 'My bookings',
          item: `${SITE_ORIGIN}/#my-bookings`,
        },
      ],
    }
  }
  if (isCart) {
    return {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Home',
          item: `${SITE_ORIGIN}/`,
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: 'Cart & checkout',
          item: `${SITE_ORIGIN}/#cart`,
        },
      ],
    }
  }
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: BUSINESS_NAME,
        item: `${SITE_ORIGIN}/`,
      },
    ],
  }
}

/** Home: default marketing landing (path `/`, in-page hashes except `#cart`). */
const HOME = /** @type {SeoPayload} */ ({
  title: 'BB Estate Homestay | Madikeri, Coorg — Karnataka, India',
  description:
    'BB Estate Homestay in Madikeri, Coorg—heritage homestay rooms on a Karnataka coffee estate, India. Slow stays, verandahs, and warm family hospitality.',
  canonical: `${SITE_ORIGIN}/`,
  ogUrl: `${SITE_ORIGIN}/`,
  ogTitle: 'BB Estate Homestay | Madikeri, Coorg — Karnataka, India',
  ogDescription:
    'BB Estate Homestay in Madikeri, Coorg—heritage homestay rooms on a Karnataka coffee estate, India. Slow stays, verandahs, and warm family hospitality.',
  ogImageAlt: PRIMARY_IMAGE_CAPTION,
})

/** My bookings (`/#my-bookings`). */
const MY_BOOKINGS = /** @type {SeoPayload} */ ({
  title: 'My bookings | BB Estate Homestay | Madikeri',
  description:
    'View your confirmed and pending stays at BB Estate Homestay in Madikeri, Coorg—dates, payment, and booking details.',
  canonical: `${SITE_ORIGIN}/`,
  ogUrl: `${SITE_ORIGIN}/`,
  ogTitle: 'My bookings | BB Estate Homestay | Madikeri',
  ogDescription:
    'View your confirmed and pending stays at BB Estate Homestay in Madikeri, Coorg—dates, payment, and booking details.',
  ogImageAlt: 'BB Estate Homestay—your booking history',
})

/** Cart / checkout view (`/#cart`). */
const CART = /** @type {SeoPayload} */ ({
  title: 'Cart & checkout | BB Estate Homestay | Madikeri',
  description:
    'Your cart at BB Estate Homestay: confirm dates, guests, and secure payment for your Madikeri, Coorg stay. Checkout for this Karnataka, India homestay booking.',
  canonical: `${SITE_ORIGIN}/`,
  ogUrl: `${SITE_ORIGIN}/`,
  ogTitle: 'Cart & checkout | BB Estate Homestay | Madikeri',
  ogDescription:
    'Your cart at BB Estate Homestay: confirm dates, guests, and secure payment for your Madikeri, Coorg stay. Checkout for this Karnataka, India homestay booking.',
  ogImageAlt: 'BB Estate Homestay—booking checkout for your Madikeri, Coorg stay',
})

function setMetaAttribute(attrName, attrValue, content) {
  let el = document.querySelector(`meta[${attrName}="${attrValue}"]`)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attrName, attrValue)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

function setLinkCanonical(href) {
  let el = document.querySelector('link[rel="canonical"]')
  if (!el) {
    el = document.createElement('link')
    el.setAttribute('rel', 'canonical')
    document.head.appendChild(el)
  }
  el.setAttribute('href', href)
}

/**
 * One JSON-LD `<script>` in `document.head` by stable id (homepage-only callers pass `false` to remove).
 * @param {string} elementId
 * @param {Record<string, unknown>} payload
 * @param {boolean} show
 */
function syncJsonLdInHead(elementId, payload, show) {
  const existing = document.getElementById(elementId)
  if (!show) {
    existing?.remove()
    return
  }
  const serialized = JSON.stringify(payload)
  if (existing) {
    existing.textContent = serialized
    return
  }
  const script = document.createElement('script')
  script.type = 'application/ld+json'
  script.id = elementId
  script.textContent = serialized
  document.head.appendChild(script)
}

/**
 * Updates document-level SEO for the SPA route (home vs cart vs my bookings).
 * @param {{ isCart: boolean, isMyBookings?: boolean }} params
 */
export function applyRouteSeo({ isCart, isMyBookings = false }) {
  const p = isMyBookings ? MY_BOOKINGS : isCart ? CART : HOME
  const isHome = !isCart && !isMyBookings

  document.title = p.title

  setMetaAttribute('name', 'description', p.description)
  setLinkCanonical(p.canonical)

  setMetaAttribute('property', 'og:site_name', BUSINESS_NAME)
  setMetaAttribute('property', 'og:title', p.ogTitle)
  setMetaAttribute('property', 'og:description', p.ogDescription)
  setMetaAttribute('property', 'og:image', OG_IMAGE)
  setMetaAttribute('property', 'og:url', p.ogUrl)
  setMetaAttribute('property', 'og:type', 'website')

  setMetaAttribute('name', 'twitter:card', 'summary_large_image')
  setMetaAttribute('name', 'twitter:title', p.ogTitle)
  setMetaAttribute('name', 'twitter:description', p.ogDescription)
  setMetaAttribute('name', 'twitter:image', OG_IMAGE)

  setMetaAttribute('property', 'og:image:type', 'image/jpeg')
  setMetaAttribute('property', 'og:image:alt', p.ogImageAlt)

  syncJsonLdInHead(LODGING_JSON_LD_ID, LODGING_BUSINESS_JSON_LD, isHome)
  syncJsonLdInHead(FAQ_JSON_LD_ID, FAQ_PAGE_JSON_LD, isHome)
  syncJsonLdInHead(WEBSITE_JSON_LD_ID, WEB_SITE_JSON_LD, isHome)
  syncJsonLdInHead(IMAGE_OBJECT_JSON_LD_ID, PROPERTY_IMAGE_OBJECT_JSON_LD, isHome)
  syncJsonLdInHead(BREADCRUMB_JSON_LD_ID, getBreadcrumbJsonLd({ isCart, isMyBookings }), true)
}
