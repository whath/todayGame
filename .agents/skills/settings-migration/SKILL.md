---
name: settings-migration
description: Use when the settings schema changes, old settings must be upgraded, corrupted values recovered, or backward-compatible defaults introduced.
---

# Workflow
1. Read persisted schemaVersion.
2. Apply ordered migrations.
3. Validate enum/range/type values.
4. Fill missing defaults.
5. Preserve unrelated valid user preferences.
6. Fall back safely when a migration cannot recover a value.
7. Never let a malformed settings file prevent boot.
8. Add regression fixtures/examples for old schemas where practical.
