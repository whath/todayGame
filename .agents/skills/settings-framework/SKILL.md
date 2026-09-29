---
name: settings-framework
description: Use when creating or changing the extensible settings registry, store, definitions, appliers, persistence boundary, defaults, validation, or capability gating.
---

# Required architecture
Separate:
- SettingDefinition / schema metadata
- SettingsRegistry
- runtime SettingsStore
- SettingsApplier
- persistence
- platform capability

# Rules
- Settings UI is never the source of truth.
- Every setting has a stable id and default.
- Validate loaded and runtime values.
- Support live / onApply / restartRequired apply modes.
- Support global/profile/player scope where useful.
- Unsupported platform features are hidden or disabled via capability checks.
- Do not write storage on every slider tick.
- Brightness is game gamma/exposure unless explicitly specified otherwise.
