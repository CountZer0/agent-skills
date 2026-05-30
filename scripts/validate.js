#!/usr/bin/env node
import { readFileSync, readdirSync, statSync } from "fs";
import { join, relative } from "path";
import matter from "gray-matter";

const REQUIRED_FIELDS = ["name", "description", "agents", "version", "tags"];
const VALID_AGENTS = ["claude", "hermes", "pi", "codex", "universal"];
const VERSION_RE = /^\d+\.\d+\.\d+$/;

const ROOT = new URL("..", import.meta.url).pathname;
const SKILLS_DIR = join(ROOT, "skills");

function walk(dir) {
  const entries = readdirSync(dir);
  return entries.flatMap((entry) => {
    const full = join(dir, entry);
    return statSync(full).isDirectory() ? walk(full) : [full];
  });
}

let errors = 0;

for (const file of walk(SKILLS_DIR).filter((f) => f.endsWith(".md"))) {
  const rel = relative(ROOT, file);
  const raw = readFileSync(file, "utf8");
  const { data, content } = matter(raw);

  const fail = (msg) => {
    console.error(`[FAIL] ${rel}: ${msg}`);
    errors++;
  };

  for (const field of REQUIRED_FIELDS) {
    if (data[field] == null) fail(`missing required field "${field}"`);
  }

  if (data.agents) {
    const agents = Array.isArray(data.agents) ? data.agents : [data.agents];
    for (const a of agents) {
      if (!VALID_AGENTS.includes(a)) fail(`unknown agent "${a}"`);
    }
  }

  if (data.version && !VERSION_RE.test(data.version)) {
    fail(`version "${data.version}" must be semver (e.g. 1.0.0)`);
  }

  if (!content.trim()) fail("skill body is empty");

  if (!errors) console.log(`[OK]   ${rel}`);
}

if (errors) {
  console.error(`\n${errors} validation error(s). Fix before building.`);
  process.exit(1);
} else {
  console.log(`\nAll skills valid.`);
}
