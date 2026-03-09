import pc from "picocolors";
import yoctoSpinner, { type Spinner } from "yocto-spinner";
import type { ParsedGitUrl } from "./url-parser.js";

const BOX_WIDTH = 50;

const box = {
  topLeft: "╭",
  topRight: "╮",
  bottomLeft: "╰",
  bottomRight: "╯",
  horizontal: "─",
  vertical: "│",
};

const symbols = {
  success: "✔",
  error: "✖",
  info: "ℹ",
  arrow: "→",
};

function drawTop(): string {
  return pc.dim(
    box.topLeft + box.horizontal.repeat(BOX_WIDTH - 2) + box.topRight
  );
}

function drawBottom(): string {
  return pc.dim(
    box.bottomLeft + box.horizontal.repeat(BOX_WIDTH - 2) + box.bottomRight
  );
}

function drawRow(content: string, align: "left" | "center" = "left"): string {
  // Strip ANSI codes to get actual length
  const stripped = content.replace(/\x1b\[[0-9;]*m/g, "");
  const padding = BOX_WIDTH - 4 - stripped.length;

  if (align === "center") {
    const leftPad = Math.floor(padding / 2);
    const rightPad = padding - leftPad;
    return (
      pc.dim(box.vertical) +
      " ".repeat(leftPad + 1) +
      content +
      " ".repeat(rightPad + 1) +
      pc.dim(box.vertical)
    );
  }

  return (
    pc.dim(box.vertical) +
    "  " +
    content +
    " ".repeat(Math.max(0, padding)) +
    pc.dim(box.vertical)
  );
}

function drawEmpty(): string {
  return pc.dim(box.vertical) + " ".repeat(BOX_WIDTH - 2) + pc.dim(box.vertical);
}

export interface UI {
  showHeader(parsed: ParsedGitUrl): void;
  showInfo(message: string): void;
  showResult(success: boolean, path: string): void;
  startSpinner(text: string): Spinner | null;
  spinnerSuccess(spinner: Spinner | null): void;
  spinnerError(spinner: Spinner | null): void;
}

export function createUI(verbose: boolean): UI | null {
  if (!verbose) return null;

  const isInteractive = Boolean(process.stdin.isTTY && process.stdout.isTTY);

  return {
    showHeader(parsed: ParsedGitUrl): void {
      const repoLine = `${pc.bold(parsed.owner)}${pc.dim("/")}${pc.bold(pc.cyan(parsed.repoName))}`;
      const hostLine = pc.dim(parsed.host);

      console.log("");
      console.log(drawTop());
      console.log(drawEmpty());
      console.log(drawRow(repoLine));
      console.log(drawRow(hostLine));
      console.log(drawEmpty());
      console.log(drawBottom());
      console.log("");
    },

    showInfo(message: string): void {
      console.log(`  ${pc.blue(symbols.info)} ${pc.dim(message)}`);
    },

    showResult(success: boolean, pathOrError: string): void {
      console.log("");
      console.log(drawTop());
      console.log(drawEmpty());

      if (success) {
        console.log(drawRow(`${pc.green(symbols.success)} ${pc.green("Cloned successfully")}`));
        console.log(drawEmpty());
        console.log(drawRow(`${pc.dim(symbols.arrow)} ${pc.cyan(pathOrError)}`));
      } else {
        console.log(drawRow(`${pc.red(symbols.error)} ${pc.red("Clone failed")}`));
        console.log(drawEmpty());
        console.log(drawRow(pc.dim(pathOrError)));
      }

      console.log(drawEmpty());
      console.log(drawBottom());
      console.log("");
    },

    startSpinner(text: string): Spinner | null {
      if (!isInteractive) {
        console.log(`  ${pc.dim(symbols.arrow)} ${text}`);
        return null;
      }

      return yoctoSpinner({ text }).start();
    },

    spinnerSuccess(spinner: Spinner | null): void {
      spinner?.stop();
    },

    spinnerError(spinner: Spinner | null): void {
      spinner?.stop();
    },
  };
}
