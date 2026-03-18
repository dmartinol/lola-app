# F01: List markets

## Summary

Display all registered Lola marketplaces in a table with Inspect and Remove actions per row, and an Add market button at the top.

## Priority

P0

## Acceptance criteria

- [ ] UI uses PatternFly components and layouts (see UI requirements)
- [ ] Tool `lola-list-markets` is model-invokable (visible to agent)
- [ ] Tool returns `view: 'markets'` and `marketplaces` array in structuredContent
- [ ] UI resource `ui://lola-manager/markets` renders markets table
- [ ] Table columns: Name, Modules count, Status
- [ ] Each row has "Inspect" and "Remove" buttons
- [ ] Top of view has "Add market" button
- [ ] App-only refresh tool available for polling

## Technical details

- **Tool:** `lola-list-markets`
- **Resource:** `ui://lola-manager/markets`
- **CLI:** `lola market ls`
- **Input schema:** `{}`
- **Output schema:** `{ view: 'markets', marketplaces: [{ name, modules, status }] }`

## Examples

**Input:** `{}`

**Output:**
```json
{
  "view": "markets",
  "marketplaces": [
    { "name": "official", "modules": 42, "status": "enabled" }
  ]
}
```

## UI requirements

PatternFly components and layouts (see REQUIREMENTS.md System requirements):

- Page, PageSection, Card, CardTitle, CardBody
- Table (Thead, Tbody, Tr, Th, Td), EmptyState, EmptyStateBody
- Button (primary, secondary, danger, link), Bullseye, Spinner

## Notes

- Uses existing `lola.listMarketplaces()`
- UI is a separate view; no cross-navigation to modules or installations
