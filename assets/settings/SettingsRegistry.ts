import { SettingDefinition, SettingsSnapshot, SettingValue } from './SettingDefinition';

export class SettingsRegistry {
    private readonly definitions = new Map<string, SettingDefinition>();
    public register(definition: SettingDefinition): void {
        if (this.definitions.has(definition.id)) throw new Error(`Duplicate setting: ${definition.id}`);
        if (definition.valueType === 'number' && (definition.min > definition.max || definition.step <= 0)) {
            throw new Error(`Invalid numeric range: ${definition.id}`);
        }
        if (this.validate(definition, definition.defaultValue) !== definition.defaultValue) {
            throw new Error(`Invalid default: ${definition.id}`);
        }
        this.definitions.set(definition.id, definition);
    }
    public all(): readonly SettingDefinition[] { return [...this.definitions.values()]; }
    public get(id: string): SettingDefinition {
        const definition = this.definitions.get(id);
        if (!definition) throw new Error(`Unknown setting: ${id}`);
        return definition;
    }
    public defaults(): SettingsSnapshot { return this.normalize({}); }
    public normalize(source: Record<string, unknown>): SettingsSnapshot {
        const values: Record<string, SettingValue> = {};
        for (const definition of this.definitions.values()) {
            values[definition.id] = this.validate(definition, source[definition.id]);
        }
        // Repair external duplicates in both keyboard profiles without changing ownership.
        const used = new Set<string>();
        for (const definition of this.definitions.values()) {
            if (definition.valueType !== 'binding') continue;
            let value = values[definition.id] as string | null;
            if (value !== null && used.has(value)) {
                value = definition.defaultValue;
                if (value !== null && used.has(value)) value = null;
                values[definition.id] = value;
            }
            if (value !== null) used.add(value);
        }
        return Object.freeze(values);
    }
    public validate(definition: SettingDefinition, value: unknown): SettingValue {
        switch (definition.valueType) {
        case 'boolean': return typeof value === 'boolean' ? value : definition.defaultValue;
        case 'number': {
            if (typeof value !== 'number' || !Number.isFinite(value)) return definition.defaultValue;
            const clamped = Math.max(definition.min, Math.min(definition.max, value));
            const stepped = definition.min + Math.round((clamped - definition.min) / definition.step) * definition.step;
            return Number(Math.max(definition.min, Math.min(definition.max, stepped)).toFixed(6));
        }
        case 'enum': return typeof value === 'string' && definition.options.some(option => option.value === value)
            ? value : definition.defaultValue;
        case 'binding': return value === null || (typeof value === 'string' && definition.allowedKeys.includes(value))
            ? value : definition.defaultValue;
        }
    }
}
