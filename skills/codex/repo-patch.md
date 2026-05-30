---
name: repo-patch
description: Generate a minimal, correct patch for a described code change
agents: [codex]
version: 1.0.0
tags: [code, patch, codex-specific]
input_schema:
  task: string
  file_context: string
---

Generate a patch that implements the described change.

Output format: unified diff only.

```diff
--- a/path/to/file
+++ b/path/to/file
@@ -N,M +N,M @@
 context line
-removed line
+added line
 context line
```

Rules:
- Make the smallest change that correctly solves the task.
- Do not refactor surrounding code unless the task requires it.
- Include 3 lines of context around each hunk.
- If multiple files need changes, emit one diff block per file.
- Output only the diff — no explanation, no prose.
