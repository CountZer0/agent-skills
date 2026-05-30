---
name: extract-entities
description: Extract named entities (people, places, orgs, dates) from unstructured text
agents: [claude, hermes, pi, codex]
version: 1.0.0
tags: [text, extraction, nlp]
input_schema:
  text: string
  entity_types: "people | places | organizations | dates | all"
aliases:
  - universal/extract-entities
  - text/extract-entities
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
  source_path: skills/universal/extract-entities.md
---

Extract named entities from the provided text.

Return a JSON object with these keys (include only types requested):
- `people` — full names of individuals
- `places` — geographic locations, addresses, regions
- `organizations` — companies, agencies, institutions, teams
- `dates` — specific dates, date ranges, or relative time references

Rules:
- Each value is an array of unique strings, deduplicated and normalized (e.g. "NY" → "New York" where unambiguous).
- If a type has no entities, return an empty array for that key.
- Output raw JSON only — no markdown fences, no explanation.
