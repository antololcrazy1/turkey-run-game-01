// Gobble Dash hand-in program for turkey-run-game-01 (Node 22, standard library only).
// Copies this repository's game/ and screenshots/ folders into the output directory and
// writes dossier.json there with the vendored make.fun dossier builder, so the judge reads
// the same summary the gate rebuilds. Locally, MAKEFUN_OUTPUT_DIR stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { buildDossier } from "./vendor/makefun-game.ts";

const repoRoot = fileURLToPath(new URL(".", import.meta.url));
const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";

if (!existsSync(join(repoRoot, "game", "index.html"))) {
  throw new Error("Gobble Dash hand-in: game/index.html is missing");
}

mkdirSync(outputDir, { recursive: true });
cpSync(join(repoRoot, "game"), join(outputDir, "game"), { recursive: true });
mkdirSync(join(outputDir, "screenshots"), { recursive: true });
if (existsSync(join(repoRoot, "screenshots"))) {
  cpSync(join(repoRoot, "screenshots"), join(outputDir, "screenshots"), { recursive: true });
}

const dossier = buildDossier(outputDir, {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  game_max_files: 993,
  game_max_bytes: 50331648,
  game_path_max_bytes: 1000,
});
writeFileSync(join(outputDir, "dossier.json"), dossier);
console.log(`Gobble Dash dossier written: ${dossier.length} bytes`);
