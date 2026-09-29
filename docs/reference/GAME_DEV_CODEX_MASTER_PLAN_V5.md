# DuoGame — Codex 游戏开发执行体系 v5

> **当前权威版本 / Genre-Agnostic 3D Local Multiplayer Foundation**
>
> 更新日期：2026-09-29  
> 引擎：Cocos Creator 3.8.x  
> 语言：TypeScript  
> 主开发环境：Windows PC  
> 固定表现形式：3D  
> 第一运行形态：本地双人单机 / Local Multiplayer  
> 显示模式：PC 同屏，不默认分屏  
> 输入：P1/P2 可自由选择键盘或手柄  
> 网络：当前不实现，但底层不得阻断未来 LAN / Online Multiplayer  
> 最终游戏类型：**未确定，不预设**
> 
> 可能方向包括但不限于：格斗、赛车、经营、动作、射击、解谜、体育、模拟、肉鸽、叙事、混合类型。

---

# 1. v5 的核心修正

v4 仍有一个潜在偏向：

> 将项目过多地理解为“Local Co-op”。

但当前产品只确定“**双人本地多人**”，并没有确定两人一定合作。

例如最终可能是：

```text
格斗
P1 VS P2

赛车
P1 VS P2

经营
P1 + P2 合作

动作
合作 / 对抗均可能

体育
P1 VS P2 / 2P合作

叙事
双人合作

小游戏合集
不同关卡规则不同
```

因此从 v5 开始：

```text
Local Co-op
```

统一提升为：

```text
Local Multiplayer
```

“合作”成为可选玩法关系，而不是底座前提。

---

# 2. 当前真正确定的 Design Pillars

项目级硬约束只保留以下内容。

## PILLAR 01 — 3D

游戏世界固定按照 3D 项目建设。

这意味着：

```text
Character
Environment
Props
Physics
Camera
Lighting
Animation
VFX
```

都按照 3D Pipeline 设计。

UI 仍然可以使用普通 2D Overlay。

---

## PILLAR 02 — Local Multiplayer First

第一产品形态：

```text
一台 Windows PC
│
├─ Player 1
└─ Player 2
```

特点：

- 本地运行；
- 双人；
- 无服务器；
- 无账号；
- 无 Matchmaking；
- 无网络同步；
- PC 共享一个游戏进程。

---

## PILLAR 03 — Future Online-Capable Architecture

当前不实现网络。

但：

```text
Player
```

不能直接绑定本机键盘/手柄。

保持：

```text
Input Source
     ↓
Semantic Player Command
     ↓
Player / Actor
```

当前：

```text
LocalInputSource
```

未来可以增加：

```text
NetworkInputSource
ReplayInputSource
AIInputSource
```

而不重写角色玩法核心。

---

## PILLAR 04 — Genre-Agnostic Foundation

底座不得预设最终游戏类型。

因此 Core 不默认包含：

```text
Damage
Weapon
Combo
Lap
Vehicle
Dialogue
Quest
Inventory
Recipe
Economy
Crafting
Story Chapter
Roguelike Run
```

这些属于后续 Genre / Gameplay Packs。

---

## PILLAR 05 — Data-Driven Content

后期增加角色、场景和内容时，应优先：

```text
Definition
Configuration
Prefab
Asset
```

而不是复制 Gameplay Code。

目标：

> 游戏方向确定后，项目逐渐从“写底层”转换成“生产内容”。

---

# 3. 3D Asset Supply Pillar

当前正式素材供应策略：

```text
Quaternius
     +
Fab Free
     +
itch.io Free
```

作为主要免费资源来源。

---

## 3.1 Quaternius

定位：

> **3D 风格锚点 / 主资产来源**

优先寻找：

```text
Character
Environment
Building
Nature
Props
Vehicle
Animation
Fantasy
Sci-Fi
Urban
```

原则：

> 如果一个主题 Quaternius 已存在完整套装，优先保持整套视觉统一。

---

## 3.2 Fab Free

定位：

> **高质量补充资源库**

优先寻找：

```text
Character
Environment
Large Props
Vehicle
Material
Animation
VFX
Special Assets
```

必须记录具体资产 License。

---

## 3.3 itch.io Free

定位：

> **特色资源 / 小众视觉补充**

适合：

```text
Stylized 3D
Low-poly
特殊人物
主题场景
独特道具
特殊 UI
```

因为不同作者 License 不统一：

> 未明确允许商业用途的免费资源不得进入 Production Asset Library。

---

# 4. Asset Pipeline

用户职责：

```text
决定视觉方向
↓
浏览候选
↓
SHORTLIST
↓
最终 APPROVE / REJECT
```

Codex 职责：

```text
检查 License
↓
检查格式
↓
解压
↓
命名规范化
↓
模型检查
↓
Blender 后处理
↓
材质检查
↓
比例检查
↓
碰撞体
↓
Cocos 导入
↓
Prefab
↓
ContentDefinition
↓
Validation
↓
登记资产档案
```

---

## 4.1 Asset 状态

```text
DISCOVERED
↓
SHORTLISTED
↓
LICENSE_CHECKED
↓
TECH_CHECKED
↓
APPROVED
↓
PROCESSED
↓
IN_GAME
```

---

## 4.2 Asset 目录

建议工作目录：

```text
D:\GameAssets\

01_Inbox\
02_Shortlisted\
03_Approved\
04_Processing\
05_Ready\
06_Archive\
```

项目内部只接收：

```text
05_Ready
```

产出的正式资源。

---

## 4.3 Asset Manifest

每套外部资源生成 Manifest：

```yaml
id: asset_environment_example

source:
  provider: Quaternius
  url: ...
  obtained_at: 2026-09-29

license:
  type: ...
  commercial_use: true
  attribution_required: false

category:
  environment

format:
  - gltf
  - fbx

processing:
  scale_checked: true
  material_checked: true
  cocos_imported: true

status: IN_GAME
```

统一维护：

```text
ASSET_CATALOG.md
ASSET_LICENSES.md
```

---

# 5. Foundation 总体结构

```text
┌─────────────────────────────────────┐
│          GENRE / GAME PACKS         │
│                                     │
│ Fighting                            │
│ Racing                              │
│ Management                          │
│ Narrative                           │
│ Combat                              │
│ Puzzle / Physics                    │
│ Sports                              │
│ Simulation                          │
│ Roguelike                           │
│ Social / Party                      │
└──────────────────┬──────────────────┘
                   │
        MARKETABLE PROTOTYPE
                   │
┌──────────────────▼──────────────────┐
│ v0.5 UNIVERSAL GAMEPLAY KERNEL      │
│ Actor / State / Action /            │
│ Interaction / Relationship /        │
│ Ownership / Tags / Trigger /        │
│ Feedback                            │
└──────────────────┬──────────────────┘
                   │
┌──────────────────▼──────────────────┐
│ v0.4 LOCAL MULTIPLAYER ROBUSTNESS   │
│ Player Presence / Devices /         │
│ Shared Camera / Arbitration /       │
│ UI Ownership / Spawn / Claims       │
└──────────────────┬──────────────────┘
                   │
┌──────────────────▼──────────────────┐
│ v0.3 RUNTIME & CONTENT              │
│ SceneFlow / Save / Assets /         │
│ Content / UI Nav / Time / Random    │
└──────────────────┬──────────────────┘
                   │
┌──────────────────▼──────────────────┐
│ v0.2 CORE SERVICES & SETTINGS       │
│ Settings / Audio / Localization /   │
│ Accessibility / Pause / Capability  │
└──────────────────┬──────────────────┘
                   │
┌──────────────────▼──────────────────┐
│ v0.1 LOCAL MULTIPLAYER FOUNDATION   │
│ Input / Player / Join / Camera /    │
│ Collision / Prototype Room          │
└─────────────────────────────────────┘
```

---

# 6. v0.1 — Local Multiplayer Foundation

目标：

> 两个人可以在一台 Windows PC 上稳定进入同一个 3D 世界并独立操控。

核心：

```text
InputManager
InputDevice
PlayerInputSlot
KeyboardInputDevice
GamepadInputDevice

Player
PlayerController
PlayerMovement
PlayerState

PlayerJoin
SharedCamera
PrototypeRoom
```

---

## 6.1 输入组合

必须覆盖：

```text
Keyboard A + Keyboard B
Keyboard + Gamepad
Gamepad + Keyboard
Gamepad 1 + Gamepad 2
```

---

## 6.2 Player 不知道物理设备

禁止：

```ts
if (KeyCode.W)
```

正确：

```text
Player
 ↓
PlayerCommand
 ↓
InputSource
```

语义输入：

```text
Move
PrimaryAction
SecondaryAction
Interact
SpecialAction
Pause
```

这些名称仍然是中性动作。

---

## 6.3 Camera

PC 默认：

```text
Shared Camera
```

但不得假定所有未来 Genre 一定使用动态中点 Camera。

例如：

```text
格斗
→ 固定场景 Camera

赛车
→ 未来可能决定 Split Screen / Dynamic Camera

经营
→ Shared Free Camera

动作
→ Dynamic Group Camera
```

因此 Camera 采用：

```text
CameraPolicy
```

而不是把一种 Camera 行为硬编码成 Core。

---

# 7. v0.2 — Core Services & Settings

保持 Genre-Agnostic。

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

设置类别：

```text
DISPLAY
GRAPHICS
AUDIO
CONTROLS
GAMEPLAY
ACCESSIBILITY
LANGUAGE
```

---

## 7.1 Settings Framework

```text
SettingDefinition
 ↓
SettingsRegistry
 ↓
SettingsStore
 ↓
SettingsApplier
 ↓
Engine / Platform
```

功能：

```text
Default
Validation
Apply
Cancel
Reset
Schema Version
Migration
Platform Capability
Global / Profile / Player Scope
```

---

## 7.2 亮度

Brightness 默认理解：

```text
In-game Gamma / Exposure
```

不默认修改操作系统显示器亮度。

---

## 7.3 Controls

P1/P2 可分别配置：

```text
Bindings
Vibration
Deadzone
Sensitivity
```

---

# 8. v0.3 — Runtime & Content Foundation

核心：

```text
GameBootstrap
AppState
SceneFlow
Loading
Save
ContentRegistry
AssetService
UINavigation
TimeService
RandomService
FeatureFlags
BuildInfo
Logger
TestLabs
```

---

## 8.1 Scene Flow

统一：

```text
SceneFlowService
```

不允许 Scene 跳转散落在 Gameplay。

---

## 8.2 Save

分离：

```text
Settings
Profile
Session / Game State
```

具体存什么由 Genre Pack 决定。

例如：

```text
Racing
→ Cars / Track unlock

Fighting
→ Characters / Cosmetics

Management
→ Economy / World state

Narrative
→ Story progress
```

Core 只管理：

```text
Snapshot
Serialization
Validation
Migration
Storage
```

---

## 8.3 Content

稳定概念：

```text
ContentId
ContentDefinition
ContentRegistry
ContentValidator
```

可被所有 Genre 使用。

---

# 9. v0.4 — Local Multiplayer Robustness

从 v5 开始不再叫：

```text
Local Co-op Robustness
```

统一：

> **Local Multiplayer Robustness**

因为两人关系可能是：

```text
Cooperative
Competitive
Mixed
Neutral
Temporary Alliance
```

---

## 9.1 Player Presence

```text
Empty
Joining
Ready
Active
Disconnected
Inactive
Spectating
Leaving
```

`Downed` 不再属于 Core 状态，因为格斗/赛车/经营未必存在 Downed。

如果某 Genre 需要，由对应 Pack 扩展。

---

## 9.2 Join / Leave / Reconnect

统一 Player Identity 与 Physical Device 分离。

---

## 9.3 Player Relationship

基础关系：

```text
Self
Player
Partner
Opponent
Team
Neutral
```

游戏决定实际关系。

---

## 9.4 Camera Conflict

不同 Genre 的 Camera 完全不同。

因此 v0.4 只提供：

```text
CameraPolicy interface
PlayerVisibility tracking
Camera target group
```

具体实现作为可替换 Policy。

---

## 9.5 Interaction Arbitration

如果两个人同时作用于同一对象：

```text
Exclusive
Shared
Simultaneous
Competitive
Cooperative
Queued
```

增加：

```text
Competitive
```

以支持：

- 抢道具；
- 抢球；
- 抢载具；
- 格斗场景交互。

---

## 9.6 Ownership / Claim

```text
None
Player1
Player2
Team
Shared
World
```

适合：

```text
Vehicle
Item
Ball
Machine
Resource
Pickup
```

---

## 9.7 Shared UI Ownership

菜单仍需解决：

```text
Who controls this modal?
```

但 Gameplay HUD 可分别提供：

```text
Player1 Context
Player2 Context
Shared Context
```

---

## 9.8 Local Multiplayer Soft-lock Audit

不只检查合作。

还检查：

```text
格斗：
Round 能否永远无法结束？

赛车：
玩家错过 Checkpoint 后能否恢复？

经营：
一方能否锁死唯一关键资源？

动作：
一方能否卡住关卡转换？

通用：
断开设备后是否无法继续？
```

---

# 10. v0.5 — Universal Gameplay Kernel

最后一个强制通用底座。

只保留：

```text
Actor
Identity
State
Action
Interaction
Ownership
Relationship
Tags
Trigger
Condition
Feedback
```

---

## 10.1 Actor

```text
Actor
├─ Identity
├─ Controller
├─ State
├─ Actions
├─ Interaction
├─ Ownership
├─ Relationship
├─ Tags
└─ Presentation
```

Actor 不等于“人形角色”。

它未来也可以代表：

```text
Car
Ball
Machine
Animal
Fighter
Player Character
NPC
```

---

## 10.2 Action

生命周期：

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

Genre 映射：

```text
格斗
PrimaryAction → Punch

赛车
PrimaryAction → Accelerate / context action

经营
PrimaryAction → UseTool

解谜
PrimaryAction → Grab

射击
PrimaryAction → Shoot
```

---

## 10.3 Trigger / Condition / Action

所有 Genre 都可能需要：

```text
Trigger
 ↓
Condition
 ↓
Action
```

例如赛车：

```text
VehicleEnterCheckpoint
 ↓
CorrectSequence
 ↓
AdvanceLap
```

经营：

```text
MachineFinished
 ↓
StorageAvailable
 ↓
ProduceItem
```

格斗：

```text
RoundTimerExpired
 ↓
ScoreCompare
 ↓
EndRound
```

Core 只提供机制，不提供具体业务类型。

---

# 11. Marketable Prototype Gate

v0.5 之后停止继续堆通用系统。

要制作：

```text
Prototype A
Prototype B
Prototype C
```

它们甚至可以是完全不同类型：

```text
A：3D格斗
B：双人赛车
C：双人经营
```

然后由实际体验决定最终方向。

---

## 11.1 Prototype 评价指标

通用指标：

```text
操作是否直觉？
规则是否容易理解？
两人是否持续有事情做？
是否产生互动？
反馈是否明确？
失败是否让人理解原因？
是否愿意继续玩？
是否有独特记忆点？
```

根据类型追加指标。

---

## 11.2 不再强制“合作体验指标”

以前的：

```text
会不会互相救？
会不会互相帮助？
```

现在只有在 Co-op Prototype 中才检查。

Competitive Prototype 则检查：

```text
公平性
可读性
反制
节奏
胜负反馈
```

---

# 12. Genre Packs

Direction Lock 后选择。

---

## 12.1 Fighting Pack

可能包含：

```text
FighterState
Health / RoundHealth
Hitbox
Hurtbox
Attack
Combo
Block
Dodge
Knockback
Stun
Round
Score
Arena
```

---

## 12.2 Racing Pack

可能包含：

```text
Vehicle
VehicleController
Acceleration
Brake
Steering
Drift
Track
Checkpoint
Lap
RacePosition
RespawnToTrack
RaceResult
```

---

## 12.3 Management Pack

可能包含：

```text
Resource
Inventory
Storage
Recipe
Production
Order
Economy
Upgrade
Worker / Machine
Task
```

---

## 12.4 Narrative Pack

只有当游戏真的需要故事时：

```text
StoryState
StoryFlag
Dialogue
Choice
Sequence
Cutscene
Chapter
```

叙事不再是默认产品柱。

---

## 12.5 Combat Pack

适用于动作、射击等：

```text
Health
Damage
Heal
Weapon
Projectile
Status
Invulnerability
Targeting
```

---

## 12.6 Puzzle / Physics Pack

```text
Grab
Carry
Push
Pull
Throw
Joint
Weight
Switch
PhysicsObject
```

---

## 12.7 Sports Pack

```text
Ball / Object
Possession
Score
Round
Field
Rule
Foul / Boundary
MatchResult
```

---

## 12.8 Simulation Pack

按实际玩法增加：

```text
Vehicle
Machine
Physics
Environment
System Simulation
```

---

## 12.9 Roguelike Pack

只有决定做肉鸽后：

```text
Run
Seed
Generation
Loot
Temporary Build
Permanent Unlock
Run Result
```

---

## 12.10 Local Co-op / Social Pack

如果最终确定为合作：

```text
Rescue
Joint Action
Shared Weight
Carry Partner
Cooperative Trigger
Shared Resource
Timed Cooperation
```

合作成为 Pack，而不是 Core。

---

# 13. Network Future Readiness

当前：

```text
NO NETWORKING
```

但保持：

```text
PlayerCommand
InputSource
Actor Authority boundary
Stable Content ID
Deterministic-friendly Random boundary
Time abstraction
```

未来网络化时再决定：

```text
LAN
Peer-to-peer
Host/Client
Dedicated Server
Prediction
Rollback
```

不能现在预判。

尤其：

```text
格斗网络
```

与：

```text
经营网络
```

需要的 Netcode 完全不同。

因此“未来可联网”的正确做法不是现在写 NetworkManager，而是：

> **避免把本地性硬编码进 Gameplay。**

---

# 14. Camera 也必须 Genre-Agnostic

Camera 未来可能：

```text
Shared Group Camera
Fixed Fighting Camera
Vehicle Follow Camera
Top-down Strategy Camera
Free Management Camera
Split Screen
Cinematic Camera
```

所以 Foundation 只负责：

```text
Camera ownership
Camera policy selection
Active player targets
Transition
Accessibility modifiers
```

真正 Camera 行为由 Genre / Game Definition 配置。

---

# 15. UI 体系

UI 同样不能预设游戏类型。

公共 Screen：

```text
Boot
Main Menu
Local Player Join
Settings
Pause
Confirm
Result
Credits
```

Genre Screen：

```text
Fighting
→ Round HUD

Racing
→ Speed / Lap HUD

Management
→ Resource HUD

Narrative
→ Dialogue UI
```

通过：

```text
ViewModel / Presenter
```

与 Gameplay 解耦。

---

# 16. Production Layer

方向确定后：

```text
GameDefinition
```

定义当前产品启用了什么。

例如格斗：

```text
GameDefinition
├─ Genre: Fighting
├─ Players: 2
├─ CameraPolicy: Fighting
├─ FightingPack
├─ Characters
├─ Arenas
├─ UITheme
└─ AudioTheme
```

赛车：

```text
GameDefinition
├─ Genre: Racing
├─ Players: 2
├─ CameraPolicy: Racing
├─ RacingPack
├─ Vehicles
├─ Tracks
└─ RaceRules
```

底层代码相同，启用内容不同。

---

# 17. 3D Content Definitions

## CharacterDefinition

如果游戏存在角色：

```text
id
prefab
presentation
animationProfile
audioProfile
tags
actions
```

## VehicleDefinition

如果做赛车：

```text
id
prefab
mass
handlingProfile
animationProfile
audioProfile
```

## MachineDefinition

如果做经营：

```text
id
prefab
productionProfile
interactionProfile
```

即：

> Definition 类型跟随 Genre Pack 增加，而不是提前全部创建。

---

# 18. Vertical Slice

方向确定并加载对应 Pack 后，制作完整 Vertical Slice。

无论类型，至少：

```text
Boot
 ↓
Main Menu
 ↓
P1/P2 Join
 ↓
进入核心玩法
 ↓
完整一局 / 一个循环
 ↓
胜负 / 成功 / 失败
 ↓
Result
 ↓
Save
 ↓
Return
```

不同 Genre 增加自己的验证：

### Fighting
```text
Character Select
Round
KO / Time Up
Result
```

### Racing
```text
Vehicle Select
Race
Checkpoint
Finish
Result
```

### Management
```text
Start
Produce
Goal
Settlement
Result
```

---

# 19. Foundation Lock

只有 Vertical Slice 完成以后：

```text
FOUNDATION LOCK
```

后续：

> 以内容生产为主。

此时用户主要负责：

```text
选视觉
选角色
选玩法方向
判断体验
筛选资源
```

Codex 负责：

```text
资产处理
配置
Prefab
ContentDefinition
Gameplay Pack 实现
UI 接入
关卡/场景工程
验证
构建
```

---

# 20. Agent 体系修正

将：

```text
coop_systems_engineer
```

概念升级为：

```text
local_multiplayer_systems_engineer
```

职责：

```text
Player Presence
Join / Leave
Device ownership
Relationship
Camera conflicts
Interaction arbitration
Claims
Shared UI
Local multiplayer soft-locks
```

而：

```text
gameplay_kernel_engineer
```

继续保持 Genre-Agnostic。

---

# 21. Asset Pipeline Agent

新增推荐：

```text
asset_pipeline_engineer
```

职责：

```text
External asset intake
License metadata
3D format validation
Blender processing
Scale / orientation normalization
Material validation
Collision generation
Cocos import
Prefab creation
Asset manifest
```

不决定视觉风格。

视觉批准权始终属于用户。

---

# 22. Codex Stop Rule

Codex 在方向确定前不得主动建设：

```text
Fighting Framework
Racing Framework
Narrative Framework
Economy Framework
Combat Framework
Roguelike Framework
Network Framework
```

除非当前 Prototype 明确要求。

判断顺序：

```text
Does current prototype need it?
        │
       YES
        ↓
Implement minimal Pack

       NO
        ↓
Do not build
```

---

# 23. 当前路线

```text
v0.1
Local Multiplayer Foundation
        ↓
v0.2
Core Services & Settings
        ↓
v0.3
Runtime & Content
        ↓
v0.4
Local Multiplayer Robustness
        ↓
v0.5
Universal Gameplay Kernel
        ↓
════════════════════════════
 MARKETABLE PROTOTYPE GATE
════════════════════════════
        ↓
Fighting?
Racing?
Management?
Action?
Puzzle?
Sports?
Narrative?
Hybrid?
        ↓
GAME DIRECTION LOCK
        ↓
选择 Genre Packs
        ↓
VERTICAL SLICE
        ↓
FOUNDATION LOCK
        ↓
CONTENT PRODUCTION
```

---

# 24. 最终优先级

所有工程决策：

```text
FUN / EXPERIENCE
      ↓
PLAYABLE
      ↓
ROBUST
      ↓
GENRE FLEXIBILITY
      ↓
EXTENSIBLE
      ↓
ELEGANT
```

核心准则：

> **玩法类型由 Prototype 决定，而不是由底座决定。**

以及：

> **未来网络化的可能性通过干净的边界保留，而不是通过提前实现网络系统保留。**

以及：

> **3D 是固定技术方向，Genre 不是。**
