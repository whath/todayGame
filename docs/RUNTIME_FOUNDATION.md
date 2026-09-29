# Runtime Foundation

## Runtime services
- GameBootstrap
- AppStateService
- SceneFlowService
- LoadingService
- TimeService
- RandomService
- FeatureFlagService
- BuildInfo
- GameLogger

## Principle

```text
UI / Gameplay
      |
      v
SceneFlowService
      |
      v
TransitionRequest -> preload -> activate -> initialize -> enter state
```

Keep gameplay time separate from UI/unscaled time. Route gameplay randomness through a seeded service when randomness becomes part of gameplay.

当前 SceneFlow/AppState/Loading 合并在 SceneFlowService 中实现，并未为示意图每个框创建空服务。实际实现与异常恢复见 [RUNTIME_DESIGN](RUNTIME_DESIGN.md)。
