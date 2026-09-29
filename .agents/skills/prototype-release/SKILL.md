---
name: prototype-release
description: Use when all mandatory acceptance criteria for a prototype version are met and the project is ready for a Windows milestone build/tag.
---

# Gate
1. Confirm mandatory acceptance checks pass.
2. Confirm working tree state is understood.
3. Build Windows target.
4. Smoke test the build.
5. Check console/log output.
6. Run QA/playtest gate.
7. Run code-review gate for risky changes.
8. Update version docs/devlog/roadmap.
9. Only then create or recommend the version tag.
Do not treat a successful compile alone as a release.
