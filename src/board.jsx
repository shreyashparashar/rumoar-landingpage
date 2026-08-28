import React, { useState, useEffect, useRef, useCallback } from "react";
import { CHANNELS, CELL_COUNT, FILM, STAGE, SHOP_URL } from "./content.js";
import { useScramble, reduced, coarse, money, scrollTo } from "./lib.jsx";

/* ===========================================================================
   §1  THE BOOT

   The name tuning itself in out of noise. Deliberately NOT the shop's card
   trick: that belongs to the store, and running both would make the two
   properties feel like one long preloader.

   1.4 seconds, skippable from the first frame by click or key, and shown once
   per browser session. Somebody who came back to read the argument should not
   have to watch the signal lock again.
   =========================================================================== */
const BOOT_READOUT = [
  "acquiring signal",
  "nine channels found",
  "six live · three in fitting",
];

export function Boot({ onDone }) {
  const [gone, setGone] = useState(false);
  const [step, setStep] = useState(0);
  const done = useRef(false);
  const name = useScramble("RUMOAR", { speed: 1.35, hold: 4 });

  const finish = useCallback(() => {
    if (done.current) return;
    done.current = true;
    setGone(true);
    /* the unlock has to outlast the fade, or the page scrolls behind a still
       visible overlay */
    setTimeout(() => onDone?.(), 740);
  }, [onDone]);

  useEffect(() => {
    if (reduced()) { finish(); return; }
    const a = setTimeout(() => setStep(1), 520);
    const b = setTimeout(() => setStep(2), 980);
    const c = setTimeout(finish, 1420);
    return () => { clearTimeout(a); clearTimeout(b); clearTimeout(c); };
  }, [finish]);

  useEffect(() => {
    const key = (e) => { if (e.key !== "Tab") finish(); };
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  }, [finish]);

  if (reduced()) return null;

  return (
    <div className={`boot ${gone ? "gone" : ""}`} onClick={finish} role="presentation">
      <p className="boot-w" aria-hidden="true">
        {name.slice(0, 5)}<b>{name.slice(5)}</b>
      </p>
      <div className="boot-bar"><i /></div>
      <p className="boot-r" aria-live="polite">{BOOT_READOUT[step]}</p>
    </div>
  );
}

/* ===========================================================================
   §2  THE SIGNAL

   What a cell shows once it is switched on: the object's own photograph, or —
   in the centre cell — the house film. Both are held back until the channel
   goes live. Nine images and a 3.8MB video behind a board nobody has touched
   is somebody's data plan, so the <img> is lazy and the <video> is not
   mounted at all until it is wanted.

   Off, the cell is not a grey box with "image" in it: it is a dark field with
   a number and a state, which is the entire point of a board.
   =========================================================================== */
function Signal({ ch, live }) {
  if (ch.film) {
    return (
      <div className="sig" aria-hidden="true">
        {live ? (
          <video src={FILM} autoPlay muted loop playsInline preload="none" />
        ) : null}
        <span className="sig-lines" />
        <span className="sig-scan" />
      </div>
    );
  }
  return (
    <div className="sig" aria-hidden="true">
      <img src={ch.src} alt="" loading="lazy" decoding="async"
        onError={(e) => e.currentTarget.setAttribute("data-failed", "")} />
      <span className="sig-lines" />
      <span className="sig-scan" />
    </div>
  );
}

/* ===========================================================================
   §3  A CHANNEL

   Three states plus one refusal. OFF is the resting field. ARMED is standby
   amber, which is what a real desk shows before it cuts. LIVE is tally red.
   Channels 07–09 are DARK: they are not disabled controls that happen to look
   grey, they are pieces that do not exist yet and say so.
   =========================================================================== */
function Cell({ ch, live, armed, onArm, onToggle }) {
  const [wiping, setWiping] = useState(false);
  const prev = useRef(live);

  useEffect(() => {
    if (live && !prev.current && !reduced()) {
      setWiping(true);
      const t = setTimeout(() => setWiping(false), 440);
      prev.current = live;
      return () => clearTimeout(t);
    }
    prev.current = live;
  }, [live]);

  const state = live ? "live" : armed ? "armed" : "off";
  const label = ch.film
    ? `The film. ${live ? "Playing" : "Off"}.`
    : `${ch.series} ${ch.n}, ${ch.name}, ${money(ch.price)}. ${live ? "On" : "Off"}.`;

  return (
    <button
      type="button"
      className={`cell ${wiping ? "wiping" : ""} ${ch.film ? "is-film" : ""}`}
      data-state={state}
      data-hot
      aria-pressed={live}
      aria-label={label}
      onMouseEnter={() => onArm(ch.n + ch.name)}
      onMouseLeave={() => onArm(null)}
      onFocus={() => onArm(ch.n + ch.name)}
      onBlur={() => onArm(null)}
      onClick={() => onToggle(ch.n + ch.name)}
    >
      <Signal ch={ch} live={live} />
      <span className="cell-wipe" />

      <div className="cell-hd">
        <span className="cell-n">{ch.film ? "FILM" : ch.n}</span>
        <span className="cell-s"><i />{state === "live" ? "On" : state === "armed" ? "Armed" : "Off"}</span>
      </div>

      <div className="cell-ft">
        {ch.film ? (
          <b className="cell-film">{ch.read}</b>
        ) : (
          <>
            <span className="cell-ser">{ch.series} / {ch.n}</span>
            <b>{ch.name}</b>
            <span>{money(ch.price)}</span>
          </>
        )}
      </div>
    </button>
  );
}

/* ===========================================================================
   §4  THE STAGE

   The board is not beside the page, it IS the page: nine cells, edge to edge,
   filling the viewport with no margin and no headline competing with them.
   Everything the brand needs to say up here it says by being nine cells of
   which three refuse to switch on. The words come after the scroll.

   Switch all six and the board goes live, which is the only reward on the
   page and the only place the brand raises its voice.
   =========================================================================== */
export function Stage() {
  const [on, setOn] = useState(() => new Set());
  const [armed, setArmed] = useState(null);

  const toggle = useCallback((n) => {
    setOn((s) => {
      const next = new Set(s);
      if (next.has(n)) next.delete(n); else next.add(n);
      return next;
    });
  }, []);

  const all = useCallback(() => {
    setOn((s) => (s.size === CELL_COUNT
      ? new Set()
      : new Set(CHANNELS.map((c) => c.n + c.name))));
  }, []);

  const count = on.size;
  const full = count === CELL_COUNT;

  /* The instruction has to match the device. "Hover to arm" on a phone is an
     instruction for a gesture the visitor does not have. */
  const [touch, setTouch] = useState(false);
  useEffect(() => setTouch(coarse()), []);

  return (
    <header className="stage" id="board">
      <div className={`board ${full ? "live" : ""}`} role="group"
        aria-label="The board — eight objects and the film">
        {CHANNELS.map((ch) => (
          <Cell
            key={ch.n + ch.name}
            ch={ch}
            live={on.has(ch.n + ch.name)}
            armed={armed === ch.n + ch.name}
            onArm={setArmed}
            onToggle={toggle}
          />
        ))}
      </div>

      {/* The desk. Sits over the board rather than beside it, because the
          board has to reach all four edges to read as a wall. */}
      <div className="desk">
        <div className="desk-l">
          <div className="meter" aria-hidden="true">
            {Array.from({ length: CELL_COUNT }, (_, i) => (
              <i key={i} className={i < count ? (full ? "full" : "on") : ""} />
            ))}
          </div>
          <p className="mono desk-c" aria-live="polite">
            {full ? "Everything on" : count ? `${count} of ${CELL_COUNT} on` : STAGE.count}
          </p>
          <button className="desk-all" onClick={all}>
            {full ? "Take it down" : "Switch it all on"}
          </button>
        </div>

        <p className="mono desk-r">
          {touch ? "Tap a channel" : "Hover to arm · click to cut"}
        </p>
      </div>

      <p className="season mono">{STAGE.season}</p>

      <button className="cue" onClick={() => scrollTo("statement")} aria-label="Scroll to the statement">
        <span className="mono">{STAGE.cue}</span><i />
      </button>

      <div className="stage-live" aria-hidden={!full}>
        <p>Now pick the ones that are you.</p>
        <a className="btn btn-bone btn-sm" href={SHOP_URL} tabIndex={full ? 0 : -1}>
          Go to the shop
        </a>
      </div>
    </header>
  );
}
