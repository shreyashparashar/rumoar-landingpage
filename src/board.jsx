import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  CELLS, OBJECTS, REELS_WIDE, LOADER, STAGE, SHOP_URL, piece,
} from "./content.js";
import { reduced, money, scrollTo, useScramble } from "./lib.jsx";

/* ===========================================================================
   §1  THE LOADER

   A viewfinder gate, the way the reference reels do it: a column of frames
   runs upward through a bracketed gate in the centre while a counter races
   0→100, four labels sit in the corners like a camera's HUD, and at 100 the
   gate hands the site its first frame.

   The counter eases to 100 over a fixed duration rather than tracking real
   asset load — real load on a warm cache finishes in 80ms, and a loader that
   flashes for one frame is worse than none. Skippable from the first frame,
   shown once per browser session.
   =========================================================================== */
const GATE_FRAMES = [
  ...REELS_WIDE,
  ...OBJECTS.map((o) => ({ poster: o.still, src: null })),
];

export function Boot({ onDone }) {
  const [pct, setPct] = useState(0);
  const [gone, setGone] = useState(false);
  const col = useRef(null);
  const done = useRef(false);
  const word = useScramble(LOADER.gateR, { speed: 1.6 });

  const finish = useCallback(() => {
    if (done.current) return;
    done.current = true;
    setPct(100);
    setGone(true);
    setTimeout(() => onDone?.(), 720);
  }, [onDone]);

  useEffect(() => {
    if (reduced()) { finish(); return; }
    const DUR = 2200;
    const t0 = performance.now();
    let raf = 0;
    const step = (t) => {
      const p = Math.min(1, (t - t0) / DUR);
      const e = p === 1 ? 1 : 1 - Math.pow(2, -10 * p);   // easeOutExpo
      setPct(Math.round(e * 100));
      if (p < 1) raf = requestAnimationFrame(step);
      else finish();
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [finish]);

  useEffect(() => {
    if (col.current) {
      const travel = col.current.scrollHeight - col.current.clientHeight;
      col.current.style.transform = `translateY(${-(pct / 100) * travel * 0.72}px)`;
    }
  }, [pct]);

  useEffect(() => {
    const key = (e) => { if (e.key !== "Tab") finish(); };
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  }, [finish]);

  if (reduced()) return null;

  return (
    <div className={`load ${gone ? "gone" : ""}`} onClick={finish} role="presentation">
      <div className="load-hud" aria-hidden="true">
        <span className="load-tl mono">{LOADER.tl}</span>
        <span className="load-tr mono">{LOADER.tr}</span>
        <span className="load-bl mono">{LOADER.bl}</span>
        <span className="load-br mono">{LOADER.br}</span>
      </div>

      <div className="load-reel">
        <div className="load-col" ref={col}>
          {GATE_FRAMES.concat(GATE_FRAMES).map((f, i) => (
            <div className="load-fr" key={i}>
              {f.src ? (
                <video src={f.src} poster={f.poster} autoPlay muted loop playsInline preload="none" />
              ) : (
                <img src={f.poster} alt="" loading="eager" decoding="async" />
              )}
            </div>
          ))}
        </div>

        <div className="load-gate" aria-hidden="true"><i /><i /><i /><i /></div>
      </div>

      <div className="load-bar-l mono">[ <span>{LOADER.gateL}</span> ]</div>
      <div className="load-bar-r mono">[ <span className="num">{String(pct).padStart(3, "0")}</span> ]</div>

      <div className="load-foot">
        <span className="load-word mono">{word}</span>
        <div className="load-track"><i style={{ transform: `scaleX(${pct / 100})` }} /></div>
      </div>
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
