# 架构

`PrototypeBootstrap` 是 Cocos 组装入口，持有 GameServices、输入、SceneFlow、一个 Camera、HUD、RuntimeScreen 和 SettingsMenu。一个真实 Player Prefab 实例化两次；没有按玩家复制控制器。

## 模块与依赖

```text
platform → Cocos 输入、存储、音频、焦点、Prefab 引用
input → InputDevice → PlayerInputSlot → PlayerController → PlayerMovement
                                               └→ PlayerPresentation
content → Character / Level 定义 → PrototypeRoom / Player 初始化
runtime → SceneFlow / AssetScope / Navigation / Time / Random / Logger
save → Profile + Session DTO → Serializer → SaveService → Storage 接口
settings → Definition / Registry / Store / 事务 → 平台存储适配器
Player nodes → SharedCamera
```

core、input、services、settings、runtime、content、save 不依赖 `cc`。app / gameplay 负责引擎组装。Player 只读取槽位抽象动作，不读取物理按键、手柄 API 或 Camera；表现组件接收语义动作。Content 定义替代房间和角色的硬编码数值。

## 状态与场景

AppState 是 boot / mainMenu / localJoin / loading / gameplay。暂停原因仍统一归 PauseService。GameSession 只描述 lobby / playing / disconnected 的双人设备状态，不承担应用场景切换。

当前全部正式页面位于 Prototype.scene 容器内。SceneFlowAdapter.prepare 创建未激活世界，AssetScope 预持有 Prefab，报告进度，返回 activate / dispose。成功后换入新视图，销毁旧实例并释放旧作用域；失败保留旧视图。Loading 期间拒绝第二次请求。尚无跨 `.scene` 文件的异步关卡加载需求，不引入另一套 director 全局单例。

Lab.scene 复用入口，仅序列化不同 lab 标识和独立 UUID。Release / Playtest 构建配置只列 Prototype；运行时另有 Lab 禁用保护。

## 帧与生命周期

1. 设置危险确认按墙钟超时；读取键盘 / 手柄菜单语义。
2. UINavigation 将整帧交给最高层：modal > overlay > screen；toast / debug 不占焦点。
3. InputManager 每设备采样一次；加入页分配设备，游戏中允许断线槽位接管，设置和手动暂停时不分配。
4. GameSession 与 PauseService 更新；TimeService 计算 game / UI / unscaled delta。
5. Player 移动、表现、共享相机使用游戏时间；UI 使用 UI 时间。
6. HUD、RuntimeScreen、SettingsMenu 呈现快照。

禁用入口时移除平台监听、取消未应用设置；销毁时释放场景作用域、订阅、音源与输入。存档只在明确的保存或退出操作触发，不每帧写盘；直接关闭进程没有隐式保存保证。

## 碰撞与相机

保留静态 AABB 分轴扫掠、贴墙滑动、角色互相穿过。房间边界 / 障碍 / 出生点统一来自 LevelDefinition；未实现重力、旋转、推力、动态刚体。需要动态物理时优先接 Cocos Physics2D。

只有一个正交 Camera，沿 -Z 观察 XY；世界、HUD、菜单用 RenderRoot2D，菜单挂 Camera 子节点。SharedCamera 读取两人位置并平滑取景，视野限 260–900。首次实机验收面向 16:9，极端画幅和真实 UI 焦点仍待测试。

进度存档、实验存档与设置使用独立命名空间。没有通用服务定位器、全局事件总线、对象池、网络、Ability / Mod / Replay 系统。


## v0.4 首个互动实验

CoopLevel 数据接入 ContentRegistry；CoopChallenge 位于 core，读取玩家位置和槽位 interact 语义，计算踏板、门、终端与出口。Bootstrap 在移动前更新门碰撞、移动后解析机关；CoopPresentation 和 HUD 显示状态。完成或暂停时不推进游戏逻辑。保存 schema 3 加入 Session.coop，旧测试房间和共用 Player Prefab 保持。详见 COOP_CHALLENGE。


## 需求 v4 差量

PlayerInputSlot 另持有 PlayerPresence，身份不随设备连接消失。PlayerController 组合 Actor 与 ActionRunner，移动仍由原模块负责。CoopChallenge 使用 InteractionService／OwnershipService 和 TriggerRule；UI 提示来自纯 GameHUDViewModel。Bootstrap 将 Level 的空间／碰撞配置交给 resolvePairMotion，安全位置由 SpawnService 选取，Camera 只报告离屏。

菜单输入不再合并多个设备：平台输出独立边沿，组装层解析稳定玩家来源，UINavigation 检查顶层 owner，指针走同一检查；断线释放菜单与个人交互 claim。按键捕获为 owner 主动开启的键盘键值输入例外。键鼠是共享来源，不承诺识别两人的物理身份。详见 COOP_ROBUSTNESS / GAMEPLAY_KERNEL。
