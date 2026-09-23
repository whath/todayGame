# 路线图（以需求文档 v4 为准）

历史源码版本与里程碑验收分开。当前源码 **0.5.0-dev**；此前实机 Gate 未完成，不能据版本号推断已经发布或验收。

| 阶段 | 目标 | 当前状态 |
| --- | --- | --- |
| v0.1 Local Co-op Foundation | 双人独立输入、共享角色和相机、热插拔 | 代码与无头回归已有；Windows／设备待验收 |
| v0.2 Core Services & Settings | 设置事务、音频、暂停、文案与平台能力 | 代码与无头回归已有；实际输出待验收 |
| v0.3 Runtime & Content Foundation | 场景流程、存档、资产、内容、时间随机 | 代码与无头回归已有；引擎生命周期待验收 |
| v0.4 Local Co-op Robustness | 玩家身份、交互竞争、空间策略、安全出生、菜单归属 | 本轮补齐最小实现并接入接力实验；实机未验收 |
| v0.5 Universal Gameplay Kernel | Actor／State／Action／Interaction／Relation／Tags／Trigger／Feedback | 本轮补齐合同与真实调用；最后一层强制通用基础 |
| Marketable Prototype Gate | 10–20 分钟灰盒，观察沟通、等待、失败与再玩 | NOT RUN；当前接力关仅为候选 A |
| Game Direction Lock | 基于原型证据确定产品方向 | 未开始 |
| Gameplay Packs | 只选择当前方向需要的专业模块 | 未开始；不自动加入战斗或剧情 |
| Vertical Slice | 完整产品流程及已启用 Pack 验证 | 未开始 |
| Foundation Lock | 停止扩框架，正式内容生产 | 未通过 |

下一步应围绕现有接力实验和新的玩法假设制作可比较的灰盒内容；用户恢复运行授权后补基础 Gate 并实际试玩，得出 KEEP / ITERATE / KILL。不好玩先改玩法，不用加通用系统替代反馈。

当前不做自研联网、完整 Ability／RPG Stats、Narrative Graph、Quest Editor、经济／合成／背包、Mod／Workshop、DLC 管理或完整 Replay。角色、关卡、主题资源与 UI 的生产配置待 Direction Lock 后按实际内容需求建设。

详细映射：[v4 差量](PLAN_DELTA_V4.md) · [合作健壮性](COOP_ROBUSTNESS.md) · [玩法内核](GAMEPLAY_KERNEL.md) · [Prototype Gate](PROTOTYPE_GATE.md) · [本轮验证](VALIDATION_PLAN_V4.md)。旧验证记录保留为历史证据。
