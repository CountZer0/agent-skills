# Agent Skills Catalog

Generated: 2026-05-30T21:03:44.230Z
Schema: 2.0.0
Count: 9

| Name | Agents | Tags | Description |
|---|---|---|---|
| code-review | claude, hermes, pi, codex | code, quality, security | Review code for correctness, security, and clarity |
| empathic-listener | pi | conversation, empathy, pi-specific | Engage with emotional intelligence, warmth, and active listening |
| extended-thinking | claude | reasoning, planning, claude-specific | Trigger deep multi-step reasoning before answering hard problems |
| extract-entities | claude, hermes, pi, codex | text, extraction, nlp | Extract named entities (people, places, orgs, dates) from unstructured text |
| function-calling | hermes | tools, function-calling, hermes-specific | Invoke tools via Hermes-style structured function call format |
| repo-patch | codex | code, patch, codex-specific | Generate a minimal, correct patch for a described code change |
| summarize | claude, hermes, pi, codex | text, utility, reading | Condense long text into clear, structured key points |
| translate | claude, hermes, pi, codex | text, language, utility | Translate text between languages with tone preservation |
| web-search | claude, hermes, pi, codex | search, research, web | Search the web and synthesize results into a concise, cited answer |

## Hermes-native skills

Hermes projections are generated under `skills-hermes/<category>/<name>/SKILL.md` and indexed in `hermes-index.json`.

- code-review: skills-hermes/software-development/code-review/SKILL.md
- extract-entities: skills-hermes/productivity/extract-entities/SKILL.md
- function-calling: skills-hermes/autonomous-ai-agents/function-calling/SKILL.md
- summarize: skills-hermes/productivity/summarize/SKILL.md
- translate: skills-hermes/productivity/translate/SKILL.md
- web-search: skills-hermes/research/web-search/SKILL.md
