# F04: Remove market

## Summary

Remove a marketplace from Lola. Triggered from List markets UI row "Remove" button (next to Inspect).

## Priority

P0

## Acceptance criteria

- [ ] Remove confirmation uses PatternFly Modal (see UI requirements)
- [ ] Tool `lola-remove-market` is app-only (visibility: ["app"])
- [ ] Input: `marketName`
- [ ] CLI: `lola market rm NAME`
- [ ] Returns `{ ok, message }` in structuredContent
- [ ] On success, UI refreshes markets list

## Technical details

- **Tool:** `lola-remove-market`
- **CLI:** `lola market rm <name>`
- **Input schema:** `{ marketName: string }`
- **Output schema:** `{ ok: boolean, message: string }`

## Examples

**Input:** `{ "marketName": "my-market" }`

**Output (success):** `{ "ok": true, "message": "Market removed" }`

**Output (error):** `{ "ok": false, "message": "Error message" }`

## UI requirements

PatternFly components (see REQUIREMENTS.md System requirements):

- Modal for confirmation dialog (ModalBody, ModalFooter, Button)

## Notes

- Remove button is on each row, next to Inspect
- Confirmation dialog before remove
