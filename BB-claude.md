# BB Estate Stay — Website Design Document
### *An Estate Homestay in the Heart of Kodagu*

---

## Design Philosophy

BB Estate Stay is not a hotel. It is a home — one that sits inside a living, breathing coffee and pepper estate in the misty hills of Kodagu. Every design decision must reflect that difference. The website should feel like you are receiving a letter from an old family bungalow: warm ink on thick paper, the smell of cardamom, views half-hidden by morning fog.

The design language is **"Colonial Estate Warmth"** — drawing from the aesthetic of British-era Kodagu planter bungalows: dark teak wood, brass lanterns, hand-pressed linen, botanical illustrations, aged paper with soft grain. It is refined but never cold. Elegant but never sterile. It whispers history, family, and quiet luxury.

**The one thing a visitor will remember:** A website that feels like stepping through a wooden gate into a shaded estate bungalow — not like browsing a booking platform.

---

## Typography

### Heading Font — `Cormorant Garamond`
- **Source:** Google Fonts (`weights: 300, 400, 500, 600`)
- **Why:** Cormorant Garamond has extraordinary contrast between thick and hairline strokes — it evokes old-world letterpress printing, estate signage, and hand-engraved invitations. Nothing about it feels digital or generic. It carries gravitas without being stuffy.
- **Usage:** All section headings, the logo wordmark, pull-quotes, large hero text
- **Style treatment:** Mostly set in light weight (300) at large sizes for elegance; medium weight (500) for subheadings. Letter-spacing: `0.04em` on headings, `0.12em` on all-caps labels.

### Body Font — `Jost`
- **Source:** Google Fonts (`weights: 300, 400`)
- **Why:** Jost is a geometric humanist sans-serif with warmth in its curves. Unlike Inter or Roboto it has personality — slightly narrower, more European in feel, excellent readability at small sizes. It pairs with Cormorant Garamond like a handwritten address on a typed letter.
- **Usage:** All body copy, captions, navigation, button text, form labels
- **Style treatment:** Weight 300 for long-form descriptions, weight 400 for UI elements. `line-height: 1.85` for body paragraphs — generous, unhurried.

### Accent / Decorative — `Cormorant Garamond Italic`
- Used for taglines, guest quotes, botanical labels, subheadings that need personality
- Example: *"Where the mist meets the estate"*

---

## Color Palette

The palette is drawn from the actual textures of Kodagu: dark teak, aged parchment, coffee cherry red, moss, morning mist.

```
--color-ink:         #1C1814   /* Deep teak brown-black — main text */
--color-parchment:   #F5EFE0   /* Warm off-white — main background */
--color-estate:      #2C3D2B   /* Deep forest green — primary accent */
--color-copper:      #A0522D   /* Sienna/copper — secondary accent, CTAs */
--color-mist:        #D9D0C0   /* Warm grey-beige — dividers, secondary bg */
--color-cream:       #FBF7EE   /* Near-white — card backgrounds */
--color-gold:        #C49A3C   /* Antique gold — decorative flourishes, borders */
--color-bark:        #6B4C35   /* Medium teak — hover states, links */
```

**Background strategy:**
- Sections alternate between `--color-parchment` and `--color-cream`
- The hero and footer use very dark `--color-ink` (near black) for dramatic contrast
- Never pure white (#FFFFFF) or pure black (#000000) — always the warm equivalents

---

## Layout & Structural Rules

### Grid System
- Max content width: `1240px`, centered
- Desktop gutter: `80px` horizontal page padding
- Mobile gutter: `24px`
- Section vertical padding: `120px` desktop / `72px` mobile
- **Intentional asymmetry**: Many sections use a 40/60 or 35/65 column split rather than 50/50 — this feels editorial and hand-crafted rather than template-like

### Spatial Signature
Every section has one "breakout" element that violates the grid — an image that bleeds to the page edge, an oversized decorative numeral, a botanical illustration that overlaps two sections. This creates visual interest and the feeling of a designed piece rather than a CMS template.

### Decorative System
A set of recurring motifs throughout the site:
1. **Thin horizontal rules** with a small diamond `◆` or botanical leaf `⌘` centered on them — used as section dividers
2. **Botanical line illustrations** (coffee branch, pepper vine, coorg lily) — SVG line drawings in `--color-gold` or `--color-estate`, used as corner ornaments and section accents
3. **Aged paper grain texture** — a subtle CSS noise overlay (5% opacity) on parchment sections to give warmth and texture
4. **Numbered labels** in large Cormorant Garamond (e.g., `01`, `02`) used to sequence amenity or experience items
5. **Double-line border boxes** — thin outer + thin inner border with a gap, used on image frames and info cards (classic colonial-print aesthetic)

---

## Section-by-Section Design Specification

---

### 01 — Navigation

**Style:** Transparent over the hero video; transitions to a warm semi-transparent parchment (`rgba(245, 239, 224, 0.95)`) with a thin `1px gold` bottom border on scroll.

**Layout:** Logo left, nav links centered, "Book Now" button right

**Logo:** `BB Estate Stay` in Cormorant Garamond 500, with `BB` slightly larger than the rest. A tiny hand-drawn coffee leaf SVG sits to the left of the B.

**Nav links:** Jost 300, `letter-spacing: 0.1em`, uppercase, small size (13px). Links: About · Experiences · Gallery · Reviews · Reach Us
On hover: a thin `2px` underline in `--color-gold` slides in from left.

**Book Now button:** Outlined style — `1px solid --color-copper`, Jost 400, copper text. On hover: fills with copper, text turns parchment. No border-radius (sharp corners = estate elegance).

**Mobile:** Hamburger icon (three thin lines, not the typical bold bars — more like dashes). Full-screen overlay menu with large Cormorant Garamond nav items centered, fading in staggered.

---

### 02 — Hero Section

**Concept:** Full-viewport video background (drone footage of the estate). The video plays silently, looped, with a dark vignette overlay (`radial-gradient` from transparent center to `rgba(28, 24, 20, 0.55)` edges).

**Text placement:** Centered, vertically centered, with generous breathing room.

**Composition:**
```
[ thin gold rule — 60px wide, centered ]
  ESTATE STAY IN KODAGU          ← Jost 300, 11px, letter-spacing 0.2em, gold, uppercase
[ gap ]
  BB Estate Stay                  ← Cormorant Garamond 300, 88px desktop / 52px mobile, white, line-height 1.1
[ gap — 20px ]
  Where coffee blossoms meet      ← Cormorant Garamond Italic 300, 24px, --color-mist
  the silence of the Western Ghats
[ gap — 40px ]
[ Book Your Stay ]   [ Explore the Estate ]
     ↑ copper fill           ↑ outline white
```

**Scroll indicator:** A thin vertical line (40px tall) with a small downward-pointing chevron in parchment, centered at the bottom of the hero. Animated — the line "draws" downward on loop.

**Parallax:** The video has a subtle `scale(1.05)` with CSS parallax so it feels cinematic on scroll.

---

### 03 — About Section

**Heading:** `The Story of BB Estate`

**Layout (desktop):** 40% left column (text) / 60% right column (images)

**Left column content:**
- Small label: `EST. IN THE HILLS OF COORG` in gold caps, Jost 300
- H2 heading in Cormorant Garamond, large
- 3 paragraphs in Jost 300, body text color ink, generous line-height
- A hand-written style signature of the owners (an SVG or image of actual signature) beneath the text
- Small "Learn Our Story →" link in copper with a thin underline

**Sample content:**
> *Nestled within 12 acres of a working coffee and spice estate, BB Estate Stay has been the family home of the Belliappa family for three generations. What began as a private retreat amid the cardamom-scented hills of Kodagu has now quietly opened its doors to travellers who seek something real — not a resort, not a package tour, but a genuine stay inside a living estate.*

**Right column — image composition:**
- One large portrait-orientation image (main estate view), framed in a double-line border box
- One smaller landscape image overlapping the bottom-left corner of the large one (verandah/interior)
- A small circular image (coffee cherries / spice close-up) tucked at bottom-right
- All images have a very subtle `sepia(10%)` CSS filter for warmth

**Background:** `--color-parchment` with the grain texture overlay

---

### 04 — Experiences / Amenities Section

**Heading:** `Life at the Estate`
**Subheading (italic):** *"There is no itinerary. Only days that unfold."*

**Layout:** A 3-column grid of experience cards, with a different visual treatment — not typical icon + title boxes.

**Card design:**
- Large sequential number (`01`, `02`, `03`...) in Cormorant Garamond 300, very large (72px), `--color-mist`, positioned behind the title
- Title in Cormorant Garamond 500, 22px, ink
- Description in Jost 300, 15px, 3–4 lines
- Thin gold bottom-border rule on each card
- No card background — they float on the section background
- Very subtle hover: the number shifts to `--color-gold` and title shifts to `--color-copper`

**Six experiences:**
1. **Estate Walks** — Guided morning walks through the coffee and pepper plantation with the estate manager. Learn to identify cardamom, nutmeg, and coorg honey varieties.
2. **Verandah Evenings** — Sit on the colonial-era teak verandah with a cup of freshly brewed estate coffee as the valley fills with evening mist.
3. **Coorg Home Meals** — Three meals a day prepared by the family kitchen — traditional Coorgi pandi curry, akki roti, and bamboo shoot dishes made with estate-grown produce.
4. **Bonfire Nights** — Under the open sky, surrounded by the sounds of the estate at night — crickets, wind, and the distant Cauvery.
5. **Bird Watching** — Over 60 species of birds have been spotted on the estate. Binoculars available. Dawn walks with a naturalist guide on request.
6. **Estate to Cup** — Witness the journey of coffee — from cherry to bean to cup. A morning session with the estate's coffee processing unit.

**Background:** `--color-cream`

---

### 05 — Booking Section

**Heading:** `Reserve Your Stay`
**Subheading:** *"We host only one group at a time. The estate is yours."*

**Concept:** BB Estate Stay hosts exclusively — one booking at a time. This is a key selling point and must be communicated prominently.

**Layout:** Two-column — left side is a soft atmospheric image of the estate at dusk with text overlay; right side is the booking form.

**Left panel:**
- Full-height image with dark gradient overlay
- Overlay text:
  - "Exclusive Estate Occupancy" in gold caps
  - "Capacity: Up to 10 Guests"
  - "Minimum Stay: 2 Nights"
  - "Check-in: 2:00 PM · Check-out: 11:00 AM"
  - Thin rule dividers between each line
  - A thin botanical sprig SVG in gold at bottom

**Right panel — Booking Form:**
Background: `--color-cream`, with a thin double-line border frame around the entire form

Form fields (all styled with thin bottom-border only — no box outlines):
- Full Name
- Email Address
- Phone Number
- Check-in Date / Check-out Date (side by side)
- Number of Guests (dropdown: 1–10)
- Special Requests (textarea, 3 rows)
- [ Request Availability ] — full-width copper fill button, no border-radius, Jost 400 uppercase letter-spaced

Field label style: Jost 300, 10px, uppercase, gold, `letter-spacing: 0.15em`
Field input style: Jost 400, 16px, ink; `border-bottom: 1px solid --color-mist`; on focus: border-bottom turns gold
No floating labels — labels sit above fields in clean stacked layout

**Note below form:** *"We will respond within 24 hours to confirm availability and share detailed pricing."* in Jost 300 italic, small, muted.

---

### 06 — Gallery Section

**Heading:** `Through the Estate Lens`

**Layout:** A masonry-style editorial gallery with intentional sizing variation — not a uniform grid. This mimics a contact sheet or printed photo album layout.

**Grid composition (desktop):**
```
[ Large landscape — full width row, ~500px tall ]
[ Medium portrait ]  [ Small square ]  [ Medium portrait ]
[ Small square ] [ Large landscape — 60% width ] [ Small square ]
[ Medium portrait ]  [ Medium landscape ]
```

**Image hover treatment:**
- On hover, image gets a slight `scale(1.03)` with `transition: 0.4s ease`
- A thin white/gold border "draws" around the image from top-left to bottom-right (CSS clip-path animation)
- No text overlays — the images speak for themselves

**Gallery categories** (small pill tabs above gallery, in Jost 300 caps):
`All` · `Estate & Gardens` · `Rooms & Interiors` · `Food & Kitchen` · `Sunsets & Skies`

**Lightbox:** Click opens full-screen with dark background, prev/next with thin arrow buttons. ESC to close.

**Background:** `--color-ink` (the darkest, near-black) — this makes images pop dramatically and feels like a photographer's lightbox.

---

### 07 — Guest Reviews Section

**Heading:** `In Their Own Words`
**Subheading (italic):** *"Every guest leaves a little piece of themselves behind."*

**Layout:** A horizontal scrolling carousel of review cards (or a 3-up layout on large screens)

**Card design:**
- Card background: `--color-cream` with a thin `1px solid --color-gold` border
- Large decorative open-quote `"` in Cormorant Garamond 300, very large (80px), `--color-gold`, top-left
- Review text in Cormorant Garamond Italic 300, 18px, ink, `line-height: 1.9`
- Thin gold rule below the quote
- Guest name in Jost 400, 13px, uppercase, copper
- Location in Jost 300, 12px, muted (e.g., "Bengaluru, Karnataka")
- Month & Year in Jost 300, 12px, muted
- Star rating: 5 small gold `★` symbols

**Sample reviews:**

> *"Waking up to mist over the coffee rows and a steaming cup of estate-grown filter coffee brought to the verandah — I haven't been this at peace in years. BB Estate Stay isn't a stay. It's a feeling."*
> — Priya M., Bengaluru · October 2024

> *"The family made us feel like we'd known them forever. The Coorgi pandi curry alone is worth the drive. We've already planned our return."*
> — Rahul & Ananya, Hyderabad · December 2024

> *"We came for a weekend and stayed for five days. The exclusivity of being the only guests means you truly disconnect. No noise, no crowds — just the estate, the birds, and your own thoughts."*
> — Vikram S., Mumbai · January 2025

**Background:** `--color-parchment` with grain texture

---

### 08 — Location Section

**Heading:** `Finding Us`
**Subheading:** *"The journey through the ghats is the first gift."*

**Layout:** Split — left is a styled map embed (Google Maps) in a double-line frame; right is journey/directions text.

**Left:** Map embed with custom styling (desaturated, warm-toned — CSS filter `sepia(30%) contrast(90%)` on the iframe wrapper)

**Right text content:**
- Address block in Cormorant Garamond, estate-style formatting
- "How to Reach" as a small gold caps label
- Three route options in Jost 300:
  - ✦ **From Bengaluru:** ~270 km via Mysuru–Hunsur–Virajpet route (approx. 5.5 hrs)
  - ✦ **From Mysuru:** ~120 km via Hunsur (approx. 2.5 hrs)
  - ✦ **From Mangaluru:** ~135 km via Madikeri (approx. 3 hrs)
- Nearest town: Madikeri / Virajpet (20 km)
- Airport: Mangaluru International (135 km)
- **Note:** *"Detailed coordinates and estate access map shared upon booking confirmation."*

**Decorative element:** A hand-illustrated mini map of Kodagu region in SVG line-art style (coffee hills, rivers) as a background watermark on the right panel — very low opacity, gold.

**Background:** `--color-cream`

---

### 09 — Terms & Conditions Section

**Heading:** `Estate Policies`
**Style:** This section must not feel like a legal document. It should feel like house rules from a gracious host.

**Layout:** Two-column accordion or clean stacked list with thin gold rule separators

**Framing text:**
> *"BB Estate Stay is a home before it is a hospitality. We ask our guests to treat it as such — with care, with respect for the land, and with an appreciation for the quiet that makes this place what it is."*

**Policy items** (each with a small botanical `◆` bullet, Cormorant Garamond heading, Jost 300 body):

**Check-in & Check-out**
Check-in from 2:00 PM. Check-out by 11:00 AM. Early/late arrangements on request and availability.

**Booking & Payment**
30% advance on confirmation. Balance settled before check-in. Direct bank transfer or UPI accepted.

**Cancellation Policy**
Cancellations 15+ days before arrival: full refund of advance. 7–14 days: 50% refund. Under 7 days: no refund. Rescheduling subject to availability.

**Meals & Dietary Needs**
All meals are home-cooked and included in the stay. We are happy to accommodate dietary preferences with 48 hours notice. Outside food not permitted in the dining area.

**Guests & Visitors**
Only registered guests permitted on the estate. No day visitors without prior notice.

**Noise & Respect**
The estate is home to birds, insects, and silence. Loud music and amplified sound are not permitted after 9:00 PM.

**Alcohol**
Guests may bring their own alcohol. We do not serve or stock alcohol on the premises.

**Children & Pets**
Children are warmly welcome. Pets are welcome with advance notice — the estate has its own resident dogs.

**Smoking**
Smoking only in designated outdoor areas. Not permitted inside rooms or on the verandah.

**Background:** `--color-parchment`

---

### 10 — Footer

**Layout:** Three columns + full-width bottom bar

**Column 1:** Logo + tagline + social links
- Logo in Cormorant Garamond, large
- Tagline: *"An estate stay. A living home."* in italic
- Small icons for Instagram, Facebook (thin line style)

**Column 2:** Quick Links (Jost 300, uppercase, small)
About · Experiences · Gallery · Reviews · Booking · Terms

**Column 3:** Contact
- Address in Jost 300
- Phone (WhatsApp preferred)
- Email

**Bottom bar:** Thin `1px --color-gold` top border. Centered: `© 2025 BB Estate Stay · Kodagu, Karnataka · Designed with care`

**Background:** `--color-ink` (near black)
**Text:** Parchment / mist tones

---

## Animation & Interaction Details

### Page Load
- Navigation fades in from top (0.4s)
- Hero text elements stagger in: label → title → subtitle → buttons (each 0.15s delay)
- Hero scroll indicator draws down after 1.2s

### Scroll Animations
- All section headings: fade in + slight upward translate (20px → 0) on entering viewport
- Cards and experience items: staggered fade-in left-to-right (0.1s each delay)
- Gallery images: fade in with a very slight scale (0.97 → 1.0)
- The large decorative numbers in experience cards count up from 0 on scroll (optional JS)

### Hover States
- Navigation links: gold underline slides in from left
- CTA buttons: smooth 0.3s fill transition
- Gallery images: scale + border draw
- Review cards: very slight upward translate (4px) + shadow deepens
- Footer links: copper color transition

### Scroll Behavior
- Smooth scroll for anchor links
- Sticky nav with backdrop blur effect on scroll (not solid — `backdrop-filter: blur(8px)`)

---

## Responsive Breakpoints

| Breakpoint | Width | Key Changes |
|---|---|---|
| Desktop XL | 1440px+ | Full layout, all decorative elements |
| Desktop | 1240px | Standard layout |
| Tablet | 768–1239px | 2-col where 3-col existed; nav collapses |
| Mobile | < 768px | Full single column; hero text reduces; gallery becomes 2-col |

### Mobile-specific:
- Hero title: 42px → 32px on very small screens
- Experience cards: 1 column, number remains large as decorative bg
- Gallery: 2-column masonry
- Booking form: full width, stacked
- Navigation: full-screen overlay

---

## Technical Stack Recommendation

- **Framework:** Plain HTML5 + CSS3 + Vanilla JS (no framework needed — keeps it fast and maintainable)
- **Fonts:** Google Fonts — `Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400` + `Jost:wght@300;400`
- **Icons:** Custom SVG only — no icon libraries (keeps the hand-crafted feel)
- **Map:** Google Maps embed (iframe) with CSS filter overlay
- **Video:** HTML5 `<video>` with `autoplay muted loop playsinline` + WebM format for performance
- **Gallery Lightbox:** A lightweight vanilla JS solution (~3KB)
- **Animations:** CSS transitions + `IntersectionObserver` for scroll reveals (no heavy animation libraries)
- **Performance:** Lazy-load all images below the fold. Video served from CDN. WebP images throughout.

---

## File & Asset Checklist

### Images Needed (Photography/Drone)
- [ ] Drone video: 1080p/4K, aerial sweep of estate — ideally golden hour
- [ ] Hero still (for video poster/fallback): wide aerial shot
- [ ] Estate exterior: front gate, driveway, main bungalow facade
- [ ] Rooms: bedroom(s), living/common area, verandah
- [ ] Estate close-ups: coffee rows, pepper vines, spice garden
- [ ] Food: Coorgi breakfast spread, evening snacks, coffee being brewed
- [ ] People moments: verandah sitting, estate walk, bonfire (staged/candid)
- [ ] Landscape/nature: misty valley, sunset, forest edge, birds
- [ ] Details: old teak furniture, brass fixtures, handwoven textiles, estate signage

### SVG Illustrations Needed
- [ ] Coffee branch with cherries (line illustration, gold)
- [ ] Pepper vine (line illustration, green)
- [ ] Coorg lily / flower motif
- [ ] Small coffee leaf for logo
- [ ] Decorative botanical corner ornament
- [ ] Region map sketch (Kodagu hills, Cauvery river)

---

## Design Summary — Core Principles

| Principle | How it manifests |
|---|---|
| **Warm, not cold** | Parchment over white; Cormorant Garamond over sans-serif headings; amber/copper over blue |
| **Unique, not template** | Asymmetric layouts, large decorative type, editorial image sizing, double-line frames |
| **Estate, not hotel** | "We host one group at a time" messaging; family story; home-cooked meals; estate policies phrased as house rules |
| **Kodagu-specific** | Coffee/spice botanical motifs; local dish names; Coorg cultural references in copy; mist and Western Ghats imagery |
| **Elegant restraint** | No drop shadows, no gradients on text, no rounded pill buttons, no neon accents — every element quiet and intentional |
| **Unhurried** | Generous whitespace, slow hover transitions (0.4s), long line-heights — the pace of the site mirrors the pace of the stay |

---

*BB Estate Stay · Design Document v1.0*
*Prepared for website development — May 2025*
