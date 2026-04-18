#!/usr/bin/env node
import chalk from "chalk";
import { Command } from "commander";
import ora from "ora";

import { ClaudeCodeAdapter } from "../adapters/claudeCode.adapter.js";
import { getManifest, updateManifest } from "../core/manifest.js";
import { fetchSkill } from "../core/registryClient.js";

const program = new Command();

program
  .name("agentic-ai-templates")
  .description(
    "Install high-performance AI capabilities into your coding agents.",
  )
  .version("1.0.0");

program
  .command("install")
  .description("Install a specific intelligence module from the registry")
  .option("--claude-code", "Target the Claude Code agent environment")
  .requiredOption(
    "--skill <id>",
    "The unique ID of the skill to install (e.g., product/idea-to-roadmap)",
  )
  .action(async (options) => {
    const spinner = ora();

    try {
      // 1. Validation Logic
      const isClaude = !!options.claudeCode;

      if (!isClaude) {
        console.error(
          chalk.red(
            "\n❌ Error: No target agent specified. Use --claude-code.",
          ),
        );
        process.exit(1);
      }

      const skillId = options.skill;
      spinner.start(
        chalk.blue(`Connecting to registry for ${chalk.bold(skillId)}...`),
      );

      // 2. Fetch with Timeout/Retry (handled in registryClient)
      const skill = await fetchSkill(skillId);
      spinner.text = chalk.blue(
        `Configuring adapter for ${chalk.bold(skill.name)}...`,
      );

      // 3. Adapter Execution
      const adapter = new ClaudeCodeAdapter();
      await adapter.installSkill(skill);

      // 4. Manifest Persistence
      spinner.text = chalk.blue(`Updating project manifest...`);
      const manifest = await getManifest();
      const skills = manifest?.skills || [];

      const existingIndex = skills.findIndex((s) => s.id === skill.id);
      const skillEntry = {
        id: skill.id,
        version: skill.version,
        installedAt: new Date().toISOString(),
      };

      if (existingIndex > -1) {
        skills[existingIndex] = skillEntry;
      } else {
        skills.push(skillEntry);
      }

      await updateManifest({ skills });

      spinner.succeed(
        chalk.green(`Successfully installed: ${chalk.bold(skill.name)}`),
      );

      // Calculate the actual path based on your Adapter logic
      const relativeSkillPath = `.claude/skills/${skill.id}/SKILL.md`;

      console.log(chalk.dim(`\n--- Deployment Summary ---`));
      console.log(chalk.gray(`• Agent:  Claude Code`));
      console.log(chalk.gray(`• Status: ${chalk.green("Active")}`));
      console.log(chalk.gray(`• Path:   ${chalk.cyan(relativeSkillPath)}`));

      console.log(
        chalk.yellow(
          `\n💡 Tip: Tell Claude to "Use the skills in .claude/skills" to activate this persona.`,
        ),
      );
    } catch (error: any) {
      spinner.fail(chalk.red(`Installation Failed`));
      console.error(chalk.yellow(`\nReason: ${error.message}`));

      // Production Security: Log to a file if needed, but don't leak stack traces to users
      process.exit(1);
    }
  });

program.parse(process.argv);
