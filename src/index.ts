#!/usr/bin/env node
import { Command } from "commander";
import { existsSync, readdirSync, rmSync } from "node:fs";
import { cloneRepository } from "./clone.js";
import { expandShorthand, isValidGitUrl } from "./url-parser.js";
import { checkGitInstalled, BASE_DIR } from "./utils.js";
import { loadConfig, printConfig } from "./config.js";
import { printHistory, clearHistory } from "./history.js";
import { copyToClipboard } from "./clipboard.js";
import { upgrade } from "./upgrade.js";
import { runGarbageCollection } from "./gc.js";

const program = new Command();

program
  .name("tmp-git-clone")
  .description("Clone git repositories for quick exploration")
  .version("1.0.0");

// Default clone command
program
  .argument("[url]", "Git repository URL or owner/repo shorthand")
  .option("-d, --depth <number>", "Clone depth", "1")
  .option("-b, --branch <name>", "Branch to clone")
  .option("-q, --quiet", "Suppress verbose output")
  .option("-c, --copy", "Copy path to clipboard after clone")
  .action(async (url: string | undefined, options: { depth: string; branch?: string; quiet?: boolean; copy?: boolean }) => {
    // Run garbage collection before any operation
    const gcResult = runGarbageCollection();
    if (gcResult.removed.length > 0 && !options.quiet) {
      console.log(`Cleaned up ${gcResult.removed.length} old clone(s)`);
    }

    if (!url) {
      program.help();
      return;
    }

    // Check git is installed
    if (!checkGitInstalled()) {
      console.error("Error: git is not installed or not in PATH");
      process.exit(1);
    }

    // Expand shorthand (e.g., rails/rails -> https://github.com/rails/rails)
    const expandedUrl = expandShorthand(url);

    // Validate URL format
    if (!isValidGitUrl(expandedUrl)) {
      console.error("Error: Invalid Git URL format");
      console.error("Supported formats:");
      console.error("  - owner/repo (GitHub shorthand)");
      console.error("  - https://github.com/user/repo");
      console.error("  - git@github.com:user/repo.git");
      process.exit(1);
    }

    const depth = parseInt(options.depth, 10);
    if (isNaN(depth) || depth < 1) {
      console.error("Error: Depth must be a positive integer");
      process.exit(1);
    }

    // Load config and merge with CLI options
    const config = loadConfig();
    const shouldCopy = options.copy ?? config.copy;

    const result = await cloneRepository(expandedUrl, {
      verbose: !options.quiet,
      depth,
      branch: options.branch ?? config.defaultBranch ?? undefined,
    });

    if (!result.success) {
      process.exit(1);
    }

    // Copy to clipboard if requested
    if (shouldCopy) {
      const copied = copyToClipboard(result.path);
      if (copied && !options.quiet) {
        console.log("  Path copied to clipboard");
      }
    }

    // In quiet mode, just output the path for scripting
    if (options.quiet) {
      console.log(result.path);
    }
  });

// List subcommand
program
  .command("list")
  .description("List cloned repositories")
  .action(() => {
    // Run GC silently before listing
    runGarbageCollection();

    if (!existsSync(BASE_DIR)) {
      console.log("No cloned repositories.");
      return;
    }

    const owners = readdirSync(BASE_DIR, { withFileTypes: true })
      .filter((d) => d.isDirectory())
      .map((d) => d.name);

    if (owners.length === 0) {
      console.log("No cloned repositories.");
      return;
    }

    console.log("Cloned repositories:\n");

    for (const owner of owners) {
      const ownerPath = `${BASE_DIR}/${owner}`;
      const repos = readdirSync(ownerPath, { withFileTypes: true })
        .filter((d) => d.isDirectory())
        .map((d) => d.name);

      for (const repo of repos) {
        console.log(`  ${owner}/${repo}`);
        console.log(`  └─ ${ownerPath}/${repo}`);
        console.log("");
      }
    }
  });

// Clean subcommand
program
  .command("clean")
  .description("Remove all cloned repositories")
  .option("-y, --yes", "Skip confirmation")
  .action((options: { yes?: boolean }) => {
    if (!existsSync(BASE_DIR)) {
      console.log("Nothing to clean.");
      return;
    }

    if (!options.yes) {
      console.log(`This will remove all contents of ${BASE_DIR}`);
      console.log("Run with --yes to confirm.");
      return;
    }

    rmSync(BASE_DIR, { recursive: true, force: true });
    console.log("Cleaned all cloned repositories.");
  });

// History subcommand
program
  .command("history")
  .description("Show clone history")
  .option("--clear", "Clear history")
  .action((options: { clear?: boolean }) => {
    if (options.clear) {
      clearHistory();
      console.log("History cleared.");
      return;
    }

    printHistory();
  });

// Config subcommand
program
  .command("config")
  .description("Show current configuration")
  .action(() => {
    printConfig();
  });

// Upgrade subcommand
program
  .command("upgrade")
  .description("Upgrade to the latest version")
  .action(async () => {
    await upgrade();
  });

program.parse();
