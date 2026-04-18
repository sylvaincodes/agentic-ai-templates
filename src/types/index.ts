import { z } from "zod";

/**
 * 🧠 SkillSchema: Defines the behavior and persona of an AI Agent.
 * Validates the core "Intelligence Modules" fetched from the registry.
 */
export const SkillSchema = z.object({
  id: z.string(),
  type: z.literal("skill"), // Enforces the "Package Type"
  name: z.string(),
  version: z.string(),
  description: z.string(),
  system_prompt: z.string(),
  rules: z.array(z.string()).default([]),
  output_format: z.string().optional(),
  // Metadata for the marketplace
  author: z
    .object({
      name: z.string(),
      id: z.string(),
    })
    .optional(),
  tags: z.array(z.string()).optional(),
  compatibility: z
    .object({
      agents: z.array(z.string()),
    })
    .optional(),
});

/**
 * ⚙️ CommandSchema: Defines specific workflows (Coming Soon).
 */
export const CommandSchema = z.object({
  id: z.string(),
  type: z.literal("command"),
  steps: z.array(z.string()),
  output_format: z.string().default("structured"),
});

export type Skill = z.infer<typeof SkillSchema>;
export type Command = z.infer<typeof CommandSchema>;

/**
 * 🔌 AgentAdapter: The "Translator" interface.
 * Any new agent (e.g., Gemini CLI) must implement this contract.
 */
export interface AgentAdapter {
  target: "claude-code" | "codex" | "gemini-cli";
  installSkill(skill: Skill): Promise<void>;
  installCommand(command: Command): Promise<void>;
  remove(id: string): Promise<void>;
}
