---
name: player-foundation
description: Use when creating or changing the reusable Player prefab/controller/movement/state foundation for both local players.
---

# Rules
- Use one Player prefab and one gameplay implementation.
- P1/P2 differ by data such as `playerId`, `inputSlot`, spawn, or presentation.
- Do not fork gameplay into Player1/Player2 classes.
- Keep camera and physical input out of Player.
- Keep movement/state responsibilities explicit.
- Verify two Player instances can run independently.
