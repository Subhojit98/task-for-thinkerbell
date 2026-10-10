# Device settings save

- Language and volume each have a visible label tied to its control. Tab reaches every field, and Enter or Space activates Save settings.
- Save stays available when the draft differs from the last saved record.
- During the request, Save shows a pending state with `aria-busy="true"`, and further submits wait until that request finishes.
- Volume must be an integer from 0 to 5, and language must be English, Hindi, or Kannada. The first invalid field receives focus, with the message beside its label.
- A validation failure (`422`) keeps the draft in the fields and keeps the saved summary on the previous record.
- A version conflict (`409`) keeps the draft, reloads the device at its current version, and offers Save again against that version.
- The saved summary updates from a `200` response only, using that response's merged settings and new version.
- Until that `200` arrives, the summary continues to show the last saved language and volume.

## Run

```bash
node --input-type=module -e 'import { apply_update } from "./apply-update.js"; console.log(apply_update({ deviceId: "D01", siteId: "S01", version: 3, settings: { language: "en", volume: 2 } }, { siteId: "S01", role: "editor" }, { deviceId: "D01", expectedVersion: 3, settings: { volume: 4 } }))'
```

## Test

```bash
npm test
```

## Known limitation

A `409` response is status and error only. Conflict recovery reads the device again before the next save.

## Design choices

`apply_update` checks the actor, the patch, and the expected version before it builds a new record. Allowed setting names and languages are `Set`s. The input record stays as it was, and the saved summary follows the `200` body.
