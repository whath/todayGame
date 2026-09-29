---
name: player-join
description: Use for Press Any Button, local player join, ready flow, and mapping detected devices to P1/P2 slots.
---

# Workflow
1. Detect an eligible unowned input source.
2. Assign it to the requested/free player slot.
3. Reject duplicate ownership.
4. Surface device and ready state to UI.
5. Allow transition only when required players are ready.
6. Verify re-entry/restart does not leave stale ownership.
7. Keep join UI from becoming the authority for device state.
