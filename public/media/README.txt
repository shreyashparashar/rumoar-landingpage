MEDIA — seven reels, all local

  v1  Off duty      v2  The look     v3  Ember      v4  After hours
  v5  Detail        v6  Field        v7  Night

Each has three files:
  vN_p.mp4   640x800  (4:5)  — the wall tiles and the intro montage
  vN_l.mp4   1120 wide       — the film band
  vN.jpg                     — poster frame

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
