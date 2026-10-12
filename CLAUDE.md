# Stevie Cain portfolio

Personal portfolio for Stevie Cain (Agile Digital Delivery Manager, founder of Atomic Web, Auckland NZ).

- Static site: plain HTML, CSS and JS. No build step, no dependencies.
- Live at https://stevie-cain-portfolio.vercel.app. Every push to `main` deploys automatically on Vercel.
- The layout and interactions are modelled on https://www.juanmoraromero.com. Check it when matching a behaviour.

## Files

| File | What it holds |
| --- | --- |
| `index.html` | Landing page: hero and the work carousel |
| `about.html` | Light About page: contents, statement, stacked experience chapters, quotes, contact cards |
| `styles.css` | All styling. Desktop rules, then `@media (max-width: 800px)` for mobile at the end of each area |
| `main.js` | Work carousel, About chapter stack, quotes carousel, contact drawer (injected on every page) |
| `assets/` | Images (Atomic Web logo) |

## Design system

- **Sizing unit.** `--u` is `100vw / 108` (13.33px at 1440px wide), clamped 12 to 18px, and 14px on mobile. Size things in `u`, not fixed px.
- **Grid.** `.row` is a 12-column grid with 1u gaps and 1.5u side padding.
  - The left column `.side` spans cols 1 to 3.
  - The main column `.main` spans cols 4 to 12 and has a 1px rule on its left.
  - `--col` is one column's width.
- **Colours.** Tokens on `:root`. The landing is dark (`#343131`); `body.page-about` redefines the tokens for the light About page.
- **Font.** Inter Tight (Google Fonts). Small UI text is 1u, weight 600.
- **Landing page on desktop.** It fills exactly one screen. The hero and work rows split the window height, and the mouse wheel steps the carousel instead of scrolling the page.
  - Rows are constrained with `minmax(0, 1fr)`, so content must shrink to fit.
  - Windows under 541px tall fall back to normal scrolling.
- **Mobile (800px and narrower).** Everything stacks into one column and the page scrolls normally.

## How the interactive parts work

- **Work tiles** (`index.html`, `.tile`):
  - The `data-company`, `data-role`, `data-year` and `data-summary` attributes fill the side panel.
  - `href` sets where the tile goes. Atomic Web links to https://atomicweb.co.nz; the others link to their chapter on `about.html`.
  - The active tile is full row height. Tile sizes come from `--row-h`, which `main.js` sets from the carousel's visible height.
- **About chapters** (`.chapter-panel` inside `.chapters`):
  - On desktop they pin under the top bar and slide up over each other as the page scrolls.
  - The open chapter gets `.is-current`, which plays its icon animation.
  - Each panel's `id` is used by deep links. Keep ids stable.
- **Chapter icons.** These are animated line icons from Moving Icons (MIT, credited in README and `styles.css`). To add one:
  1. Fetch `https://www.movingicons.dev/r/<name>.json`. It holds a Svelte component.
  2. Copy its SVG paths inline into `<span class="chapter-icon mi-<name>"><svg class="chapter-icon-main" ...>`.
  3. Port its keyframes into `styles.css` with an `mi-` prefix, triggered under `.is-current`.
- **Quotes.** These are placeholders. Edit the `<figure>` entries in `<template data-quotes>` in `about.html`.
- **Contact drawer.** Any element with `data-contact` opens it (`data-contact="message"` opens the Message tab). Sending opens the visitor's email app addressed to steviecain@outlook.com.

## Content rules

- **No em dashes** anywhere in site copy (Stevie's preference). Use commas, colons or "to" (for example "2021 to Present").
- **Spelling.** Use NZ/British spelling (organisation, colour).
- **Atomic Web facts.** Take them from https://atomic-web-v3.vercel.app: Portal, branded self-service hubs for sponsors, partners and staff. Link to https://atomicweb.co.nz.
- **Never invent testimonials, names, clients or figures.** Use clearly marked placeholders instead.
- **Experience** comes from Stevie's resume. The Marketing Coordinator role was removed from the About page on purpose.

## Before pushing

Playwright and Chromium are pre-installed (`require($(npm root -g) + '/playwright')`).

1. Open `index.html` and `about.html` from `file://` at 1440×900, 1000×600 and 390×844.
2. Check:
   - no horizontal overflow
   - the active work tile stays inside the window on desktop
   - no console errors
3. Commit, then push to `main`. Vercel deploys within about a minute.
