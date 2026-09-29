---
name: local-multiplayer-input
description: Use for keyboard/gamepad input, player input slots, semantic actions, simultaneous local multiplayer input, or device assignment.
---

# Required boundary
`Player -> PlayerInputSlot -> InputDevice`

# Rules
- Player consumes semantic actions, never physical key/button constants.
- Support Keyboard A + Keyboard B, Keyboard + Gamepad, Gamepad + Keyboard, and Gamepad 1 + Gamepad 2.
- One physical device cannot own two player slots at once.
- Simultaneous input must remain independent.
- Keep device discovery/assignment in the input layer.
- Do not introduce networking.
- Test at least the combinations affected by the change.
