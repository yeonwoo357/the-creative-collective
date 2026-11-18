<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.

## What Lovable manages

Rules outside this block are the project's own. Change the pieces below in
Lovable, not by hand. With the [Lovable MCP](https://mcp.lovable.dev)
connected, `send_message` asks Lovable to do it; otherwise ask the user to
use the editor.

- **Database.** Do not add or edit `supabase/migrations/` or `drizzle/`.
  Ask Lovable to change the schema.
- **Generated files.** Do not edit a file whose header says it is automatically
  generated.
- **AI gateway.** Keep model calls on Lovable's gateway, and keep
  `LOVABLE_API_KEY` out of browser code.
- **Connectors.** Lovable provides native connectors. `list_connectors` shows
  which are enabled; `add_connector` only returns the dashboard link. When a
  connector is enabled, calls go through the connector gateway and need
  `LOVABLE_API_KEY`. When Lovable does not provide one, users can bring their
  own key and store it in Secrets.
- **Secrets.** Lovable manages them. Do not put secret values in the repo.
<!-- LOVABLE:END -->

## Project rules
- No backend: mock creatives live in `src/lib/data.ts`; onboarding + saved IDs persist via `useLocal` in `src/lib/store.ts` (reads after mount to keep SSR/hydration in sync).
- Globe is a 3D WebGL globe (`globe.gl`, dynamic import in `src/components/Globe.tsx`): a smooth deep-plum sphere with land as one even field of pink dots over real coastlines (so places sit where they really are), a faint coastline for close-ups, a soft pink atmosphere, slow auto-spin, transparent liquid-glass pop-up cards (with a View profile button) that appear as it turns, above the pin or below it when the search bar is in the way. Home starts with the globe at about half the screen (`HOME_VIEW`, `DOWN`). `/` and `/intro` are `ssr: false` and sit on `SpaceBackground` (React Bits `Particles`, from `@react-bits/Particles-JS-CSS`, in `src/components/Particles.jsx`; one local change: its cleanup no longer force-loses the WebGL context, because React StrictMode re-mounts on the same canvas in dev/preview and the background went blank — keep that if the component is re-installed). Pin/card styles are the `.globe-*` classes in `src/styles.css`.
- Styling: black base, liquid-glass controls (sheen + lit edge + drop shadow) and one accent family — pink `#f8bcff` → rose `#ad5d84` → plum `#4a2140`. Use the utilities in `src/styles.css` (`btn`/`btn-primary`/`btn-secondary`, `chip`, `tag`, `field`, `glass`, `icon-btn`, `glass-bar` + `orb` for the search bar) instead of ad-hoc styles.
- Type: Courier Prime only (h1, h2 and globe-card names in bold uppercase); five sizes only — 13 / 15 / 18 / 24 / 32 px (Tailwind `text-xs`/`text-sm`/`text-lg`/`text-2xl`/`text-3xl`; other text-* sizes are mapped onto these). Nothing smaller than 13 px.
- Logo: `src/assets/named-logo-white.png` (white on transparent).
- Screen changes cross-fade via the router's `defaultViewTransition` + `::view-transition-*` rules in `src/styles.css`.
- Viewport: iPhone 16 (393 × 852). `.phone-frame` in `src/styles.css` frames the app on larger screens.
- App icons come from `src/components/PixelIcons.tsx`: 1-bit pixel art on a 16×16 grid (crispEdges) with a rose pixel shadow offset one cell for a funky misprint look; `active` = pink pixels (star/heart also filled), `fill` fills the inside.
- Profile tab (`/me`) follows a card layout: profile card → Portfolio card (Add work · Edit · View preview, Works/Layout row) → Saved · Recently viewed (`/recent`, `named.recent`, filled when a profile opens) · Events (`/events`, sample events, RSVPs in `named.rsvp`) → link to namedcollective.com.
- Own profile (`named.profile`) and demo chats (`named.chats`, seeded on first read) live in localStorage via `src/lib/store.ts`; uploads are stored as shrunk data URLs, so `writeLocal` returns false when storage is full and callers must tell the user.

- Discovery ranking and sample profile offers live in `src/lib/discovery.ts`; reuse the existing interest scores and neighbourhood centroids so sorting and distance never use precise locations.
- Profile neighbourhood headers use a local stylised SVG street grid in `NeighbourhoodMap`; never imply an exact address or request external map tiles.
- Visitor profiles and chat portfolio panels share the sketch-based `CreativePortfolio`; only visitor navigation actions differ so layout and profile details cannot drift.
- Discover and visitor profiles share `SwipeRow` with stable snap widths and 44px previous/next controls so touch and keyboard users can browse the same content.
- Verification is a mock-only public screen with no input, upload, or network submission.
