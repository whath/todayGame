# Local Multiplayer Robustness — v0.4

## Purpose
Provide reliable two-player local runtime behavior without assuming co-op or competitive gameplay.

## Core responsibilities
- Player identity and presence
- Join / Leave / Reconnect
- Device ownership
- Relationship model
- Replaceable CameraPolicy
- Player visibility tracking
- Interaction arbitration
- Ownership / Claim
- Shared UI ownership
- Spawn / recovery safety
- Targeted feedback
- Keyboard ghosting verification
- Multiplayer soft-lock auditing

## Relationship is game-defined
Possible relationships:
- Cooperative
- Competitive
- Mixed
- Neutral
- Team-based

## Interaction policies
- Exclusive
- Shared
- Simultaneous
- Competitive
- Cooperative
- Queued

## Rule
The foundation provides mechanisms and policies. The selected genre decides behavior.

## v5 实现映射
详见 COOP_ROBUSTNESS（实际实现与接力专用审计）、MIGRATION_3D、GAMEPLAY_KERNEL。
Inactive 已替代 Downed；Actor 默认没有 team。Level 选择合作或竞争，Player 只接受初始化参数。Competitive 提供 compete 回调选择合法获胜者，未满足/平局可返回 null；不默认先到数组/P1 获胜。Shared ownership 是多个持有者的 claim，Shared interaction 是允许多人执行的策略，二者不混为一谈。接口通过自动验证不代表竞争玩法已经试玩。
