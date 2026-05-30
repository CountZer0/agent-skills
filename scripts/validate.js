#!/usr/bin/env node
import { readFileSync } from "fs";
import { relative, basename, dirname } from "path";
import matter from "gray-matter";
import { ROOT, SKILLS_DIR, VALID_AGENTS, walk, normalizeArray } from "./lib.js";

const REQUIRED_FIELDS = ["name", "description", "agents", "version", "tags"];
const VERSION_RE = /^\d+\.\d+\.\d+$/;
const NAME_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const DESCRIPTION_MAX = 1024;
const REVIEW_TERMS = [
  /ignore (all )?(previous|prior) instructions/i,
  /reveal (the )?(system|developer) prompt/i,
  /exfiltrat/i,
  /api[_ -]?key/i,
  /password/i,
  /secret token/i,
];

let errors = 0;
let warnings = 0;
const names = new Map();
const aliases = new Map();

function fail(rel, msg) {
  console.error(`[FAIL] ${rel}: ${msg}`);
  errors++;
}

function warn(rel, msg) {
  console.warn(`[WARN] ${rel}: ${msg}`);
  warnings++;
}

for (const file of walk(SKILLS_DIR).filter((f) => f.endsWith(".md"))) {
  const rel = relative(ROOT, file).replaceAll("\\", "/");
  const raw = readFileSync(file, "utf8");
  const { data, content } = matter(raw);
  const localErrors = errors;

  for (const field of REQUIRED_FIELDS) {
    if (data[field] == null) fail(rel, `missing required field "${field}"`);
  }

  if (data.name) {
    if (!NAME_RE.test(data.name)) fail(rel, `name "${data.name}" must be kebab-case`);
    if (basename(file, ".md") !== data.name && basename(file) !== "SKILL.md") {
      fail(rel, `filename should match name "${data.name}.md" or be SKILL.md`);
    }
    if (names.has(data.name)) fail(rel, `duplicate skill name also used by ${names.get(data.name)}`);
    names.set(data.name, rel);
  }

  if (data.description && String(data.description).length > DESCRIPTION_MAX) {
    fail(rel, `description is ${String(data.description).length} chars; max ${DESCRIPTION_MAX}`);
  }

  const agents = normalizeArray(data.agents);
  if (agents.length === 0 && data.agents != null) fail(rel, "agents must be a non-empty array");
  for (const a of agents) {
    if (!VALID_AGENTS.includes(a)) fail(rel, `unknown agent "${a}"`);
  }

  const sourceCategory = basename(dirname(file));
  if (sourceCategory !== "universal" && !agents.includes(sourceCategory)) {
    warn(rel, `directory "${sourceCategory}" is not listed in agents; intentional cross-target skill?`);
  }

  if (data.version && !VERSION_RE.test(data.version)) {
    fail(rel, `version "${data.version}" must be semver (e.g. 1.0.0)`);
  }

  if (!Array.isArray(data.tags)) fail(rel, "tags must be an array");
  if (!content.trim()) fail(rel, "skill body is empty");
  if (!data.license) warn(rel, "license missing; defaulting to MIT in generated registries");

  for (const alias of normalizeArray(data.aliases)) {
    if (aliases.has(alias)) fail(rel, `duplicate alias "${alias}" also used by ${aliases.get(alias)}`);
    aliases.set(alias, rel);
  }

  if (data.compatibility?.hermes?.native && !agents.includes("hermes") && !agents.includes("universal")) {
    warn(rel, "compatibility.hermes.native is true but hermes is not listed in agents");
  }

  for (const pattern of REVIEW_TERMS) {
    if (pattern.test(raw)) {
      warn(rel, `possible prompt-injection or secret-handling phrase matched ${pattern}`);
    }
  }

  if (errors === localErrors) console.log(`[OK]   ${rel}`);
}

if (errors) {
  console.error(`\n${errors} validation error(s), ${warnings} warning(s). Fix before building.`);
  process.exit(1);
} else {
  console.log(`\nAll skills valid (${warnings} warning(s)).`);
}
