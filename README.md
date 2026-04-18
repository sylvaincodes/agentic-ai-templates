<br />

# Agentic AI Templates

<br />

> **The Package Manager for AI Agent Intelligence.** `agentic-ai-templates` is a universal CLI tool designed to install and manage reusable AI "modules" (skills and commands) directly into your AI coding environments like **Claude Code**, **OpenAI Codex**, and more.

---

<br />

## Quick Start

Enhance your local AI agent in seconds without leaving your terminal:

```bash
npx agentic-ai-templates install --claude-code --skill product/idea-to-roadmap
```

1. Skills (Behavior)
   Defines how an AI thinks. These are high-level personas and cognitive frameworks (e.g., Senior Product Strategist, Senior Security Auditor).

2. Commands (Workflows)
   Defines what an AI does. These are specific, repeatable execution steps (e.g., Code Review, Unit Test Generation).

3. Adapters
   The bridge between the remote registry and your local project. Adapters automatically inject the required configuration into your specific AI tool's config files (e.g., .claude/instructions.md).

<br />

## CLI Usage

- Install a Skill

```Bash
agentic-ai-templates install --claude-code --skill <path/to/skill>
```

<br />
- Remove a Skill

```Bash
agentic-ai-templates remove --claude-code --skill <id>
```

<br />

## Security & Production Readiness

- Idempotent Injections: Uses unique Marker Tags (``) to ensure your config files are never corrupted by duplicate installs.
  <br />
- Schema Validation: Every skill fetched from the registry is validated via Zod to prevent malformed or malicious prompt injections.
  <br />
- Zero Runtime Overhead: The CLI is an installer, not a proxy. Once a skill is installed, the AI tool reads it locally. There is no dependency on our servers during your AI interactions.
  <br />
- Manifest Tracking: A local .agentic/manifest.json acts as your source of truth, managing versions and installation timestamps for total project auditability.
  <br />
  <br />

## Local Architecture

When you install a skill, the CLI generates/updates:

**.agentic/manifest.json**: Tracks your "Intelligence Stack."

**..claude/instructions.md**.: Injects the system prompt and rules for Claude Code.

**..vscode/settings.json**.: (Optional) Workspace-level settings for AI extensions.

<br />
<br />

## License & Intellectual Property

Copyright © 2026 <u>sylvaincodes</u>. All rights reserved.

This software is Proprietary. While the package is publicly available on npm for use, the source code, logic, and adapters are not licensed for reproduction, redistribution, or modification.

Permission: You are granted permission to use this tool in personal and commercial projects via the official npx or npm install distribution.

Prohibition: Reproduction of the source code or redistribution via third-party registries is strictly prohibited.

---

<br />

**Developed by [sylvaincodes](https://github.com/sylvaincodes)** _Solo founder building the future of agentic workflows._

<br />

[📂 GitHub Registry](https://github.com/sylvaincodes/agentic-ai-templates-registry) | [🐞 Report Issues](https://github.com/sylvaincodes/agentic-ai-templates-registry/issues)
