# Save / Profile

SaveSnapshot schema 2 保存 profileId、slotId、savedAt、ProfileSnapshot 和可空 SessionSnapshot。Profile 记录已解锁内容、已完成关卡、会话数；Session 记录关卡 / 角色 ID、seed / randomState、经过秒数和两位玩家坐标。仅序列化 DTO；不保存 Node、Component、设备身份和输入帧。

SaveSerializer 重建已知字段，检查 ID、有限值、整数范围、角色关卡关联、玩家唯一性及坐标可通行性。schema 1 的 profile.unlocks 改名，randomState 由 seed 补全。未知未来 schema 只读保护，不覆盖。未知内容 ID 不静默删除进度。

每个 profile / slot 有 committed、backup、temporary 三个逻辑记录。保存流程：验证 → 写 temporary → 回读并解码 → 将上一份有效原始记录写 backup（包括迁移前原文）→ 写 committed → 回读一致性 → 清理 temporary。存储适配器是 Cocos sys.localStorage；这是可恢复的写入协议，**不是文件系统原子 rename，也不保证断电级事务**。

载入依次尝试 committed、backup、temporary；遇到未来 schema 立即拒绝降级覆盖。所有候选损坏或存储异常时返回错误，禁止覆盖。临时清理失败不否定已回读成功的提交。没有云端、加密、账号登录或跨机器同步。

命名空间：设置 `duogame.settings`；正式进度 `duogame.saves/<profile>/<slot>/...`；实验进度 `duogame.labs.saves/<profile>/<slot>/...`。接口支持多 Profile / Slot，当前 UI 固定 profile.default / slot1。应用没有槽位管理菜单。

新游戏保留有效 Profile，重新开始 Session；继续先加入设备，再恢复 Session。手动保存、返回主菜单和返回加入页触发存档；保存失败显示错误并保留游戏现场。退出进程可能丢失最后一次保存后的移动。SaveLab 永远使用实验命名空间，退出实验清空内存实验 Profile；SettingsLab 应用的是实际用户设置，Cancel 可撤销未应用修改。
