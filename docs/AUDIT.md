# Soil Charger Technology — Existing Site Audit

**Source of truth:** https://www.soilchargertechnology.com/ (PHP site) + https://finalapi.soilchargertechnology.com (Laravel API)
**Crawled:** 2026-09-21 — 11 listing pages, 21 product detail pages, 21 blog detail pages, 5 live read APIs verified, 7 write/lookup APIs mapped.

> ### ⚠ Blocking issue found on the client's server
> **Every CMS-uploaded image returns HTTP 404.** Verified directly against
> `finalapi.soilchargertechnology.com` and by loading the live production site in a
> headless browser: on `/products`, **44 of 44** product images fail, while the 12
> static images served from `soilchargertechnology.com/public/img/` all load fine.
> This affects product photos, blog images, gallery photos, testimonial portraits,
> hero cover photos and the founder portrait — on the current live site as well as
> on the rebuild. It is a server-side problem that predates this work.
> The rebuild keeps the original URLs, so the images reappear the moment the
> uploads are restored; until then each one degrades to a soil-toned placeholder
> rather than a broken-image icon.

---

## A. Stack found

| Layer | Reality |
|---|---|
| Frontend | Server-rendered PHP (`index.php`, `sub_product.php`), Bootstrap 4, jQuery 1.8.3 + 3.4.1 + 3.5.1 (three copies loaded), Owl Carousel, Slick, Isotope, WOW, AOS, paroller, odometer, magnific-popup |
| Backend | Laravel REST API at `finalapi.soilchargertechnology.com/api/*` |
| CMS media | `finalapi…/public/uploads/web/{product,blog,gallaryphoto,coverphoto,testimonials,aboutus}/` |
| Static art | `soilchargertechnology.com/public/img/…` (logo, pillar icons, team photos, ISO, social icons) |
| i18n | **Google Translate widget only** — `translate.google.com/element.js`, `pageLanguage:'en'`. The "English / Marathi / HIndi" menu items are Google Translate triggers. There is no translation table anywhere in the site. |
| Fonts | Open Sans, Abril Fatface, Beau Rivage, Libre Baskerville |

---

## B. Routes

| Route | Content | Disposition |
|---|---|---|
| `/` (index.php) | Hero slider, 4-piller, 3-principle, About, Vision, Mission, Photo teaser, Video teaser, Products + filter, Career, Blog teaser, Stats, Testimonials, Team, ISO, Contact/footer | KEEP — restructured |
| `/about-us` | Founder story, company image, map | KEEP |
| `/vision-mission` | Vision + Mission lists | KEEP |
| `/our-team` | 5 members | KEEP |
| `/photo-gallery` · `/sub-photo-gallery` | 20 photos (identical sets) | KEEP — merged into `/gallery` |
| `/vedio-gallery` · `/sub-vedio-gallery` | 51 YouTube embeds (identical sets) | KEEP — merged into `/gallery` |
| `/products` | Product grid + name filter | KEEP |
| `/sub-product/{id}` | Product detail, 21 ids | KEEP |
| `/blogs` | 21 article cards | KEEP |
| `/sub-blogs?id={id}` | Article detail, 21 ids | KEEP — becomes `/blogs/:id` |
| `/careers` | 3 modal forms | KEEP — becomes a real page |

Product ids: 88, 92, 95, 97, 99, 101, 104, 107, 111, 113, 115, 116, 117, 118, 124, 125, 127, 134, 178, 179, 180
Blog ids: 2, 3, 12, 14, 15, 16, 17, 32, 33, 34, 63, 64, 75, 76, 77, 113, 128, 129, 130, 131, 133

---

## C. Live API contracts — PRESERVE, do not mock

### Read (GET, all verified HTTP 200)

| Endpoint | Returns |
|---|---|
| `/api/frontproductlist` | 21 products: `id, product_id, title, short_description, long_description, additional_info, rating, review_person_name, review, photopath, productphotopath` |
| `/api/frontaboutuslist` | 1 record: `title` = "Mr. Ram Mukhekar", `content` (HTML), `photopath` |
| `/api/frontvisionmissionlist` | 2 records keyed by `record_for` = Vision / Mission |
| `/api/fronttestimonialslist` | 2 records: `title` (name + place + phone), `content`, `language` = "Marathi", `photopath` |
| `/api/frontsliderlist` | 6 cover records — ids 139 and 138 have `photo_one: null` (blank slides); 4 usable |

### Write + cascading location (POST)

| Endpoint | Payload |
|---|---|
| `/api/frontenquiryadd` | `name, email, mobile, comment, details` (details = CSV of checked product names) |
| `/api/frontinternshipadd` | multipart — `name, email, mobile, qualification, address, resume` |
| `/api/frontjobpostingadd` | multipart — `name, email, mobile, qualification, experience_from, experience_to, address, resume` |
| `/api/frontdistributorregistration` | multipart — `fname, mname, lname, phone, alternate_mobile, email, state, district, taluka, city, business_address, business_state, business_district, business_taluka, business_city, aadhar_card_image_front, aadhar_card_image_back, pan_card, shop_act_image, light_bill, product_purchase_bill, where_open_shop, used_sct, why_want_take_distributorship, distributorship_exerience, experience_farm_garder, goal` |
| `/api/districtlist` | `{state_id}` → `data[]{location_id, name}` — verified: state_id=2 returns 37 Maharashtra districts |
| `/api/talukalist` | `{dist_id}` → `data[]{location_id, name}` |
| `/api/villagelist` | `{taluka_id}` → `data[]{location_id, name}` |

**Error convention:** HTTP 422 → `responseJSON.message` is a `{field: message}` map. Success → `success.message`.

---

## D. Content inventory — all preserved verbatim

- **Hero** — "SOIL Is HEALTHIER, FARMER WALTHIER" / "We Are India's Leading Organic Farming Group" / CTA "Shop Now" / "Export Form" modal (Name-Company Name, Mobile Number, City, State, Country, Pincode, Requirements)
- **4-piller** — 4 statements, icons `dryfruits.png`, `soil1.png`, `chemicle.png`, `leaficon.png`
- **3-principle** — First Method (3 points), Second Rule (4 points), Third Meditation (3 points), plus longer "Important / More Important" modal variants
- **About** — Mr. Ram Mukhekar, Founder, Nashik Maharashtra. Six-paragraph story: 2015 origin, organic carbon priority, Mycorrhiza / synthetic PGR 3rd step, 4th step crop protection, SCT Saptapadi born 2021, 2015-19 Vedic journey, 10 years of research
- **Vision** 4 bullets · **Mission** 2 bullets
- **Products** — 21, names match the brief exactly
- **Blogs** — 21 (11 English titles, 10 Marathi titles, counted from the full titles on each detail page)
- **Photo gallery** 20 images · **Video gallery** 51 YouTube embeds (source carries no titles)
- **Stats** — real `data-max` values present in markup: FARMER `1000000` "+", YOUTUBE SUBSCRIBER `155000` " K", APP DOWNLOAD `5000` " K", SEMINAR MEETING `50000`, DISTRIBUTOR `460`
- **Testimonials** — 2, both Marathi: Dadasaheb Aher (Pimpri Nirmal, Rahata, Ahmednagar) and Rohan Mane
- **Team** — 5: Aniket Sahane / Director, Rushikesh Hadwale / Production Director, Prasad Mukhekar / Devlopment Director, Arun Patole / General Manager, Bhausabheb Khemnar / Technical Expert (`team1.png`–`team5.png`)
- **ISO** — "AN ISO 9001:2008 CERTIFIED COMPANY" plus the 2-paragraph company statement (`iso/ISO.png`)
- **Contact** — Shop No.3, lower ground flow, below passport office, star zone mall, Nashik - Pune highway, Nashik - 422 101 · +91 8669200221 · +91 9881798028 · soilchargertec@gmail.com / salessoiltec1@gmail.com / hr.soiltec@gmail.com
- **Map** — existing Google Maps embed, place `0x0:0x89fda91686ee69ee`, 19.960683 / 73.828404
- **WhatsApp** — SCT Consulting `918669200221`, SCT Sales `918669950005`, SCT Management `919545710002`
- **Socials present in markup** — Facebook `/Soil.Charger.Technology`, Instagram `/sct_vedic_technology_official`, YouTube `@SOILCHARGERTECHNOLOGYOFFICIAL`, Twitter `GoldenOpportu10`
- **Enquiry modal** — 10 checkboxes: Super Soil / Fruit / Flower / Crop / Size / Water / Fungi / Pest Charger, Krushi Amrut, Green Gujrat
- **State list** — 36 entries with real `state_id` values (Maharashtra = 2)

---

## E. Defects in the current site — carried as fixes, not content changes

1. Stats render as "155,000 K" and "5,000 K" — a literal " K" is appended to an already-complete number. **The numbers are kept exactly as found; the stray " K" is dropped** so the value reads correctly. Flagged for client confirmation.
2. Slider records 138 and 139 have `photo_one: null` → blank slides on the live carousel. Filtered out.
3. The "ADD TESTIMONIAL" modal (heading "ENTER HERE OTP AND VERIFY") has no submit handler and no `name` attributes — it is a dead form on the live site, and no testimonial POST endpoint exists. Rebuilt with the same fields, but submission stays disabled with a visible notice until an endpoint is supplied.
4. Three jQuery versions loaded on every page; `callto:866 920 0221` is a malformed scheme; duplicate `id="test"` on two stat nodes; `mailto: soilchargertec@gmail.com` carries a leading space.
5. `/photo-gallery` duplicates `/sub-photo-gallery`; `/vedio-gallery` duplicates `/sub-vedio-gallery`.
6. Typos preserved verbatim as content, since they are the client's words: "WALTHIER", "4-piller", "Usefull Links", "Devlopment Director", "lower ground flow".

---

## F. Redesign mapping

| Existing | New |
|---|---|
| Bootstrap grid + 15 jQuery plugins | React 19 + Vite + Tailwind v4 design tokens + Framer Motion |
| 3 stacked jQuery copies | Zero jQuery, route-level code splitting |
| Careers as modals only | `/careers` page, 3 multi-step forms, identical fields and endpoints |
| Google Translate widget | Kept (it is the only existing translation mechanism), plus a real i18n table for UI chrome in en/mr/hi |
| Odometer counters | IntersectionObserver count-up, reduced-motion aware |
| Duplicate gallery routes | Single `/gallery` with Photos / Videos tabs; legacy routes redirect |
| Product filter by name | Same 21 names as filter chips, horizontally scrollable on mobile |
