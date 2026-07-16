import { cp, mkdir, rm } from "node:fs/promises";

await rm("dist", { recursive: true, force: true });
await mkdir("dist", { recursive: true });

await Promise.all([
  cp("index.html", "dist/index.html"),
  cp("LICENSE", "dist/LICENSE"),
  cp("css", "dist/css", { recursive: true }),
  cp("js", "dist/js", { recursive: true }),
]);
