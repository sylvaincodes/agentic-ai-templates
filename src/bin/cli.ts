#!/usr/bin/env node
import chalk from "chalk";
import { Command } from "commander";
import { ClaudeCodeAdapter } from "../adapters/claudeCode.adapter.js";
import { getManifest, updateManifest } from "../core/manifest.js";
import { fetchSkill } from "../core/registryClient.js";

const program = new Command();

program
  .name("agentic")
  .description("Install AI capabilities into your coding agents")
  .version("0.1.0");

program
  .command("install")
  .description("Install a skill or command")
  .option("--claude-code", "Target Claude Code")
  .option("--skill <id>", "Skill ID to install")
  .action(async (options) => {
    try {
      if (!options.claudeCode) {
        console.error(
          chalk.red(
            "❌ Error: You must specify a target agent (e.g., --claude-code)",
          ),
        );
        return;
      }

      if (options.skill) {
        console.log(chalk.blue(`⏳ Fetching skill: ${options.skill}...`));
        const skill = await fetchSkill(options.skill);

        // 1. Logic: Use Adapter
        const adapter = new ClaudeCodeAdapter();
        await adapter.installSkill(skill);

        // 2. Logic: Update Manifest
        const manifest = await getManifest();
        const skills = manifest?.skills || [];

        // Prevent duplicates in manifest
        if (!skills.find((s) => s.id === skill.id)) {
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
            `  Files: .claude/instructions.md, .agentic/manifest.json`,
          ),
        );
      }
    } catch (error: any) {
      console.error(chalk.red(`\n❌ Installation failed: ${error.message}`));
    }
  });

program.parse();
