---
name: tmp-git-clone
description: CLI tool for quickly cloning git repositories for exploration and reference. Use when needing to: (1) Clone a repo to examine its code, (2) Look up documentation from a source repo, (3) Explore a codebase structure, (4) Get reference implementations from open source projects. Supports GitHub shorthand (owner/repo), shallow clones, branch selection, and auto-cleanup.
---

# tmp-git-clone

Clone git repos to `~/.tmp-git-clone/{owner}/{repo}` for quick exploration. Shallow clone by default for speed.

## Quick Start

```bash
# GitHub shorthand (recommended)
tmp-git-clone rails/rails

# Full URL
tmp-git-clone https://github.com/rails/rails

# SSH
tmp-git-clone git@github.com:rails/rails.git
```

## Common Options

```bash
# Clone specific branch
tmp-git-clone -b 7-2-stable rails/rails

# Deeper clone for history
tmp-git-clone --depth 10 rails/rails

# Quiet mode (outputs only path for scripting)
tmp-git-clone -q rails/rails

# Copy path to clipboard
tmp-git-clone -c rails/rails
```

## Commands

| Command | Description |
|---------|-------------|
| `tmp-git-clone list` | List all cloned repos |
| `tmp-git-clone clean --yes` | Remove all clones |
| `tmp-git-clone history` | Show recent clones |
| `tmp-git-clone config` | Show configuration |

## Workflow for Exploration

1. Clone the repo: `tmp-git-clone owner/repo`
2. Note the output path: `~/.tmp-git-clone/owner/repo`
3. Read files, explore structure, analyze code
4. Clones auto-cleanup after 3 days

## Configuration

Create `~/.tmp-git-clone/config.json` for defaults:

```json
{
  "copy": true,
  "depth": 1,
  "defaultBranch": null
}
```

## Requirements

- Node.js 18+
- Git

## Installation

```bash
# npx (no install needed)
npx github:lirrensi/tmp-git-clone rails/rails

# Or install globally
npm install -g github:lirrensi/tmp-git-clone
```
