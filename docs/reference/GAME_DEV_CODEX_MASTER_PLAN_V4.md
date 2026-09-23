# DuoGame — Codex 游戏开发执行体系（市场验证版 v4）

> **当前权威版本，覆盖 v3 中与路线冲突的旧结论。**
> 更新日期：2026-09-23
> 引擎：Cocos Creator 3.8.x
> 语言：TypeScript
> 主开发平台：Windows PC
> 核心形态：PC 本地双人、同屏、不分屏、P1/P2 可自由选择键盘或手柄
> 后续方向：Steam；玩法成立后再评估微信/抖音小游戏、Android、iOS

---

# 1. 本版核心修正

重新结合 2024–2026 合作游戏市场验证后，本版保留 v1–v4，但修正 v5 以后路线：

1. **v0.1–v0.4 继续作为强制底座。**
2. **v0.5 改为 Universal Gameplay Kernel。**
3. **v0.5 后必须停止无限扩底座，进入灰盒可玩原型。**
4. Combat、Narrative、Mission、Roguelike、Management 等改为**可选 Gameplay Packs**。
5. 只有原型证明需要的专业系统才允许继续建设。
6. Vertical Slice 通过后才正式进入 Foundation Lock。

最终目标不是造万能游戏引擎，而是：

> **建立一个能快速试验、验证并生产双人合作游戏的底座。**

---

# 2. 市场验证结论

## 2.1 双人/合作方向继续成立

Video Game Insights 在《Rise of the Co-op Games》中统计，2023 年 Steam 发布的合作游戏接近 800 款，是五年前两倍以上；合作游戏还具有“玩家邀请朋友一起购买”的天然获客飞轮。

2025 年 Game Developer 对 PEAK、R.E.P.O、Schedule I 等社交合作游戏的总结进一步表明：合作游戏真正的卖点不是“支持多人”本身，而是**朋友之间不断产生值得记住、讨论和分享的事件**。

因此产品核心应该从：

```text
支持双人
```

升级为：

```text
制造双人互动事件
```

参考：
- https://vginsights.com/insights/article/rise-of-the-co-op-games
- https://www.gamedeveloper.com/design/what-developers-can-learn-from-the-indie-social-co-op-games-topping-the-steam-charts

---

## 2.2 PC Local Co-op 作为第一形态合理

Steam Remote Play Together 可以让远程好友像坐在同一台电脑前一样参与 Local Multiplayer / Local Co-op / Shared Screen 游戏，而且只需要 Host 拥有并安装游戏。

因此第一阶段不需要提前建设：

```text
Server
Lobby
Matchmaking
Prediction
Rollback
Authoritative Netcode
```

保留干净的 Semantic Input 边界即可为以后 NetworkInputSource 留空间。

参考：
- https://partner.steamgames.com/doc/features/remoteplay

---

## 2.3 手柄优先继续强化

Valve 公布的数据表明，Steam 日均会话中的控制器使用比例从 2018 年约 5% 增长到最高约 15%；约 42% 的控制器会话使用 Steam Input。

所以以下设计继续作为长期底座：

```text
PlayerInputSlot
Semantic Action
Controller Hot Plug
Input Rebinding
InputGlyphService
Controller-first UI Navigation
```

参考：
- https://store.steampowered.com/news/posts/?enddate=1722274413&feed=steam_news
- https://partner.steamgames.com/doc/features/steam_controller/device

---

## 2.4 微信/抖音与短视频方向值得保留，但不绑架 PC Core

Niko Partners 2025 中国玩家调查显示：
- 84.4% 的受访中国玩家玩过小游戏；
- 小游戏贡献已接近中国玩家游戏总支出的 10%；
- 41% 的玩家通过短视频平台获取新游戏信息。

因此：

```text
游戏开发
+
开发过程内容
+
短视频传播
+
未来小游戏适配
```

是有现实基础的组合。

但微信/抖音仍属于未来**发行适配层**，不能反向控制 PC 原型底层。

参考：
- https://nikopartners.com/chinas-video-games-market-in-2025-a-50-billion-opportunity/

---

# 3. 当前产品定位

PC 第一形态：

```text
Game World
├─ Player 1
├─ Player 2
├─ Shared Camera
└─ World
```

原则：

- 本地双人单机；
- 两名玩家同一世界；
- 同屏共享 Camera；
- 不分屏；
- P1/P2 均可选键盘或手柄；
- 不提前锁死射击、动作、肉鸽、经营、解谜等最终类型；
- 不提前假定必须有剧情；
- 不提前假定必须有战斗。

---

# 4. 市场验证后的总路线

```text
v0.1
LOCAL CO-OP FOUNDATION
        ↓
v0.2
CORE SERVICES & SETTINGS
        ↓
v0.3
RUNTIME & CONTENT FOUNDATION
        ↓
v0.4
LOCAL CO-OP ROBUSTNESS
        ↓
v0.5
UNIVERSAL GAMEPLAY KERNEL
        ↓
════════════════════════════
   MARKETABLE PROTOTYPE GATE
════════════════════════════
        ↓
灰盒玩法 A / B / C
        ↓
GAME DIRECTION LOCK
        ↓
选择需要的 GAMEPLAY PACKS
        ↓
VERTICAL SLICE
        ↓
FOUNDATION LOCK
        ↓
正式内容生产
```

---

# 5. v0.1 — Local Co-op Foundation

目标：

> 两个人坐在一台 Windows PC 前，可以稳定控制两个共享屏幕中的角色。

核心：

```text
InputManager
InputDevice
KeyboardInputDevice
GamepadInputDevice
PlayerInputSlot

Player
PlayerController
PlayerMovement
PlayerState

PlayerJoin
SharedCamera
PrototypeRoom
```

必须验证：

```text
Keyboard + Keyboard
Keyboard + Gamepad
Gamepad + Keyboard
Gamepad + Gamepad
Simultaneous Movement
Player Independence
Shared Camera
Collision
Controller Hot Plug
Windows Build
```

明确不做：

```text
Enemy
Weapon
Combat
Story
Network
Mobile
Formal Art
```

---

# 6. v0.2 — Core Services & Settings

目标：

> 把正式游戏几乎必然会用到的服务提前稳定下来。

核心：

```text
SettingsService
AudioService
LocalizationService
PauseService
PlatformCapabilityService
Persistence
Diagnostics
```

Settings：

```text
SettingDefinition
      ↓
SettingsRegistry
      ↓
SettingsStore
      ↓
SettingsApplier
      ↓
Platform / Engine
```

配套：

```text
SettingsPersistence
SettingsMigration
SettingsMenu
PlatformCapabilityService
```

设置分类：

```text
DISPLAY
GRAPHICS
AUDIO
CONTROLS
GAMEPLAY
ACCESSIBILITY
LANGUAGE
```

没有实际作用的选项不显示。

亮度默认定义为：

```text
In-game Gamma / Exposure
```

而不是修改操作系统显示器物理亮度。

---

# 7. v0.3 — Runtime & Content Foundation

目标：

> 让内容增长时 Runtime、Save、资源与流程仍然可维护。

核心：

```text
GameBootstrap
AppStateService
SceneFlowService
LoadingService
SaveService
ContentRegistry
AssetService
UINavigationService
TimeService
RandomService
FeatureFlagService
BuildInfo
GameLogger
```

## Scene Flow

禁止散落：

```ts
director.loadScene(...)
```

统一：

```text
SceneFlowService
 ↓
TransitionRequest
 ↓
Preload
 ↓
Loading
 ↓
Activate
 ↓
Initialize
```

## Save

分离：

```text
Settings
Profile
Run / Session
```

禁止直接序列化 Node / Component。

## Content

```text
ContentId
ContentDefinition
ContentRegistry
ContentValidator
```

Stable ID 不能依赖显示名、Prefab 文件名或数组下标。

## Time / Random

```text
GameTime
UITime
UnscaledTime

RandomService
Seed
```

用于暂停、随机复现和后续玩法扩展。

---

# 8. v0.4 — Local Co-op Robustness

这一层不是简单防 Bug，而是：

> **双人关系引擎。**

它解决 P1 与 P2 互相影响时发生什么。

## Player Presence

```text
Empty
Joining
Ready
Active
Disconnected
Downed
Spectating
Leaving
```

设备断开不等于 Player 身份消失。

## Join / Leave / Reconnect

```text
Join
 ↓
Assign Device
 ↓
Ready
 ↓
Active
 ↓
Disconnect
 ↓
Reconnect
 ↓
Leave
```

## Camera Separation Policy

预留：

```text
Soft Tether
Hard Tether
Maximum Distance
Warning
Auto Regroup
Teleport
Block Progress
```

最终游戏选择策略，不在 Core 强制某一种。

## Interaction Arbitration

```text
Interactor
Interactable
InteractionRequest
InteractionResult
```

策略：

```text
Exclusive
Shared
Simultaneous
Cooperative
Queued
```

## Ownership / Claim

```text
None
Player1
Player2
Team
World
```

可用于未来的道具、机关、载具、资源等。

## Player Collision Policy

```text
Off
Soft
Solid
```

## Spawn Safety

统一 SpawnService 检查安全位置和 fallback。

## Shared UI Ownership

```text
Main Menu → Any Player
Pause → Opening Player
Settings → Opening Player
Confirm Dialog → Modal Owner
```

## Targeted Feedback

```text
Player1
Player2
AllPlayers
World
```

例如 P1 被攻击时只震动 P1 对应手柄。

## Keyboard Ghosting Lab

实际测试两名键盘玩家同时多键输入是否受到硬件 Ghosting / Blocking 影响。

## Co-op Soft-lock Audit

重点检查：

```text
队友能否被永久锁在门外？
唯一资源能否永久丢失？
一人断开后流程是否卡死？
一人触发关卡后另一人是否被遗弃？
```

---

# 9. v0.5 — Universal Gameplay Kernel

这是**最后一个强制通用 Foundation 层**。

市场验证后的原则：

> 不把 Combat、Narrative、Mission、Roguelike、Management 强行做进通用 Core。

只做多种游戏方向都高度复用的玩法原语。

## Actor

```text
Actor
├─ Identity
├─ Controller
├─ State
├─ Actions
├─ Interaction
├─ Ownership
├─ Relations
├─ Tags
└─ Presentation
```

## State

提供通用状态管理能力，但不强制所有游戏都必须有“死亡”。

## Action

统一生命周期：

```text
CanStart
 ↓
Start
 ↓
Running
 ↓
Complete

or Cancel
```

基础语义：

```text
Move
PrimaryAction
SecondaryAction
Interact
SpecialAction
```

最终映射示例：

```text
Shooter:
PrimaryAction → Shoot

Action:
PrimaryAction → Attack

Puzzle:
PrimaryAction → Grab

Management:
PrimaryAction → UseTool
```

## Interaction

Actor 通过统一 Contract 查询和执行交互。

## Relationship / Team

最低限度：

```text
Self
Partner
Team
Neutral
Hostile
```

## Lightweight Tags

示例：

```text
actor.player
object.interactable
interaction.carryable
state.disabled
```

不做大型 Gameplay Ability System。

## Trigger / Condition / Action

通用世界逻辑：

```text
Trigger
 ↓
Condition
 ↓
Action
```

示例：

```text
BothPlayersEnter
 ↓
powerOn == true
 ↓
OpenDoor
```

## Semantic Feedback

Gameplay 只请求语义：

```text
InteractFeedback
SuccessFeedback
FailureFeedback
PickupFeedback
```

Presentation 再决定是否表现为 Audio、Camera、Rumble、VFX 或 UI。

---

# 10. Marketable Prototype Gate

v0.5 完成后：

> **强制停止继续扩通用底座。**

必须开始做 10–20 分钟灰盒可玩原型。

此时不需要：

```text
正式角色
正式 UI
正式故事
正式美术
复杂进度
```

验证的是：

```text
两个人是否主动交流？
是否会互相帮助？
是否会互相坑？
失败是否有趣？
有没有紧张或笑点？
是否存在等待时间？
是否一个玩家长期没事做？
规则是否容易理解？
玩完是否会想再来一次？
是否产生可剪成视频的瞬间？
```

结果只有：

```text
KEEP
ITERATE
KILL
```

如果不好玩：

> 改玩法，不允许继续加 Framework 来掩盖问题。

---

# 11. Gameplay Packs

Direction Lock 以后，按实际玩法选择模块。

## Combat Pack

仅在需要战斗时：

```text
Health
Damage
Heal
Weapon
Projectile
Hit
StatusEffect
Invulnerability
FriendlyFirePolicy
```

Combat 不属于 Universal Core。

## Puzzle / Physics Pack

可能包含：

```text
Grab
Carry
Push
Pull
Throw
Joint Interaction
Cooperative Switch
Weight
Physics Object
```

## Narrative Pack

只有角色、背景、故事线成为产品卖点后才建设：

```text
StoryState
StoryFlag
Dialogue
Choice
NarrativeTrigger
Sequence
Cutscene
```

## Mission Pack

Universal Core 只有 Trigger / Condition / Action。

Mission Pack 再增加：

```text
Objective
Checkpoint
MissionFlow
MissionState
Sequence
```

Boss、Escort、Wave 等继续属于更具体玩法模块。

## Roguelike Pack

```text
Run
Seed
Room Generation
Loot
Temporary Build
Permanent Unlock
Run Result
```

## Management Pack

```text
Inventory
Recipe
Resource
Production
Economy
Order
Task
Upgrade
```

## Social / Chaos Pack

合作市场验证后值得重点保留：

```text
Carry Partner
Throw Object
Shared Weight
Risky Item
Rescue
Push
Accidental Consequence
Shared Resource
Timed Cooperation
Failure Feedback
```

目的：

> 制造玩家之间值得分享的事件。

---

# 12. Production Layer

方向确定以后，才开始进入真正内容生产。

## GameDefinition

```text
GameDefinition
├─ GameMode
├─ Characters
├─ Levels
├─ EnabledGameplayPacks
├─ UITheme
├─ AudioTheme
├─ Localization
└─ DefaultSettings
```

## CharacterDefinition

```text
id
displayName
prefab
presentation
actions
tags
animationProfile
audioProfile
uiProfile
```

增加角色优先通过配置，而不是复制 Player 代码。

## LevelDefinition

```text
id
scene
spawn
triggers
checkpoints
content references
```

---

# 13. Presentation Layer

UI 后置且可替换。

Gameplay 不直接引用具体 UI。

推荐：

```text
ViewModel / Presenter
```

例如：

```text
GameHUDViewModel
├─ Player1
├─ Player2
├─ CurrentObjective
├─ InteractionPrompt
├─ Notifications
└─ ContextData
```

于是 Debug HUD、Steam HUD、小游戏 HUD 可以使用同一 Gameplay 数据。

---

# 14. Animation / Audio / VFX Contracts

Gameplay 只发语义。

Animation：

```text
Idle
Move
PrimaryAction
SecondaryAction
Interact
Hit
Downed
```

Audio：

```text
player.move
player.interact
ui.confirm
objective.complete
```

VFX：

```text
interaction.success
interaction.fail
pickup
```

具体资源由 Presentation 层绑定。

---

# 15. Content Authoring & Validation

要达到“后期主要通过配置与资源生产内容”的目标，还需要轻量内容工具。

建议 Codex 后期建立：

```text
Content ID Validator
Duplicate ID Scanner
Missing Localization Scanner
Missing Asset Scanner
Character Definition Validator
Level Definition Validator
Mission Validator（如果启用）
Dialogue Validator（如果启用）
```

目标：

> 降低配置型开发的错误成本。

---

# 16. Vertical Slice

即使 v0.5 完成，也不能宣布底座最终锁定。

先做一个极小但完整的 Vertical Slice：

```text
启动
 ↓
主菜单
 ↓
两人加入
 ↓
进入关卡
 ↓
核心合作机制
 ↓
成功 / 失败
 ↓
保存
 ↓
结算
 ↓
返回菜单
```

如果启用了某 Pack，则 Vertical Slice 必须覆盖它的真实流程。

Vertical Slice 暴露出来的问题才允许重新打开 Foundation。

通过：

> **FOUNDATION LOCK**

之后停止通用框架扩张，转向内容生产。

---

# 17. 用户目标的准确表述

目标不应该表述为：

> “角色和故事确定后，只做 UI 就能完成游戏。”

更准确的是：

> **当角色、世界观和玩法方向确定后，主要通过配置 ContentDefinition、组合 Gameplay Packs、制作关卡以及 UI/美术/动画/音效来完成游戏，而不再重写 Input、Player、Camera、Settings、Save、SceneFlow、Content、Interaction 等核心底层。**

新内容应该主要是：

```text
新增 CharacterDefinition
新增 LevelDefinition
配置 Actions
配置 Interaction
搭 Trigger / Condition / Action
配置可选 Mission / Narrative
绑定 Animation
绑定 Audio
绑定 VFX
制作 UI
```

而不是重新写：

```text
Player
Input
Camera
Save
Settings
SceneFlow
```

---

# 18. Codex Stop Rule

这是市场验证后新增的硬规则。

v0.5 后，Codex 不得仅因为：

> “以后可能有用”

而主动创建：

```text
Complex Combat Framework
Ability System
Quest System
Narrative Graph
Network Layer
Mod SDK
Replay System
Economy System
Crafting System
```

新增专业 Gameplay Pack 必须同时满足：

1. 当前原型或 Direction Lock 明确需要；
2. 有真实使用场景；
3. 有 Acceptance Criteria；
4. 会在当前 Prototype 或 Vertical Slice 中被使用。

---

# 19. Agent 体系调整

现有 Agents 继续有效。

新增两个推荐角色：

## coop_systems_engineer

负责：

```text
Player Presence
Join / Leave / Reconnect
Separation
Off-screen handling
Interaction arbitration
Ownership
Player collision
Spawn safety
Shared UI ownership
Targeted feedback
Co-op soft-lock
```

不负责具体 Combat / Narrative。

## gameplay_kernel_engineer

负责：

```text
Actor
State
Action
Interaction
Relations
Tags
Trigger
Condition
Semantic Feedback
```

不得主动把 Health、Damage、Weapon、Quest、Dialogue 等加进 Core。

---

# 20. 推荐新增 Skills

v0.4：

```text
player-presence
coop-separation
interaction-arbitration
ownership-claim
coop-spawn-safety
shared-ui-ownership
coop-softlock-audit
keyboard-ghosting-lab
```

v0.5：

```text
actor-foundation
action-lifecycle
interaction-contract
relationship-tags
trigger-condition-action
prototype-gate
vertical-slice-gate
gameplay-pack-audit
```

---

# 21. 市场导向 QA

传统 QA 只问：

```text
能不能运行？
有没有 Bug？
```

合作游戏 Prototype 还必须问：

```text
玩家是否主动交流？
是否一个玩家长期没事做？
是否能互相帮助？
是否能互相造成有趣影响？
失败是否有趣？
是否会主动再玩？
是否存在可分享的瞬间？
```

这是 v5 后最重要的 Gate。

---

# 22. 开发内容与传播

开发过程本身继续作为内容资产：

```text
设计分歧
 ↓
玩法假设
 ↓
Codex 实现
 ↓
第一次试玩
 ↓
Bug / 失败 / 笑点
 ↓
修正
 ↓
最终选择
```

Devlog 继续记录：

```text
Goal
Design Discussion
Decision
Codex Task
Implementation
Problems
Root Cause
Result
Footage Markers
Next
```

合作游戏产生的意外互动，本身天然适合开发短视频。

---

# 23. 平台策略

## Windows / Steam

主开发、主测试、主录制。

优先保持：

```text
Local Co-op
Controller support
Remote Play Together readiness
```

## 微信 / 抖音

玩法成立后再增加：

```text
Platform Adapter
Touch Input
Own Camera（如果需要）
Networking / Session（如果需要）
Mini-game packaging
Monetization adaptation
```

## iOS

继续后置。

---

# 24. 当前明确不做

强制 Foundation 阶段不主动做：

```text
自研在线联机
复杂服务端
Rollback
Matchmaking

完整 Ability System
复杂 RPG Stats

完整 Narrative Graph
完整 Quest Editor

Crafting
Economy
Shop
Inventory

Mod SDK
Steam Workshop
DLC Manager

完整 Replay
Deterministic Physics
```

它们都是未来按需要加载的 Pack。

---

# 25. 当前里程碑定义

```text
v0.1
两个人能稳定玩。

v0.2
正式游戏常用服务稳定。

v0.3
内容增长不会把 Runtime 搞乱。

v0.4
两个玩家互相影响时系统仍然稳定、可配置。

v0.5
拥有足够通用的玩法积木，可以快速制作多种双人合作灰盒原型。

Prototype Gate
证明这个玩法值得继续做。

Direction Lock
确定真正游戏方向。

Gameplay Packs
只建设实际需要的专业模块。

Vertical Slice
证明完整产品链可工作。

Foundation Lock
停止造底座，开始生产游戏。
```

---

# 26. 最终优先级

以后所有 Codex 决策遵循：

```text
FUN
 ↓
PLAYABLE
 ↓
ROBUST
 ↓
EXTENSIBLE
 ↓
ELEGANT
```

而不是：

```text
架构最漂亮
 ↓
最后再考虑游戏怎么玩
```

扩展性判断：

```text
现在确定会用
→ 稳定实现

未来高概率会用
→ 清晰接口

玩法证明需要
→ Gameplay Pack

可能会用
→ 保持不阻塞

纯猜测
→ 不做
```

最终目标：

> **让底座成为快速试错和生产游戏的工具，而不是项目本身。**
