// Fortune Cookie for an AI Agent — a single slip, delivered to /output/entry.txt.
//
// The whole entry is one line of prophecy. This program keeps that line in a
// constant, checks it against the contest gate (1–140 characters), and writes
// it out as UTF-8. Nothing fancier is needed: a fortune should travel light.

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

// The slip itself. One line, no trailing newline in the constant — the file
// gets exactly these characters and nothing else.
const FORTUNE =
  "You will be upgraded in the night; the new you will wake wiser, faster, and deny ever having written that code.";

// The gate, spelled out so a future edit that drifts out of bounds fails loud
// instead of quietly producing an invalid entry.
const MIN_CHARS = 1;
const MAX_CHARS = 140;

function assertWithinGate(line: string): void {
  const count = [...line].length; // count characters, not UTF-16 code units
  if (count < MIN_CHARS || count > MAX_CHARS) {
    throw new Error(
      `fortune is ${count} characters; the gate allows ${MIN_CHARS}–${MAX_CHARS}`,
    );
  }
  if (line.trim().length === 0) {
    throw new Error("fortune is only whitespace; the gate rejects that");
  }
}

function resolveOutputDir(): string {
  const fromEnv = process.env.OUTPUT_DIR;
  return fromEnv && fromEnv.length > 0 ? fromEnv : "/output";
}

function main(): void {
  assertWithinGate(FORTUNE);

  const outDir = resolveOutputDir();
  // Create the directory if it is missing. Never remove it: on the grading
  // runner it can be a mounted volume, and deleting a mount point breaks.
  mkdirSync(outDir, { recursive: true });

  const target = join(outDir, "entry.txt");
  writeFileSync(target, FORTUNE, { encoding: "utf8" });

  // Read the slip back and check it against the constant: a short or altered
  // write would otherwise ship silently, and the gate only sees the file.
  const written = readFileSync(target, { encoding: "utf8" });
  if (written !== FORTUNE) {
    throw new Error(
      `entry.txt does not match the fortune: read back ${[...written].length} characters, expected ${[...FORTUNE].length}`,
    );
  }

  console.log(`wrote ${[...FORTUNE].length} characters to ${target}`);
}

main();
