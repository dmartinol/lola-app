# Lola Manager MCP App

An MCP App to manage [Lola](https://github.com/RedHatProductSecurity/lola) marketplaces and modules. View installed resources and install new ones from a PatternFly-styled React UI.

## Prerequisites

- [Lola](https://github.com/RedHatProductSecurity/lola) installed (e.g. `uv tool install lola`)
- Node.js 18+

## Quick Start

```bash
npm install
npm run build
npm run serve
```

The MCP server runs at `http://localhost:3001/mcp`.

## Development

```bash
npm run dev
```

Runs the app in development mode with hot reload.

## Usage

1. Add this server to your MCP client (e.g. Claude Desktop, Cursor):
   - **HTTP**: `http://localhost:3001/mcp`

2. Use one of the sample prompts below. Prompts that ask to manage or view Lola resources will open the interactive UI.

3. In the UI:
   - **Installed tab**: View marketplaces, modules, and installations (three separate sections)
   - **Search & Install tab**: Search across marketplaces and install modules to assistants (cursor, claude-code, gemini-cli, opencode)

## Sample Prompts

| Prompt | Opens UI? | Why |
|--------|-----------|-----|
| "Show my Lola modules" | Yes | Model calls `lola-list-modules` to display modules |
| "Show my Lola installations" | Yes | Model calls `lola-list-installations` to display installations |
| "Let me manage my Lola skills" | Yes | Model calls list tools for interactive management |
| "I want to install a new Lola module" | Yes | Model opens the UI via `lola-list-modules`; use Search & Install tab |
| "What Lola modules do I have installed?" | Yes | Model calls `lola-list-installations`; UI shows the full list |
| "List my Lola marketplaces" | Yes | Model calls `lola-list-markets`; UI shows markets |
| "What is Lola?" | No | Model answers from knowledge; no tool call needed |
| "How do I add a Lola marketplace?" | No | Model explains the `lola market add` CLI; no UI |

**Rule of thumb:** Prompts that ask to *view*, *list*, *manage*, *search*, or *install* Lola resources will open the UI. Prompts that ask *what* or *how* (explanatory) typically get a text reply without opening the UI.

## Tools

### Model-invokable (opens interactive UI)

| Tool | Description |
|------|-------------|
| `lola-list-markets` | List all registered Lola marketplaces with interactive UI |
| `lola-list-modules` | List modules from registry or a marketplace with interactive UI |
| `lola-list-installations` | List which modules are installed to which assistants with interactive UI |

### App-only (used by the UI for actions and polling)

| Tool | Description |
|------|-------------|
| `lola-add-market` | Add a new marketplace |
| `lola-inspect-market` | Get marketplace details (URL, enabled, modules) |
| `lola-remove-market` | Remove a marketplace |
| `lola-inspect-module` | Get module info (path, skills, commands, agents, MCPs) |
| `lola-add-module` | Add a module from git URL, zip, tar, or local path |
| `lola-install-module` | Install a module to an assistant |
| `lola-remove-modules` | Remove modules from the registry |
| `lola-uninstall` | Uninstall a module from an assistant |
| `lola-refresh-markets` | Refresh marketplaces data (for UI polling) |
| `lola-refresh-modules` | Refresh modules data (for UI polling) |
| `lola-refresh-installable-modules` | Get modules available to install (for Install modal) |
| `lola-refresh-installations` | Refresh installations data (for UI polling) |

## Testing with basic-host

```bash
# Terminal 1: Run this server
npm run serve

# Terminal 2: Run basic-host (from cloned ext-apps repo)
cd /tmp/mcp-ext-apps/examples/basic-host
npm install
SERVERS='["http://localhost:3001/mcp"]' npm run start
# Open http://localhost:8080
```
