# Universal Gameplay Kernel — v0.5

## Goal
Provide the smallest genre-agnostic gameplay vocabulary needed to build and compare very different two-player prototypes.

## Core
- Actor / Identity
- State
- Action lifecycle
- Interaction
- Ownership
- Relationship
- lightweight Tags
- Trigger / Condition / Action
- semantic Feedback

## Actor is generic
Actor may represent:
- player character
- fighter
- vehicle
- ball
- machine
- NPC
- animal
- interactive entity

## Not Core
- Damage / Health / Weapon
- Combo / Round
- Vehicle handling / Lap
- Inventory / Recipe / Economy
- Dialogue / Story / Chapter
- Quest / Mission
- Roguelike Run
- Networking

These are Genre Packs after prototype direction lock.

## Stop Rule
Once v0.5 passes, build playable prototypes. Do not keep adding universal systems without evidence.

## 当前实现
本页描述目标边界；实际类型、调用链与停止规则见 [GAMEPLAY_KERNEL](GAMEPLAY_KERNEL.md)，本轮迁移见 [MIGRATION_3D](MIGRATION_3D.md)。不存在尚未接入的完整 Genre Framework。
