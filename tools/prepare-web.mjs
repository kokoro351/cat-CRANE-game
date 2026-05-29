import { cp, mkdir, rm } from "node:fs/promises";
import { join } from "node:path";

const root = process.cwd();
const outDir = join(root, "www");

await rm(outDir, { recursive: true, force: true });
await mkdir(outDir, { recursive: true });

for (const entry of ["index.html", "privacy.html", "styles.css", "main.js", "assets"]) {
  await cp(join(root, entry), join(outDir, entry), { recursive: true });
}

console.log("Prepared Capacitor web assets in www/");
