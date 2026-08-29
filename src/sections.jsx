import React, { useRef, useState, useEffect, useCallback } from "react";
import { gsap } from "gsap";
import {
  CREED, STATEMENT, NEXT_WORDS, NEXT_SUB, FILM_WIDE, FILM_COPY,
  FOOTER, SHOP_URL,
} from "./content.js";
import {
  Reveal, Lines, LB, Magnetic, usePin, useScramble, clamp,
} from "./lib.jsx";

/* ===========================================================================
   §1  THE CREED RAIL

   The shop's own six marks, run sideways instead of stacked. They are the
   brand compressed to six words and they arrive with their glyphs, because
   the glyph is doing half the work of each one.
   =========================================================================== */
export function Creed() {
  /* doubled, so the -50% translate loops seamlessly */
  const run = [...CREED, ...CREED, ...CREED, ...CREED];
  return (
    <div className="creed" aria-hidden="true">
      <div className="creedtrack">
        {run.map(([g, w], i) => (
          <span key={i}><i>{g}</i>{w}</span>
        ))}
      </div>
    </div>
  );
}

/* ===========================================================================
   §2  THE STATEMENT

   The first words on the page, and they arrive after the board rather than
   over it. One claim, set large, with the reason underneath it. No numbers,
   no sources, nothing being argued — this is a customer reading, not a
   committee.
   =========================================================================== */
export function Statement() {
  return (
    <section className="wrap sec statement" id="statement">
      <Reveal><LB>{STATEMENT.kicker}</LB></Reveal>
      <Lines as="h2" className="mega" lines={STATEMENT.lines} stagger={110}
        style={{ marginTop: 20 }} />
      <div className="statement-b">
        {STATEMENT.body.map((t, i) => (
          <Reveal key={i} delay={220 + i * 120}>
            <p className="body">{t}</p>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

/* ===========================================================================
   §3  BE THE NEXT  ◀ the second signature

   Pinned for three viewport heights. The line holds while the slot cycles
   through the things a young man is currently sold as an ambition; then the
   line is taken away and the name locks into its place.

   Everything here is driven from scroll progress rather than a timer, so the
   visitor controls the reveal and can scrub back into it. The word index is
   held in a ref and only pushed into state when it actually changes — setting
   state every frame would re-render the section sixty times a second to
   display the same word.
   =========================================================================== */
export function Next() {
  const root = useRef(null);
  const bar = useRef(null);
  const pin = useRef(null);
  const idx = useRef(-1);
  const outRef = useRef(false);

  const [word, setWord] = useState(NEXT_WORDS[0]);
  const [out, setOut] = useState(false);

  /* The slot does not cut between words, it retunes between them. A hard swap
     read as a broken carousel; the scramble reads as the same signal
     resolving on a different word, which is the whole idea of the section. */
  const shown = useScramble(word, { speed: 2.4 });

  usePin(root, (p) => {
    if (bar.current) bar.current.style.transform = `scaleX(${p})`;

    /* phase one: the slot cycles between 10% and 62% of the scrub */
    const t = clamp((p - 0.1) / 0.52);
    const i = Math.min(NEXT_WORDS.length - 1, Math.floor(t * NEXT_WORDS.length));
    if (i !== idx.current) {
      idx.current = i;
      setWord(NEXT_WORDS[i]);
    }

    /* phase two: past 68% the lead goes and the mark lands. The threshold is
       read from a ref as well as state so the comparison does not depend on a
       render having already happened. */
    const isOut = p > 0.68;
    if (isOut !== outRef.current) {
      outRef.current = isOut;
      setOut(isOut);
    }
    if (pin.current) pin.current.classList.toggle("hot", p > 0.5);
  });

  return (
    <section className="next" ref={root} aria-label="Be the next">
      <div className={`next-pin ${out ? "next-out" : ""}`} ref={pin}>
        <div className="next-in">
          <p className="next-lead">
            Be the next
            <span className="next-slot">
              <span className="sr" aria-live="polite">{word}</span>
              <span aria-hidden="true">{shown}</span>
            </span>
          </p>
        </div>

        <div className="next-lock">
          <p className="next-mark" aria-label="RUMOAR">
            {"RUMOAR".split("").map((c, i) => (
              <span key={i} aria-hidden="true">{c}</span>
            ))}
          </p>
          <p className="next-sub">{NEXT_SUB}</p>
        </div>

        <div className="next-bar" aria-hidden="true"><i ref={bar} /></div>
      </div>
    </section>
  );
}

/* ===========================================================================
   §4  THE FILM

   The house film, full width, with the one line the shop already says over
   it. It plays only once it is scrolled to — an autoplaying 3.8MB video at
   the top of a page nobody has reached yet is a cost with no benefit.
   =========================================================================== */
export function Film() {
  const ref = useRef(null);
  const vid = useRef(null);
  const [armed, setArmed] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") { setArmed(true); return; }
    const io = new IntersectionObserver(([e]) => {
      /* mount on approach, and pause rather than unmount on the way out, so
         scrolling back does not re-download it */
      if (e.isIntersecting) { setArmed(true); vid.current?.play?.().catch(() => {}); }
      else vid.current?.pause?.();
    }, { rootMargin: "25% 0px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <section className="film" ref={ref} id="film">
      <div className="film-m">
        {armed ? (
          <video ref={vid} src={FILM_WIDE.src} poster={FILM_WIDE.poster} autoPlay muted loop playsInline
            preload="none" aria-hidden="true" />
        ) : null}
      </div>
      <div className="film-c wrap">
        <Reveal><LB>{FILM_COPY.kicker}</LB></Reveal>
        <Reveal delay={90}>
          <p className="film-l">{FILM_COPY.line}</p>
        </Reveal>
        <Reveal delay={180}>
          <p className="lede" style={{ marginTop: 18 }}>{FILM_COPY.body}</p>
        </Reveal>
        <Reveal delay={260} style={{ marginTop: 28 }}>
          <Magnetic as="a" href={`${SHOP_URL}/shop`} className="btn btn-mark">
            Enter the shop
          </Magnetic>
        </Reveal>
      </div>
    </section>
  );
}

/* ===========================================================================
   §5  THE FOOTER

   The store's own footer, column for column: Shop, Help & info, the help
   block with its hours, then the wordmark and the legal line. The two
   properties have to end the same way or they read as two companies.

   Anything changed on the Wix footer has to be changed in FOOTER in
   content.js — this component only lays it out.
   =========================================================================== */
export function Foot() {
  return (
    <footer className="foot" id="foot">
      <div className="wrap foot-g">
        {FOOTER.cols.map(([title, links]) => (
          <nav className="foot-col" key={title} aria-label={title}>
            <h4 className="mono">{title}</h4>
            <ul>
              {links.map(([label, href]) => (
                <li key={label}><a href={href}>{label}</a></li>
              ))}
            </ul>
          </nav>
        ))}

        <div className="foot-col foot-help">
          <h4 className="mono">{FOOTER.help.title}</h4>
          <p className="foot-hl">{FOOTER.help.line}</p>
          <p className="foot-hh">{FOOTER.help.hours}</p>
          <a className="btn btn-line btn-sm" href={FOOTER.help.cta[1]}>
            {FOOTER.help.cta[0]}
          </a>
        </div>
      </div>

      <div className="wrap foot-b">
        <a className="foot-mark" href={SHOP_URL}>
          RUMOA<b>R</b><sup>®</sup>
        </a>
        <div className="foot-legal mono">
          <span>{FOOTER.legal}</span>
          <span>{FOOTER.made}</span>
        </div>
      </div>
    </footer>
  );
}
