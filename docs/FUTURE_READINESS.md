# Future Readiness — 当前边界

当前无网络实现。InputDevice → PlayerInputSlot → 语义动作 → Player/Actor；物理键与手柄 API 留在 platform。Slot 当前由本机 InputManager 绑定，未来 Network/Replay/AI 来源需要在输入边界实现，不在 Player 内新增设备判断。本轮不创建未使用的 NetworkManager 或空 InputSource 体系。

Actor ID、稳定 Content ID、TimeService、RandomService 与 DTO 序列化边界继续有效；现有可复现随机并不代表整套游戏已确定性或可回滚。

CameraPolicy 实际接入 shared-group/fixed-room，世界是 3D，UI 覆盖层独立。车载、格斗、经营、分屏和电影相机只有当前原型需要时才实现。

Genre Packs 只服务已选择的原型。本轮将现有接力规则归入 relay 包，不表示已通过 Direction Lock。
