/* ===========================================================================
   §1  MEDIA — seven reels, all local

   Every clip lives in `public/media/`, transcoded to muted H.264 with
   faststart. `_p` is the 4:5 portrait cut the wall tiles use, `_l` the
   landscape cut for the intro montage and the film band, `.jpg` the poster.

   Nothing streams from an external CDN any more except the eight product
   stills, so the wall keeps playing even if the Wix account moves.

   To add a clip: transcode to the same two cuts, drop it here, add it to
   REELS. Nothing else changes — the wall reads the length of this array.
   =========================================================================== */
const r = (k, label) => ({
  id: k,
  label,
  p: `/media/${k}_p.mp4`,
  l: `/media/${k}_l.mp4`,
  poster: `/media/${k}.jpg`,
});

export const REELS = [
  r("v1", "Off duty"),
  r("v2", "The look"),
  r("v3", "Ember"),
  r("v4", "After hours"),
  r("v5", "Detail"),
  r("v6", "Field"),
  r("v7", "Night"),
];

export const FILM_WIDE = { src: REELS[2].l, poster: REELS[2].poster };

/* ===========================================================================
   §2  THE OBJECTS

   The eight pieces, from the shop, under the shop's own naming. Stills come
   from the store's CDN; each object is paired with a reel so its tile can cut
   between the photograph and moving footage.
   =========================================================================== */
const WIX = "https://static.wixstatic.com/media";
const shot = (id, ext = "png", w = 720, h = 900) =>
  `${WIX}/${id}~mv2.${ext}/v1/fill/w_${w},h_${h},al_c,q_90,usm_0.66_1.00_0.01,enc_auto/${id}~mv2.${ext}`;

export const OBJECTS = [
  { n: "08", series: "The Side Quest", name: "Bucket Hat", price: 1499, slug: "the-side-quest-08-bucket-hat", still: shot("08f390_83b213d978794b88a0b7f4733e7d09c8"), reel: 0 },
  { n: "02", series: "The Off Duty", name: "Cap", price: 1299, slug: "the-off-duty-02-cap", still: shot("08f390_d81460b081634cc9aa58652ebf457e77"), reel: 1 },
  { n: "06", series: "The Observer", name: "Statement Sunglasses", price: 2899, slug: "the-observer-06-statement-sunglasses", still: shot("08f390_405656b032f546ff94bdb90b75a0fc72"), reel: 4 },
  { n: "04", series: "The Frame", name: "Sunglasses", price: 2499, slug: "the-frame-04-sunglasses", still: shot("08f390_9ec509cdef0e47d8902031babb9a23b3"), reel: 2 },
  { n: "07", series: "The Weekender", name: "Duffle Bag", price: 4599, slug: "the-weekender-07-duffle-bag", still: shot("08f390_ab3b9bb09a8c417086ca54480cc4eba7", "jpeg", 562, 703), reel: 5 },
  { n: "05", series: "The Nomad", name: "Tote Bag", price: 2799, slug: "the-nomad-05-tote-bag", still: shot("08f390_e76ceee8a03442cc859a040b5b3d9065", "webp"), reel: 3 },
  { n: "04", series: "The Commute", name: "Messenger Bag", price: 3999, slug: "the-commute-04-messenger-bag", still: shot("08f390_d4121fc3f8654de78c4bf9f62ef8ce6e", "jpeg", 500, 625), reel: 6 },
  { n: "03", series: "The After Hours", name: "Shoulder Bag", price: 3499, slug: "the-after-hours-03-shoulder-bag", still: shot("08f390_24fbc33af8ca4232b4dd68c5b9ed1875"), reel: 3 },
];

/* ===========================================================================
   §3  THE INTRO

   Long, and built out of the reels themselves. The montage is described here
   as a list of ACTS so the sequence can be retimed without touching the
   component — each act names how many tiles are on screen, how fast they cut,
   and what line of type sits over them.
   =========================================================================== */
export const INTRO = {
  tl: "Rumoar Studio",
  tr: "AW 2026",
  bl: "Read first",
  br: "@rumoar",
  mark: "RUMOAR",
  tag: "A concept store for the way you want to be read",

  /* Each act: [tiles on screen, ms per cut, the line]. The component walks
     this list; total runtime is the sum of the `hold` values. */
  acts: [
    { tiles: 1, cut: 420, hold: 2000, line: "You are read" },
    { tiles: 3, cut: 260, hold: 2400, line: "before you speak." },
    { tiles: 7, cut: 150, hold: 2600, line: "Six seconds." },
    { tiles: 12, cut: 90, hold: 2400, line: "That's the whole conversation." },
    { tiles: 20, cut: 60, hold: 2200, line: "Every great brand" },
    { tiles: 7, cut: 190, hold: 2000, line: "starts as a rumour." },
    { tiles: 0, cut: 400, hold: 2600, line: "" },
  ],
};

/* ===========================================================================
   §4  COPY
   =========================================================================== */
export const HERO = {
  season: "Autumn / Winter 2026",
  count: "Twelve channels · always on",
  /* the hero's own controls, so the wall is a thing you use and not just a
     thing you watch */
  filters: ["All", "Headwear", "Eyewear", "Bags"],
};

export const STATEMENT = {
  kicker: "(01) The question",
  lines: ["Who are you", { t: "today?", mark: true }],
  body: [
    "You are read before you speak. Six seconds, and a room has already decided — off a cap, a pair of frames, the bag on your shoulder. Objects you probably bought one at a time, years apart, for reasons you no longer remember.",
    "A small, deliberate system of objects for the way you want to be read. Curated, not stocked: the internet has enough products, and we would rather have opinions.",
  ],
};

export const NEXT_WORDS = [
  "first impression",
  "quiet one",
  "name they drop",
  "one they watch",
  "story that travels",
  "thing they whisper about",
];
export const NEXT_SUB = "Every great brand starts as a rumour";

export const FILM_COPY = {
  kicker: "(02) The film",
  line: "Style is not worn. It's carried.",
  body: "A small, deliberate system of objects for the way you want to be read.",
};

export const CREED = [
  ["◆", "Quiet"],
  ["✳", "Considered"],
  ["◉", "Repairable"],
  ["✦", "Made here"],
  ["◇", "Unbothered"],
  ["✶", "Read first"],
];

/* ===========================================================================
   §5  THE SHOP & THE FOOTER

   The footer is the store's own, column for column, so the two properties end
   the same way. Anything changed on the Wix footer has to be changed here.
   =========================================================================== */
export const SHOP_URL = "https://h6s-3afeb4f20280dc-shreyashm36240.wix-site-host.com";
export const piece = (slug) => `${SHOP_URL}/piece/${slug}`;
const at = (path) => `${SHOP_URL}${path}`;

export const FOOTER = {
  cols: [
    ["Shop", [
      ["All objects", at("/shop")],
      ["Accessories", at("/shop?line=accessories")],
      ["Bags", at("/shop?line=bags")],
      ["Shirts", at("/shop?line=shirts")],
      ["Shoes", at("/shop?line=shoes")],
      ["Headwear", at("/shop?line=headwear")],
      ["Eyewear", at("/shop?line=eyewear")],
    ]],
    ["Help & info", [
      ["Shipping", at("/shipping")],
      ["Returns & exchanges", at("/returns")],
      ["Size guide", at("/size-guide")],
      ["About Rumoar", at("/about")],
      ["Contact us", at("/contact")],
      ["Studio (owner)", at("/studio")],
    ]],
  ],
  help: {
    title: "Need help?",
    line: "We're here for you.",
    hours: "Mon–Sat, 10am – 7pm.",
    cta: ["Talk to us", at("/contact")],
  },
  legal: "© 2026 Rumoar. All rights reserved.",
  made: "Made in India",
};

export const NAV = [
  ["Shop", at("/shop")],
  ["About", at("/about")],
  ["Contact", at("/contact")],
];
