/* ===========================================================================
   §1  MEDIA MANIFEST

   Every channel points at real media on the store's own CDN, so the board is
   playing the actual objects from day one rather than placeholder plates.

   These are Wix-hosted URLs. They work, and they are yours — but they are
   also the one thing on this page that depends on the Wix account staying
   open. When the shop moves off Wix, drop the files into `public/media/` and
   change `src` to a local path. Nothing else in the codebase changes, because
   every URL on the page comes from this block and nowhere else.

   `w_600,h_900` in a Wix URL is a resize instruction, not part of the file
   name — raise it for a larger cell and Wix re-renders on the fly.
   =========================================================================== */
const WIX_IMG = "https://static.wixstatic.com/media";
const WIX_VID = "https://video.wixstatic.com/video";

const shot = (id, ext = "png", w = 700, h = 1050) =>
  `${WIX_IMG}/${id}~mv2.${ext}/v1/fill/w_${w},h_${h},al_c,q_90,usm_0.66_1.00_0.01,enc_auto/${id}~mv2.${ext}`;

/** The house film. Autoplays muted in the centre cell once it is switched on;
    never preloaded, because 3.8MB behind an idle board is somebody's data. */
export const FILM = `${WIX_VID}/08f390_c95daaaf3a994b1caa78299feed7bbf2/720p/mp4/file.mp4`;

/* ===========================================================================
   §2  THE BOARD — nine cells

   Eight objects and, in the middle, the film. Every cell reads OFF until it is
   switched on. That is the whole hero: no headline competing with it, no
   carousel, no scroll-jacked reel. A wall of things you could be, dark until
   you pick.

   `n` and `series` are the shop's own naming — THE OFF DUTY / 02 — carried
   across so a visitor arriving here and landing in the shop meets the same
   objects under the same names.
   =========================================================================== */
export const CHANNELS = [
  {
    n: "08",
    series: "The Side Quest",
    name: "Bucket Hat",
    line: "Headwear",
    price: 1499,
    slug: "the-side-quest-08-bucket-hat",
    src: shot("08f390_83b213d978794b88a0b7f4733e7d09c8"),
    read: "Shade, and somewhere to hide.",
  },
  {
    n: "02",
    series: "The Off Duty",
    name: "Cap",
    line: "Headwear",
    price: 1299,
    slug: "the-off-duty-02-cap",
    src: shot("08f390_d81460b081634cc9aa58652ebf457e77"),
    read: "Says you are not working today before anything else does.",
  },
  {
    n: "06",
    series: "The Observer",
    name: "Statement Sunglasses",
    line: "Eyewear",
    price: 2899,
    slug: "the-observer-06-statement-sunglasses",
    src: shot("08f390_405656b032f546ff94bdb90b75a0fc72"),
    read: "Dark enough to end a conversation.",
  },
  {
    n: "04",
    series: "The Frame",
    name: "Sunglasses",
    line: "Eyewear",
    price: 2499,
    slug: "the-frame-04-sunglasses",
    src: shot("08f390_9ec509cdef0e47d8902031babb9a23b3"),
    read: "The quieter pair. Sits close, disappears into a face.",
  },

  /* the centre of the board is the film, not an object */
  {
    n: "—",
    film: true,
    name: "The film",
    line: "House",
    read: "Style is not worn. It's carried.",
  },

  {
    n: "05",
    series: "The Nomad",
    name: "Tote Bag",
    line: "Bags",
    price: 2799,
    slug: "the-nomad-05-tote-bag",
    src: shot("08f390_e76ceee8a03442cc859a040b5b3d9065", "webp"),
    read: "Holds a day. Folds into nothing when it is not holding one.",
  },
  {
    n: "07",
    series: "The Weekender",
    name: "Duffle Bag",
    line: "Bags",
    price: 4599,
    slug: "the-weekender-07-duffle-bag",
    src: shot("08f390_ab3b9bb09a8c417086ca54480cc4eba7", "jpeg", 562, 843),
    read: "Two nights, packed properly. The bag you are seen arriving with.",
  },
  {
    n: "04",
    series: "The Commute",
    name: "Messenger Bag",
    line: "Bags",
    price: 3999,
    slug: "the-commute-04-messenger-bag",
    src: shot("08f390_d4121fc3f8654de78c4bf9f62ef8ce6e", "jpeg", 500, 750),
    read: "A laptop, a charger and a paperback. Without the apology.",
  },
  {
    n: "03",
    series: "The After Hours",
    name: "Shoulder Bag",
    line: "Bags",
    price: 3499,
    slug: "the-after-hours-03-shoulder-bag",
    src: shot("08f390_24fbc33af8ca4232b4dd68c5b9ed1875"),
    read: "Small, deliberate, and out after dark.",
  },
];

export const OBJECTS = CHANNELS.filter((c) => !c.film);
export const CELL_COUNT = CHANNELS.length;

/* ===========================================================================
   §3  COPY — the shop's own voice, not a new one
   =========================================================================== */
export const STAGE = {
  season: "Autumn / Winter 2026",
  count: "Nine channels · eight objects and the film",
  cue: "Scroll",
};

/* The statement. The shop's hero question, asked again once the visitor has
   already spent a minute switching objects on and off. */
export const STATEMENT = {
  kicker: "(01) The question",
  lines: ["Who are you", { t: "today?", mark: true }],
  body: [
    "You are read before you speak. Six seconds, and a room has already decided — off a cap, a pair of frames, the bag on your shoulder. Objects you probably bought one at a time, years apart, for reasons you no longer remember.",
    "A small, deliberate system of objects for the way you want to be read. Curated, not stocked: the internet has enough products, and we would rather have opinions.",
  ],
};

/* The word slot in the middle of the page. It holds, cycles, and locks. Each
   of these is something a young man is currently sold as an ambition; the
   lock is the brand taking that ambition's place. */
export const NEXT_WORDS = [
  "first impression",
  "quiet one",
  "name they drop",
  "one they watch",
  "story that travels",
  "thing they whisper about",
];

export const NEXT_SUB = "Every great brand starts as a rumour";

/* The film section — the shop's own line, given the whole screen. */
export const FILM_COPY = {
  kicker: "(02) The film",
  line: "Style is not worn. It's carried.",
  body: "A small, deliberate system of objects for the way you want to be read.",
};

export const COLLECTION = {
  kicker: "(03) The collection",
  lines: ["Eight objects.", { t: "Styled for life.", mark: true }],
};

/* The six marks that run under the collection on the shop. They are the brand
   compressed to six words, so they stay, glyphs and all. */
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
   §4  WHERE THE SHOP LIVES
   One constant, because it appears in a dozen places and it moves the day the
   store gets a real domain.
   =========================================================================== */
export const SHOP_URL = "https://h6s-3afeb4f20280dc-shreyashm36240.wix-site-host.com";
export const piece = (slug) => `${SHOP_URL}/piece/${slug}`;

export const NAV = [
  ["Shop", `${SHOP_URL}/shop`],
  ["About", `${SHOP_URL}/about`],
  ["Edit", `${SHOP_URL}/edit`],
];
