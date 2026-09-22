# DuoGame 项目规则

- 当前目标是 Windows PC 本地双人核心服务与设置基础层（v0.2-dev），Cocos Creator 3.8.6 + TypeScript。
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
