# v5 差量对照

依据独立 v5 文档及同内容工作流包；规划版本不提升项目发布版本。

| 差量 | 本轮落地 | 验收边界 |
| --- | --- | --- |
| 固定 3D | MeshRenderer 灰盒、标准材质/光照、XZ 地面、共享 3D 相机 + UI Overlay | 平面玩法，不宣称通用 3D 刚体/动画系统 |
| Local Co-op → Local Multiplayer | 章程/路线/工作流中立化；接力保留为候选 | 不强行制作对抗游戏 |
| Inactive 替代 Core Downed | Presence 与重连测试更新 | 专业受伤状态以后归 Pack |
| Player/Partner/Opponent/Team/Neutral | 默认 Actor 无队伍，关卡明确选择关系；竞技关系显式 tag | Mixed/临时联盟可由运行时关系标记表达，未设计游戏规则 |
| CameraPolicy | shared-group、fixed-room；接力/房间/Lab 实际接入 | 未做分屏/赛车相机 |
| Competitive 仲裁 | 强制由玩法提供胜者函数，验证候选、失败释放 | 单元测试覆盖；无竞争原型实机证据 |
| Shared 所有权 | 多持有者，断线释放个人 claim 后其他人保留 | 单元测试覆盖；不增加道具系统 |
| 类型中立 Core | 机关与专用 HUD 模型移至 packs/relay；空间策略中立命名 | Level/Save 保留 coop 可选兼容字段 |
| 输入/未来联网边界 | 复用 InputDevice → Slot 抽象动作 → Player/Actor；Camera 与物理设备不进入 Player | 未实现网络、回放、预测/回滚，不承诺确定性 |
| 资产供应/处理 | 流程、目录、目录册、许可册、Manifest 模板 | 无正式外部资产，未下载/批准素材 |
| Workflow 包 | 46 skills、19 可选职责模板、设置任务模板、缺失文档 | 原 config 仅存参考，不自动多 Agent |
| Gate 指标 | 通用 + 合作/对抗分支；Slice 为一局/循环 | KEEP/ITERATE/KILL 未填写，无虚构证据 |

保留原始主文档/zip、历史验证/决策；不将旧章节中的固定合作、v0.1 当前里程碑或市场假设覆盖进当前规则。最终验证见 VALIDATION_V5。
