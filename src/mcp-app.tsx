/**
 * Lola Manager MCP App - React UI with PatternFly
 * Three views: markets, modules, installations (routed by tool result)
 */
import "@patternfly/react-core/dist/styles/base.css";
import "./global.css";
import type { App } from "@modelcontextprotocol/ext-apps";
import { useApp } from "@modelcontextprotocol/ext-apps/react";
import {
  Page,
  PageSection,
  Card,
  CardBody,
  CardTitle,
  Button,
  TextInput,
  FormGroup,
  Form,
  Alert,
  Spinner,
  EmptyState,
  EmptyStateBody,
  Bullseye,
  Modal,
  ModalBody,
  ModalFooter,
  ModalVariant,
  FormSelect,
  FormSelectOption,
  Badge,
  Label,
} from "@patternfly/react-core";
import {
  CubeIcon,
  DownloadIcon,
  CatalogIcon,
  PlusIcon,
  InfoCircleIcon,
  TrashIcon,
} from "@patternfly/react-icons";
import { StrictMode, useCallback, useEffect, useState } from "react";
import { createRoot } from "react-dom/client";

type ViewType = "markets" | "modules" | "installations";

interface Marketplace {
  name: string;
  modules: number;
  status: string;
}

interface ModuleItem {
  name: string;
  description?: string;
  version?: string;
}

interface Installation {
  module: string;
  assistant: string;
  scope: string;
  project?: string;
}

interface MarketsData {
  view: "markets";
  marketplaces: Marketplace[];
  error?: string;
}

interface ModulesData {
  view: "modules";
  source: "registry" | "market";
  marketName?: string;
  modules: ModuleItem[];
  marketplaces: Marketplace[];
  error?: string;
}

interface InstallationsData {
  view: "installations";
  installations: Installation[];
  error?: string;
}

type ToolResult = MarketsData | ModulesData | InstallationsData;

const ASSISTANTS = ["claude-code", "cursor", "gemini-cli", "opencode"];

function LolaManagerApp() {
  const [view, setView] = useState<ViewType>("markets");
  const [marketplaces, setMarketplaces] = useState<Marketplace[]>([]);
  const [modules, setModules] = useState<ModuleItem[]>([]);
  const [modulesSource, setModulesSource] = useState<"registry" | "market">("registry");
  const [modulesMarketName, setModulesMarketName] = useState<string>("");
  const [installations, setInstallations] = useState<Installation[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Modals
  const [addMarketOpen, setAddMarketOpen] = useState(false);
  const [addMarketName, setAddMarketName] = useState("");
  const [addMarketUrl, setAddMarketUrl] = useState("");
  const [addMarketStatus, setAddMarketStatus] = useState<string | null>(null);

  const [inspectMarketOpen, setInspectMarketOpen] = useState(false);
  const [inspectMarketName, setInspectMarketName] = useState("");
  const [inspectData, setInspectData] = useState<{
    url: string;
    enabled: boolean;
    modules: Array<{ name: string; description?: string; version?: string }>;
  } | null>(null);

  const [addModuleOpen, setAddModuleOpen] = useState(false);
  const [addModuleSource, setAddModuleSource] = useState("");
  const [addModuleStatus, setAddModuleStatus] = useState<string | null>(null);

  const [installModalOpen, setInstallModalOpen] = useState(false);
  const [installModuleName, setInstallModuleName] = useState("");
  const [installableModules, setInstallableModules] = useState<ModuleItem[]>([]);
  const [installModuleLoading, setInstallModuleLoading] = useState(false);
  const [installAssistant, setInstallAssistant] = useState("cursor");
  const [installStatus, setInstallStatus] = useState<string | null>(null);

  const [removeMarketConfirm, setRemoveMarketConfirm] = useState<string | null>(null);
  const [removeModuleConfirm, setRemoveModuleConfirm] = useState<string | null>(null);
  const [removeModuleLoading, setRemoveModuleLoading] = useState(false);
  const [uninstallConfirm, setUninstallConfirm] = useState<Installation | null>(null);

  const [inspectModuleOpen, setInspectModuleOpen] = useState(false);
  const [inspectModuleName, setInspectModuleName] = useState("");
  const [inspectModuleInfo, setInspectModuleInfo] = useState<string | null>(null);

  const { app, error: appError } = useApp({
    appInfo: { name: "Lola Manager", version: "1.0.0" },
    capabilities: {},
    onAppCreated: (a: App) => {
      a.ontoolresult = (result) => {
        const sc = result.structuredContent as unknown as ToolResult | undefined;
        if (!sc) return;
        if (sc.view === "markets") {
          setView("markets");
          setMarketplaces(sc.marketplaces ?? []);
          setError(sc.error ?? null);
        } else if (sc.view === "modules") {
          setView("modules");
          setModules(sc.modules ?? []);
          setModulesSource(sc.source ?? "registry");
          setModulesMarketName(sc.marketName ?? "");
          setMarketplaces(sc.marketplaces ?? []);
          setError(sc.error ?? null);
        } else if (sc.view === "installations") {
          setView("installations");
          setInstallations(sc.installations ?? []);
          setError(sc.error ?? null);
        }
      };
      a.onteardown = async () => ({});
      a.onerror = console.error;
    },
  });

  const refreshMarkets = useCallback(async () => {
    if (!app) return;
    setLoading(true);
    try {
      const result = await app.callServerTool({ name: "lola-refresh-markets", arguments: {} });
      const sc = result.structuredContent as unknown as MarketsData;
      setMarketplaces(sc?.marketplaces ?? []);
      setError(sc?.error ?? null);
    } catch (e) {
      setMarketplaces([]);
      setError(String(e));
    } finally {
      setLoading(false);
    }
  }, [app]);

  const refreshModules = useCallback(async () => {
    if (!app) return;
    setLoading(true);
    try {
      const result = await app.callServerTool({
        name: "lola-refresh-modules",
        arguments: { source: modulesSource, marketName: modulesMarketName || undefined },
      });
      const sc = result.structuredContent as unknown as ModulesData;
      setModules(sc?.modules ?? []);
      setModulesSource(sc?.source ?? "registry");
      setModulesMarketName(sc?.marketName ?? "");
      setMarketplaces(sc?.marketplaces ?? []);
      setError(sc?.error ?? null);
    } catch (e) {
      setModules([]);
      setError(String(e));
    } finally {
      setLoading(false);
    }
  }, [app, modulesSource, modulesMarketName]);

  const refreshInstallations = useCallback(async () => {
    if (!app) return;
    setLoading(true);
    try {
      const result = await app.callServerTool({ name: "lola-refresh-installations", arguments: {} });
      const sc = result.structuredContent as unknown as InstallationsData;
      setInstallations(sc?.installations ?? []);
      setError(sc?.error ?? null);
    } catch (e) {
      setInstallations([]);
      setError(String(e));
    } finally {
      setLoading(false);
    }
  }, [app]);

  useEffect(() => {
    if (app) {
      // Initial data comes from ontoolresult when tool completes
      setLoading(false);
    }
  }, [app]);

  const handleAddMarket = useCallback(async () => {
    if (!app || !addMarketName.trim() || !addMarketUrl.trim()) return;
    setAddMarketStatus("Adding...");
    try {
      const result = await app.callServerTool({
        name: "lola-add-market",
        arguments: { name: addMarketName.trim(), url: addMarketUrl.trim() },
      });
      const sc = result.structuredContent as { ok?: boolean; message?: string };
      setAddMarketStatus(sc?.message ?? (result.isError ? "Failed" : "Done"));
      if (sc?.ok) {
        setAddMarketName("");
        setAddMarketUrl("");
        setTimeout(() => {
          setAddMarketOpen(false);
          setAddMarketStatus(null);
          refreshMarkets();
        }, 500);
      }
    } catch (e) {
      setAddMarketStatus(String(e));
    }
  }, [app, addMarketName, addMarketUrl, refreshMarkets]);

  const handleInspectMarket = useCallback(
    async (name: string) => {
      if (!app) return;
      setInspectMarketName(name);
      setInspectMarketOpen(true);
      setInspectData(null);
      try {
        const result = await app.callServerTool({
          name: "lola-inspect-market",
          arguments: { marketName: name },
        });
        const sc = result.structuredContent as {
          url?: string;
          enabled?: boolean;
          modules?: Array<{ name: string; description?: string; version?: string }>;
        };
        setInspectData({
          url: sc?.url ?? "",
          enabled: sc?.enabled ?? true,
          modules: sc?.modules ?? [],
        });
      } catch (e) {
        setInspectData({ url: "", enabled: false, modules: [] });
      }
    },
    [app]
  );

  const handleRemoveMarket = useCallback(
    async (name: string) => {
      if (!app) return;
      try {
        await app.callServerTool({ name: "lola-remove-market", arguments: { marketName: name } });
        setRemoveMarketConfirm(null);
        refreshMarkets();
      } catch (e) {
        setError(String(e));
      }
    },
    [app, refreshMarkets]
  );

  const handleAddModule = useCallback(async () => {
    if (!app || !addModuleSource.trim()) return;
    setAddModuleStatus("Adding...");
    try {
      const result = await app.callServerTool({
        name: "lola-add-module",
        arguments: { source: addModuleSource.trim() },
      });
      const sc = result.structuredContent as { ok?: boolean; message?: string };
      setAddModuleStatus(sc?.message ?? (result.isError ? "Failed" : "Done"));
      if (sc?.ok) {
        setAddModuleSource("");
        setTimeout(() => {
          setAddModuleOpen(false);
          setAddModuleStatus(null);
          refreshModules();
        }, 500);
      }
    } catch (e) {
      setAddModuleStatus(String(e));
    }
  }, [app, addModuleSource, refreshModules]);

  const fetchInstallableModules = useCallback(
    async (ensureModule?: string) => {
      if (!app) return;
      setInstallModuleLoading(true);
      try {
        const result = await app.callServerTool({ name: "lola-refresh-installable-modules", arguments: {} });
        const sc = result.structuredContent as { installableModules?: Array<{ name: string; description?: string; source?: string }> };
        let mods = sc?.installableModules ?? [];
        if (ensureModule && !mods.some((m) => m.name === ensureModule)) {
          mods = [{ name: ensureModule }, ...mods];
        }
        setInstallableModules(mods);
      } catch {
        setInstallableModules([]);
      } finally {
        setInstallModuleLoading(false);
      }
    },
    [app]
  );

  const handleInstall = useCallback(
    async (moduleName: string, assistant?: string) => {
      if (!app) return;
      setInstallModuleName(moduleName);
      setInstallAssistant(assistant ?? "cursor");
      setInstallModalOpen(true);
      setInstallStatus(null);
      setInstallableModules((prev) => (prev.some((m) => m.name === moduleName) ? prev : [{ name: moduleName }, ...prev]));
      fetchInstallableModules(moduleName);
    },
    [app, fetchInstallableModules]
  );

  const handleOpenInstallModal = useCallback(() => {
    setInstallModuleName("");
    setInstallModalOpen(true);
    setInstallStatus(null);
    fetchInstallableModules();
  }, [fetchInstallableModules]);

  const handleInstallSubmit = useCallback(async () => {
    if (!app || !installModuleName.trim()) return;
    setInstallStatus("Installing...");
    try {
      const result = await app.callServerTool({
        name: "lola-install-module",
        arguments: { moduleName: installModuleName.trim(), assistant: installAssistant || undefined },
      });
      const sc = result.structuredContent as { ok?: boolean; message?: string };
      setInstallStatus(sc?.message ?? (result.isError ? "Failed" : "Done"));
      if (sc?.ok) {
        setTimeout(() => {
          setInstallModalOpen(false);
          setInstallStatus(null);
          refreshModules();
          refreshInstallations();
        }, 500);
      }
    } catch (e) {
      setInstallStatus(String(e));
    }
  }, [app, installModuleName, installAssistant, refreshModules, refreshInstallations]);

  const handleInspectModule = useCallback(
    async (name: string) => {
      if (!app) return;
      setInspectModuleName(name);
      setInspectModuleOpen(true);
      setInspectModuleInfo(null);
      try {
        const result = await app.callServerTool({
          name: "lola-inspect-module",
          arguments: { moduleName: name },
        });
        const sc = result.structuredContent as { info?: string; ok?: boolean };
        setInspectModuleInfo(sc?.info ?? (result.isError ? "Failed to load info" : ""));
      } catch (e) {
        setInspectModuleInfo(String(e));
      }
    },
    [app]
  );

  const handleRemoveModule = useCallback(
    async (name: string) => {
      if (!app) return;
      setRemoveModuleLoading(true);
      try {
        await app.callServerTool({ name: "lola-remove-modules", arguments: { moduleNames: [name] } });
        setRemoveModuleConfirm(null);
        refreshModules();
      } catch (e) {
        setError(String(e));
        setRemoveModuleConfirm(null);
      } finally {
        setRemoveModuleLoading(false);
      }
    },
    [app, refreshModules]
  );

  const handleUninstall = useCallback(
    async (inst: Installation) => {
      if (!app) return;
      try {
        await app.callServerTool({
          name: "lola-uninstall",
          arguments: {
            moduleName: inst.module,
            assistant: inst.assistant,
            projectPath: inst.project,
          },
        });
        setUninstallConfirm(null);
        refreshInstallations();
      } catch (e) {
        setError(String(e));
      }
    },
    [app, refreshInstallations]
  );

  const handleModulesSourceChange = useCallback(
    async (source: "registry" | "market", marketName?: string) => {
      setModulesSource(source);
      setModulesMarketName(marketName ?? "");
      if (!app) return;
      setLoading(true);
      try {
        const result = await app.callServerTool({
          name: "lola-refresh-modules",
          arguments: { source, marketName: marketName || undefined },
        });
        const sc = result.structuredContent as unknown as ModulesData;
        setModules(sc?.modules ?? []);
        setMarketplaces(sc?.marketplaces ?? []);
        setError(sc?.error ?? null);
      } catch (e) {
        setModules([]);
        setError(String(e));
      } finally {
        setLoading(false);
      }
    },
    [app]
  );

  if (appError) {
    return (
      <Page>
        <PageSection isFilled={false}>
          <Alert variant="danger" title="Connection error">
            {appError.message}
          </Alert>
        </PageSection>
      </Page>
    );
  }

  if (!app) {
    return (
      <Bullseye>
        <Spinner size="xl" />
      </Bullseye>
    );
  }

  return (
    <Page>
      <PageSection isFilled={false}>
        {view === "markets" && (
          <Card isCompact>
            <CardTitle>
              <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                <Button variant="link" isInline onClick={refreshMarkets} isDisabled={loading}>
                  {loading ? "Refreshing..." : "Refresh"}
                </Button>
                <Button variant="primary" onClick={() => setAddMarketOpen(true)} icon={<PlusIcon />}>
                  Add market
                </Button>
              </div>
            </CardTitle>
            <CardBody>
              {error && (
                <Alert variant="warning" title="Note" className="pf-v6-u-mb-md">
                  {error}
                </Alert>
              )}
              {loading ? (
                <Bullseye>
                  <Spinner size="lg" />
                </Bullseye>
              ) : !marketplaces.length ? (
                <EmptyState icon={CatalogIcon} titleText="No marketplaces">
                  <EmptyStateBody>No marketplaces registered. Add one with the button above.</EmptyStateBody>
                </EmptyState>
              ) : (
                <div className="markets-list">
                  {marketplaces.map((m) => (
                    <div key={m.name} className="markets-list__row">
                      <span className="markets-list__name">{m.name}</span>
                      <div className="markets-list__meta">
                        <Badge isRead>{m.modules}</Badge>
                        <Label
                          {...(m.status.toLowerCase() === "enabled"
                            ? { status: "success" as const }
                            : { color: "grey" as const })}
                          isCompact
                        >
                          {m.status}
                        </Label>
                        <Button
                          variant="plain"
                          size="sm"
                          onClick={() => handleInspectMarket(m.name)}
                          icon={<InfoCircleIcon />}
                          aria-label={`Inspect ${m.name}`}
                        />
                        <Button
                          variant="plain"
                          size="sm"
                          onClick={() => setRemoveMarketConfirm(m.name)}
                          icon={<TrashIcon />}
                          aria-label={`Remove ${m.name}`}
                          className="markets-list__remove"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardBody>
          </Card>
        )}

        {view === "modules" && (
          <Card isCompact>
            <CardTitle>
              <div style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
                <Button variant="link" isInline onClick={refreshModules} isDisabled={loading}>
                  {loading ? "Refreshing..." : "Refresh"}
                </Button>
                <div style={{ display: "flex", gap: "4px" }}>
                  <Button
                    variant={modulesSource === "registry" ? "primary" : "secondary"}
                    size="sm"
                    onClick={() => handleModulesSourceChange("registry")}
                  >
                    Registry
                  </Button>
                  <Button
                    variant={modulesSource === "market" ? "primary" : "secondary"}
                    size="sm"
                    onClick={() => handleModulesSourceChange("market", marketplaces[0]?.name)}
                  >
                    Market
                  </Button>
                </div>
                {modulesSource === "market" && marketplaces.length > 0 && (
                  <FormSelect
                    value={modulesMarketName || marketplaces[0]?.name}
                    onChange={(_, v) => handleModulesSourceChange("market", v)}
                    aria-label="Select market"
                    style={{ width: "160px" }}
                  >
                    {marketplaces.map((m) => (
                      <FormSelectOption key={m.name} value={m.name} label={m.name} />
                    ))}
                  </FormSelect>
                )}
                <Button variant="primary" onClick={() => setAddModuleOpen(true)} icon={<PlusIcon />}>
                  Add module from URL
                </Button>
              </div>
            </CardTitle>
            <CardBody>
              {error && (
                <Alert variant="warning" title="Note" className="pf-v6-u-mb-md">
                  {error}
                </Alert>
              )}
              {loading ? (
                <Bullseye>
                  <Spinner size="lg" />
                </Bullseye>
              ) : !modules.length ? (
                <EmptyState icon={CubeIcon} titleText="No modules">
                  <EmptyStateBody>
                    {modulesSource === "registry"
                      ? "No modules in registry. Add from URL or install from a market."
                      : "No modules in this market."}
                  </EmptyStateBody>
                </EmptyState>
              ) : (
                <div className="modules-list">
                  {modules.map((m) => (
                    <div key={m.name} className="modules-list__row">
                      <span className="modules-list__name">{m.name}</span>
                      <div className="modules-list__meta">
                        {modulesSource === "market" && m.version && (
                          <Badge isRead>{m.version}</Badge>
                        )}
                        {modulesSource === "registry" && (
                          <>
                            <Button
                              variant="plain"
                              size="sm"
                              onClick={() => handleInspectModule(m.name)}
                              icon={<InfoCircleIcon />}
                              aria-label={`Inspect ${m.name}`}
                            />
                            <Button
                              variant="plain"
                              size="sm"
                              onClick={() => setRemoveModuleConfirm(m.name)}
                              icon={<TrashIcon />}
                              aria-label={`Remove ${m.name}`}
                              className="modules-list__remove"
                            />
                          </>
                        )}
                        <Button
                          variant="plain"
                          size="sm"
                          onClick={() => handleInstall(m.name)}
                          icon={<DownloadIcon />}
                          aria-label={`Install ${m.name}`}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardBody>
          </Card>
        )}

        {view === "installations" && (
          <Card isCompact>
            <CardTitle>
              <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                <Button variant="link" isInline onClick={refreshInstallations} isDisabled={loading}>
                  {loading ? "Refreshing..." : "Refresh"}
                </Button>
                <Button variant="primary" onClick={handleOpenInstallModal} icon={<PlusIcon />}>
                  Install
                </Button>
              </div>
            </CardTitle>
            <CardBody>
              {error && (
                <Alert variant="warning" title="Note" className="pf-v6-u-mb-md">
                  {error}
                </Alert>
              )}
              {loading ? (
                <Bullseye>
                  <Spinner size="lg" />
                </Bullseye>
              ) : !installations.length ? (
                <EmptyState icon={DownloadIcon} titleText="No installations">
                  <EmptyStateBody>No modules installed. Install modules from the modules view.</EmptyStateBody>
                </EmptyState>
              ) : (
                <div className="installations-list">
                  {(() => {
                    const byModule = installations.reduce<Record<string, Installation[]>>((acc, i) => {
                      if (!acc[i.module]) acc[i.module] = [];
                      acc[i.module].push(i);
                      return acc;
                    }, {});
                    return Object.entries(byModule).map(([moduleName, insts]) => (
                      <div key={moduleName} className="installations-list__group">
                        <div className="installations-list__module">{moduleName}</div>
                        {insts.map((i, idx) => (
                          <div key={`${i.assistant}-${i.project ?? "user"}-${idx}`} className="installations-list__row">
                            <span className="installations-list__target">{i.assistant}</span>
                            <div className="installations-list__meta">
                              <Badge isRead>{i.scope}</Badge>
                              {i.scope === "project" && i.project && (
                                <Badge isRead title={i.project}>
                                  {i.project.length > 24 ? `…${i.project.slice(-21)}` : i.project}
                                </Badge>
                              )}
                              <Button
                                variant="plain"
                                size="sm"
                                onClick={() => setUninstallConfirm(i)}
                                icon={<TrashIcon />}
                                aria-label={`Uninstall ${i.module} from ${i.assistant}`}
                                className="installations-list__uninstall"
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    ));
                  })()}
                </div>
              )}
            </CardBody>
          </Card>
        )}
      </PageSection>

      {/* Add market modal */}
      <Modal
        isOpen={addMarketOpen}
        onClose={() => {
          setAddMarketOpen(false);
          setAddMarketStatus(null);
        }}
        title="Add market"
      >
        <ModalBody>
          <Form>
            <FormGroup label="Name" fieldId="add-market-name" isRequired>
              <TextInput
                id="add-market-name"
                value={addMarketName}
                onChange={(_, v) => setAddMarketName(v)}
                placeholder="e.g. my-market"
              />
            </FormGroup>
            <FormGroup label="URL" fieldId="add-market-url" isRequired>
              <TextInput
                id="add-market-url"
                value={addMarketUrl}
                onChange={(_, v) => setAddMarketUrl(v)}
                placeholder="https://example.com/lola-catalog.yml"
              />
            </FormGroup>
          </Form>
          {addMarketStatus && (
            <Alert variant={addMarketStatus.includes("rror") ? "danger" : "success"} title={addMarketStatus.includes("rror") ? "Error" : "Success"} className="pf-v6-u-mt-md">
              {addMarketStatus}
            </Alert>
          )}
        </ModalBody>
        <ModalFooter>
          <Button variant="primary" onClick={handleAddMarket} isDisabled={!addMarketName.trim() || !addMarketUrl.trim()}>
            Add
          </Button>
          <Button variant="link" onClick={() => setAddMarketOpen(false)}>
            Cancel
          </Button>
        </ModalFooter>
      </Modal>

      {/* Inspect market modal */}
      <Modal
        variant={ModalVariant.large}
        isOpen={inspectMarketOpen}
        onClose={() => setInspectMarketOpen(false)}
        title={`Inspect: ${inspectMarketName}`}
      >
        <ModalBody>
          {inspectData ? (
            <div>
              <div className="inspect-market-banner">{inspectMarketName}</div>
              <p>
                <strong>URL:</strong> {inspectData.url || "—"}
              </p>
              <p>
                <strong>Enabled:</strong> {inspectData.enabled ? "Yes" : "No"}
              </p>
              <p>
                <strong>Modules ({inspectData.modules.length}):</strong>
              </p>
              <div className="inspect-modules">
                <div className="inspect-modules__header">
                  <span>Module</span>
                  <span>Description</span>
                </div>
                {inspectData.modules.map((m) => (
                  <div key={m.name} className="inspect-modules__row">
                    <span className="inspect-modules__name">{m.name}</span>
                    <span className="inspect-modules__desc">{m.description ?? "—"}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <Spinner size="md" />
          )}
        </ModalBody>
        <ModalFooter>
          <Button variant="link" onClick={() => setInspectMarketOpen(false)}>
            Close
          </Button>
        </ModalFooter>
      </Modal>

      {/* Add module modal */}
      <Modal
        isOpen={addModuleOpen}
        onClose={() => {
          setAddModuleOpen(false);
          setAddModuleStatus(null);
        }}
        title="Add module from URL"
      >
        <ModalBody>
          <Form>
            <FormGroup label="Source (git URL, zip, tar, or local path)" fieldId="add-module-source" isRequired>
              <TextInput
                id="add-module-source"
                value={addModuleSource}
                onChange={(_, v) => setAddModuleSource(v)}
                placeholder="https://github.com/user/repo.git or /path/to/module"
              />
            </FormGroup>
          </Form>
          {addModuleStatus && (
            <Alert variant={addModuleStatus.includes("rror") ? "danger" : "success"} title={addModuleStatus.includes("rror") ? "Error" : "Success"} className="pf-v6-u-mt-md">
              {addModuleStatus}
            </Alert>
          )}
        </ModalBody>
        <ModalFooter>
          <Button variant="primary" onClick={handleAddModule} isDisabled={!addModuleSource.trim()}>
            Add
          </Button>
          <Button variant="link" onClick={() => setAddModuleOpen(false)}>
            Cancel
          </Button>
        </ModalFooter>
      </Modal>

      {/* Install modal */}
      <Modal
        isOpen={installModalOpen}
        onClose={() => {
          setInstallModalOpen(false);
          setInstallModuleName("");
          setInstallStatus(null);
        }}
        title={installModuleName ? `Install: ${installModuleName}` : "Install module"}
      >
        <ModalBody>
          <Form>
            <FormGroup label="Module" fieldId="install-module" isRequired>
              <FormSelect
                value={installModuleName}
                onChange={(_, v) => setInstallModuleName(v)}
                aria-label="Select module"
                isDisabled={installModuleLoading}
              >
                <FormSelectOption value="" label={installModuleLoading ? "Loading..." : "Select a module"} isPlaceholder />
                {installableModules.map((m) => (
                  <FormSelectOption key={m.name} value={m.name} label={m.description ? `${m.name} — ${m.description}` : m.name} />
                ))}
              </FormSelect>
            </FormGroup>
            <FormGroup label="Assistant" fieldId="install-assistant">
              <FormSelect value={installAssistant} onChange={(_, v) => setInstallAssistant(v)} aria-label="Select assistant">
                {ASSISTANTS.map((a) => (
                  <FormSelectOption key={a} value={a} label={a} />
                ))}
              </FormSelect>
            </FormGroup>
          </Form>
          {installStatus && (
            <Alert variant={installStatus.includes("rror") ? "danger" : "success"} title={installStatus.includes("rror") ? "Error" : "Success"} className="pf-v6-u-mt-md">
              {installStatus}
            </Alert>
          )}
        </ModalBody>
        <ModalFooter>
          <Button variant="primary" onClick={handleInstallSubmit} isDisabled={!installModuleName.trim()}>
            Install
          </Button>
          <Button variant="link" onClick={() => setInstallModalOpen(false)}>
            Cancel
          </Button>
        </ModalFooter>
      </Modal>

      {/* Remove market confirmation */}
      <Modal
        isOpen={!!removeMarketConfirm}
        onClose={() => setRemoveMarketConfirm(null)}
        title="Remove market"
      >
        <ModalBody>Remove market &quot;{removeMarketConfirm}&quot;? This cannot be undone.</ModalBody>
        <ModalFooter>
          <Button variant="danger" onClick={() => removeMarketConfirm && handleRemoveMarket(removeMarketConfirm)}>
            Remove
          </Button>
          <Button variant="link" onClick={() => setRemoveMarketConfirm(null)}>
            Cancel
          </Button>
        </ModalFooter>
      </Modal>

      {/* Inspect module modal */}
      <Modal
        variant={ModalVariant.large}
        isOpen={inspectModuleOpen}
        onClose={() => setInspectModuleOpen(false)}
        title={`Inspect: ${inspectModuleName}`}
      >
        <ModalBody>
          <div className="inspect-market-banner">{inspectModuleName}</div>
          {inspectModuleInfo !== null ? (
            <pre
              className="inspect-module-info"
              style={{
                margin: 0,
                padding: "12px",
                fontSize: "0.8125rem",
                overflow: "auto",
                maxHeight: "320px",
                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
              }}
            >
              {inspectModuleInfo}
            </pre>
          ) : (
            <Bullseye>
              <Spinner size="md" />
            </Bullseye>
          )}
        </ModalBody>
        <ModalFooter>
          <Button variant="link" onClick={() => setInspectModuleOpen(false)}>
            Close
          </Button>
        </ModalFooter>
      </Modal>

      {/* Remove module confirmation */}
      <Modal
        isOpen={!!removeModuleConfirm}
        onClose={() => setRemoveModuleConfirm(null)}
        title="Remove module"
      >
        <ModalBody>Remove module &quot;{removeModuleConfirm}&quot; from registry? This cannot be undone.</ModalBody>
        <ModalFooter>
          <Button
            variant="danger"
            onClick={() => removeModuleConfirm && handleRemoveModule(removeModuleConfirm)}
            isDisabled={removeModuleLoading}
          >
            {removeModuleLoading ? "Removing..." : "Remove"}
          </Button>
          <Button variant="link" onClick={() => setRemoveModuleConfirm(null)}>
            Cancel
          </Button>
        </ModalFooter>
      </Modal>

      {/* Uninstall confirmation */}
      <Modal
        isOpen={!!uninstallConfirm}
        onClose={() => setUninstallConfirm(null)}
        title="Uninstall"
      >
        <ModalBody>
          Uninstall {uninstallConfirm?.module} from {uninstallConfirm?.assistant}?
        </ModalBody>
        <ModalFooter>
          <Button variant="danger" onClick={() => uninstallConfirm && handleUninstall(uninstallConfirm)}>
            Uninstall
          </Button>
          <Button variant="link" onClick={() => setUninstallConfirm(null)}>
            Cancel
          </Button>
        </ModalFooter>
      </Modal>
    </Page>
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <LolaManagerApp />
  </StrictMode>
);
