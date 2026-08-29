/* ===========================================================================
   §1  MEDIA

   Two kinds of source feed the wall:

   • REELS — real motion, transcoded from the uploaded footage and served from
     `public/media/`. These are what actually play. `_p` is the portrait cut
     for the board tiles, `_l` the landscape cut for the loader and the film
     band. `.jpg` is the poster, shown before a clip has decoded a frame.

   • STILLS — the eight product photographs on the store's Wix CDN. A still in
     a video tile is treated as footage that happens to hold one frame: it gets
     the same slow drift and scan the reels get, so the wall reads as one
     material even where the motion is faked.

   To turn a still tile into real footage later, shoot a 6–10s portrait loop,
   drop `name_p.mp4` + `name.jpg` into `public/media/`, and set `reel:` on that
   channel. Nothing else changes — the cell is already a <video>.
   =========================================================================== */
const WIX = "https://static.wixstatic.com/media";
const shot = (id, ext = "png", w = 720, h = 1080) =>
  `${WIX}/${id}~mv2.${ext}/v1/fill/w_${w},h_${h},al_c,q_90,usm_0.66_1.00_0.01,enc_auto/${id}~mv2.${ext}`;

const reel = (name) => ({
  src: `/media/${name}_p.mp4`,
  poster: `/media/${name}.jpg`,
});

/* the two landscape reels, for the loader gate and the film band */
export const REELS_WIDE = [
  { src: "/media/reel-a_l.mp4", poster: "/media/reel-a.jpg" },
  { src: "/media/reel-b_l.mp4", poster: "/media/reel-b.jpg" },
];
export const FILM_WIDE = REELS_WIDE[1];

/* ===========================================================================
   §2  THE WALL — twelve channels

   A 4×3 grid, wider than it is deliberate. Not every cell is a product: the
   two real reels and two "bars" (dark rest cells that wake in rotation) are
   scattered through the eight objects so the wall never reads as a catalogue
   laid flat. Positions are set here, not shuffled at runtime, because a wall
   that reorders on every load has no composition.

   `kind` is one of: "object" (a product, drifting still or its own reel),
   "reel" (one of the two motion clips), "bar" (a rest cell — dark, wakes on
   rotation to a reel). Every cell autoplays on its own schedule; nothing waits
   to be switched on.
   =========================================================================== */
export const CELLS = [
  { kind: "object", n: "08", series: "The Side Quest", name: "Bucket Hat", line: "Headwear", price: 1499, slug: "the-side-quest-08-bucket-hat", still: shot("08f390_83b213d978794b88a0b7f4733e7d09c8") },
  { kind: "reel", n: "R1", name: "Field", ...REELS_WIDE[0], portrait: reel("reel-a") },
  { kind: "object", n: "02", series: "The Off Duty", name: "Cap", line: "Headwear", price: 1299, slug: "the-off-duty-02-cap", still: shot("08f390_d81460b081634cc9aa58652ebf457e77") },
  { kind: "object", n: "06", series: "The Observer", name: "Statement Sunglasses", line: "Eyewear", price: 2899, slug: "the-observer-06-statement-sunglasses", still: shot("08f390_405656b032f546ff94bdb90b75a0fc72") },

  { kind: "object", n: "04", series: "The Frame", name: "Sunglasses", line: "Eyewear", price: 2499, slug: "the-frame-04-sunglasses", still: shot("08f390_9ec509cdef0e47d8902031babb9a23b3") },
  { kind: "bar", n: "—" },
  { kind: "object", n: "07", series: "The Weekender", name: "Duffle Bag", line: "Bags", price: 4599, slug: "the-weekender-07-duffle-bag", still: shot("08f390_ab3b9bb09a8c417086ca54480cc4eba7", "jpeg", 720, 1080) },
  { kind: "reel", n: "R2", name: "Night", ...REELS_WIDE[1], portrait: reel("reel-b") },

  { kind: "object", n: "05", series: "The Nomad", name: "Tote Bag", line: "Bags", price: 2799, slug: "the-nomad-05-tote-bag", still: shot("08f390_e76ceee8a03442cc859a040b5b3d9065", "webp") },
  { kind: "object", n: "04", series: "The Commute", name: "Messenger Bag", line: "Bags", price: 3999, slug: "the-commute-04-messenger-bag", still: shot("08f390_d4121fc3f8654de78c4bf9f62ef8ce6e", "jpeg", 500, 750) },
  { kind: "bar", n: "—" },
  { kind: "object", n: "03", series: "The After Hours", name: "Shoulder Bag", line: "Bags", price: 3499, slug: "the-after-hours-03-shoulder-bag", still: shot("08f390_24fbc33af8ca4232b4dd68c5b9ed1875") },
];

export const OBJECTS = CELLS.filter((c) => c.kind === "object");

/* ===========================================================================
   §3  THE LOADER

   A viewfinder gate with a column of frames running up through it and a
   counter racing 0→100 — the language of the two reference loaders. The
   labels sit in the four corners the way a camera's HUD does. Everything here
   is copy, so it is all in one place.
   =========================================================================== */
export const LOADER = {
  /* corner HUD */
  tl: "Rumoar Studio",
  tr: "AW 2026",
  bl: "Read first",
  br: "@rumoar",
  /* the words that flash on the centre line as the reel builds, one per act.
     Each is held, scrambled out, replaced — the reference reels do exactly
     this: a single line of type retuning while the footage assembles. */
  acts: [
    "Every great brand",
    "starts as a rumour.",
    "Nine objects.",
    "One recognisable you.",
  ],
  gateL: "The wardrobe",
  /* the wordmark the whole thing resolves into, letter by letter */
  mark: "RUMOAR",
  tag: "A concept store for the way you want to be read",
  enter: "Enter",
};

/* ===========================================================================
   §4  COPY — the shop's own voice
   =========================================================================== */
export const STAGE = {
  season: "Autumn / Winter 2026",
  count: "Twelve channels · always on",
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

export const COLLECTION = {
  kicker: "(03) The collection",
  lines: ["Eight objects.", { t: "Styled for life.", mark: true }],
};

export const CREED = [
  ["◆", "Quiet"],
  ["✳", "Considered"],
  ["◉", "Repairable"],
  ["✦", "Made here"],
  ["◇", "Unbothered"],
  ["✶", "Read first"],
];

export const OPINION = "The internet has enough products. We have opinions.";

export const CLOSE = {
  kicker: "Coming soon",
  lines: ["Fall / Winter", { t: "'26.", mark: true }],
  body: "One letter a month. The next drop, before anyone repeats it.",
};

/* ===========================================================================
   §5  WHERE THE SHOP LIVES
   =========================================================================== */
export const SHOP_URL = "https://h6s-3afeb4f20280dc-shreyashm36240.wix-site-host.com";
export const piece = (slug) => `${SHOP_URL}/piece/${slug}`;
export const NAV = [
  ["Shop", `${SHOP_URL}/shop`],
  ["About", `${SHOP_URL}/about`],
  ["Edit", `${SHOP_URL}/edit`],
];
