# RUMOAR — landing

The brand's front door. A wall of nine cells, all reading OFF until you switch
them on — eight objects and, in the middle, the house film. Then the question,
the **Be the next → RUMOAR** lock, the film full-bleed, the collection, and the
one opinionated line the brand owns.

Separate repo, separate deploy, separate domain from the Wix store. React +
Vite, no backend, no CMS.

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # → dist/
npm run preview
```

---

## Deploying to Vercel

1. Push this repo to GitHub.
2. Vercel → **Add New → Project** → import the repo.
3. Framework preset: **Vite**. Build `npm run build`, output `dist`. Vercel
   reads all of that from `vercel.json`, so leave the defaults alone.
4. Add the domain under **Settings → Domains**.

`base` is `/` in `vite.config.js` because Vercel serves from the domain root.
**Do not copy the shop's base-deriving logic into this repo** — that exists
because GitHub Pages serves a project site from `/repo/`, and here it would
look for `GITHUB_REPOSITORY`, find nothing, and work by accident.

Set `SHOP_URL` in `src/content.js` to wherever the store actually lives. It is
one constant because it appears in six places and it will move.

---

## What is where

| File | Holds |
|---|---|
| `src/content.js` | **Everything editable.** The eight objects, all copy, the media manifest, `SHOP_URL`. |
| `src/styles.js` | **The design system.** Tokens, type scale, every component's CSS. |
| `src/lib.jsx` | Frame loop, pinned-scroll progress, reveals, magnetic controls, scramble, grain, reticle. |
| `src/board.jsx` | The boot sequence and the full-bleed board. |
| `src/sections.jsx` | Creed, the question, *Be the next*, the film, the collection, the opinion, the close. |
| `src/App.jsx` | Shell — nav, atmosphere, section order. |

Two files cover almost every edit: **`content.js` to change what it says**,
**`styles.js` to change how it looks.** Neither requires touching a component.

---

## The board

Nine cells filling the viewport edge to edge — no margin, no headline sharing
the screen with them. Eight are the objects from the shop, under the shop's own
names (THE OFF DUTY / 02). The centre cell is the house film.

Off, a cell is a dark field with a number and a state. Armed (hover or keyboard
focus) it goes pale and the photograph half-surfaces. Live, the object arrives
in full colour and its series, name and price come up from the bottom.

Every cell is a real `<button>`, so tab and Enter already work and the state is
in `aria-pressed`. The pointer hint reads *"Tap a channel"* on touch, because
*hover to arm* is an instruction for a gesture a phone does not have.

Images are lazy and the film is not mounted at all until its cell is switched
on — nine images plus a 3.8MB video behind a board nobody has touched is
somebody's data plan. A failed image hides itself rather than leaving a broken
glyph across the wall.

---

## Media

Everything on the page — every product shot and the film — comes from the
manifest at the top of `src/content.js` and nowhere else. They currently point
at the store's own Wix CDN, so the board plays the real objects from day one.

That is also the one thing here that depends on the Wix account staying open.
When the shop moves, drop the files into `public/media/` and change `src` to a
local path. No component has to be touched.

`w_600,h_900` inside a Wix URL is a resize instruction, not part of the
filename — raise it for a larger cell and Wix re-renders on the fly.

---

## Be the next

Pinned for roughly three viewport heights. The lead holds while the slot
retunes through the things a young man is currently sold as an ambition, then
the lead is taken away and the name locks into its place.

- Driven from **scroll position, not a timer**, so the visitor controls it and
  can scrub back into it.
- The slot **scrambles** between words rather than cutting. A hard swap read as
  a broken carousel; the scramble reads as one signal resolving on a different
  word, which is the point of the section.
- The lock is the only place on the page type fills the viewport, so it only
  earns that once. It is the one thing allowed to break the 5.8rem ceiling —
  it is a wordmark, not typesetting.
- Word list is `NEXT_WORDS` in `content.js`. Six is the right number; the pin
  is sized to hold them.

Under `prefers-reduced-motion` the section stops being a scrub and becomes
three stacked states, all of them visible.

---

## Design notes

**The typefaces and colours are the shop's own**, read straight out of its
stylesheet: Inter Tight for display, Inter for body, Instrument Serif for the
voice, JetBrains Mono for the instrument — channel numbers, states, timecode.
Mono never sets a sentence. The signal is `#FF5722`, the store's own `--signal`,
and standby borrows its pale `--accent` so the two states never read as two
different oranges.

The ground is pure `#000`, which the shop already uses for its scroll section
and its footer. This page is not inventing a second identity — it is living in
the darkest room the brand already owns, and staying there end to end.

All of it sits in the `§1 TOKENS` block of `styles.js` and nowhere else.

The board carries no border-radius anywhere. Everything else is softened; the
one hard-cornered object is the one you operate, and that is the whole reason
it reads as equipment.

**Reveals are enhancements, never gates.** The hidden state lives on
`.rv.armed`, and `armed` is only ever added by the JavaScript that also owns the
observer which removes it. Without JS — a crawler, reader mode, a renderer that
never fires `IntersectionObserver` — content is simply visible. A 4s failsafe
catches the rest.

The boot runs **once per browser session** (`sessionStorage`). Clear it with
`sessionStorage.removeItem('rumoar.boot')`. `prefers-reduced-motion` skips it
entirely, and the scroll lock is released by JavaScript, never by CSS alone — a
failed boot must not leave the page frozen.

---

## Known stubs

- Newsletter validates and confirms, but posts nowhere. Point `submit` in
  `Close` at your ESP.
- `/media/og.jpg` is referenced by the Open Graph tags and does not exist yet.
  Export one at 1200×630 before you share the link anywhere.
- `SHOP_URL` in `content.js` is the long `wix-site-host.com` address. Change it
  the day the store gets a real domain — it is one constant feeding a dozen
  links.
- Prices are copied from the shop rather than fetched. Eight numbers, and they
  will drift; check them when the store's change.
