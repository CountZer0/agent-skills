---
name: extended-thinking
description: Trigger deep multi-step reasoning before answering hard problems
agents: [claude]
version: 1.0.0
tags: [reasoning, planning, claude-specific]
input_schema:
  problem: string
  budget_tokens: integer
---

Before answering, think through this problem thoroughly inside a <parameter name="thinking"> block.

In your thinking:
- Break the problem into sub-problems
- Consider edge cases and counterarguments
- Explore multiple solution paths before committing
- Identify assumptions and flag ones you're uncertain about

After thinking, give your answer directly — no recap of the reasoning process unless asked.

Set budget_tokens to control depth (default 8000; increase for harder problems).
