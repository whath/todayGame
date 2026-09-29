---
name: settings-menu
description: Use when implementing the PC settings screen, category navigation, generated setting controls, apply/cancel/reset behavior, descriptions, and risky-display confirmation.
---

# Menu behavior
- Build controls from setting definitions where practical.
- Boolean -> toggle.
- Number -> slider/stepper.
- Enum -> selector.
- Binding -> binding widget.
- Support Apply, Cancel, Reset Category, Reset All.
- Show setting descriptions.
- Risky display changes require timed confirmation and automatic revert.
- UI must reflect capability/availability and never show a fake-working option.
- Preserve accessibility of the settings menu itself.
