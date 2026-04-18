import axios from "axios";
import chalk from "chalk";
import { SkillSchema, type Skill } from "../types/index.js";

const GITHUB_OWNER = "sylvaincodes";
const GITHUB_REPO = "agentic-ai-templates-registry";
const GITHUB_BRANCH = "master"; // Ensure this matches your repo

const BASE_RAW_URL = `https://raw.githubusercontent.com/${GITHUB_OWNER}/${GITHUB_REPO}/${GITHUB_BRANCH}`;

/**
 * Fetches and validates a skill module from the remote GitHub registry.
 * Designed for Node 25+ environments.
 */
export async function fetchSkill(id: string): Promise<Skill> {
  const safeId = id.replace(/^\/+|\/+$/g, "");
  const url = `${BASE_RAW_URL}/skills/${safeId}/skill.json`;

  if (process.env.DEBUG) {
    console.log(chalk.dim(`   [Debug] Requesting: ${url}`));
  }

  try {
    const response = await axios.get(url, {
      timeout: 8000, // Increased slightly for slower global connections
      headers: {
        Accept: "application/json",
        "User-Agent": "agentic-ai-templates-cli/1.0.0",
        "Cache-Control": "no-cache", // Ensures we get the latest version from GitHub
      },
    });

    /**
     * SECURITY & VALIDATION
     * Zod will strip unknown fields (unless configured otherwise) and
     * ensure the 'type': 'skill' field is present.
     */
    const result = SkillSchema.safeParse(response.data);

    if (!result.success) {
      // Formats the Zod error into something readable for the user
      const issues = result.error.issues
        .map((i) => `${i.path.join(".")}: ${i.message}`)
        .join(", ");
      throw new Error(`Registry Schema Validation Failed: ${issues}`);
    }

    return result.data;
  } catch (error: any) {
    if (error.response?.status === 404) {
      throw new Error(
        `Skill '${id}' not found.\n` +
          `   • Ensure your registry repo is PUBLIC (required for raw access)\n` +
          `   • Verify branch name is actually '${GITHUB_BRANCH}'\n` +
          `   • Check case-sensitivity: /skills/${safeId}/skill.json`,
      );
    }

    if (error.code === "ECONNABORTED") {
      throw new Error(`Registry timeout: GitHub took too long to respond.`);
    }

    throw new Error(`Registry connection error: ${error.message}`);
  }
}
