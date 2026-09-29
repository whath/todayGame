---
name: controller-hotplug
description: Use when gamepads connect, disconnect, reconnect, or player-slot ownership must survive device availability changes.
---

# Rules
- Track device availability separately from player identity.
- On disconnect, do not silently give the slot to another device.
- Surface disconnected state to UI.
- Reconnect should not crash or duplicate ownership.
- Preserve deterministic slot ownership.
- Test disconnect/reconnect during active play and before ready state when possible.
