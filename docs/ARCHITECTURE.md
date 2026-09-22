# 架构

`PrototypeBootstrap` 是场景组装入口，持有 GameServices、输入、会话、房间、两个 Prefab 实例、一个相机、HUD 和 SettingsMenu。GameServices 在输入启用前载入和应用设置。场景文件仍保存入口及同一个 Player Prefab 引用，房间与 UI 使用 Cocos Graphics / Label 创建。

## 输入与依赖

```text
KeyboardAdapter / CocosGamepadAdapter
                ↓ RawInput
          InputDevice.sample()
                ↓ InputFrame
            InputManager
                ↓ 独占分配
          PlayerInputSlot
                ↓ 抽象动作
 PlayerController → PlayerMovement → CollisionWorld

Player nodes → SharedCamera
InputManager + GameSession → PrototypeHUD
```

`core/InputTypes` 是不依赖引擎的合同；`input` 不引用 `cc`。`platform` 承担物理设备与引擎事件，Player 只读取槽位。GameSession 使用输入管理器判断是否两人就绪。

## 每帧顺序

1. 引擎事件更新适配器；SettingsService 按墙钟检查确认超时。
2. 处理菜单 / 暂停语义命令；InputManager 为每个设备采样一次。菜单内禁止加入。
3. 计算 lobby / playing / disconnected；PauseService 合并暂停原因。
4. 两个 PlayerController 使用同帧输入及无障碍偏好，仅允许游戏运行时移动。
5. SharedCamera 读取两人位置与跟随强度，调整取景。
6. HUD 和 SettingsMenu 读取服务快照，应用 UI 缩放与中文文案。

入口集中调用 `tick`，避免多个组件隐式 update 顺序。单帧 dt 上限 50ms；失焦清空键盘状态，是否暂停由设置决定。暂停不会冻结设置 UI、输入连接状态或确认超时。

## 碰撞

第一版是 kinematic AABB：角色采用正方形，障碍为静态轴对齐矩形，分别沿 X、Y 扫掠截断位移，使角色能够贴墙滑动。边界、障碍视觉与碰撞数据都来自 PrototypeRoom。

此实现只服务于当前静态房间，没有刚体、物理事件、推力、重力或旋转。出生点必须在无障碍区域内，不提供把已重叠物体推出障碍的求解器。角色之间不碰撞。后续需要动态物理时优先替换为 Cocos Physics2D，而不是持续扩展自制物理系统。

## 相机和渲染

场景只有一个 Camera，正交投影沿 -Z 观察 XY 平面。Game World、HUD、SettingsMenu 分别使用 RenderRoot2D，均由同一 Camera 渲染。HUD 和菜单挂在 Camera 子节点，按 orthoHeight 与 UI Scale 缩放；没有第二个 UI 相机。

相机跟随双人中心，按两人的水平 / 垂直跨度及画幅计算视野，指数平滑，orthoHeight 限制在 260–900。镜头目标限制在房间范围内；视野大于房间时居中并显示周围背景。安全视野修正用于防止跟随滞后把玩家移出屏幕；极端画幅仍受最大视野约束，首次验证面向 16:9 桌面窗口。

## 生命周期

入口启用时注册监听，禁用时取消监听和未应用设置；销毁时停止音频并清理服务、设备和槽位。焦点事件由 CocosFocusAdapter 管理，PauseService / AudioService 分别响应。断开的手柄对象从管理器设备表移除，但被原槽位保留用于显示断开状态；重连需要按键确认。

设置通过独立 SettingsService / Persistence 保存，与未来进度存档分开。项目未引入全局事件总线、服务定位器、网络层或通用 UI 框架。服务的详细所有权、接口及限制见 CORE_SERVICES.md 和 SETTINGS_DESIGN.md。
