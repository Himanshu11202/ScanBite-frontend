---
name: create-skill
description: "Guide the user through creating a workspace skill file (SKILL.md) with proper frontmatter, location, and validation."
user-invocable: true
---

# Create Skill

Use this skill when you need to define a new `SKILL.md` customization file for the current workspace.

## When to use
- Need a reusable workflow skill rather than a one-off prompt or instruction.
- Want to package a multi-step creation process with clear guidance.
- Need a workspace-scoped asset in `.github/skills/<name>/SKILL.md`.

## Workflow
1. Confirm the intended outcome and whether this is a workspace or user-scoped customization.
2. Choose the skill location: workspace skills belong under `.github/skills/<name>/SKILL.md`.
3. Create the file with YAML frontmatter:
   - `name`
   - `description`
   - `user-invocable` (true/false)
4. Add a concise body explaining the skill's purpose, usage, and quality criteria.
5. Validate the file:
   - frontmatter syntax is valid YAML
   - description is clear and discoverable
   - file is in the correct path

## Quality criteria
- The skill file uses valid YAML frontmatter.
- The `description` includes clear trigger language.
- The output is tailored to workspace-level creation guidance.
- The file is saved as `.github/skills/create-skill/SKILL.md`.
