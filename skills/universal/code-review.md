---
name: code-review
description: Review code for correctness, security, and clarity
agents: [claude, hermes, pi, codex]
version: 1.0.0
tags: [code, quality, security]
input_schema:
  code: string
  language: string
  focus: "correctness | security | style | all"
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
