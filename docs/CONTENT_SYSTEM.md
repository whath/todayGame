# Content System

## Minimal concepts
- ContentId
- ContentDefinition
- ContentRegistry
- ContentValidator

## Stable ID examples
- `character.player.default`
- `level.prototype.room_01`

Do not use display name, prefab filename, or list position as persistence identity.

Only add definition types needed by current prototypes.

当前定义与生命周期见 [CONTENT_DESIGN](CONTENT_DESIGN.md)，外部素材通过 [ASSET_PIPELINE](ASSET_PIPELINE.md)。
