# Droply Redesign

Source of truth for visuals: Claude Design project "UI Design Overhaul"
(`Droply Redesign.dc.html` + its `organic` design-system stylesheet).

## Goal

Reskin Droply with the "Organic" design system (warm cream/terracotta/olive
palette, Caprasimo + Figtree fonts, pill buttons, rounded organic shapes) and
restructure the dashboard to match the mockup's sidebar-nav layout, while
preserving all existing functionality (Clerk auth, ImageKit upload, Drizzle
file/folder CRUD, star/trash/delete, toasts).

HeroUI is removed entirely and replaced with Tailwind CSS + shadcn/ui
components, per explicit direction — shadcn is Radix-based, already
compatible with the project's existing `cn()` (clsx + tailwind-merge) util,
and gives the interaction behavior (focus-trap dialogs, dropdown
positioning, table semantics) "for free" the same way HeroUI did, so no
custom component internals need to be hand-rolled.

## Decisions locked during brainstorming

- **Auth pages stay two routes** (`/sign-in`, `/sign-up`), not merged into
  one client-toggle page. All existing Clerk logic (including the sign-up
  email-verification step) is untouched — only the visuals change. The
  mockup's segmented Sign in/Sign up control becomes a two-link toggle
  between the routes.
- **Hero visual is a stylized illustration block** (icon on a soft
  blurred/organic-shaped background), not a real photo — the mockup's
  `<image-slot>` is a design-tool-only placeholder with no live-app
  equivalent.
- **No dark mode.** The mockup defines only a light palette. The app
  currently forces `dark` via a class on `<html>` — that forcing and the
  `next-themes` wiring are dropped rather than inventing an unrequested dark
  variant.
- **Storage meter is display-only**, computed client-side from already-
  fetched file sizes against a fixed 5GB constant (matching the mockup's
  "1.2 GB of 5 GB"). No schema change — the `files` table has no quota
  field and none is added.

## Design tokens

New CSS custom properties in `styles/globals.css`, values taken from the
design system's `styles.css`:

- `--color-bg: #f5ead8`, `--color-surface: #ebddc5`, `--color-text: #201e1d`
- `--color-accent: #c67139` (terracotta), `--color-accent-2: #7a8a5e` (olive)
- Neutral ramp 100–900, accent ramp 100–900, accent-2 ramp 100–900 (values
  as in the source stylesheet)
- Radius scale: sm 8px, md 16px, lg 28px (components round further: cards/
  dialogs to `lg*1.15`, buttons/tags/inputs to pill/999px)
- Shadows: sm/md/lg, soft ink-tinted per the source file

These map onto shadcn's expected token names (`--background`, `--foreground`,
`--primary`, `--primary-foreground`, `--secondary`, `--muted`, `--accent`,
`--destructive`, `--border`, `--input`, `--ring`, `--radius`) so shadcn
components pick them up automatically via `tailwind.config.js`'s
`hsl(var(--x))` color extension — the standard shadcn wiring, swapped from
the current `heroui()` plugin.

Fonts: Caprasimo (headings, via `next/font/google`) + Figtree (body),
replacing the current Inter/Fira Code (`config/fonts.ts` and
`app/layout.tsx`).

## Component migration (HeroUI → shadcn/ui)

| HeroUI (removed) | Replacement |
|---|---|
| `@heroui/button` | shadcn Button |
| `@heroui/card` | shadcn Card |
| `@heroui/modal` | shadcn Dialog |
| `@heroui/dropdown` | shadcn DropdownMenu |
| `@heroui/table` | shadcn Table |
| `@heroui/avatar` | shadcn Avatar |
| `@heroui/input` | shadcn Input + Label |
| `@heroui/tabs` | removed (dashboard tabs replaced by sidebar nav; auth mode toggle is plain links) |
| `@heroui/progress` | shadcn Progress |
| `@heroui/tooltip` | shadcn Tooltip |
| `@heroui/divider` | shadcn Separator |
| `@heroui/toast` + `addToast` | `sonner` (shadcn's standard toast lib) |
| `@heroui/system` `HeroUIProvider` | removed from `app/providers.tsx` |

`components/ui/Badge.tsx` (already custom, not HeroUI) and `lib/utils.ts`
(`cn`) are kept as-is — they're already shadcn-shaped.

`package.json`: remove all `@heroui/*` deps, `@react-aria/*`,
`@react-types/shared`, `next-themes`; add shadcn's runtime deps
(`@radix-ui/*` primitives pulled in per-component, `class-variance-authority`,
`tailwindcss-animate`, `sonner`).

## Pages

### Landing (`app/page.tsx`, `components/Navbar.tsx`)

Rebuilt to match the mockup: nav (logo badge + "Droply" wordmark, ghost
Sign in / primary Get started buttons), hero (accent tag, large Caprasimo
headline, subcopy, dual CTAs, decorative-circle illustration panel), 3
feature cards (Quick uploads / Smart organization / Locked down), CTA
banner section, footer. `Navbar` keeps its existing scroll/mobile-menu/
click-outside behavior and signed-in vs signed-out branching — only its
visuals and the user-menu implementation (now DropdownMenu) change.

### Auth (`app/sign-in/[[...sign-in]]/page.tsx`, `app/sign-up/[[...sign-up]]/page.tsx`, `SignInForm.tsx`, `SignUpForm.tsx`)

Split-panel layout: left decorative panel (headline + subcopy over the
accent-2 organic background), right shadcn Card with the segmented
Sign in/Sign up link toggle at the top. All existing `useSignIn`/
`useSignUp`, zod validation, error handling, and the sign-up verification-
code step are preserved verbatim — only replacing HeroUI `Input`/`Button`/
`Card` with shadcn equivalents and the visual chrome.

### Dashboard (`app/dashboard/page.tsx`, `components/DashboardContent.tsx`)

Restructured from top-tab layout to sidebar layout:

- Top nav: logo + user DropdownMenu (Profile / My files / Sign out) —
  reuses `Navbar`'s signed-in user menu pattern.
- New `components/DashboardSidebar.tsx`: All Files / Starred / Trash nav
  buttons (pill active-state, count badges sourced the same way `FileTabs`
  currently computes them), divider, Profile nav item, and a storage-usage
  block (label + `x of 5 GB` + Progress bar) computed from `files` state
  summed by `size`.
- `DashboardContent.tsx` owns `activeView: 'files' | 'profile'` (replacing
  the HeroUI `Tabs` `activeTab` state) and renders `DashboardSidebar` +
  either `FileList` or `UserProfile` in the main pane.
- The mockup is desktop-only and doesn't define a mobile sidebar layout.
  Below the `md` breakpoint, `DashboardSidebar` collapses into the existing
  slide-in drawer pattern already used by `Navbar`'s mobile menu (hamburger
  trigger, same open/close/click-outside logic) rather than a new pattern.

### File list (`components/FileList.tsx` and children)

Data layer (fetch, star/trash/delete/download, folder navigation state,
`ConfirmationModal` usage) is unchanged. Presentation changes:

- `FileTabs.tsx` is deleted — tab switching moves to `DashboardSidebar`,
  which is now the source of `activeTab` passed down as a prop (same
  filtering logic, moved up one level).
- New view-mode toggle (grid/table segmented icon buttons) next to the
  page heading; `viewMode` state added to `FileList`.
- New **grid view**: cards per mockup — thumbnail tile (real image via
  existing `IKImage`/`FileIcon` logic for images, colored icon tile for
  folders/pdf/doc/video), name + star icon, size/date meta, hover-revealed
  star/trash icon buttons.
- **Table view**: kept, restyled with shadcn Table, same columns/logic as
  today.
- Upload UI moves from the separate `FileUploadForm` card (previously in
  its own sidebar column) into a persistent drag-and-drop banner rendered
  above the file grid/table when viewing "All Files" at the root — same
  drag/drop handlers, 5MB validation, axios upload-progress, and the New
  Folder modal trigger, just relocated and restyled to match the mockup's
  inline banner.
- `FolderNavigation` (breadcrumb) keeps its logic, restyled to the
  mockup's compact "Home / FolderName" bar shown only when inside a folder.
- `FileActionButtons.tsx` is folded away — its heading now lives in the
  page header row (next to the view toggle), its Refresh/Empty Trash
  buttons move next to that heading.
- `FileActions.tsx` (per-row star/trash/delete/download buttons) is reused
  by both grid cards and table rows, restyled as small icon buttons.
- `FileEmptyState.tsx` restyled to match the mockup's centered empty-state
  card, same per-tab copy logic.
- `ConfirmationModal.tsx` rebuilt on shadcn Dialog, same props API, used
  unchanged by `FileList` for delete/empty-trash confirmation.

### Profile (`components/UserProfile.tsx`)

Same Clerk-backed data (`useUser`, `useClerk`) and sign-out handler,
restyled to the mockup's centered card: avatar, name, email, Account
status / Email verification tags, sign-out button. Rendered as a
`DashboardContent` view instead of a HeroUI `Tab` panel.

## Error handling

No error-handling behavior changes — all existing try/catch + toast-on-
failure patterns in `FileList`, `FileUploadForm`, `SignInForm`/`SignUpForm`
are preserved; only the toast call sites move from `addToast` (HeroUI) to
`sonner`'s `toast()`.

## Testing

UI/styling restructuring with no business-logic changes, so no new unit
tests. Verify manually via the dev server: upload (drag/drop + browse),
star/trash/restore/permanently-delete, empty trash, folder create/navigate/
breadcrumb, grid/table toggle, storage meter updates on upload, sign-in/
sign-up (including verification step), responsive nav (mobile menu,
sidebar on small screens), and that `npm run build`/`next lint` pass with
HeroUI fully removed.
