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
| "Open Lola Manager" | Yes | Model calls `lola-manager`; host renders the interactive UI |
| "Show my Lola modules" | Yes | Model calls `lola-manager` to display modules and installations |
| "Let me manage my Lola skills" | Yes | Model calls `lola-manager` for interactive management |
| "I want to install a new Lola module" | Yes | Model opens the UI so you can search and install |
| "What Lola modules do I have installed?" | Yes | Model calls `lola-manager`; UI shows the full list |
| "Search for Lola modules I can install" | Yes | Model opens the UI; use the Search & Install tab |
| "What is Lola?" | No | Model answers from knowledge; no tool call needed |
| "How do I add a Lola marketplace?" | No | Model explains the `lola market add` CLI; no UI |

**Rule of thumb:** Prompts that ask to *view*, *manage*, *search*, or *install* Lola modules will open the UI. Prompts that ask *what* or *how* (explanatory) typically get a text reply without opening the UI.

## Tools

| Tool | Visibility | Description |
|------|------------|-------------|
| `lola-manager` | Model | Opens the Lola Manager UI |
| `lola-refresh` | App only | Refreshes marketplaces, modules, and installations list |
| `lola-search` | App only | Searches marketplace by query |
| `lola-install` | App only | Installs a module to an assistant |

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
