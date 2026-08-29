import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { REELS, OBJECTS, INTRO, HERO, SHOP_URL, piece } from "./content.js";
import { reduced, money, scrollTo, useScramble } from "./lib.jsx";

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

export function Boot({ onDone }) {
  const root = useRef(null);
  const done = useRef(false);

  const [actI, setActI] = useState(0);
  const [frame, setFrame] = useState(0);      // increments on every cut
  const [gone, setGone] = useState(false);
  const [pct, setPct] = useState(0);

  const act = INTRO.acts[actI] || INTRO.acts[INTRO.acts.length - 1];
  /* the closing act carries no line, and scrambling *toward* an empty string
     leaves a half-resolved word on screen. Hold the last real line in the
     scrambler and hide the element instead. */
  const closing = !act.line;
  const lineSrc = act.line || INTRO.acts[INTRO.acts.length - 2].line;
  const line = useScramble(lineSrc, { speed: 2.6 });

  const TOTAL = useMemo(
    () => INTRO.acts.reduce((n, a) => n + a.hold, 0),
    []
  );

  const finish = useCallback(() => {
    if (done.current) return;
    done.current = true;
    setGone(true);
    setTimeout(() => onDone?.(), 900);
  }, [onDone]);

  /* the act clock — walks the list, one timeout per act */
  useEffect(() => {
    if (reduced()) { finish(); return; }
    if (actI >= INTRO.acts.length) { finish(); return; }
    const t = setTimeout(() => setActI((i) => i + 1), INTRO.acts[actI].hold);
    return () => clearTimeout(t);
  }, [actI, finish]);

  /* the cut clock — flips which reel each visible slot is showing. This is
     what makes it flash: every `cut` ms the whole set re-picks. */
  useEffect(() => {
    if (reduced() || !act.cut) return;
    const id = setInterval(() => setFrame((f) => f + 1), act.cut);
    return () => clearInterval(id);
  }, [act.cut]);

  /* the counter, over the whole runtime */
  useEffect(() => {
    if (reduced()) return;
    const t0 = performance.now();
    let raf = 0;
    const step = (t) => {
      const p = Math.min(1, (t - t0) / TOTAL);
      setPct(Math.round(p * 100));
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [TOTAL]);

  useEffect(() => {
    const key = (e) => { if (e.key !== "Tab") finish(); };
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  }, [finish]);

  if (reduced()) return null;

  const visible = SLOTS.slice(0, act.tiles);

  return (
    <div className={`ld ${gone ? "gone" : ""}`} ref={root} onClick={finish} role="presentation">
      {/* corner HUD */}
      <div className="ld-hud" aria-hidden="true">
        <span className="ld-tl mono">{INTRO.tl}</span>
        <span className="ld-tr mono">{INTRO.tr}</span>
        <span className="ld-bl mono">{INTRO.bl}</span>
        <span className="ld-br mono">{INTRO.br}</span>
      </div>

      {/* the montage */}
      <div className="ld-field" aria-hidden="true">
        {visible.map(([x, y, w, rot], i) => {
          /* each slot walks the reel list at its own offset, so no two tiles
             ever show the same clip on the same beat */
          const reel = REELS[(frame + i * 3) % REELS.length];
          return (
            <div
              className="ld-tile"
              key={i}
              style={{
                left: `${x}%`, top: `${y}%`, width: `${w}%`,
                "--rot": `${rot}deg`,
                animationDelay: `${(i % 6) * 40}ms`,
              }}
            >
              <video
                key={reel.id + frame}
                src={reel.p}
                poster={reel.poster}
                autoPlay muted loop playsInline preload="auto"
              />
              <span className="ld-tile-l mono">{reel.label}</span>
            </div>
          );
        })}
      </div>

      {/* the line of type over the top. It leaves before the mark arrives —
          the two never share the screen. */}
      <p className={`ld-line serif ${closing ? "out" : ""}`} aria-live="polite">
        {closing ? "" : line}
      </p>

      {/* the wordmark, on the last act */}
      <div className={`ld-lock ${actI >= INTRO.acts.length - 1 ? "in" : ""}`} aria-hidden="true">
        <p className="ld-mark">
          {INTRO.mark.split("").map((c, i) => <span key={i}>{c}</span>)}
        </p>
        <p className="ld-tag mono">{INTRO.tag}</p>
      </div>

      <div className="ld-count mono">[ <span className="num">{String(pct).padStart(3, "0")}</span> ]</div>
      <div className="ld-bar" aria-hidden="true">
        <i style={{ transform: `scaleX(${pct / 100})` }} />
      </div>
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

  useEffect(() => {
    const v = vid.current;
    if (!v) return;
    if (awake) v.play?.().catch(() => {});
    else v.pause?.();
  }, [awake]);

  return (
    <a className={`cell cell-obj ${awake ? "awake" : ""}`}
      href={piece(obj.slug)} data-hot
      aria-label={`${obj.series} ${obj.n}, ${obj.name}, ${money(obj.price)}`}>
      <div className="cell-media">
        <img src={obj.still} alt="" loading="lazy" decoding="async"
          onError={(e) => e.currentTarget.setAttribute("data-failed", "")} />
        <video ref={vid} src={reel.p} poster={reel.poster}
          muted loop playsInline preload="none" aria-hidden="true" />
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
  useEffect(() => {
    const v = vid.current;
    if (!v) return;
    if (awake) v.play?.().catch(() => {});
    else v.pause?.();
  }, [awake]);
  return (
    <div className={`cell cell-reel ${awake ? "awake" : ""}`} aria-hidden="true">
      <div className="cell-media">
        <video ref={vid} src={reel.p} poster={reel.poster}
          muted loop playsInline preload="none" />
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

export function Wall() {
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
  }, [cells]);

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
