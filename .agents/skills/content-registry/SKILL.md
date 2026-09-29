---
name: content-registry
description: Use when game content needs stable IDs, data-driven definitions, registry lookup, or content validation independent of final game genre.
---

# Rules
- Stable ContentId is not display name, file path, prefab name or array index.
- Registry maps IDs to definitions.
- Keep definitions data-oriented; behavior remains in systems/components.
- Validate duplicate/missing IDs and invalid references.
- Create only definition types required by current prototypes.
