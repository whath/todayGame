# DuoGame / todayGame

Windows PC 本地双人游戏基础工程，Cocos Creator **3.8.6 + TypeScript**。当前开发版本 **0.2.0-dev — Core Services & Settings Foundation**。

按 [新版开发规划](docs/reference/GAME_DEV_CODEX_MASTER_PLAN_V0.2.md) 扩展核心服务与设置层，保留共用角色 Prefab、双人独立输入、共享镜头和碰撞测试房间。尚未完成 Creator 实机及 Windows 发布验收，不代表正式 v0.2.0 发布。

## 本轮新增

- 数据驱动设置：布尔、数值、枚举、按键绑定；全局与 P1/P2 槽位设置。
- 工作副本、即时预览、应用、取消、恢复分类 / 全部 / 单玩家控制，含确认提示。
- 独立设置存储、schema 迁移、非法值修复、未来版本保护、保存失败回退。
- 平台能力过滤，隐藏没有可靠后端的全屏、分辨率、VSync、Gamma、震动与字幕选项。
- Master / Music / SFX / UI 音频总线和 CocosAudioAdapter；失焦静音独立于暂停。
- P1/P2 重绑定，跨玩家按键冲突的交换 / 解除 / 取消，摇杆死区配置。
- 简体中文字符串表、UI 缩放、减少动作闪光、共享镜头跟随强度。
- 集中暂停原因管理、开发版诊断信息，以及自动测试入口。

## 打开工程

1. 在 Cocos Dashboard 用 Creator **3.8.6** 导入仓库根目录。
2. 等待编辑器导入资源，打开 `assets/scenes/Prototype.scene`。
3. 点击预览；房间、相机和 UI 由 Bootstrap 运行时创建。
4. 使用两套键盘映射、键盘与手柄，或两只手柄按顺序加入。两人就绪后自动开始。

此流程尚未在本机 Creator 中执行。`cc` 运行时由 Creator 提供，不通过 npm 启动游戏。

| 默认配置 | 移动 | 主动作 | 次动作 | 交互 |
| --- | --- | --- | --- | --- |
| P1 键盘配置 | W/A/S/D | F | G | E |
| P2 键盘配置 | 方向键 | J | K | L |
| 手柄 | 左摇杆 / 十字键 | South（A/Cross） | East（B/Circle） | West（X/Square） |

加入前 Keyboard A/B 分别使用 P1/P2 默认映射；加入后配置跟随实际玩家槽位。映射发生切换时先松开全部按键再继续，避免按住旧按键误加入第二个槽位。两套逻辑映射不代表能够识别两把 USB 键盘的硬件身份。

| 操作 | 按键 / 入口 |
| --- | --- |
| 暂停 / 继续 | Esc |
| 打开设置 | F2；手柄 Options / Start |
| 设置导航 | 方向键、Enter、Esc、Tab；手柄方向 / A / B / R1；鼠标点击 |
| 重置角色位置 | F5（游戏进行中） |
| 返回加入界面 | 设置页“返回加入界面”，确认后释放设备 |
| 调试信息 | F1，仅开发构建 |
| 解除某动作绑定 | 进入按键捕获后按 Backspace |

设置页的修改先留在工作副本；应用成功才保存，取消恢复原值。原型没有正式音频素材，音频设置作用于通过 AudioService / CocosAudioAdapter 注册的声音。

## 开发验证

开发依赖仅包括固定版本 TypeScript 与官方 Cocos 引擎声明，不增加运行时生产依赖。使用 Node.js 22+ 和 pnpm 安装：

```sh
pnpm install --frozen-lockfile
pnpm test
```

可分别执行 `pnpm typecheck:core`、`pnpm typecheck:engine`、`pnpm check:syntax`。生成的测试编译文件位于已忽略的 `temp/core-tests`，不会进入游戏资源。

当前结果：**30 项自动测试通过，全项目官方 Cocos 3.8.6 声明类型检查通过，37 个脚本语法转译通过**。这些结果不替代真实引擎运行、手柄测试、音频输出或 Windows 构建。详见 [验证记录](docs/VALIDATION_V0.2.md)。

## 模块与边界

`assets/settings` 管设置合同和事务；`assets/services` 管纯逻辑服务；`assets/platform` 管 Cocos 输入、焦点、存储、帧率、音频；`assets/app` 组装服务；原来的 core / input / player / camera / gameplay / ui / scenes 保持职责分离。

无敌人、战斗、正式美术、网络、移动平台或进度存档系统。碰撞只处理角色与静态矩形及房间边界，角色之间可穿过。原生显示模式切换等能力仍待后续适配，菜单不会提供无效选项。

文档：[核心服务](docs/CORE_SERVICES.md) · [设置设计](docs/SETTINGS_DESIGN.md) · [架构](docs/ARCHITECTURE.md) · [输入](docs/INPUT_DESIGN.md) · [路线图](docs/ROADMAP.md) · [验证](docs/VALIDATION_V0.2.md) · [开发日志](docs/DEVLOG.md)
