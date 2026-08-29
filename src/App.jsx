import React, { useState, useEffect, useRef, useCallback } from "react";
import { CSS } from "./styles.js";
import { SHOP_URL, NAV } from "./content.js";
import { useFrame, reduced, Grain, Reticle, scrollTo } from "./lib.jsx";
import { Boot, Wall } from "./board.jsx";
import { Creed, Statement, Next, Film, Foot } from "./sections.jsx";

/* ===========================================================================
   §1  NAV

   Hides on the way down and returns on the way up. The threshold is 8px of
   travel rather than 1 — without it a trackpad's sub-pixel jitter flickers the
   bar on and off while the page is standing still.

   It stays transparent over the board so the wall reaches the top edge of the
   screen, and only takes a ground once the page has been scrolled off it.
   =========================================================================== */
function Nav() {
  const [stuck, setStuck] = useState(false);
  const [hide, setHide] = useState(false);
  const lastY = useRef(0);

  useFrame(() => {
    const y = window.scrollY;
    setStuck((s) => (s === y > 14 ? s : y > 14));

    const dy = y - lastY.current;
    if (Math.abs(dy) > 8) {
      const next = dy > 0 && y > 260;
      setHide((h) => (h === next ? h : next));
      lastY.current = y;
    }

  });

  return (
    <nav className={`nav ${stuck ? "stuck" : ""} ${hide ? "hide" : ""}`}
      aria-label="Primary">
      <div className="navin">
        <button className="wordmark" onClick={() => window.scrollTo({ top: 0, behavior: reduced() ? "auto" : "smooth" })}
          aria-label="RUMOAR — back to the board">RUMOA<b>R</b></button>

        <button className="navlink" onClick={() => scrollTo("statement")}>The idea</button>
        <button className="navlink opt" onClick={() => scrollTo("film")}>The film</button>
        <a className="navlink" href={NAV[0][1]} style={{ color: "var(--mark)" }}>Shop &rarr;</a>
      </div>
    </nav>
  );
}

/* ===========================================================================
   §2  THE PAGE
   =========================================================================== */
export default function App() {
  /* The boot runs once per browser session. Somebody who came back to reread
     the argument should not have to watch the signal lock again. */
  const [boot, setBoot] = useState(() => {
    if (typeof window === "undefined") return false;
    if (reduced()) return false;
    try { return sessionStorage.getItem("rumoar.boot") !== "seen"; } catch { return true; }
  });

  /* style injection: one <style> for the app's lifetime */
  useEffect(() => {
    const tag = document.createElement("style");
    tag.setAttribute("data-rumoar-landing", "");
    tag.textContent = CSS;
    document.head.appendChild(tag);
    return () => tag.remove();
  }, []);

  /* The scroll lock belongs to the boot and is released by JavaScript — never
     left to a CSS class alone, or a failed boot leaves the page frozen. */
  useEffect(() => {
    document.body.classList.toggle("boot-lock", boot);
    return () => document.body.classList.remove("boot-lock");
  }, [boot]);

  const done = useCallback(() => {
    setBoot(false);
    try { sessionStorage.setItem("rumoar.boot", "seen"); } catch { /* private mode */ }
  }, []);

  return (
    <div className="rl">
      <a className="skip" href="#main">Skip to content</a>
      <Grain />
      <Reticle />

      {boot ? <Boot onDone={done} /> : null}

      <Nav />

      <main id="main">
        <Wall />
        <Statement />
        <Creed />
        <Next />
        <Film />
      </main>

      <Foot />
    </div>
  );
}
