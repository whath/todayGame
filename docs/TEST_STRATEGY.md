# Test Strategy

## Pure TypeScript
Good for settings/save migration, random, content registry, rules.

## Integration
Good for player join, scene flow, settings apply, save/load round-trip.

## Manual playtest
Required for local simultaneous input, hot-plug, camera feel, UI navigation, and gameplay feel.

## Developer labs
- InputLab
- CameraLab
- SettingsLab
- SaveLab

Do not ship developer labs in Release builds unless explicitly intended.

## v5 验证入口
当前命令、实际结果及未执行项目见 [VALIDATION_V5](VALIDATION_V5.md)。五个 Lab 包括 KeyboardGhostingLab，均不作为 Release 场景；旧测试结果保留为历史。
