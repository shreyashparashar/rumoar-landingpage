Drop reels here.

  media/01-signal-wallet.mp4    + 01-signal-wallet.jpg   (poster)
  media/02-quiet-hours.mp4      + 02-quiet-hours.jpg
  ...

Then set the `film` field for that channel in src/content.js:

  film: null   ->   film: "01-signal-wallet"

The extension is added for you. Until a file is here the channel plays its
composed signal plate instead, which is a designed state, not a broken video.

Encode: H.264 MP4, 1080x1350 (4:5), no audio track, 6-10s seamless loop,
CRF 24, faststart. Keep each file under 4MB - nine of them autoplay.
  ffmpeg -i in.mov -vf scale=1080:1350 -an -c:v libx264 -crf 24 \
         -movflags +faststart out.mp4
