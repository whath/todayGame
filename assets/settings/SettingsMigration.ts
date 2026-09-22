export const SETTINGS_SCHEMA_VERSION = 2;
export interface MigratedSettings {
    readonly values: Record<string, unknown>;
    readonly warning: 'none' | 'invalid' | 'future';
}

function record(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/** Boot never writes back. A future schema is read-only to avoid destructive downgrade. */
export function migrateSettings(serialized: string | null): MigratedSettings {
    if (serialized === null) return { values: {}, warning: 'none' };
    let envelope: unknown;
    try { envelope = JSON.parse(serialized); }
    catch { return { values: {}, warning: 'invalid' }; }
    if (!record(envelope) || !Number.isInteger(envelope.schemaVersion)) return { values: {}, warning: 'invalid' };
    const version = envelope.schemaVersion as number;
    if (version > SETTINGS_SCHEMA_VERSION) return { values: {}, warning: 'future' };
    if (version < 1 || !record(envelope.values)) return { values: {}, warning: 'invalid' };
    const values = { ...envelope.values };
    if (version === 1) {
        if (typeof values['audio.master'] === 'number') values['audio.masterVolume'] = values['audio.master'] * 100;
        if (typeof values['input.deadzone'] === 'number') {
            values['controls.p1.deadzone'] = values['input.deadzone'];
            values['controls.p2.deadzone'] = values['input.deadzone'];
        }
        delete values['audio.master'];
        delete values['input.deadzone'];
    }
    return { values, warning: 'none' };
}
