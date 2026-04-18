import { z } from "zod";

export const SkillSchema = z.object({
  id: z.string(),
  type: z.literal("skill"),
  name: z.string(),
  system_prompt: z.string(),
  rules: z.array(z.string()).optional(),
  version: z.string(),
});

export const CommandSchema = z.object({
  id: z.string(),
  type: z.literal("command"),
  steps: z.array(z.string()),
  output_format: z.string().default("structured"),
});

export type Skill = z.infer<typeof SkillSchema>;
export type Command = z.infer<typeof CommandSchema>;

export interface AgentAdapter {
  target: "claude-code" | "codex" | "gemini-cli";
  installSkill(skill: Skill): Promise<void>;
  installCommand(command: Command): Promise<void>;
  remove(id: string): Promise<void>;
}
