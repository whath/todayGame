# 首次启动前环境检查

日期：2026-09-29。范围：用户要求重启后检查环境完整性及首次启动条件。

结论：已检查的基础环境和源码校验没有发现首次导入阻断项，可以进入 Creator 3.8.6 首次打开项目阶段；不代表编辑器导入或游戏运行已通过。

| 检查 | 结果 |
| --- | --- |
| Windows 重启 | PASS，最近启动时间 2026-09-29 11:47:33 +08:00 |
| CBS / Windows Update 待重启标记 | 均不存在；VS isRebootRequired 为 false |
| 前次 DISM | 日志显示 11:41:42 结束，无遗留安装进程；未据此宣称可选 Graphics Tools 功能验收通过 |
| Creator 3.8.6 | 版本匹配、Authenticode 有效；主程序、app.asar、引擎、模板和 CMake 文件存在 |
| Visual Studio 2022 | 17.14.41，isComplete / isLaunchable 为 true |
| C++ 工具链 | NativeDesktop / NativeGame / MSVC / SDK 26100 均由 vswhere 确认 |
| 原生工具链实际检查 | PASS，Creator 自带 CMake 3.24.3 配置 VS 2022 x64，编译并链接包含 Windows.h / GetNativeSystemInfo 的独立小程序，运行返回 0 |
| Node / pnpm | 独立安装版本 24.21.0 / 11.19.0，可运行 |
| 项目 pnpm test | PASS，88 项；包含官方 Cocos 类型检查、核心编译、68 个脚本语法检查和 3 内容定义／91 metadata UUID 校验 |
| 显卡识别 | NVIDIA GeForce RTX 3060；仅确认系统识别，未测 Creator 渲染 |
| Cocos 账号 | 用户已确认注册；本机编辑器登录未验证 |
| Dashboard | 未安装，此前官方下载返回 403 |
| Creator 项目导入 / 游戏预览 / 游戏 Windows 构建 / 双人设备试玩 | NOT RUN |

本机检查文件：`D:\workSpace\gFile\checks\2026-09-29`，包含原生小程序和 CMake 配置／构建日志。该小程序用于验证编译工具链，不是游戏产物。

下一步：用 `D:\workSpace\gFile\Cocos\Creator\3.8.6\CocosCreator.exe` 指定项目 `D:\workSpace\todayG`，完成首次登录、资源导入和编辑器控制台检查，再进入 Prototype.scene 预览。当前请求只做启动前检查，未执行这些步骤。

Footage Markers：NOT RECORDED。

## 2026-09-29 — 首次导入与浏览器预览

用户完成编辑器登录后，用 Creator 3.8.6 直接打开已有项目，未安装 Dashboard。

| 检查 | 结果 |
| --- | --- |
| 项目导入／Prototype.scene 打开 | PASS |
| 浏览器预览 | PASS，主菜单、两套键盘加入、关卡加载和两名玩家显示 |
| HUD／暂停／设置渲染 | 首次发现世界遮挡 UI；统一 RenderRoot2D 后复测 PASS |
| 暂停 → 设置 → 返回暂停 → 恢复关卡 | PASS，通过浏览器键盘输入检查 |
| 修复后 pnpm test | PASS，88 项；官方类型、核心编译、68 脚本语法、3 内容定义／91 UUID 校验通过 |
| 浏览器 warn / error 日志 | 本次采集为空 |
| 编辑器服务插件 | 首次出现一条 cocos-service 的 “msg not exist!”；未阻断场景导入和预览，未将其标为已修复 |
| 完整接力通关、存档恢复、真实双手柄、键盘冲突矩阵 | NOT RUN |
| 游戏 Windows 构建／发布 Gate | NOT RUN |

首次实测发现各 UI 和世界分别注册 RenderRoot2D，独立渲染根的 siblingIndex 排序无法表达跨父节点的层次，后加载世界覆盖菜单。修复为 Bootstrap 单一渲染根，世界先于 Camera 下的 HUD／菜单绘制。无需增加 Camera，也不改变输入和暂停职责。

Creator 自动更新了构建设置版本、默认包设置及 Player Prefab 的 syncNodeName，原 UUID 保留；本机 profiles 目录加入忽略。截图保存在本机 gFile/checks/2026-09-29/first-preview.png。

Next：先做完整双人接力试玩、暂停／恢复／存档回归和真实设备组合检查，再验证 Windows 开发构建；不将此次冒烟检查视为 Prototype Gate 通过。
Footage Markers：NOT RECORDED（仅截图，未录制视频）。
