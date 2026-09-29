# 架构

`PrototypeBootstrap` 是 Cocos 组装入口，持有 GameServices、输入、SceneFlow、接力共享 3D Camera 或赛车双分屏 Camera，以及一个共用 2D UI Camera、HUD、RuntimeScreen 和 SettingsMenu。一个真实 Player Prefab 实例化两次；没有按玩家复制控制器。

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

core、input、services、settings、runtime、content、save 不依赖 `cc`。app / gameplay 负责引擎组装；packs/relay 保存当前接力专用纯规则。Player 只读取槽位抽象动作，不读取物理按键、手柄 API 或 Camera；表现组件接收语义动作。Content 定义替代房间和角色的硬编码数值。

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

接力与测试房间保留静态 AABB 分轴扫掠、贴墙滑动、角色互相穿过。房间边界 / 障碍 / 出生点统一来自 LevelDefinition；未实现重力、旋转、推力、动态刚体。这些规则作用于 3D XZ 地面的逻辑脚印；需要动态物理时优先接 Cocos Physics3D。

共享世界 Camera 在 3D XZ 地面上方倾斜取景，仅渲染 DEFAULT 层；CameraPolicy 由关卡选择 shared-group 或 fixed-room。UI Camera 固定正交，priority=10、DEPTH_ONLY、UI_2D，独立单 RenderRoot2D 管理 HUD → 运行菜单 → 设置，不参与玩家取景。共享屏幕不等于只允许一个 Camera 组件。

进度存档、实验存档与设置使用独立命名空间。没有通用服务定位器、全局事件总线、对象池、网络、Ability / Mod / Replay 系统。


## v0.4 首个互动实验

CoopLevel 数据接入 ContentRegistry；CoopChallenge 位于 packs/relay，读取玩家位置和槽位 interact 语义，计算踏板、门、终端与出口。Bootstrap 在移动前更新门碰撞、移动后解析机关；CoopPresentation 和 HUD 显示状态。完成或暂停时不推进游戏逻辑。保存 schema 3 加入 Session.coop，旧测试房间和共用 Player Prefab 保持。详见 COOP_CHALLENGE。


## 通用内核与本地多人

PlayerInputSlot 另持有 PlayerPresence，身份不随设备连接消失。PlayerController 组合 Actor 与 ActionRunner，移动仍由原模块负责。CoopChallenge 使用 InteractionService／OwnershipService 和 TriggerRule；UI 提示来自纯 GameHUDViewModel。Bootstrap 将 Level 的空间／碰撞配置交给 resolvePairMotion，安全位置由 SpawnService 选取，Camera 只报告离屏。

菜单输入不再合并多个设备：平台输出独立边沿，组装层解析稳定玩家来源，UINavigation 检查顶层 owner，指针走同一检查；断线释放菜单与个人交互 claim。按键捕获为 owner 主动开启的键盘键值输入例外。键鼠是共享来源，不承诺识别两人的物理身份。详见 COOP_ROBUSTNESS / GAMEPLAY_KERNEL。

## v5 3D / 类型中立边界
WorldCoordinates 在厘米平面数据与米制 XZ 世界之间转换，存档 schema 3 坐标不改含义。网格/材质由 GreyboxGeometry 拥有并释放，Greybox.mtl 是场景显式依赖，确保着色器预加载。PlayerPresentation 使用球体/方柱，HUD 投影语义标签，Player 不引用 Camera。

Presence 通用状态为 Inactive，队伍不再由 Player 写死；接力 Level 明确 cooperative，测试房间 neutral。Competitive 要求目标提供胜者函数，Shared claim 可由多个 Actor 持有。空间规则文件为 MultiplayerPolicies，接力 HUD 为 packs/relay/RelayHUDViewModel。Level 与 Save 中 coop 是现有 Pack 的兼容接入字段，不是所有玩法的必需项。没有新增生产依赖或网络实现。
## 长期多类别 / 赛车 R0
入口改为类别选择，稳定 ID racing / relay 由 app/GameCategories 安装到纯 CategoryRegistry；SceneFlow 请求携带 categoryId 与类别自己的 contentId。公共输入、暂停、设置、时间不属于任何类别；车辆/赛道/圈赛位于 packs/racing，刚体与相机位于 gameplay/racing，详见 GAME_CATEGORIES。
赛车使用同一个 RacingVehicle 工厂实例化 P1/P2，消费 PlayerInputSlot 的 steering/throttle/brake 与 interact；没有复用角色地面 AABB 来模拟车辆。Cocos PhysicsSystem 在应用入口统一手动步进，赛车按 gameDelta 驱动 120Hz 子步；暂停为零步。矩阵/自动模拟状态在入口销毁时恢复。赛车两台透视相机各占半屏，UI priority 10；接力继续使用共享正交相机。
赛车当前不进入 SaveSnapshot schema 3，不展示中途保存/继续；接力存档兼容路径保留。后续类别采用独立内容和进度 schema，禁止把赛车字段堆进通用 Actor/Level。当前 Bootstrap 仍是两个类别的显式组装点，没有引入无使用场景的动态插件框架。
