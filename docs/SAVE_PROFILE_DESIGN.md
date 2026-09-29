# Save & Profile Design

## Namespaces
- Settings: user preferences
- Profile: permanent progression/statistics
- Run/Session: temporary current-session state

## Save pipeline

```text
Runtime -> Snapshot DTO -> Validate -> Serialize -> SaveStorage
```

Load pipeline:

```text
SaveStorage -> Deserialize -> Migrate -> Validate -> Snapshot -> Rebuild runtime
```

Never serialize Node/Component directly. Persistent content references use stable IDs.

当前 schema 3、迁移、回读恢复和存储限制见 [SAVE_DESIGN](SAVE_DESIGN.md)。3D 迁移保留旧平面坐标含义。
