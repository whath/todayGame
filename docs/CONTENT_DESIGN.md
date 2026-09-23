# Content / Asset ownership

当前只注册 CharacterDefinition 和 LevelDefinition：`character.player.default`、`level.prototype.room_01`。角色包含资源 ID、速度和半尺寸；关卡包含边界、静态障碍、两处出生点及角色依赖。稳定 ID 不依赖节点名、文件名或数组顺序，不应在内容发布后随意重命名。

Registry 克隆并冻结定义，拒绝重复 ID。启动校验缺失依赖 / 循环、缺失文案 / 资源、非法范围、障碍越界、出生点阻塞；资源 ID `prefab.player` 由平台后端解析到已有 Player Prefab。增加内容时先定义和验证数据，再接游戏，不提前注册虚构武器、道具和敌人类型。

AssetService 合并并行加载，每个 AssetScope 最多持有同一 ID 一次；多个作用域共享同一资源，最后一个持有者退出才释放。加载失败可以重试；等待中销毁作用域会拒绝该消费者，迟到资源仍释放。场景切换负责旧世界实例退场，之后释放其资产作用域。

CocosAssetBackend 对场景序列化引用的 Prefab 使用 addRef / decRef 管理额外持有量，不释放场景本身拥有的基础引用。当前资源量很小，不拆 Bundle，不使用 resources 全目录，也不实现通用对象池。未来异步资源后端可实现同一个 load / release 合同。
