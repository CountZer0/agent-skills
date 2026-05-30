import REGISTRY from "../../registry.json";

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

function notFound(msg) {
  return json({ error: msg }, 404);
}

export default {
  async fetch(request) {
    const { method, url } = request;
    const { pathname, searchParams } = new URL(url);

    if (method === "OPTIONS") {
      return new Response(null, { status: 204, headers: CORS });
    }

    if (method !== "GET") {
      return json({ error: "Method not allowed" }, 405);
    }

    // GET /
    if (pathname === "/" || pathname === "") {
      return json({
        name: "agent-skills-registry",
        generated: REGISTRY.generated,
        count: REGISTRY.count,
        endpoints: {
          list: "/skills",
          list_text: "/skills?format=text",
          filter_by_agent: "/skills?agent=claude",
          filter_by_tag: "/skills?tag=text",
          combined: "/skills?agent=claude&tag=text",
          get_one: "/skills/:name",
          get_raw_prompt: "/skills/:name/raw",
        },
        agents: ["claude", "hermes", "pi", "codex"],
      });
    }

    // GET /skills or GET /skills?agent=...&tag=...
    if (pathname === "/skills") {
      const agentFilter = searchParams.get("agent");
      const tagFilter = searchParams.get("tag");

      let skills = REGISTRY.skills;

      if (agentFilter) {
        skills = skills.filter(
          (s) =>
            s.agents.includes(agentFilter) || s.agents.includes("universal")
        );
      }

      if (tagFilter) {
        skills = skills.filter((s) => s.tags.includes(tagFilter));
      }

      // Plain-text listing for shell clients (no JSON parsing needed)
      if (searchParams.get("format") === "text") {
        const lines = skills.map(
          (s) => `${s.name}\t[${s.agents.join(",")}]\t${s.description}`
        );
        return new Response(lines.join("\n") + "\n", {
          headers: { "Content-Type": "text/plain; charset=utf-8", ...CORS },
        });
      }

      if (skills.length === 0) {
        return json({ count: 0, skills: [] });
      }

      // Strip content from list responses — full content only on /skills/:name
      const list = skills.map(({ content: _, ...meta }) => meta);
      return json({ count: list.length, skills: list });
    }

    // GET /skills/:name/raw — prompt body as text/plain (for shell clients)
    const rawMatch = pathname.match(/^\/skills\/([^/]+)\/raw$/);
    if (rawMatch) {
      const skill = REGISTRY.skills.find((s) => s.name === rawMatch[1]);
      if (!skill) {
        return new Response(`Skill "${rawMatch[1]}" not found\n`, {
          status: 404,
          headers: { "Content-Type": "text/plain; charset=utf-8", ...CORS },
        });
      }
      return new Response(skill.content + "\n", {
        headers: { "Content-Type": "text/plain; charset=utf-8", ...CORS },
      });
    }

    // GET /skills/:name
    const match = pathname.match(/^\/skills\/([^/]+)$/);
    if (match) {
      const name = match[1];
      const skill = REGISTRY.skills.find((s) => s.name === name);
      if (!skill) return notFound(`Skill "${name}" not found`);
      return json(skill);
    }

    return notFound("Not found");
  },
};
