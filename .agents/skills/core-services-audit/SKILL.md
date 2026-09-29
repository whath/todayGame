---
name: core-services-audit
description: Use before adding major foundation systems to find duplicated service responsibilities, direct platform access, direct physical input reads, direct audio manipulation, or persistence scattered through gameplay.
---

# Audit targets
Search for:
- physical key/button reads inside Player/Gameplay
- direct platform checks outside PlatformCapability/adapter layer
- direct volume manipulation scattered across gameplay
- direct persistence/storage writes from UI or gameplay
- duplicate pause/focus logic
- settings state duplicated in UI
- localization strings hardcoded in reusable UI

Return:
- evidence
- current owner
- recommended owner
- smallest migration path
Do not refactor during the audit unless explicitly asked.
