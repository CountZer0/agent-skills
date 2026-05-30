import REGISTRY_JSON from "../../registry.json?raw";
import HERMES_INDEX_JSON from "../../hermes-index.json?raw";

const REGISTRY = JSON.parse(REGISTRY_JSON);
const HERMES_INDEX = JSON.parse(HERMES_INDEX_JSON);

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

function json(data, status = 200) {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: { "Content-Type": "application/json", ...CORS },
  });
}

function text(data, status = 200, contentType = "text/plain; charset=utf-8") {
  return new Response(data, { status, headers: { "Content-Type": contentType, ...CORS } });
}

function notFound(msg) {
  return json({ error: msg }, 404);
}

function publicSkill(skill) {
  const { content: _content, hermes_markdown: _hermes, ...meta } = skill;
  return meta;
}

function findSkill(identifier) {
  const decoded = decodeURIComponent(identifier);
  return REGISTRY.skills.find(
    (s) => s.name === decoded || s.id === decoded || (s.aliases ?? []).includes(decoded)
  );
}

function fullMarkdown(skill) {
  const lines = [
    "---",
    `name: ${skill.name}`,
    `description: ${JSON.stringify(skill.description)}`,
    `agents: [${skill.agents.join(", ")}]`,
    `version: ${skill.version}`,
    `tags: [${skill.tags.join(", ")}]`,
  ];
  if (skill.aliases?.length) lines.push(`aliases: [${skill.aliases.join(", ")}]`);
  if (skill.license) lines.push(`license: ${skill.license}`);
  lines.push("---", "", skill.content, "");
  return lines.join("\n");
}

function hermesMarkdown(skill) {
  const tags = skill.tags ?? [];
  const aliases = skill.aliases ?? [];
  const inputSchema = skill.input_schema
    ? JSON.stringify(skill.input_schema, null, 2).split("\n").map((line) => `      ${line}`).join("\n")
    : "      null";
  return `---
name: ${skill.name}
description: ${JSON.stringify(skill.description)}
version: ${skill.version}
author: ${skill.author ?? "CountZer0"}
license: ${skill.license ?? "MIT"}
platforms: ["linux", "macos", "windows"]
metadata:
  hermes:
    tags: [${tags.map((x) => JSON.stringify(x)).join(", ")}]
    related_skills: []
    category: ${skill.hermes_category ?? "productivity"}
    toolsets: [${(skill.compatibility?.hermes?.toolsets ?? []).map((x) => JSON.stringify(x)).join(", ")}]
  agent_skills:
    id: ${skill.id}
    agents: [${skill.agents.map((x) => JSON.stringify(x)).join(", ")}]
    aliases: [${aliases.map((x) => JSON.stringify(x)).join(", ")}]
    source_path: ${skill.path}
    raw_url: ${skill.raw_url ?? ""}
    markdown_url: ${skill.markdown_url ?? ""}
    input_schema:
${inputSchema}
---

${skill.content.trim()}
`;
}

export default {
  async fetch(request) {
    const { method, url } = request;
    const { pathname, searchParams } = new URL(url);

    if (method === "OPTIONS") return new Response(null, { status: 204, headers: CORS });
    if (method !== "GET") return json({ error: "Method not allowed" }, 405);

    if (pathname === "/" || pathname === "") {
      return json({
        name: "agent-skills-registry",
        schema_version: REGISTRY.schema_version,
        generated: REGISTRY.generated,
        count: REGISTRY.count,
        endpoints: {
          list: "/skills",
          list_text: "/skills?format=text",
          hermes_index: "/hermes-index.json",
          filter_by_agent: "/skills?agent=claude",
          filter_by_tag: "/skills?tag=text",
          combined: "/skills?agent=claude&tag=text",
          get_one: "/skills/:name",
          get_raw_prompt: "/skills/:name/raw",
          get_markdown: "/skills/:name/markdown",
          get_hermes: "/skills/:name/hermes.md",
        },
        agents: ["claude", "hermes", "pi", "codex"],
      });
    }

    if (pathname === "/registry.json") return json(REGISTRY);
    if (pathname === "/hermes-index.json") return json(HERMES_INDEX);

    if (pathname === "/skills") {
      const agentFilter = searchParams.get("agent");
      const tagFilter = searchParams.get("tag");
      const q = searchParams.get("q");
      let skills = REGISTRY.skills;
      if (agentFilter) {
        skills = skills.filter((s) => s.agents.includes(agentFilter) || s.agents.includes("universal") || s.source_category === "universal");
      }
      if (tagFilter) skills = skills.filter((s) => s.tags.includes(tagFilter));
      if (q) {
        const needle = q.toLowerCase();
        skills = skills.filter((s) => [s.name, s.description, s.id, ...(s.aliases ?? []), ...(s.tags ?? [])].join(" ").toLowerCase().includes(needle));
      }
      if (searchParams.get("format") === "text") {
        const lines = skills.map((s) => `${s.name}\t[${s.agents.join(",")}]\t${s.description}`);
        return text(lines.join("\n") + "\n");
      }
      return json({ count: skills.length, skills: skills.map(publicSkill) });
    }

    const fileMatch = pathname.match(/^\/skills\/([^/]+)\/(raw|markdown|hermes(?:\.md)?)$/);
    if (fileMatch) {
      const skill = findSkill(fileMatch[1]);
      if (!skill) return text(`Skill "${decodeURIComponent(fileMatch[1])}" not found\n`, 404);
      if (fileMatch[2] === "raw") return text(skill.content + "\n");
      if (fileMatch[2] === "markdown") return text(fullMarkdown(skill), 200, "text/markdown; charset=utf-8");
      return text(hermesMarkdown(skill), 200, "text/markdown; charset=utf-8");
    }

    const match = pathname.match(/^\/skills\/([^/]+)$/);
    if (match) {
      const skill = findSkill(match[1]);
      if (!skill) return notFound(`Skill "${decodeURIComponent(match[1])}" not found`);
      return json(skill);
    }

    return notFound("Not found");
  },
};
