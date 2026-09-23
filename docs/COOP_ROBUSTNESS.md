# Local Co-op Robustness

## 身份与设备

PlayerPresence 属于稳定 P1/P2 槽位，设备连接对象可被替换。首次加入为 Empty → Joining → Ready，进入房间激活为 Active。断线保存原状态，再加入恢复；Downed / Spectating 只提供显式转换接口，不假定有战斗或死亡。

加入页面可选择 P1 / P2 退出槽位，Leaving → Empty；需设备回到 neutral 后重新按键才能加入。回主菜单释放全部槽位；游戏中当前离开路径是返回加入页。重连保持原槽位顺序，不声称永久识别硬件序列号。

## 空间策略

LevelDefinition 可指定 playerCollision（off / soft / solid）和 separation（mode、maximumDistance）。没有配置时默认穿过、距离警告；接力关显式使用 off + warning（1000 单位）。

- warning 只提示，不限制移动。
- softTether 超距后将继续拉远的本帧位移缩至 20%；hardTether 拒绝该帧拉远。
- blockProgress 允许移动，超距时不推进交互和出口 Trigger。
- autoRegroup / teleport 发出 regroupRequested；Bootstrap 使用 SpawnService 检查两个出生点后一起放置。当前两策略共享安全回起点实现，没有延时或表现差异。
- off 允许穿过；soft 在重叠时轻微推离并经过世界碰撞；solid 对相对运动做扫掠，阻止重叠和同帧交换穿透，可能让双方都停下，不实现推挤刚体。

SpawnService 只选择传入候选，校验边界／障碍／已占位置，无安全点则明确失败，不任意随机传送。实例化前准备所有出生点，失败不切换世界。相机仍不属于 Player；达到最大取景后离屏会报告 warning。

## 交互与占有

InteractionService 以一帧请求批次处理，按 actorId 排序打破 Exclusive 的同时争抢；重复请求按 Actor 去重。Shared 执行所有合格请求；Simultaneous 要同帧满足人数；Cooperative 还要求合作条件；Queued 按进入队列顺序等待释放，执行前重新检查资格。断线时移除该 Actor 排队与独占 claim。

接力终端用 Cooperative：另一位玩家必须站在踏板上；成功后门归 Team，不因其中一人断线关闭。World / Team 所有权都不能被任意玩家 release。队列和占有在世界销毁时清理；它们不是存档内容，持久进度仍由关卡 Snapshot 表达。

## 菜单与反馈

Main Menu / Local Join 为 Any。暂停保存打开来源；设置继承上层 owner 或打开来源；确认对话框在 SettingsMenu 内部，因此使用相同 owner。每帧最多选一份菜单命令，避免两只手柄的方向与确认拼成一份操作；每只手柄独立生成边沿。鼠标同样经过归属检查。

手柄已加入时 owner 为 player.1 / player.2，否则用连接 ID。断线释放其所有菜单层 owner，剩余设备可接管。共享键盘无法识别人，键鼠 owner 为 keyboard。主动的按键绑定捕获允许键盘输入键值，其他菜单命令仍锁定。

FeedbackService 的目标为 Player1 / Player2 / AllPlayers / World。Rumble 按目标路由，World 不震动手柄；Audio / VFX 接受语义 ID。实际 Rumble 与 Camera hook 未开放，当前只能证明路由逻辑，不能声称有实际音效或硬件震动。

## Co-op soft-lock audit

| 风险 | 当前处理 | 证据／限制 |
| --- | --- | --- |
| 门把队友夹住／关在外面 | 门口保持开启；伙伴可回踏板重新开门，终端后永久开门 | 规则与完整路径测试；实机待测 |
| 断线丢失身份／独占物 | 槽位保留，排队／个人 claim 释放；门的 Team 状态保留 | 状态／仲裁测试；无道具资源系统 |
| 模态 owner 断线无法退出 | 释放 owner，剩余设备可操作 | 导航测试；真实输入待测 |
| 一人先结束遗弃队友 | BothPlayersEnter + 永久解锁条件 | 接力完整路径测试 |
| 出生点阻塞或重叠 | 有限安全候选，失败保留旧世界 | Spawn 测试；新布局仍需设计验收 |
| 同键盘多键丢失 | GhostingLab 显示收到的键及峰值，手动核对 | NOT RUN，不自动认证 |
| Solid 堵路／距离限制破坏合作 | 策略逐关卡选择，当前接力保持 off + warning | 其他策略的实际关卡体验尚未验收 |

键盘物理拔插不由当前 Cocos 键盘适配器识别，keyboard owner 不能像手柄一样自动判定断线；该情况下需要恢复键鼠设备。此限制与多键冲突均保留在真实设备 Gate，不宣称覆盖所有硬件失效场景。
