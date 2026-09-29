---
name: time-random
description: Use for gameplay/UI time separation, pause-safe timing, hit-stop/slow-motion readiness, seeded randomness, or random-debug reproduction.
---

# Time
- Distinguish gameplay time from UI/unscaled time.
- Keep pause ownership explicit.

# Random
- Route gameplay random through RandomService once introduced.
- Support explicit seed and basic helpers.
- Do not promise deterministic replay/physics.
- Expose the active seed in development diagnostics when useful.
