import fs from "fs-extra";
import path from "path";
import type { AgentAdapter, Skill } from "../types/index.js";

export class ClaudeCodeAdapter implements AgentAdapter {
  target = "claude-code" as const;
  private configDir = path.join(process.cwd(), ".claude");
  private instructionFile = path.join(this.configDir, "instructions.md");

  async installSkill(skill: Skill): Promise<void> {
    await fs.ensureDir(this.configDir);

    const content = await this.readInstructions();
    const markerStart = ``;
    const markerEnd = ``;

    const skillContent = `
${markerStart}
### 🧠 Skill: ${skill.name} (v${skill.version})
${skill.system_prompt}
${skill.rules?.map((r) => `- ${r}`).join("\n")}
${markerEnd}
`.trim();

    // If already exists, replace; otherwise, append
    const regex = new RegExp(`${markerStart}[\\s\\S]*?${markerEnd}`, "g");
    const newContent = regex.test(content)
      ? content.replace(regex, skillContent)
      : `${content}\n\n${skillContent}`;

    await fs.writeFile(this.instructionFile, newContent.trim());
  }

  private async readInstructions(): Promise<string> {
    if (!fs.existsSync(this.instructionFile))
      return "# Claude Project Instructions\n";
    return fs.readFile(this.instructionFile, "utf-8");
  }

  // ... installCommand and remove implementations
  async installCommand(): Promise<void> {
    throw new Error("installCommand not implemented yet");
  }

  async remove(): Promise<void> {
    throw new Error("remove not implemented yet");
  }
}
