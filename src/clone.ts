import { spawn } from "node:child_process";
import type { Spinner } from "yocto-spinner";
import { parseGitUrl, type ParsedGitUrl } from "./url-parser.js";
import { getClonePath, ensureParentDir, removeIfExists } from "./utils.js";
import { createUI, type UI } from "./ui.js";
import { parseGitProgress, formatProgress } from "./git-progress.js";
import { addToHistory } from "./history.js";

export interface CloneOptions {
  verbose?: boolean;
  depth?: number;
  branch?: string;
}

export interface CloneResult {
  success: boolean;
  path: string;
  repoName: string;
  error?: string;
}

/**
 * Execute git clone with progress tracking.
 */
function executeGitClone(
  url: string,
  targetPath: string,
  depth: number,
  branch: string | undefined,
  spinner: Spinner | null
): Promise<string | null> {
  return new Promise((resolve, reject) => {
    const args = ["clone", "--depth", String(depth)];

    if (spinner) {
      args.push("--progress");
    }

    if (branch) {
      args.push("--branch", branch);
    }

    args.push(url, targetPath);

    const gitProcess = spawn("git", args, {
      stdio: ["ignore", "ignore", "pipe"],
    });

    let errorOutput = "";

    gitProcess.stderr?.on("data", (data: Buffer) => {
      const text = data.toString();
      errorOutput += text;

      if (spinner) {
        // Parse progress and update spinner
        const lines = text.split(/[\r\n]+/);
        for (const line of lines) {
          const progress = parseGitProgress(line);
          if (progress) {
            spinner.text = formatProgress(progress);
          }
        }
      }
    });

    gitProcess.on("close", (code) => {
      if (code === 0) {
        resolve(null);
      } else {
        // Extract meaningful error from output
        const errorMatch = errorOutput.match(/fatal: (.+)/);
        const errorMessage = errorMatch
          ? errorMatch[1]
          : `Clone failed with exit code ${code}`;
        reject(new Error(errorMessage));
      }
    });

    gitProcess.on("error", (err) => {
      reject(new Error(`Failed to spawn git: ${err.message}`));
    });
  });
}

/**
 * Clone a git repository to /tmp.
 */
export async function cloneRepository(
  url: string,
  options: CloneOptions = {}
): Promise<CloneResult> {
  const { verbose = true, depth = 1, branch } = options;
  const ui = createUI(verbose);

  // Parse the URL
  let parsed: ParsedGitUrl;
  try {
    parsed = parseGitUrl(url);
  } catch (error) {
    return {
      success: false,
      path: "",
      repoName: "",
      error: error instanceof Error ? error.message : "Failed to parse URL",
    };
  }

  // Show header
  ui?.showHeader(parsed);

  // Determine target path
  const targetPath = getClonePath(parsed.owner, parsed.repoName);

  // Ensure parent directory exists
  ensureParentDir(parsed.owner);

  // Remove existing directory if present
  const removed = removeIfExists(targetPath);
  if (removed) {
    ui?.showInfo("Removed existing directory");
  }

  // Clone with spinner when running interactively; otherwise log once.
  const spinner = ui?.startSpinner(`Cloning ${parsed.owner}/${parsed.repoName}...`) ?? null;

  try {
    await executeGitClone(url, targetPath, depth, branch, spinner);

    ui?.spinnerSuccess(spinner);
    ui?.showResult(true, targetPath);

    // Track in history
    addToHistory(url, targetPath);

    return {
      success: true,
      path: targetPath,
      repoName: parsed.repoName,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Clone failed";

    ui?.spinnerError(spinner);
    ui?.showResult(false, errorMessage);

    return {
      success: false,
      path: targetPath,
      repoName: parsed.repoName,
      error: errorMessage,
    };
  }
}
