# Design contract

This file defines the UI/UX contract for the docs site in `apps/docs`. `GLOSSARY.md` holds domain terms; this file holds presentation rules.

## Aesthetic direction

- Discord-inspired, dark-first.
- Calm surfaces, one strong accent, no decorative noise.
- Code-forward: code blocks and signatures are first-class content.
- Safety is visible: the token risk appears on the landing page and in the docs.

## Color tokens

Defined in `apps/docs/app/global.css` with Tailwind v4 `@theme` and `.dark` overrides.

| Token | Value | Use |
| --- | --- | --- |
| `--color-discord-blurple` | `#5865f2` | Primary actions, links, accent |
| `--color-discord-green` | `#57f287` | Online status, success marks |
| `--color-fd-primary` | blurple (light), `#7983f5` (dark) | Fumadocs primary |
| `--color-fd-background` | near-white (light), `hsl(228 8% 6.5%)` (dark) | Page background |
| `--color-fd-card` | white (light), `hsl(228 7% 9.5%)` (dark) | Cards and panels |
| `--color-fd-border` | light gray (light), `hsl(228 7% 18%)` (dark) | Borders |

Rules:

- Use tokens or Fumadocs utility classes. Do not add raw hex values outside `global.css`, SVG brand assets, and metadata images.
- Use Tailwind v4 utilities (`bg-fd-card`, `border-fd-border`, `text-fd-muted-foreground`, `bg-linear-to-b`).
- No inline `style={{}}` objects in app code.

## Typography

- Sans: Geist, loaded through `next/font/google`, mapped to `--font-sans`.
- Mono: JetBrains Mono, mapped to `--font-mono`.
- Headings use `tracking-tight`; body text uses `leading-6` or `leading-8`.
- Code blocks use the mono font at 13–14px.

## Layout

- Max content width: `max-w-5xl` for landing sections, Fumadocs default for docs pages.
- Landing hero: two columns on `lg`, one column below `lg`.
- Docs: Fumadocs sidebar + content + TOC. The sidebar is the primary API navigation.
- Keep one primary action per section.

## Components

- Use Fumadocs UI primitives: `Callout`, `Cards`, `Card`, `Tabs`, `Tab`, `Steps`, `Step`, `Files`, `Folder`, `File`, `Accordion`, `TypeTable`.
- App-specific icons live in `apps/docs/components/icons.tsx` as a concept-keyed `ICON` registry. Do not import `lucide-react` directly in pages.
- Fumadocs UI internal icons are owned by the framework and are exempt.
- Prefer a single `Icon` component with `aria-hidden="true"` and `focusable="false"`.

## Responsive rules

- Mobile: 375px. One column. The docs sidebar becomes a drawer.
- Tablet: 768px. Two-column feature grids.
- Desktop: 1024–1440px. Hero two-column layout and full docs sidebar.
- No horizontal scroll except inside code blocks and wide tables.

## Motion

- Default to CSS transitions (`transition-colors`, `transition-opacity`).
- No scroll-linked or staggered animation in v1.
- Respect `prefers-reduced-motion` through Fumadocs UI defaults.

## Copy voice

- Direct, technical, and honest.
- Short sentences. One meaning per word.
- Do not promise account safety. State the risk.
- Use "selfbot", "user token", "account", "guild", "channel", and "client" as defined in `GLOSSARY.md`.
- Avoid marketing superlatives.

## Term table

| Internal term | Displayed term | Notes |
| --- | --- | --- |
| selfbot | selfbot | Automation on a user account |
| user token | user token | A full-access account credential |
| bot token | bot token | Not supported by this library |
| guild | server | Display "server" in user-facing prose, `Guild` in API names |
| channel | channel | Keep |
| client | client | The `Client` instance |
| API reference | API reference | Generated pages |
| parity | parity | Comparison with discord.js v14 |

## File shape

- Target ≤250 formatted lines per TS/TSX file; hard cap 300.
- One screen or one concern per file.
- Generated API MDX is exempt from the line cap and is not edited by hand.
