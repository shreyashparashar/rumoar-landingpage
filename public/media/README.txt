MEDIA
=====

reel-a_p.mp4 / reel-a_l.mp4 / reel-a.jpg   — motion reel A (portrait / landscape / poster)
reel-b_p.mp4 / reel-b_l.mp4 / reel-b.jpg   — motion reel B

These two reels are what actually play on the wall and in the loader gate. The
eight product cells use stills from the Wix CDN, drifting like footage.

TO GIVE A PRODUCT ITS OWN FILM
------------------------------
Shoot a 6-10s portrait loop (1080x1350, 4:5, no audio), plus a poster frame.

  ffmpeg -i in.mov -an -vf scale=1080:1350 -c:v libx264 -crf 24 \
         -movflags +faststart cap_p.mp4
  ffmpeg -ss 1 -i in.mov -frames:v 1 cap.jpg

Drop both into this folder, then in src/content.js add to that channel:

  reel: { src: "/media/cap_p.mp4", poster: "/media/cap.jpg" }

The cell is already a <video>; it will prefer the reel over the still.

Keep each file under 4MB. Encode H.264, faststart, no audio.
