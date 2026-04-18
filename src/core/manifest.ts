import fs from "fs-extra";
import path from "node:path"; // Use node: prefix for modern Node 25 standards

export interface SkillEntry {
  id: string;
  version: string;
  installedAt: string;
}

export interface ProjectManifest {
  agent: "claude-code" | "codex" | "gemini-cli";
  installed_at: string;
  skills: SkillEntry[];
  commands: { id: string; installedAt: string }[];
}

const MANIFEST_DIR = path.join(process.cwd(), ".agenticaitemplates");
const MANIFEST_PATH = path.join(MANIFEST_DIR, "manifest.json");

export async function getManifest(): Promise<ProjectManifest | null> {
  try {
    if (!(await fs.pathExists(MANIFEST_PATH))) return null;
    return await fs.readJson(MANIFEST_PATH);
  } catch (error) {
    // In production, a corrupted JSON shouldn't crash the whole CLI
    return null;
  }
}

export async function updateManifest(
  update: Partial<ProjectManifest>,
): Promise<void> {
  const current = (await getManifest()) || {
    agent: "claude-code",
    installed_at: new Date().toISOString(),
    skills: [],
    commands: [],
  };

  const newManifest = { ...current, ...update };

  // Ensure directory exists
  await fs.ensureDir(MANIFEST_DIR);

  /**
   * PRODUCTION-GRADE TIP: Atomic Write
   * We write to a .tmp file and then rename it. This ensures that manifest.json
   * is never "half-written" if the process is killed.
   */
  const tempPath = `${MANIFEST_PATH}.tmp`;
  await fs.writeJson(tempPath, newManifest, { spaces: 2 });
  await fs.rename(tempPath, MANIFEST_PATH);
}
