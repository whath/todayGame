# v4 需求差量验证

源码版本 0.5.0-dev。用户要求暂不运行游戏，且本机未安装 Creator；本轮没有安装编辑器、启动游戏、Windows 构建或发布 Tag。

| 检查 | 结果 |
| --- | --- |
| 官方 Cocos 3.8.6 严格类型检查、核心编译 | PASS |
| 语法转译 | PASS，68 个脚本 |
| 自动测试 | PASS，88 项（68 项既有回归 + 20 项本轮专项） |
| Content / Localization / Asset 引用校验 | PASS，3 个定义、91 个唯一 metadata UUID |
| Release / Playtest Lab 排除配置 | PASS，Prototype only；Development 含五个 Lab |
| 无头适配器桥接 | PASS，两手柄菜单边沿独立；键盘诊断只报告观测值 |
| Creator 运行、物理双手柄、视觉／音频／Ghosting | NOT RUN |
| Windows 构建、包体内容排除 | NOT RUN |
| Prototype / Direction Lock / Vertical Slice / Foundation Lock | NOT RUN |

专项验证：Presence reconnect／leave；退出等待松键；安全出生 fallback／失败；距离策略；Solid 扫掠避免交换穿透；Soft 不穿静态墙；菜单 owner／modal／断线释放；Actor 关系；动作完成、取消、异常和重入；Trigger 一次性；五种交互策略、队列重新校验、claim 释放；目标反馈；HUD 模型；真实适配器源码的模拟事件桥接。未使用 mock 宣称真实 Cocos 运行通过。

实际核心 Gate 恢复时，除原验收清单外，必须检查手柄打开暂停后另一手柄和鼠标不能抢控、设置确认继承 owner、owner 断线后的接管、手柄进入键盘重绑定后的捕获，以及各距离／碰撞配置下的真实关卡软锁。
