# The Creative Collective

Attached are our 3 wireframe sheets (01 Onboarding, 02 Globe intro & Home, 03 Search, Profile/Portfolio, Project detail) — follow their layout and copy closely. Design reference for simple monochrome details: https://namedcollective.com (we're using white background instead of their black).


Build a clickable mobile-first MVP prototype of a creative discovery / networking app for NAMED Collective (London alt fashion brand; “a community before it is a brand”). Alternative creatives — tattoo artists, piercers, hair, nails, photographers, stylists, DJs — build a portfolio (“your collective”) and get found on a neighbourhood-level globe. Contact hands off to Instagram. No real backend. React + Tailwind (Lovable default). Frame ~390px wide, works in browser.

## Design system (black / white + NAMED site cues)
Strict monochrome: white `#FFFFFF` background, black `#000000` text/UI, greys `#EEEEEE` / `#B7B7B7` / `#7D7D7D` only. No brand colours, pink, or gradients.
- Body font: **Inconsolata** (Google Fonts) — NAMED’s primary UI type. Headings same family, semi-bold. Optional tiny gothic accent only for a wordmark if needed; don’t use blackletter for body.
- Buttons & chips: **uppercase** labels (NAMED pattern). Primary = solid black fill, white text. Secondary = white fill, **1px solid black** border. Border-radius **4–8px** (NAMED uses ~4px; search bar / chips can be fuller pills to match the wireframes).
- Inputs: 1px `#B7B7B7` border, 12–16px padding, generous white space (16px mobile gutters like NAMED’s `--container-padding-mobile`).
- Links: underline with ~3px underline-offset.
- Images: full-bleed cover crops, square portfolio tiles, **1px gap** between grid cells (NAMED product-grid feel). Soft grey placeholders OK.
- Transitions: ~0.2s ease.
- Microcopy: short, cheeky, friend-not-brand (NAMED tone — “bestie”, “the collective”) but keep UI clean; no try-hard slang spam.

## Screens & routes (match wireframes exactly)
1. **Onboarding** `/onboarding` — 4 steps, progress bar (4 segments), centred LOGO placeholder.
   - Name: “What’s your name?” / “This is how you’ll show up on the map.” Input + Next. Footer: “Already have an account? Log in” (toast: demo only).
   - Create account: email + password fields; checkbox “I accept the Terms & Conditions” (T&Cs text must include **18+** and neighbourhood-only location). Next disabled until checked.
   - Location: “Where are you based?” / “We’ll show you creatives near you first.” City/postcode input + “Use my current location” (fake: set “London”). Next.
   - Intent: “Are you here to discover or be discovered?” Two outlined choices Discover / Be discovered with “or” between; note “This will not affect your ability to do either.” CTA “Let’s go” → save answers to **localStorage** → `/intro`.
2. **Globe intro** `/intro` — short sequence: small spinning globe → zoom in → auto-route to `/` after ~2.5s (skip link allowed). Honour `prefers-reduced-motion`: skip spin, go straight to home.
3. **Home / discovery globe** `/` — top: profile avatar (left), pill search “Search creatives, places…”, settings gear (right). Hint: “Drag to spin · tap a pop-up to view”. Interactive 3D globe (`react-globe.gl`, `cobe`, or three.js). Pins at **neighbourhood** coords only (never exact addresses). Name cards: avatar · name · category · city; tap → `/profile/:id`. Search focuses `/search`.
4. **Search** `/search` — back + search field; chips **All / Tattoo / Hair / Piercing / Nails** (selected = black fill); “N results near London”; list rows avatar · name · category · city · distance; bottom pill **View on globe** → `/` focusing those pins.
5. **Profile / portfolio** `/profile/:id` — cover, overlapping avatar, name, role · city, style tags (pills), bio; **Contact** (primary) + **Save** (outline, toggles localStorage); tabs Work | About | Reviews; Work = 2-col image grid; Location = small map placeholder (neighbourhood label only).
6. **Project detail** `/project/:id` — image carousel + dots; title; year · style · placement; description; full-width Contact.

Also: **Saved** `/saved` (list of saved profiles) and lightweight **Profile/settings** stubs. Bottom tab bar after onboarding: Home · Search · Saved · Profile (44px+ tap targets).

## Contact sheet
Contact opens a bottom sheet: Instagram handle, “Open Instagram” (external `https://instagram.com/...` new tab), “Copy handle”, one-line privacy note (“We never show exact locations”). No in-app chat.

## Mock data
Seed **16 fictional creatives** with obviously fake names (e.g. Mira Vale, Jax Thorn). Mix London neighbourhoods (Dalston, Peckham, Shoreditch, Brixton, Hackney, Camden…) plus Brighton, Berlin, Manchester. Categories: Tattoo, Hair, Piercing, Nails, Photographer, Stylist, DJ. Each: tags, short bio, 4–6 work images via `picsum.photos` or Unsplash source URLs, neighbourhood lat/lng (jittered, not real home addresses), fake IG handle, 1–2 projects with year/style/placement. Persist onboarding + saved IDs in localStorage.

## Behaviour
- Chip + text filter search; empty state copy.
- Save toggles heart/filled state.
- “View on globe” filters/highlights matching pins and flies camera.
- Skip auth: any email/password works once T&Cs checked.
- Accessibility: WCAG AA contrast, ≥44px targets, alt text on images, keyboard-focus rings, reduced-motion globe fallback.
- Privacy: neighbourhood pins only; 18+ in T&Cs; no live GPS tracking beyond the mocked “current location”.

## Out of scope (do not build)
Real auth/backend, messaging/DMs, payments, push notifications, **any anti-ghosting mechanic** (pins, reply queues, timers, decline refunds — undecided by the team), admin, dark mode, i18n, real Instagram OAuth.

## Deliverable
A polished clickable demo: finish onboarding → spin/zoom globe → browse pins → search/filter → open profile → open project → Contact sheet → Save → Saved tab. Seed data visible immediately on home.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/27745854-35c0-4fb9-80a3-dd6dc85ad8e5).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
