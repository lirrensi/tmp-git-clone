# tmp-git-clone

A CLI tool for quickly cloning git repositories for exploration.

> **Fork of [wdavidturner/tmp-git-clone](https://github.com/wdavidturner/tmp-git-clone)** with cross-platform support and enhancements.

## What's New in This Fork

| Feature | Description |
|---------|-------------|
| **Cross-platform** | Works on Windows, macOS, and Linux (uses `~/.tmp-git-clone` everywhere) |
| **npx git install** | `npx github:lirrensi/tmp-git-clone` — no manual install needed |
| **Auto garbage collection** | Clones older than 3 days are automatically cleaned up |
| **AI Skill** | Included skill for agent integration |

## Features

- **GitHub shorthand** - `rails/rails` expands to `https://github.com/rails/rails`
- **Shallow clone** (`--depth 1`) for fast downloads
- **Branch support** - clone specific branches with `-b`
- **Organized storage** at `~/.tmp-git-clone/{owner}/{repo}`
- **Beautiful UI** with animated spinners and progress tracking
- **Real-time progress** parsing (Counting → Compressing → Receiving)
- **Auto-cleanup** - re-cloning removes existing directory first
- **Copy to clipboard** - automatically copy the cloned path
- **Clone history** - track recently cloned repositories
- **Config file** - set default behaviors
- **Quiet mode** for scripting

## Installation

### npx (Recommended)

No installation required — run directly from GitHub:

```bash
npx github:lirrensi/tmp-git-clone rails/rails
```

Works on Windows, macOS, and Linux. The `prepare` script auto-builds on first run.

### pnpm (global)

```bash
pnpm config set dangerouslyAllowAllBuilds true --global && pnpm install -g github:lirrensi/tmp-git-clone
```

### npm (global)

```bash
npm install -g github:lirrensi/tmp-git-clone
```

Then use anywhere:

```bash
tmp-git-clone rails/rails
```

## Usage

```bash
# Clone using GitHub shorthand
tmp-git-clone rails/rails

# Clone a repository with full URL
tmp-git-clone https://github.com/rails/rails

# SSH URLs work too
tmp-git-clone git@github.com:rails/rails.git

# Clone a specific branch
tmp-git-clone -b 7-2-stable rails/rails

# Custom clone depth
tmp-git-clone --depth 10 rails/rails

# Copy path to clipboard after clone
tmp-git-clone -c rails/rails

# Quiet mode (outputs only the path)
tmp-git-clone -q rails/rails
```

## Output

The tool provides a clean, boxed output with real-time progress:

```
╭────────────────────────────────────────────────╮
│                                                │
│  rails/rails                                   │
│  github.com                                    │
│                                                │
╰────────────────────────────────────────────────╯

  ⠋ Receiving 67%  12.4 MiB

╭────────────────────────────────────────────────╮
│                                                │
│  ✔ Cloned successfully                         │
│                                                │
│  → ~/.tmp-git-clone/rails/rails                 │
│                                                │
╰────────────────────────────────────────────────╯
```

## AI Coding Assistant Integration

This tool pairs well with AI coding assistants. Slash commands are included for Claude Code, Codex, and GitHub Copilot.

### Claude Code

Copy the included command to your Claude commands directory:

```bash
cp claude-clone-git-repo.md ~/.claude/commands/clone-git-repo.md
```

**Auto-Approve Permissions (Optional)**

To skip permission prompts, add this to your `~/.claude/settings.json`:

```json
{
  "permissions": {
    "allow": [
      "Bash(tmp-git-clone:*)",
      "Glob(~/.tmp-git-clone/**)",
      "Read(~/.tmp-git-clone/**)"
    ]
  }
}
```

**Usage:**

```
/clone-git-repo rails/rails
```

### Codex (OpenAI)

Copy the included command to your Codex commands directory:

```bash
cp codex-clone-git-repo.md ~/.codex/commands/clone-git-repo.md
```

**Usage:**

```
/clone-git-repo rails/rails
```

### GitHub Copilot

For Copilot Chat in VS Code, add the instructions to your workspace settings or use as a custom instruction:

```bash
# View the prompt template
cat copilot-clone-git-repo.md
```

Then in Copilot Chat, you can reference it or paste the instructions into your custom instructions settings.

**Usage in Copilot Chat:**

```
Clone and explore rails/rails using tmp-git-clone
```

---

All commands will:
1. Clone the repository
2. Read the README
3. Show the directory structure
4. Provide a summary of the project

## Options

| Option | Description |
|--------|-------------|
| `-d, --depth <n>` | Clone depth (default: 1) |
| `-b, --branch <name>` | Branch to clone |
| `-c, --copy` | Copy path to clipboard after clone |
| `-q, --quiet` | Suppress output, print only the cloned path |
| `-V, --version` | Show version number |
| `-h, --help` | Show help |

## Commands

| Command | Description |
|---------|-------------|
| `tmp-git-clone list` | List all cloned repositories in `~/.tmp-git-clone` |
| `tmp-git-clone clean` | Remove all cloned repositories (use `--yes` to skip confirmation) |
| `tmp-git-clone history` | Show clone history (use `--clear` to clear) |
| `tmp-git-clone config` | Show current configuration |
| `tmp-git-clone upgrade` | Upgrade to the latest version |

### Examples

```bash
# List all clones
tmp-git-clone list

# Clean all clones (with confirmation)
tmp-git-clone clean

# Clean all clones (skip confirmation)
tmp-git-clone clean --yes

# Show clone history
tmp-git-clone history

# Clear clone history
tmp-git-clone history --clear

# Show config
tmp-git-clone config

# Upgrade to latest version
tmp-git-clone upgrade
```

## Configuration

Configuration is stored at `~/.tmp-git-clone/config.json`. Create this file to set default behaviors:

```json
{
  "copy": true,
  "depth": 1,
  "defaultBranch": null
}
```

| Setting | Type | Description |
|---------|------|-------------|
| `copy` | boolean | Always copy path to clipboard after clone |
| `depth` | number | Default clone depth |
| `defaultBranch` | string \| null | Default branch to clone |

CLI flags always override config file settings.

## History

Clone history is stored at `~/.tmp-git-clone/history.json`. The tool tracks the last 50 cloned repositories with timestamps.

## Why `~/.tmp-git-clone`?

- Persistent across reboots (unlike /tmp)
- Easy to find and navigate
- Automatic cleanup of old clones (3 days)
- Keeps your workspace uncluttered
- Perfect for quick code exploration

## Requirements

- Node.js 18+
- Git

## License

MIT
