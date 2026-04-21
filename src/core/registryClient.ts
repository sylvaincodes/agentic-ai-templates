import axios from "axios";
import chalk from "chalk";
import {
  AgentSchema,
  GoalSchema,
  SkillSchema,
  type Agent,
  type Goal,
  type Skill,
} from "../types/index.js";

const GITHUB_OWNER = "sylvaincodes";
const GITHUB_REPO = "agentic-ai-templates-registry";
const GITHUB_BRANCH = "master";

const BASE_RAW_URL = `https://raw.githubusercontent.com/${GITHUB_OWNER}/${GITHUB_REPO}/${GITHUB_BRANCH}`;

/**
 * Common request config for GitHub raw access
 */
const axiosConfig = {
  timeout: 8000,
  headers: {
    Accept: "application/json",
    "User-Agent": "agentic-ai-templates-cli/1.0.0",
    "Cache-Control": "no-cache",
  },
};

/**
 * Fetches and validates a skill module.
 */
export async function fetchSkill(id: string): Promise<Skill> {
  const safeId = id.replace(/^\/+|\/+$/g, "");
  const url = `${BASE_RAW_URL}/skills/${safeId}/skill.json`;

  if (process.env.DEBUG)
    console.log(chalk.dim(`   [Debug] Requesting Skill: ${url}`));

  try {
    const response = await axios.get(url, axiosConfig);
    const result = SkillSchema.safeParse(response.data);

    if (!result.success) {
      throw new Error(
        `Skill Schema Validation Failed: ${formatZodError(result.error)}`,
      );
    }

    return result.data;
  } catch (error: any) {
    handleAxiosError(error, id, "Skill");
    throw error; // Re-throw to satisfy TS
  }
}

/**
 * Fetches and validates a Goal.
 * A goal contains multiple skills and orchestration commands.
 */
export async function fetchGoal(id: string): Promise<Goal> {
  const safeId = id.replace(/^\/+|\/+$/g, "");
  const url = `${BASE_RAW_URL}/goals/${safeId}/goal.json`;

  if (process.env.DEBUG)
    console.log(chalk.dim(`   [Debug] Requesting Goal: ${url}`));

  try {
    const response = await axios.get(url, axiosConfig);

    // Validate against GoalSchema
    const result = GoalSchema.safeParse(response.data);

    if (!result.success) {
      throw new Error(
        `Goal Schema Validation Failed: ${formatZodError(result.error)}`,
      );
    }

    return result.data;
  } catch (error: any) {
    handleAxiosError(error, id, "Goal");
    throw error;
  }
}

/**
 * Utility to format Zod errors consistently
 */
function formatZodError(error: any): string {
  return error.issues
    .map((i: any) => `${i.path.join(".")}: ${i.message}`)
    .join(", ");
}

/**
 * Utility to handle registry errors
 */
function handleAxiosError(error: any, id: string, type: string) {
  if (error.response?.status === 404) {
    throw new Error(
      `${type} '${id}' not found in registry.\n` +
        `   • Check your registry path: /${type.toLowerCase()}s/${id}/goal.json`,
    );
  }
  if (error.code === "ECONNABORTED") {
    throw new Error(`Registry timeout: GitHub took too long to respond.`);
  }
}

/**
 * Fetches and validates a standalone Agent persona.
 */
export async function fetchAgent(id: string): Promise<Agent> {
  // Clean the ID (remove leading/trailing slashes)
  const safeId = id.replace(/^\/+|\/+$/g, "");
  const url = `${BASE_RAW_URL}/agents/${safeId}/agent.json`;

  if (process.env.DEBUG)
    console.log(chalk.dim(`   [Debug] Requesting Agent: ${url}`));

  try {
    const response = await axios.get(url, axiosConfig);

    // Validate against AgentSchema
    const result = AgentSchema.safeParse(response.data);

    if (!result.success) {
      throw new Error(
        `Agent Schema Validation Failed: ${formatZodError(result.error)}`,
      );
    }

    return result.data;
  } catch (error: any) {
    // Reuse your existing error handler
    handleAxiosError(error, id, "Agent");
    throw error;
  }
}
