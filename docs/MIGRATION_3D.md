# 3D 迁移

## 坐标与兼容性
引擎 +Y 向上，XZ 为地面，1 引擎单位 = 1 米。旧关卡与 schema 3 存档 x/y 保持厘米平面坐标。WorldCoordinates 映射 (x,y) → (x/100, 0, -y/100)，反向用于机关、碰撞、出生与存档。输入 Move.y 是向前；不是引擎竖直速度。未改内容 ID、已有 .meta UUID 或存档 schema。

## 渲染与碰撞
一个 3D 世界相机渲染 DEFAULT 层；一个固定正交 UI 相机只清深度并渲染 UI_2D，UI 继续单 RenderRoot2D。世界采用引擎 box/sphere MeshRenderer、builtin-standard 和 DirectionalLight；场景显式引用 Greybox.mtl，保证预览/构建加载材质 effect。动态网格与材质随节点清理。

当前玩法是 3D 世界里的平面移动。CollisionWorld 保留地面 AABB 扫掠，门与墙的 3D 网格脚印与同一关卡数据一致。它不是通用 3D 物理系统；当前不需要重力/斜坡/碰撞旋转/投掷。需要这些行为的原型应接 Cocos Physics3D，不扩写自研刚体。

## 相机与玩家
CameraPolicy 输出中立取景意图，SharedCamera 在 3D 空间执行；shared-group 用于接力，fixed-room 用于房间/CameraLab。Player 只读槽位语义，不依赖 Camera。两个 Player 仍实例化同一 Prefab，球形/方柱及 P1/P2 UI 帮助辨认。

## 专业规则
接力规则与 HUD 模型移到 packs/relay。LevelDefinition 的可选 coop 和 schema 3 的 coop 字段是已有内容/存档兼容接口，不能据此把合作设为所有 Actor 默认关系。新增 Pack 按当前内容需要逐步扩展，不建设通用插件/任意数据序列化框架。
