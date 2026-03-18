# F10: Uninstall

## Summary

Uninstall a module's skills from an AI assistant. Triggered from List installations UI "Uninstall" button on each row.

## Priority

P0

## Acceptance criteria

- [ ] Uninstall confirmation uses PatternFly Modal (see UI requirements)
- [ ] Tool `lola-uninstall` is app-only (visibility: ["app"])
- [ ] Input: `moduleName`, `assistant?`, `projectPath?`
- [ ] CLI: `lola uninstall MODULE [-a ASSISTANT] [PROJECT_PATH]`
- [ ] Returns `{ ok, message }` in structuredContent
- [ ] On success, UI refreshes installations list

## Technical details

- **Tool:** `lola-uninstall`
- **CLI:** `lola uninstall <module> [-a assistant] [project_path]`
- **Input schema:** `{ moduleName: string, assistant?: string, projectPath?: string }`
- **Output schema:** `{ ok: boolean, message: string }`

## Examples

**Input:** `{ "moduleName": "git-workflow", "assistant": "cursor" }`

**Output (success):** `{ "ok": true, "message": "Uninstalled git-workflow from cursor" }`

**Input (project scope):** `{ "moduleName": "my-skills", "assistant": "claude-code", "projectPath": "/path/to/proj" }`

**Output (error):** `{ "ok": false, "message": "Error message" }`

## UI requirements

PatternFly components (see REQUIREMENTS.md System requirements):

- Modal for confirmation dialog (ModalBody, ModalFooter, Button)

## Notes

- Uninstall removes generated skill files but keeps module in registry. Use Remove modules to delete from registry.
- When uninstalling from row, pass the row's module, assistant, and project (if present)
