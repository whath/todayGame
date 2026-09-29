---
name: shared-camera
description: Use for same-screen local multiplayer camera follow, midpoint targeting, dynamic zoom, smoothing, and camera bounds.
---

# Baseline behavior
- Target the player group center, starting with midpoint(P1, P2).
- Use player separation to drive zoom.
- Clamp zoom between explicit min/max values.
- Smooth position and zoom without frame-rate-dependent drift.
- Keep camera logic outside Player.
- Verify one-player movement, two-player movement, separation, convergence, and boundary behavior.
- Avoid hidden magic numbers; expose meaningful tuning parameters.
