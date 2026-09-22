# Windows 构建说明（待执行）

本次没有安装构建环境、运行 Creator 或生成 Windows 可执行产物。

之后的人工流程：

1. 使用 Creator 3.8.6 导入项目，先解决资源导入或脚本编译问题。
2. 在 Creator 的构建发布面板选择 Windows 平台，按该版本官方要求准备 C++ 工具链和 Windows SDK。
3. 将 `assets/scenes/Prototype.scene` 加入构建场景，并设为启动场景。仓库 builder 设置提供同一场景 UUID 作为入口提示，首次导入后在面板确认。
4. 将产物输出至 `build/windows`，由编辑器保存适合本机工具链的构建任务。
5. 先构建，再编译生成原生程序；运行产物执行 ACCEPTANCE.md。
6. Windows 原生与浏览器预览分别记录手柄结果，不互相替代。

不提交 `build/`、`temp/`、`library/`、本机 SDK 路径或本地凭证。没有运行证据时，不创建 release Tag、不声明构建成功。

参考：[Cocos Windows 发布文档](https://docs.cocos.com/creator/3.8/manual/zh/editor/publish/publish-native.html)。
