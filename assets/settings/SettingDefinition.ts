export type SettingCategory = 'display' | 'graphics' | 'audio' | 'controls' | 'gameplay' | 'accessibility' | 'language';
export type SettingValue = boolean | number | string | null;
export type SettingsSnapshot = Readonly<Record<string, SettingValue>>;
export type Capability = 'frameLimit' | 'fullscreen' | 'resolutionSwitch' | 'vsync' | 'gamma'
    | 'audio' | 'keyboard' | 'gamepad' | 'vibration' | 'uiScale' | 'screenShake' | 'subtitles';

interface DefinitionBase {
    readonly id: string;
    readonly category: SettingCategory;
    readonly scope: 'global' | 'profile' | 'player';
    readonly playerId?: 1 | 2;
    readonly applyMode: 'live' | 'onApply' | 'restartRequired';
    readonly labelId: string;
    readonly descriptionId: string;
    readonly capability?: Capability;
    readonly risky?: boolean;
}
export type SettingDefinition = DefinitionBase & (
    | { readonly valueType: 'boolean'; readonly defaultValue: boolean }
    | { readonly valueType: 'number'; readonly defaultValue: number; readonly min: number; readonly max: number; readonly step: number }
    | { readonly valueType: 'enum'; readonly defaultValue: string; readonly options: readonly { value: string; labelId: string }[] }
    | { readonly valueType: 'binding'; readonly defaultValue: string | null; readonly allowedKeys: readonly string[] }
);

export interface SettingsChange {
    readonly snapshot: SettingsSnapshot;
    readonly ids: readonly string[];
    readonly reason: 'boot' | 'preview' | 'apply' | 'cancel' | 'revert';
}

export interface ISettingsPersistence {
    load(): string | null;
    save(serialized: string): void;
}

/** Appliers must be synchronous and support restoring a previously applied snapshot. */
export interface ISettingsApplier { apply(snapshot: SettingsSnapshot): void }
