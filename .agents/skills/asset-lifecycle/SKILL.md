---
name: asset-lifecycle
description: Use for asset loading/preloading/release ownership, Asset Bundle boundaries, lifecycle scopes, or memory-sensitive content transitions.
---

# Rules
- State who owns dynamically loaded assets.
- Match acquire/release to an explicit lifecycle scope.
- Use preload when it removes a demonstrated transition issue.
- Split bundles by lifecycle/distribution needs.
- Do not create many bundles in a small prototype.
- Verify repeated enter/exit paths do not leak obvious resources.
