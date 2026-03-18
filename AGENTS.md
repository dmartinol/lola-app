# Lola App – Agent Guidance

## Project Overview

**Lola App** is an MCP (Model Context Protocol) App for managing [Lola](https://github.com/RedHatProductSecurity/lola) resources—the AI Skills Package Manager that lets you write skills once and install them across Claude Code, Cursor, Gemini CLI, and OpenCode.

**Goal**: Build an application to manage Lola resources (modules, installations, marketplaces, projects).

## When the user asks about Lola (markets, modules, installations)

**ALWAYS use the Lola Manager MCP tools** — do NOT run `lola` CLI commands.

| User intent | Use MCP tool | Do NOT run |
|-------------|--------------|------------|
| List markets | `lola-list-markets` | `lola market ls` |
| Add market | `lola-add-market` | `lola market add` |
| Inspect market | `lola-inspect-market` | `lola market ls <name>` |
| Remove market | `lola-remove-market` | `lola market rm` |
| List modules | `lola-list-modules` | `lola mod ls` / `lola market ls` |
| Inspect module | `lola-inspect-module` | `lola mod info` |
| Add module | `lola-add-module` | `lola mod add` |
| Install module | `lola-install-module` | `lola install` |
| Remove modules | `lola-remove-modules` | `lola mod rm` |
| List installations | `lola-list-installations` | `lola list` |
| Uninstall | `lola-uninstall` | `lola uninstall` |

The MCP tools provide interactive UIs and are the intended interface. Invoke them instead of running terminal commands.

## What Lola Manages

| Resource | Location | Description |
|----------|----------|-------------|
| **Modules** | `~/.lola/modules/<name>/` | Skills, commands, agents, MCPs; added via `lola mod add` |
| **Installations** | `~/.lola/installed.yml` | Which modules are installed to which assistants/projects |
| **Marketplaces** | `~/.lola/market/*.yml` (ref) + `market/cache/*.yml` (catalog) | Curated module catalogs for discovery |
| **Project deps** | `.lola-req` in project root | Declarative module list (like requirements.txt) |

## Lola Data Model (for app integration)

- **Module**: `name`, `path`, `content_path`, `skills[]`, `commands[]`, `agents[]`, `mcps[]`, `has_instructions`, `pre/post_install_hook`
- **Installation**: `module_name`, `assistant`, `scope`, `project_path`, `skills`, `commands`, `agents`, `mcps`, `has_instructions`
- **Marketplace**: `name`, `url`, `enabled`, `modules[]` (each: `name`, `description`, `version`, `repository`, `tags`)
- **Assistants**: `claude-code`, `cursor`, `gemini-cli`, `opencode`

## Requirements

See [REQUIREMENTS.md](REQUIREMENTS.md) for the feature index and [specs/](specs/) for detailed specs. Use these for AI-driven development.

## Key Lola Operations (CLI → app features)

| CLI | App capability |
|-----|----------------|
| `lola market ls` | List markets (with UI) |
| `lola market add` | Add market |
| `lola market ls <name>` | Inspect market (URL, enabled, modules) |
| `lola market rm` | Remove market |
| `lola mod ls` / `lola market ls <name>` | List modules (registry or market, with UI) |
| `lola mod info` | Inspect module (path, skills, commands, agents, MCPs) |
| `lola mod add` | Add module from URL/path |
| `lola install` | Install module to assistant |
| `lola mod rm` | Remove modules from registry |
| `lola list` | List installations (with UI) |
| `lola uninstall` | Uninstall from assistant |

## MCP App Development

- **Skills**: Use `.cursor/skills/create-mcp-app/SKILL.md` when creating MCP Apps, adding UI to tools, or scaffolding interactive views.
- **Patterns**: Follow `.cursor/rules/mcp-app-patterns.mdc` when editing server code, app UI, or resources.
- **Reference**: https://apps.extensions.modelcontextprotocol.io/api/documents/patterns.html

## Key MCP Conventions

1. **App-only tools** — `_meta.ui.visibility: ["app"]` for UI-driven tools (polling, state updates).
2. **Handler order** — Register all `App` handlers before `app.connect()`.
3. **CSP** — Configure in resource read callback's `contents[]`.
4. **Host context** — Use `McpUiHostContext` for theme, CSS variables, safe area insets.

## Related Skills

- `add-app-to-server` — Adding UI to an existing MCP server
- `convert-web-app` — Turning a web app into a hybrid MCP App
- `migrate-oai-app` — Migrating from OpenAI Apps SDK
