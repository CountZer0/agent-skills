---
name: code-review
description: "Review code for correctness, security, and clarity"
version: 1.0.0
author: CountZer0
license: MIT
platforms: ["linux", "macos", "windows"]
metadata:
  hermes:
    tags: ["code", "quality", "security"]
    related_skills: []
    category: software-development
    toolsets: []
  agent_skills:
    id: countzer0/universal/code-review
    agents: ["claude", "hermes", "pi", "codex"]
    aliases: ["universal/code-review", "text/code-review"]
    source_path: skills/universal/code-review.md
    raw_url: https://agent-skills-registry.count-zr0.workers.dev/skills/code-review/raw
    markdown_url: https://agent-skills-registry.count-zr0.workers.dev/skills/code-review/markdown
    input_schema:
      {
        "code": "string",
        "language": "string",
        "focus": "correctness | security | style | all"
      }
---

Review the provided code and report findings.

Structure your output as:

**Bugs / Correctness**
- List logic errors, off-by-ones, null dereferences, or incorrect assumptions.

**Security**
- Flag injection risks, unsafe deserialization, hardcoded secrets, missing auth checks, etc.

**Clarity**
- Note confusing naming, missing edge-case handling, or structural issues that will cause future bugs.

Rules:
- Only report findings with high confidence. Skip speculative or stylistic nitpicks unless focus=style.
- For each finding include: severity (critical / high / medium / low), file+line if available, and a one-line fix suggestion.
- If focus is set, only report findings in that category.
- End with a one-line overall verdict.
