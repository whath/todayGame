---
name: save-profile
description: Use for offline saves, profile data, run/session snapshots, save slots, autosave triggers, validation, migration, backup, or save/load round trips.
---

# Rules
- Serialize DTO/snapshot data, never Nodes/Components.
- Separate Settings, Profile and Run/Session.
- Include schemaVersion.
- Validate and migrate on load.
- Autosave only on meaningful events.
- Malformed data must fail safely.
- Test round-trip and old/invalid data cases.
