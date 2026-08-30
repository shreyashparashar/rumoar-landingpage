import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { REELS, OBJECTS, INTRO, HERO, SHOP_URL, piece } from "./content.js";
import { reduced, money, scrollTo, useFrame } from "./lib.jsx";

/* ===========================================================================
   §1  THE INTRO  ◀ the show

   A long montage built out of the reels themselves. It escalates: one tile
   holding, then three, then seven, then twelve, then twenty flashing at 60ms
   — the wall building itself out of noise — before collapsing back to a
   handful and finally to nothing but the wordmark.

   The choreography is data, not code: INTRO.acts in content.js names how many
   tiles each act puts on screen, how fast they cut, how long it holds, and
   the line of type over it. Retiming the whole sequence is editing that array.

   Total runtime is the sum of the holds (~16s). Skippable from the first
   frame by click, key or the button, and shown once per browser session.
   =========================================================================== */

/* A pool of tile "slots" scattered across the viewport. Positions are fixed
   rather than random-per-render so the montage composes the same way every
   time — a wall that reshuffles on every load has no art direction. Values
   are percentages: [left, top, width, rotation]. */
const SLOTS = [
  [50, 50, 26, 0],
  [16, 22, 18, -3], [78, 20, 17, 2.5], [12, 72, 20, 2], [84, 74, 16, -2],
  [33, 12, 14, 1.5], [64, 84, 15, -1.5], [6, 46, 13, -2.5], [92, 48, 12, 2],
  [26, 62, 15, 3], [72, 38, 16, -2], [44, 26, 13, -1], [56, 70, 14, 2],
  [20, 38, 12, 2], [82, 60, 13, -3], [38, 84, 12, 1], [62, 14, 12, -2],
  [8, 60, 11, 1.5], [90, 32, 11, -1.5], [30, 46, 11, -2], [70, 56, 11, 2],
  [46, 62, 10, 1], [54, 34, 10, -1],
];

/* ---------------------------------------------------------------------------
   WHY THIS IS CANVAS AND NOT TWENTY <video> TAGS

   The obvious build — one <video> per tile, re-keyed on every cut — is what
   makes a laptop fan spin up. Two reasons:

     1. Re-keying a <video> destroys and recreates a hardware decoder. At a
        90ms cut that is eleven decoder teardowns a second, per tile.
     2. Twenty simultaneous decodes is twenty decodes, even if nineteen are
        16% of the screen.

   So: seven <video> elements are mounted ONCE, offscreen, and never touched
   again. Every tile is a <canvas> that blits whichever of the seven it is
   currently assigned. A "cut" becomes an integer change — no DOM work, no
   decoder churn, no layout. Decoder count is pinned at seven whether there
   are three tiles on screen or thirty.

   Painting is throttled to 30fps through the app's shared frame loop, and the
   canvases are capped at 320px wide because a tile is never bigger than that
   on screen. Both are fill-rate, which is the only cost left.
   --------------------------------------------------------------------------- */
const PAINT_HZ = 30;
/* A tile is never wider than ~300px on a 1440 screen, and most are half that.
   Painting at 240x300 rather than 320x400 is 44% fewer pixels per blit for no
   visible difference. */
const CANVAS_W = 240;
const CANVAS_H = 300;                     // 4:5, matching the source crop
/* How many tiles change clip on each beat. Reassigning all of them at once is
   both more expensive and worse-looking — the brief was some cutting while
   others hold, not the whole wall strobing in lockstep. */
const CUT_GROUPS = 3;
/* the scramble alphabet, narrow on purpose — drawn from the whole keyboard it
   reads as corruption rather than as a signal tuning in */
const POOL = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

/* ---------------------------------------------------------------------------
   ADAPTIVE DENSITY

   The montage is authored for a desktop. A four-core laptop, a phone, or a
   machine already busy with something else should not be handed twenty-three
   tiles and a 65ms cut just because the art direction says so.

   `deviceMemory` and `hardwareConcurrency` are both advisory and both absent
   on Safari, so the fallback is the middle tier rather than the best one —
   guessing high on an unknown machine is how you ship a stutter.
   --------------------------------------------------------------------------- */
function tierOf() {
  if (typeof navigator === "undefined") return 1;
  const cores = navigator.hardwareConcurrency || 0;
  const mem = navigator.deviceMemory || 0;
  const small = typeof window !== "undefined" && window.innerWidth < 760;
  if (small) return 0;                          // phones: calmest
  if (cores >= 8 && mem >= 8) return 2;         // desktop: full density
  if (cores >= 4) return 1;                     // laptop: middle
  return 0;
}
/* multiplier on tile count, and a floor on the cut interval, per tier */
const TIER = [
  { tiles: 0.45, minCut: 190 },
  { tiles: 0.7, minCut: 110 },
  { tiles: 1, minCut: 0 },
];

export function Boot({ onDone }) {
  const done = useRef(false);
  const pool = useRef([]);                // the seven <video> elements
  const posters = useRef([]);             // the seven posters, pre-scaled
  const tiles = useRef([]);               // the visible <canvas> elements
  const labels = useRef([]);              // each tile's caption node
  const assign = useRef([]);              // which reel each slot is showing
  const painted = useRef([]);             // what each tile last painted
  const acc = useRef(0);

  /* Nodes written to directly every frame, never through state. */
  const countEl = useRef(null);
  const barEl = useRef(null);
  const lineEl = useRef(null);

  /* actI is the ONLY state in this component. It changes seven times in the
     whole sequence. Everything else — the counter, the progress bar, the
     scrambling line, the tile assignments — is written straight to the DOM
     from the shared frame loop.

     This matters more than any video optimisation: a setState at 60Hz
     re-renders this tree, and this tree contains thirty elements whose `ref`
     callbacks were declared inline. An inline ref is a new function identity
     on every render, so React detaches and reattaches every one of them —
     roughly eighteen hundred ref operations a second, plus the reconciliation,
     before a single frame of video is decoded. That was the jam. */
  const [actI, setActI] = useState(0);
  const [gone, setGone] = useState(false);

  const tier = useMemo(tierOf, []);
  const raw = INTRO.acts[actI] || INTRO.acts[INTRO.acts.length - 1];
  const act = useMemo(() => ({
    ...raw,
    tiles: Math.max(raw.tiles ? 1 : 0, Math.round(raw.tiles * TIER[tier].tiles)),
    cut: raw.cut ? Math.max(raw.cut, TIER[tier].minCut) : raw.cut,
  }), [raw, tier]);
  const closing = !act.line;

  const TOTAL = useMemo(() => INTRO.acts.reduce((n, a) => n + a.hold, 0), []);
  const startedAt = useRef(0);

  /* Stable ref callbacks, created once. Passing `ref={el => arr[i] = el}`
     inline is what forced the detach/reattach churn above. */
  const tileRefs = useMemo(
    () => SLOTS.map((_, i) => (el) => { tiles.current[i] = el; }), []);
  const labelRefs = useMemo(
    () => SLOTS.map((_, i) => (el) => { labels.current[i] = el; }), []);
  const poolRefs = useMemo(
    () => REELS.map((_, i) => (el) => { pool.current[i] = el; }), []);

  const finish = useCallback(() => {
    if (done.current) return;
    done.current = true;
    setGone(true);
    pool.current.forEach((v) => { try { v.pause(); v.removeAttribute("src"); v.load(); } catch { /* gone */ } });
    setTimeout(() => onDone?.(), 900);
  }, [onDone]);

  /* posters, pre-scaled once to exact tile size */
  useEffect(() => {
    REELS.forEach((reel, i) => {
      const img = new Image();
      img.decoding = "async";
      img.onload = () => {
        const off = document.createElement("canvas");
        off.width = CANVAS_W;
        off.height = CANVAS_H;
        off.getContext("2d").drawImage(img, 0, 0, CANVAS_W, CANVAS_H);
        posters.current[i] = off;
      };
      img.src = reel.poster;
    });
    assign.current = SLOTS.map((_, i) => (i * 3) % REELS.length);
    startedAt.current = performance.now();
  }, []);

  useEffect(() => {
    pool.current.forEach((v) => v && v.play?.().catch(() => {}));
  }, []);

  /* the act clock — seven timeouts across the whole sequence */
  useEffect(() => {
    if (reduced()) { finish(); return; }
    if (actI >= INTRO.acts.length) { finish(); return; }
    const t = setTimeout(() => setActI((i) => i + 1), INTRO.acts[actI].hold);
    return () => clearTimeout(t);
  }, [actI, finish]);

  /* the cut clock — mutates a ref. No render. */
  const cutRef = useRef(act.cut);
  cutRef.current = act.cut;
  useEffect(() => {
    if (reduced() || !act.cut) return;
    let n = 0;
    const id = setInterval(() => {
      n++;
      const next = assign.current.slice();
      for (let i = 0; i < SLOTS.length; i++) {
        if ((i + n) % CUT_GROUPS === 0) next[i] = (n + i * 3) % REELS.length;
        else if (next[i] === undefined) next[i] = (i * 3) % REELS.length;
      }
      assign.current = next;
    }, act.cut);
    return () => clearInterval(id);
  }, [act.cut]);

  /* ——— the one loop: paints tiles, counter, bar and the scrambling line ——— */
  const scramble = useRef({ target: "", shown: "", seeds: [], t0: 0 });
  useEffect(() => {
    const target = act.line || "";
    scramble.current = {
      target,
      shown: target,
      seeds: Array.from({ length: target.length }, (_, i) => ({
        begin: i * 1.3, end: i * 1.3 + 7 + Math.random() * 11,
      })),
      t0: performance.now(),
    };
  }, [act.line]);

  useFrame((dt) => {
    if (done.current) return;
    const now = performance.now();

    /* counter + bar, written as text and a transform — no React involved */
    const p = Math.min(1, (now - startedAt.current) / TOTAL);
    if (countEl.current) {
      const v = String(Math.round(p * 100)).padStart(3, "0");
      if (countEl.current.textContent !== v) countEl.current.textContent = v;
    }
    if (barEl.current) barEl.current.style.transform = `scaleX(${p})`;

    /* the scrambling line */
    const sc = scramble.current;
    if (lineEl.current && sc.target) {
      const f = (now - sc.t0) / 16.7;
      let out = "";
      let settled = 0;
      for (let i = 0; i < sc.target.length; i++) {
        const ch = sc.target[i];
        const sd = sc.seeds[i];
        if (f >= sd.end || ch === " ") { out += ch; settled++; }
        else if (f >= sd.begin) out += POOL[(Math.random() * POOL.length) | 0];
        else out += " ";
      }
      if (settled < sc.target.length && lineEl.current.textContent !== out) {
        lineEl.current.textContent = out;
      } else if (settled === sc.target.length && lineEl.current.textContent !== sc.target) {
        lineEl.current.textContent = sc.target;
      }
    }

    /* the tiles, throttled */
    acc.current += dt;
    if (acc.current < 1 / PAINT_HZ) return;
    acc.current = 0;

    for (let i = 0; i < tiles.current.length; i++) {
      const cv = tiles.current[i];
      if (!cv) continue;
      const idx = assign.current[i] ?? i % REELS.length;

      const lab = labels.current[i];
      if (lab && lab.dataset.i !== String(idx)) {
        lab.dataset.i = String(idx);
        lab.textContent = REELS[idx].label;
      }

      const ctx = cv.getContext("2d");
      if (!ctx) continue;

      const v = pool.current[idx];
      if (v && v.readyState >= 2 && v.videoWidth) {
        ctx.drawImage(v, 0, 0, cv.width, cv.height);
        painted.current[i] = -1;
        continue;
      }
      if (painted.current[i] === idx) continue;
      const off = posters.current[idx];
      if (off && off.width) {
        ctx.drawImage(off, 0, 0);
        painted.current[i] = idx;
      }
    }
  });

  useEffect(() => {
    const key = (e) => { if (e.key !== "Tab") finish(); };
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  }, [finish]);

  if (reduced()) return null;

  /* Rendered once per act — seven times total, not sixty times a second. */
  const visible = SLOTS.slice(0, act.tiles);

  return (
    <div className={`ld ${gone ? "gone" : ""}`} onClick={finish} role="presentation">
      <div className="ld-pool" aria-hidden="true">
        {REELS.map((reel, i) => (
          <video key={reel.id} ref={poolRefs[i]} src={reel.t}
            muted loop playsInline autoPlay preload="auto" />
        ))}
      </div>

      <div className="ld-hud" aria-hidden="true">
        <span className="ld-tl mono">{INTRO.tl}</span>
        <span className="ld-tr mono">{INTRO.tr}</span>
        <span className="ld-bl mono">{INTRO.bl}</span>
        <span className="ld-br mono">{INTRO.br}</span>
      </div>

      <div className="ld-field" aria-hidden="true">
        {visible.map(([x, y, w, rot], i) => (
          <div className="ld-tile" key={i}
            style={{
              left: `${x}%`, top: `${y}%`, width: `${w}%`,
              "--rot": `${rot}deg`,
              animationDelay: `${(i % 6) * 40}ms`,
            }}>
            <canvas ref={tileRefs[i]} width={CANVAS_W} height={CANVAS_H} />
            <span className="ld-tile-l mono" ref={labelRefs[i]} />
          </div>
        ))}
      </div>

      <div className="ld-grade" aria-hidden="true" />

      <p className={`ld-line serif ${closing ? "out" : ""}`} ref={lineEl} aria-live="polite" />

      <div className={`ld-lock ${actI >= INTRO.acts.length - 1 ? "in" : ""}`} aria-hidden="true">
        <p className="ld-mark">
          {INTRO.mark.split("").map((c, i) => <span key={i}>{c}</span>)}
        </p>
        <p className="ld-tag mono">{INTRO.tag}</p>
      </div>

      <div className="ld-count mono">[ <span className="num" ref={countEl}>000</span> ]</div>
      <div className="ld-bar" aria-hidden="true"><i ref={barEl} /></div>
      <button className="ld-skip mono" onClick={finish}>Skip intro</button>
    </div>
  );
}

/* ===========================================================================
   §2  A TILE ON THE WALL

   Each object gets a tile that holds its photograph and cuts to its paired
   reel while awake, so the wall is motion and product at once rather than a
   grid of stills with a video bolted on.
   =========================================================================== */
function Tile({ obj, awake }) {
  const vid = useRef(null);
  const reel = REELS[obj.reel % REELS.length];
  /* the <video> is not given a source until this tile has been awake once.
     Before that the photograph carries the tile on its own, so a wall that
     has only ever shown four objects has only ever decoded four clips. */
  const [armed, setArmed] = useState(false);
  useEffect(() => { if (awake) setArmed(true); }, [awake]);

  useEffect(() => {
    const v = vid.current;
    if (!v) return;
    if (awake) v.play?.().catch(() => {});
    else v.pause?.();
  }, [awake, armed]);

  return (
    <a className={`cell cell-obj ${awake ? "awake" : ""}`}
      href={piece(obj.slug)} data-hot
      aria-label={`${obj.series} ${obj.n}, ${obj.name}, ${money(obj.price)}`}>
      <div className="cell-media">
        <img src={obj.still} alt="" loading="lazy" decoding="async"
          onError={(e) => e.currentTarget.setAttribute("data-failed", "")} />
        {armed ? (
          <video ref={vid} src={reel.t} poster={reel.poster}
            muted loop playsInline preload="none" aria-hidden="true" />
        ) : null}
      </div>
      <span className="cell-scan" />
      <div className="cell-hd">
        <span className="cell-n mono">{obj.n}</span>
        <span className="cell-s mono"><i />{awake ? "On air" : "Standby"}</span>
      </div>
      <div className="cell-ft">
        <span className="cell-ser mono">{obj.series} / {obj.n}</span>
        <b>{obj.name}</b>
        <span className="cell-pr mono">{money(obj.price)}</span>
      </div>
    </a>
  );
}

/* A pure-motion tile, no product attached — these are what keep the wall from
   reading as a catalogue laid flat. */
function ReelTile({ reel, awake }) {
  const vid = useRef(null);
  const [armed, setArmed] = useState(false);
  useEffect(() => { if (awake) setArmed(true); }, [awake]);
  useEffect(() => {
    const v = vid.current;
    if (!v) return;
    if (awake) v.play?.().catch(() => {});
    else v.pause?.();
  }, [awake, armed]);
  return (
    <div className={`cell cell-reel ${awake ? "awake" : ""}`} aria-hidden="true">
      <div className="cell-media">
        <img src={reel.poster} alt="" loading="lazy" decoding="async" />
        {armed ? (
          <video ref={vid} src={reel.t} poster={reel.poster}
            muted loop playsInline preload="none" />
        ) : null}
      </div>
      <span className="cell-scan" />
      <div className="cell-hd">
        <span className="cell-n mono">{reel.label}</span>
        <span className="cell-s mono"><i />{awake ? "Live" : "Standby"}</span>
      </div>
    </div>
  );
}

/* ===========================================================================
   §3  THE WALL — the hero

   Twelve tiles: the eight objects plus four pure-motion reels, interleaved so
   product and film alternate. Always autoplaying, on a rotation that lights a
   rolling handful and rests the others.

   It is also functional. The filter row above it actually narrows the wall by
   line, the count updates, and every product tile is a real link into the
   shop — so the hero is something a visitor uses, not only something they
   watch.
   =========================================================================== */
const LINE_OF = {
  "Bucket Hat": "Headwear", "Cap": "Headwear",
  "Statement Sunglasses": "Eyewear", "Sunglasses": "Eyewear",
  "Duffle Bag": "Bags", "Tote Bag": "Bags",
  "Messenger Bag": "Bags", "Shoulder Bag": "Bags",
};

/* `active` is false while the intro is on screen. Nothing behind an opaque
   overlay should be decoding video: the wall mounts so it is ready to be
   revealed, but it does not start until the intro hands over. */
export function Wall({ active = true }) {
  const [filter, setFilter] = useState("All");
  const [awake, setAwake] = useState(() => new Set());

  /* the twelve, interleaved: object, object, reel, object … */
  const cells = useMemo(() => {
    const objs = filter === "All"
      ? OBJECTS
      : OBJECTS.filter((o) => LINE_OF[o.name] === filter);
    const out = [];
    let ri = 0;
    objs.forEach((o, i) => {
      out.push({ kind: "obj", obj: o });
      if (i % 2 === 1 && ri < 4) out.push({ kind: "reel", reel: REELS[ri++] });
    });
    /* top the grid back up with motion when a filter thins it out */
    while (out.length < 12 && ri < REELS.length) out.push({ kind: "reel", reel: REELS[ri++] });
    return out.slice(0, 12);
  }, [filter]);

  useEffect(() => {
    if (!active) { setAwake(new Set()); return; }
    if (reduced()) { setAwake(new Set(cells.map((_, i) => i))); return; }
    let beat = 0;
    const tick = () => {
      const lit = new Set();
      const W = 5;
      for (let k = 0; k < W; k++) lit.add((beat + k * 2) % cells.length);
      setAwake(lit);
      beat++;
    };
    tick();
    const id = setInterval(tick, 2400);
    return () => clearInterval(id);
  }, [cells, active]);

  const shown = cells.filter((c) => c.kind === "obj").length;

  return (
    <header className="stage" id="board">
      <div className="wall" role="group" aria-label="The wall">
        {cells.map((c, i) => (
          c.kind === "obj"
            ? <Tile key={`o${c.obj.slug}`} obj={c.obj} awake={awake.has(i)} />
            : <ReelTile key={`r${c.reel.id}${i}`} reel={c.reel} awake={awake.has(i)} />
        ))}
      </div>

      <p className="season mono">{HERO.season}</p>

      {/* the working controls */}
      <div className="desk">
        <div className="desk-f" role="group" aria-label="Filter the wall">
          {HERO.filters.map((f) => (
            <button key={f} className={`fb mono ${filter === f ? "on" : ""}`}
              aria-pressed={filter === f} onClick={() => setFilter(f)}>{f}</button>
          ))}
        </div>

        <button className="cue" onClick={() => scrollTo("statement")} aria-label="Scroll on">
          <span className="mono">Scroll</span><i />
        </button>

        <div className="desk-e">
          <span className="mono desk-c" aria-live="polite">{shown} objects</span>
          <a className="mono desk-r" href={`${SHOP_URL}/shop`}>Enter the shop &rarr;</a>
        </div>
      </div>
    </header>
  );
}
