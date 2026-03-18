/**
 * Helpers to invoke the Lola CLI. Requires `lola` to be installed (e.g. uv tool install).
 */
import { exec } from "node:child_process";
import { promisify } from "node:util";

const execAsync = promisify(exec);

const lolaCwd = process.env.LOLA_CWD || process.cwd();

export async function runLola(args: string[]): Promise<{ stdout: string; stderr: string }> {
  const cmd = `lola ${args.join(" ")}`;
  try {
    return await execAsync(cmd, { encoding: "utf-8", timeout: 30000, cwd: lolaCwd });
  } catch (e: unknown) {
    const err = e as { stdout?: string; stderr?: string; message?: string };
    throw new Error(err.stderr || err.message || String(e));
  }
}

/** Registry + all market modules (deduped). Matches modules shown by `lola install` interactive. */
export async function listInstallableModules(): Promise<Array<{ name: string; description?: string; source: string }>> {
  const seen = new Set<string>();
  const result: Array<{ name: string; description?: string; source: string }> = [];
  const registry = await listModules().catch(() => []);
  for (const n of registry) {
    if (!seen.has(n)) {
      seen.add(n);
      result.push({ name: n, source: "registry" });
    }
  }
  const markets = await listMarketplaces().catch(() => []);
  for (const m of markets) {
    const mods = await listModulesFromMarket(m.name).catch(() => []);
    for (const mod of mods) {
      if (!seen.has(mod.name)) {
        seen.add(mod.name);
        result.push({ name: mod.name, description: mod.description, source: m.name });
      }
    }
  }
  return result.sort((a, b) => a.name.localeCompare(b.name));
}

export async function listModules(): Promise<string[]> {
  const { stdout } = await runLola(["mod", "ls"]);
  const lines = stdout.trim().split("\n");
  const modules: string[] = [];
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("Modules (") || /^\d+\s+skill(s)?,\s*\d+\s+command/.test(trimmed)) continue;
    if (!trimmed.startsWith(" ")) modules.push(trimmed);
  }
  return modules;
}

export async function listInstallations(): Promise<Array<{ module: string; assistant: string; scope: string; project?: string }>> {
  const { stdout } = await runLola(["list"]).catch(() => ({ stdout: "" }));
  const lines = stdout.trim().split("\n");
  const result: Array<{ module: string; assistant: string; scope: string; project?: string }> = [];
  let currentModule = "";
  let currentScope = "user";
  let currentPath: string | undefined;
  let currentAssistants: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("Installed (")) continue;

    // Module name (no leading dash/space, and not a key: value line)
    if (!trimmed.startsWith("-") && !trimmed.startsWith(" ") && !trimmed.includes(":")) {
      currentModule = trimmed;
      currentScope = "user";
      currentPath = undefined;
      currentAssistants = [];
      continue;
    }

    const scopeMatch = trimmed.match(/scope:\s*(.+)/);
    const pathMatch = trimmed.match(/path:\s*(.+)/);
    const assistantsMatch = trimmed.match(/assistants:\s*\[([^\]]*)\]/);
    if (scopeMatch) {
      currentScope = scopeMatch[1].trim();
    } else if (pathMatch) {
      currentPath = pathMatch[1].replace(/^["']|["']$/g, "").trim();
    } else if (assistantsMatch) {
      currentAssistants = assistantsMatch[1].split(",").map((a) => a.trim()).filter(Boolean);
      for (const a of currentAssistants) {
        result.push({ module: currentModule, assistant: a, scope: currentScope, project: currentPath });
      }
      currentAssistants = [];
    }
  }

  return result;
}

export async function searchMarketplace(query: string): Promise<Array<{ name: string; description?: string; version?: string; repository?: string }>> {
  const { stdout } = await runLola(["mod", "search", query]).catch(() => ({ stdout: "" }));
  const lines = stdout.trim().split("\n").filter(Boolean);
  const result: Array<{ name: string; description?: string; version?: string; repository?: string }> = [];
  for (const line of lines) {
    const m = line.match(/^[\s*-]*(\S+)\s+(.+)$/);
    if (m) {
      result.push({
        name: m[1] ?? "",
        description: m[2]?.trim(),
      });
    }
  }
  return result;
}

export async function installModule(moduleName: string, assistant?: string): Promise<{ ok: boolean; message: string }> {
  const args = ["install", moduleName];
  if (assistant) args.push("-a", assistant);
  try {
    const { stdout } = await runLola(args);
    return { ok: true, message: stdout || `Installed ${moduleName}` };
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : String(e) };
  }
}

export async function listMarketplaces(): Promise<Array<{ name: string; modules: number; status: string }>> {
  const { stdout } = await runLola(["market", "ls"]).catch(() => ({ stdout: "" }));
  const lines = stdout.trim().split("\n");
  const result: Array<{ name: string; modules: number; status: string }> = [];
  for (const line of lines) {
    // Data rows: │ name │ modules │ status │
    if (line.startsWith("│") && line.includes("│")) {
      const cells = line.split("│").map((c) => c.trim()).filter(Boolean);
      if (cells.length >= 3) {
        const modules = parseInt(cells[1] ?? "0", 10) || 0;
        result.push({
          name: cells[0] ?? "",
          modules,
          status: cells[2] ?? "enabled",
        });
      }
    }
  }
  return result;
}

export async function addMarketplace(name: string, url: string): Promise<{ ok: boolean; message: string }> {
  try {
    const { stdout } = await runLola(["market", "add", name, url]);
    return { ok: true, message: stdout || `Market ${name} added` };
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : String(e) };
  }
}

export async function inspectMarketplace(
  marketName: string
): Promise<{ url: string; enabled: boolean; modules: Array<{ name: string; description?: string; version?: string }> }> {
  const lolaDir = process.env.HOME ? `${process.env.HOME}/.lola` : "/tmp/.lola";
  const marketDir = `${lolaDir}/market`;
  let url = "";
  let enabled = true;

  try {
    const { readdir, readFile } = await import("node:fs/promises");
    const files = await readdir(marketDir).catch(() => []);
    for (const f of files) {
      if (!f.endsWith(".yml")) continue;
      const fileBase = f.replace(/\.yml$/, "");
      const content = await readFile(`${marketDir}/${f}`, "utf-8").catch(() => "");
      const nameMatch = content.match(/^name:\s*(.+)$/m);
      const contentName = nameMatch?.[1]?.trim();
      if (contentName === marketName || fileBase === marketName) {
        const urlMatch = content.match(/^url:\s*(.+)$/m);
        const enabledMatch = content.match(/^enabled:\s*(.+)$/m);
        const enabledStr = enabledMatch?.[1]?.trim().toLowerCase();
        url = urlMatch?.[1]?.trim() ?? "";
        enabled = enabledStr !== "false";
        break;
      }
    }
  } catch {
    // Fallback: url and enabled may stay default
  }

  const modules = await listModulesFromMarket(marketName).catch(() => []);
  return { url, enabled, modules };
}

export async function removeMarketplace(marketName: string): Promise<{ ok: boolean; message: string }> {
  try {
    const { stdout } = await runLola(["market", "rm", marketName]);
    return { ok: true, message: stdout || `Market ${marketName} removed` };
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : String(e) };
  }
}

export async function listModulesFromMarket(
  marketName: string
): Promise<Array<{ name: string; description?: string; version?: string }>> {
  const { stdout } = await runLola(["market", "ls", marketName]).catch(() => ({ stdout: "" }));
  const lines = stdout.trim().split("\n");
  const result: Array<{ name: string; description?: string; version?: string }> = [];
  let current: { name: string; version?: string; description: string } | null = null;

  for (const line of lines) {
    if (!line.startsWith("│") || !line.includes("│")) continue;
    const cells = line.split("│").map((c) => c.trim());
    const moduleName = cells[1] ?? "";
    const version = cells[2] ?? "";
    const description = cells[3] ?? "";

    if (moduleName === "Module" || moduleName === "━━") continue;

    if (moduleName.length > 0) {
      if (current) {
        result.push({
          name: current.name,
          version: current.version || undefined,
          description: current.description.trim() || undefined,
        });
      }
      current = {
        name: moduleName,
        version: version || undefined,
        description: description,
      };
    } else if (current && description.length > 0) {
      current.description += " " + description;
    }
  }
  if (current) {
    result.push({
      name: current.name,
      version: current.version || undefined,
      description: current.description.trim() || undefined,
    });
  }
  return result;
}

export async function addModule(source: string, nameOverride?: string): Promise<{ ok: boolean; message: string }> {
  try {
    const args = ["mod", "add", source];
    if (nameOverride) args.push("-n", nameOverride);
    const { stdout } = await runLola(args);
    return { ok: true, message: stdout || `Module added` };
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : String(e) };
  }
}

export async function moduleInfo(moduleName: string): Promise<{ ok: boolean; info: string }> {
  try {
    const { stdout } = await runLola(["mod", "info", moduleName]);
    return { ok: true, info: stdout || "" };
  } catch (e) {
    return { ok: false, info: e instanceof Error ? e.message : String(e) };
  }
}

export async function removeModule(moduleName: string): Promise<{ ok: boolean; message: string }> {
  try {
    const { stdout } = await runLola(["mod", "rm", "-f", moduleName]);
    return { ok: true, message: stdout || `Module ${moduleName} removed` };
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : String(e) };
  }
}

export async function uninstall(
  moduleName: string,
  assistant?: string,
  projectPath?: string
): Promise<{ ok: boolean; message: string }> {
  try {
    const args = ["uninstall", moduleName];
    if (assistant) args.push("-a", assistant);
    if (projectPath) args.push(projectPath);
    const { stdout } = await runLola(args);
    return { ok: true, message: stdout || `Uninstalled ${moduleName}` };
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : String(e) };
  }
}
