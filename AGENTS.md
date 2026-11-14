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
- Globe is a 3D WebGL globe (`globe.gl`, dynamic import in `src/components/Globe.tsx`): pink-tinted NASA night-lights texture (`public/textures/earth-night.jpg`) so places sit where they really are, pink dot sprinkle + coastline, pink atmosphere, slow auto-spin, glass pop-up cards (with a View profile button) that appear as it turns. `/` and `/intro` are `ssr: false` and sit on `SpaceBackground` (React Bits `Particles`, from `@react-bits/Particles-JS-CSS`, in `src/components/Particles.jsx`). Pin/card styles are the `.globe-*` classes in `src/styles.css`.
- Styling: black base with frosted-glass controls and pink glow accents. Use the utilities in `src/styles.css` (`btn`/`btn-primary`/`btn-secondary`, `chip`, `tag`, `field`, `glass`, `icon-btn`, `glass-bar` + `orb` for the search bar) instead of ad-hoc styles.
- Type: Questrial only, five sizes only — 13 / 15 / 18 / 24 / 32 px (Tailwind `text-xs`/`text-sm`/`text-lg`/`text-2xl`/`text-3xl`; other text-* sizes are mapped onto these). Nothing smaller than 13 px.
- Viewport: iPhone 16 (393 × 852). `.phone-frame` in `src/styles.css` frames the app on larger screens.
- App icons come from `src/components/PixelIcons.tsx` (name kept for imports): smooth lucide vector icons so they stay sharp at any size; `active` = bolder stroke (filled for star/heart).
- Own profile (`named.profile`) and demo chats (`named.chats`, seeded on first read) live in localStorage via `src/lib/store.ts`; uploads are stored as shrunk data URLs, so `writeLocal` returns false when storage is full and callers must tell the user.
