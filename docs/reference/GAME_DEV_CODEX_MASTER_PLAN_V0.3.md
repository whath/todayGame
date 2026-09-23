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


---

# 28. 底座扩展原则：从“本地双人框架”升级为“可持续扩展的游戏基础层”

在 v0.1 Local Co-op Foundation 完成后，不直接进入武器、敌人、Boss。

新增一个基础里程碑：

> **v0.2 — Core Services & Settings Foundation**

目标不是堆功能，而是补齐以后每种游戏几乎都会反复使用的底层服务。

新增底座：

```text
Game Foundation
│
├─ App / Boot
├─ Scene Flow
├─ Input
├─ Local Players
├─ Camera
├─ Settings
├─ Save / Profile
├─ Audio
├─ Localization
├─ Accessibility
├─ Pause / Focus
├─ Platform Capability
├─ Diagnostics
└─ UI Foundation
```

这些系统必须满足：

1. 玩法代码不直接访问平台 API。
2. 设置项可以注册，而不是全部写死在 Settings Menu。
3. 设置值和设置 UI 分离。
4. 支持默认值、校验、保存、迁移、恢复默认值。
5. 某个平台不支持某设置时，可自动隐藏或禁用。
6. P1/P2 私有设置和全局设置能够区分。
7. 新增设置尽量不需要修改旧菜单逻辑。
8. 不为尚未需要的功能实现复杂后端。

---

# 29. Core Services 总体结构

推荐：

```text
AppRoot
│
├─ GameBootstrap
│
├─ SceneFlowService
│
├─ SettingsService
│  ├─ SettingsRegistry
│  ├─ SettingsStore
│  ├─ SettingsPersistence
│  ├─ SettingsMigration
│  └─ SettingsAppliers
│
├─ SaveService
├─ AudioService
├─ LocalizationService
├─ PlatformCapabilityService
├─ PauseService
├─ PlayerManager
├─ InputManager
└─ DiagnosticsService
```

核心约束：

> Gameplay 只能使用这些服务公开的语义接口，不能直接操作系统窗口、文件路径、物理按键或平台 SDK。

---

# 30. Settings Framework

Settings 不等于一个菜单页面。

真正的设置系统分成五层：

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

并配套：

```text
SettingsPersistence
SettingsMigration
SettingsMenu
PlatformCapabilityService
```

---

# 31. SettingDefinition 设计

建议每一个设置都通过数据定义注册。

概念结构：

```ts
interface SettingDefinition<T> {
    id: string;
    category: SettingCategory;
    defaultValue: T;

    scope: "global" | "profile" | "player";

    applyMode:
        | "live"
        | "onApply"
        | "restartRequired";

    valueType:
        | "boolean"
        | "number"
        | "enum"
        | "binding";

    min?: number;
    max?: number;
    step?: number;

    options?: SettingOption[];

    capability?: string;

    validate?: (value: T) => T;
}
```

重点不是具体 TypeScript 形式，而是这些能力：

- 唯一 ID；
- 默认值；
- 分类；
- Scope；
- Apply 模式；
- 校验；
- 平台能力要求；
- UI 元数据。

Settings Menu 通过 Registry 获取定义。

以后新增：

```text
graphics.brightness
audio.musicVolume
controls.p1.vibration
accessibility.reduceScreenShake
```

不应该重新修改整个 Settings 页面。

---

# 32. Settings 生命周期

推荐：

```text
Game Boot
   ↓
Load persisted settings
   ↓
Read schemaVersion
   ↓
Migrate if necessary
   ↓
Validate / clamp
   ↓
Fill missing defaults
   ↓
Check platform capabilities
   ↓
Apply settings
   ↓
Enter Main Menu
```

设置修改：

```text
Committed Settings
       ↓
Working Copy
       ↓
Player changes option
       ↓
Preview (if safe)
       ↓
Apply
       ↓
Validate
       ↓
Persist
       ↓
Committed Settings
```

Cancel：

```text
Working Copy
   ↓
Discard
   ↓
Restore committed values
```

---

# 33. 高风险显示设置必须支持 Revert

例如：

- 分辨率；
- 显示器；
- Fullscreen mode。

不能玩家点一次就永久保存。

使用：

```text
Apply new display config
      ↓
15-second confirmation
      ↓
Keep Changes?
   /       \
 YES       NO / Timeout
  ↓            ↓
Save        Revert
```

以后 PC 正式版必须具备。

---

# 34. “亮度”应该如何实现

游戏里的 Brightness 不应该理解为：

> 修改 Windows 显示器硬件亮度。

默认定义：

> **游戏画面 Gamma / Exposure 调节。**

原因：

- 跨平台一致；
- 不依赖显示器控制协议；
- 不修改用户系统设置；
- 微信/抖音/Steam 更容易分别适配。

设置：

```text
Display
└─ Brightness
```

第一版建议范围：

```text
0–100 UI
↓
映射到内部 gamma / exposure range
```

菜单中提供校准图：

```text
[暗部图案] [中灰图案] [亮部图案]

“调整直到左侧图案刚好可见”
```

如果当前渲染管线暂时不能可靠提供 Gamma/Exposure：

- SettingDefinition 可以先存在；
- Capability 为 false；
- UI 不展示；
- 不要造假实现。

---

# 35. 主流 PC 游戏设置分类

建议正式设置页分成：

```text
DISPLAY
GRAPHICS
AUDIO
CONTROLS
GAMEPLAY
ACCESSIBILITY
LANGUAGE
```

不是所有项目必须全部显示。

由 Setting Registry + Capability 决定。

---

# 36. Display 设置

基础推荐：

```text
Display Mode
Resolution
Monitor
VSync
Frame Rate Limit
Brightness / Gamma
UI Scale
```

Display Mode：

```text
Windowed
Borderless
Fullscreen
```

Resolution 示例：

```text
1280×720
1600×900
1920×1080
2560×1440
3840×2160
```

不能把列表写死。

必须来自平台能力层：

```text
PlatformCapabilityService.getSupportedResolutions()
```

Frame Rate：

```text
30
60
90
120
144
165
240
Unlimited
```

实际菜单应该过滤掉无意义选项。

例如目标显示器/平台只有 60Hz 时，不需要假装所有档位都有实际价值。

---

# 37. Graphics 设置

由于最终游戏类型未知，Graphics 必须采用“能力注册”而不是提前承诺所有画质功能。

常见定义：

```text
Quality Preset
Render Scale
Anti-Aliasing
Shadow Quality
Texture Quality
Effects Quality
Post Processing
Bloom
Motion Blur
Particle Density
```

Preset：

```text
Low
Medium
High
Ultra
Custom
```

但只有真正存在相应渲染功能时才开放。

例如 2D 项目没有 Shadow Quality：

> 不显示。

不要为了看起来像 3A 游戏而制造无意义选项。

---

# 38. Audio 设置

建议从底座阶段就建立 AudioMixer 概念。

逻辑 Bus：

```text
Master
├─ Music
├─ SFX
├─ UI
├─ Voice
└─ Ambience
```

初期至少：

```text
Master Volume
Music Volume
SFX Volume
UI Volume
Mute When Unfocused
```

未来根据游戏增加：

```text
Voice Volume
Dynamic Range
Mono Audio
Audio Output Device
```

Gameplay 不允许：

```text
直接 AudioSource.volume = 0.37
```

应该通过：

```text
AudioService
```

进行类别控制。

---

# 39. Controls 设置

Controls 是本项目核心。

设置页需要区分：

```text
PLAYER 1
PLAYER 2
```

未来可能包括：

```text
Device
Key Bindings
Gamepad Bindings
Stick Deadzone
Trigger Deadzone
Sensitivity
Invert X
Invert Y
Vibration
Hold / Toggle
```

建议设置语义 Action：

```text
Move
PrimaryAction
SecondaryAction
Interact
Pause
```

绑定到物理输入：

```text
Action
 ↓
Binding
 ↓
Keyboard / Gamepad
```

不要把“W”本身当成游戏动作。

---

# 40. Rebinding 规则

按键重绑定必须预留冲突处理：

```text
玩家绑定 F 到 PrimaryAction

F 已经属于 Interact
        ↓
Conflict Dialog

Swap
Unbind Old
Cancel
```

需要保留：

```text
Restore Default Bindings
```

P1/P2 Keyboard Profile 可以分别恢复。

---

# 41. Gamepad 推荐设置

底座应预留：

```text
Vibration
Inner Deadzone
Outer Deadzone
Stick Sensitivity
Trigger Threshold
Invert Axis
```

第一阶段不一定全部开放。

推荐首批：

```text
Vibration
Deadzone
```

Deadzone 对不同手柄兼容非常重要。

---

# 42. Gameplay 设置

由于玩法还未确定，只建立分类，不提前创建大量无意义设置。

可以先拥有：

```text
Pause When Window Loses Focus
Tutorial Hints
Confirm Destructive Actions
```

未来按玩法增加：

```text
Difficulty
Aim Assist
Auto Sprint
Auto Reload
Hold / Toggle
Damage Numbers
Camera Follow Strength
```

玩法设置必须通过 Registry 动态增加。

---

# 43. Accessibility 设置

Accessibility 是底座能力，而不是最后发布前临时补。

建议预留：

```text
Subtitles
Subtitle Size
Subtitle Background
Subtitle Background Opacity
UI Scale
High Contrast UI
Reduce Screen Shake
Reduce Flashing
Disable Motion Blur
Color Communication Alternatives
Hold → Toggle Options
```

原则：

> 不要只靠颜色传递关键玩法信息。

例如：

```text
P1 = 蓝色
P2 = 橙色
```

以后还应该通过：

- 轮廓；
- 图标；
- 名字；
- 形状；

提供辅助区分。

字幕设置至少要支持：

- 开关；
- 大小；
- 背景；
- 背景透明度；

如果未来游戏有重要音频提示，可以进一步做 Caption。

---

# 44. Camera Accessibility

Shared Camera 未来增加：

```text
Screen Shake
Camera Smoothing
Camera Zoom Effects
Flash Effects
Motion Effects
```

建议：

```text
Screen Shake:
0–100

Reduce Screen Shake:
On / Off
```

最终有效值可由两者共同决定。

例如：

```text
effectiveShake =
baseShake
× userShakeMultiplier
× accessibilityMultiplier
```

Camera gameplay code 不应该到处判断：

```text
if (reduceShake)
```

---

# 45. Language / Localization

底座建议建立 LocalizationService，即使第一版只有中文。

不要把 UI 文本直接全部写死：

```text
"设置"
"退出"
"继续游戏"
```

建议：

```text
menu.settings
menu.quit
menu.continue
```

第一阶段：

```text
zh-CN
```

未来：

```text
en-US
ja-JP
...
```

这样 Steam / 海外发行不会进行全项目文本手术。

---

# 46. Save / Profile 与 Settings 的关系

Settings 和 Game Save 必须分开。

```text
Settings
├─ Graphics
├─ Audio
├─ Controls
└─ Accessibility

Game Save
├─ Progress
├─ Unlocks
├─ Statistics
└─ Run Data
```

不能：

```text
savegame.json
```

里面混合所有内容。

建议：

```text
settings.json
profile_1.json
```

或者通过统一 Persistence Service 使用逻辑 Namespace。

---

# 47. Settings Schema Version

所有持久化设置必须保存：

```text
schemaVersion
```

示例：

```json
{
  "schemaVersion": 3,
  "display": {},
  "audio": {},
  "controls": {}
}
```

升级游戏时：

```text
v1 settings
 ↓
migration
 ↓
v2
 ↓
migration
 ↓
v3
```

禁止简单删除老玩家设置。

---

# 48. Settings Validation

任何外部持久化数据都视为不可信。

例如：

```text
musicVolume = 999999
```

载入时：

```text
clamp 0–100
```

非法 enum：

```text
"fullscreenMode": "banana"
```

回退：

```text
defaultValue
```

坏配置不能导致游戏无法启动。

---

# 49. Safe Mode

PC 正式开发阶段建议增加：

```text
Safe Settings Boot
```

如果上次运行：

- 显示初始化失败；
- 配置读取失败；
- 非法画质参数；

可以回退：

```text
1280×720 Windowed
60 FPS
Medium/Low safe graphics
Default controls
```

不影响玩家存档。

---

# 50. Platform Capability Service

这是未来跨平台最重要的新底座之一。

接口概念：

```text
supportsFullscreen
supportsResolutionSwitch
supportsVSync
supportsRenderScale
supportsGamepad
supportsVibration
supportsKeyboard
supportsTouch
supportsGammaControl
supportsFileStorage
```

Settings Menu：

```text
SettingDefinition
      ↓
Capability check
      ↓
Supported?
 /         \
yes        no
↓          ↓
show    hide/disable
```

未来：

```text
Windows
Android
iOS
WeChat
Douyin
```

只修改 Platform Adapter。

不要到处：

```ts
if (sys.platform === ...)
```

---

# 51. 设置 Apply 策略

每个 SettingDefinition 标记：

```text
live
onApply
restartRequired
```

例如：

### Live

```text
Master Volume
Music Volume
Brightness
Screen Shake
```

立即预览。

### On Apply

```text
Resolution
Display Mode
Graphics Preset
```

点击 Apply 执行。

### Restart Required

只对确实无法热切换的功能使用。

UI：

```text
Restart required
```

不要所有设置修改都要求重启。

---

# 52. Restore Defaults

设置页必须支持：

```text
Reset Category
Reset All
Restore Default Controls
```

但危险操作需要确认。

例如：

```text
Reset all settings?
```

不影响：

```text
Game Save
Achievements
Progress
```

---

# 53. Settings UI 推荐结构

PC 第一版：

```text
SETTINGS

[Display]
[Graphics]
[Audio]
[Controls]
[Gameplay]
[Accessibility]
[Language]

--------------------------------

Display Mode       < Borderless >
Resolution         < 1920x1080 >
VSync              [ ON ]
Frame Limit        < 120 >
Brightness         -----●----

--------------------------------

[Reset Category]      [Apply]
[Cancel]              [Back]
```

底部显示：

```text
setting description
```

例如：

> Reduce Screen Shake  
> Reduces non-essential camera movement during impacts and explosions.

---

# 54. Auto-generated Settings UI

为了开放性，推荐让 Settings UI 由 Definition 驱动。

```text
SettingDefinition.boolean
 ↓
ToggleControl

SettingDefinition.number
 ↓
SliderControl

SettingDefinition.enum
 ↓
SelectorControl

SettingDefinition.binding
 ↓
BindingControl
```

这样以后新增设置：

```ts
registry.register(new SettingDefinition(...))
```

Settings Menu 自动生成或半自动生成。

对于特殊设置允许 Custom Renderer。

---

# 55. Settings Transaction

禁止 Slider 每变化一次就立即写磁盘。

推荐：

```text
UI
 ↓
WorkingSettings
 ↓
Preview
 ↓
Apply
 ↓
Persistence.save()
```

写磁盘：

- Apply；
- Back 时自动保存安全设置；
- Game exit；
- debounce。

不要每一帧/每个 slider tick 写存储。

---

# 56. Event 传播

推荐：

```text
SettingsService.onChanged(settingId)
```

对应系统订阅：

```text
AudioService
GraphicsService
CameraService
UIService
InputService
```

但不要建立全局 EventBus 滥用。

优先：

- 清晰的 typed event；
- 明确 ownership；
- 生命周期可解除订阅。

---

# 57. Diagnostics / Debug Settings

开发版建议预留：

```text
Developer Menu
```

只在 Development Build 出现：

```text
FPS
Frame Time
Player Input State
Connected Gamepads
Player Slot Ownership
Camera Target/Zoom
Current Scene
Settings Dump
Reset Settings
```

正式 Release 默认关闭。

这会显著提升 Codex Debug 和视频展示效率。

---

# 58. Pause / Focus Service

PC 游戏基础应支持：

```text
ESC → Pause
Window loses focus
Controller disconnect
```

但“失焦是否自动暂停”必须成为 Setting：

```text
Pause When Unfocused
```

不要把：

```text
game.pause()
```

散落在多个 UI 脚本。

统一：

```text
PauseService
```

---

# 59. Audio Focus

建议：

```text
Mute When Unfocused
```

与 Pause 分离。

玩家可能希望：

```text
游戏失焦
但音乐继续
```

或者：

```text
游戏失焦
全部静音
```

AudioService 根据 Settings 处理。

---

# 60. Settings Agent

新增：

```text
settings_engineer
```

职责：

- Settings Registry；
- Settings Store；
- Persistence；
- Migration；
- Apply/Preview/Revert；
- Setting schema；
- capability；
- Settings UI 数据接口。

不负责：

- 决定游戏玩法；
- 实现所有平台 API；
- 绘制正式设置 UI 美术。

---

# 61. 新增 Skills

新增：

```text
settings-framework
settings-menu
settings-migration
core-services-audit
```

## settings-framework

用于创建/修改：

```text
Registry
Store
Definition
Applier
Persistence
Capability
```

## settings-menu

用于：

```text
Category
Auto-generated controls
Apply / Cancel
Reset
Descriptions
Confirmation
```

## settings-migration

用于：

```text
schemaVersion
old → new
validation
fallback
```

## core-services-audit

用于确认 Gameplay 是否出现：

- 直接访问物理键值；
- 直接写音量；
- 直接存文件；
- 直接调用平台 API；
- 重复 Pause；
- 重复 Settings state。

---

# 62. v0.2 Core Services & Settings Foundation 执行计划

在 v0.1 PASS 后执行。

---

## Task S0 — Core Services Audit

Agent：

```text
technical_director
settings_engineer
```

Skill：

```text
core-services-audit
```

输出：

```text
docs/CORE_SERVICES.md
docs/SETTINGS_DESIGN.md
```

只设计真实需要的 service ownership。

---

## Task S1 — Settings Registry / Store

建立：

```text
SettingsService
SettingsRegistry
SettingsStore
SettingDefinition
SettingsSnapshot
```

Acceptance：

- 可以注册 Boolean/Number/Enum setting；
- 默认值生效；
- Runtime 修改生效；
- Gameplay 不依赖 UI；
- 无持久化耦合。

---

## Task S2 — Persistence / Validation / Migration

建立：

```text
ISettingsPersistence
SettingsMigration
schemaVersion
validation
fallback
```

Acceptance：

- 重启保留设置；
- 缺字段填默认；
- 非法值修复；
- 老 schema 可迁移；
- 坏配置不会阻止启动。

---

## Task S3 — Platform Capabilities

建立：

```text
PlatformCapabilityService
```

第一版 Windows capabilities。

Acceptance：

Settings Menu 可以知道：

```text
supported
unsupported
```

不需要 Settings UI 直接判断平台。

---

## Task S4 — Audio Service

建立：

```text
AudioService
Master
Music
SFX
UI
```

首批设置：

```text
Master Volume
Music Volume
SFX Volume
UI Volume
Mute When Unfocused
```

---

## Task S5 — Display Foundation

首批设置建议：

```text
Display Mode
VSync
Frame Limit
Brightness/Gamma
UI Scale
```

Resolution 只有在 Windows Native 实现可靠后才开放。

不能提供一个看起来可选但实际上没有效果的设置。

---

## Task S6 — Control Settings

把已有 local-coop input 和 Settings 接起来。

首批：

```text
Bindings P1
Bindings P2
Gamepad Vibration
Deadzone
Restore Default Controls
```

Acceptance：

设置改变不能破坏 Device ownership。

---

## Task S7 — Accessibility Foundation

首批：

```text
UI Scale
Reduce Screen Shake
Reduce Flashing
Subtitles Enabled
Subtitle Size
Subtitle Background Opacity
```

如果游戏暂时没有字幕：

- schema 可以存在；
- Settings UI 可以等相关系统出现再显示。

---

## Task S8 — Settings Menu

建立数据驱动 Settings 页面。

必须：

```text
Apply
Cancel
Reset Category
Reset All
Setting Description
```

高风险 Display 设置需要 Revert 流程。

---

## Task S9 — Localization Foundation

建立：

```text
LocalizationService
String IDs
zh-CN
```

先不做完整翻译。

目标只是阻止 UI 文本全部硬编码。

---

## Task S10 — Pause / Focus

建立：

```text
PauseService
```

设置：

```text
Pause When Unfocused
Mute When Unfocused
```

避免各 Scene 自己实现。

---

## Task S11 — Development Diagnostics

Development Build 增加：

```text
FPS
Input Slots
Connected Controllers
Settings State
Camera State
```

Release 自动关闭。

---

## Task S12 — v0.2 Gate

必须测试：

```text
settings defaults
settings save/load
invalid value recovery
schema migration
apply/cancel
reset category
reset all
keyboard bindings
gamepad settings
audio buses
window focus behavior
shared camera accessibility modifiers
Windows build
```

通过：

```text
git tag v0.2.0
```

---

# 63. v0.2 结束后的基础状态

完成之后，项目才开始进入真正玩法实验。

理想结构：

```text
FOUNDATION
├─ Boot
├─ Scene Flow
├─ Settings
├─ Persistence
├─ Audio
├─ Localization
├─ Platform Capability
├─ Pause
├─ Diagnostics
├─ Input
├─ Player
└─ Shared Camera

GAMEPLAY
└─ 尚未绑定具体类型
```

这时无论后面变成：

- 射击；
- 动作；
- 肉鸽；
- 合作解谜；
- 经营；

底座都不用推倒重来。

---

# 64. 不应该现在做的“主流设置”

即使主流游戏常见，也不要盲目照搬：

```text
Ray Tracing
DLSS
FSR
HDR
NVIDIA Reflex
Texture Streaming
Advanced Shadow Cascades
Voice Chat Device
Network Region
Matchmaking
Cross-play
```

除非游戏实际需要。

原则：

> **主流游戏的配置思想值得学习，不代表主流游戏的全部选项都应该复制。**

设置的“开放性”来自：

- Schema；
- Registry；
- Capability；
- Adapter；
- Migration；

而不是菜单里有 100 个开关。

---

# 65. 更新后的里程碑顺序

```text
v0.1
Local Co-op Foundation
│
├─ Input
├─ Player
├─ Device Join
├─ Shared Camera
└─ Prototype Room
        ↓
v0.2
Core Services & Settings Foundation
│
├─ Settings
├─ Persistence
├─ Capability
├─ Audio
├─ Controls
├─ Accessibility
├─ Localization
├─ Pause
└─ Diagnostics
        ↓
v0.3
Interaction Sandbox
│
├─ PrimaryAction
├─ SecondaryAction
└─ Interact
        ↓
v0.4
Gameplay Prototype Experiments
        ↓
确定真正游戏类型
```

这样比在 v0.1 就加入几十个游戏系统更稳。


---

# 66. 第三层底座：Runtime & Content Foundation

完成 `v0.1 Local Co-op Foundation` 和 `v0.2 Core Services & Settings Foundation` 后，不直接进入武器、怪物、Boss，而是增加：

> **v0.3 — Runtime & Content Foundation**

目标：无论最终游戏变成射击、动作、肉鸽、经营、合作解谜还是混合玩法，都拥有稳定的运行时骨架。

```text
GAMEPLAY
  ↑
Runtime & Content Foundation
  ↑
Core Services & Settings
  ↑
Local Co-op Foundation
```

原则：上层玩法可以大改，下面三层尽量不推倒。

---

# 67. Scene Flow 与 App State

建立：

```text
SceneFlowService
AppStateService
LoadingService
```

流程示例：

```text
Boot
 ↓
Main Menu
 ↓
Local Join
 ↓
Loading
 ↓
Gameplay
 ↓
Pause / Result
 ↓
Restart / Menu
```

禁止把 `director.loadScene()` 散落在按钮、Player 和 Gameplay 脚本里。统一通过 `SceneFlowService.requestTransition()`。

Scene 是资源容器，App State 是产品状态。二者不要绑死。

---

# 68. Loading Pipeline

统一：

```text
TransitionRequest
 ↓
Preload dependencies
 ↓
Loading UI
 ↓
Activate Scene
 ↓
Initialize
 ↓
Enter AppState
```

第一版只需要：
- Loading 状态；
- 进度接口；
- 防止重复 Transition；
- Preload Hook。

以后可增加 Asset Bundle、Shader Warm-up、网络握手。

Cocos Creator 提供 `director.preloadScene`、`loadScene` 与 Asset Bundle 场景加载，可作为实现基础。

---

# 69. Save / Profile Foundation

建立：

```text
SaveService
├─ SaveSnapshot
├─ SaveSerializer
├─ SaveMigration
├─ SaveValidator
└─ SaveStorage
```

Settings、Profile、Run/Session 分离：

```text
Settings
  用户偏好

Profile
  永久进度 / 解锁 / 统计

Run / Session
  当前一局临时状态
```

如果最终不是 Run-based 游戏，可以不使用 Run 层。

---

# 70. Save Snapshot

禁止直接序列化：

```text
Node
Component
Scene object
```

保存稳定 DTO：

```text
Runtime
 ↓
Snapshot DTO
 ↓
Validate
 ↓
Serialize
 ↓
Storage
```

载入：

```text
Storage
 ↓
Deserialize
 ↓
Migrate
 ↓
Validate
 ↓
Snapshot
 ↓
Rebuild Runtime
```

---

# 71. Autosave 与安全写入

Autosave 由事件触发：

```text
Checkpoint
Level Complete
Unlock Changed
Important Transaction
Return to Menu
```

禁止每帧保存。

正式版优先：

```text
Write temporary
 ↓
Validate
 ↓
Replace committed
 ↓
Keep previous backup
```

底层存储通过 Adapter。Cocos 的 `sys.localStorage` 在 Web 和 Native 使用不同实现，所以业务层不要依赖具体存储介质。

---

# 72. Content Definition 与 Stable ID

建立最小数据驱动层：

```text
ContentId
ContentDefinition
ContentRegistry
ContentValidator
```

以后可以扩展：

```text
CharacterDefinition
WeaponDefinition
EnemyDefinition
ItemDefinition
LevelDefinition
AbilityDefinition
RecipeDefinition
```

但现在只创建当前原型真正需要的类型。

Stable ID 示例：

```text
character.player.default
level.prototype.room_01
```

禁止使用以下内容作为永久 ID：

```text
显示名
Prefab 文件名
数组下标
UI 文本
```

---

# 73. Content Validation

Development / Build Gate 检查：

```text
duplicate ID
missing ID
broken reference
illegal range
missing localization key
invalid dependency
```

目标是让数据错误尽早暴露，而不是运行十分钟后才出现。

---

# 74. Asset Lifecycle

建立：

```text
AssetService
AssetScope
```

解决：
- 谁加载；
- 谁拥有；
- 谁释放；
- 谁预加载；
- 生命周期多久。

Cocos Asset Manager 会缓存加载资源，并支持预加载与 Asset Bundle；Bundle 适合按生命周期和发行边界组织模块，而不是仅为了目录好看。

第一版最多考虑：

```text
core
frontend
prototype
```

资源少时甚至暂时不拆 Bundle，只先明确 ownership。

---

# 75. Pooling

预留：

```text
PoolService
```

但：

> 没有性能证据，不默认池化一切。

未来适合：
- projectile；
- damage number；
- particle；
- pickup；
- temporary UI。

Cocos 本身提供通用 Pool / RecyclePool 等池化能力，适合频繁创建与回收对象。

---

# 76. Event Contracts

推荐领域级 typed event：

```text
PlayerJoinedEvent
SettingsChangedEvent
SaveCompletedEvent
SceneTransitionStartedEvent
```

规则：

事件适合：

> “某件事情已经发生，多方可以关注。”

明确命令适合直接 Service 调用：

```text
SaveService.requestSave()
```

不要用：

```text
event.emit("PLEASE_SAVE_GAME_NOW")
```

也不要把 Node 当作全局自定义消息总线。Cocos 官方提供独立 `EventTarget`，并不推荐用 Node 承载与 Node 无关的自定义事件。

---

# 77. Time Service

建立概念：

```text
GameTime
UITime
UnscaledTime
```

未来支持：

```text
Pause
Slow Motion
Hit Stop
Cooldown
Countdown
```

例如暂停时：

```text
gameplay timeScale = 0
UI timeScale = 1
```

当前只需要建立时间边界，不必一开始实现复杂 Time Stack。

---

# 78. Random Service

Gameplay 不要长期散落 `Math.random()`。

建立：

```text
RandomService
├─ seed
├─ nextFloat
├─ nextInt
├─ pick
└─ shuffle
```

好处：
- 同 Seed 复现 Bug；
- 肉鸽/掉落/地图可重复测试；
- 未来重放、联网确定性探索有空间。

不承诺完整 deterministic physics。

开发模式可显示：

```text
Run Seed: 8492134
```

---

# 79. Feature Flags

Development / Playtest 可以：

```text
new_camera_v2 = ON
prototype_shooting = ON
experimental_dash = OFF
```

用途：
- 对比两套机制；
- 快速回退；
- 录制开发过程；
- 小范围测试。

规则：

> Flag 是临时实验工具。

方案确定后删除旧实现与 Flag，禁止永久堆积。

---

# 80. Gameplay / Presentation 分离

未来 Player 建议分：

```text
PlayerGameplay
PlayerPresentation
```

Gameplay：
- movement；
- state；
- health；
- interaction；
- ability state。

Presentation：
- sprite/model；
- animation；
- VFX；
- SFX；
- rumble；
- camera feedback。

这样可以：

```text
胶囊体 Prototype
 ↓
2D 美术
 ↓
3D 美术
```

而不推倒 Gameplay。

---

# 81. Animation Adapter

Gameplay 不要直接：

```text
animation.play("player_super_run_v7")
```

使用：

```text
PlayerAnimationController
```

接收语义：

```text
Idle
Move
PrimaryAction
Hit
Downed
```

表现层再选择 AnimationClip、Spine、Skeletal、Tween 等实现。

Cocos 3.8 同时提供 Animation、AnimationState、Tween 等机制，保持玩法与具体 Clip 名称解耦更利于长期替换表现方案。

---

# 82. Feedback Foundation

统一：

```text
FeedbackService
├─ Camera feedback
├─ Audio
├─ VFX
├─ Rumble
└─ Accessibility modifiers
```

Gameplay 请求：

```text
HitFeedback
ExplosionFeedback
PickupFeedback
UIConfirmFeedback
```

而不是到处直接：

```text
camera.shake()
audio.play()
gamepad.rumble()
```

可以天然结合：

```text
Reduce Screen Shake
Reduce Flashing
Vibration
```

---

# 83. UI Navigation Foundation

PC 本地双人 + Steam 方向要求菜单从一开始就兼容键盘/手柄。

建立：

```text
UINavigationService
```

语义：

```text
Focus
Confirm
Cancel
Back
NextTab
PreviousTab
```

理想状态：

> 从启动游戏到进入一局，可以完全不用鼠标。

Steam Input 官方推荐用“游戏动作”而不是物理按钮描述输入，并允许键鼠与手柄的自定义组合；当前 Semantic Action 架构与此方向兼容。

---

# 84. UI Layer / Modal Stack

统一：

```text
Screen
Overlay
Modal
Toast
Debug
```

例如：

```text
Gameplay Screen
 ↓
Pause Overlay
 ↓
Settings Modal
 ↓
Confirm Dialog
```

Back / ESC / B 只由最上层合理 UI 处理。

---

# 85. Input Glyph Service

建立：

```text
InputGlyphService
```

UI 请求：

```text
PrimaryAction + ActiveDevice
```

得到：

```text
[E]
[A]
[Cross]
[Generic Button]
```

第一阶段只支持：

```text
Keyboard
Generic Gamepad
```

以后扩 Xbox / PlayStation / Switch / Steam Input。

---

# 86. Steam Remote Play Together 方向

因为 PC 核心已经是：

> Local Co-op + Shared Screen

未来 Steam 版天然可以评估 Remote Play Together。

Steam 官方说明本地多人、本地合作、共享/分屏游戏可以使用 Remote Play Together，让远端玩家像坐在同一台电脑前一样加入，且只需要 Host 拥有和安装游戏。

因此：

> 当前完全没有必要为了 Steam 提前自研在线联机。

---

# 87. Build Variants

建立：

```text
Development
Playtest
Release
```

Development：
- Debug HUD；
- Feature Flags；
- Cheats/Test commands；
- Input inspector；
- Save inspector；
- FPS；
- Verbose logs。

Playtest：
- Build ID；
- 有限 diagnostics；
- 无危险开发工具。

Release：
- 关闭 Debug Menu；
- 关闭 Cheat；
- 关闭 Experimental Flag；
- 关闭 Verbose Logs。

---

# 88. Build ID

Development / Playtest 显示：

```text
Version: 0.3.2
Build: 20260922.1845
Commit: a1b2c3d
```

玩家反馈 Bug 时能确定具体版本。

---

# 89. Logging

建立轻量：

```text
GameLogger
```

分类：

```text
BOOT
INPUT
SCENE
SAVE
SETTINGS
AUDIO
ASSET
GAMEPLAY
UI
```

等级：

```text
DEBUG
INFO
WARN
ERROR
```

Release 可以减少 Debug 输出。

---

# 90. Developer Console

仅 Development：

```text
help
reload_scene
reset_settings
reset_save
show_inputs
show_camera
set_timescale
set_seed
toggle_feature
```

目标：快速测试，不做复杂脚本语言。

---

# 91. Playtest Metrics

开发测试可以本地记录：

```text
session duration
restart count
join time
level complete
settings changed
prototype chosen
```

写入本地开发日志。

它不是正式用户分析系统。

未来若加入真实 Analytics，需要单独处理隐私、授权和平台合规。

---

# 92. Test Strategy

三层：

```text
Pure TypeScript Unit Tests
 ↓
Integration / System Tests
 ↓
Manual Playtest Gate
```

适合 Unit Test：
- Settings migration；
- Save serializer；
- Content Registry；
- Random；
- 规则计算。

适合 Integration：
- Player Join；
- Scene Flow；
- Save/Load Round Trip；
- Settings Apply。

必须人工：
- 手感；
- Camera；
- 同时双人输入；
- 手柄热插拔；
- UI Navigation。

---

# 93. Test Labs

建立开发专用 Scene：

```text
InputLab
CameraLab
SettingsLab
SaveLab
AudioLab
```

不进入 Release。

Codex 修改某个底层系统时，可以直接进入对应 Lab。

---

# 94. Content Sandbox

新玩法先进入：

```text
Prototype Sandbox
```

例如：

```text
Dash Prototype
Shooting Prototype
Push/Pull Prototype
Carry Prototype
Combo Prototype
```

流程：

```text
Sandbox
 ↓
Playtest
 ↓
Keep / Kill
 ↓
Integration
```

这和“记录游戏逐步丰满过程”的内容路线高度匹配。

---

# 95. Gameplay Tags / Stats / Replay / Network / Mod

这些方向只保持“不阻塞”，暂不实现重系统。

## Gameplay Tags

未来可能：

```text
entity.enemy
entity.boss
damage.fire
state.invulnerable
interaction.pickup
```

但 v0.3 不做完整 Ability System。

## Stats / Modifiers

如果以后确定需要 RPG / 肉鸽成长，再做：

```text
Stat
Modifier
Effect
```

## Replay

保持 Input / Random / Time 边界干净即可，不承诺完整 deterministic replay。

## Networking

当前仍然：

> NO NETWORKING.

未来可把 `NetworkInputSource` 接到 Semantic Player Command 边界，而不是重写 Player。

## Mod / Workshop

不做 Mod SDK。Stable Content ID + 数据驱动 Content Definition 已经为未来留出空间。

---

# 96. 新增 Agents

新增：

```text
core_runtime_engineer
save_data_engineer
content_systems_engineer
```

分别负责：

### core_runtime_engineer
- Boot；
- App State；
- Scene Flow；
- Loading；
- Time；
- Feature Flags；
- Runtime Diagnostics。

### save_data_engineer
- Snapshot；
- Profile；
- Save Slot；
- Serialization；
- Validation；
- Migration；
- Backup；
- Storage Adapter。

### content_systems_engineer
- Stable Content ID；
- Definition；
- Registry；
- Validation；
- Asset Ownership；
- Bundle Boundary。

---

# 97. 新增 Skills

```text
scene-flow
save-profile
content-registry
asset-lifecycle
ui-navigation
event-contracts
time-random
feedback-foundation
build-variants
test-harness
feature-flags
performance-pooling
```

---

# 98. v0.3 执行计划

## R0 Runtime Audit
检查 Scene Load、Pause、Timer、Save、Asset ownership、UI navigation 是否散落。

## R1 Scene Flow
实现 AppState + SceneFlowService + TransitionRequest。

## R2 Loading Foundation
实现 Loading State、Progress interface、Transition lock、Preload hook。

## R3 Save / Profile
实现 Snapshot、Storage、schemaVersion、Validation、Migration、Round Trip。

## R4 Content Registry
实现 ContentId、Definition、Registry、Validator，使用 Prototype Character/Level 验证。

## R5 Asset Lifecycle
实现 Asset ownership 与 preload/release 规则；资源很少时不强制拆 Bundle。

## R6 UI Navigation
主菜单 → Local Join → Settings → Back 可以只用手柄完成。

## R7 Time / Random
实现 TimeService + RandomService + seed。

## R8 Feedback Foundation
只接 UI feedback、Rumble、Camera hook，不做大量特效。

## R9 Feature Flags / Build Variants
建立 Development / Playtest / Release。

## R10 Test Labs
建立 InputLab、CameraLab、SettingsLab、SaveLab。

## R11 Logging / Build ID
建立 GameLogger + BuildInfo。

## R12 v0.3 Gate
测试 Scene Flow、Save/Load、Migration、Content ID、Asset ownership、手柄 UI、Time/Random、Build variant、Test Labs 排除、Windows Build。

通过后：

```text
git tag v0.3.0
```

---

# 99. 更新后的路线

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
INTERACTION SANDBOX
 ↓
v0.5
GAMEPLAY EXPERIMENTS
 ↓
GAME DIRECTION LOCK
```

---

# 100. 扩展性的判断标准

不要把“扩展性”理解为现在写完未来所有系统。

采用：

```text
现在确定会用
→ 稳定实现

未来高概率会用
→ 清晰接口

可能会用
→ 保持不阻塞

纯猜测
→ 什么都不做
```

例如：

```text
Save
→ 现在做

Scene Flow
→ 现在做

Stable Content ID
→ 现在做

Object Pool
→ 有性能证据再用

Stats System
→ 等玩法确定

Networking
→ 等手机双机真的开始

Mod SDK
→ 等游戏证明值得 Mod
```

这才是长期不腐烂的底座。
