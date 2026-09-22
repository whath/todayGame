# 项目章程

工作名 DuoGame，仓库名 todayGame。目标是让两个人在一台 Windows PC 上，在同一世界和同一屏幕中独立控制角色。暂不决定最终题材、战斗形式和美术。

技术基线：Cocos Creator 3.8.6、TypeScript、1280 × 720 设计分辨率、单一正交相机。第一版采用矩形俯视原型，属于可替换的基础表达方式。

首批代码覆盖规划 Task 0–7：工程文档、输入抽象、玩家复用、独立移动、加入分配、共享相机、热插拔状态与测试房间。Task 8 验收 / 发布暂未执行。

当前版本为 `0.2.0-dev`，在首版双人底座上增加核心服务与设置层。已通过自动逻辑测试和官方引擎声明类型检查，尚不是经过 Creator 实机 / Windows 验收的可执行交付。

新增范围：Settings、Persistence、Capability、Audio、Control Settings、Accessibility、Localization、Pause / Focus 和 Development Diagnostics。服务职责见 CORE_SERVICES.md；功能与验收分开记录，未创建发布 Tag。

范围内：双键盘映射、键盘与手柄混合、双手柄、静态房间碰撞、连接状态、重置与返回大厅。

范围外：分屏、账号、服务器、排行榜、商城、网络同步、移动触屏、微信 / 抖音、Steam SDK、敌人、武器、正式音画资源。

后续扩展应替换适配器或独立模块，不让 Player 直接依赖平台 API，也不为未来平台提前加入复杂基础设施。
