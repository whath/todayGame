# v0.2 验证记录

日期：2026-09-22。版本：0.2.0-dev。

## 已执行

命令：`node tools/run-tests.cjs`（等价于安装开发依赖后的 `pnpm test`）。

| 检查 | 结果 | 范围 |
| --- | --- | --- |
| 官方 Cocos 3.8.6 类型声明校验 | PASS | 全部 assets TypeScript，strict；不是引擎运行 |
| 核心 TypeScript 编译 | PASS | core / input / settings / services，不依赖 Cocos |
| 脚本语法转译 | PASS | 37 个脚本，无语法错误 |
| 自动逻辑测试 | PASS | 30 项，详见 tests/foundation.test.cjs |

覆盖：默认值、不写盘预览、迁移、坏配置恢复、未来版本保护、保存失败、应用失败回退、超时还原 / 保留、类别 / 全量恢复、按键冲突与跨玩家恢复、重启设置语义、订阅清理、暂停原因、混音与失焦、中文文本、Release 诊断关闭、独占设备、重连、碰撞、摇杆死区、键盘 B 先加入以及改键后设备归属。

两项键盘适配测试使用轻量事件桥接 mock，调用真实 KeyboardAdapter 代码；它们不是操作系统键盘或 Creator 集成测试。

## 未执行

| 检查 | 状态 / 原因 |
| --- | --- |
| Creator 首次导入与 Console | NOT RUN：未发现可用 Creator 安装或项目生成的 temp/tsconfig.cocos.json |
| 场景 / Prefab 运行 | NOT RUN：需要 Creator |
| 设置页鼠标 / 键盘 / 手柄交互与排版 | NOT RUN：需要引擎 UI 环境 |
| Windows 四种双人输入组合 | NOT RUN：需要原生运行和真实手柄 |
| 原生设置保存重启 | NOT RUN：逻辑 save/load 已测，原生存储待测 |
| 实际音频总线和失焦静音 | NOT RUN：混音逻辑已测，原型未附正式音频素材 |
| Windows 编译 / 启动 | NOT RUN：未配置 Creator 构建工具链 |

未创建 v0.1.0 / v0.2.0 发布 Tag。v0.1 的原始实机清单仍在 ACCEPTANCE.md，未被自动测试替代。

## 实机操作顺序

1. Creator 3.8.6 导入并打开 Prototype.scene，检查资源引用与 Console。
2. 完成四种双人设备组合，并额外确认键盘 B 先加入后的槽位映射与松键行为。
3. F2 打开设置，使用鼠标、方向键 / Enter、手柄摇杆 / A/B 操作；Tab / R1 切分类。
4. 修改音量、UI Scale、镜头强度和减少闪烁，确认预览；取消后应全部恢复。
5. 修改 P1/P2 按键并触发冲突，分别尝试交换 / 解除 / 取消；应用后继续游戏，设备归属应不变。
6. 试验恢复分类、恢复全部、单玩家恢复，确认必须经过确认弹窗且应用才保存。
7. 应用并重启，设置应保留；存储 key 不涉及游戏进度。
8. 分别切换失焦暂停和失焦静音，再拔插手柄，验证多种暂停原因不会互相覆盖。
9. 开发构建按 F1 查看帧率、输入、相机及设置状态；Release 不显示诊断入口。
10. Windows 原生构建重复以上关键项目，记录设备型号和证据。
