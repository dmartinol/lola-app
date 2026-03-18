import {
  registerAppResource,
  registerAppTool,
  RESOURCE_MIME_TYPE,
} from "@modelcontextprotocol/ext-apps/server";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { CallToolResult, ReadResourceResult } from "@modelcontextprotocol/sdk/types.js";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { z } from "zod";
import * as lola from "./lola.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIST_DIR = path.join(__dirname, "dist");

const resourceUriMarkets = "ui://lola-manager/markets";
const resourceUriModules = "ui://lola-manager/modules";
const resourceUriInstallations = "ui://lola-manager/installations";

const appOnly = { visibility: ["app"] as const };

/**
 * Creates a new MCP server instance with Lola management tools and UI resources.
 */
export function createServer(): McpServer {
  const server = new McpServer({
    name: "Lola Manager",
    version: "1.0.0",
  });

  // --- List markets (model-invokable, with UI) ---
  registerAppTool(
    server,
    "lola-list-markets",
    {
      title: "List Lola Markets",
      description:
        "List all registered Lola marketplaces with an interactive UI. Use this tool when the user asks to list, show, or view markets — do NOT run 'lola market ls' in the terminal. This tool opens the interactive UI.",
      inputSchema: {},
      _meta: { ui: { resourceUri: resourceUriMarkets } },
    },
    async (): Promise<CallToolResult> => {
      try {
        const marketplaces = await lola.listMarketplaces();
        return {
          content: [{ type: "text", text: `Found ${marketplaces.length} marketplaces.` }],
          structuredContent: { view: "markets", marketplaces },
        };
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        return {
          content: [{ type: "text", text: `Lola: ${msg}. Ensure Lola is installed (uv tool install lola).` }],
          structuredContent: { view: "markets", marketplaces: [], error: msg },
          isError: true,
        };
      }
    }
  );

  // --- Add market (app-only) ---
  registerAppTool(
    server,
    "lola-add-market",
    {
      title: "Add Lola Market",
      description: "Add a new marketplace",
      inputSchema: {
        name: z.string().describe("Marketplace name"),
        url: z.string().describe("Marketplace catalog URL"),
      },
      _meta: { ui: { resourceUri: resourceUriMarkets, ...appOnly } },
    },
    async ({ name, url }): Promise<CallToolResult> => {
      try {
        const result = await lola.addMarketplace(name, url);
        return {
          content: [{ type: "text", text: result.message }],
          structuredContent: result,
        };
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        return {
          content: [{ type: "text", text: msg }],
          structuredContent: { ok: false, message: msg },
          isError: true,
        };
      }
    }
  );

  // --- Inspect market (app-only) ---
  registerAppTool(
    server,
    "lola-inspect-market",
    {
      title: "Inspect Lola Market",
      description: "Get marketplace details: URL, enabled status, module names",
      inputSchema: { marketName: z.string().describe("Marketplace name") },
      _meta: { ui: { resourceUri: resourceUriMarkets, ...appOnly } },
    },
    async ({ marketName }): Promise<CallToolResult> => {
      try {
        const data = await lola.inspectMarketplace(marketName);
        return {
          content: [{ type: "text", text: `Market ${marketName}: ${data.modules.length} modules` }],
          structuredContent: data,
        };
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        return {
          content: [{ type: "text", text: msg }],
          structuredContent: { url: "", enabled: false, modules: [], error: msg },
          isError: true,
        };
      }
    }
  );

  // --- Remove market (app-only) ---
  registerAppTool(
    server,
    "lola-remove-market",
    {
      title: "Remove Lola Market",
      description: "Remove a marketplace",
      inputSchema: { marketName: z.string().describe("Marketplace name") },
      _meta: { ui: { resourceUri: resourceUriMarkets, ...appOnly } },
    },
    async ({ marketName }): Promise<CallToolResult> => {
      try {
        const result = await lola.removeMarketplace(marketName);
        return {
          content: [{ type: "text", text: result.message }],
          structuredContent: result,
        };
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        return {
          content: [{ type: "text", text: msg }],
          structuredContent: { ok: false, message: msg },
          isError: true,
        };
      }
    }
  );

  // --- List modules (model-invokable, with UI) ---
  registerAppTool(
    server,
    "lola-list-modules",
    {
      title: "List Lola Modules",
      description:
        "List modules from the local registry or from a marketplace with an interactive UI. Use this tool when the user asks to list, show, or view modules — do NOT run 'lola mod ls' or 'lola market ls' in the terminal. This tool opens the interactive UI.",
      inputSchema: {
        source: z.enum(["registry", "market"]).optional().describe("registry or market"),
        marketName: z.string().optional().describe("Market name when source is market"),
      },
      _meta: { ui: { resourceUri: resourceUriModules } },
    },
    async ({ source = "registry", marketName }): Promise<CallToolResult> => {
      try {
        const marketplaces = await lola.listMarketplaces();
        if (source === "market" && marketName) {
          const modules = await lola.listModulesFromMarket(marketName);
          return {
            content: [{ type: "text", text: `Found ${modules.length} modules in ${marketName}` }],
            structuredContent: {
              view: "modules",
              source: "market",
              marketName,
              modules,
              marketplaces,
            },
          };
        }
        const modules = await lola.listModules();
        return {
          content: [{ type: "text", text: `Found ${modules.length} modules in registry` }],
          structuredContent: {
            view: "modules",
            source: "registry",
            modules: modules.map((m) => ({ name: m })),
            marketplaces,
          },
        };
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        return {
          content: [{ type: "text", text: `Lola: ${msg}` }],
          structuredContent: {
            view: "modules",
            source: "registry",
            modules: [],
            marketplaces: [],
            error: msg,
          },
          isError: true,
        };
      }
    }
  );

  // --- Inspect module (app-only, registry) ---
  registerAppTool(
    server,
    "lola-inspect-module",
    {
      title: "Inspect Lola Module",
      description: "Get module info (path, skills, commands, agents, MCPs) via lola mod info",
      inputSchema: { moduleName: z.string().describe("Module name") },
      _meta: { ui: { resourceUri: resourceUriModules, ...appOnly } },
    },
    async ({ moduleName }): Promise<CallToolResult> => {
      try {
        const result = await lola.moduleInfo(moduleName);
        return {
          content: [{ type: "text", text: result.info || `Module ${moduleName} info` }],
          structuredContent: { moduleName, info: result.info, ok: result.ok },
        };
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        return {
          content: [{ type: "text", text: msg }],
          structuredContent: { moduleName, info: msg, ok: false },
          isError: true,
        };
      }
    }
  );

  // --- Add module (app-only) ---
  registerAppTool(
    server,
    "lola-add-module",
    {
      title: "Add Lola Module",
      description: "Add a module to the registry from git URL, zip, tar, or local path",
      inputSchema: {
        source: z.string().describe("Git URL, zip/tar URL, or local path"),
        name: z.string().optional().describe("Override module name"),
      },
      _meta: { ui: { resourceUri: resourceUriModules, ...appOnly } },
    },
    async ({ source, name }): Promise<CallToolResult> => {
      try {
        const result = await lola.addModule(source, name);
        return {
          content: [{ type: "text", text: result.message }],
          structuredContent: result,
        };
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        return {
          content: [{ type: "text", text: msg }],
          structuredContent: { ok: false, message: msg },
          isError: true,
        };
      }
    }
  );

  // --- Install module (app-only) ---
  registerAppTool(
    server,
    "lola-install-module",
    {
      title: "Install Lola Module",
      description: "Install a module to an assistant",
      inputSchema: {
        moduleName: z.string().describe("Module name"),
        assistant: z.string().optional().describe("Target assistant (claude-code, cursor, gemini-cli, opencode)"),
      },
      _meta: { ui: { resourceUri: resourceUriModules, ...appOnly } },
    },
    async ({ moduleName, assistant }): Promise<CallToolResult> => {
      try {
        const result = await lola.installModule(moduleName, assistant);
        return {
          content: [{ type: "text", text: result.message }],
          structuredContent: result,
        };
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        return {
          content: [{ type: "text", text: msg }],
          structuredContent: { ok: false, message: msg },
          isError: true,
        };
      }
    }
  );

  // --- Remove modules (app-only) ---
  registerAppTool(
    server,
    "lola-remove-modules",
    {
      title: "Remove Lola Modules",
      description: "Remove modules from the registry",
      inputSchema: {
        moduleNames: z.array(z.string()).describe("Module names to remove"),
      },
      _meta: { ui: { resourceUri: resourceUriModules, ...appOnly } },
    },
    async ({ moduleNames }): Promise<CallToolResult> => {
      try {
        const results: Array<{ name: string; ok: boolean; message?: string }> = [];
        for (const name of moduleNames) {
          const r = await lola.removeModule(name);
          results.push({ name, ok: r.ok, message: r.message });
        }
        const ok = results.every((r) => r.ok);
        const message = ok
          ? `Removed ${results.length} modules`
          : `Some failed: ${results.filter((r) => !r.ok).map((r) => r.name).join(", ")}`;
        return {
          content: [{ type: "text", text: message }],
          structuredContent: { ok, message, results },
        };
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        return {
          content: [{ type: "text", text: msg }],
          structuredContent: { ok: false, message: msg, results: [] },
          isError: true,
        };
      }
    }
  );

  // --- List installations (model-invokable, with UI) ---
  registerAppTool(
    server,
    "lola-list-installations",
    {
      title: "List Lola Installations",
      description:
        "List which modules are installed to which assistants with an interactive UI. Use this tool when the user asks to list, show, or view installations — do NOT run 'lola list' in the terminal. This tool opens the interactive UI.",
      inputSchema: {},
      _meta: { ui: { resourceUri: resourceUriInstallations } },
    },
    async (): Promise<CallToolResult> => {
      try {
        const installations = await lola.listInstallations();
        return {
          content: [{ type: "text", text: `Found ${installations.length} installations` }],
          structuredContent: { view: "installations", installations },
        };
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        return {
          content: [{ type: "text", text: `Lola: ${msg}` }],
          structuredContent: { view: "installations", installations: [], error: msg },
          isError: true,
        };
      }
    }
  );

  // --- Uninstall (app-only) ---
  registerAppTool(
    server,
    "lola-uninstall",
    {
      title: "Uninstall Lola Module",
      description: "Uninstall a module from an assistant",
      inputSchema: {
        moduleName: z.string().describe("Module name"),
        assistant: z.string().optional().describe("Assistant to uninstall from"),
        projectPath: z.string().optional().describe("Project path when scope is project"),
      },
      _meta: { ui: { resourceUri: resourceUriInstallations, ...appOnly } },
    },
    async ({ moduleName, assistant, projectPath }): Promise<CallToolResult> => {
      try {
        const result = await lola.uninstall(moduleName, assistant, projectPath);
        return {
          content: [{ type: "text", text: result.message }],
          structuredContent: result,
        };
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        return {
          content: [{ type: "text", text: msg }],
          structuredContent: { ok: false, message: msg },
          isError: true,
        };
      }
    }
  );

  // --- App-only refresh tools for polling ---
  registerAppTool(
    server,
    "lola-refresh-markets",
    {
      title: "Refresh Markets Data",
      description: "Get current marketplaces (for UI polling)",
      inputSchema: {},
      _meta: { ui: { resourceUri: resourceUriMarkets, ...appOnly } },
    },
    async (): Promise<CallToolResult> => {
      try {
        const marketplaces = await lola.listMarketplaces();
        return {
          content: [{ type: "text", text: "OK" }],
          structuredContent: { view: "markets", marketplaces },
        };
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        return {
          content: [{ type: "text", text: msg }],
          structuredContent: { view: "markets", marketplaces: [], error: msg },
        };
      }
    }
  );

  registerAppTool(
    server,
    "lola-refresh-modules",
    {
      title: "Refresh Modules Data",
      description: "Get current modules (for UI polling)",
      inputSchema: {
        source: z.enum(["registry", "market"]).optional(),
        marketName: z.string().optional(),
      },
      _meta: { ui: { resourceUri: resourceUriModules, ...appOnly } },
    },
    async ({ source = "registry", marketName }): Promise<CallToolResult> => {
      try {
        const marketplaces = await lola.listMarketplaces();
        if (source === "market" && marketName) {
          const modules = await lola.listModulesFromMarket(marketName);
          return {
            content: [{ type: "text", text: "OK" }],
            structuredContent: {
              view: "modules",
              source: "market",
              marketName,
              modules,
              marketplaces,
            },
          };
        }
        const modules = await lola.listModules();
        return {
          content: [{ type: "text", text: "OK" }],
          structuredContent: {
            view: "modules",
            source: "registry",
            modules: modules.map((m) => ({ name: m })),
            marketplaces,
          },
        };
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        return {
          content: [{ type: "text", text: msg }],
          structuredContent: {
            view: "modules",
            source: "registry",
            modules: [],
            marketplaces: [],
            error: msg,
          },
        };
      }
    }
  );

  registerAppTool(
    server,
    "lola-refresh-installable-modules",
    {
      title: "Refresh Installable Modules",
      description: "Get modules available to install (registry + markets, for Install modal)",
      inputSchema: {},
      _meta: { ui: { resourceUri: resourceUriModules, ...appOnly } },
    },
    async (): Promise<CallToolResult> => {
      try {
        const modules = await lola.listInstallableModules();
        return {
          content: [{ type: "text", text: "OK" }],
          structuredContent: { installableModules: modules },
        };
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        return {
          content: [{ type: "text", text: msg }],
          structuredContent: { installableModules: [], error: msg },
        };
      }
    }
  );

  registerAppTool(
    server,
    "lola-refresh-installations",
    {
      title: "Refresh Installations Data",
      description: "Get current installations (for UI polling)",
      inputSchema: {},
      _meta: { ui: { resourceUri: resourceUriInstallations, ...appOnly } },
    },
    async (): Promise<CallToolResult> => {
      try {
        const installations = await lola.listInstallations();
        return {
          content: [{ type: "text", text: "OK" }],
          structuredContent: { view: "installations", installations },
        };
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        return {
          content: [{ type: "text", text: msg }],
          structuredContent: { view: "installations", installations: [], error: msg },
        };
      }
    }
  );

  // --- Register UI resources (all serve same HTML) ---
  const serveHtml = async (uri: string): Promise<ReadResourceResult> => {
    const htmlPath = path.join(DIST_DIR, "mcp-app.html");
    const html = await fs.readFile(htmlPath, "utf-8");
    return {
      contents: [{ uri, mimeType: RESOURCE_MIME_TYPE, text: html }],
    };
  };

  registerAppResource(server, resourceUriMarkets, resourceUriMarkets, { mimeType: RESOURCE_MIME_TYPE }, () =>
    serveHtml(resourceUriMarkets)
  );
  registerAppResource(server, resourceUriModules, resourceUriModules, { mimeType: RESOURCE_MIME_TYPE }, () =>
    serveHtml(resourceUriModules)
  );
  registerAppResource(server, resourceUriInstallations, resourceUriInstallations, { mimeType: RESOURCE_MIME_TYPE }, () =>
    serveHtml(resourceUriInstallations)
  );

  return server;
}
