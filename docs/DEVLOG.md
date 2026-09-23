# 开发记录

## 2026-09-22 — v0.2 Core Services & Settings Foundation

### Goal / Decision

理解并实施用户提供的新版规划，新增核心服务与设置底座，同步推送 Git。继续使用 3.8.6 和几何双人原型，不加入敌人或战斗。当前推进开发版；v0.1 与 v0.2 的实机验收未完成，不创建正式 Tag。

### Implementation

实现 Definition / Registry / Store / Service、独立 Persistence、schema 迁移、非法值恢复、未来 schema 保护、预览 / 应用 / 取消与失败回退、高风险显示确认框架、能力过滤、数据驱动菜单。接入玩家按键重绑定与死区、冲突处理、音频总线、集中暂停、无障碍设置、简体中文和开发诊断。

### Problems / Root Cause

代码检查发现：键盘 B 先加入 P1 后，槽位配置切换可能使仍按住的箭头键被另一个逻辑键盘解释为新 Join。根因是映射改变产生虚假的逻辑输入上升沿。修复为映射变更后等待全部按键释放，并加入真实适配器代码的事件桥接回归测试。该问题来源于静态分析和测试，不声称已在 Creator 实机复现。

### Validation / Result

30 项自动测试通过；官方 Cocos 3.8.6 声明下全项目 strict 类型检查通过；纯核心编译通过；37 个脚本语法转译通过。未发现可用 Creator 安装，未运行场景、Windows 构建或真实双手柄 / 音频验收。具体边界见 VALIDATION_V0.2.md。

### Next / Footage

先在 Creator 导入并试玩设置交互，拍摄改键冲突、即时预览 / 取消、失焦策略、摇杆死区和手柄重连；这些画面尚未实际录制。没有收到搭档设计讨论，不补写不存在的反馈。

## 2026-09-22 — Local Co-op Foundation 首次源码交付

### Goal

根据 GAME_DEV_CODEX_MASTER_PLAN.md，在空 GitHub 仓库搭建 Cocos 本地双人游戏底座，并上传源码。用户指定本次不校验、不执行。

### Design Discussion

资料要求先建立输入、角色、相机和碰撞基础，不决定最终玩法。本次没有收到搭档讨论记录，因此不补写不存在的设计争论或试玩反馈。

### Decision

固定 Cocos Creator 3.8.6；采用几何俯视房间、单一玩家 Prefab、输入设备 / 槽位分离、一个共享相机。断线恢复需要按键确认，不自动猜测硬件归属。

### Implementation

- 生成项目配置、Prototype.scene、Player.prefab 及资源 .meta。
- 生成键盘 / 手柄适配、加入分配、状态机、独立移动、静态矩形碰撞。
- 生成共享镜头、操作提示、设备状态、重置和返回大厅。
- 同步 README、项目规则、架构、输入、决策、路线图、人工验收及 Windows 构建说明。

### Problems / Root Cause

未运行，暂无实际错误、复现步骤或根因记录。引擎导入、编译、UI 布局和控制器实机问题均有待后续观察，不能据源码生成推断无错误。

### Result

源码状态：初版已生成，版本 `0.1.0-dev`。验证状态：**NOT RUN — USER REQUEST**。未启动 Creator、未运行游戏、未执行类型检查 / 测试 / 构建，未完成 V0.1 Gate。

### Footage Markers

未来可录制：双设备按顺序加入、同时移动、拉开镜头、贴墙移动、拔插手柄、按键重新接管。以上是待录制建议，不是已发生的试玩。

### Next

另行授权后首次打开 Creator，处理导入 / 编译问题，再按 ACCEPTANCE.md 执行四种输入组合及 Windows 原生构建验收。

## 2026-09-23 — v0.3 Runtime & Content Foundation

根据用户提供的 v3 规划完成 R0–R11 基础实现，版本提升为 0.3.0-dev。新增应用状态 / SceneFlow / Loading、存档 Profile / Slot / Session、schema 迁移 / 校验 / 恢复、角色与关卡内容注册、资源作用域、分层导航、Time / Random、表现分离与反馈接口、构建变体 / flags / 日志 / Build ID、四个 Lab 场景；同步架构、设计、构建、实验与验证文档。

集成时处理：设置 modal 不被后添加的暂停 overlay 抢焦点；输入采样与 Join 分配分离，保持每帧只采样一次；旧视图清理异常不能回滚已激活的新视图；实验存档与正式存档隔离；迁移后保存保留旧 schema 原文备份；保存失败暂停显示错误，保留当前游戏现场。

验证：57 项自动测试通过，官方 Cocos 3.8.6 类型检查及纯逻辑编译通过，59 个脚本语法转译通过。详细记录见 VALIDATION_V0.3。没有运行 Creator、真实手柄、Windows 构建或录制试玩素材；R12 实机 Gate 为 NOT RUN，没有发布 Tag。下一步是完成这些 Gate，再推进 v0.4 Interaction Sandbox。
