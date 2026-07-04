# Local Storage And Backups

The app stores progress in the learner browser using IndexedDB.

Stored locally:

- settings
- attempts
- daily sets
- daily completion records
- extra practice sessions
- export metadata
- login dates

Not stored:

- passcode
- production secret
- GitHub token
- API key
- microphone audio
- analytics identifiers

## Export

Settings -> Export progress creates a local JSON backup. Optional encryption uses a backup passphrase with Web Crypto AES-GCM.

Unencrypted exports contain practice answers and scores.

## Import

Settings -> Import progress validates the backup schema before writing to IndexedDB. Merge and replace both require confirmation.

## Clearing Browser Data

Clearing browser data can delete IndexedDB progress. Export a backup before clearing data, changing browsers, or moving to another device.

## Move To Another Device

Export progress on the old device, transfer the JSON file manually, open the app on the new device, unlock it, then import the backup from Settings.
