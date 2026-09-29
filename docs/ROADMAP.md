# 路线图 — v5 / 3D Local Multiplayer

当前源码 0.5.0-dev；代码存在、自动验证、浏览器验证、硬件/Windows 验收分别记录。

| 阶段 | 当前实现 | 剩余证据 |
| --- | --- | --- |
| v0.1 Local Multiplayer Foundation | 双槽位、共享 Prefab、3D 灰盒、共享视角 | 四种设备组合、Windows 游戏构建 |
| v0.2 Core Services & Settings | 设置事务、Pause、Audio、Localization、Capability | 实际平台输出和显示恢复 |
| v0.3 Runtime & Content | SceneFlow、保存恢复、资源、稳定 ID、Time/Random、导航 | 长时间切换、原生存储回归 |
| v0.4 Local Multiplayer Robustness | Inactive、关系配置、CameraPolicy、竞争仲裁、Shared claim、菜单归属 | 热插拔与多人软锁实测 |
| v0.5 Universal Gameplay Kernel | Actor/Action/Interaction/Ownership/Relationship/Tags/Trigger/Feedback | 与原型联动验收；不扩建通用框架 |
| Marketable Prototype Gate | 接力为候选 A，可比较其他 Genre | NOT RUN；不预填 KEEP/ITERATE/KILL |
| Game Direction Lock | 未锁定 | 依据体验/产品证据 |
| Genre Packs | 当前只隔离已使用的 relay 实验 | 新 Pack 必须有当前场景和验收 |
| Vertical Slice | 未开始 | 完整一局/循环、保存、结果与返回 |
| Foundation Lock | 未通过 | Slice 通过后转内容生产 |

当前次序：完成 3D 迁移回归 → 完整双人接力和设备/Windows Gate → 比较玩法假设。只有当前原型确实需要，才加入最小专业模块；不同时建设格斗、赛车、经营、剧情或网络框架。

[差量清单](PLAN_DELTA_V5.md) · [验证](VALIDATION_V5.md) · [Prototype Gate](PROTOTYPE_GATE.md) · [资产流程](ASSET_PIPELINE.md) · [工作流整合](WORKFLOW_V5.md)。

## 用户最新方向：长期多类别
产品先选类别，赛车长期保留。当前 R0 已实现赛车驾驶验证代码；手动 Gate 待通过。下一步依次为 R0 实机与调参 → 第二赛道/视觉候选 → 成绩存储/完整卡通赛道 → Windows 试玩。其他类别独立立项，不因赛车上线删除接力或提前建设无需求的故事/战斗系统。
