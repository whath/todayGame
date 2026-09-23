# v0.3 验证记录

日期：2026-09-23。版本：0.3.0-dev。执行命令 `node tools/run-tests.cjs`。

| 项目 | 结果 | 范围 |
| --- | --- | --- |
| Cocos 3.8.6 官方声明严格类型检查 | PASS | 全部 assets 脚本；不是引擎运行 |
| 纯逻辑核心编译 | PASS | core / input / settings / services / runtime / content / save |
| 语法转译 | PASS | 59 个 TypeScript 脚本 |
| 自动测试 | PASS | 57 项（原有 30 项回归 + 27 项运行时专项） |
| diff 空白检查 | PASS | git diff --check |
| 构建场景白名单 | PASS | Development 含 4 个 Lab；Playtest / Release 仅 Prototype；覆盖导出配置的旧场景列表 |
| Creator 场景导入与预览 | NOT RUN | 本机没有可用 Creator 运行环境 |
| 真实双手柄 / 无鼠标菜单 / UI 焦点 | NOT RUN | 需要物理设备与引擎 |
| Windows 原生构建 / 包体 Lab 排除 | NOT RUN | 需要 Creator 与原生编译工具链 |
| 真实音频 / 原生存储 / 资源释放 | NOT RUN | 自动测试只覆盖服务合同和模拟后端 |

专项覆盖：并行资源共享、最后持有者释放、等待中销毁、失败重试；切换锁、单调进度、准备失败恢复、旧视图清理异常、销毁期间异步结果；存档 DTO Round Trip、v1 迁移及原文备份、坏数据拒绝、备份 / 临时恢复、写入失败与回读不一致、未来 schema 保护、Profile 身份隔离；内容依赖 / 文案 / 资源 / 数值；模态 Back 独占；时间暂停和 seed / state 延续；Release 命令 / Flag / 日志限制及反馈修正。

## 手动 Gate

1. 导入 Prototype 和四个 Lab，确认无 Missing Script / UUID、资源警告，UI 在 16:9 和缩放选项下可见。
2. 两键盘、键盘 + 手柄、双手柄分别完成主菜单 → 加入 → 设置 → Back → 开始；P1/P2 独占保持；设置弹窗不把 Back 传给暂停层。
3. 暂停、失焦、手柄断开时游戏时间停止，UI 和危险设置确认继续；恢复不突跳，菜单输入不触发角色动作。
4. 移动后保存、关闭并重新进入、继续、重新分配设备：检查位置、elapsed、seed 和后续随机序列；实验存档不污染正式进度。
5. 多次重开 / 返回后检查节点、引用和事件没有增长；CameraLab 双人持续可见。
6. 按 BUILD_VARIANTS 生成并构建 Development / Playtest / Release，检查实际产物场景白名单和开发入口关闭、Release 无实验行为；完成 Windows 双人试玩。

R12 尚未全部完成。不创建 v0.3.0 Tag，不把这些代码标记为已验收发布。
