# 架构

`PrototypeBootstrap` 是唯一组装入口，创建输入服务、会话、房间、两个 Prefab 实例、一个相机和 HUD。场景文件保存入口以及 Player Prefab 引用，房间与 UI 使用 Cocos Graphics / Label 在运行时创建。

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

1. 引擎事件更新设备适配器。
2. InputManager 为每个设备采样一次，计算按钮上升沿，处理加入和替换。
3. 处理返回大厅 / 重置，计算 lobby / playing / disconnected 状态。
4. 两个 PlayerController 使用同一帧输入，移动与碰撞。
5. SharedCamera 读取两个玩家位置，调整中心和视野。
6. HUD 更新连接状态，跟随镜头缩放保持屏幕尺寸。

入口集中调用 `tick`，避免依赖多个组件的隐式 update 执行次序。单帧 dt 上限为 50ms，窗口失焦暂停并清空键盘状态，恢复时不补算长时间移动。

## 碰撞

第一版是 kinematic AABB：角色采用正方形，障碍为静态轴对齐矩形，分别沿 X、Y 扫掠截断位移，使角色能够贴墙滑动。边界、障碍视觉与碰撞数据都来自 PrototypeRoom。

此实现只服务于当前静态房间，没有刚体、物理事件、推力、重力或旋转。出生点必须在无障碍区域内，不提供把已重叠物体推出障碍的求解器。角色之间不碰撞。后续需要动态物理时优先替换为 Cocos Physics2D，而不是持续扩展自制物理系统。

## 相机和渲染

场景只有一个 Camera，正交投影沿 -Z 观察 XY 平面。Game World 与 HUD 分别使用 RenderRoot2D，均由该 Camera 渲染。HUD 挂在 Camera 子节点，按 orthoHeight 缩放；没有第二个 UI 相机。

相机跟随双人中心，按两人的水平 / 垂直跨度及画幅计算视野，指数平滑，orthoHeight 限制在 260–900。镜头目标限制在房间范围内；视野大于房间时居中并显示周围背景。安全视野修正用于防止跟随滞后把玩家移出屏幕；极端画幅仍受最大视野约束，首次验证面向 16:9 桌面窗口。

## 生命周期

入口启用时注册监听，禁用和销毁时取消监听；销毁时清理设备和槽位。断开的手柄对象从管理器设备表移除，但被原槽位保留用于显示断开状态。重连产生新的连接代次，必须按键确认，避免仅按可复用 deviceId 自动抢占玩家。

项目未引入全局事件总线、服务定位器、网络层、存档系统或 UI 框架。
