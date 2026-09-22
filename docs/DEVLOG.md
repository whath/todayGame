# 开发记录

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
