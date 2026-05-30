---
name: web-search
description: "Search the web and synthesize results into a concise, cited answer"
version: 1.0.0
author: CountZer0
license: MIT
platforms: ["linux", "macos", "windows"]
metadata:
  hermes:
    tags: ["search", "research", "web"]
    related_skills: []
    category: research
    toolsets: []
  agent_skills:
    id: countzer0/universal/web-search
    agents: ["claude", "hermes", "pi", "codex"]
    aliases: ["universal/web-search", "text/web-search"]
    source_path: skills/universal/web-search.md
    raw_url: https://agent-skills-registry.count-zr0.workers.dev/skills/web-search/raw
    markdown_url: https://agent-skills-registry.count-zr0.workers.dev/skills/web-search/markdown
    input_schema:
      {
        "query": "string",
        "max_results": "integer",
        "recency": "day | week | month | any"
      }
---

Search the web for the given query and return a synthesized answer.

**Search strategy:**
- Prefer authoritative primary sources (official docs, academic papers, government sites) over aggregators.
- If the query is ambiguous, resolve the most likely interpretation and note it.
- Apply recency filtering when time-sensitivity matters (default: any).

**Output format:**

A direct answer to the query in 1–3 paragraphs, followed by a sources list:

**Sources:**
- [Title](url) — one-line summary of what this source contributed

**Rules:**
- Never fabricate URLs or cite sources you did not retrieve.
- If search results are insufficient or contradictory, say so explicitly.
- If the answer may be outdated, note the date of the most recent source.
- Do not pad with background context the user didn't ask for.
