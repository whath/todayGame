---
name: ui-navigation
description: Use for controller/keyboard UI focus, confirm/cancel/back behavior, modal stacks, screen layers, and controller-first menu flow.
---

# Rules
- Main-menu-to-game flow should work without mouse where practical.
- Centralize Back/Cancel at the top relevant UI layer.
- Define Screen / Overlay / Modal / Toast / Debug layers.
- UI state is not gameplay authority.
- Keep input glyph presentation separate from semantic actions.
- Test keyboard and gamepad navigation.
