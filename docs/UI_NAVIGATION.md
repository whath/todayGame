# UI Navigation Foundation

## Goals
- keyboard/controller-friendly menus
- predictable Back/Cancel
- modal ownership
- input-glyph abstraction

## Layers
- Screen
- Overlay
- Modal
- Toast
- Debug

Only the top relevant layer should consume Back/Cancel.

当前实现：UINavigationService 与 RuntimeScreen/SettingsMenu，归属与断线恢复见 [LOCAL_MULTIPLAYER_ROBUSTNESS](LOCAL_MULTIPLAYER_ROBUSTNESS.md)。
