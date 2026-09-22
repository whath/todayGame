# Settings Foundation

## 定义与当前设置

定义包含唯一 ID、分类、scope、可选 playerId、boolean / number / enum / binding 类型、默认值、数值约束、枚举选项、语言 ID、能力条件及 live / onApply / restartRequired 策略。

注册在 `assets/settings/DefaultSettings.ts`，菜单按 Registry 与 Capability 动态生成分类和控件。布尔值可切换，数值使用有步长的增减控件，枚举循环选择，binding 进入按键捕获。控制分类按页显示。新增启动时注册的定义不需要改写菜单。运行中注册新定义尚不是公开工作流，应在 boot 前完成注册。

已开放：目标帧率 30/60、Master/Music/SFX/UI 音量、失焦静音、P1/P2 键盘动作和摇杆死区、失焦暂停、UI 缩放、减少动作闪光、镜头跟随强度、简体中文。

隐藏：原生全屏模式、VSync、Gamma、震动、字幕、镜头震动；尚未实现可靠效果的选项不展示。Resolution 来自能力接口，当前返回空列表，不提供硬编码假分辨率。没有画质功能，因此不展示空的 Graphics 分类。音频混音与播放器已实现，当前原型没有正式音频素材，音乐等总线用于后续注册的音源。

## 事务

`store.committed` 是已成功保存的快照；`store.runtime` 是实际生效快照；`begin()` 生成 working 副本。

- live：安全预览，不写存储。
- onApply：修改 working，点击应用后生效。
- restartRequired：应用时保存，当前运行值不变；下一次启动应用新值，界面提示需要重启。当前首批设置没有强制重启项。
- Cancel：恢复 committed 对应运行状态，丢弃 working。
- Reset Category / Reset All / Restore P1/P2：UI 确认后只修改 working；安全项可预览，应用后保存。没有修改玩家进度的路径。
- Back：有未保存修改时先确认取消，避免意外丢失。

Apply 先应用引擎设置，再保存一个 JSON；保存失败则恢复运行值，保留 working 供重试，并显示错误。适配器异常尝试恢复之前的运行快照并报告错误，不吞异常冒充成功。

高风险定义可标记 `risky`，Apply 后进入 15 秒确认，Keep 才保存，取消 / 超时恢复；使用墙钟时间，暂停或失焦不会延长确认有效期。当前无可靠原生显示适配，流程仅在框架测试中激活，菜单不暴露显示模式。

## 持久化与迁移

通过 `ISettingsPersistence` 读写。Cocos 实现使用 `sys.localStorage` 的独立 key `duogame.settings`，不与进度存档共用。Node 测试使用内存实现。

```json
{
  "schemaVersion": 2,
  "values": {
    "audio.masterVolume": 80,
    "controls.p1.up": "KeyW",
    "controls.p2.deadzone": 0.2
  }
}
```

schema 1 示例格式也是 `values`，包含旧字段 `audio.master`（0–1）和 `input.deadzone`。迁移将前者转为百分比，将后者复制到 P1/P2。v0.1 没有持久化设置，不存在需要凭空推断的历史存档格式。

缺字段补默认，数字 clamp 后对齐步长，非法类型 / enum / 保留键回退默认，重复按键修复为未冲突的默认键或未绑定。损坏 JSON / 读取失败使用安全默认，不在启动阶段覆盖原记录。遇到高于当前版本的 schema 时只读运行，禁止应用和重置写入，保护新版本数据。

设置启动失败时使用引擎安全默认；当前可控的是设计分辨率 1280×720 和目标 60FPS，不声称已经调整 Windows 真实窗口尺寸或实现硬件安全模式。

## 输入与重绑定

P1/P2 是玩家设置槽位，不是固定键盘硬件。加入后 Keyboard A/B 使用各自拥有的玩家槽位设置。顺序反转时配置随槽位；映射切换会等待当前按键全部松开，防止按住的旧按键被解释成另一输入源加入。

按键冲突跨两个配置检测，提供 Swap / Unbind Old / Cancel。解除绑定以 null 持久化。独立恢复 P1/P2 默认配置时，被另一配置占用的默认键会解除另一配置对应动作，UI 确认文本说明该行为。

菜单打开时输入继续采样但禁止新设备加入和角色移动。修改设置不调用 releaseAll，唯一主动释放操作是确认返回加入界面。

## 音频、焦点与无障碍

实际音量 = Master × Bus × Voice gain；失焦静音额外乘以 0。AudioService 和 PauseService 分开接收焦点事件。所有通过 CocosAudioAdapter.play 注册的声音（含短音效）都受实时音量控制，避免失焦后已有 one-shot 无法静音。

PauseService 叠加 manual / settings / unfocused / controller，清除一个原因不会解除其他原因。关闭失焦暂停不承诺操作系统继续按目标帧率调度后台窗口。

UI Scale 同时作用于 HUD 和菜单，菜单根据窗口空间限制最大尺寸。减少闪烁取消动作白色高亮并保留动作文字；相机跟随强度实时应用。字幕和震动仅有 schema 占位并隐藏。

## 验证范围

纯逻辑及事件桥接测试覆盖事务、存储、迁移、冲突、重连、焦点、混音、无障碍和键盘映射切换。完整 UI 交互、Cocos 资源导入、原生存储、实际音频输出与 Windows 控制器仍需实机验收。
