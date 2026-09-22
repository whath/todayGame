# DuoGame / todayGame

Windows PC 本地双人游戏基础工程，采用 **Cocos Creator 3.8.6 + TypeScript**。

当前版本为 `0.1.0-dev`，根据 [开发总规划](docs/reference/GAME_DEV_CODEX_MASTER_PLAN.md) 生成第一版代码。**本次按要求仅生成并提交代码，没有启动编辑器、运行游戏、类型检查、测试或构建；不代表 V0.1 验收通过，也没有发布版本 Tag。**

## 已提供的代码

- 两个玩家共用 `assets/player/Player.prefab` 和同一套控制逻辑。
- 两套独立键盘映射、Cocos 手柄适配器、摇杆死区和动作按下沿。
- 键盘 + 键盘、键盘 + 手柄、手柄 + 键盘、手柄 + 手柄的设备分配流程。
- 按键加入、两个玩家就绪后开始、断开暂停、重新按键确认设备。
- 单一正交相机：双人中心跟随、距离缩放、平滑和视野上下限。
- 俯视测试房间、静态矩形障碍、边界碰撞、出生点和重置。
- 设备状态 HUD；Primary / Secondary / Interact 仅显示动作标签，不包含战斗。

## 后续打开工程

以下步骤供之后人工操作，本次未执行：

1. 安装 Cocos Creator **3.8.6**，在 Dashboard 选择「导入项目」，选中仓库根目录。
2. 等待编辑器首次导入资源并生成 `temp/tsconfig.cocos.json`。
3. 打开 `assets/scenes/Prototype.scene`。入口组件已引用共用 Player Prefab。
4. 点击预览。房间、相机和 HUD 在入口组件中生成，编辑器静态场景仅显示 Bootstrap。
5. 按下面的映射加入 P1 和 P2。先加入的输入源成为 P1，后加入的成为 P2。

本工程没有 npm 运行命令，也不需要安装 npm 生产依赖。`cc` 和 TypeScript 引擎声明由 Creator 提供。

| 输入源 | 移动 | Primary | Secondary | Interact |
| --- | --- | --- | --- | --- |
| Keyboard A | W / A / S / D | F | G | E |
| Keyboard B | 方向键 | J | K | L |
| 手柄 | 左摇杆 / 十字键 | 下方按钮（A / Cross） | 右方按钮（B / Circle） | 左方按钮（X / Square） |

- 键盘按任一映射键加入；手柄按任一受支持按钮或十字键加入，单独移动摇杆不加入。
- `R`：重置两个角色位置，保留设备分配。
- `Esc`：回到加入界面，释放设备分配；松开原有按键后重新按键加入。
- 手柄断开时暂停双方移动；连接后按按钮确认，优先恢复断开槽位。两个槽位均断开时按 P1、P2 顺序确认。
- 启动前已连接的手柄可能需要先按按钮，Cocos 才会向工程报告设备。
- 同一物理键盘的两套映射作为两个逻辑输入源；不识别两把 USB 键盘的硬件身份。

## 工程布局

```text
assets/
  core/       输入数据、会话状态、基础矩形碰撞
  input/      输入设备、玩家槽位、独占分配
  platform/   Cocos 键盘和手柄事件适配
  player/     唯一 Player Prefab、控制器、移动、状态
  camera/     双人共享正交相机
  gameplay/   入口和测试房间
  ui/         设备与操作提示
  scenes/     Prototype.scene
docs/         架构、输入、决策、开发记录及后续验收清单
settings/     Creator 项目设置与入口场景
```

## 当前边界

基础碰撞只处理角色与静态矩形 / 房间边界；角色之间可以穿过，不包含推箱子、旋转碰撞体、刚体模拟或重力。矩形俯视视角用于验证基础，不预设最终玩法。无敌人、武器、网络、移动平台、正式美术或第三方生产依赖。

Windows 原生构建、实际手柄兼容性、资源导入与视觉效果均待人工验证。后续构建说明见 [Windows 构建](docs/WINDOWS_BUILD.md)，验收清单见 [待执行验收](docs/ACCEPTANCE.md)。

文档导航：[项目](docs/PROJECT.md) · [架构](docs/ARCHITECTURE.md) · [输入](docs/INPUT_DESIGN.md) · [决策](docs/DECISIONS.md) · [开发日志](docs/DEVLOG.md) · [路线图](docs/ROADMAP.md)
