# Core Services ownership

## S0 审视结论

原工程的窗口失焦、输入监听、暂停状态全部位于 PrototypeBootstrap；按键映射与手柄死区写死在适配器；HUD 和动作提示硬编码英文；尚无存储、音频或设置服务。

本轮按新版规划实现 v0.2 基础层，保留原双人 Prefab、碰撞、共享镜头与单场景结构。v0.1 实机 Gate 尚未完成，故此为开发推进，不把前置验收或 v0.2 发布 Gate 标记为通过。

| Owner | 职责 | 不负责 |
| --- | --- | --- |
| GameServices | 创建并销毁本场景基础服务，按顺序载入与应用设置 | 全局服务定位器 |
| PrototypeBootstrap | 场景组装、输入采样、游戏与菜单的执行顺序 | 平台窗口 API、音量与磁盘实现 |
| GameSession | lobby / playing / disconnected；返回加入界面 | 多场景加载框架 |
| SettingsService | 工作副本、预览、应用、还原、确认倒计时、事件 | 绘制控件、直接访问存储 |
| SettingsRegistry / Store | 定义与校验 / 已提交和运行快照 | UI、平台判断 |
| CocosSettingsPersistence | `duogame.settings` 字符串读写 | 玩家进度、成就、游戏存档 |
| CocosPlatform / CapabilityService | 真实可用能力、设计分辨率、引擎目标帧率 | 未实现的原生显示能力 |
| AudioService / CocosAudioAdapter | 总线混音 / AudioSource 播放与销毁 | 正式音频素材 |
| PauseService / CocosFocusAdapter | 暂停原因集合 / 失焦与隐藏事件 | 分散调用 game.pause |
| AccessibilityService | HUD 缩放、镜头跟随、减少动作闪光 | 假字幕和假震动功能 |
| LocalizationService | 字符串 ID、参数替换、键名中文化 | 无需求的完整多语言翻译 |
| DiagnosticsService | 开发版 FPS、帧时和显示状态 | Release 中开放调试面板 |
| InputManager / Input adapters | 独占分配 / 物理事件到逻辑输入 | 从设置页重新绑定设备 |

没有新增尚未需要的 SaveService、账号 Profile、复杂场景流或全局 EventBus。`scope: profile` 是定义合同预留字段，当前实际注册项是全局或 P1/P2 槽位设置；不声称已实现多用户存档。

## 启动与清理

GameServices.boot：视图初始化 → 读取设置 → schema 迁移 → 校验补默认 → 应用支持的设置 → 创建房间 / 玩家 / HUD / 设置页面 → 注册输入及焦点监听。

每帧：确认超时检查（墙钟时间）→ 菜单命令 → 输入采样 → 会话状态 → 暂停条件 → 玩家 → 镜头 → HUD / 设置页。暂停时仍处理 UI、掉线和设置还原。

入口禁用时取消监听并取消未应用设置；销毁时停止音源、移除服务订阅、清理输入。音源完成播放或调用 stop 后移除混音注册并销毁节点。

引擎声明校验采用官方 `@cocos/creator-types@3.8.6`；该包不包含 Creator 自动生成的 `cc/env`，无头校验仅补充 `DEBUG: boolean` 声明，不替代引擎 API 类型。

## v0.3 ownership 补充

此文前面的 S0 为 v0.2 历史审视；当前架构以 ARCHITECTURE / RUNTIME_DESIGN 为准。新增 SceneFlowService、AssetService、TimeService、RandomService、UINavigationService、InputGlyphService、FeedbackService、GameLogger、BuildInfo / FeatureFlagService 和 SaveService，均由场景明确持有并清理。

SaveService 使用平台 SaveStorage，正式与实验命名空间分开；Profile 是本地数据而非账号。ContentRegistry 在启动时验证定义，再由 SceneFlow 创建世界。暂停仍归 PauseService，音量仍归 AudioService，设置事务规则不变。GameSession 不再决定是否展示游戏页面，只负责玩家连接状态。
