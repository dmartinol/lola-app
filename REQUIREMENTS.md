# Lola App Requirements

AI-driven development requirements. Each feature has a dedicated spec in `specs/`.

## Feature index

| ID | Feature | Spec | Priority | Status |
|----|---------|------|----------|--------|
| F01 | List markets | [specs/01-list-markets.md](specs/01-list-markets.md) | P0 | pending |
| F02 | Add market | [specs/02-add-market.md](specs/02-add-market.md) | P0 | pending |
| F03 | Inspect market | [specs/03-inspect-market.md](specs/03-inspect-market.md) | P0 | pending |
| F04 | Remove market | [specs/04-remove-market.md](specs/04-remove-market.md) | P0 | pending |
| F05 | List modules | [specs/05-list-modules.md](specs/05-list-modules.md) | P0 | pending |
| F06 | Add module | [specs/06-add-module.md](specs/06-add-module.md) | P0 | pending |
| F07 | Install module | [specs/07-install-module.md](specs/07-install-module.md) | P0 | pending |
| F08 | Remove modules | [specs/08-remove-modules.md](specs/08-remove-modules.md) | P0 | pending |
| F09 | List installations | [specs/09-list-installations.md](specs/09-list-installations.md) | P0 | pending |
| F10 | Uninstall | [specs/10-uninstall.md](specs/10-uninstall.md) | P0 | pending |

## System requirements

UI MUST use PatternFly style and layouts:

- **Components:** Use `@patternfly/react-core` components (Page, PageSection, Card, Table, Button, Modal, Form, FormGroup, TextInput, FormSelect, Alert, EmptyState, Spinner, etc.)
- **Layout:** Page with PageSection; Card for content blocks; Table for tabular data; Modal for forms and dialogs
- **Styles:** Import `@patternfly/react-core/dist/styles/base.css`; use `global.css` for host-style variable fallbacks (e.g. `var(--color-background-primary)`, `var(--font-sans)`)
- **Icons:** Use `@patternfly/react-icons` for icons (CatalogIcon, CubeIcon, DownloadIcon, PlusIcon, InfoCircleIcon, TrashIcon)
- **Reference:** https://www.patternfly.org/

## Technical constraints

- Server: `server.ts`, `lola.ts`; register handlers before `app.connect()`
- UI: `src/mcp-app.tsx`; `vite-plugin-singlefile` for `mcp-app.html`
- Follow `.cursor/rules/mcp-app-patterns.mdc` when editing MCP code
- Do NOT modify: `.lola/` modules, Lola CLI internals

## Out of scope

- Lola CLI replacement; direct filesystem writes outside `~/.lola`
- Multi-user or auth; backend persistence beyond Lola's own files
