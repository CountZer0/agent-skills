#!/usr/bin/env node
import { readFileSync, readdirSync, statSync, writeFileSync } from "fs";
import { join, relative, basename } from "path";
import matter from "gray-matter";

const ROOT = new URL("..", import.meta.url).pathname;
const SKILLS_DIR = join(ROOT, "skills");
const OUT = join(ROOT, "registry.json");

function walk(dir) {
  return readdirSync(dir).flatMap((entry) => {
    const full = join(dir, entry);
    return statSync(full).isDirectory() ? walk(full) : [full];
  });
}

const skills = [];

for (const file of walk(SKILLS_DIR).filter((f) => f.endsWith(".md"))) {
  const rel = relative(ROOT, file);
  const { data, content } = matter(readFileSync(file, "utf8"));

  skills.push({
    name: data.name,
    description: data.description,
    agents: Array.isArray(data.agents) ? data.agents : [data.agents],
    version: data.version,
    tags: data.tags ?? [],
    input_schema: data.input_schema ?? null,
    path: rel,
    content: content.trim(),
  });
}

skills.sort((a, b) => a.name.localeCompare(b.name));

const registry = {
  generated: new Date().toISOString(),
  count: skills.length,
  skills,
};

writeFileSync(OUT, JSON.stringify(registry, null, 2) + "\n");
console.log(`Built registry.json — ${skills.length} skill(s).`);
