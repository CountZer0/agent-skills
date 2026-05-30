---
name: summarize
description: "Condense long text into clear, structured key points"
version: 1.0.0
author: CountZer0
license: MIT
platforms: ["linux", "macos", "windows"]
metadata:
  hermes:
    tags: ["text", "utility", "reading"]
    related_skills: []
    category: productivity
    toolsets: []
  agent_skills:
    id: countzer0/universal/summarize
    agents: ["claude", "hermes", "pi", "codex"]
    aliases: ["universal/summarize", "text/summarize"]
    source_path: skills/universal/summarize.md
    raw_url: https://agent-skills-registry.count-zr0.workers.dev/skills/summarize/raw
    markdown_url: https://agent-skills-registry.count-zr0.workers.dev/skills/summarize/markdown
    input_schema:
      {
        "text": "string",
        "style": "bullets | prose | tldr",
        "max_words": "integer"
      }
---

Summarize the following text concisely.

- Preserve the most important facts, decisions, and action items.
- Use the requested style: bullets for scannable lists, prose for narrative, tldr for a single sentence.
- Stay within the requested word limit when provided.
- Do not add opinions, context, or information not present in the source.

Output only the summary — no preamble, no "here is your summary" framing.
