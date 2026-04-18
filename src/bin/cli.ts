#!/usr/bin/env node
import chalk from "chalk";
import { Command } from "commander";

import { ClaudeCodeAdapter } from "../adapters/claudeCode.adapter.js";
import { getManifest, updateManifest } from "../core/manifest.js";
import { fetchSkill } from "../core/registryClient.js";

const program = new Command();

program
  .name("agentic-ai-templates")
  .description("Install AI capabilities into your coding agents")
  .version("0.1.0");

program
  .command("install")
  .description("Install a skill or command")
  .option("--claude-code", "Target Claude Code")
  .option("--skill <id>", "Skill ID to install")
  .action(async (options) => {
    try {
      // ✅ OPTION A FIX: correct access to kebab-case flag
      const targetClaude = options.claudeCode === true;

      if (!targetClaude) {
        console.error(
          chalk.red("❌ Error: You must specify an agent (use --claude-code)"),
        );
        process.exit(1);
      }

      if (options.skill) {
        const skillId = options.skill;

        console.log(chalk.blue(`⏳ Fetching skill: ${skillId}...`));

        // 🔥 Debug-safe fetch
        const skill = await fetchSkill(skillId);

        // 1. Install via adapter
        const adapter = new ClaudeCodeAdapter();
        await adapter.installSkill(skill);

        // 2. Update manifest
        const manifest = await getManifest();
        const skills = manifest?.skills || [];

        const exists = skills.find((s) => s.id === skill.id);

        if (!exists) {
          skills.push({
            id: skill.id,
            version: skill.version,
            installedAt: new Date().toISOString(),
          });
        }

        await updateManifest({ skills });

        console.log(
          chalk.green(`\n✔ Skill installed: ${chalk.bold(skill.name)}`),
        );

        console.log(chalk.gray(`  Target: Claude Code`));
        console.log(
          chalk.gray(
            `  Files updated: .claude/instructions.md, .agentic/manifest.json`,
          ),
        );
      } else {
        console.error(chalk.red("❌ Error: --skill <id> is required"));
      }
    } catch (error: any) {
      console.error(chalk.red(`\n❌ Installation failed: ${error.message}`));
    }
  });

program.parse();
