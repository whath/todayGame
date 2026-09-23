# Build Variants

| 能力 | Development | Playtest | Release |
| --- | --- | --- | --- |
| Labs / 开发命令 / 诊断 | 开启 | 关闭 | 关闭 |
| 实验标志 | 可配置 | 可配置 | 强制关闭 |
| DEBUG 日志 | 开启 | 关闭 | 关闭 |
| INFO 日志 | 开启 | 开启 | 关闭 |
| Build 标记 | 显示 | 显示 | 隐藏 |
| 构建参与场景 | Prototype + 四个 Lab | 仅 Prototype | 仅 Prototype |

## 准备

```sh
node tools/prepare-build.cjs development
node tools/prepare-build.cjs playtest
node tools/prepare-build.cjs release
```

每次只准备一种变体，写入 `assets/runtime/GeneratedBuildInfo.ts` 和被忽略的 `temp/build/<variant>.json` / `<variant>.info.json`。最后一次准备的 BuildInfo 对下一次构建生效；切回编辑器前执行 development。仓库保留 editor-unprepared 模板，不把准备脚本本身当作编译器。

如已从 Creator 3.8.6 构建面板导出 Windows 平台配置，将其作为第三个参数：

```sh
node tools/prepare-build.cjs release path/to/exported-windows.json
```

脚本保留平台包选项，但覆盖平台、debug、输出位置、起始场景和场景白名单，避免上次编辑器配置把 Lab 带入发布。构建配置仅引用已存在 `.meta` 的 UUID，不改写已有场景或 Prefab UUID。

## Windows Gate

在安装了 Creator 3.8.6 与 Windows 原生编译环境的机器上，用生成配置进行构建。PowerShell 示例（替换实际编辑器路径）：

```powershell
& 'C:/path/to/Creator/3.8.6/CocosCreator.exe' --project 'D:/workSpace/todayG' --build 'configPath=D:/workSpace/todayG/temp/build/release.json'
```

configPath 用法依据 [Cocos 3.8 官方命令行发布文档](https://docs.cocos.com/creator/3.8/manual/zh/editor/publish/publish-in-command-line.html)。原生编译工具链、导出的平台选项仍须在目标机器配置。脚本目前只验证配置白名单，实际产物还必须检查无 Lab 场景、开发入口不可用、存档和双手柄流程正常。

不要同时准备多个变体后再批量构建，因为它们共用 GeneratedBuildInfo。先准备、构建、归档该变体，再准备下一个。未经准备而直接使用编辑器的旧构建配置不在白名单保证范围内。BuildInfo 的 commit 会标明准备时工作区是否 dirty。

本次没有运行 Creator / Windows build，没有生成安装包或 `v0.3.0` Tag。只有全部手动 Gate 通过后才能创建发布 Tag。
