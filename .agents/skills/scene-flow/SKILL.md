---
name: scene-flow
description: Use for boot/app state, scene transitions, loading gates, transition locking, preload hooks, or returning between frontend and gameplay scenes.
---

# Rules
- Centralize transitions in SceneFlowService.
- Keep AppState separate from scene asset names.
- Prevent overlapping transitions.
- Expose loading/progress hooks without binding to a specific UI.
- Explicitly initialize and tear down scene-scoped state.
- Do not let arbitrary UI/gameplay scripts load scenes directly once the service exists.
