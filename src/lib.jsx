import React, { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";

/* ===========================================================================
   §1  THE FRAME LOOP

   One requestAnimationFrame for the whole page. Every component that needs
   per-frame work subscribes here instead of starting its own loop — a dozen
   components each calling rAF is a dozen callbacks the browser schedules
   separately, and they drift out of phase with one another within seconds.
   =========================================================================== */
const subs = new Set();
let looping = false;
let prev = 0;

function tick(now) {
  const dt = Math.min((now - prev) / 1000, 0.05);   // cap: a backgrounded tab
  prev = now;                                       // must not resume with a
  for (const fn of subs) fn(dt);                    // multi-second delta
  if (subs.size) requestAnimationFrame(tick);
  else looping = false;
}

export function useFrame(cb) {
  const ref = useRef(cb);
  ref.current = cb;
  useEffect(() => {
    const f = (dt) => ref.current(dt);
    subs.add(f);
    if (!looping) {
      looping = true;
      prev = performance.now();
      requestAnimationFrame(tick);
    }
    return () => { subs.delete(f); };
  }, []);
}

/* ===========================================================================
   §2  MATH & ENVIRONMENT
   =========================================================================== */
export const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));

/** Frame-rate-independent easing. A plain `cur += (target - cur) * 0.1` moves
    twice as fast on a 120Hz screen as on a 60Hz one; this does not. */
export const damp = (cur, target, lambda, dt) =>
  cur + (target - cur) * (1 - Math.exp(-lambda * dt));

export const reduced = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export const coarse = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(pointer:coarse)").matches;

export const money = (n) => "₹" + n.toLocaleString("en-IN");

/* ===========================================================================
   §3  SCROLL
   =========================================================================== */
/** Progress through a *pinned* section: 0 when its top hits the top of the
    viewport, 1 when its bottom leaves. Undamped — pinned content is locked to
    the scrollbar, and smoothing it makes the pin feel like it is sliding. */
export function usePin(ref, apply) {
  const fn = useRef(apply);
  fn.current = apply;
  useFrame(() => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const travel = r.height - window.innerHeight;
    if (travel <= 0) return;
    fn.current(clamp(-r.top / travel));
  });
}

export const scrollTo = (id) => {
  const el = document.getElementById(id);
  if (!el) return;
  const y = el.getBoundingClientRect().top + window.scrollY;
  window.scrollTo({ top: y, behavior: reduced() ? "auto" : "smooth" });
};

/* ===========================================================================
   §4  REVEAL PRIMITIVES

   IMPORTANT: every reveal starts from a *visible* default and is only hidden
   once JavaScript has armed it. Gating visibility on a class that a transition
   must later add is the classic way to ship a blank page — transitions do not
   run in background tabs, print, reader mode, or most headless renderers, so
   the content never appears at all. `.rv.armed` holds the hidden state, and
   only the code that owns the observer ever adds `armed`.
   =========================================================================== */
function useSeen(threshold = 0.12) {
  const ref = useRef(null);
  const [seen, set] = useState(false);
  const [armed, arm] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (reduced() || typeof IntersectionObserver === "undefined") { set(true); return; }
    arm(true);
    const io = new IntersectionObserver(
      ([e]) => e.isIntersecting && (set(true), io.disconnect()),
      { threshold, rootMargin: "0px 0px -6% 0px" }
    );
    io.observe(el);
    /* Failsafe. Some renderers resize to full height to capture a page and
       never dispatch the callback; printing does the same. Anything still
       unrevealed after this simply appears — worse animation, never a blank
       section. */
    const bail = setTimeout(() => set(true), 4000);
    return () => { io.disconnect(); clearTimeout(bail); };
  }, [threshold]);

  return [ref, seen, armed];
}

export function Reveal({ children, delay = 0, className = "", style, as: T = "div" }) {
  const [ref, seen, armed] = useSeen();
  return (
    <T
      ref={ref}
      className={`rv ${armed ? "armed" : ""} ${seen ? "in" : ""} ${className}`}
      style={{ transitionDelay: `${delay}ms`, ...style }}
    >
      {children}
    </T>
  );
}

/** A headline that rises out of its own baseline, line by line. Each line sits
    in a mask with room underneath for descenders — without that padding the
    tails of g, y and p are sliced off by the overflow. */
export function Lines({
  lines, className = "big", delay = 0, stagger = 90, style, as: T = "h2",
}) {
  const [ref, seen, armed] = useSeen(0.18);
  return (
    <T ref={ref} className={`${className} lines ${armed ? "armed" : ""} ${seen ? "in" : ""}`} style={style}>
      {lines.map((l, i) => (
        <span className="lm" key={i}>
          <span
            style={{
              transitionDelay: `${delay + i * stagger}ms`,
              color: l.dim ? "var(--ink-3)" : l.mark ? "var(--mark)" : undefined,
            }}
          >
            {l.t ?? l}
          </span>
        </span>
      ))}
    </T>
  );
}

/** A control that leans toward the cursor before you reach it. The label moves
    less than the shell, which is what reads as the surface having thickness.
    Desktop pointer only, and off entirely under reduced motion. */
export function Magnetic({ as: T = "button", strength = 0.3, className = "", children, ...rest }) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || reduced() || coarse()) return;
    const label = el.querySelector(".mag-l");
    const move = (e) => {
      const r = el.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width / 2);
      const dy = e.clientY - (r.top + r.height / 2);
      const dist = Math.hypot(dx, dy);
      const reach = Math.max(r.width, r.height) * 1.5;
      if (dist > reach) return;
      const f = 1 - dist / reach;
      /* Hard cap. Whatever strength is passed, the control never leaves its own
         neighbourhood — a magnetic button that outruns the cursor is a bug. */
      const CAP = 20;
      const mx = gsap.utils.clamp(-CAP, CAP, dx * strength * f);
      const my = gsap.utils.clamp(-CAP, CAP, dy * strength * f);
      gsap.to(el, { x: mx, y: my, duration: 0.5, ease: "power3.out", overwrite: "auto" });
      if (label) gsap.to(label, { x: mx * 0.4, y: my * 0.4, duration: 0.5, ease: "power3.out", overwrite: "auto" });
    };
    const out = () => {
      gsap.to(el, { x: 0, y: 0, duration: 0.7, ease: "power3.out" });
      if (label) gsap.to(label, { x: 0, y: 0, duration: 0.7, ease: "power3.out" });
    };
    window.addEventListener("mousemove", move, { passive: true });
    el.addEventListener("mouseleave", out);
    return () => {
      window.removeEventListener("mousemove", move);
      el.removeEventListener("mouseleave", out);
    };
  }, [strength]);

  return (
    <T ref={ref} className={`mag ${className}`} {...rest}>
      <span className="mag-l">{children}</span>
    </T>
  );
}

/* ===========================================================================
   §5  TYPE EFFECTS
   =========================================================================== */

/** Scrambles from one string to another, resolving left to right. The pool is
    deliberately narrow — uppercase and a few marks — because a scramble drawn
    from the whole keyboard reads as corruption rather than as a signal
    tuning itself in. */
const POOL = "ABCDEFGHIJKLMNOPQRSTUVWXYZ▚▞·/\\";

export function useScramble(target, { speed = 1, hold = 0 } = {}) {
  const [out, setOut] = useState(target);
  const raf = useRef(0);

  useEffect(() => {
    if (reduced()) { setOut(target); return; }
    let start = 0;
    const from = out;
    const len = Math.max(from.length, target.length);
    const seeds = Array.from({ length: len }, (_, i) => ({
      begin: hold + i * 1.4,
      end: hold + i * 1.4 + 8 + Math.random() * 12,
    }));

    const step = (t) => {
      if (!start) start = t;
      const frame = ((t - start) / 16.7) * speed;
      let done = 0;
      let s = "";
      for (let i = 0; i < len; i++) {
        const { begin, end } = seeds[i];
        const to = target[i] ?? "";
        if (frame >= end) { s += to; done++; }
        else if (frame >= begin) {
          s += to === " " ? " " : POOL[(Math.random() * POOL.length) | 0];
        } else s += from[i] ?? "";
      }
      setOut(s);
      if (done < len) raf.current = requestAnimationFrame(step);
    };

    raf.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf.current);
    // `out` is intentionally not a dependency: it is the *starting* string,
    // read once per target change. Including it would restart every frame.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target, speed, hold]);

  return out;
}

/* ===========================================================================
   §6  ATMOSPHERE
   =========================================================================== */

/** The grain. One tiling noise texture over the whole page, generated at
    runtime rather than shipped as a PNG. It is what stops large flat fields of
    near-black and red reading as flat vector colour. */
export function Grain() {
  const [uri, setUri] = useState(null);
  useEffect(() => {
    if (reduced()) return;
    const S = 128;
    const c = document.createElement("canvas");
    c.width = c.height = S;
    const ctx = c.getContext("2d");
    const img = ctx.createImageData(S, S);
    for (let i = 0; i < img.data.length; i += 4) {
      const v = 120 + Math.random() * 135;
      img.data[i] = img.data[i + 1] = img.data[i + 2] = v;
      img.data[i + 3] = 255;
    }
    ctx.putImageData(img, 0, 0);
    setUri(c.toDataURL("image/png"));
  }, []);
  if (!uri) return null;
  return <div className="grain" aria-hidden="true" style={{ backgroundImage: `url(${uri})` }} />;
}

/** The reticle. Not a novelty cursor — a focus ring that grows over anything
    switchable, so the board reads as an instrument you operate rather than a
    page you scroll. Hidden entirely on touch and under reduced motion, where
    the native pointer is the correct answer. */
export function Reticle() {
  const dot = useRef(null);
  const ring = useRef(null);
  const p = useRef({ x: -100, y: -100 });
  const r = useRef({ x: -100, y: -100 });
  const [on, setOn] = useState(false);
  const [hot, setHot] = useState(false);

  useEffect(() => {
    if (reduced() || coarse()) return;
    setOn(true);
    const move = (e) => {
      p.current = { x: e.clientX, y: e.clientY };
      const t = e.target;
      setHot(!!(t instanceof Element && t.closest("button,a,[data-hot]")));
    };
    const leave = () => { p.current = { x: -100, y: -100 }; };
    window.addEventListener("mousemove", move, { passive: true });
    document.addEventListener("mouseleave", leave);
    return () => {
      window.removeEventListener("mousemove", move);
      document.removeEventListener("mouseleave", leave);
    };
  }, []);

  useFrame((dt) => {
    if (!on) return;
    r.current.x = damp(r.current.x, p.current.x, 14, dt);
    r.current.y = damp(r.current.y, p.current.y, 14, dt);
    if (dot.current) dot.current.style.transform = `translate3d(${p.current.x}px,${p.current.y}px,0)`;
    if (ring.current) ring.current.style.transform = `translate3d(${r.current.x}px,${r.current.y}px,0)`;
  });

  if (!on) return null;
  return (
    <div className={`ret ${hot ? "hot" : ""}`} aria-hidden="true">
      <i className="ret-d" ref={dot} />
      <i className="ret-r" ref={ring} />
    </div>
  );
}

/* ===========================================================================
   §7  SMALL SHARED PIECES
   =========================================================================== */
export const LB = ({ children, className = "", style }) => (
  <p className={`lb ${className}`} style={style}>{children}</p>
);

/** The running timecode. A broadcast desk always knows what time it is, and
    this is the detail that makes the board feel switched on rather than
    illustrated. Ticks once a second, not once a frame. */
export function Timecode() {
  const [t, setT] = useState(() => new Date());
  useEffect(() => {
    const i = setInterval(() => setT(new Date()), 1000);
    return () => clearInterval(i);
  }, []);
  const pad = (n) => String(n).padStart(2, "0");
  return (
    <span className="tc" aria-hidden="true">
      IST {pad(t.getHours())}:{pad(t.getMinutes())}:{pad(t.getSeconds())}
    </span>
  );
}
