---
name: feature-flags
description: Use for temporary prototype toggles and A/B comparison without permanently branching architecture.
---

# Rules
- Every flag has purpose/owner/removal condition.
- Do not store experimental flags as permanent progression.
- Strip or disable inappropriate flags in Release.
- When a decision is final, delete the old path and flag.
