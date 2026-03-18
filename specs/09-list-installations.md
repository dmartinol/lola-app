# F09: List installations

## Summary

Display all module installations (which modules are installed to which assistants). Each row has an Uninstall button.

## Priority

P0

## Acceptance criteria

- [ ] UI uses PatternFly components and layouts (see UI requirements)
- [ ] Tool `lola-list-installations` is model-invokable (visible to agent)
- [ ] Tool returns `view: 'installations'` and `installations` array in structuredContent
- [ ] UI resource `ui://lola-manager/installations` renders installations table
- [ ] Table columns: Module, Assistant, Scope, Project
- [ ] Each row has "Uninstall" button
- [ ] App-only refresh tool for installations view

## Technical details

- **Tool:** `lola-list-installations`
- **Resource:** `ui://lola-manager/installations`
- **CLI:** `lola list`
- **Input schema:** `{}`
- **Output schema:** `{ view: 'installations', installations: [{ module, assistant, scope, project? }] }`

## Examples

**Input:** `{}`

**Output:**
```json
{
  "view": "installations",
  "installations": [
    { "module": "git-workflow", "assistant": "cursor", "scope": "user", "project": null },
    { "module": "my-skills", "assistant": "claude-code", "scope": "project", "project": "/path/to/proj" }
  ]
}
```

## UI requirements

PatternFly components and layouts (see REQUIREMENTS.md System requirements):

- Page, PageSection, Card, CardTitle, CardBody
- Table (Thead, Tbody, Tr, Th, Td), EmptyState, EmptyStateBody
- Button (primary, danger, link), Bullseye, Spinner

## Notes

- Uses existing `lola.listInstallations()`
- Uninstall button passes module, assistant, project (if scope is project) to uninstall tool
