# F07: Install module

## Summary

Install a module's skills to an AI assistant. Works for both registry and market modules (install fetches from market if needed). Triggered from List modules UI "Install" button on row.

## Priority

P0

## Acceptance criteria

- [ ] Install modal uses PatternFly Modal, FormSelect for assistant (see UI requirements)
- [ ] Tool `lola-install-module` is app-only (visibility: ["app"])
- [ ] Input: `moduleName`, `assistant?` (optional)
- [ ] CLI: `lola install MODULE [-a ASSISTANT]`
- [ ] Returns `{ ok, message }` in structuredContent
- [ ] On success, UI refreshes installations list (if on installations view) or modules list

## Technical details

- **Tool:** `lola-install-module`
- **CLI:** `lola install <module> [-a claude-code|cursor|gemini-cli|opencode]`
- **Input schema:** `{ moduleName: string, assistant?: string }`
- **Output schema:** `{ ok: boolean, message: string }`

## Examples

**Input:** `{ "moduleName": "git-workflow", "assistant": "cursor" }`

**Output (success):** `{ "ok": true, "message": "Installed git-workflow to cursor" }`

**Output (error):** `{ "ok": false, "message": "Error message" }`

## UI requirements

PatternFly components (see REQUIREMENTS.md System requirements):

- Modal, ModalBody, ModalFooter
- Form, FormGroup, FormSelect, FormSelectOption for assistant selector
- Button, Alert

## Notes

- Assistants: claude-code, cursor, gemini-cli, opencode
- Install fetches from market if module not in registry
- Assistant selector when clicking Install
