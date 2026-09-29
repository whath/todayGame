# 多类别产品结构

## 当前决定
赛车是长期主类别，不是替换接力原型的一次性实验。产品入口先选类别，再进入各类别自己的选项、内容与游玩流程。后续其他类别按真实需求加入，不先建立空白战斗/故事框架。Prototype Gate 的 KEEP / ITERATE / KILL 针对具体玩法方案与实现，不撤销用户已确定的赛车长期方向。

## 分层与依赖
| 层 | 职责 | 当前落点 |
| --- | --- | --- |
| 产品入口 | 已安装类别的稳定 ID、标题、入口说明；类别选择 | runtime/GameCategory、app/GameCategories |
| 应用组装 | 连接类别页面、设备加入、场景生命周期、设置与暂停 | gameplay/PrototypeBootstrap、runtime/SceneFlowService |
| 公共服务 | 语义输入、槽位独占、时间、音量、设置、资源、日志、存储适配器 | input / services / runtime / platform |
| 类别纯规则 | 赛车配置与驾驶力计算、圈赛、选车准备；接力机关规则 | packs/racing、packs/relay |
| 类别引擎适配 | Cocos 刚体、碰撞体、网格、相机、实例释放 | gameplay/racing、现有接力组装 |
| 表现 | 赛车分屏 HUD、共用菜单与设置覆盖层 | ui/RacingHUD、ui/RuntimeScreen |

GameCategory 不导入赛车，公共设置与存储也不包含车辆参数。赛车不读取按键或手柄 API，只消费 PlayerInputSlot 的语义输入。P1/P2 使用同一个 RacingVehicle 工厂/控制器，数据不同；接力继续共用原 Player Prefab。

## 路由与生命周期
类别页使用既有 mainMenu 状态的不同页面 ID，避免为每个类别复制 AppState。TransitionRequest 捕获 categoryId / contentId，racing 使用 track ID，relay 使用兼容 level ID。SceneFlow 仍负责准备、激活、退场、失败恢复和切换锁。赛车世界创建时 inactive；成功激活后禁用接力相机；退场清除自身节点、刚体、网格、材质和两个相机。

目前应用组装入口显式连接两个已安装类别，不做动态插件发现、反射加载或通用类型转换。接力的旧组装仍在 Bootstrap，不在本轮无关重写。新增类别时：注册元数据、实现自己的纯规则/引擎适配/页面，显式接入组装入口；如果第三个类别证明有重复，再提取确实共用的生命周期接口。禁止把车辆字段塞入通用 Actor 或接力 LevelDefinition。

## 视图与控制
接力使用共享正交相机；赛车左右分屏，各自透视跟车相机；UI 相机 priority 10，统一覆盖两个视口。车辆不引用相机。双方共用暂停，断线仍由原槽位归属规则恢复。

赛车准备页的交互动作切换自己的车，次动作切换准备，确认菜单单独处理；手柄 East 在此页只处理准备，返回通过页面选项完成。选车、赛道变化和设备更换会撤销相关准备状态。

## 存档隔离
现有 schema 3 原样属于接力兼容路径，旧 duogame.saves 命名空间不搬迁、不覆盖。赛车本轮只有内存中的比赛与选择，不提供虚假继续/保存按钮。未来赛车成绩采用 duogame.categories/racing 的独立 schema/迁移/校验，由平台存储适配器实际访问；其他类别同理。此命名空间是设计约定，本轮尚未写入。

## 本轮界限
完成类别入口与赛车驾驶验证代码：两种可选参数、一条赛道。正式资产、第二赛道、成绩持久化和手感定稿在驾驶验证之后推进。没有新增生产依赖，没有改变旧 UUID 或导入未批准外部素材。
