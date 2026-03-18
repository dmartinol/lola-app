# F02: Add market

## Summary

Add a new marketplace to Lola. Triggered from the List markets UI via "Add market" button, which opens a form for name and URL.

## Priority

P0

## Acceptance criteria

- [ ] Add market form uses PatternFly Modal, Form, TextInput (see UI requirements)
- [ ] Tool `lola-add-market` is app-only (visibility: ["app"])
- [ ] Input: `name`, `url`
- [ ] CLI: `lola market add NAME URL`
- [ ] Returns `{ ok, message }` in structuredContent
- [ ] On success, UI refreshes markets list

## Technical details

- **Tool:** `lola-add-market`
- **CLI:** `lola market add <name> <url>`
- **Input schema:** `{ name: string, url: string }`
- **Output schema:** `{ ok: boolean, message: string }`

## Examples

**Input:** `{ "name": "my-market", "url": "https://example.com/lola-catalog.yml" }`

**Output (success):** `{ "ok": true, "message": "Market added" }`

**Output (error):** `{ "ok": false, "message": "Error message" }`

## UI requirements

PatternFly components (see REQUIREMENTS.md System requirements):

- Modal, ModalBody, ModalFooter, ModalHeader
- Form, FormGroup, TextInput, Button
- Alert

## Notes

- Triggered from List markets UI "Add market" button → form (name, URL) → submit
