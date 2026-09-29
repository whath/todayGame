# DuoGame / todayGame

Windows PC 3D 本地双人基础工程，Cocos Creator **3.8.6 + TypeScript**。当前为 **0.5.0-dev — 3D Local Multiplayer & Universal Gameplay Kernel**，按 [需求 v5](docs/reference/GAME_DEV_CODEX_MASTER_PLAN_V5.md) 补齐差量。Windows、Prototype 和 Vertical Slice Gate 尚未通过，没有发布 Tag。

## 当前开发：类别入口与赛车 R0

进入游戏先选“赛车”或“接力”。赛车是长期类别：双人左右分屏、偏真实驾驶模型、卡通灰盒、无 AI；本轮接入 2 种车辆参数与 1 条训练赛道，完成选车准备、倒计时、3 圈检查点与结算代码。现有接力内容和存档保留。

后台类型检查、113 项测试、80 脚本语法与 108 UUID 检查通过。**本轮没有打开前台试玩；悬挂/碰撞/分屏效果、真实手柄与 Windows 构建均 NOT RUN。** 不把公式测试视为驾驶手感验收。

[任务进度](docs/PROGRESS.md) · [类别分层](docs/GAME_CATEGORIES.md) · [赛车实现与操作](docs/RACING_PROTOTYPE.md) · [本轮验证](docs/VALIDATION_RACING_R0.md)

赛车操作：加入后 P1 E / P2 L 切车，G / K 准备，Enter 确认开始；WASD / 方向键驾驶，E / L 复位。手柄 West 切车/复位，East 准备，South 菜单确认，RT/LT 油门/刹车。赛道目前只有一条；赛车没有中途存档。

## 上轮 v5 差量

已按 v5 迁移 3D 灰盒（角色、地板、墙体、接力机关、方向光和共享相机），保留独立 2D UI。底座不预设合作：Inactive、Opponent、Competitive 仲裁与 Shared 占有接入；接力专用规则移至 packs/relay。合并 46 项 Skills、19 个可选角色模板和外部资产流程。

[v5 差量](docs/PLAN_DELTA_V5.md) · [本地多人](docs/LOCAL_MULTIPLAYER_ROBUSTNESS.md) · [3D 迁移](docs/MIGRATION_3D.md) · [工作流](docs/WORKFLOW_V5.md) · [玩法内核](docs/GAMEPLAY_KERNEL.md) · [Prototype Gate](docs/PROTOTYPE_GATE.md)

## 当前可玩内容（完整 Gate 尚未通过）

选择“接力”后，新游戏进入“守门与接力”：一人站住左侧踏板，另一人穿门并在终端附近按交互键（默认 P1 E / P2 L，手柄 West），让门永久开启；两人共同进入右侧出口完成挑战。终端解锁和通关自动保存。F5 或暂停菜单重开；结果菜单可再次挑战。旧存档继续进入原测试房间，原四个 Lab 保留。

2026-09-29 已完成 Creator 3.8.6 首次导入及 v5 的 3D 浏览器预览：双键盘加入、短距离移动、重开、暂停/设置、保存返回/继续均已检查。96 项自动测试、官方类型、71 脚本语法、3 内容/97 UUID 检查通过。完整双人通关、真实手柄和 Windows 游戏构建仍待验证，未通过发布或 Prototype Gate。详见 [v5 验证](docs/VALIDATION_V5.md)；此前环境记录保留在 [环境检查](docs/ENVIRONMENT_CHECK.md)。

[一页游戏定义](docs/GAME_DEFINITION.md) · [挑战规则](docs/COOP_CHALLENGE.md) · [本轮验证](docs/VALIDATION_V5.md)

## 基础层能力

- 主菜单 → 双人加入 → 游戏 → 暂停 / 设置 / 返回；逻辑场景切换锁、加载进度、预加载及失败恢复。
- Profile / Slot / Session 数据快照、schema 校验与迁移、临时写入回读、上一版本备份和恢复；与设置独立存储。
- 稳定角色 / 关卡 ID、内容注册与校验；作用域管理 Prefab 引用。
- UI 分层导航、模态窗口独占输入、键盘及通用手柄提示。
- 游戏 / UI / 未缩放时间、可复现随机序列与存档随机状态；PlayerPresentation 分离。
- UI 确认反馈、镜头和震动接口、开发命令、Feature Flags、分类日志及 Build ID。
- Development / Playtest / Release 构建配置；InputLab、CameraLab、SettingsLab、SaveLab 实际场景。

## 打开与操作

1. 用 Creator **3.8.6** 导入仓库，打开 `assets/scenes/Prototype.scene` 并预览。
2. 先选择类别；接力选择“新游戏”或“继续”，按两套键盘映射或手柄按钮加入；两人就绪后选择“开始”。
3. 游戏中打开暂停菜单，可保存、重开、设置或返回主菜单。返回菜单 / 加入界面前保存失败时会留在当前游戏。
4. 继续游戏先重新分配设备，再恢复两人位置、经过时间和随机状态。

3D 浏览器预览已验证加入、暂停/设置、重开及当前档保存/恢复；完整通关、旧真实存档和真实设备组合仍需按 Gate 逐项验收。

| 操作 | 键盘 | 手柄 |
| --- | --- | --- |
| 导航 / 确认 / 返回 | 方向键 / Enter / Esc | 十字键或左摇杆 / South / East |
| 暂停 | Esc | Options / Start |
| 设置 | F2 或菜单选项 | 菜单选项；主菜单 / 加入页可按 Options / Start |
| 设置分类 | Tab / Shift+Tab | R1 / L1 |
| 重开当前房间 | F5 | 暂停菜单重新开始 |
| 调试信息 | F1，仅 Development | 开发工具菜单 |

| 默认键盘配置 | 移动 | 主动作 | 次动作 | 交互 |
| --- | --- | --- | --- | --- |
| P1 | W/A/S/D | F | G | E |
| P2 | 方向键 | J | K | L |

手柄移动用左摇杆 / 十字键，动作使用 South / East / West。Keyboard A/B 加入前用各自默认配置，加入后跟随实际 P1/P2 槽位；映射切换需松开按键。两套逻辑映射不能识别两把 USB 键盘的硬件身份。

设置维持 Preview / Apply / Cancel；不支持的显示和震动能力不开放。产品采用多类别结构，赛车已确定长期保留；其他类别按需求开发。原型仍无正式音频 / 美术、敌人、战斗和联网功能。

## 验证与构建

```sh
pnpm install --frozen-lockfile
pnpm test
node tools/prepare-build.cjs development
```

开发依赖只有 TypeScript 5.9.3 和官方 Cocos 3.8.6 声明。构建准备命令只生成配置和 BuildInfo，不运行 Creator。切回编辑器前重新准备 development；Windows 构建见 [构建变体](docs/BUILD_VARIANTS.md)。

当前自动结果和待验收项见 [当前验证记录](docs/VALIDATION_RACING_R0.md)。本轮没有增加生产依赖。

文档：[架构](docs/ARCHITECTURE.md) · [运行时](docs/RUNTIME_DESIGN.md) · [存档](docs/SAVE_DESIGN.md) · [内容与资源](docs/CONTENT_DESIGN.md) · [设置](docs/SETTINGS_DESIGN.md) · [实验场景](docs/TEST_LABS.md) · [路线图](docs/ROADMAP.md) · [日志](docs/DEVLOG.md)
