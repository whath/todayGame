import { SettingsSnapshot } from './SettingDefinition';

/** Store has no engine, file, UI or platform dependencies. */
export class SettingsStore {
    private committedValues: SettingsSnapshot;
    private runtimeValues: SettingsSnapshot;
    public constructor(defaults: SettingsSnapshot) {
        this.committedValues = Object.freeze({ ...defaults });
        this.runtimeValues = this.committedValues;
    }
    public get committed(): SettingsSnapshot { return this.committedValues; }
    public get runtime(): SettingsSnapshot { return this.runtimeValues; }
    public commit(values: SettingsSnapshot): void { this.committedValues = Object.freeze({ ...values }); }
    public setRuntime(values: SettingsSnapshot): void { this.runtimeValues = Object.freeze({ ...values }); }
}
