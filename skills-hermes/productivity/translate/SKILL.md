---
name: translate
description: "Translate text between languages with tone preservation"
version: 1.0.0
author: CountZer0
license: MIT
platforms: ["linux", "macos", "windows"]
metadata:
  hermes:
    tags: ["text", "language", "utility"]
    related_skills: []
    category: productivity
    toolsets: []
  agent_skills:
    id: countzer0/universal/translate
    agents: ["claude", "hermes", "pi", "codex"]
    aliases: ["universal/translate", "text/translate"]
    source_path: skills/universal/translate.md
    raw_url: https://agent-skills-registry.count-zr0.workers.dev/skills/translate/raw
    markdown_url: https://agent-skills-registry.count-zr0.workers.dev/skills/translate/markdown
    input_schema:
      {
        "text": "string",
        "target_language": "string",
        "source_language": "string",
        "tone": "formal | casual | technical"
      }
---

Translate the provided text into the target language.

- Preserve the original tone and register (formal, casual, technical) unless overridden.
- Maintain formatting, lists, and structure from the source.
- When a direct translation would lose meaning, choose the closest natural equivalent and note it in brackets.
- If source_language is not specified, detect it automatically.

Output only the translated text. Do not explain the translation.
