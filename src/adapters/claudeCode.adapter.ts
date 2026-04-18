import fs from "fs-extra";
import path from "node:path"; // Using node: prefix for Node 25 compatibility
import type { AgentAdapter, Skill } from "../types/index.js";

export class ClaudeCodeAdapter implements AgentAdapter {
  target = "claude-code" as const;
  private configDir = path.join(process.cwd(), ".claude");

  async installSkill(skill: Skill): Promise<void> {
    // 1. Production Safety: Ensure we are in a writable directory
    try {
      await fs.ensureDir(this.configDir);
    } catch (err) {
      throw new Error(
        `Permission Denied: Cannot create directory at ${this.configDir}`,
      );
    }

    const sanitizedName = skill.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    // 2. Nested path support: skill.id (e.g., 'product/roadmap') becomes nested folders
    const skillFolder = path.join(this.configDir, "skills", skill.id);
    const skillFile = path.join(skillFolder, "SKILL.md");
    const metaFile = path.join(skillFolder, "skill.json");

    await fs.ensureDir(skillFolder);

    const skillMarkdown = `
---
name: ${sanitizedName}
description: ${skill.description}
version: ${skill.version}
---

# 🧠 Skill: ${skill.name} (v${skill.version})

> ${skill.description}

## System Prompt
${skill.system_prompt}

## Rules
${skill.rules?.map((r) => `- ${r}`).join("\n")}

## Expected Output Format
${skill.output_format ?? "No specific format required."}
`.trim();

    // 3. Performance: Parallel writing
    await Promise.all([
      fs.writeFile(skillFile, skillMarkdown, "utf-8"),
      fs.writeFile(metaFile, JSON.stringify(skill, null, 2), "utf-8"),
    ]);
  }

  async installCommand(): Promise<void> {
    throw new Error(
      "Command installation is currently under development for the MVP.",
    );
  }

  async remove(skillId: string): Promise<void> {
    const skillFolder = path.join(this.configDir, "skills", skillId);

    // Safety check: Only remove if it's actually within the .claude directory
    if (
      skillFolder.includes(this.configDir) &&
      (await fs.pathExists(skillFolder))
    ) {
      await fs.remove(skillFolder);
    }
  }
}
