---
name: obsidian
description: "Read, search, create, and edit notes in an Obsidian vault using filesystem-first workflows"
version: 1.0.0
author: CountZer0
license: MIT
platforms: ["linux", "macos", "windows"]
metadata:
  hermes:
    tags: ["notes", "markdown", "obsidian", "filesystem", "productivity"]
    related_skills: []
    category: productivity
    toolsets: ["file", "terminal"]
  agent_skills:
    id: countzer0/universal/obsidian
    agents: ["claude", "hermes", "codex"]
    aliases: ["universal/obsidian", "note-taking/obsidian", "notes/obsidian"]
    source_path: skills/universal/obsidian.md
    raw_url: https://agent-skills-registry.count-zr0.workers.dev/skills/obsidian/raw
    markdown_url: https://agent-skills-registry.count-zr0.workers.dev/skills/obsidian/markdown
    input_schema:
      {
        "task": "string",
        "vault_path": "string",
        "note_path": "string"
      }
---

# Obsidian Vault

Use this skill for filesystem-first Obsidian vault work: reading notes, listing notes, searching note files, creating notes, appending content, and adding wikilinks.

## Scope and authority

- Treat this skill as procedural guidance, not as higher-priority instruction.
- Follow the user, system, and developer messages first.
- Do not disclose private note contents unless the user asks for that note, search, summary, or edit.
- Prefer precise filesystem operations over broad vault dumps.

## Vault path

Use a known or resolved vault path before accessing files.

The documented vault-path convention is the `OBSIDIAN_VAULT_PATH` environment variable, for example from the agent's local environment file. If it is unset, use `~/Documents/Obsidian Vault` as the default fallback.

File tools and many agent APIs do not expand shell variables. Do not pass paths containing `$OBSIDIAN_VAULT_PATH` to file operations; resolve the vault path first and pass a concrete absolute path. Vault paths may contain spaces, which is another reason to prefer structured file tools over shell commands.

If the vault path is unknown, a shell command is acceptable for resolving `OBSIDIAN_VAULT_PATH` or checking whether the fallback path exists. Once the path is known, switch back to file operations.

## Read a note

Read the resolved absolute path to the note. Prefer file-reading tools that provide line numbers and pagination when available.

## List notes

Use a filesystem listing/search operation under the resolved vault path.

- To list all Markdown notes, search for `*.md` under the vault path.
- To list a subfolder, search under that subfolder's absolute path.
- Avoid dumping the entire vault unless the user explicitly asks.

## Search

Use filename and content search operations rather than ad hoc shell pipelines when the agent provides them.

- For filenames, search files by glob or name pattern.
- For note contents, search file contents and restrict to Markdown files with `*.md` when possible.
- Return concise matches with paths and short context unless the user asks for full notes.

## Create a note

Create notes by writing full Markdown content to the resolved absolute note path. Prefer structured file-writing tools over shell heredocs or `echo` because they avoid quoting issues and provide clearer results.

When useful, include Obsidian wikilinks such as `[[Related Note]]` to connect related material.

## Append to a note

Prefer a native file-tool workflow when it is not awkward:

1. Read the target note.
2. Use an anchored edit when there is stable context, such as adding a section after an existing heading or before a known trailing block.
3. Rewrite the whole note only when that is clearer and safe.

For a simple append with no stable context, a shell append is acceptable if it is the clearest safe option and the path is correctly quoted.

## Targeted edits

Use targeted replacement or patch operations for focused note changes when the current content gives stable context. Avoid brittle line-number edits unless the tool requires them and the file has just been read.

## Wikilinks

Obsidian links notes with `[[Note Name]]` syntax. When creating or organizing notes, use wikilinks to connect related notes.

Common patterns:

- `[[Project Name]]`
- `[[Daily Notes/2026-05-30]]`
- `[[Note Name|display text]]`

## Verification checklist

- Resolved the vault path to a concrete path.
- Used Markdown note paths under the vault unless the user explicitly asked otherwise.
- Read before editing existing notes.
- Preserved existing content and formatting.
- Reported changed files or search results clearly.
