# Soil Charger Technology — 2026 Revamp

A React rebuild of [soilchargertechnology.com](https://www.soilchargertechnology.com/).
The existing PHP site is the source of truth: every product, article, photo,
video, testimonial, phone number, email and statistic here was read off the live
site or its live API. Nothing was invented.

Start with **[docs/AUDIT.md](docs/AUDIT.md)** — it records what the old site
contains, which APIs it calls, and how each piece maps onto the rebuild.

---

## Running it

```bash
npm install
npm run dev        # http://127.0.0.1:5180
npm run build
npm run preview
```

Two maintenance scripts:

```bash
npm run extract    # re-derive src/data/*.json from a crawl of the legacy site
npm run qa         # headless sweep: 14 routes × 9 breakpoints, layout + a11y
npm run qa:shots   # same, writing screenshots to qa-shots/
npm run qa:a11y    # reduced motion, keyboard tab order, Escape handling
npm run qa:contrast # samples rendered text/background pairs against WCAG AA
npm run qa:utils   # finds Tailwind classes the build silently dropped
npm run qa:api     # end-to-end API check (never POSTs to write endpoints)
npm run restore-images  # re-mirror CMS images from the Internet Archive
npm run prune-mirror    # drop local copies the API serves again (--apply to delete)
npm run qa:screens # targeted screenshots of each key view
```

`qa` needs Chrome. Override the path with `CHROME_PATH=... npm run qa`.

---

## CMS images — recovered

**Every image uploaded through the CMS returns HTTP 404 on the client's server**
— products, blogs, gallery, testimonials, hero covers, the founder portrait.
This is not a regression here: loading the *live production site* headless shows
44 of 44 product images failing.

**69 of them were recovered from the Internet Archive** and are mirrored into
`public/img/cms/`, preserving the CMS folder layout:

| folder | recovered |
|---|---|
| product | 21 / 21 |
| blog | 21 / 21 |
| gallaryphoto | 20 / 20 |
| coverphoto | 4 |
| testimonials | 2 / 2 |
| aboutus | 1 / 1 |

`npm run restore-images` re-runs the recovery and rewrites
`src/data/image-manifest.json`, which maps each live CMS url to its local file.

### Where images load from

Set `VITE_IMAGE_SOURCE` in `.env`. `SmartImage` walks the resulting candidate
list, moving to the next only when one fails, and draws the placeholder only if
all of them do.

| mode | order | images on /products | failed requests |
|---|---|---|---|
| `api-first` **(default)** | API → mirror | 25 / 25 | 21 |
| `api` | API only | **4 / 25** | 21 |
| `mirror-first` | mirror → API | 25 / 25 | **0** |

`api-first` is the default because the API is the system of record: the app
always asks it first, so the day the uploads are restored the live files take
over on their own and `public/img/cms/` can simply be deleted — no code change.

`api` is the "no local files at all" mode. It is measured above rather than
described: with the uploads still 404ing it leaves 21 of 25 images blank on the
products page, and every product, blog, gallery, testimonial and founder image
empty site-wide. It becomes the right setting once the server is fixed.

`mirror-first` is the fastest today — it avoids ~21 failed requests per page —
at the cost of not noticing when the server comes back.

### Four files could not be recovered

No substitute image is shown for any of them. Nothing on the page is a picture
other than the one the CMS points at — a missing image degrades to the
soil-toned placeholder, and corrects itself the moment the upload is restored.

| file | used by | handling |
|---|---|---|
| `8_gallaryphoto.jpg` | Vision panel | keeps the live CMS url; placeholder until the server serves it |
| `9_gallaryphoto.PNG` | Mission panel | same |
| `10122024075152137_coverphoto.png` | one hero slide | uploaded after the archive's last capture; slide dropped so the carousel has no blank frame |
| `66_photo.png` | product alt image | the `frontproduct` folder has no archive captures; falls through to the placeholder |

### Retiring the mirror

The mirror is a stopgap, and `npm run prune-mirror` is how it gets retired
rather than left to rot. It asks the server for all 69 mirrored urls and deletes
the local copy of every one the server is serving again, so a file never exists
in two places once the API can supply it; `--apply` performs the deletion, the
bare command only reports. When the manifest empties, `public/img/cms/` is gone
and the app is back on the API alone with no code change.

Run today it removes nothing: **0 of 69 are served, all 69 still 404.**

**The server should still be fixed** — the mirror is a stopgap, not the fix.

---

## Architecture

```
src/
  data/            content, separated from UI
    site.js        contact, nav, pillars, principles, team, stats, ISO, states
    products.json  21 products      blogs.json        21 article cards
    gallery.json   20 photos        blog-content.json article bodies (lazy)
    videos.json    51 YouTube ids   testimonials.json 2 farmer quotes
    about.json     founder story    vision-mission.json
    slides.json    hero covers
  lib/
    api.js         the live Laravel API — endpoints, payloads, 422 handling
    i18n.jsx       en / mr / hi strings + the Google Translate bridge
    motion.jsx     Reveal, ImageReveal, TextReveal, useParallax
    validate.js    client-side form rules
  components/      Header, Footer, Modal, Lightbox, Field, Stepper,
                   LanguageSelector, WhatsAppWidget, EnquiryModal,
                   ExportFormModal, LocationPicker, PageHero, Seo, Icon, ui
  sections/        Hero, Pillars, Principles, About, VisionMission, Gallery,
                   Products, Stats, CareerTeaser, Articles, Testimonials,
                   Team, Certification, ContactSection
                   forms/ InternshipForm, DistributorForm, JobVacancyForm
  pages/           one per route
```

Components never hard-code content — they read from `src/data`.

### Where data comes from

| Section | Source |
|---|---|
| Products, About, Vision/Mission, Testimonials, Hero slides | **Live API**, with the extracted JSON as an offline fallback so a section never renders empty |
| Blogs, Gallery, Videos | Extracted JSON — the legacy site renders these server-side and exposes no read endpoint |
| Contact, team, pillars, principles, stats, ISO, states | `src/data/site.js`, lifted verbatim from the markup |

All four write endpoints and the three cascading-location endpoints are called
exactly as the legacy site calls them. No API was modified or mocked.

---

## Design system

Tokens live in `src/styles/index.css` as CSS variables and are surfaced through
`tailwind.config.js`. Changing the nine `--c-*` values recolours the whole site.

```
--c-primary  #245C3A   deep forest green   --c-bg       #D8E8D3  green ground
--c-deep     #163D29   dark bands          --c-cream    #C5DCBE  alternating band
--c-leaf     #6E9F45   natural leaf        --c-surface  #F0F8EE  cards
--c-earth    #8A5A3B                       --c-accent   #D6A83A  sunlight
--c-soil     #5A3E2B                       --c-text     #1A281E
```

**There is no white or grey anywhere.** The light half of the page runs on two
green tones (`#D8E8D3` ground, `#C5DCBE` band) with cards a step lighter; the
dark half is deep forest green. The homepage alternates 7 dark / 7 light.

### Bands

A section becomes deep green by adding one class:

```jsx
<section className="band-dark section">…</section>
```

`.band-dark` does not restyle its children — it **redefines the surface tokens**
for its subtree (`--c-bg`, `--c-surface`, `--c-text`, `--c-muted`, `--c-line`,
and `--c-primary` → the accent). Every `text-ink`, `text-muted`, `border-line`,
`bg-surface`, `.card` and `.field` inside then inverts on its own, and nothing
in the section needs to know which band it is on.

`.band-light` is the inverse, for a light island inside a dark band — product
cards use it, because the packshots are transparent PNGs that need a pale
backdrop. Because both work through tokens rather than utility overrides, they
nest correctly.

All text pairings clear WCAG AA on both bands; `npm run qa:contrast` re-checks
against the rendered page after any palette change.

> **Gotcha worth knowing:** Tailwind only emits an opacity modifier such as
> `bg-primary/8` when that value exists in `theme.opacity`. Values outside the
> default scale are dropped **silently** — the element just renders unstyled.
> `tailwind.config.js` therefore extends the scale with every fractional value
> the design uses, and `npm run qa:utils` fails the build-check if a new one
> creeps in.

Type: **Fraunces** for display, **Plus Jakarta Sans** for body, **Noto Sans
Devanagari** as the Marathi/Hindi fallback. Sizes use a fluid `clamp()` ramp, so
headlines scale without breakpoints. Devanagari gets looser line-height than
Latin — it runs taller and clips otherwise.

The page follows the site's own story: **soil → philosophy → method → founder →
future → proof → solutions → people → experience → trust → connection.**

---

## Animation

Scroll reveals, clip-path image wipes, word-by-word headline reveals, gentle
parallax on the hero and About portrait, card hover lift, count-up statistics.

Every one of them collapses to a short fade under `prefers-reduced-motion`.
Verified: with reduced motion on, **0** elements animate, **0** transitions run
longer than 50 ms, and no content is left invisible.

---

## Language

The existing site's only translation mechanism is a Google Translate widget, so
it is kept — all CMS content (products, articles, the founder story) still
translates the way it does today. On top of that, the UI chrome we author here
(navigation, buttons, form labels, validation messages) ships as real
translations in `src/lib/i18n.jsx`, so the frame around the content is correct
rather than machine-guessed.

---

## Legacy URLs

Old links keep working:

| Old | New |
|---|---|
| `/index.php` | `/` |
| `/photo-gallery`, `/sub-photo-gallery` | `/gallery?tab=photos` |
| `/vedio-gallery`, `/sub-vedio-gallery` | `/gallery?tab=videos` |
| `/sub-product/111` | `/products/111` |
| `/sub-blogs?id=14` | `/blogs/14` |

> **Deployment note:** this is a client-routed SPA. The host must rewrite unknown
> paths to `index.html`, otherwise a direct hit on `/products/111` 404s at the
> server before React ever loads.

---

## QA status

`npm run qa` covers 14 routes across 320 / 375 / 390 / 414 / 768 / 1024 / 1280 /
1440 / 1920 px and checks horizontal overflow, broken images, missing `alt`,
heading order, touch-target size, clipped text, console errors and failed
requests.

**Current result: zero layout and accessibility issues.** The only failures
reported are the CMS image 404s described above.

Also verified: reduced-motion behaviour (0 animations, 0 transitions over 50 ms,
nothing left invisible), keyboard tab order with a visible focus ring on every
stop, Escape closing the mobile menu, every `aria-labelledby` resolving to a real
element, WCAG AA contrast on all sampled text, and the live product API returning
all 21 products into the rendered grid.

### API integration

`npm run qa:api` verifies four things and passes on all of them:

1. every read endpoint answers with the expected shape,
2. the write endpoints are wired with the right payload field names —
   **checked statically, never contacted**, because they write into the live
   production database,
3. each page actually issues the requests it depends on, and
4. the live payload reaches the DOM (21 product names, the founder story, all
   vision + mission bullets).

> **This API does not use HTTP status codes for failures.** A rejected request
> comes back as **HTTP 200** carrying `{code: 400, result: "false"}` — verified
> against `/districtlist`. `src/lib/api.js` therefore checks the status *and*
> the envelope inside the body. Checking `res.ok` alone reports failures as
> successes, which for a form means telling an applicant their application was
> submitted when it was not.

**Still not tested:** actual form submissions. They are wired to the documented
endpoints with the documented payloads, but a real submission writes a record
into the client's production database, so it needs a staging endpoint or the
client's go-ahead.

---

## Things the client should decide

1. **The " K" suffix on two statistics.** The live markup counts to `155000` and
   prints a literal " K" after it, so the page reads "155,000 K". The numbers are
   preserved exactly; the stray suffix is dropped. Confirm whether the intended
   figures are 155,000 and 5,000.
2. **The Export Form has no backend.** On the live site its modal has no action
   and no submit handler — it silently does nothing, and there is no export
   endpoint in the API. The rebuild keeps all seven fields and composes the
   submission into a mail to the published sales address. Swap `deliver()` in
   `ExportFormModal.jsx` for an API call once an endpoint exists.
3. **"Add Testimonial" has no endpoint either.** The live modal (headed "ENTER
   HERE OTP AND VERIFY") has no handler, no `name` attributes and no OTP call
   behind it. No testimonial-submission endpoint exists, so it has not been
   rebuilt as a working form. Supply an endpoint and it can be added.
4. **Social links.** Facebook, Instagram, YouTube and Twitter were found in the
   existing markup and carried over. The Twitter handle is `GoldenOpportu10`,
   which does not look like a company account — worth checking.
