# DuoGame — Codex 游戏开发执行体系

> 版本：v0.1  
> 项目阶段：Foundation / Local Co-op Prototype  
> 主平台：Windows PC  
> 引擎：Cocos Creator 3.8.x  
> 语言：TypeScript  
> 核心模式：本地双人单机、同屏、不分屏、P1/P2 可自由选择键盘或手柄  
> 未来方向：在核心玩法成熟后，再评估 Android / iOS / 微信小游戏 / 抖音小游戏 / Steam 等发行形态  
> 当前原则：先做可复用的“双人游戏基础”，暂不决定最终题材、美术、战斗类型和商业化玩法

---

## 1. 文档目的

这份文档同时承担四个作用：

1. **项目章程**：固定当前项目边界，防止 Codex 在长期开发中偏离方向。
2. **Codex 执行规范**：规定 Codex 每次任务如何分析、实现、测试、记录和提交。
3. **Agent / Skill 体系说明**：把“专业角色”和“可重复工作流”拆开管理。
4. **V0.1 实施计划**：把第一个可运行的 PC 本地双人基础版本拆成可验收任务。

本项目不采用“一条 Prompt 让 Codex 做完整游戏”的方式。

采用：

```text
需求
  ↓
项目规则
  ↓
主 Codex 编排
  ↓
必要时委派专业 Agent
  ↓
调用对应 Skill
  ↓
小范围实现
  ↓
自动/静态验证
  ↓
人工试玩
  ↓
修复
  ↓
文档 + Git
```

核心原则：

> **一次只解决一个可验证的问题。**

---

# 2. 当前产品定位

## 2.1 PC 版

PC 是第一开发平台，也是第一完整可玩版本的平台。

PC 版定义：

- 本地双人单机。
- P1、P2 同时存在于同一个 Game World。
- 共用一个屏幕和一套 Camera。
- 不进行左右分屏。
- P1/P2 可以自由选择：
  - 键盘；
  - 手柄；
  - 两套键盘映射；
  - 两个独立手柄。
- 第一版不做网络同步。
- 第一版不做账号、服务器、排行榜、商城。
- 第一版不决定最终游戏类型。

典型结构：

```text
Game World
├─ Player 1
├─ Player 2
├─ Shared Camera
└─ Prototype Environment
```

---

## 2.2 未来移动/小游戏版本

移动端不是 V0.1 的约束条件。

未来可能变成：

```text
PC
├─ P1 + P2 本机
├─ Shared Camera
└─ Keyboard / Gamepad

Mobile / Mini Game
├─ Device A → Local Player A + Own Camera
├─ Device B → Local Player B + Own Camera
└─ Network Transport（未来独立加入）
```

因此当前代码必须做到：

- Game Core 不依赖键盘键值。
- Player 不依赖 Camera。
- Player 不依赖 Windows API。
- 平台特有逻辑放在 Adapter / Platform 层。
- 不提前实现尚未需要的网络抽象细节。

---

# 3. V0.1 的成功标准

V0.1 名称：

> **Local Co-op Foundation**

V0.1 不追求“好玩”，只证明基础可靠。

必须满足：

| 能力 | 验收 |
|---|---|
| Windows 启动 | 必须 |
| P1/P2 同时存在 | 必须 |
| 共用一个 Player Prefab | 必须 |
| P1/P2 独立输入 | 必须 |
| 键盘 + 键盘 | 必须 |
| 键盘 + 手柄 | 必须 |
| 手柄 + 键盘 | 必须 |
| 手柄 + 手柄 | 必须 |
| 共享 Camera | 必须 |
| 基础碰撞 | 必须 |
| 手柄连接状态可感知 | 必须 |
| Windows Build | 必须 |
| Console 无 Error | 必须 |
| 核心文档同步更新 | 必须 |

V0.1 明确不包含：

- 敌人；
- 武器；
- 技能；
- 正式战斗；
- Boss；
- 正式美术；
- 正式音效；
- 网络；
- 手机适配；
- 微信/抖音适配；
- Steam SDK；
- 商业化。

---

# 4. Codex 定制层次

项目采用四层：

```text
AGENTS.md
    ↓
Custom Agents
    ↓
Skills
    ↓
Task Prompt
```

## 4.1 AGENTS.md

只放**长期、全项目有效**的规则：

- 项目是什么；
- 当前不能做什么；
- 架构边界；
- 测试与文档要求；
- 什么时候允许委派 Agent。

不要把每个具体功能的详细步骤都写进去。

---

## 4.2 Custom Agents

Agent 解决：

> **谁来做？**

Agent 是窄职责专业角色，例如：

- 技术架构；
- 玩法；
- 输入；
- Camera/Physics；
- QA；
- 构建发布；
- Code Review。

Agent 不应该成为另一个“万能主 Codex”。

---

## 4.3 Skills

Skill 解决：

> **这类工作以后重复出现时，应该怎么做？**

例如：

- 工程体检；
- 实现一个功能；
- 定位 Bug；
- 做本地双人输入；
- 验收 Camera；
- 更新 Devlog；
- 发布一个 Prototype 版本。

---

## 4.4 Task Prompt

Task Prompt 只包含当前任务：

```text
TASK
CONTEXT
GOAL
REQUIREMENTS
NON-GOALS
ACCEPTANCE
AFTER IMPLEMENTATION
```

不要重复整个项目背景。

---

# 5. 推荐目录

```text
DuoGame/
│
├─ AGENTS.md
├─ README.md
│
├─ .codex/
│  ├─ config.toml
│  └─ agents/
│     ├─ technical-director.toml
│     ├─ game-designer.toml
│     ├─ gameplay-engineer.toml
│     ├─ input-engineer.toml
│     ├─ camera-physics-engineer.toml
│     ├─ ui-ux-engineer.toml
│     ├─ qa-engineer.toml
│     ├─ performance-engineer.toml
│     ├─ build-release-engineer.toml
│     ├─ code-reviewer.toml
│     ├─ documentation-agent.toml
│     └─ platform-porting-engineer.toml
│
├─ .agents/
│  └─ skills/
│     ├─ project-audit/
│     │  └─ SKILL.md
│     ├─ feature-implementation/
│     │  └─ SKILL.md
│     ├─ local-coop-input/
│     │  └─ SKILL.md
│     ├─ player-foundation/
│     │  └─ SKILL.md
│     ├─ player-join/
│     │  └─ SKILL.md
│     ├─ shared-camera/
│     │  └─ SKILL.md
│     ├─ controller-hotplug/
│     │  └─ SKILL.md
│     ├─ prototype-room/
│     │  └─ SKILL.md
│     ├─ bug-root-cause/
│     │  └─ SKILL.md
│     ├─ playtest-gate/
│     │  └─ SKILL.md
│     ├─ code-review-gate/
│     │  └─ SKILL.md
│     ├─ devlog-update/
│     │  └─ SKILL.md
│     └─ prototype-release/
│        └─ SKILL.md
│
├─ docs/
│  ├─ PROJECT.md
│  ├─ ARCHITECTURE.md
│  ├─ CODING_RULES.md
│  ├─ INPUT_DESIGN.md
│  ├─ DECISIONS.md
│  ├─ DEVLOG.md
│  ├─ ROADMAP.md
│  └─ templates/
│     ├─ TASK_TEMPLATE.md
│     ├─ BUG_TEMPLATE.md
│     ├─ RESULT_TEMPLATE.md
│     └─ DEVLOG_TEMPLATE.md
│
└─ assets/
   ├─ core/
   ├─ player/
   ├─ input/
   ├─ camera/
   ├─ gameplay/
   ├─ platform/
   └─ ui/
```

---

# 6. Agent 体系

## 6.1 technical_director

**角色：技术总监 / 架构审核**

负责：

- 系统边界；
- 模块职责；
- 依赖方向；
- 可扩展性；
- 判断某个功能是否需要重构。

不负责：

- 大量直接写功能代码；
- 决定游戏是否好玩；
- 进行风格化美术设计。

V0.1 使用频率：高。

典型调用：

> 先让 technical_director 检查当前 Input → Player → Camera 的依赖关系，再开始修改。

---

## 6.2 game_designer

**角色：系统/玩法设计师**

负责：

- 核心循环；
- 双人协作机制；
- 原型假设；
- 操作复杂度；
- 风险和验证方法。

V0.1 使用频率：低到中。

第一阶段主要用于：

- 判断双人基础交互是否合理；
- 不负责决定最终美术和世界观。

---

## 6.3 gameplay_engineer

**角色：核心玩法工程师**

负责：

- Player；
- Interaction；
- Gameplay State；
- 可复用 Gameplay Component。

要求：

- 不直接绑定物理输入键值；
- 不把 Camera 写入 Player；
- 不复制 P1/P2 两套逻辑。

V0.1 使用频率：高。

---

## 6.4 input_engineer

**角色：输入系统工程师**

这是 V0.1 的核心 Agent。

负责：

- Keyboard；
- Gamepad；
- InputDevice；
- PlayerInputSlot；
- Device assignment；
- hot plug 状态；
- 同时输入冲突。

重点保证四种组合：

```text
Keyboard A + Keyboard B
Keyboard + Gamepad
Gamepad + Keyboard
Gamepad 1 + Gamepad 2
```

V0.1 使用频率：最高。

---

## 6.5 camera_physics_engineer

负责：

- Shared Camera；
- Camera 中心点；
- Zoom；
- smoothing；
- 边界；
- 碰撞；
- Character movement 和 Physics 的交界问题。

V0.1 使用频率：高。

---

## 6.6 ui_ux_engineer

负责：

- Local Co-op 入口；
- Press Any Button；
- P1/P2 Device 状态；
- Ready；
- Controller disconnected 提示；
- Prototype UI。

V0.1 不允许：

- 过度美化；
- 建立复杂 UI Framework；
- 引入正式视觉系统。

---

## 6.7 qa_engineer

**只以验收为目标。**

负责：

- 复现步骤；
- Edge cases；
- Regression；
- 手柄同时输入；
- 热插拔；
- Build 验收；
- Console 错误检查。

默认不直接修改产品代码。

---

## 6.8 performance_engineer

负责：

- GC；
- update 循环；
- 重复分配；
- 过度事件监听；
- 节点生命周期；
- 后续帧率和资源压力。

V0.1 只在出现真实性能问题时调用。

不要过早优化。

---

## 6.9 build_release_engineer

负责：

- Windows 构建；
- 构建配置；
- 版本号；
- Release checklist；
- 后续 Android / Mini Game 构建管线。

V0.1 只负责 Windows。

---

## 6.10 code_reviewer

负责：

- Correctness；
- Regression；
- 架构越界；
- 隐藏 Bug；
- 缺失测试；
- 不必要复杂度。

只报告真实风险，不做纯风格挑错。

---

## 6.11 documentation_agent

负责：

- README；
- ARCHITECTURE；
- INPUT_DESIGN；
- DECISIONS；
- DEVLOG；
- ROADMAP。

特别负责把开发过程转化为以后拍视频可使用的材料。

---

## 6.12 platform_porting_engineer

**V0.1 默认不调用。**

未来负责：

- Android；
- iOS；
- 微信；
- 抖音；
- Steam；
- 输入/Camera/平台能力 Adapter。

禁止它提前把移动端和网络复杂度带进 V0.1。

---

# 7. Agent 编排规则

主 Codex 是 Orchestrator。

不要每个任务都启动全部 Agent。

推荐：

## 小任务

例如：

> 修改 P2 默认按键。

直接由主 Codex 完成。

---

## 中等任务

例如：

> 实现 Shared Camera。

```text
technical_director → 确认边界
camera_physics_engineer → 实现
qa_engineer → 验收
```

---

## 高风险底层任务

例如：

> 重构 Input System。

```text
technical_director
       ↓
input_engineer
       ↓
qa_engineer
       ↓
code_reviewer
```

---

## Bug

```text
qa_engineer / explorer
       ↓
定位复现
       ↓
对应工程 Agent
       ↓
code_reviewer
       ↓
回归测试
```

---

## 不推荐

```text
同时启动 10 个 Agent
↓
每个人都重新扫描工程
↓
重复分析
↓
Token 大量消耗
↓
结论冲突
```

V0.1 推荐同时工作的子 Agent：

> **最多 3～4 个。**

---

# 8. Skill 体系

## 8.1 project-audit

触发：

- 第一次打开项目；
- 接手陌生代码；
- 大版本前体检；
- 用户要求先检查工程。

流程：

1. 读取 AGENTS.md。
2. 读取 PROJECT / ARCHITECTURE / ROADMAP。
3. 检查 Cocos 项目结构。
4. 检查 Git 状态。
5. 定位现有 Scene / Prefab / Script。
6. 报告风险。
7. 不增加玩法。

---

## 8.2 feature-implementation

所有普通功能的默认 Skill。

原则：

1. 先定位现有 ownership。
2. 最小修改。
3. 不顺手重构无关代码。
4. 优先复用现有接口。
5. 修改后验证。
6. 更新受影响文档。
7. 给出人工试玩步骤。

---

## 8.3 local-coop-input

专门处理：

- P1/P2；
- Keyboard；
- Gamepad；
- Device binding；
- Input Slot；
- 同时输入。

关键架构：

```text
Player
  ↓
PlayerInputSlot
  ↓
InputDevice
```

禁止：

```text
Player → KEY_W
Player → GAMEPAD_BUTTON_A
```

---

## 8.4 player-foundation

负责：

- 单一 Player Prefab；
- playerId；
- inputSlot；
- movement；
- state。

必须保证：

> P1/P2 是同一个 Player 实现的两个实例。

---

## 8.5 player-join

负责：

```text
Press Any Button
      ↓
检测 Device
      ↓
绑定到 Player Slot
      ↓
Ready
```

防止：

- 同一手柄同时绑定 P1/P2；
- 同一输入源重复占用；
- 已绑定设备再次 Join。

---

## 8.6 shared-camera

第一版算法：

```text
center = midpoint(P1, P2)
distance = distance(P1, P2)
cameraPosition → smooth(center)
zoom → map(distance)
zoom = clamp(minZoom, maxZoom)
```

必须：

- 平滑；
- 不抖动；
- 有 min/max；
- Player 不知道 Camera 的存在。

---

## 8.7 controller-hotplug

处理：

- controller connected；
- controller disconnected；
- reconnect；
- 当前 Player Slot 状态。

V0.1 只要求：

- 能检测；
- 能提示；
- 恢复后不崩溃。

---

## 8.8 prototype-room

建立最简单测试环境：

- Floor；
- Boundary；
- Obstacles；
- P1 Spawn；
- P2 Spawn。

禁止添加正式美术。

---

## 8.9 bug-root-cause

所有 Bug 优先走该 Skill。

格式：

```text
Observed
Expected
Reproduction
Evidence
Root Cause
Minimal Fix
Regression Risk
Verification
```

禁止第一反应使用：

- arbitrary delay；
- 重试；
- try/catch 吞错误；
- 特判；
- 大量 null guard

去掩盖真实根因。

---

## 8.10 playtest-gate

每个阶段完成后：

- 双键盘；
- 键盘 + 手柄；
- 双手柄；
- 同时移动；
- Camera；
- 碰撞；
- Controller disconnect；
- Restart；
- Console。

形成明确 PASS / FAIL。

---

## 8.11 code-review-gate

进入版本 Tag 前调用。

检查优先级：

1. Correctness。
2. Regression。
3. 架构越界。
4. Missing validation。
5. Complexity。
6. Style。

Style 不是最高优先级。

---

## 8.12 devlog-update

记录：

- 今天做什么；
- 为什么；
- 两个人的设计分歧；
- Codex 实现方式；
- Bug；
- Root Cause；
- 结果；
- 下一步。

这既是工程记录，也是以后视频素材。

---

## 8.13 prototype-release

只在某版本达到所有 Acceptance 后触发。

步骤：

1. Clean working tree。
2. Build。
3. Smoke test。
4. Console check。
5. QA gate。
6. 文档同步。
7. CHANGE / DEVLOG。
8. Tag。

---

# 9. V0.1 完整执行计划

## Task 0 — Project Audit & Foundation

### Goal

建立干净项目和文档体系。

### Agent

- technical_director
- documentation_agent

### Skill

- project-audit

### 输出

```text
README.md
AGENTS.md
docs/PROJECT.md
docs/ARCHITECTURE.md
docs/CODING_RULES.md
docs/INPUT_DESIGN.md
docs/DECISIONS.md
docs/DEVLOG.md
docs/ROADMAP.md
```

### Acceptance

- Cocos 项目可打开；
- 空 Scene 可运行；
- Console 无 Error；
- Git 状态明确；
- 文档存在。

建议 Commit：

```text
chore: initialize project foundation
```

---

# Task 1 — Input Abstraction

### Goal

建立与 Player 解耦的输入系统。

### Agent

- technical_director
- input_engineer
- qa_engineer

### Skill

- local-coop-input

### 建议结构

```text
InputManager
InputDevice
KeyboardInputDevice
GamepadInputDevice
PlayerInputSlot
```

逻辑：

```text
Player
   ↓
PlayerInputSlot
   ↓
InputDevice
```

### Acceptance

Player 只能访问类似：

```text
getMoveVector()
isPrimaryPressed()
isSecondaryPressed()
isInteractPressed()
```

不能读取：

```text
W
A
S
D
Arrow
Gamepad Button
```

建议 Commit：

```text
feat: add local input abstraction
```

---

# Task 2 — Player Foundation

### Agent

- gameplay_engineer
- qa_engineer

### Skill

- player-foundation

### 建立

```text
Player.prefab
PlayerController.ts
PlayerMovement.ts
PlayerState.ts
```

### Acceptance

- 只有一个 Player Prefab；
- P1/P2 为两个实例；
- playerId 不影响核心 movement 代码；
- Input Slot 可注入。

Commit：

```text
feat: add reusable player foundation
```

---

# Task 3 — Dual Player Movement

### Goal

让两个玩家在 Prototype Scene 独立移动。

### Agent

- gameplay_engineer
- input_engineer
- qa_engineer

### Acceptance

- P1 移动不影响 P2；
- P2 移动不影响 P1；
- 同时输入正常；
- 键盘 A/B 不冲突；
- Console 无 Error。

Commit：

```text
feat: add independent dual-player movement
```

---

# Task 4 — Player Join / Device Assignment

### Agent

- input_engineer
- ui_ux_engineer
- qa_engineer

### Skill

- player-join

### UI

```text
LOCAL CO-OP

P1  Press Any Button
P2  Press Any Button
```

设备触发后：

```text
Device
 ↓
Player Slot
 ↓
READY
```

### Acceptance

- 同一设备不能同时占用两个 Slot；
- 两个设备都 Ready 后可进入 Prototype；
- 可识别 Keyboard / Gamepad。

Commit：

```text
feat: add local player join and device assignment
```

---

# Task 5 — Shared Camera

### Agent

- camera_physics_engineer
- qa_engineer

### Skill

- shared-camera

### Acceptance

- Camera 跟随两人中心点；
- 两人拉开时 Zoom Out；
- 靠近时 Zoom In；
- min/max 正常；
- 平滑；
- 无明显抖动；
- Camera 不写入 Player。

Commit：

```text
feat: add shared local-coop camera
```

---

# Task 6 — Controller Hot Plug

### Agent

- input_engineer
- ui_ux_engineer
- qa_engineer

### Skill

- controller-hotplug

### Acceptance

游戏中拔掉手柄：

```text
Controller disconnected
```

重新连接后：

- 游戏不崩；
- InputManager 状态正确；
- 玩家不会错误占用另一 Device。

Commit：

```text
feat: handle controller connection state
```

---

# Task 7 — Prototype Room

### Agent

- gameplay_engineer
- camera_physics_engineer
- qa_engineer

### Skill

- prototype-room

场景只包括：

```text
Floor
Walls
Simple Obstacles
Player Spawn A
Player Spawn B
```

### Acceptance

- Player 不穿边界；
- 基础碰撞稳定；
- Camera 工作；
- 两个玩家可同时移动。

Commit：

```text
feat: add local-coop prototype room
```

---

# Task 8 — V0.1 Gate & Release

### Agent

- qa_engineer
- code_reviewer
- build_release_engineer
- documentation_agent

### Skill

- playtest-gate
- code-review-gate
- devlog-update
- prototype-release

### Gate

全部通过：

```text
Windows startup                 PASS
Keyboard + Keyboard             PASS
Keyboard + Gamepad              PASS
Gamepad + Keyboard              PASS
Gamepad + Gamepad               PASS
Simultaneous movement           PASS
Shared camera                   PASS
Collision                       PASS
Hot plug detection              PASS
Console                         PASS
Windows build                   PASS
Docs                            PASS
```

然后：

```text
git tag v0.1.0
```

---

# 10. 标准 Feature Task 模板

```md
# TASK
实现共享 Camera。

## CONTEXT
这是一个 Cocos Creator 3.8.x + TypeScript 项目。
Windows First。
PC 本地双人。
P1/P2 共用同一个 Camera。

先阅读：
- AGENTS.md
- docs/PROJECT.md
- docs/ARCHITECTURE.md
- docs/CODING_RULES.md

## GOAL
Camera 始终以 P1/P2 中心区域为目标，并根据两人距离调整视野。

## REQUIREMENTS
1. Camera 逻辑不能进入 Player。
2. Camera 变化需要平滑。
3. 必须有 minZoom / maxZoom。
4. 不引入第三方库。
5. 保持现有输入系统不变。

## NON-GOALS
不要实现：
- 网络；
- 手机 Camera；
- 分屏；
- 敌人；
- 战斗；
- 正式美术。

## ACCEPTANCE
1. P1 移动时 Camera 正确响应。
2. P2 移动时 Camera 正确响应。
3. 两人远离自动 Zoom Out。
4. 两人靠近自动 Zoom In。
5. 无明显抖动。
6. Console 无 Error。

## AFTER IMPLEMENTATION
1. 运行可执行的验证。
2. 列出修改文件。
3. 说明架构影响。
4. 更新必要文档。
5. 给出人工试玩步骤。
6. 不修改与本任务无关代码。
```

---

# 11. 标准 Bug 模板

```md
# BUG
两个 Gamepad 同时连接时，Player2 偶尔失去摇杆输入。

## EXPECTED
P1/P2 应该可以同时稳定移动。

## ACTUAL
P1 正常。
P2 偶发停止响应。

## REPRODUCTION
1. 启动游戏。
2. 连接两个手柄。
3. P1 绑定 Gamepad1。
4. P2 绑定 Gamepad2。
5. 两人持续同时操作。
6. 观察 P2。

## REQUIREMENT
先找 Root Cause。
不要通过延迟、重复轮询或吞错误绕过。

## OUTPUT
- Root Cause
- Fix
- Regression Risk
- Verification
```

---

# 12. 标准任务结果

Codex 每次完成任务必须尽量按以下结构返回：

```text
RESULT

Implemented:
-

Changed files:
-

Architecture impact:
-

Validation performed:
-

Known issues:
-

Manual testing required:
-

Docs updated:
-

Next recommended task:
-
```

---

# 13. CODING RULES 核心版

必须长期坚持：

1. 使用 TypeScript。
2. Player 不直接读取物理按键。
3. P1/P2 共用 Player 实现。
4. 不创建 Player1Controller / Player2Controller 两套业务逻辑。
5. Input、Player、Camera 解耦。
6. 平台代码不进入 Gameplay。
7. V0.1 不加入网络。
8. V0.1 不加入正式美术。
9. 优先使用 Cocos 自带能力。
10. 新生产依赖必须有明确理由。
11. 一个类保持明确职责。
12. 不进行与当前 Task 无关的大重构。
13. Bug 优先查根因。
14. 修改架构时同步 ARCHITECTURE.md。
15. 重要决定同步 DECISIONS.md。
16. 完成 Task 后同步 DEVLOG.md。
17. Windows 为第一验证平台。
18. 没有真实性能问题时不要过早优化。
19. 不为“未来可能需要”提前创建复杂系统。
20. 可删除的临时代码必须在版本 Gate 前清理。

---

# 14. Git 方案

个人项目不需要复杂 Git Flow。

默认：

```text
main
```

功能完成且处于可工作状态后 Commit。

推荐：

```text
chore: initialize project foundation
feat: add local input abstraction
feat: add reusable player foundation
feat: add independent dual-player movement
feat: add player join flow
feat: add shared camera
feat: handle controller reconnect
feat: add prototype room
fix: resolve duplicate device assignment
docs: update v0.1 architecture
```

版本：

```text
v0.1.0
v0.2.0
v0.3.0
```

不要为了看起来专业而增加无意义分支复杂度。

---

# 15. Devlog 与内容创作同步

本项目的特殊目标：

> 游戏开发过程本身也是内容资产。

因此 DEVLOG 不只是程序日志。

建议每次记录：

```md
## Date

### Goal
今天要解决什么？

### Design Discussion
两个人的意见分别是什么？

### Decision
最后为什么这样做？

### Codex Task
交给 Codex 的任务是什么？

### Implementation
Codex 最终怎么实现？

### Problems
第一次运行发生了什么？

### Root Cause
问题为什么发生？

### Result
最后效果怎样？

### Footage Markers
有哪些画面值得剪进视频？

### Next
下一步做什么？
```

推荐录制节点：

```text
讨论
↓
最终需求
↓
Codex 开始工作
↓
关键 Diff
↓
第一次运行
↓
Bug
↓
修复
↓
成功试玩
↓
两人评价
```

不要把几个小时滚代码当成主要内容。

真正有价值的是：

> 决策 → 实现 → 失败 → 修正 → 游戏变化。

---

# 16. V0.2 以后如何进入真正玩法

V0.1 完成后，先不要马上做“大游戏”。

建议 V0.2 建立最抽象 Action：

```text
Move
PrimaryAction
SecondaryAction
Interact
```

不要一开始写死：

```text
Shoot
SwordAttack
Magic
```

然后可以快速做多个玩法实验：

```text
Prototype A：射击
Prototype B：近战
Prototype C：推拉/合作解谜
Prototype D：经营+动作
```

通过两个人实际试玩选择方向。

---

# 17. 什么时候开始考虑微信/抖音/手机

满足以下条件再进入平台适配：

1. PC 基础稳定。
2. 已经形成至少一个完整核心循环。
3. 两个人愿意连续玩。
4. 陌生测试者能理解玩法。
5. 玩法不依赖 PC 专属能力。
6. 已经确定移动端值得做。

届时由：

```text
platform_porting_engineer
```

先做 Port Readiness Audit：

```text
Input
Camera
Aspect Ratio
Touch
Networking
Platform API
Asset Size
Build
Performance
```

然后再决定具体改造。

---

# 18. Agent 与 Skill 的使用边界

简单判断：

## Agent

如果问题是：

> “应该让哪个专业角色处理？”

使用 Agent。

例如：

- 输入 bug → input_engineer
- Camera 抖动 → camera_physics_engineer
- 架构争议 → technical_director

## Skill

如果问题是：

> “这类工作应该按什么流程重复执行？”

使用 Skill。

例如：

- 查 Bug → bug-root-cause
- 发 Prototype → prototype-release
- 更新日志 → devlog-update

## 普通 Task

如果只改：

- 一个默认值；
- 一行文本；
- 一个小 UI 间距；

主 Codex 直接做。

不要为了“多 Agent”而多 Agent。

---

# 19. 推荐的 Agent 使用优先级

## V0.1 核心

1. input_engineer
2. gameplay_engineer
3. technical_director
4. camera_physics_engineer
5. qa_engineer
6. code_reviewer
7. build_release_engineer
8. documentation_agent

## 按需

- ui_ux_engineer
- performance_engineer

## 后置

- game_designer（真正进入玩法实验后升高）
- platform_porting_engineer

---

# 20. Token / 上下文控制规则

为了避免 Agent 系统反而拖慢 Codex：

1. AGENTS.md 保持短。
2. 详细流程放 Skill。
3. Task Prompt 不重复 Skill 全文。
4. 一次最多委派必要的 Agent。
5. Reviewer 默认只读。
6. Explorer/QA 先收集证据，不重复实现。
7. 一个 Agent 只负责一个明确输出。
8. 没有并行价值时不要启动子 Agent。
9. V0.1 不同时研究未来五个平台。
10. 任务完成后用文档沉淀，而不是每次重新解释背景。

---

# 21. 第一次正式执行指令

项目环境建立完成以后，可以把下面这段直接交给 Codex：

```text
你正在接手 DuoGame 项目。

第一阶段目标不是制作完整游戏，而是建立 Windows PC 本地双人游戏基础框架。

请先执行 Project Foundation / Task 0。

首先阅读仓库根目录 AGENTS.md。

然后：
1. 检查当前 Cocos Creator 工程结构和 Git 状态。
2. 不实现任何游戏玩法。
3. 建立或完善 docs/PROJECT.md、ARCHITECTURE.md、CODING_RULES.md、
   INPUT_DESIGN.md、DECISIONS.md、DEVLOG.md、ROADMAP.md。
4. 确认当前项目可以运行基础 Scene。
5. 记录发现的问题和风险。
6. 给出 Task 1 Input Abstraction 的建议边界。
7. 不进行与 Task 0 无关的重构。

如果有必要，可以委派 technical_director 对架构边界做只读检查，
并让 documentation_agent 负责文档整理。

完成后使用 RESULT 模板返回。
```

---

# 22. 推荐开发节奏

不要按“七天必须完成多少功能”强压。

按 Gate：

```text
Task 0 PASS
↓
Task 1
↓
PASS
↓
Task 2
↓
PASS
...
```

每一个 PASS 都能形成一次内容素材。

开发质量优先于任务数量。

---

# 23. V0.1 结束后的状态

当 v0.1.0 完成时，我们应该拥有的不是“一个游戏”。

而是：

> **一个干净、可靠、可以不断往里面试玩法的本地双人游戏实验底座。**

此时再讨论：

- 射击；
- 动作；
- 肉鸽；
- 合作解谜；
- 经营；
- Boss；
- 世界观；
- 美术；
- 商业化；

成本会明显更低。

---

# 24. 最终工作关系

```text
你 + 搭档
│
├─ 提出问题
├─ 试玩
├─ 判断好不好玩
└─ 决定方向
        ↓
主 Codex
│
├─ 读取 AGENTS.md
├─ 判断是否需要 Agent
├─ 选择 Skill
├─ 执行 / 编排
├─ 验证
└─ 汇总
        ↓
专业 Agents
│
├─ Technical Director
├─ Game Designer
├─ Gameplay Engineer
├─ Input Engineer
├─ Camera/Physics Engineer
├─ UI/UX Engineer
├─ QA Engineer
├─ Performance Engineer
├─ Build/Release Engineer
├─ Code Reviewer
├─ Documentation Agent
└─ Platform Porting Engineer
        ↓
Skills
│
├─ Project Audit
├─ Feature Implementation
├─ Local Co-op Input
├─ Player Foundation
├─ Player Join
├─ Shared Camera
├─ Controller Hot Plug
├─ Prototype Room
├─ Bug Root Cause
├─ Playtest Gate
├─ Code Review Gate
├─ Devlog Update
└─ Prototype Release
```

一句话概括：

> **人决定“做什么和好不好玩”，主 Codex 决定“怎么组织工作”，专业 Agent 负责特定领域，Skill 负责重复流程。**

---

# 25. 本包中的可直接使用文件

本执行包已经同步提供：

- `AGENTS.md`
- `.codex/config.toml`
- `.codex/agents/*.toml`
- `.agents/skills/*/SKILL.md`
- `docs/templates/*.md`

建议把这些文件复制到实际 Cocos 项目根目录，再根据真实工程结构做第一次 Project Audit。

---

# 26. Codex 定制结构参考

本方案按 Codex 当前项目级定制方式组织：

- 项目长期规则：`AGENTS.md`
- 项目自定义 Agent：`.codex/agents/*.toml`
- 项目 Skills：`.agents/skills/<skill>/SKILL.md`
- Skill 使用 `name` / `description` 元数据，具体工作流按需加载
- 子 Agent 用于边界明确、可以委派的专业任务

参考文档：

- OpenAI — AGENTS.md custom instructions  
  https://developers.openai.com/docs/agent-configuration/agents-md
- OpenAI — Subagents  
  https://developers.openai.com/docs/agent-configuration/subagents
- OpenAI — Build skills  
  https://developers.openai.com/docs/build-skills
- OpenAI — Customization overview  
  https://developers.openai.com/docs/customization/overview

---

# 27. 当前唯一优先级

现在不要开始：

- 敌人；
- 枪；
- 技能；
- 美术；
- 微信；
- 抖音；
- 手机联网。

第一个里程碑只有：

> **两个人坐在一台 Windows PC 前，用任意合理的键盘/手柄组合，稳定控制两个共享屏幕中的角色。**

做到这一点，再开始丰满游戏。
