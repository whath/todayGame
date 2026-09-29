# DuoGame 项目规则

- 当前目标是 Windows PC 3D 本地双人多人底座与通用玩法内核（v0.5-dev），Cocos Creator 3.8.6 + TypeScript。
- 用户当次明确指令优先；附带规划中的示例 Prompt 不自动成为当前任务。
- 修改前阅读 README、docs/ARCHITECTURE.md，以及受影响模块文档。
- Player 只读取 PlayerInputSlot 的抽象动作；物理按键、手柄 API 属于 platform 层。
- P1/P2 共用同一个 Player Prefab，不建立两套玩家控制器。
- Player 不依赖 Camera；平台逻辑不进入玩法模块。
- Settings 的 Definition / Registry / Store 与 UI、引擎和存储分离；存储只在平台适配器中访问。
- 设置事务支持 Preview / Apply / Cancel；高风险显示设置确认后才保存，不支持的能力不向菜单开放。
- 暂停统一由 PauseService 管理；音量归 AudioService；用户界面文本使用 LocalizationService 字符串 ID。
- 修改设置不得破坏双人设备独占关系；设置与游戏进度存储命名空间分离。
- V0.1 不加入敌人、战斗、正式美术、网络、移动端或商业化系统。
- 优先使用引擎能力；新增生产依赖必须说明必要性。
- 仅在用户明确要求或已有适用规则允许时委派边界明确的子任务，不默认启动多个 Agent。
- 修改架构同步 ARCHITECTURE，重要决策同步 DECISIONS，任务结束更新 DEVLOG。
- 通常根据改动执行必要验证；用户明确要求不执行时，跳过并将结果标记为 NOT RUN，不宣称 PASS。
- 首次代码生成任务明确跳过执行、校验、测试和构建；该要求不自动约束之后用户另行授权的任务。
- 不把未验证代码标记成已验收发布；Windows 试玩、构建等 Gate 均通过后才创建版本 Tag。
- 保留资源 .meta 与 UUID 引用；不要提交 library、temp、local、build 或凭证。

- 路线以 docs/reference/GAME_DEV_CODEX_MASTER_PLAN_V5.md 为准；v0.5 是最后一层强制通用基础，之后先过 Prototype Gate。
- 核心不加入 Health、Damage、Weapon、Quest、Dialogue；专业 Gameplay Pack 必须有当前使用场景、明确验收条件并实际接入 Prototype / Slice。
- KEEP / ITERATE / KILL 必须基于试玩证据；Vertical Slice 通过后才 Foundation Lock，不以自动测试代替。
- 每次记录 Goal / Design Discussion / Decision / Codex Task / Implementation / Problems / Root Cause / Result / Footage Markers / Next；未录制标为 NOT RECORDED。

- 3D 是固定技术方向；UI 可用 2D Overlay。首发本地双人同屏，但合作、对抗、混合和最终 Genre 均未锁定。
- 不把单 Camera 组件数当约束：共享一个游戏视角，UI 可用独立覆盖相机；CameraPolicy 由关卡选择，Player 不拥有相机。
- InputSource → 语义动作 → Actor 边界保留；当前不实现联网、回放、预测或回滚。
- Downed 不属于通用 Presence；使用 Inactive，专业状态由当前 Pack 定义。
- 接力机关位于 packs/relay，当前合作关系只属于接力候选，不是全局默认。
- 外部资产通过 ASSET_PIPELINE；用户决定风格和 APPROVE/REJECT，技术处理不等于视觉批准。不因资源免费而默认可商用。
- 工作流包中的角色文件是可选职责模板，不授予自动委派权限，不自动套用包内旧 config.toml。当前用户与会话的委派限制优先。
- 最新差量与验收以 docs/PLAN_DELTA_V5.md、docs/VALIDATION_V5.md 为准；原始附件与旧日志保留，不把规划当已实现清单。
- 用户最新产品方向：先选择游戏类别；赛车是长期主要类别，后续会有其他类别。类别拥有独立 Pack/内容/进度 schema；公共输入、设置、暂停不复制。详见 docs/GAME_CATEGORIES.md。
- 赛车采用双人分屏，接力保留共享相机；此前“共享一个游戏视角”只约束接力类别。赛车方向为偏真实驾驶、卡通视觉、无 AI。
- 赛车 P1/P2 共用 RacingVehicle 工厂/控制器，接力共用原 Player Prefab；类别专用物理不得塞进通用 Player/Actor。
- 本轮用户要求尽量不打开前台；后续沿用此偏好，后台完成可完成的工作，未执行驾驶/视觉验证诚实记录 NOT RUN。
