---
name: event-contracts
description: Use when systems need decoupled notifications and the team must choose between typed/domain events and direct service calls.
---

# Decision
Use events for 'something happened and observers may care'.
Use direct APIs for 'perform this explicit operation'.

# Rules
- Prefer typed/domain events.
- Avoid a universal string-based EventBus.
- Do not use Node as a global custom-event bus.
- Define subscription lifecycle and avoid listener leaks.
