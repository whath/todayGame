# Development Test Labs

打开 `assets/labs` 下实际场景，或 Development 主菜单中的“实验场景”。四个场景共用 Bootstrap 和 Player Prefab，用各自序列化的 lab 标识选择起点；没有四套重复玩法代码。

| 场景 | 行为 | 人工检查 |
| --- | --- | --- |
| InputLab | 进入加入界面，显示槽位设备 ID 和移动向量；可开始双人房间 | 键盘 B 先加入、重绑定、两个手柄断线和接管、菜单期间不误加入 |
| CameraLab | 无需设备，以两个人工轨迹拉开玩家间距 | 16:9 窗口内双人取景、平滑、缩放、暂停后轨迹停止 |
| SettingsLab | 自动打开真实设置 UI | 手柄分类 / Back、预览 / 应用 / 取消、冲突和确认窗口、UI 缩放 |
| SaveLab | 写入实验 Profile 快照、读取并显示状态 / schema / 会话数 | 重启后读取；正式进度未受影响 |

CameraLab 的轨迹专用于镜头取景，可穿过静态障碍，不是玩法移动。SaveLab 的主菜单快照 session 为空，完整位置恢复通过 Prototype 的手动保存 / 继续流程检查。故障注入、schema 1 迁移和随机状态恢复在自动测试中执行，不在用户存档上制造损坏。

实验存档固定在 `duogame.labs.saves`；退出实验回主菜单重置实验内存 Profile。SettingsLab 使用真实用户偏好，Apply 会保存，Cancel 只撤销未应用修改。InputLab / SaveLab 可用 Back 退出；CameraLab 经暂停菜单返回主菜单；SettingsLab 先关闭设置，再选择返回。

Release / Playtest 配置只包含 Prototype，运行时也拒绝 Lab 启动。R10 的四个场景已建立；规划较早章节提到的 AudioLab 暂不单建，当前无音频测试素材，音量总线已有纯逻辑测试，真实音频输出仍在待验收清单。


## KeyboardGhostingLab（需求 v4）

新增实际场景及 Development 菜单入口，读取 KeyboardAdapter 接收到的当前按键和同时按住的峰值。人工同时按 P1/P2 的移动与动作键，核对是否缺键；无法由软件得知硬件未上报的键，也不自动给出 PASS。用户要求不运行游戏，因此硬件检查 NOT RUN。Development 现在含五个 Lab；Release / Playtest 仍只包含 Prototype。
