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
  trigger: z.string(), // e.g., "/launch-landing-page"
  description: z.string(),
  parameters: z.array(z.string()).optional(),
  orchestration: z.array(z.string()), // The step-by-step logic
  checklist: z.array(z.string()).optional(),
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
  installCommand(command: Command, contextId?: string): Promise<void>;
  remove(id: string): Promise<void>;
}

// types/index.ts

/**
 * AgentSchema: Defines a specific persona within a Goal.
 */
export const AgentSchema = z.object({
  role: z.string(), // e.g., "Lead Strategist"
  skill_id: z.string(), // e.g., "product/idea-to-roadmap"
  instruction: z.string(), // Specific behavior for this agent
});

export type Agent = z.infer<typeof AgentSchema>;

/**
 * GoalSchema: The complete package (Skills + Agents + Commands).
 */
export const GoalSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().optional(),
  skills: z.array(SkillSchema),
  agents: z.record(z.string(), AgentSchema).optional(),
  commands: z.record(z.string(), CommandSchema).optional(),
});

export type Goal = z.infer<typeof GoalSchema>;
