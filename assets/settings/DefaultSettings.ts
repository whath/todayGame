import { SettingCategory, SettingDefinition } from './SettingDefinition';
import { SettingsRegistry } from './SettingsRegistry';

export const CONTROL_ACTIONS = ['up', 'down', 'left', 'right', 'primary', 'secondary', 'interact'] as const;
export type ControlAction = typeof CONTROL_ACTIONS[number];
export const BINDABLE_KEYS = [
    ...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').map(letter => `Key${letter}`),
    ...'0123456789'.split('').map(digit => `Digit${digit}`),
    'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space',
];
export const DEFAULT_BINDINGS = {
    1: ['KeyW', 'KeyS', 'KeyA', 'KeyD', 'KeyF', 'KeyG', 'KeyE'],
    2: ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'KeyJ', 'KeyK', 'KeyL'],
} as const;

export function createSettingsRegistry(): SettingsRegistry {
    const registry = new SettingsRegistry();
    const base = (id: string, category: SettingCategory, applyMode: 'live' | 'onApply' = 'live') => ({
        id, category, scope: 'global' as const, applyMode,
        labelId: `setting.${id}`, descriptionId: `description.${id}`,
    });
    const definitions: SettingDefinition[] = [
        { ...base('display.frameLimit', 'display', 'onApply'), valueType: 'enum', defaultValue: '60', capability: 'frameLimit',
            options: [{ value: '30', labelId: 'option.fps30' }, { value: '60', labelId: 'option.fps60' }] },
        { ...base('display.mode', 'display', 'onApply'), valueType: 'enum', defaultValue: 'windowed', capability: 'fullscreen', risky: true,
            options: [{ value: 'windowed', labelId: 'option.windowed' }, { value: 'fullscreen', labelId: 'option.fullscreen' }] },
        { ...base('display.vsync', 'display', 'onApply'), valueType: 'boolean', defaultValue: true, capability: 'vsync' },
        { ...base('display.brightness', 'display'), valueType: 'number', defaultValue: 50, min: 0, max: 100, step: 1, capability: 'gamma' },
        ...(['master', 'music', 'sfx', 'ui'] as const).map(bus => ({ ...base(`audio.${bus}Volume`, 'audio'),
            valueType: 'number' as const, defaultValue: bus === 'master' ? 80 : 100, min: 0, max: 100, step: 5, capability: 'audio' as const })),
        { ...base('audio.muteWhenUnfocused', 'audio'), valueType: 'boolean', defaultValue: false, capability: 'audio' },
        { ...base('gameplay.pauseWhenUnfocused', 'gameplay'), valueType: 'boolean', defaultValue: true },
        { ...base('accessibility.uiScale', 'accessibility'), valueType: 'number', defaultValue: 1, min: 0.8, max: 1.2, step: 0.1, capability: 'uiScale' },
        { ...base('accessibility.reduceFlashing', 'accessibility'), valueType: 'boolean', defaultValue: false },
        { ...base('accessibility.reduceScreenShake', 'accessibility'), valueType: 'boolean', defaultValue: true, capability: 'screenShake' },
        { ...base('accessibility.cameraSmoothing', 'accessibility'), valueType: 'number', defaultValue: 6, min: 1, max: 12, step: 1 },
        { ...base('accessibility.subtitles', 'accessibility'), valueType: 'boolean', defaultValue: true, capability: 'subtitles' },
        { ...base('accessibility.subtitleSize', 'accessibility'), valueType: 'number', defaultValue: 24, min: 16, max: 40, step: 2, capability: 'subtitles' },
        { ...base('accessibility.subtitleBackground', 'accessibility'), valueType: 'number', defaultValue: 0.7, min: 0, max: 1, step: 0.1, capability: 'subtitles' },
        { ...base('language.locale', 'language', 'onApply'), valueType: 'enum', defaultValue: 'zh-CN', options: [{ value: 'zh-CN', labelId: 'option.zhCN' }] },
    ];
    definitions.forEach(definition => registry.register(definition));
    for (const playerId of [1, 2] as const) {
        const prefix = `controls.p${playerId}`;
        registry.register({ ...base(`${prefix}.deadzone`, 'controls'), scope: 'player', playerId,
            valueType: 'number', defaultValue: 0.2, min: 0.05, max: 0.5, step: 0.05, capability: 'gamepad',
            labelId: 'setting.controls.deadzone', descriptionId: 'description.controls.deadzone' });
        registry.register({ ...base(`${prefix}.vibration`, 'controls'), scope: 'player', playerId,
            valueType: 'boolean', defaultValue: true, capability: 'vibration',
            labelId: 'setting.controls.vibration', descriptionId: 'description.controls.vibration' });
        CONTROL_ACTIONS.forEach((action, index) => registry.register({
            ...base(`${prefix}.${action}`, 'controls', 'onApply'), scope: 'player', playerId,
            valueType: 'binding', defaultValue: DEFAULT_BINDINGS[playerId][index], allowedKeys: BINDABLE_KEYS, capability: 'keyboard',
            labelId: `action.${action}`, descriptionId: 'description.controls.binding',
        }));
    }
    return registry;
}
