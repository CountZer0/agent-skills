# agent-skills

Universal skills registry for AI agents. Skills are prompt templates stored as
Markdown with YAML frontmatter, versioned in git, indexed into `registry.json`,
and served over HTTP by a Cloudflare Worker.

**Supported agents:** Claude · Hermes · Pi · Codex

**Live registry:** `https://agent-skills-registry.count-zr0.workers.dev`

---

## How it works

Every skill is just a prompt string. The registry serves that string over HTTP,
and any agent uses it the same way: **fetch the skill, inject it as the system
prompt.** That's the entire integration model — no SDK, no lock-in.

```
┌─────────────┐     GET /skills/:name/raw      ┌──────────────────┐
│  any agent  │ ─────────────────────────────► │ Cloudflare Worker │
│ (claude/…)  │ ◄───────────  prompt text ──── │  + registry.json  │
└─────────────┘                                └──────────────────┘
```

---

## Quick install

The `skill` CLI is a zero-dependency POSIX shell script (just needs `curl`).
Install it to your `PATH`:

```bash
curl -fsSL https://raw.githubusercontent.com/CountZer0/agent-skills/main/bin/skill \
  -o /usr/local/bin/skill && chmod +x /usr/local/bin/skill
```

Then:

```bash
skill list                     # list every skill
skill list --agent claude      # skills available to Claude
skill list --tag text          # skills tagged "text"
skill get summarize            # print the raw prompt (pipeable)
skill show summarize           # full JSON metadata + input schema
```

To point the CLI at a self-hosted registry, set `AGENT_SKILLS_URL`.

---

## Connect each agent

All four use the same one command — `skill get <name>` — wired into how that
agent takes a system prompt.

### Claude (Claude Code CLI)

```bash
claude --append-system-prompt "$(skill get code-review)" -p "review src/"
```

### Claude (API, Python)

```python
import requests, anthropic

skill = requests.get(
    "https://agent-skills-registry.count-zr0.workers.dev/skills/summarize/raw"
).text

client = anthropic.Anthropic()
msg = client.messages.create(
    model="claude-opus-4-8",
    system=skill,
    max_tokens=1024,
    messages=[{"role": "user", "content": "<long text here>"}],
)
print(msg.content[0].text)
```

### Codex (OpenAI Codex CLI)

```bash
codex "$(skill get repo-patch)

Task: add retry logic to the fetch() call in src/api.js"
```

### Hermes (local, via Ollama)

```bash
ollama run hermes3 "$(skill get function-calling)

User task: what's the weather in Tokyo?"
```

### Pi (or any OpenAI-compatible endpoint)

```python
import requests
from openai import OpenAI

skill = requests.get(
    "https://agent-skills-registry.count-zr0.workers.dev/skills/empathic-listener/raw"
).text

client = OpenAI(base_url="<your-endpoint>", api_key="<key>")
resp = client.chat.completions.create(
    model="<model>",
    messages=[
        {"role": "system", "content": skill},
        {"role": "user", "content": "I had a rough day."},
    ],
)
print(resp.choices[0].message.content)
```

---

## HTTP API

For agents that fetch directly instead of using the CLI:

| Method & path | Returns |
|---|---|
| `GET /` | Registry info + endpoint map |
| `GET /skills` | All skills (JSON metadata) |
| `GET /skills?format=text` | Plain-text list (`name⇥agents⇥description`) |
| `GET /skills?agent=claude` | Skills for one agent (includes universal) |
| `GET /skills?tag=text` | Skills with a tag |
| `GET /skills?agent=hermes&tag=tools` | Combined filters |
| `GET /skills/:name` | One skill, full JSON (incl. prompt `content`) |
| `GET /skills/:name/raw` | Just the prompt body, `text/plain` |

All responses send permissive CORS headers, so browser-based agents work too.

---

## Directory layout

```
skills/
  universal/     skills that work across all agents
  claude/        Claude-specific skills
  hermes/        Hermes-specific skills
  pi/            Pi-specific skills
  codex/         Codex-specific skills
bin/
  skill          zero-dependency CLI loader
scripts/
  validate.js        frontmatter linter
  build-registry.js  generates registry.json (with embedded prompt content)
worker/
  src/index.js   Cloudflare Worker serving the HTTP API
  wrangler.jsonc
registry.json    auto-generated index (git-ignored; built in CI)
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

> **Agent resolution:** a `?agent=X` query returns skills listing that agent
> **plus** anything in `universal/`. Put cross-agent skills in `universal/` so
> every agent inherits them automatically.

---

## Adding a skill

1. Create a `.md` file in the appropriate `skills/` subdirectory.
2. Fill in the required frontmatter and write the prompt body.
3. Run `npm run validate` locally to check for errors.
4. Open a PR — CI validates, rebuilds `registry.json`, and redeploys the Worker
   on merge to `main`.

---

## Local development

```bash
npm install
npm run validate     # lint all skills
npm run build        # regenerate registry.json

cd worker
npm install
npx wrangler dev     # serve the API locally on :8787
npx wrangler deploy  # deploy to Cloudflare
```
