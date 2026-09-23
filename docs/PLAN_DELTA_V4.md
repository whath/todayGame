# 需求 v4 差量对照与交付

对比基线：docs/reference/GAME_DEV_CODEX_MASTER_PLAN_V0.3.md；新输入：GAME_DEV_CODEX_MASTER_PLAN (3).md，标题为“市场验证版 v4”，不是游戏版本号。新版是重写与收敛，不能将删除的旧章节等同于删除既有功能。

当前源码版本 0.5.0-dev；没有将 v0.4 / v0.5 实机 Gate、Prototype Gate 或 Foundation Lock 标记为通过。

| 新版章节 | 相比上一版与现有代码的差量 | 本轮处理 |
| --- | --- | --- |
| 1、4、25、26 | v0.4 改为 Local Co-op Robustness，v0.5 改为最后的 Universal Gameplay Kernel | 重写 ROADMAP，更新 AGENTS 和停止规则；保留当前接力实验 |
| 2、3、23 | 更强调双人互动事件、手柄与 Windows，Remote Play readiness；题材不锁定 | 产品定义维持实验假设，平台边界保持；没有新增 Steam SDK、在线联机或移动层 |
| 5–7 | v0.1–v0.3 能力继续有效 | 保留输入、设置、存档、流程、资源与内容系统；旧存档 schema 3 不变 |
| 8 Player Presence | 原先只有槽位分配和连接状态 | 新增 Empty / Joining / Ready / Active / Disconnected / Downed / Spectating / Leaving；槽位实接 Join、Active、Disconnect、Reconnect、Leave |
| 8 Separation / Collision | 原先只有相机取景与玩家穿过 | 增加逐关卡距离策略、warning / soft / hard / block / regroup / teleport、off / soft / solid；当前关卡明确选择 warning + off；相机额外报告离屏 |
| 8 Arbitration / Claim | 接力终端为专用条件判断 | 通用请求／结果、Exclusive / Shared / Simultaneous / Cooperative / Queued；显式 None / Player1 / Player2 / Team / World ownership；终端与门实接 |
| 8 Spawn | 原先初始化直接放置 | SpawnService 检查边界、障碍、重叠与候选 fallback；实接新建、恢复和 regroup |
| 8 Shared UI | 多手柄菜单输入合并，任意设备可操作所有菜单 | 独立设备边沿；主菜单 Any，暂停／设置由打开者控制，内部确认沿用所有者；断线释放，避免菜单困住剩余玩家 |
| 8 Targeted Feedback | 只有可选 playerId 与 UI 确认 | 四种目标 + 交互／成功／失败／拾取语义；接力事件实接；无实际硬件能力仍不开震动菜单 |
| 8 Ghosting / Soft-lock | 无专用键盘检测场景和集中审视 | 增加实际 KeyboardGhostingLab，排除发布配置；COOP_ROBUSTNESS 记录软锁审视；硬件实测仍 NOT RUN |
| 9 Actor / State / Action | 玩家组件直接调用表现 | Actor 身份／控制器关联／状态／动作／标签／关系；可取消 Action 生命周期接入玩家动作，不含 Health 或 Damage |
| 9 Interaction / Trigger | 专用机关函数 | 接力终端使用 InteractionService，出口使用 TriggerRule；通用合同独立于引擎 |
| 10、18、21 | Prototype Gate、KEEP / ITERATE / KILL 和停止扩底座规则 | 新增 PROTOTYPE_GATE 模板与可选 Pack 准入条件，不填写虚构试玩结论 |
| 11、12 | 专业 Gameplay Packs 和 Production Layer 后置 | Combat、Narrative、Mission、Roguelike、Management、Social 等仅列准入规则，尚不创建模块；角色主题、动画资源、正式关卡管线待 Direction Lock |
| 13、14 | ViewModel 与语义表现合同 | 新增纯 GameHUDViewModel，接力提示经模型输出，Audio / VFX 接收语义 ID；已有 PlayerPresentation 保持独立 |
| 15 | 轻量内容制作校验 | 增加 validate:content，校验注册定义、文案、元数据唯一性、场景／Prefab 引用；不存在的 Mission／Dialogue 不提前实现校验器 |
| 16、17 | Vertical Slice 之后才 Foundation Lock | 明确分阶段验收；当前不是可上线版本 |
| 19、20、22、24 | 推荐专业角色／Skills、Devlog 结构、禁止提前扩展项 | 写入项目执行约束和文档；推荐角色名称不是授权启动 Agent 或安装新插件，未创建空壳技能体系 |

## 边界

单物理键盘上的菜单命令无法可靠识别由哪个人按下，因此键鼠作为共享 `keyboard` 来源，手柄按独立玩家来源锁定菜单。键鼠不能操作手柄拥有的模态窗口；唯独由所有者主动开启的按键捕获接受键盘键值，不接收其菜单导航。

Downed / Spectating 是状态接口，没有引入死亡、生命或旁观玩法。Auto Regroup / Teleport 在 Core 中产生请求，由组装层经 SpawnService 一起返回安全出生点；不包含计时器、传送动画或网络同步。Solid 是保守阻挡，不是物理刚体；Soft 是轻微推离。

本轮使用新版需求作为开发范围，不复述其市场统计为本项目实证，也没有启动游戏、安装 Creator、运行 Windows 构建或录制试玩。
