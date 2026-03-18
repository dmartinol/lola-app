# F06: Add module

## Summary

Add a module to the local registry from a git URL, zip, tar, or local path. Triggered from List modules UI "Add module from URL" form. Market modules cannot be added—use Install instead.

## Priority

P0

## Acceptance criteria

- [ ] Add module form uses PatternFly Modal, Form, TextInput (see UI requirements)
- [ ] Tool `lola-add-module` is app-only (visibility: ["app"])
- [ ] Input: `source` (git URL, zip URL, tar URL, or local path)
- [ ] CLI: `lola mod add SOURCE`
- [ ] Returns `{ ok, message }` in structuredContent
- [ ] On success, UI refreshes modules list (registry view)

## Technical details

- **Tool:** `lola-add-module`
- **CLI:** `lola mod add <source>`
- **Input schema:** `{ source: string }` (optional `name` for override via `-n`)
- **Output schema:** `{ ok: boolean, message: string }`

## Examples

**Input:** `{ "source": "https://github.com/user/my-skills.git" }`

**Output (success):** `{ "ok": true, "message": "Module added" }`

**Output (error):** `{ "ok": false, "message": "Error message" }`

## UI requirements

PatternFly components (see REQUIREMENTS.md System requirements):

- Modal, ModalBody, ModalFooter
- Form, FormGroup, TextInput, Button
- Alert

## Notes

- Source can be: git URL, zip URL, tar URL, local folder path, local zip/tar path
- Market modules: use Install, not Add
- Form at top of List modules view for manual source input
