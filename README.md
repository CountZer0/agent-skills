# agent-skills

Universal skills registry for AI agents. Skills are prompt templates stored as Markdown with YAML frontmatter, versioned in git, and indexed into `registry.json` for agent consumption.

**Supported agents:** Claude · Hermes · Pi · Codex

---

## Directory layout

```
skills/
  universal/     skills that work across all agents
  claude/        Claude-specific skills
  hermes/        Hermes-specific skills
  pi/            Pi-specific skills
  codex/         Codex-specific skills
scripts/
  validate.js    frontmatter linter
  build-registry.js  generates registry.json
registry.json    auto-generated index (do not edit by hand)
```

---

## Skill format

Every skill is a `.md` file with YAML frontmatter:

```markdown
---
name: my-skill          # unique identifier, kebab-case
description: ...        # one-line summary shown in registry
agents: [claude, hermes, pi, codex]   # or a subset
version: 1.0.0          # semver
tags: [text, utility]   # free-form
input_schema:           # optional — document expected inputs
  text: string
---

Your prompt template here...
```

### Required fields

| Field | Type | Description |
|-------|------|-------------|
| `name` | string | Unique kebab-case identifier |
| `description` | string | One-line summary |
| `agents` | string[] | Which agents this skill targets |
| `version` | string | Semver (1.0.0) |
| `tags` | string[] | Freeform categories |

---

## Adding a skill

1. Create a `.md` file in the appropriate `skills/` subdirectory.
2. Fill in the required frontmatter fields.
3. Write your prompt in the body.
4. Run `npm run validate` locally to check for errors.
5. Open a PR — CI validates and rebuilds `registry.json` on merge.

---

## Consuming the registry

Agents can fetch the registry directly from the raw GitHub URL:

```
GET https://raw.githubusercontent.com/<org>/agent-skills/main/registry.json
```

Filter by agent client-side, or wrap with a Cloudflare Worker for query support:

```
GET /skills                     list all
GET /skills?agent=claude        filter by agent
GET /skills?tag=text            filter by tag
GET /skills/:name               fetch one skill's metadata
```

---

## Local development

```bash
npm install
npm run validate     # lint all skills
npm run build        # regenerate registry.json
```
