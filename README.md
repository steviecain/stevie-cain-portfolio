# Stevie Cain Portfolio

Personal portfolio and resume site for Stevie Cain, Agile Digital Delivery Manager and founder of Atomic Web, based in Auckland, New Zealand.

Plain static HTML, CSS and JS. No build step.

## Structure

| File | What it is |
| --- | --- |
| `index.html` | Landing page: hero and the selected work carousel. On desktop it fills exactly one screen and the mouse wheel steps through the work |
| `about.html` | Light About page: contents, profile statement, experience chapters that stack as you scroll, quotes and contact cards |
| `styles.css` | Shared styles for both pages |
| `main.js` | Work carousel (wheel, swipe, drag, arrow keys) and the contact drawer |
| `assets/` | Images (Atomic Web logo) |

## Run locally

Open `index.html` in a browser, or serve it:

```
npx serve .
```

## Deploy to Vercel

1. Go to vercel.com and choose **Add New > Project**
2. Import this GitHub repository
3. Leave every setting as default (Framework: Other) and click **Deploy**

## Editing

**Project tile links.** Each tile in `index.html` is an `<a class="tile" href="...">`. The Atomic Web tile links to atomicweb.co.nz. The others currently link to their role on `about.html` (for example `about.html#nzte-ddm`). Change the `href` to point at a live site or a project detail page.

**Work panel text.** The Company, Role, Year and summary shown beside the carousel come from each tile's `data-company`, `data-role`, `data-year` and `data-summary` attributes.

**Layout.** Sizes follow a 12 column grid that scales with the browser width. Everything is based on `--u` in `styles.css` (13.33px on a 1440px wide screen).

**Quotes.** The quotes on the About page are placeholders. Edit the `<figure>` entries inside `<template data-quotes>` in `about.html`: the text is the quote, `data-name` and `data-role` are the person. Add or remove entries and the counter updates itself.

**Contact form.** The drawer form opens the visitor's email app with a pre-filled message to steviecain@outlook.com. To change the address, edit `EMAIL` at the top of `main.js`.

**Headshot.** Replace the `SC` monogram in `index.html` with an image:

```html
<img class="monogram" src="assets/headshot.jpg" alt="Stevie Cain">
```

## Credits

The animated chapter icons on the About page are from [Moving Icons](https://www.movingicons.dev) (MIT License, Copyright (c) 2024 jis3r), based on [Lucide](https://lucide.dev) (ISC License). They are inlined as SVG in `about.html`, with their animations in `styles.css`.
