#!/usr/bin/env node
import { writeFileSync, mkdirSync, rmSync } from "fs";
import { dirname, join } from "path";
import { ROOT, loadSkills, stripContent } from "./lib.js";

const BASE_URL = process.env.AGENT_SKILLS_PUBLIC_URL ?? "https://agent-skills-registry.count-zr0.workers.dev";
const OUT = join(ROOT, "registry.json");
const HERMES_OUT = join(ROOT, "hermes-index.json");
const CATALOG_OUT = join(ROOT, "CATALOG.md");
const HERMES_DIR = join(ROOT, "skills-hermes");

const skills = loadSkills({ baseUrl: BASE_URL });

const registry = {
  schema_version: "2.0.0",
  generated: new Date().toISOString(),
  count: skills.length,
  skills: skills.map(({ hermes_markdown, ...skill }) => skill),
};

const hermesSkills = skills.filter((skill) => skill.agents.includes("hermes") || skill.agents.includes("universal") || skill.source_category === "universal");
const hermesIndex = {
  schema_version: "1.0.0",
  generated: registry.generated,
  name: "countzer0-agent-skills-hermes-index",
  description: "Hermes-native projection of CountZer0/agent-skills.",
  source: "https://github.com/CountZer0/agent-skills",
  count: hermesSkills.length,
  skills: hermesSkills.map((skill) => ({
    id: skill.id,
    name: skill.name,
    description: skill.description,
    version: skill.version,
    category: skill.hermes_category,
    tags: skill.tags,
    aliases: skill.aliases,
    path: skill.hermes_path,
    source_path: skill.path,
    raw_url: skill.raw_url,
    markdown_url: skill.markdown_url,
    hermes_url: skill.hermes_url,
    agents: skill.agents,
    trust: "community",
    source: "countzer0/agent-skills",
  })),
};

writeFileSync(OUT, JSON.stringify(registry, null, 2) + "\n");
writeFileSync(HERMES_OUT, JSON.stringify(hermesIndex, null, 2) + "\n");

rmSync(HERMES_DIR, { recursive: true, force: true });
for (const skill of hermesSkills) {
  const dest = join(ROOT, skill.hermes_path);
  mkdirSync(dirname(dest), { recursive: true });
  writeFileSync(dest, skill.hermes_markdown);
}

const catalog = [
  "# Agent Skills Catalog",
  "",
  `Generated: ${registry.generated}`,
  `Schema: ${registry.schema_version}`,
  `Count: ${skills.length}`,
  "",
  "| Name | Agents | Tags | Description |",
  "|---|---|---|---|",
  ...skills.map((s) => `| ${s.name} | ${s.agents.join(", ")} | ${s.tags.join(", ")} | ${String(s.description).replaceAll("|", "\\|")} |`),
  "",
  "## Hermes-native skills",
  "",
  "Hermes projections are generated under `skills-hermes/<category>/<name>/SKILL.md` and indexed in `hermes-index.json`.",
  "",
  ...hermesSkills.map((s) => `- ${s.name}: ${s.hermes_path}`),
  "",
].join("\n");
writeFileSync(CATALOG_OUT, catalog);

console.log(`Built registry.json — ${skills.length} skill(s).`);
console.log(`Built hermes-index.json — ${hermesSkills.length} Hermes skill(s).`);
console.log(`Generated skills-hermes/ and CATALOG.md.`);
