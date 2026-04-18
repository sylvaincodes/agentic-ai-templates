import axios from 'axios';
import { SkillSchema, type Skill } from '../types/index.js';

const GITHUB_OWNER = 'sylvaincodes';
const GITHUB_REPO = 'agentic-ai-templates-registry';
const BASE_RAW_URL = `https://raw.githubusercontent.com/${GITHUB_OWNER}/${GITHUB_REPO}/main`;

/**
 * Fetches a skill by its ID (e.g., 'product/idea-to-roadmap')
 */
export async function fetchSkill(id: string): Promise<Skill> {
  // Path in your repo: skills/product/idea-to-roadmap/skill.json
  const url = `${BASE_RAW_URL}/skills/${id}/skill.json`;

  try {
    const response = await axios.get(url);
    // Use the Zod schema to validate the data from the registry
    return SkillSchema.parse(response.data);
  } catch (error: any) {
    if (error.response?.status === 404) {
      throw new Error(`Skill '${id}' not found in the registry.`);
    }
    throw new Error(`Failed to fetch skill: ${error.message}`);
  }
}
