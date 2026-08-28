import React, { useRef, useState, useEffect, useCallback } from "react";
import { gsap } from "gsap";
import {
  OBJECTS, CREED, STATEMENT, NEXT_WORDS, NEXT_SUB, FILM_WIDE, FILM_COPY,
  COLLECTION, OPINION, CLOSE, SHOP_URL, piece,
} from "./content.js";
import {
  Reveal, Lines, LB, Magnetic, usePin, useScramble, reduced, money, clamp,
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
   §5  THE COLLECTION — the eight, scrolled sideways

   A rail rather than a grid, because the shop already has the grid and this
   page is the trailer, not the catalogue. Native overflow does the scrolling,
   so a trackpad, a touch drag, the keyboard and a screen reader all already
   work and none of it had to be reimplemented.
   =========================================================================== */
function Piece({ ch }) {
  return (
    <a className="pc" href={piece(ch.slug)} data-hot>
      <div className="pc-p">
        <img src={ch.src} alt={ch.name} loading="lazy" decoding="async"
          onError={(e) => e.currentTarget.setAttribute("data-failed", "")} />
        <span className="pc-n">{ch.series} / {ch.n}</span>
      </div>
      <div className="pc-h">
        <h3 className="pc-name">{ch.name}</h3>
        <p className="pc-price">{money(ch.price)}</p>
      </div>
      <p className="pc-read">{ch.read}</p>
    </a>
  );
}

export function Collection() {
  const rail = useRef(null);
  const nub = useRef(null);

  const onScroll = useCallback(() => {
    const el = rail.current;
    if (!el || !nub.current) return;
    const max = el.scrollWidth - el.clientWidth;
    const p = max > 0 ? el.scrollLeft / max : 0;
    /* the nub is 34% wide, so it can travel the remaining 66% of the track */
    nub.current.style.transform = `translateX(${p * (100 / 0.34 - 100)}%)`;
  }, []);

  return (
    <section className="sec" id="pieces">
      <div className="wrap coll-h">
        <div>
          <Reveal><LB>{COLLECTION.kicker}</LB></Reveal>
          <Lines as="h2" className="big" lines={COLLECTION.lines}
            style={{ marginTop: 14 }} />
        </div>
        <Reveal delay={180}>
          <a className="link" href={`${SHOP_URL}/shop`} style={{ fontSize: ".86rem" }}>
            All objects &rarr;
          </a>
        </Reveal>
      </div>

      <div className="rail" ref={rail} onScroll={onScroll} tabIndex={0}
        role="region" aria-label="The collection, scrolls sideways">
        {OBJECTS.map((ch) => <Piece key={ch.slug} ch={ch} />)}
      </div>

      <div className="wrap railcue">
        <span className="mono">Drag or scroll sideways</span>
        <span className="track" aria-hidden="true"><i ref={nub} /></span>
      </div>
    </section>
  );
}

/* ===========================================================================
   §6  THE OPINION
   One line, the whole width, nothing else on screen with it. It is the most
   opinionated sentence the brand owns and it earns a section to itself.
   =========================================================================== */
export function Opinion() {
  return (
    <section className="wrap opinion" id="house">
      <Reveal>
        <p className="opinion-l">{OPINION}</p>
      </Reveal>
      <Reveal delay={160} style={{ marginTop: 30 }}>
        <a className="link" href={`${SHOP_URL}/about`}>Read the thinking &rarr;</a>
      </Reveal>
    </section>
  );
}

/* ===========================================================================
   §7  CTA & FOOTER
   =========================================================================== */
export function Close() {
  const [mail, setMail] = useState("");
  const [sent, setSent] = useState(false);
  const [err, setErr] = useState("");

  const submit = (e) => {
    e.preventDefault();
    /* Validated on submit, never per keystroke — telling somebody their email
       is wrong while they are on the third character of it is hostile. */
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]{2,}$/.test(mail)) {
      setErr("That address is missing something. Check it and try again.");
      return;
    }
    setErr("");
    setSent(true);
    setMail("");
  };

  return (
    <>
      <section className="wrap cta">
        <Reveal><LB>{CLOSE.kicker}</LB></Reveal>
        <Lines as="h2" className="mega" lines={CLOSE.lines} style={{ marginTop: 18 }} />
        <Reveal delay={200}>
          <p className="lede" style={{ margin: "20px auto 0" }}>{CLOSE.body}</p>
        </Reveal>

        <Reveal delay={280}>
          <form className="sub" onSubmit={submit} noValidate>
            <input
              type="email"
              value={mail}
              onChange={(e) => setMail(e.target.value)}
              placeholder="you@example.com"
              aria-label="Email address"
              aria-invalid={!!err}
            />
            <button className="btn btn-mark btn-sm" type="submit">Subscribe</button>
          </form>
          <p className="mono" aria-live="polite" style={{
            marginTop: 12,
            color: sent ? "var(--standby)" : err ? "var(--mark)" : "var(--bone-3)",
          }}>
            {sent ? "You're on the list." : err || "No noise. Unsubscribe in one click."}
          </p>
        </Reveal>

        <Reveal delay={340} style={{ marginTop: "clamp(30px,5vh,52px)" }}>
          <Magnetic as="a" href={`${SHOP_URL}/shop`} className="btn btn-bone">
            Shop the collection
          </Magnetic>
        </Reveal>
      </section>

      <footer className="foot">
        <div className="wrap foot-g">
          <div>
            <p className="wordmark" style={{ fontSize: "1.16rem", marginRight: 0 }}>RUMOA<b>R</b></p>
            <p className="mono" style={{ color: "var(--bone-3)", marginTop: 10 }}>
              RUMOAR® · © {new Date().getFullYear()} · Made in India
            </p>
          </div>
          <div className="foot-l">
            <a href={`${SHOP_URL}/shop`}>Shop</a>
            <a href={`${SHOP_URL}/about`}>About</a>
            <a href={`${SHOP_URL}/edit`}>Edit</a>
            <a href={`${SHOP_URL}/contact`}>Contact</a>
          </div>
        </div>
      </footer>
    </>
  );
}
