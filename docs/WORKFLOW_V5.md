# v5 工作流整合

来源：用户提供的主文档与 DuoGame_Codex_Workflow_v5.zip。包内主文档与独立附件 SHA-256 相同；原始副本保留在 docs/reference。当前项目规则采用根 AGENTS.md，不覆盖历史 DEVLOG/DECISIONS 或现有详细设计。

## 整合方式
- .agents/skills：导入包内 46 项作用域明确的工作流，并将通用描述中的 local co-op 改为 local multiplayer。
- docs/workflow/agents：保留 19 个可选角色 TOML 模板，包括 local_multiplayer_systems_engineer、asset_pipeline_engineer。角色名不是本轮委派命令。
- docs/workflow/UPSTREAM_CONFIG.example.toml：原始配置仅作参考，不写入活动 .codex/config.toml；未验证其字段与当前客户端兼容，不自动启用多 Agent。
- docs/templates：保留项目原有任务/结果/故障/日志模板，补充设置任务和资产 Manifest 模板。
- 缺失的设计文档导入并关联现有实现文档；已存在文档做差量合并。

## 冲突处理
包内 AGENTS 开头仍写 v0.1 / 固定合作，DECISIONS、MARKET_VALIDATION 仍含旧合作市场假设。以 v5 产品柱与当次用户指令优先，未套用旧里程碑；旧市场链接只作为未复核参考，不作为 Direction Lock 证据。保留无自动委派、验证诚实记录、UUID 与用户数据保护等现有规则。

原包对 D:/GameAssets 的目录只是建议；本项目采用用户已有工具区下 D:/workSpace/gFile/GameAssets。没有自动下载或批准外部资源，也没有因包中的 Blender 工作流而安装无当前输入素材的处理工具。
