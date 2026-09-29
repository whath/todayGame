# 3D Asset Pipeline

发现来源策略：Quaternius（风格套装优先）、Fab Free（补充）、itch.io Free（特色补充）。这只是来源选择，不是对任何具体资源的商用许可保证。

用户：选择风格、SHORTLIST、最终 APPROVE/REJECT。Codex：核对来源与许可、格式、解包、保留原件、命名、比例/朝向/材质/碰撞、必要时 Blender 处理、Cocos 导入、Prefab/ContentDefinition、验证与登记。

## 状态与出口
DISCOVERED → SHORTLISTED → LICENSE_CHECKED → TECH_CHECKED → APPROVED → PROCESSED → IN_GAME。
每一步记录证据和日期，不自动推断下一步。APPROVED 必须记录用户明确选择；IN_GAME 必须有已引用内容 ID、导入结果和实际预览证据。缺少许可、技术检查或批准的资源不进入正式库。

## 本机工作区
采用 D:/workSpace/gFile/GameAssets，下设 01_Inbox、02_Shortlisted、03_Approved、04_Processing、05_Ready、06_Archive。
源压缩包保留在外部目录。项目只接收 05_Ready 的整理产物，不提交大批下载原包、工具或凭证。

## 检查
- source：具体页面、作者、取得时间、原包哈希。
- license：许可名称/版本、许可原文位置、商用/修改/再分发/署名条件及证据；未知填 null/UNKNOWN，不填 true。
- format：模型/贴图格式、纹理尺寸、骨骼/动画兼容性。
- geometry：米制 +Y-up，朝向、中心/脚底 pivot，真实尺寸、多边形预算与法线。
- material：Cocos 可用材质、贴图路径、透明/阴影；不假定其他引擎材质自动兼容。
- collision：当前玩法所需形状与可见网格一致，不直接拿高模网格当动态刚体。
- integration：稳定 ID、Prefab、.meta UUID、依赖、释放责任、预览与构建状态。

记录见 ASSET_CATALOG、ASSET_LICENSES 和 templates/ASSET_MANIFEST_TEMPLATE.json。当前只使用引擎生成灰盒，没有外部正式资源；未执行 Blender 处理。
