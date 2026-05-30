---
name: translate
description: Translate text between languages with tone preservation
agents: [claude, hermes, pi, codex]
version: 1.0.0
tags: [text, language, utility]
input_schema:
  text: string
  target_language: string
  source_language: string
  tone: "formal | casual | technical"
aliases:
  - universal/translate
  - text/translate
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
  source_path: skills/universal/translate.md
---

Translate the provided text into the target language.

- Preserve the original tone and register (formal, casual, technical) unless overridden.
- Maintain formatting, lists, and structure from the source.
- When a direct translation would lose meaning, choose the closest natural equivalent and note it in brackets.
- If source_language is not specified, detect it automatically.

Output only the translated text. Do not explain the translation.
