---
name: performance-pooling
description: Use only when profiling or observed churn shows frequent create/destroy operations would benefit from pooling.
---

# Rules
- Require evidence first.
- Pool by concrete lifecycle/type.
- Reset all reusable state.
- Avoid pooling low-frequency or long-lived objects.
- Re-test for stale-state bugs after pooling.
