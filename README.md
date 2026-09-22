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
npm run qa:zoom    # 100/125/150/175/200% browser zoom — overflow and clipping
npm run qa:nav     # client-side routing: transitions, scroll restore, back button
npm run qa:engagement # bounce-risk: time-to-message on throttled mobile profiles
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
--c-void     #08160F   deepest band        --c-surface  #F0F8EE  cards
--c-leaf     #6E9F45   natural leaf        --c-accent   #D6A83A  sunlight
--c-earth    #8A5A3B                       --c-text     #1A281E
--c-soil     #5A3E2B
```

**There is no white or grey anywhere.** The light half of the page runs on two
green tones (`#D8E8D3` ground, `#C5DCBE` band) with cards a step lighter; the
dark half runs on two depths — forest green, and `--c-void` near-black for the
scenes that should feel like a darkened room.

The homepage alternates strictly, and the third depth is what lets it: no two
adjacent sections share a band, and where two dark sections do meet they step
*deeper* rather than repeat.

```
hero void · pillars light · method void · founder light · vision dark
gallery light · products dark (pinned horizontal) · reach void · ticker void
careers light · articles dark · voices light · team dark
certification void · contact light
```

The ticker is a moving seam rather than a section: two counter-scrolling rows
of the company's own tagline, certification line and pillar statements, placed
where the deep block meets the light half so two full-width colour fields do
not simply butt together. The top row travels **left to right**, the bottom row
**right to left**.

It is a CSS animation, not a JS one, and that is a correctness fix rather than
a micro-optimisation. It began as a framer-motion `animate={{ x: [...] }}` with
`repeat: Infinity` and silently never ran — inspected live, both tracks
reported `getAnimations().length === 0` and sat parked on their final keyframe.
It passed review only because the check asked whether `transform !== 'none'`,
which `translateX(-50%)` satisfies while perfectly still. An endless linear
translate is the one case where an animation library earns nothing: the
keyframe lives in `tailwind.config.js`, the compositor owns it, and it survives
a busy main thread.

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

## Motion

`src/lib/motion.jsx` is the whole system. Two rules hold it together: nothing
invents its own timing, and every primitive degrades under
`prefers-reduced-motion` — degrades to a short opacity fade with no transform,
not merely "runs faster".

**Tokens.** `DUR` (fast / normal / slow / cine), `EASE`, `EASE_CINE`, `GAP`.
They mirror the `--dur-*` / `--ease-*` variables in `index.css`, so a CSS
transition and a JS animation on the same element agree.
A section that wants a different feel picks a different token; it does not write
a new cubic-bezier.

### Architecture

```
src/lib/motion/            GSAP — everything scroll-driven
  tokens.js      DUR · EASE · BEZIER · GAP · DIST · SCALE · DEPTH · CLIP · BP · TRIGGER
  engine.js      plugin registration, Lenis lifecycle, scrollTo, reduced-motion policy
  animations.js  splitText · textReveal · textScrub · reveal · staggerReveal ·
                 imageReveal · scaleReveal · parallax · scaleOnScroll ·
                 pinSection · horizontalScroll
  hooks.js       useGsap · usePointerDepth · useMagnetic · useTilt ·
                 useScrollProgress · useStepIndex · useMediaQuery

src/lib/motion-react.jsx   framer-motion — React component transitions only
                           Reveal · ImageReveal · TextReveal · LineReveal ·
                           CharReveal · Marquee · useFrameParallax
```

Sections import from `lib/motion`, never from `gsap` directly. That keeps
plugin registration, the Lenis↔ScrollTrigger wiring and the reduced-motion
policy in one place.

### Libraries, and why each one is here

| Library | gzip | Why |
|---|---|---|
| **GSAP + ScrollTrigger** | 45.5 KB | Pinning, scrub and timeline sequencing. `position: sticky` covers pinning but not scrubbed choreography, and hand-rolling `horizontalScroll` meant writing measurement, resize and focus handling that ScrollTrigger does properly. |
| **Lenis** | 5.7 KB | Smooth wheel scrolling. Desktop pointers only — see below. |
| **framer-motion** | 41.0 KB | Kept, narrowly, for `AnimatePresence`: modals, the mobile menu and route transitions are mount/unmount problems, which GSAP would mean hand-managing. |
| ~~Three.js / R3F~~ | 236 KB | **Not installed.** Measured at +124% of the JS payload for one decorative effect, on a site whose audience is mid-range Android. Also blocked: current R3F requires React ≥19 and this project is on 18.3.1. |
| ~~Lottie~~ / ~~Rive~~ | 79 / 62 KB | **Not installed.** Both need authored animation assets, and this project has none — every icon is inline SVG. A runtime with nothing to play is pure payload. |

Every figure above was measured by building each library into an isolated
bundle, not quoted.

**Primitives (framer-motion layer).** `Reveal`, `ImageReveal` (clip-path wipe
with counter-scale), `TextReveal` (word by word), `LineReveal` (line masks),
`CharReveal`, `Marquee`, `useFrameParallax`.

**Set pieces.**

| Component | What it does |
|---|---|
| `Preloader` | One-per-session opening curtain. Never waits on the network, never gates content — the page is mounted and painting underneath it the whole time. |
| `HorizontalScene` | A track moved sideways by vertical scroll, inside a sticky frame. Travel is measured from the DOM, keyboard focus drives it, and it degrades to a swipeable rail on touch. |
| `FluidBackdrop` | Three blurred blobs drifting on 19s/23s/29s cycles, so a stationary reader still sees a living page. Paused when the band is off-screen. |
| `CursorRing` | A trailing ring that *adds to* the native cursor rather than replacing it. |
| `PageTransition` | Route change: exit, restore scroll unseen, enter. |

**Why no WebGL.** A shader-driven mesh gradient is the fashionable version of
`FluidBackdrop`, and it would mean a renderer, a GL context and a rAF loop
running forever, on a site whose audience skews to mid-range Android. Three
transformed `div`s get most of the look for none of the cost. The same
reasoning kept GSAP out: `useScroll`/`useTransform`/`useSpring` and
`position: sticky` already cover every scroll behaviour here, so ScrollTrigger
would have been ~70KB for capability the bundle already had.

**Hierarchy is the point.** Animation weight is spent where it means something
and withheld everywhere else:

```
hero headline        ★★★★★   line masks, scroll-linked camera push
pinned method scene  ★★★★★   sticky panel driven by scroll progress
section headings     ★★★     word reveal
images               ★★★     clip-path wipe
cards / rows         ★★      fade-up, hover lift
body copy, footer    ★       nothing
```

**Scroll-driven, never scroll-jacked.** Both pinned scenes — the method
section and the horizontal product track — are `position: sticky` plus one
`useScroll` progress value. There is no wheel interception and no pinning
library; the page's own scroll is the only input, so a user can flick past
either at any speed and nothing fights them.

The horizontal scene has one non-obvious requirement: because the track is
positioned with `transform` rather than scroll, tabbing to an off-screen card
gives the browser nothing to scroll and the focus ring lands somewhere
invisible. It therefore converts the focused card's offset back into a page
scroll position, so tabbing walks the scene sideways.

**Desktop-only interactions** (magnetic CTAs, the trailing cursor ring) are
gated on `(hover: hover) and (pointer: fine)` and never mount on touch. The
cursor ring deliberately does *not* replace the native cursor: hiding it costs
the I-beam over text and the hand over links, and it lags exactly when the main
thread is busy.

**Route transitions** wrap `<Routes>` in `AnimatePresence mode="wait"`. The
outgoing page fades down, the scroll is restored while nothing is on screen,
and the new page rises in. `<Routes>` is given an explicit `location` — reading
it from context would re-render the *exiting* page as the new route mid-exit.

### Motion vs. bounce rate

Motion and engagement are not the same goal, and on this site they pulled in
opposite directions in one measurable place.

`npm run qa:engagement` measures the metric that actually predicts a bounce:
**how long until the visitor can read what the company does**, under CPU and
network throttling matched to the real audience — farmers and distributors on
mid-range Android over mobile data, not a desktop on localhost.

It found that the opening curtain was the most expensive element on the site:

```
profile                      before     after (range over runs)
desktop, no throttle          2424 ms   1364 - 1583 ms
mid Android, regular 4G       4088 ms   3191 - 3196 ms
low-end Android, slow 4G      6301 ms   3088 - 4476 ms
```

The throttled figures move run to run — the emulated profiles are noisy, and
the low-end number in particular spans ~1.4s — so treat them as a range, not a
benchmark. The desktop figure is stable and the direction is unambiguous on
every profile. Note also that CDP throttling does not change
`navigator.connection.effectiveType`, so the harness cannot exercise the path
where a real 3G visitor skips the curtain entirely; that case is verified
separately by overriding `navigator.connection`.

The original curtain was written to "never block — the page paints
underneath". That was true and irrelevant: nobody can read a headline through
an opaque layer, so a technically-ready page still had not said anything for
six seconds. It now yields to the visitor instead — any scroll, tap or key
dismisses it instantly, it races `document.fonts.ready` rather than filling a
fixed duration, it is capped at 700ms, and it is **skipped entirely on a
metered or slow connection** via the Network Information API. The visitors most
likely to abandon were the ones paying the most for it.

Two related findings from the same pass:

- **Mobile had no way to act.** At 35% scroll depth the only controls on screen
  were Language, Menu and WhatsApp — reaching the enquiry form meant opening
  the hamburger and scrolling it. The header now reveals a compact enquiry
  button once scrolled, which is also *when* it is worth offering: at the top
  the hero's own CTA is right there.
- **A mobile scroll cue was added and then removed.** The hero content is 925px
  against a 640-915px viewport, so it is already visibly cut off — a stronger
  "there is more" signal than a label. A cue below it landed at ~845px, under
  the fold on every phone but the tallest. Verified instead that the primary
  CTA sits at 451-463px, above the fold on all three handset sizes.

### Homepage motion map

| Section | Entry | Scroll | Hover | Mobile | Reduced motion |
|---|---|---|---|---|---|
| Hero | GSAP timeline: backdrop → eyebrow → 35-char headline split → CTAs → stats → index | scrubbed camera push, veil close, copy lift | magnetic CTAs | no pointer depth, no cue | final state set, no intro |
| Pillars | rule draws, statement rises from mask | sticky title column | row shifts, number tints | stacked | fade only |
| Method | sticky panel, numeral swaps on step | step index from scroll progress | — | plain stack | pin holds, swaps instant |
| Founder | image clip reveal | sticky portrait, nameplate parallax | — | stacked | fade only |
| Vision/Mission | staggered panels | backdrop drift | card lift, backdrop scale | stacked | fade only |
| Gallery | staggered tiles | — | zoom + `VIEW` cursor | grid | fade only |
| Products | card stagger | **ScrollTrigger pin + horizontal scrub** | 3D tilt ±5°, packshot lift | native rail | native rail |
| Reach | count-up on enter | fluid backdrop | underline grows | 2-col | numbers set, no count |
| Ticker | — | two counter-scrolling rows | — | same | static scroller |
| Careers | card stagger | — | icon fill, underline sweep | stacked | fade only |
| Articles | featured clip reveal, rows stagger | frame parallax | row shifts, arrow moves | stacked | fade only |
| Voices | quote cross-fade | — | — | same | instant swap |
| Team | portrait clip reveal | frame parallax | warm wash, rule grows | 2-col | fade only |
| Certification | mark wipes from left | fluid backdrop | magnetic CTA | stacked | fade only |
| Contact | panel rows stagger | — | hairline grows | stacked | fade only |

### Performance

| | before GSAP | after GSAP |
|---|---|---|
| JS transferred | 155 KB | **207 KB** |
| desktop, hero readable | 1364–1583 ms | 1407 ms |
| mid Android 4G | 3191 ms | **3729 ms** |
| low-end, slow 4G | 3088–4476 ms | **5877 ms** |

**GSAP costs roughly 1.4–2.8 s of time-to-message on a low-end phone.** That is
the trade the stack decision bought, stated plainly rather than buried: layout
shift stays at 0 and desktop is unchanged, but the slowest device pays for a
library whose effects it never runs.

The mitigation is available and not yet taken: every GSAP-driven effect except
the hero intro — the pin, the horizontal scrub, pointer depth, tilt, the cursor
— is already desktop-gated. Giving the hero intro a CSS path on touch would let
the whole engine load behind a dynamic import, and mobile would never download
those 52 KB.

**Reduced motion is a change of shape, not of speed.** The horizontal scene
becomes a plain rail, the marquee becomes a static scroller, the preloader
never mounts and the cursor ring is removed in CSS as well as in JS.

Verified with reduced motion on: **0** elements animate, **0** transitions run
longer than 50 ms, and no content is left invisible. Verified on a touch
device: no cursor ring, no pin, rail fallback. Frame cost measured in headless
Chrome (software rendering, so a floor rather than the real experience):
**60fps idle with 0 long frames**, 47-52fps while scrolling the full page.

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

`npm run qa:zoom` re-runs 10 routes at 100 / 125 / 150 / 175 / 200% browser
zoom. Page zoom scales the CSS pixel rather than the layout, so a 1440px window
at 150% lays out as a 960px viewport — emulating it as a narrower viewport is
exact, not an approximation. **Result: no horizontal overflow and no clipped
text at any zoom level.**

`npm run qa:nav` drives the app the way a visitor does — scroll down, click a
nav link — because the route transition introduced two failure modes a build
cannot catch: the exiting page re-rendering as the new route mid-exit, and the
scroll restore landing the new page half-way down. **Result: all five hops plus
the back button land at the top of the correct route with no JS errors.**

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
