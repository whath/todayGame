# 项目章程 — v5

权威路线：[v5 主文档](reference/GAME_DEV_CODEX_MASTER_PLAN_V5.md)。工作名 DuoGame，仓库 todayGame，源码维持 0.5.0-dev；规划版本 v5 不是发布版本。

固定技术方向：Cocos Creator 3.8.6 + TypeScript、Windows PC、3D 世界、首发本地双人同屏；P1/P2 共用角色 Prefab，支持两套键盘、键盘/手柄与双手柄。共享一个游戏视角，2D UI 覆盖相机不构成分屏。

最终 Genre、合作或竞争、线性叙事、视觉风格均未锁定。当前守门接力是合作候选 A，不代表产品已经选定解谜或故事方向。没有游戏账号、服务器、联机同步或商业化功能。

本轮将原有平面规则投射到 3D XZ 地面：角色、地板、墙体、机关使用引擎网格和标准材质、方向光；UI 保留 2D。角色当前贴地行走，没有跳跃、重力、斜坡或动态刚体玩法。具体实现与边界见 [3D 迁移](MIGRATION_3D.md)。

v0.5 是最后一层强制通用基础；之后用不同类型灰盒收集证据，Prototype Gate → Direction Lock → 最小 Genre Packs → Vertical Slice → Foundation Lock。自动检查不代替双人试玩和 Windows 验收。

外部资产来源策略为 Quaternius / Fab Free / itch.io Free，必须逐资源记录许可和技术检查。用户负责视觉选择和批准，Codex 负责技术接入。当前没有批准或导入任何外部正式资产。
