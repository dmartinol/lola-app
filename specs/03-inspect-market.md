# F03: Inspect market

## Summary

Show detailed information about a marketplace: URL, enabled status, and list of module names. Triggered from List markets UI row "Inspect" button.

## Priority

P0

## Acceptance criteria

- [ ] Inspect modal uses PatternFly Modal (see UI requirements)
- [ ] Tool `lola-inspect-market` is app-only (visibility: ["app"])
- [ ] Input: `marketName`
- [ ] Output: `url`, `enabled`, `moduleNames` (array)
- [ ] UI displays result in modal or slide-out when Inspect is clicked

## Technical details

- **Tool:** `lola-inspect-market`
- **CLI:** `lola market ls <name>` for module list; metadata (URL, enabled) from `~/.lola/market/*.yml`
- **Input schema:** `{ marketName: string }`
- **Output schema:** `{ url: string, enabled: boolean, moduleNames: string[] }`

## Examples

**Input:** `{ "marketName": "official" }`

**Output:**
```json
{
  "url": "https://example.com/lola-catalog.yml",
  "enabled": true,
  "moduleNames": ["git-workflow", "python-helpers"]
}
```

## UI requirements

PatternFly components (see REQUIREMENTS.md System requirements):

- Modal, ModalBody, ModalFooter
- Spinner (while loading)

## Notes

- Marketplace metadata (URL, enabled) must be read from `~/.lola/market/*.yml` files
- Module list from `lola market ls <name>` output parsing
