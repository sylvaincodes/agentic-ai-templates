#!/usr/bin/env node
import chalk from "chalk";
import { Command } from "commander";
import ora from "ora";

import { ClaudeCodeAdapter } from "../adapters/claudeCode.adapter.js";
import { getManifest, updateManifest } from "../core/manifest.js";
import { fetchAgent, fetchGoal, fetchSkill } from "../core/registryClient.js";

const program = new Command();

program
  .name("agentic-ai-templates")
  .description(
    "Install high-performance AI capabilities into your coding agents.",
  )
  .version("1.0.0");

program
  .command("install")
  .description(
    "Install a specific intelligence module or a complete goal from the registry",
  )
  .option("--claude-code", "Target the Claude Code agent environment")
  .option("--skill <id>", "The unique ID of the skill to install")
  .option("--agent <id>", "The unique ID of the agent to install")
  .option(
    "--goal <id>",
    "The unique ID of the goal to install (includes multiple skills + command)",
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

      if (!options.skill && !options.goal && !options.agent) {
        console.error(
          chalk.red(
            "\n❌ Error: You must specify either a --skill or a --goal or a --agent to install.",
          ),
        );
        process.exit(1);
      }

      const adapter = new ClaudeCodeAdapter();
      const manifest = await getManifest();
      const skillsInManifest = manifest?.skills || [];

      // --- HANDLE GOAL INSTALLATION ---
      if (options.goal) {
        spinner.start(
          chalk.blue(`Fetching Goal: ${chalk.bold(options.goal)}...`),
        );
        const goal = await fetchGoal(options.goal);

        spinner.text = chalk.blue(
          `Installing skills for goal: ${goal.title}...`,
        );

        // 1. Install all skills (Knowledge base)
        for (const skill of goal.skills) {
          await adapter.installSkill(skill);

          const existingIndex = skillsInManifest.findIndex(
            (s) => s.id === skill.id,
          );
          const entry = {
            id: skill.id,
            version: skill.version,
            installedAt: new Date().toISOString(),
          };
          if (existingIndex > -1) skillsInManifest[existingIndex] = entry;
          else skillsInManifest.push(entry);
        }

        // ✅ 2. NEW: Provision Agents (The Team)
        if (goal.agents) {
          spinner.text = chalk.blue(`Provisioning AI Agent team...`);
          for (const [name, agentConfig] of Object.entries(goal.agents)) {
            await adapter.installAgent(name, agentConfig);
          }
        }

        // 3. Install the Goal Command (Orchestrator)
        if (goal.commands) {
          spinner.text = chalk.blue(`Registering orchestration commands...`);
          const commandToInstall = Object.values(goal.commands)[0];
          await adapter.installCommand(commandToInstall!, goal.id);
        }

        await updateManifest({ skills: skillsInManifest });
        spinner.succeed(
          chalk.green(`Goal Successfully Installed: ${chalk.bold(goal.title)}`),
        );

        // --- ENHANCED SUMMARY ---
        const trigger = Object.values(goal.commands!)[0]?.trigger || "/execute";
        console.log(chalk.dim(`\n--- Goal Summary ---`));
        console.log(chalk.gray(`• Status:   ${chalk.green("Active")}`));
        console.log(
          chalk.gray(`• Skills:   ${goal.skills.length} modules loaded`),
        );

        if (goal.agents) {
          const agentNames = Object.keys(goal.agents)
            .map((name) => `@${name}`)
            .join(", ");
          console.log(chalk.gray(`• Team:     ${chalk.magenta(agentNames)}`));
        }

        console.log(chalk.gray(`• Command:  ${chalk.cyan(trigger)}`));
        console.log(
          chalk.yellow(
            `\n🚀 Run ${chalk.bold(trigger)} in Claude Code to start the guided workflow.`,
          ),
        );
      }

      // --- HANDLE AGENT INSTALLATION ---
      else if (options.agent) {
        spinner.start(
          chalk.blue(`Fetching Agent: ${chalk.bold(options.agent)}...`),
        );
        const agent = await fetchAgent(options.agent);

        // ✅ AUTO-INSTALL REQUIRED SKILL
        // We check the manifest to see if the agent's brain is already there
        if (!skillsInManifest.some((s) => s.id === agent.skill_id)) {
          spinner.text = chalk.blue(
            `Agent requires skill: ${chalk.bold(agent.skill_id)}. Fetching...`,
          );

          const requiredSkill = await fetchSkill(agent.skill_id);
          await adapter.installSkill(requiredSkill);

          // Update manifest list so we don't install it again next time
          skillsInManifest.push({
            id: requiredSkill.id,
            version: requiredSkill.version,
            installedAt: new Date().toISOString(),
          });

          // Save the manifest immediately
          await updateManifest({ skills: skillsInManifest });
        }

        spinner.text = chalk.blue(
          `Provisioning @${agent.id} into Claude Code...`,
        );
        // Note: adapter.installAgent expects (name, config)
        await adapter.installAgent(agent.id, {
          role: agent.role,
          skill_id: agent.skill_id,
          instruction: agent.instruction,
          version: agent.version,
        });

        spinner.succeed(
          chalk.green(
            `Agent Successfully Installed: ${chalk.bold("@" + agent.id)}`,
          ),
        );
        console.log(chalk.gray(`• Role:    ${agent.role}`));
        console.log(
          chalk.gray(
            `• Context:  Linked to skill ${chalk.cyan(agent.skill_id)}`,
          ),
        );
        console.log(
          chalk.yellow(
            `\n💡 You can now reference @${agent.id} in your prompts.`,
          ),
        );
      }

      // --- HANDLE SINGLE SKILL INSTALLATION ---
      else if (options.skill) {
        spinner.start(
          chalk.blue(`Fetching Skill: ${chalk.bold(options.skill)}...`),
        );
        const skill = await fetchSkill(options.skill);

        await adapter.installSkill(skill);

        const existingIndex = skillsInManifest.findIndex(
          (s) => s.id === skill.id,
        );
        const skillEntry = {
          id: skill.id,
          version: skill.version,
          installedAt: new Date().toISOString(),
        };
        if (existingIndex > -1) skillsInManifest[existingIndex] = skillEntry;
        else skillsInManifest.push(skillEntry);

        await updateManifest({ skills: skillsInManifest });

        spinner.succeed(
          chalk.green(
            `Skill Successfully Installed: ${chalk.bold(skill.name)}`,
          ),
        );
        console.log(chalk.gray(`• Path: .claude/skills/${skill.id}/SKILL.md`));
      }
    } catch (error: any) {
      spinner.fail(chalk.red(`Installation Failed`));
      console.error(chalk.yellow(`\nReason: ${error.message}`));
      process.exit(1);
    }
  });

program.parse(process.argv);
