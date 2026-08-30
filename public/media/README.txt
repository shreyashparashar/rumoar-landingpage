MEDIA — seven reels, all local

PERFORMANCE NOTES — read before changing src/board.jsx

Two rules keep the intro smooth. Breaking either one brings the lag back.

1. NO <video> PER TILE. Seven videos mount once, offscreen, and every tile is
   a <canvas> that blits one of them. Decoder count is pinned at seven whether
   three tiles are on screen or thirty. Never re-key a <video> — that destroys
   and rebuilds a hardware decoder.

2. NO setState AT FRAME RATE. The counter, progress bar, scrambling line and
   tile assignments are all written straight to the DOM from the shared frame
   loop. The component has exactly ONE piece of state (the act index) and
   re-renders seven times in the whole sequence.

   This is the one that actually mattered. A 60Hz setState re-renders a tree of
   thirty elements, and every `ref` declared inline is a new function identity
   on each render, so React detaches and reattaches all of them — roughly
   eighteen hundred ref operations a second before a single video frame is
   decoded. All ref callbacks here are memoised for that reason.

Measured at peak (23 tiles): zero DOM mutations per second.

  v1  Off duty      v2  The look     v3  Ember      v4  After hours
  v5  Detail        v6  Field        v7  Night

Each has four files:
  vN_t.mp4   384x480 24fps baseline — the intro montage + wall tiles (~150KB)
  vN_p.mp4   640x800  (4:5)         — kept for larger use
  vN_l.mp4   1120 wide              — the film band
  vN.jpg                            — poster frame, also the canvas fallback

All are muted H.264, faststart, capped at 9s. Total ~6.5MB.

TO ADD OR SWAP A CLIP
  ffmpeg -i in.mov -an -t 9 \
    -vf "scale=640:800:force_original_aspect_ratio=increase,crop=640:800" \
    -c:v libx264 -crf 27 -movflags +faststart -pix_fmt yuv420p v8_p.mp4
  ffmpeg -i in.mov -an -t 9 -vf scale=1120:-2 \
    -c:v libx264 -crf 27 -movflags +faststart -pix_fmt yuv420p v8_l.mp4
  ffmpeg -ss 1 -i in.mov -frames:v 1 -vf scale=640:-2 v8.jpg

Then add it to REELS in src/content.js. The wall and the intro both read the
length of that array, so nothing else changes.
