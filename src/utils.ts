import { existsSync, mkdirSync, rmSync } from "node:fs";
import { execSync } from "node:child_process";
import { join } from "node:path";
import { homedir } from "node:os";

export const BASE_DIR = join(homedir(), ".tmp-git-clone");

/**
 * Get the target clone path for a repository.
 */
export function getClonePath(owner: string, repoName: string): string {
  return join(BASE_DIR, owner, repoName);
}

/**
 * Ensure parent directory exists.
 */
export function ensureParentDir(owner: string): void {
  const ownerDir = join(BASE_DIR, owner);
  if (!existsSync(ownerDir)) {
    mkdirSync(ownerDir, { recursive: true });
  }
}

/**
 * Remove directory if it exists.
 */
export function removeIfExists(path: string): boolean {
  if (existsSync(path)) {
    rmSync(path, { recursive: true, force: true });
    return true;
  }
  return false;
}

/**
 * Check if git is installed and available.
 */
export function checkGitInstalled(): boolean {
  try {
    execSync("git --version", { stdio: "pipe" });
    return true;
  } catch {
    return false;
  }
}

