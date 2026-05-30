import { readFileSync, readdirSync, statSync } from "fs";
import { join, relative, dirname, basename } from "path";
import matter from "gray-matter";

export const VALID_AGENTS = ["claude", "hermes", "pi", "codex", "universal"];
export const AGENT_MODES = {
  claude: "append-system-prompt",
  hermes: "skill",
  pi: "system-message",
  codex: "prompt-prefix",
};
export const ROOT = new URL("..", import.meta.url).pathname;
export const SKILLS_DIR = join(ROOT, "skills");

export function walk(dir) {
  return readdirSync(dir).flatMap((entry) => {
    const full = join(dir, entry);
    return statSync(full).isDirectory() ? walk(full) : [full];
  });
}

export function normalizeArray(value) {
  if (value == null) return [];
  return Array.isArray(value) ? value : [value];
}

export function slugCategory(path) {
  return basename(dirname(path));
}

export function hermesCategoryFor(skill) {
  const tags = new Set(skill.tags ?? []);
  const sourceCategory = skill.source_category;
  if (sourceCategory === "hermes") return "autonomous-ai-agents";
  if (sourceCategory === "claude" || sourceCategory === "codex") return "autonomous-ai-agents";
  if (tags.has("code") || tags.has("review") || tags.has("git") || tags.has("patch")) {
    return "software-development";
  }
  if (tags.has("web") || tags.has("search")) return "research";
  if (tags.has("text") || tags.has("utility") || tags.has("reading")) return "productivity";
  return sourceCategory === "universal" ? "productivity" : sourceCategory;
}

export function createHermesSkillMarkdown(skill) {
  const hermesCategory = hermesCategoryFor(skill);
  const related = normalizeArray(skill.related_skills ?? []);
  const tags = normalizeArray(skill.tags ?? []);
  const aliases = normalizeArray(skill.aliases ?? []);
  const platforms = normalizeArray(skill.platforms ?? ["linux", "macos", "windows"]);
  const toolsets = skill.compatibility?.hermes?.toolsets ?? [];
  const yamlStringArray = (arr) => `[${arr.map((x) => JSON.stringify(String(x))).join(", ")}]`;
  const inputSchema = skill.input_schema ? JSON.stringify(skill.input_schema, null, 2).split("\n").map((l) => `      ${l}`).join("\n") : "      null";
  return `---
name: ${skill.name}
description: ${JSON.stringify(skill.description)}
version: ${skill.version}
author: ${skill.author ?? "CountZer0"}
license: ${skill.license ?? "MIT"}
platforms: ${yamlStringArray(platforms)}
metadata:
  hermes:
    tags: ${yamlStringArray(tags)}
    related_skills: ${yamlStringArray(related)}
    category: ${hermesCategory}
    toolsets: ${yamlStringArray(toolsets)}
  agent_skills:
    id: ${skill.id}
    agents: ${yamlStringArray(skill.agents)}
    aliases: ${yamlStringArray(aliases)}
    source_path: ${skill.path}
    raw_url: ${skill.raw_url ?? ""}
    markdown_url: ${skill.markdown_url ?? ""}
    input_schema:
${inputSchema}
---

${skill.content.trim()}
`;
}

export function loadSkills({ baseUrl = "" } = {}) {
  const skills = [];
  for (const file of walk(SKILLS_DIR).filter((f) => f.endsWith(".md"))) {
    const rel = relative(ROOT, file).replaceAll("\\", "/");
    const raw = readFileSync(file, "utf8");
    const { data, content } = matter(raw);
    const agents = normalizeArray(data.agents);
    const aliases = normalizeArray(data.aliases);
    const sourceCategory = slugCategory(file);
    const id = data.id ?? `countzer0/${sourceCategory}/${data.name}`;
    const skill = {
      id,
      name: data.name,
      description: data.description,
      agents,
      version: data.version,
      tags: normalizeArray(data.tags),
      aliases,
      license: data.license ?? "MIT",
      author: data.author ?? "CountZer0",
      platforms: normalizeArray(data.platforms ?? ["linux", "macos", "windows"]),
      compatibility: data.compatibility ?? {},
      security: data.security ?? {},
      provenance: data.provenance ?? { source_path: rel },
      input_schema: data.input_schema ?? null,
      source_category: sourceCategory,
      path: rel,
      content: content.trim(),
    };
    if (baseUrl) {
      skill.raw_url = `${baseUrl}/skills/${encodeURIComponent(skill.name)}/raw`;
      skill.markdown_url = `${baseUrl}/skills/${encodeURIComponent(skill.name)}/markdown`;
      skill.hermes_url = `${baseUrl}/skills/${encodeURIComponent(skill.name)}/hermes.md`;
    }
    skill.hermes_category = hermesCategoryFor(skill);
    skill.hermes_path = `skills-hermes/${skill.hermes_category}/${skill.name}/SKILL.md`;
    skill.hermes_markdown = createHermesSkillMarkdown(skill);
    skills.push(skill);
  }
  skills.sort((a, b) => a.name.localeCompare(b.name));
  return skills;
}

export function stripContent(skill) {
  const { content, hermes_markdown, ...meta } = skill;
  return meta;
}
