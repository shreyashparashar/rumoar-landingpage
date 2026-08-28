import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

/* Vercel serves from the domain root, so `base` stays "/". This is the one
   thing that differs from the shop repo, which derives a base because GitHub
   Pages serves a project site from /repo/. Do not copy that logic here — it
   would look for GITHUB_REPOSITORY, find nothing on Vercel, and work by
   accident rather than on purpose.

   Videos are NOT imported through the bundler. They live in public/media/ and
   are referenced by path, so dropping a 40MB reel into the repo never lands in
   the JS graph and never blocks a build. */
export default defineConfig({
  base: "/",
  plugins: [react()],
  build: {
    outDir: "dist",
    assetsDir: "assets",
    target: "es2020",
  },
});
