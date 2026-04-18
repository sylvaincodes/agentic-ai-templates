import fs from "fs-extra";
import path from "path";

export interface ProjectManifest {
  agent: "claude-code" | "codex" | "gemini-cli";
  installed_at: string;
  skills: { id: string; version: string; installedAt: string }[];
  commands: { id: string; installedAt: string }[];
}

const MANIFEST_PATH = path.join(process.cwd(), ".agentic", "manifest.json");

export async function getManifest(): Promise<ProjectManifest | null> {
  if (!(await fs.pathExists(MANIFEST_PATH))) return null;
  return fs.readJson(MANIFEST_PATH);
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
  await fs.ensureDir(path.dirname(MANIFEST_PATH));
  await fs.writeJson(MANIFEST_PATH, newManifest, { spaces: 2 });
}
