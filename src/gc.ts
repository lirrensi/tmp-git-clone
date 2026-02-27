import { existsSync, readdirSync, statSync, rmSync } from "node:fs";
import { join } from "node:path";
import { homedir } from "node:os";

const GC_TTL_DAYS = 3;
const GC_TTL_MS = GC_TTL_DAYS * 24 * 60 * 60 * 1000;

const BASE_DIR = join(homedir(), ".tmp-git-clone");

interface GcResult {
  removed: string[];
  errors: string[];
}

/**
 * Check if a directory is a clone directory (has .git folder or is owned by an owner folder).
 * Skip config files and special files.
 */
function isCloneDir(path: string, name: string): boolean {
  // Skip config/history files
  if (name === "config.json" || name === "history.json" || name === "gc-lock") {
    return false;
  }
  
  const fullPath = join(path, name);
  try {
    const stats = statSync(fullPath);
    return stats.isDirectory();
  } catch {
    return false;
  }
}

/**
 * Get the last modified time of a directory (recursively finds newest file).
 */
function getLastModified(dirPath: string): number {
  try {
    const entries = readdirSync(dirPath, { withFileTypes: true });
    let maxTime = statSync(dirPath).mtimeMs;

    for (const entry of entries) {
      const entryPath = join(dirPath, entry.name);
      if (entry.isDirectory()) {
        const subTime = getLastModified(entryPath);
        maxTime = Math.max(maxTime, subTime);
      } else {
        const stat = statSync(entryPath);
        maxTime = Math.max(maxTime, stat.mtimeMs);
      }
    }

    return maxTime;
  } catch {
    return Date.now(); // If we can't read it, assume it's fresh
  }
}

/**
 * Run garbage collection: remove clones older than TTL.
 */
export function runGarbageCollection(): GcResult {
  const result: GcResult = { removed: [], errors: [] };

  if (!existsSync(BASE_DIR)) {
    return result;
  }

  const now = Date.now();

  // Read owner directories
  const entries = readdirSync(BASE_DIR, { withFileTypes: true });
  const ownerDirs = entries.filter((e) => isCloneDir(BASE_DIR, e.name));

  for (const ownerDir of ownerDirs) {
    const ownerPath = join(BASE_DIR, ownerDir.name);

    // Read repo directories under each owner
    const repoEntries = readdirSync(ownerPath, { withFileTypes: true });
    const repoDirs = repoEntries.filter((e) => e.isDirectory());

    for (const repoDir of repoDirs) {
      const repoPath = join(ownerPath, repoDir.name);

      try {
        const lastModified = getLastModified(repoPath);
        const age = now - lastModified;

        if (age > GC_TTL_MS) {
          rmSync(repoPath, { recursive: true, force: true });
          result.removed.push(`${ownerDir.name}/${repoDir.name}`);
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        result.errors.push(`${ownerDir.name}/${repoDir.name}: ${msg}`);
      }
    }

    // Remove empty owner directories
    try {
      const remaining = readdirSync(ownerPath);
      if (remaining.length === 0) {
        rmSync(ownerPath, { recursive: true, force: true });
      }
    } catch {
      // Ignore cleanup errors for empty dirs
    }
  }

  return result;
}
