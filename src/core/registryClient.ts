import axios from "axios";
import chalk from "chalk";
import { SkillSchema, type Skill } from "../types/index.js";

const GITHUB_OWNER = "sylvaincodes";
const GITHUB_REPO = "agentic-ai-templates-registry";
const GITHUB_BRANCH = "master";

const BASE_RAW_URL = `https://raw.githubusercontent.com/${GITHUB_OWNER}/${GITHUB_REPO}/${GITHUB_BRANCH}`;

export async function fetchSkill(id: string): Promise<Skill> {
  const safeId = id.replace(/^\/+|\/+$/g, "");
  const url = `${BASE_RAW_URL}/skills/${safeId}/skill.json`;

  // 1. LOG THE URL SO YOU CAN CLICK IT IN YOUR TERMINAL
  console.log(chalk.dim(`   [Debug] Requesting: ${url}`));

  try {
    const response = await axios.get(url, {
      timeout: 5000,
      headers: {
        Accept: "application/json",
        "User-Agent": "agentic-cli", // GitHub sometimes requires a User-Agent
      },
    });

    console.log(response.headers["content-type"]);

    return SkillSchema.parse(response.data);
  } catch (error: any) {
    if (error.response?.status === 404) {
      // 2. PROVIDE A CLEAR ERROR MESSAGE
      throw new Error(
        `Skill '${id}' not found.\n` +
          `   Possible reasons:\n` +
          `   - The repo is PRIVATE (raw.githubusercontent.com requires Public repos)\n` +
          `   - The file is not at /skills/${safeId}/skill.json\n` +
          `   - Case sensitivity (Product vs product)`,
      );
    }
    throw new Error(`Registry error: ${error.message}`);
  }
}
