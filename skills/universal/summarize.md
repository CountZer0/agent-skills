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
---

Summarize the following text concisely.

- Preserve the most important facts, decisions, and action items.
- Use the requested style: bullets for scannable lists, prose for narrative, tldr for a single sentence.
- Stay within the requested word limit when provided.
- Do not add opinions, context, or information not present in the source.

Output only the summary — no preamble, no "here is your summary" framing.
