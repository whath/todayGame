---
name: bug-root-cause
description: Use for any reproducible bug, regression, crash, wrong input, camera issue, or unexpected runtime behavior before applying a fix.
---

# Required output
Observed
Expected
Reproduction
Evidence
Root Cause
Minimal Fix
Regression Risk
Verification

# Rules
- Reproduce first when feasible.
- Trace the real execution path.
- Fix the owner of the defect.
- Do not hide the issue with arbitrary delays, repeated retries, swallowed exceptions, or unrelated guards.
- Keep the fix scoped.
- Re-test the failing path and adjacent regression paths.
