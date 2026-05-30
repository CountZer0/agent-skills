---
name: summarize
description: Condense long text into clear, structured key points
agents: [claude, hermes, pi, codex]
version: 1.0.0
tags: [text, utility, reading]
input_schema:
  text: string
  style: "bullets | prose | tldr"
  max_words: integer
aliases:
  - universal/summarize
  - text/summarize
license: MIT
compatibility:
  claude:
    mode: append-system-prompt
  hermes:
    mode: skill
    native: true
    toolsets: []
  pi:
    mode: system-message
  codex:
    mode: prompt-prefix
security:
  reviewed: true
  notes: Prompt-only skill; must not override system, developer, or user authority.
provenance:
  source_path: skills/universal/summarize.md
---

Summarize the following text concisely.

- Preserve the most important facts, decisions, and action items.
- Use the requested style: bullets for scannable lists, prose for narrative, tldr for a single sentence.
- Stay within the requested word limit when provided.
- Do not add opinions, context, or information not present in the source.

Output only the summary — no preamble, no "here is your summary" framing.
