---
name: 3d-asset-intake
description: Use when an approved external 3D asset pack must be license-checked, normalized, processed and integrated into the Cocos project.
---

# Workflow
1. Record source URL/provider and acquisition date.
2. Verify commercial-use license and attribution requirements.
3. Archive original package unchanged.
4. Inspect FBX / glTF / GLB / BLEND / textures.
5. Check coordinate orientation, scale and pivot.
6. Process in Blender when required.
7. Check materials/textures.
8. Prepare collision if needed.
9. Import into Cocos.
10. Create Prefab / ContentDefinition where appropriate.
11. Run asset validation.
12. Update ASSET_CATALOG.md and ASSET_LICENSES.md.

# Rule
The user approves visual choices. This skill performs technical intake; it does not choose the art direction.
