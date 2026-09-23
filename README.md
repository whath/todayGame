# DuoGame / todayGame

Windows PC 本地双人基础工程，Cocos Creator **3.8.6 + TypeScript**。当前为 **0.3.0-dev — Runtime & Content Foundation**，按 [v3 规划](docs/reference/GAME_DEV_CODEX_MASTER_PLAN_V0.3.md) 的 R0–R11 实现基础代码。R12 的 Windows 构建和实机 Gate 尚未通过，因此没有发布 Tag。

## 本轮变化

- 主菜单 → 双人加入 → 游戏 → 暂停 / 设置 / 返回；逻辑场景切换锁、加载进度、预加载及失败恢复。
- Profile / Slot / Session 数据快照、schema 校验与迁移、临时写入回读、上一版本备份和恢复；与设置独立存储。
- 稳定角色 / 关卡 ID、内容注册与校验；作用域管理 Prefab 引用。
- UI 分层导航、模态窗口独占输入、键盘及通用手柄提示。
- 游戏 / UI / 未缩放时间、可复现随机序列与存档随机状态；PlayerPresentation 分离。
- UI 确认反馈、镜头和震动接口、开发命令、Feature Flags、分类日志及 Build ID。
- Development / Playtest / Release 构建配置；InputLab、CameraLab、SettingsLab、SaveLab 实际场景。

## 打开与操作

1. 用 Creator **3.8.6** 导入仓库，打开 `assets/scenes/Prototype.scene` 并预览。
2. 选择“新游戏”或“继续”，按两套键盘映射或手柄按钮加入；两人就绪后选择“开始”。
3. 游戏中打开暂停菜单，可保存、重开、设置或返回主菜单。返回菜单 / 加入界面前保存失败时会留在当前游戏。
4. 继续游戏先重新分配设备，再恢复两人位置、经过时间和随机状态。

以上是待实机验收的操作流程。本机未运行 Creator，不能将类型检查等同于可试玩验收。

| 操作 | 键盘 | 手柄 |
| --- | --- | --- |
| 导航 / 确认 / 返回 | 方向键 / Enter / Esc | 十字键或左摇杆 / South / East |
| 暂停 | Esc | Options / Start |
| 设置 | F2 或菜单选项 | 菜单选项；主菜单 / 加入页可按 Options / Start |
| 设置分类 | Tab / Shift+Tab | R1 / L1 |
| 重置位置 | F5 | 暂停菜单重新开始 |
| 调试信息 | F1，仅 Development | 开发工具菜单 |

| 默认键盘配置 | 移动 | 主动作 | 次动作 | 交互 |
| --- | --- | --- | --- | --- |
| P1 | W/A/S/D | F | G | E |
| P2 | 方向键 | J | K | L |

手柄移动用左摇杆 / 十字键，动作使用 South / East / West。Keyboard A/B 加入前用各自默认配置，加入后跟随实际 P1/P2 槽位；映射切换需松开按键。两套逻辑映射不能识别两把 USB 键盘的硬件身份。

设置维持 Preview / Apply / Cancel；不支持的显示和震动能力不开放。原型仍无正式音频 / 美术、敌人、战斗和联网功能。

## 验证与构建

```sh
pnpm install --frozen-lockfile
pnpm test
node tools/prepare-build.cjs development
```

开发依赖只有 TypeScript 5.9.3 和官方 Cocos 3.8.6 声明。构建准备命令只生成配置和 BuildInfo，不运行 Creator。切回编辑器前重新准备 development；Windows 构建见 [构建变体](docs/BUILD_VARIANTS.md)。

当前自动结果和待验收项见 [v0.3 验证记录](docs/VALIDATION_V0.3.md)。本轮没有增加生产依赖。

文档：[架构](docs/ARCHITECTURE.md) · [运行时](docs/RUNTIME_DESIGN.md) · [存档](docs/SAVE_DESIGN.md) · [内容与资源](docs/CONTENT_DESIGN.md) · [设置](docs/SETTINGS_DESIGN.md) · [实验场景](docs/TEST_LABS.md) · [路线图](docs/ROADMAP.md) · [日志](docs/DEVLOG.md)
