# 编码约定

1. 使用 TypeScript，开启 strict；组件使用 Cocos 装饰器和明确类型。
2. 输入设备输出逻辑动作；物理键码仅存在于 platform。
3. 同一个 Player Prefab 实例化两次，playerId 只影响标识和外观。
4. Player 不访问相机；相机单向读取目标 Node 的位置。
5. 核心状态和碰撞数据不依赖 Windows 或浏览器 API。
6. 原型表现使用 Cocos Graphics / Label；不新增正式素材或生产依赖。
7. 事件注册必须有对应取消；断开、失焦和销毁明确处理。
8. 一帧只采样一次输入；多个消费者读取同一帧数据，不用破坏性的按钮消费方法。
9. 常量与配置集中在拥有它的模块。按键映射在 KeyboardAdapter，房间数据在 PrototypeRoom。
10. 不使用任意延迟、吞异常或重复重试掩盖根因。
11. 保留场景、Prefab 与脚本的 .meta UUID；不要复制 P1/P2 业务代码。
12. 用户要求跳过验证时明确记录 NOT RUN，不能把代码编写完成等同于运行通过。
