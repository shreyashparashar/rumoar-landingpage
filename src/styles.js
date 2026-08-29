/* ===========================================================================
   RUMOAR — the landing stylesheet

   Injected once at runtime from a template string rather than imported as a
   .css file, for the same reason the shop does it: the tokens and the
   components that consume them stay in one codebase with no build-order
   question, and there is exactly one place to look for a colour.

   Scoped under `.rl` throughout, so nothing here can leak into an embed and
   nothing from an embed can reach in.

   TOKENS ARE THE SHOP'S OWN
   Typefaces and colours are lifted straight from the store's stylesheet —
   Inter Tight, Inter, Instrument Serif and JetBrains Mono, with #FF5722 as
   the signal and pure #000 as the ground. The shop already runs full-black
   sections (its scroll section and its footer), so this page is not inventing
   a second identity, it is living in the darkest room the brand already owns.

   The page stays black end to end. That is the reference site's whole
   posture: a wall on black, and the type gets out of its way.
   =========================================================================== */
export const CSS = `
/* ═══════════════════════════════════════════════════════════════════════════
   §1  TOKENS
   ═══════════════════════════════════════════════════════════════════════════ */
.rl{
  /* TYPE — the shop's four faces, in the shop's four roles.
     Inter Tight sets display, Inter sets everything read at length,
     Instrument Serif is the voice, JetBrains Mono is the instrument:
     channel numbers, states, timecode. Mono never sets a sentence. */
  --f-display:'Inter Tight','Inter','Helvetica Neue',Arial,sans-serif;
  --f-body:'Inter','Helvetica Neue',Arial,sans-serif;
  --f-serif:'Instrument Serif','Times New Roman',Georgia,serif;
  --f-mono:'JetBrains Mono',ui-monospace,Menlo,monospace;

  /* GROUND — the shop's own dark, which is pure black, not a blue-black */
  --ground:#000000; --ground-2:#0D0D0F; --ground-3:#17171A;
  --bone:#FFFFFF;                      /* 21:1 on ground                    */
  --bone-2:#B9BABD;                    /*  9.4:1 — body copy                */
  --bone-3:#8A8D91;                    /*  5.3:1 — the shop's own ink-3,
                                             which still passes inverted    */
  --line:#1E1E20; --line-2:#2E2E31;

  /* SIGNAL — the shop's #FF5722, kept on a very short leash. Expensive reads
     as restraint: the accent is a hairline and a single glyph, never a glow
     washed across a section. Most of the "colour" on this page is the film
     itself. Standby borrows the store's pale accent. */
  --mark:#FF5722; --mark-hot:#FF6E3D;
  --standby:#C7C7CC;

  /* z-index, named. Never a bare 9999 anywhere in this file. */
  --z-grain:2; --z-nav:60; --z-ret:200; --z-boot:300;

  --micro:170ms; --ui:380ms; --content:760ms; --cine:1300ms;
  --ez:cubic-bezier(.22,.68,.16,1);
  --ez-out:cubic-bezier(.16,1,.3,1);   /* quint-out — no bounce, no elastic */

  --gut:clamp(14px,1.6vw,24px);
  --marg:clamp(20px,4.6vw,76px);

  color-scheme:dark;
  font-family:var(--f-body);
  color:var(--bone);background:var(--ground);
  -webkit-font-smoothing:antialiased;text-rendering:optimizeLegibility;
  position:relative;overflow-x:clip;
  scrollbar-gutter:stable;
}

.rl *,.rl *::before,.rl *::after{box-sizing:border-box}
.rl p{margin:0}
.rl h1,.rl h2,.rl h3,.rl h4{margin:0;font-weight:700;line-height:1.02}
.rl button{font-family:inherit;border:0;background:none;color:inherit;cursor:pointer;padding:0}
.rl a{color:inherit;text-decoration:none}
.rl img,.rl video,.rl canvas,.rl svg{display:block}
.rl input{font-family:inherit;font-size:1rem;color:inherit}
.rl ul{list-style:none;margin:0;padding:0}
.rl :focus-visible{outline:2px solid var(--mark-hot);outline-offset:3px;border-radius:2px}

/* Selection inverts against the ground it sits on. */
.rl ::selection{background:var(--bone);color:var(--ground)}

.rl .grain{position:fixed;inset:0;z-index:var(--z-grain);pointer-events:none;
  opacity:.055;mix-blend-mode:screen;background-size:128px 128px}

/* ═══════════════════════════════════════════════════════════════════════════
   §2  TYPE SCALE
   Display tracking bottoms out at -.032em. Tighter and the letters touch,
   which reads as cramped rather than designed. The one place that ceiling is
   broken on purpose is the wordmark lock, which is a mark and not typesetting.
   ═══════════════════════════════════════════════════════════════════════════ */
.rl .mega{font-size:clamp(2.5rem,6.6vw,6rem);line-height:.92;
  font-family:var(--f-display);letter-spacing:-.042em;
  font-weight:700;text-wrap:balance;overflow-wrap:break-word}
.rl .big{font-size:clamp(1.9rem,4.2vw,3.5rem);line-height:1.02;
  font-family:var(--f-display);letter-spacing:-.036em;
  font-weight:700;text-wrap:balance;overflow-wrap:break-word}
.rl .mid{font-size:clamp(1.2rem,2vw,1.85rem);line-height:1.15;letter-spacing:-.02em;font-weight:700}
.rl .h3{font-size:clamp(1rem,1.2vw,1.14rem);font-weight:700;letter-spacing:-.014em;line-height:1.3}
.rl .body{font-size:clamp(.94rem,1vw,1.03rem);line-height:1.62;color:var(--bone-2);
  font-weight:400;max-width:64ch;text-wrap:pretty}
.rl .lede{font-size:clamp(1rem,1.15vw,1.16rem);line-height:1.55;color:var(--bone-2);
  font-weight:400;max-width:50ch;text-wrap:pretty}
.rl .serif{font-family:var(--f-serif);font-weight:400}
.rl .it{font-style:italic}
.rl .mk{color:var(--mark)}

/* The label. One system mark, on section openers only — never stacked above
   every heading on the page. */
.rl .lb{font-family:var(--f-mono);font-size:.6rem;letter-spacing:.06em;
  text-transform:uppercase;color:var(--bone-3);font-weight:600}

/* The instrument face. Martian Mono is wide, so it is always small and always
   tracked in, never out. */
.rl .mono{font-family:var(--f-mono);font-size:.58rem;letter-spacing:.01em;
  text-transform:uppercase;font-weight:400;line-height:1.5}

/* ═══════════════════════════════════════════════════════════════════════════
   §3  LAYOUT
   ═══════════════════════════════════════════════════════════════════════════ */
.rl .wrap{width:100%;padding-inline:var(--marg);margin-inline:auto;max-width:1720px}
.rl .sec{padding-block:clamp(72px,11vw,164px)}
.rl .sec-tight{padding-block:clamp(48px,6.5vw,96px)}
.rl .hr{height:1px;background:var(--line);border:0;margin:0}

/* REVEAL — hidden state lives on .rv.armed, and 'armed' is only ever added by
   the JavaScript that also owns the observer which removes it. Without JS —
   a crawler, reader mode, a renderer that never fires IntersectionObserver —
   the element is simply visible. A reveal is an enhancement on top of
   readable content, never the thing that makes content readable. */
.rl .rv{transition:opacity var(--content) var(--ez-out),transform var(--content) var(--ez-out)}
.rl .rv.armed{opacity:0;transform:translateY(18px)}
.rl .rv.armed.in{opacity:1;transform:none}

.rl .lines .lm{display:block;overflow:hidden;padding-bottom:.14em;margin-bottom:-.14em}
.rl .lines .lm>span{display:block;transition:transform var(--cine) var(--ez-out)}
.rl .lines.armed .lm>span{transform:translateY(106%)}
.rl .lines.armed.in .lm>span{transform:none}

/* ═══════════════════════════════════════════════════════════════════════════
   §4  CONTROLS
   ═══════════════════════════════════════════════════════════════════════════ */
.rl .btn{display:inline-flex;align-items:center;justify-content:center;gap:10px;
  font-size:.72rem;font-weight:700;letter-spacing:.12em;text-transform:uppercase;
  padding:16px 28px;border-radius:100px;white-space:nowrap;
  transition:background var(--ui) var(--ez),color var(--ui) var(--ez),
             border-color var(--ui) var(--ez),opacity var(--ui) var(--ez)}
.rl .btn-mark{background:var(--mark);color:#fff}
.rl .btn-mark:hover{background:var(--mark)}
.rl .btn-bone{background:var(--bone);color:var(--ground)}
.rl .btn-bone:hover{background:var(--mark);color:#fff}
.rl .btn-line{border:1px solid var(--line-2);color:var(--bone)}
.rl .btn-line:hover{border-color:var(--bone);background:var(--bone);color:var(--ground)}
.rl .btn-sm{padding:11px 19px;font-size:.65rem}
.rl .btn[disabled]{opacity:.35;cursor:not-allowed}
.rl .mag{display:inline-flex;will-change:transform}
.rl .mag-l{display:inline-flex;align-items:center;gap:10px;will-change:transform}

.rl .link{position:relative;font-weight:600;padding-bottom:2px}
.rl .link::after{content:"";position:absolute;left:0;right:0;bottom:0;height:1px;
  background:currentColor;transform:scaleX(0);transform-origin:right;
  transition:transform var(--ui) var(--ez)}
.rl .link:hover::after{transform:scaleX(1);transform-origin:left}

/* ═══════════════════════════════════════════════════════════════════════════
   §5  THE INTRO — the montage

   Tiles of film scattered across the whole viewport, cutting between clips
   every 60–420ms depending on the act. It escalates from one tile to twenty
   and collapses back to the wordmark. Everything positional comes from the
   component; this only paints and animates the arrival of each tile.
   ═══════════════════════════════════════════════════════════════════════════ */
.rl .ld{position:fixed;inset:0;z-index:var(--z-boot);background:var(--ground);
  overflow:hidden;transition:opacity 900ms var(--ez),visibility 900ms}
.rl .ld.gone{opacity:0;visibility:hidden;pointer-events:none}
/* the vignette keeps the scatter reading as one image rather than confetti */
.rl .ld::after{content:"";position:absolute;inset:0;pointer-events:none;z-index:6;
  background:radial-gradient(ellipse 86% 78% at 50% 50%,transparent 40%,rgba(0,0,0,.82))}

.rl .ld-hud{position:absolute;inset:0;z-index:7;pointer-events:none}
.rl .ld-hud span{position:absolute;color:var(--bone-3);letter-spacing:.14em;
  opacity:0;animation:ldhud .9s var(--ez) .35s forwards}
@keyframes ldhud{to{opacity:1}}
.rl .ld-tl{top:var(--marg);left:var(--marg)}
.rl .ld-tr{top:var(--marg);right:var(--marg)}
.rl .ld-bl{bottom:var(--marg);left:var(--marg)}
.rl .ld-br{bottom:var(--marg);right:var(--marg)}
@media(max-width:600px){.rl .ld-hud span{font-size:.5rem}}

/* the field of tiles */
.rl .ld-field{position:absolute;inset:0;z-index:2}
.rl .ld-tile{position:absolute;transform:translate(-50%,-50%) rotate(var(--rot));
  aspect-ratio:4/5;overflow:hidden;background:var(--ground-2);
  border:1px solid rgba(255,255,255,.14);
  box-shadow:0 20px 60px rgba(0,0,0,.65);
  animation:ldpop 420ms var(--ez-out) both}
@keyframes ldpop{
  from{opacity:0;transform:translate(-50%,-50%) rotate(var(--rot)) scale(.86)}
  to{opacity:1;transform:translate(-50%,-50%) rotate(var(--rot)) scale(1)}}
.rl .ld-tile video{width:100%;height:100%;object-fit:cover;
  filter:grayscale(.25) contrast(1.08)}
/* the first slot is the hero tile — bigger, cleaner, no grade */
.rl .ld-tile:first-child video{filter:none}
.rl .ld-tile-l{position:absolute;left:7px;bottom:6px;z-index:2;color:var(--bone);
  font-size:.44rem;letter-spacing:.1em;text-transform:uppercase;
  text-shadow:0 1px 6px rgba(0,0,0,.9)}
@media(max-width:700px){.rl .ld-tile-l{display:none}}

/* the line of type, over everything */
.rl .ld-line.out{opacity:0;transform:translate(-50%,-50%) scale(.97)}
.rl .ld-line{position:absolute;left:50%;top:50%;z-index:8;
  opacity:1;transition:opacity 500ms var(--ez),transform 500ms var(--ez);
  transform:translate(-50%,-50%);text-align:center;
  font-weight:400;font-size:clamp(1.5rem,5.2vw,4rem);letter-spacing:-.015em;
  line-height:1.06;color:var(--bone);max-width:16ch;text-wrap:balance;
  text-shadow:0 2px 30px rgba(0,0,0,.9),0 0 90px rgba(0,0,0,.8);
  pointer-events:none}

/* the wordmark on the closing act */
.rl .ld-lock{position:absolute;inset:0;z-index:9;display:grid;place-content:center;
  justify-items:center;gap:clamp(12px,2.2vh,24px);pointer-events:none;
  opacity:0;transition:opacity 700ms var(--ez)}
.rl .ld-lock.in{opacity:1}
.rl .ld-mark{display:flex;justify-content:center;overflow:hidden;
  font-family:var(--f-display);font-weight:800;line-height:.9;
  font-size:clamp(3rem,15vw,12rem);letter-spacing:-.055em;color:var(--bone)}
.rl .ld-mark span{display:inline-block;transform:translateY(108%);
  transition:transform 900ms var(--ez-out)}
.rl .ld-lock.in .ld-mark span{transform:none}
.rl .ld-mark span:nth-child(1){transition-delay:60ms}
.rl .ld-mark span:nth-child(2){transition-delay:130ms}
.rl .ld-mark span:nth-child(3){transition-delay:200ms}
.rl .ld-mark span:nth-child(4){transition-delay:270ms}
.rl .ld-mark span:nth-child(5){transition-delay:340ms}
.rl .ld-mark span:nth-child(6){transition-delay:410ms;color:var(--mark)}
.rl .ld-tag{color:var(--bone-3);letter-spacing:.16em;text-transform:uppercase;
  opacity:0;transition:opacity 600ms var(--ez) 700ms}
.rl .ld-lock.in .ld-tag{opacity:1}

/* counter, hairline, skip */
.rl .ld-count{position:absolute;top:50%;right:var(--marg);transform:translateY(-50%);
  z-index:8;color:var(--bone-3);letter-spacing:.12em}
.rl .ld-count .num{color:var(--bone);font-size:1.1rem;letter-spacing:.05em}
@media(max-width:820px){.rl .ld-count{top:auto;bottom:calc(var(--marg) + 44px);transform:none}}
.rl .ld-bar{position:absolute;left:var(--marg);right:var(--marg);
  bottom:calc(var(--marg) + clamp(26px,5vh,48px));z-index:8;height:1px;background:var(--line-2)}
.rl .ld-bar i{display:block;height:100%;background:var(--bone);transform-origin:left}
.rl .ld-skip{position:absolute;right:var(--marg);
  bottom:calc(var(--marg) + clamp(26px,5vh,48px) + 12px);z-index:9;
  color:var(--bone-3);letter-spacing:.14em;text-transform:uppercase;
  opacity:0;animation:ldhud .9s var(--ez) 1.4s forwards}
.rl .ld-skip:hover{color:var(--bone)}

/* ═══════════════════════════════════════════════════════════════════════════
   §6  NAV
   ═══════════════════════════════════════════════════════════════════════════ */
.rl .nav{position:fixed;top:0;left:0;right:0;z-index:var(--z-nav);
  border-bottom:1px solid transparent;
  background:linear-gradient(to bottom,rgba(8,8,11,.8),transparent);
  transition:background var(--ui) var(--ez),border-color var(--ui) var(--ez),
             transform var(--ui) var(--ez),color var(--ui) var(--ez)}
.rl .nav.stuck{background:rgba(8,8,11,.74);backdrop-filter:blur(14px) saturate(140%);
  border-bottom-color:var(--line)}
.rl .nav.hide{transform:translateY(-100%)}
.rl .navin{display:flex;align-items:center;gap:clamp(12px,2vw,30px);
  height:clamp(58px,7vh,72px);padding-inline:var(--marg)}
.rl .wordmark{font-family:var(--f-body);font-weight:800;font-size:1.02rem;
  letter-spacing:.2em;margin-right:auto}
.rl .wordmark b{color:var(--mark-hot);font-weight:800}
.rl .navlink{font-family:var(--f-mono);font-size:.56rem;letter-spacing:.04em;
  text-transform:uppercase;color:var(--bone-3);transition:color var(--micro) var(--ez)}
.rl .navlink:hover{color:var(--bone)}
.rl .tc{font-family:var(--f-mono);font-size:.56rem;letter-spacing:.02em;color:var(--bone-3)}
@media(max-width:880px){.rl .navlink.opt,.rl .tc{display:none}}

/* ═══════════════════════════════════════════════════════════════════════════
   §7  THE WALL — the hero  ◀ the signature

   Twelve cells, edge to edge, filling the viewport. Always on: reels run,
   objects drift, rest cells wake and sleep in rotation, so at any moment some
   cells play while others sit dark and then hand off. No toggle, no headline
   competing with it.

   Hard corners, hairline grid, one signal glyph. Everything expensive about
   this is restraint — the colour is the film, not a wash laid over it.
   ═══════════════════════════════════════════════════════════════════════════ */
.rl .stage{position:relative;height:100svh;min-height:540px;width:100%;overflow:hidden}
.rl .wall{position:absolute;inset:0;display:grid;
  grid-template-columns:repeat(4,minmax(0,1fr));
  grid-template-rows:repeat(3,minmax(0,1fr));
  gap:1px;background:var(--line)}
@media(max-width:900px){
  .rl .wall{grid-template-columns:repeat(3,minmax(0,1fr));
    grid-template-rows:repeat(4,minmax(0,1fr))}
}
@media(max-width:560px){
  .rl .wall{grid-template-columns:repeat(2,minmax(0,1fr));
    grid-template-rows:repeat(6,minmax(0,1fr))}
}

.rl .cell{position:relative;overflow:hidden;background:var(--ground-2);
  display:block;width:100%;height:100%}
.rl .cell-media{position:absolute;inset:0;z-index:1}
.rl .cell-media img,.rl .cell-media video{position:absolute;inset:0;
  width:100%;height:100%;object-fit:cover}
.rl .cell-media img[data-failed]{display:none}
/* the reel sits over the photograph and crossfades in on wake, so a tile is
   product and motion in the same frame rather than one or the other */
.rl .cell-obj .cell-media video{opacity:0;z-index:2;
  transition:opacity 900ms var(--ez)}
.rl .cell-obj.awake .cell-media video{opacity:.86}
.rl .cell-obj:hover .cell-media video{opacity:1}

/* objects: the photograph is desaturated and still while resting, and drifts
   into colour while awake — a still treated as footage */
.rl .cell-obj .cell-media img{filter:grayscale(.75) contrast(1.04) brightness(.72);
  transform:scale(1.02);
  transition:filter var(--content) var(--ez),transform 6s var(--ez-out),
             opacity var(--content) var(--ez)}
.rl .cell-obj.awake .cell-media img{filter:grayscale(0) contrast(1.02) brightness(1);
  transform:scale(1.08)}
.rl .cell-obj:hover .cell-media img{filter:none;transform:scale(1.06)}

/* reels: always running, always full colour */
.rl .cell-reel .cell-media video{filter:contrast(1.03) saturate(1.02)}

/* bars: dark until they wake to a reel */
.rl .cell-bar{background:var(--ground)}
.rl .cell-bar::before{content:"";position:absolute;inset:0;z-index:1;opacity:.5;
  background:repeating-linear-gradient(-45deg,transparent 0 10px,rgba(255,255,255,.02) 10px 11px)}
.rl .cell-bar .cell-media video{filter:grayscale(.3) contrast(1.05)}
.rl .cell-bar.awake::before{opacity:0;transition:opacity var(--content) var(--ez)}

/* the scanline + a persistent film grain, so even a still cell reads as live */
.rl .cell-scan{position:absolute;inset:0;z-index:2;pointer-events:none;
  background:repeating-linear-gradient(to bottom,rgba(255,255,255,.03) 0 1px,transparent 1px 3px)}
.rl .cell-obj.awake .cell-scan::after,.rl .cell-reel .cell-scan::after,
.rl .cell-bar.awake .cell-scan::after{content:"";position:absolute;inset:0;
  background:linear-gradient(to bottom,transparent 44%,rgba(255,255,255,.06) 50%,transparent 56%);
  animation:scan 3.6s linear infinite}
@keyframes scan{from{transform:translateY(-100%)}to{transform:translateY(100%)}}

/* header: number + state, mono, top corners */
.rl .cell-hd{position:absolute;top:0;left:0;right:0;z-index:4;display:flex;
  align-items:center;justify-content:space-between;
  padding:clamp(8px,1vw,13px);pointer-events:none}
.rl .cell-n{color:var(--bone-2)}
.rl .cell-s{display:flex;align-items:center;gap:5px;color:var(--bone-3)}
.rl .cell-s i{width:5px;height:5px;border-radius:100px;background:var(--line-2);
  transition:background var(--ui) var(--ez),box-shadow var(--ui) var(--ez)}
.rl .cell-obj.awake .cell-s,.rl .cell-reel .cell-s{color:var(--mark)}
.rl .cell-obj.awake .cell-s i,.rl .cell-reel .cell-s i{background:var(--mark);
  box-shadow:0 0 7px var(--mark)}
.rl .cell-bar.awake .cell-s{color:var(--standby)}
.rl .cell-bar.awake .cell-s i{background:var(--standby);box-shadow:0 0 6px rgba(199,199,204,.6)}

/* the top row clears the nav */
.rl .wall>*:nth-child(-n+4) .cell-hd{padding-top:calc(clamp(58px,7vh,72px) + 8px)}
@media(max-width:900px){.rl .wall>*:nth-child(-n+3) .cell-hd{padding-top:calc(clamp(58px,7vh,72px) + 8px)}
  .rl .wall>*:nth-child(-n+4):nth-child(n+4) .cell-hd{padding-top:clamp(8px,1vw,13px)}}

/* object footer: series / name / price, up from the bottom on wake */
.rl .cell-ft{position:absolute;left:0;right:0;bottom:0;z-index:4;
  padding:clamp(9px,1.1vw,14px);pointer-events:none;
  background:linear-gradient(to top,rgba(0,0,0,.9),rgba(0,0,0,.4) 62%,transparent);
  opacity:0;transform:translateY(8px);
  transition:opacity var(--ui) var(--ez),transform var(--ui) var(--ez-out)}
.rl .cell-obj.awake .cell-ft,.rl .cell-obj:hover .cell-ft{opacity:1;transform:none}
.rl .cell-ft .cell-ser{display:block;color:var(--mark)}
.rl .cell-ft b{display:block;font-size:.84rem;font-weight:600;letter-spacing:-.02em;
  line-height:1.2;color:var(--bone);margin-top:4px}
.rl .cell-ft .cell-pr{display:block;margin-top:3px;color:var(--bone-2)}
/* the bottom row clears the desk */
.rl .wall>*:nth-child(n+9) .cell-ft{padding-bottom:clamp(52px,6vw,70px)}
@media(max-width:900px){.rl .wall>*:nth-child(n+10) .cell-ft{padding-bottom:110px}}
@media(max-width:560px){
  .rl .cell-ft b{font-size:.72rem}
  .rl .cell-ft .cell-ser,.rl .cell-ft .cell-pr{font-size:.44rem}
  .rl .wall>*:nth-child(n+11) .cell-ft{padding-bottom:96px}
}

/* the season stamp, vertical, top-left over the wall */
.rl .season{position:absolute;z-index:12;left:calc(var(--marg) * .5);
  top:calc(clamp(58px,7vh,72px) + 16px);color:var(--bone-3);
  writing-mode:vertical-rl;letter-spacing:.16em}
@media(max-width:900px){.rl .season{display:none}}

/* the desk, laid across the bottom */
.rl .desk{position:absolute;left:0;right:0;bottom:0;z-index:13;
  display:grid;grid-template-columns:1fr auto 1fr;align-items:center;gap:16px;
  padding:clamp(13px,1.6vw,18px) var(--marg)
    calc(env(safe-area-inset-bottom,0px) + clamp(13px,1.6vw,18px));
  background:linear-gradient(to top,rgba(0,0,0,.9),rgba(0,0,0,.4) 64%,transparent);
  pointer-events:none}
.rl .desk>*{pointer-events:auto}
.rl .desk-c{color:var(--bone-3)}
.rl .desk-r{color:var(--bone-2)}
.rl .desk-r:hover{color:var(--mark)}
.rl .desk-e{display:flex;align-items:center;justify-content:flex-end;
  gap:clamp(10px,1.6vw,22px);flex-wrap:wrap}
@media(max-width:560px){.rl .desk-c{display:none}}

/* the filter row — the hero's working control */
.rl .desk-f{display:flex;gap:6px;flex-wrap:wrap;align-items:center}
.rl .fb{padding:9px 15px;border:1px solid var(--line-2);border-radius:100px;
  color:var(--bone-3);letter-spacing:.1em;text-transform:uppercase;
  transition:color var(--micro) var(--ez),border-color var(--micro) var(--ez),
             background var(--micro) var(--ez)}
.rl .fb:hover{color:var(--bone);border-color:var(--bone-3)}
.rl .fb.on{background:var(--bone);border-color:var(--bone);color:var(--ground)}
@media(max-width:760px){.rl .desk{grid-template-columns:1fr}
  .rl .cue{display:none}
  .rl .desk-e{justify-content:space-between}}
@media(max-width:420px){.rl .fb{padding:8px 11px;font-size:.5rem}}

.rl .cue{display:grid;justify-items:center;gap:7px;color:var(--bone-3)}
.rl .cue:hover{color:var(--bone)}
.rl .cue i{display:block;width:1px;height:22px;background:currentColor;opacity:.5;
  transform-origin:top;animation:cuep 2.6s var(--ez) infinite}
@keyframes cuep{0%,100%{transform:scaleY(.3);opacity:.25}50%{transform:scaleY(1);opacity:.7}}

/* ═══════════════════════════════════════════════════════════════════════════
   §8  THE CREED RAIL
   Four nouns, running the width of the page. Carried from the research site,
   where it was the argument compressed to four words.
   ═══════════════════════════════════════════════════════════════════════════ */
.rl .creed{border-block:1px solid var(--line);overflow:hidden;padding-block:14px}
.rl .creedtrack{display:flex;width:max-content;animation:slide 46s linear infinite;
  will-change:transform}
.rl .creedtrack span{display:inline-flex;align-items:baseline;gap:9px;
  font-family:var(--f-serif);font-size:clamp(1rem,1.6vw,1.42rem);color:var(--bone-2);
  padding-inline:clamp(16px,2.2vw,36px);white-space:nowrap}
.rl .creedtrack span i{font-style:normal;color:var(--mark);font-size:.72em}
@keyframes slide{to{transform:translateX(-50%)}}
.rl .creed:hover .creedtrack{animation-play-state:paused}

/* ═══════════════════════════════════════════════════════════════════════════
   §9  THE STATEMENT
   The first words on the page. They get the whole width and nothing else on
   screen with them, because everything above this was pictures.
   ═══════════════════════════════════════════════════════════════════════════ */
.rl .statement{padding-block:clamp(90px,15vw,210px)}
.rl .statement .mega{max-width:16ch}
.rl .statement-b{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));
  gap:clamp(22px,3.4vw,60px);margin-top:clamp(34px,5vw,72px);
  margin-left:auto;max-width:min(100%,860px)}
@media(max-width:760px){.rl .statement-b{grid-template-columns:1fr;gap:18px}}

/* ═══════════════════════════════════════════════════════════════════════════
   §10  BE THE NEXT ◀ the second signature
   Pinned. The line holds while the slot cycles, then everything but the mark
   is taken away and the name locks in. It is the only place on the page where
   type fills the viewport, so it only earns that once.
   ═══════════════════════════════════════════════════════════════════════════ */
.rl .next{position:relative;height:340svh;background:var(--ground)}
@media(max-width:760px){.rl .next{height:300svh}}
.rl .next-pin{position:sticky;top:0;height:100svh;overflow:hidden;
  display:grid;place-items:center;padding-inline:var(--marg)}
.rl .next-pin::before{content:"";position:absolute;inset:0;
  background:radial-gradient(ellipse 60% 50% at 50% 50%,rgba(255,255,255,.028),transparent 72%);
  opacity:0;transition:opacity 900ms var(--ez)}
.rl .next-pin.hot::before{opacity:1}

.rl .next-in{position:relative;z-index:2;text-align:center;width:100%;max-width:1200px}
.rl .next-lead{font-family:var(--f-serif);font-weight:400;font-style:italic;
  font-size:clamp(1.5rem,4.6vw,3.6rem);line-height:1.1;letter-spacing:-.01em;
  color:var(--bone);transition:opacity 520ms var(--ez),transform 520ms var(--ez-out)}
.rl .next-slot{display:block;margin-top:clamp(10px,1.6vh,20px);min-height:1.24em;
  font-family:var(--f-body);font-style:normal;font-weight:800;
  font-size:clamp(1.5rem,5.4vw,4.2rem);line-height:1.16;letter-spacing:-.03em;
  color:var(--mark-hot);text-wrap:balance}
.rl .next-out .next-lead{opacity:0;transform:translateY(-16px)}

/* the lock. This is a wordmark, so it is allowed to break the 5.8rem ceiling
   the rest of the page keeps to. */
.rl .next-lock{position:absolute;inset:0;display:grid;place-content:center;
  justify-items:center;gap:clamp(12px,2.2vh,26px);
  pointer-events:none;opacity:0;transition:opacity 460ms var(--ez)}
.rl .next-out .next-lock{opacity:1;pointer-events:auto}
.rl .next-mark{display:flex;justify-content:center;align-items:baseline;
  font-family:var(--f-display);font-weight:700;line-height:.9;
  font-size:clamp(3rem,15vw,13rem);letter-spacing:-.045em}
.rl .next-mark span{display:inline-block;transform:translateY(112%);opacity:0;
  transition:transform 760ms var(--ez-out),opacity 400ms var(--ez)}
.rl .next-out .next-mark span{transform:none;opacity:1}
.rl .next-mark span:nth-child(1){transition-delay:20ms}
.rl .next-mark span:nth-child(2){transition-delay:70ms}
.rl .next-mark span:nth-child(3){transition-delay:120ms}
.rl .next-mark span:nth-child(4){transition-delay:170ms}
.rl .next-mark span:nth-child(5){transition-delay:220ms}
.rl .next-mark span:nth-child(6){transition-delay:270ms;color:var(--mark)}
.rl .next-sub{font-family:var(--f-mono);
  font-size:.56rem;letter-spacing:.06em;text-transform:uppercase;color:var(--bone-3);
  opacity:0;transition:opacity 500ms var(--ez) 520ms}
.rl .next-out .next-sub{opacity:1}

/* the scrub rule at the foot of the pin — the only affordance telling you the
   section is being scrolled through rather than stuck */
.rl .next-bar{position:absolute;left:var(--marg);right:var(--marg);bottom:clamp(22px,5vh,46px);
  height:1px;background:var(--line);z-index:3}
.rl .next-bar i{display:block;height:100%;background:var(--mark);
  transform-origin:left;transform:scaleX(0)}

/* ═══════════════════════════════════════════════════════════════════════════
   §11  THE FILM
   Full bleed, the shop's own line over it, and a scrim heavy enough that the
   type never depends on which frame happens to be showing.
   ═══════════════════════════════════════════════════════════════════════════ */
.rl .film{position:relative;min-height:clamp(500px,84svh,880px);
  display:grid;align-items:end;overflow:hidden}
.rl .film-m{position:absolute;inset:0;background:var(--ground-2)}
.rl .film-m video{width:100%;height:100%;object-fit:cover;opacity:.62}
.rl .film::after{content:"";position:absolute;inset:0;pointer-events:none;
  background:linear-gradient(to top,rgba(0,0,0,.93) 8%,rgba(0,0,0,.45) 52%,rgba(0,0,0,.7))}
.rl .film-c{position:relative;z-index:2;padding-block:clamp(44px,8vh,96px)}
.rl .film-l{font-family:var(--f-serif);font-weight:400;
  font-size:clamp(1.9rem,6vw,4.6rem);line-height:1.06;letter-spacing:-.015em;
  max-width:15ch;margin-top:18px;text-wrap:balance}

/* ═══════════════════════════════════════════════════════════════════════════
   §12  THE COLLECTION RAIL
   ═══════════════════════════════════════════════════════════════════════════ */
.rl .coll-h{display:flex;justify-content:space-between;align-items:flex-end;
  gap:22px;flex-wrap:wrap;margin-bottom:clamp(26px,3.6vw,46px)}

.rl .rail{display:flex;gap:var(--gut);overflow-x:auto;overscroll-behavior-x:contain;
  scroll-snap-type:x mandatory;scroll-padding-inline:var(--marg);
  padding:6px var(--marg) 26px;scrollbar-width:none}
.rl .rail::-webkit-scrollbar{display:none}
.rl .rail>*{scroll-snap-align:start;flex:0 0 clamp(224px,24vw,320px)}

.rl .pc{display:flex;flex-direction:column;gap:13px;text-align:left;width:100%}
.rl .pc-p{position:relative;width:100%;aspect-ratio:2/3;overflow:hidden;
  background:var(--ground-2);border:1px solid var(--line)}
.rl .pc-p img[data-failed]{display:none}
.rl .pc-p img{width:100%;height:100%;object-fit:cover;
  transition:transform var(--cine) var(--ez-out),filter var(--ui) var(--ez);
  filter:grayscale(.35)}
.rl .pc:hover .pc-p img{transform:scale(1.04);filter:none}
.rl .pc-n{position:absolute;top:10px;left:11px;z-index:3;font-family:var(--f-mono);
  font-size:.48rem;letter-spacing:.05em;text-transform:uppercase;color:var(--bone);
  background:rgba(0,0,0,.55);padding:5px 8px;backdrop-filter:blur(6px)}
.rl .pc-h{display:flex;justify-content:space-between;align-items:baseline;gap:12px}
.rl .pc-name{font-size:1rem;font-weight:600;letter-spacing:-.022em}
.rl .pc-price{font-family:var(--f-mono);font-size:.78rem;font-weight:500;white-space:nowrap}
.rl .pc-read{font-size:.83rem;line-height:1.5;color:var(--bone-2);max-width:38ch}

.rl .railcue{display:flex;align-items:center;gap:12px}
.rl .railcue .mono{color:var(--bone-3)}
.rl .railcue .track{position:relative;flex:1;max-width:190px;height:1px;background:var(--line-2)}
.rl .railcue .track i{position:absolute;top:-1px;left:0;height:3px;width:34%;
  background:var(--mark);transition:transform 120ms linear}

/* ═══════════════════════════════════════════════════════════════════════════
   §13  THE OPINION
   ═══════════════════════════════════════════════════════════════════════════ */
.rl .opinion{padding-block:clamp(90px,15vw,200px);text-align:center}
.rl .opinion-l{font-family:var(--f-serif);font-weight:400;
  font-size:clamp(1.7rem,5vw,3.9rem);line-height:1.14;letter-spacing:-.012em;
  max-width:20ch;margin-inline:auto;text-wrap:balance}

/* ═══════════════════════════════════════════════════════════════════════════
   §14  THE FOOTER
   The store's own, column for column, so the two properties end the same way.
   ═══════════════════════════════════════════════════════════════════════════ */
.rl .foot{border-top:1px solid var(--line);padding-block:clamp(46px,7vw,92px) 0}
.rl .foot-g{display:grid;grid-template-columns:1fr 1fr 1.2fr;
  gap:clamp(26px,4vw,72px);padding-bottom:clamp(38px,5vw,68px)}
@media(max-width:820px){.rl .foot-g{grid-template-columns:1fr 1fr}}
@media(max-width:520px){.rl .foot-g{grid-template-columns:1fr;gap:30px}}
.rl .foot-col h4{color:var(--bone-3);letter-spacing:.14em;text-transform:uppercase;
  font-weight:400;margin-bottom:16px}
.rl .foot-col ul{display:grid;gap:9px}
.rl .foot-col a{font-size:.88rem;color:var(--bone-2);
  transition:color var(--micro) var(--ez)}
.rl .foot-col a:hover{color:var(--mark)}
.rl .foot-help .foot-hl{font-size:1rem;font-weight:600;color:var(--bone)}
.rl .foot-help .foot-hh{font-size:.86rem;color:var(--bone-2);margin-top:5px;
  margin-bottom:18px}

.rl .foot-b{display:flex;align-items:flex-end;justify-content:space-between;
  gap:20px;flex-wrap:wrap;padding-block:clamp(24px,3vw,38px);
  border-top:1px solid var(--line)}
.rl .foot-mark{font-family:var(--f-display);font-weight:800;
  font-size:clamp(1.5rem,4vw,2.6rem);letter-spacing:.02em;line-height:1}
.rl .foot-mark b{color:var(--mark);font-weight:800}
.rl .foot-mark sup{font-size:.34em;vertical-align:super;color:var(--bone-3)}
.rl .foot-legal{display:flex;gap:clamp(12px,2vw,26px);flex-wrap:wrap;
  color:var(--bone-3);letter-spacing:.06em}

/* ═══════════════════════════════════════════════════════════════════════════
   §15  THE RETICLE
   A focus ring, not a novelty cursor. It grows over anything switchable, so
   the board reads as an instrument you operate. Pointer:coarse never sees it.
   ═══════════════════════════════════════════════════════════════════════════ */
.rl .ret{position:fixed;inset:0;z-index:var(--z-ret);pointer-events:none}
.rl .ret i{position:absolute;top:0;left:0;display:block;border-radius:100px;
  will-change:transform}
.rl .ret-d{width:5px;height:5px;margin:-2.5px 0 0 -2.5px;background:var(--mark)}
.rl .ret-r{width:28px;height:28px;margin:-14px 0 0 -14px;border:1px solid rgba(244,243,241,.34);
  transition:width var(--ui) var(--ez),height var(--ui) var(--ez),
             margin var(--ui) var(--ez),border-color var(--ui) var(--ez)}
.rl .ret.hot .ret-r{width:52px;height:52px;margin:-26px 0 0 -26px;border-color:var(--mark)}
@media(pointer:coarse){.rl .ret{display:none}}

.rl .sr{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;
  clip:rect(0,0,0,0);white-space:nowrap;border:0}

/* the keyboard entry point */
.rl .skip{position:fixed;top:9px;left:9px;z-index:var(--z-boot);padding:12px 18px;
  border-radius:100px;background:var(--bone);color:var(--ground);font-size:.64rem;
  font-weight:700;letter-spacing:.14em;text-transform:uppercase;
  transform:translateY(-200%);transition:transform var(--ui) var(--ez)}
.rl .skip:focus-visible{transform:none}

/* ═══════════════════════════════════════════════════════════════════════════
   §16  REDUCED MOTION
   Not a courtesy. Every animation above needs a resting state that is a
   crossfade or nothing at all — and every reveal has to end up visible even
   if its observer never fires.
   ═══════════════════════════════════════════════════════════════════════════ */
@media (prefers-reduced-motion:reduce){
  .rl *,.rl *::before,.rl *::after{
    animation-duration:1ms!important;animation-iteration-count:1!important;
    transition-duration:120ms!important;scroll-behavior:auto!important}
  .rl .rv.armed{opacity:1;transform:none}
  .rl .lines.armed .lm>span{transform:none}
  .rl .creedtrack{animation:none}
  .rl .sig-scan{display:none}
  .rl .ret{display:none}
  /* the pinned section stops being a scrub and becomes three stacked states,
     all of them visible */
  .rl .next{height:auto}
  .rl .next-pin{position:static;height:auto;padding-block:clamp(64px,12vh,120px)}
  .rl .next-lock{position:static;opacity:1;margin-top:34px}
  .rl .next-mark span{transform:none;opacity:1}
  .rl .next-sub{opacity:1}
  .rl .next-bar{display:none}
}
`;
