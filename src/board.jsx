import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  CELLS, OBJECTS, REELS_WIDE, LOADER, STAGE, SHOP_URL, piece,
} from "./content.js";
import { reduced, money, scrollTo, useScramble } from "./lib.jsx";

/* ===========================================================================
   §1  THE INTRO  ◀ the show

   A cinematic title sequence, not a spinner. It runs a single master clock,
   0 → 1 over ~6.5s, and reads distinct ACTS off that clock — the way the two
   reference reels are cut:

     0.00–0.14   the mark alone in black, a counter waking at 000
     0.10–0.42   footage bleeds in around it and the frame column assembles,
                 sliding up through a viewfinder gate
     0.14–0.74   a single line of type retunes on the centre — four phrases,
                 each scrambled out and replaced, the counter climbing behind
     0.74–0.90   the column parks, the gate snaps to the hero frame, the line
                 dissolves and the WORDMARK resolves letter by letter
     0.90–1.00   the tagline fades up, the counter hits 100, a light wipe
                 hands the page over

   Everything is derived from one number, so it can be scrubbed, paused, or
   skipped at any instant and always lands somewhere coherent. Skippable from
   the first frame; shown once per browser session.
   =========================================================================== */
const DURATION = 7200;                 // ms, the whole sequence
const clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);
/* progress within a sub-window [a,b] of the master clock, eased */
const seg = (p, a, b) => clamp01((p - a) / (b - a));
const easeOut = (t) => 1 - Math.pow(1 - t, 3);
const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

/* the frames that ride up through the gate: the two reels, then the stills */
const GATE_FRAMES = [
  ...REELS_WIDE,
  ...OBJECTS.map((o) => ({ poster: o.still, src: null })),
];

export function Boot({ onDone }) {
  const root = useRef(null);
  const col = useRef(null);
  const done = useRef(false);

  const [p, setP] = useState(0);         // master clock 0→1
  const [gone, setGone] = useState(false);
  const [act, setAct] = useState(0);     // which phrase is showing

  /* the phrase currently on the centre line, scrambled as it changes */
  const line = useScramble(LOADER.acts[act], { speed: 2.2 });

  const finish = useCallback(() => {
    if (done.current) return;
    done.current = true;
    setP(1);
    setGone(true);
    /* the unlock outlasts the wipe, or the page scrolls behind the overlay */
    setTimeout(() => onDone?.(), 900);
  }, [onDone]);

  /* the master clock */
  useEffect(() => {
    if (reduced()) { finish(); return; }
    const t0 = performance.now();
    let raf = 0;
    const tick = (t) => {
      const prog = clamp01((t - t0) / DURATION);
      setP(prog);
      if (prog >= 1) { finish(); return; }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [finish]);

  /* drive the phrase index off the clock — four acts across the type window */
  useEffect(() => {
    const w = seg(p, 0.16, 0.66);
    const i = Math.min(LOADER.acts.length - 1, Math.floor(w * LOADER.acts.length));
    setAct((prev) => (prev === i ? prev : i));
  }, [p]);

  /* everything positional is written straight to the DOM each frame, so the
     sequence never triggers a React reconcile just to move a pixel */
  useEffect(() => {
    const el = root.current;
    if (!el) return;

    const build = seg(p, 0.08, 0.40);          // footage + column assemble
    const type = seg(p, 0.16, 0.66);           // the line retunes, act by act
    const clear = seg(p, 0.62, 0.72);          // the line dissolves, alone
    const land = seg(p, 0.72, 0.90);           // the mark resolves
    const out = seg(p, 0.92, 1.0);             // wipe

    /* counter — climbs through build+type, locks at land */
    const pctVal = Math.round(clamp01(type * 0.86 + land * 0.14) * 100);
    el.style.setProperty("--pct", pctVal);
    const cnt = el.querySelector(".ld-count .num");
    if (cnt) cnt.textContent = String(pctVal).padStart(3, "0");

    /* the frame column slides up as it assembles, parks, then recedes as the
       mark takes over so the two never compete for the eye */
    if (col.current) {
      const travel = col.current.scrollHeight - col.current.clientHeight;
      const ride = easeInOut(clamp01(build * 0.7 + type * 0.3));
      col.current.style.transform = `translateY(${-ride * travel * 0.7}px)`;
      col.current.style.opacity = String((0.25 + 0.75 * easeOut(build)) * (1 - 0.8 * land));
    }

    /* the mark sits alone first, then shrinks up to a label as type takes over */
    const mark = el.querySelector(".ld-seed");
    if (mark) {
      const s0 = 1 - 0.5 * easeOut(build);
      mark.style.transform = `scale(${s0})`;
      mark.style.opacity = String(1 - easeOut(seg(p, 0.12, 0.24)));
    }

    /* the gate breathes open as the column builds */
    const gate = el.querySelector(".ld-gate");
    if (gate) {
      const g = easeOut(build);
      gate.style.opacity = String((0.15 + 0.85 * g) * (1 - land));
      gate.style.transform = `translate(-50%,-50%) scale(${0.94 + 0.06 * g + land * 0.5})`;
    }

    /* the type line — up during its window, dissolves at land */
    const typ = el.querySelector(".ld-line");
    if (typ) {
      const inn = easeOut(seg(p, 0.16, 0.22));
      typ.style.opacity = String(clamp01(inn * (1 - easeInOut(clear))));
      typ.style.transform = `translateY(${(1 - inn) * 14 - clear * 12}px)`;
    }

    /* the wordmark resolves letter by letter across `land`, and only after the
       line has fully cleared — the two never share the screen */
    const lock = el.querySelector(".ld-lock");
    if (lock) {
      lock.style.opacity = String(land > 0 ? 1 : 0);
      const spans = lock.querySelectorAll("span");
      spans.forEach((sp, i) => {
        const per = clamp01((land - i * 0.07) / 0.5);
        sp.style.transform = `translateY(${(1 - easeOut(per)) * 108}%)`;
        sp.style.opacity = String(per > 0 ? 1 : 0);
      });
    }
    const tag = el.querySelector(".ld-tag");
    if (tag) tag.style.opacity = String(easeOut(seg(p, 0.86, 0.98)));

    /* the wipe: a bar of light crosses and takes the overlay */
    const wipe = el.querySelector(".ld-wipe");
    if (wipe) wipe.style.transform = `scaleY(${out})`;

    /* the progress hairline */
    const bar = el.querySelector(".ld-bar i");
    if (bar) bar.style.transform = `scaleX(${clamp01(type * 0.86 + land * 0.14)})`;
  }, [p]);

  /* skip on any key or click */
  useEffect(() => {
    const key = (e) => { if (e.key !== "Tab") finish(); };
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  }, [finish]);

  if (reduced()) return null;

  return (
    <div className={`ld ${gone ? "gone" : ""}`} ref={root} onClick={finish} role="presentation">
      {/* corner HUD */}
      <div className="ld-hud" aria-hidden="true">
        <span className="ld-tl mono">{LOADER.tl}</span>
        <span className="ld-tr mono">{LOADER.tr}</span>
        <span className="ld-bl mono">{LOADER.bl}</span>
        <span className="ld-br mono">{LOADER.br}</span>
      </div>

      {/* the seed mark, alone at the start */}
      <div className="ld-seed" aria-hidden="true">R</div>

      {/* the running column of frames behind the gate */}
      <div className="ld-reel">
        <div className="ld-col" ref={col}>
          {GATE_FRAMES.concat(GATE_FRAMES).map((f, i) => (
            <div className="ld-fr" key={i}>
              {f.src ? (
                <video src={f.src} poster={f.poster} autoPlay muted loop playsInline preload="none" />
              ) : (
                <img src={f.poster} alt="" loading="eager" decoding="async"
                  onError={(e) => e.currentTarget.setAttribute("data-failed", "")} />
              )}
            </div>
          ))}
        </div>
        <div className="ld-gate" aria-hidden="true"><i /><i /><i /><i /></div>
      </div>

      {/* the retuning line of type */}
      <p className="ld-line serif" aria-live="polite">{line}</p>

      {/* the wordmark it resolves into */}
      <div className="ld-lock" aria-hidden="true">
        <p className="ld-mark">
          {LOADER.mark.split("").map((c, i) => <span key={i}>{c}</span>)}
        </p>
        <p className="ld-tag mono">{LOADER.tag}</p>
      </div>

      {/* centre-line labels */}
      <div className="ld-gateL mono">[ <span>{LOADER.gateL}</span> ]</div>
      <div className="ld-count mono">[ <span className="num">000</span> ]</div>

      {/* progress + skip */}
      <div className="ld-bar" aria-hidden="true"><i /></div>
      <button className="ld-skip mono" onClick={finish}>Skip intro</button>

      <div className="ld-wipe" aria-hidden="true" />
    </div>
  );
}

/* ===========================================================================
   §2  A CELL

   Every cell autoplays on its own. There is no toggle — the wall is alive the
   moment it is on screen.

   • reel   — a real motion clip, always running
   • object — the product photograph, drifting slowly (a still treated as
              footage) or its own reel once one is shot
   • bar    — a rest cell: dark most of the time, waking to a reel in rotation
              so the wall is never fully lit and never fully asleep

   The rotation in §3 drives each cell's `awake` prop. Motion fades in and out
   at the edges of a turn rather than cutting, so the wall breathes.
   =========================================================================== */
function Cell({ cell, awake, reelSrc }) {
  const vid = useRef(null);

  useEffect(() => {
    const v = vid.current;
    if (!v) return;
    if (awake) v.play?.().catch(() => {});
    else v.pause?.();
  }, [awake, reelSrc]);

  if (cell.kind === "bar") {
    return (
      <div className={`cell cell-bar ${awake ? "awake" : ""}`} aria-hidden="true">
        <div className="cell-media">
          {awake && reelSrc ? (
            <video ref={vid} src={reelSrc.src} poster={reelSrc.poster}
              autoPlay muted loop playsInline preload="none" />
          ) : null}
        </div>
        <span className="cell-scan" />
        <div className="cell-hd">
          <span className="cell-n mono">{cell.n}</span>
          <span className="cell-s mono"><i />{awake ? "On air" : "Standby"}</span>
        </div>
      </div>
    );
  }

  if (cell.kind === "reel") {
    return (
      <div className="cell cell-reel" aria-hidden="true">
        <div className="cell-media">
          <video ref={vid} src={cell.portrait.src} poster={cell.portrait.poster}
            autoPlay muted loop playsInline preload="metadata" />
        </div>
        <span className="cell-scan" />
        <div className="cell-hd">
          <span className="cell-n mono">{cell.n}</span>
          <span className="cell-s mono"><i />Live</span>
        </div>
      </div>
    );
  }

  return (
    <a className={`cell cell-obj ${awake ? "awake" : ""}`}
      href={piece(cell.slug)} data-hot
      aria-label={`${cell.series} ${cell.n}, ${cell.name}, ${money(cell.price)}`}>
      <div className="cell-media">
        <img src={cell.still} alt="" loading="lazy" decoding="async"
          onError={(e) => e.currentTarget.setAttribute("data-failed", "")} />
      </div>
      <span className="cell-scan" />
      <div className="cell-hd">
        <span className="cell-n mono">{cell.n}</span>
        <span className="cell-s mono"><i />On air</span>
      </div>
      <div className="cell-ft">
        <span className="cell-ser mono">{cell.series} / {cell.n}</span>
        <b>{cell.name}</b>
        <span className="cell-pr mono">{money(cell.price)}</span>
      </div>
    </a>
  );
}

/* ===========================================================================
   §3  THE WALL

   Twelve cells, always on. Reels run continuously. Bars and drift-objects take
   turns being awake: a rotation lights a rolling handful and lets the rest
   rest, which is the "some play while others are blank, then they hand off"
   behaviour — a schedule, not a set of switches the visitor operates.
   =========================================================================== */
export function Wall() {
  const [awake, setAwake] = useState(() => new Set());
  const [barReel, setBarReel] = useState({});

  const barIdx = CELLS.map((c, i) => (c.kind === "bar" ? i : -1)).filter((i) => i >= 0);
  const objIdx = CELLS.map((c, i) => (c.kind === "object" ? i : -1)).filter((i) => i >= 0);

  useEffect(() => {
    if (reduced()) { setAwake(new Set(objIdx)); return; }
    let beat = 0;
    const tick = () => {
      const lit = new Set();
      const W = 5;                       // how many objects glow at once
      for (let k = 0; k < W; k++) lit.add(objIdx[(beat + k) % objIdx.length]);
      setAwake(lit);
      const bi = barIdx[beat % barIdx.length];
      setBarReel({ [bi]: REELS_WIDE[beat % REELS_WIDE.length] });
      beat++;
    };
    tick();
    const id = setInterval(tick, 2600);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <header className="stage" id="board">
      <div className="wall" role="group" aria-label="The wall — twelve channels, always on">
        {CELLS.map((cell, i) => (
          <Cell
            key={i}
            cell={cell}
            awake={cell.kind === "reel" ? true : awake.has(i)}
            reelSrc={cell.kind === "bar" ? barReel[i] : null}
          />
        ))}
      </div>

      <p className="season mono">{STAGE.season}</p>

      <div className="desk">
        <p className="mono desk-c">{STAGE.count}</p>
        <button className="cue" onClick={() => scrollTo("statement")} aria-label="Scroll to the statement">
          <span className="mono">Scroll</span><i />
        </button>
        <a className="mono desk-r" href={`${SHOP_URL}/shop`}>Enter the shop &rarr;</a>
      </div>
    </header>
  );
}
