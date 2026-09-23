# Universal Gameplay Kernel

当前为最后一层强制通用基础的最小实现，服务现有接力原型；不引入生命、伤害、武器、任务、对白或经济系统。

Actor 持有稳定 ID、controller 引用标识、team、状态字符串、tags、owner 与 ActionRunner。PlayerController 将槽位绑定到 Actor，实际移动仍通过已有 PlayerMovement；PlayerPresentation 保留为外部表现组件。tags 是轻量 Set，关系查询支持 Self / Partner / Team / Neutral / Hostile，不是 Ability System。

ActionContract 规定 canStart → start → update → complete 或 cancel；运行中不能重入，异常取消，停用／断线／销毁取消。动作语义含 Move、PrimaryAction、SecondaryAction、Interact、SpecialAction，不默认赋予战斗意义。现有主／次／交互表现使用即时动作；Move 保留连续运动实现，SpecialAction 暂无玩家输入绑定，未来由实际原型添加。

InteractionRequest / Result 与 Interactable 由 InteractionService 管理；Contract 不接收 Node。接力终端实用 Cooperative 策略。TriggerRule 接收 trigger / condition / action，可配置一次性执行和 reset；出口实用“双方进入 → 门已永久开 → 完成”，不创建 Mission 或 Quest 框架。

GameHUDViewModel 输出 objectiveId、P1/P2 promptId、notifications、context，完全不依赖 UI 或 Localization。组装层翻译字符串，PrototypeHUD 渲染；未来主题替换无需修改 CoopChallenge。FeedbackService 只发送语义与目标，资源仍由表现层绑定。

## 停止规则

本轮之后进入 Prototype Gate 准备阶段，停止以“将来可能需要”为理由继续扩通用框架。现有接力关仅是原型候选之一，尚不是 10–20 分钟市场验证原型。后续需求先落实为可玩的挑战，再决定是否抽取共用能力。

新 Gameplay Pack 必须同时具备：明确的当前玩法需求、真实使用场景、可核对的 Acceptance Criteria、将在当前 Prototype 或 Vertical Slice 中实际使用。没有这些条件就留在文档，不生成空模块。
