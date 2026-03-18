# F08: Remove modules

## Summary

Remove one or more modules from the local registry. Triggered from List modules UI "Remove" button on registry module rows.

## Priority

P0

## Acceptance criteria

- [ ] Remove confirmation uses PatternFly Modal (see UI requirements)
- [ ] Tool `lola-remove-modules` is app-only (visibility: ["app"])
- [ ] Input: `moduleNames` (array of strings)
- [ ] CLI: `lola mod rm NAME` for each module
- [ ] Returns `{ ok, message, results?: { name, ok, message }[] }` in structuredContent
- [ ] On success, UI refreshes modules list

## Technical details

- **Tool:** `lola-remove-modules`
- **CLI:** `lola mod rm <name>` (per module)
- **Input schema:** `{ moduleNames: string[] }`
- **Output schema:** `{ ok: boolean, message: string, results?: Array<{ name, ok, message }> }`

## Examples

**Input:** `{ "moduleNames": ["git-workflow", "old-module"] }`

**Output (success):** `{ "ok": true, "message": "Removed 2 modules", "results": [...] }`

**Output (partial):** `{ "ok": false, "message": "Some failed", "results": [{ "name": "git-workflow", "ok": true }, { "name": "old-module", "ok": false, "message": "Not found" }] }`

## UI requirements

PatternFly components (see REQUIREMENTS.md System requirements):

- Modal for confirmation dialog (ModalBody, ModalFooter, Button)

## Notes

- Only applies to registry modules. Market modules are not in registry.
- Uninstall removes from assistants; Remove deletes from registry entirely.
