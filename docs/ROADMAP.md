# 路线图

## v0.1 Local Co-op Foundation

Task 0–7 的工程、输入、共用玩家、独立移动、加入、共享镜头、热插拔和房间代码已存在。v0.1 首轮按用户要求未运行；本轮自动回归覆盖了部分输入、热插拔逻辑和碰撞，原始实机 Gate 仍未完成。

## v0.2 Core Services & Settings Foundation

本轮依照新版文档推进开发，版本为 0.2.0-dev，不把尚未完成的 v0.1 PASS 前置条件视为通过。

| 任务 | 当前实现 | 验证边界 |
| --- | --- | --- |
| S0 Core Services Audit | CORE_SERVICES / SETTINGS_DESIGN 及职责调整 | 文档与代码同步 |
| S1 Registry / Store | 四种定义类型、默认值、运行快照和工作副本 | 自动测试通过 |
| S2 Persistence / Migration | 独立存储 key、schema 2、v1 迁移、校验和恢复 | 逻辑测试通过；原生存储待测 |
| S3 Platform Capabilities | 菜单能力过滤，未实现能力隐藏 | 逻辑测试通过 |
| S4 Audio Service | Master / Music / SFX / UI，音源注册与焦点静音 | 混音逻辑通过；实音频待测 |
| S5 Display Foundation | 30/60 目标帧率，危险设置确认框架 | 显示确认逻辑通过；原生全屏等不开放 |
| S6 Control Settings | 玩家槽位绑定、冲突处理、死区、恢复默认 | 逻辑与键盘事件桥接测试通过；设备待测 |
| S7 Accessibility | UI 缩放、减少闪烁、镜头跟随强度；字幕 schema 隐藏 | 逻辑通过；视觉待测 |
| S8 Settings Menu | 数据驱动分类、分页、应用 / 取消 / 重置 / 提示 / 确认 | 类型检查通过；引擎交互待测 |
| S9 Localization | zh-CN 字符串 ID 和替换参数 | 定义文案覆盖测试通过 |
| S10 Pause / Focus | 集中暂停原因，失焦暂停与静音分开 | 服务逻辑通过；原生焦点待测 |
| S11 Diagnostics | 开发版 FPS / 输入 / 设备 / 镜头 / 设置状态 | 开关逻辑通过；实际渲染待测 |
| S12 Gate | 30 项测试、官方类型检查、语法检查已执行 | Windows / Creator Gate 未完成，不创建 Tag |

下一步优先：按 VALIDATION_V0.2.md 完成 Creator 首次导入、UI 交互、四种设备组合、原生保存、音频与 Windows 构建；修复后记录真实 Gate 结果，再考虑发布。

之后顺序调整为：v0.3 Interaction Sandbox → v0.4 Gameplay Prototype Experiments → 决定具体类型。移动 / 小游戏平台与网络仍后置。

## v0.3 Runtime & Content Foundation — 当前 0.3.0-dev

| 任务 | 实现 | 验证状态 |
| --- | --- | --- |
| R0 Audit | RUNTIME_DESIGN / ARCHITECTURE | 已记录 |
| R1–R2 SceneFlow / Loading | 应用状态、切换锁、prepare / activate / dispose、进度与失败恢复 | 逻辑自动测试；实际 UI 待验收 |
| R3 Save / Profile | DTO、校验、迁移、备份与恢复、独立命名空间 | 逻辑自动测试；原生存储待验收 |
| R4–R5 Content / Asset | 角色关卡稳定 ID、内容校验、共享资产作用域 | 逻辑自动测试；Cocos 引用生命周期待验收 |
| R6 Navigation | 主菜单 / 加入 / 设置 / 暂停、模态优先级、Glyph | 导航合同自动测试；真实手柄待验收 |
| R7 Time / Random | 暂停时间域、时间倍率、seed / state / shuffle | 自动测试 |
| R8 Feedback | UI 脉冲、表现分离、Camera / Rumble hook | 合同自动测试；真实能力未开放 |
| R9 Variants / Flags | 三变体、Release 禁用实验和命令、场景白名单 | 自动测试 |
| R10 Labs | 四个实际 Lab 场景、独立实验存档 | 配置自动检查；场景实机待验收 |
| R11 Logging / Build ID | 分类日志、上限、版本与提交标记 | 自动测试 |
| R12 Gate | 自动回归完成 | Windows Build / 实机 NOT RUN，无发布 Tag |

之后依 v3 路线推进 v0.4 Interaction Sandbox → v0.5 Gameplay Experiments → Game Direction Lock。先补原生 / 控制器 Gate，再确定具体互动实验；不默认进入战斗或联网系统。
