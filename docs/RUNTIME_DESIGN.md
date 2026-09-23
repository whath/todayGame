# Runtime & Content Foundation

## R0 审视

v0.2 只有单场景 Bootstrap，运行开始即创建世界；暂停统一但 dt 由入口直接传递，没有进度存档、应用场景状态或资产作用域。UI 只有设置层；角色数值和房间数据硬编码。v0.3 保留设置、输入、单相机和同 Prefab 约束，将应用流程和数据边界补齐。

## SceneFlow / Loading

TransitionRequest 指定目标 AppState 和稳定 contentId。prepare 必须在独立作用域内准备视图并保持不可见；activate 应同步完成，不得启动额外未托管加载。prepare 抛错时清理其自建节点；服务负责释放作用域。失败恢复原状态并显示错误，可再次请求。过期异步结果在服务销毁后不激活。

进度为单调 0–1；当前三阶段进度代表准备步骤，不是下载字节。启动、返回和重开都通过 SceneFlow。旧视图清理失败不会回滚已经激活的新视图，错误保留供日志读取。没有重叠的并发切换。

## 导航与输入

UINavigationService 按 modal > overlay > screen 选择一层，一次 Back 不会穿透。SettingsMenu 内部继续处理捕获、冲突和未应用确认。暂停工具页 Back 先退工具页，再退暂停。主菜单、加入、设置、暂停均支持手柄方向和确认 / 返回；实际手柄 UI Gate 待完成。

InputGlyphService 使用键盘当前绑定和通用手柄位置名称，不猜测 Xbox / PlayStation 型号。不修改设备独占关系。

## 时间与随机

TimeService 的 unscaledDelta 是安全非负原始 dt；uiDelta 上限 100ms；gameDelta 上限 50ms 后乘 0–4 的时间倍率，暂停为零。设置危险确认保留墙钟，不受时间倍率影响。RandomService 使用非零 uint32 xorshift32，支持 nextFloat、nextInt（右端开区间）、pick、复制后 shuffle。Snapshot 保存 seed 和 currentState，读档可继续序列；不承诺确定性物理或 Replay。

## 表现、反馈与事件

PlayerController 管行为，PlayerPresentation 管 Graphics / Label、动作文字和边框。P1 圆角与 P2 方角并配 P1/P2 标签，不只靠颜色区分。FeedbackService 接收 UI 确认 / 取消事件，预留 camera / rumble hook；当前无可靠震动和镜头震动后端，因此保持关闭，菜单不暴露假能力。减少闪烁会抑制 UI 脉冲。

DomainEvent 是实例持有的类型化订阅，不是全局字符串 EventBus；Join、Transition、Save、Feedback 有各自合同，返回取消订阅函数，服务销毁清理。主要业务依赖仍使用显式注入。

## 开发支持

GameLogger 使用分类及等级，最多保留 200 条；Release 只输出 WARN / ERROR，Playtest 不输出 DEBUG。BuildInfo 显示版本、源码 commit、UTC buildId 和变体，dirty 源码明确标识。Development 命令注册表支持 reload_scene、show_inputs、show_camera、set_timescale、set_seed、toggle_feature；菜单提供常用操作，未建立文本控制台编辑器或任意脚本执行器。

ui_feedback 是可移除实验标志，注册时记录用途；Release 强制关闭。没有采集网络遥测、性能池或复杂统计系统。
