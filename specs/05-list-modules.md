# F05: List modules

## Summary

Display modules from either the local registry or a selected marketplace. Toggle between Registry and Market; if Market, show market selector. Row actions: Registry rows have Remove and Install; Market rows have Install only. Top: "Add module from URL" button.

## Priority

P0

## Acceptance criteria

- [ ] UI uses PatternFly components and layouts (see UI requirements)
- [ ] Tool `lola-list-modules` is model-invokable (visible to agent)
- [ ] Tool returns `view: 'modules'` and data based on source
- [ ] UI resource `ui://lola-manager/modules` renders modules view
- [ ] Toggle: "Registry" | "Market"
- [ ] Registry: `lola mod ls` — list local modules
- [ ] Market: market selector + `lola market ls <name>` — list modules in that market
- [ ] Registry row actions: "Remove", "Install"
- [ ] Market row actions: "Install" only
- [ ] Top: "Add module from URL" button (opens form)
- [ ] App-only refresh tool for modules view

## Technical details

- **Tool:** `lola-list-modules`
- **Resource:** `ui://lola-manager/modules`
- **Input schema:** `{ source?: 'registry' | 'market', marketName?: string }` (optional; UI can pass)
- **Output schema (registry):** `{ view: 'modules', source: 'registry', modules: string[], marketplaces?: [...] }`
- **Output schema (market):** `{ view: 'modules', source: 'market', marketName, modules: [{ name, description? }], marketplaces?: [...] }`

## Examples

**Registry output:**
```json
{
  "view": "modules",
  "source": "registry",
  "modules": ["git-workflow", "my-skills"],
  "marketplaces": [{ "name": "official", "modules": 42, "status": "enabled" }]
}
```

**Market output:**
```json
{
  "view": "modules",
  "source": "market",
  "marketName": "official",
  "modules": [{ "name": "git-workflow", "description": "Git helpers" }],
  "marketplaces": [...]
}
```

## UI requirements

PatternFly components and layouts (see REQUIREMENTS.md System requirements):

- Page, PageSection, Card, CardTitle, CardBody
- Table (Thead, Tbody, Tr, Th, Td), EmptyState, EmptyStateBody
- Button (primary, secondary, danger, link), Bullseye, Spinner
- FormSelect, FormSelectOption for market selector

## Notes

- Market modules cannot be added to registry—only Install. Add module = manual source (git/zip/path) via form.
- Need marketplaces list for market selector dropdown.
