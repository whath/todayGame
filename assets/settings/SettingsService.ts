import { PlatformCapabilityService } from '../services/PlatformCapabilityService';
import { ISettingsApplier, ISettingsPersistence, SettingCategory, SettingsChange, SettingsSnapshot, SettingValue } from './SettingDefinition';
import { migrateSettings, SETTINGS_SCHEMA_VERSION } from './SettingsMigration';
import { SettingsRegistry } from './SettingsRegistry';
import { SettingsStore } from './SettingsStore';

export type ApplyResult = 'saved' | 'confirm' | 'failed';
export type SettingsNotice = 'none' | 'invalid' | 'future' | 'loadFailed' | 'saveFailed' | 'applyFailed' | 'reverted' | 'saved';
export type BindingResolution = 'swap' | 'unbind' | 'cancel';

export class SettingsService {
    public readonly store: SettingsStore;
    public notice: SettingsNotice = 'none';
    public lastError = '';
    private working: Record<string, SettingValue> | null = null;
    private pending: SettingsSnapshot | null = null;
    private deadline = 0;
    private readOnly = false;
    private readonly listeners = new Set<(event: SettingsChange) => void>();

    public constructor(
        public readonly registry: SettingsRegistry,
        public readonly capabilities: PlatformCapabilityService,
        private readonly persistence: ISettingsPersistence,
        private readonly applier: ISettingsApplier,
        private readonly now: () => number = () => Date.now(),
    ) { this.store = new SettingsStore(registry.defaults()); }

    public boot(): void {
        let raw: string | null = null;
        try { raw = this.persistence.load(); }
        catch (error) { this.notice = 'loadFailed'; this.lastError = String(error); }
        const result = migrateSettings(raw);
        if (result.warning !== 'none') this.notice = result.warning;
        this.readOnly = result.warning === 'future';
        const values = this.registry.normalize(result.values);
        this.store.commit(values);
        try { this.applyRuntime(values, 'boot'); }
        catch (error) {
            // Safe boot applies known defaults, leaving the original file untouched.
            this.notice = 'applyFailed'; this.lastError = String(error);
            const defaults = this.registry.defaults();
            this.store.commit(defaults);
            this.applyRuntime(defaults, 'boot');
        }
    }
    public get runtime(): SettingsSnapshot { return this.store.runtime; }
    public get editing(): boolean { return this.working !== null; }
    public get awaitingConfirmation(): boolean { return this.pending !== null; }
    public get remainingSeconds(): number { return this.pending ? Math.max(0, Math.ceil((this.deadline - this.now()) / 1000)) : 0; }
    public get values(): SettingsSnapshot { return Object.freeze({ ...(this.working ?? this.store.committed) }); }
    public get dirty(): boolean { return this.registry.all().some(definition => this.values[definition.id] !== this.store.committed[definition.id]); }
    public get restartRequired(): boolean {
        return this.registry.all().some(definition => definition.applyMode === 'restartRequired'
            && this.store.committed[definition.id] !== this.runtime[definition.id]);
    }
    public begin(): void {
        if (this.editing) return;
        this.working = { ...this.store.committed };
        if (this.notice === 'saved' || this.notice === 'reverted') this.notice = 'none';
    }
    public onChanged(listener: (event: SettingsChange) => void): () => void {
        this.listeners.add(listener);
        return () => { this.listeners.delete(listener); };
    }
    public set(id: string, value: SettingValue): boolean {
        if (!this.working || this.pending || this.readOnly) return false;
        const definition = this.registry.get(id);
        if (!this.capabilities.supports(definition.capability)) return false;
        const normalized = this.registry.validate(definition, value);
        if (definition.valueType === 'binding' && this.bindingConflict(id, normalized as string | null)) return false;
        const previous = { ...this.working };
        this.working[id] = normalized;
        if (definition.applyMode === 'live' && !this.preview()) { this.working = previous; return false; }
        return true;
    }
    public bindingConflict(id: string, key: string | null): string | null {
        if (key === null) return null;
        return this.registry.all().find(definition => definition.valueType === 'binding'
            && definition.id !== id && this.values[definition.id] === key)?.id ?? null;
    }
    public rebind(id: string, key: string | null, resolution: BindingResolution = 'cancel'): boolean {
        if (!this.working || this.pending || this.readOnly) return false;
        const definition = this.registry.get(id);
        if (definition.valueType !== 'binding' || !this.capabilities.supports(definition.capability)
            || this.registry.validate(definition, key) !== key) return false;
        const conflict = this.bindingConflict(id, key);
        if (conflict && resolution === 'cancel') return false;
        const old = this.working[id];
        if (conflict) this.working[conflict] = resolution === 'swap' ? old : null;
        this.working[id] = key;
        return true;
    }
    /** Called only after UI confirmation. Resets remain an editable transaction until Apply. */
    public reset(category?: SettingCategory, playerId?: 1 | 2): void {
        if (!this.working || this.pending || this.readOnly) return;
        const next = { ...this.working };
        for (const definition of this.registry.all()) {
            if (category && definition.category !== category) continue;
            if (playerId && definition.playerId !== playerId) continue;
            next[definition.id] = definition.defaultValue;
        }
        // Restored profile has priority; conflicting keys in the other profile become unbound.
        const restored = this.registry.all().filter(d => d.valueType === 'binding'
            && (!category || d.category === category) && (!playerId || d.playerId === playerId));
        for (const definition of restored) {
            const key = next[definition.id];
            if (key === null) continue;
            for (const other of this.registry.all()) {
                if (other.valueType === 'binding' && other.id !== definition.id && next[other.id] === key) next[other.id] = null;
            }
        }
        const previous = this.working;
        this.working = next;
        if (!this.preview()) this.working = previous;
    }
    public apply(): ApplyResult {
        if (!this.working || this.pending || this.readOnly) return 'failed';
        const candidate = this.registry.normalize(this.working);
        try { this.applyRuntime(this.runtimeFor(candidate), 'preview'); }
        catch (error) { this.fail('applyFailed', error); return 'failed'; }
        const risky = this.registry.all().some(definition => definition.risky
            && this.capabilities.supports(definition.capability) && candidate[definition.id] !== this.store.committed[definition.id]);
        if (risky) {
            this.pending = candidate;
            this.deadline = this.now() + 15000;
            return 'confirm';
        }
        return this.commit(candidate);
    }
    public keepChanges(): ApplyResult {
        if (!this.pending) return 'failed';
        if (this.now() >= this.deadline) { this.revert(); return 'failed'; }
        const candidate = this.pending;
        this.pending = null;
        return this.commit(candidate);
    }
    public tick(): void { if (this.pending && this.now() >= this.deadline) this.revert(); }
    public revert(): void {
        this.pending = null;
        this.restore('revert');
        this.working = { ...this.store.committed };
        if (this.notice !== 'applyFailed') this.notice = 'reverted';
    }
    public cancel(): void {
        this.pending = null;
        this.restore('cancel');
        this.working = null;
    }
    public dispose(): void { if (this.editing) this.cancel(); this.listeners.clear(); }

    private preview(): boolean {
        const next = { ...this.runtime };
        for (const definition of this.registry.all()) {
            if (definition.applyMode === 'live' && this.capabilities.supports(definition.capability)) next[definition.id] = this.working![definition.id];
        }
        try { this.applyRuntime(next, 'preview'); return true; }
        catch (error) { this.fail('applyFailed', error); return false; }
    }
    private runtimeFor(candidate: SettingsSnapshot): SettingsSnapshot {
        const next = { ...this.runtime };
        for (const definition of this.registry.all()) {
            if (definition.applyMode !== 'restartRequired' && this.capabilities.supports(definition.capability)) next[definition.id] = candidate[definition.id];
        }
        return next;
    }
    private commit(candidate: SettingsSnapshot): ApplyResult {
        try { this.persistence.save(JSON.stringify({ schemaVersion: SETTINGS_SCHEMA_VERSION, values: candidate })); }
        catch (error) { this.fail('saveFailed', error); this.restore('revert'); return 'failed'; }
        this.store.commit(candidate);
        this.working = { ...candidate };
        this.notice = 'saved';
        this.emit('apply', []);
        return 'saved';
    }
    private restore(reason: 'cancel' | 'revert'): void {
        try { this.applyRuntime(this.runtimeFor(this.store.committed), reason); }
        catch (error) { this.fail('applyFailed', error); }
    }
    private applyRuntime(values: SettingsSnapshot, reason: SettingsChange['reason']): void {
        const previous = this.runtime;
        const ids = this.registry.all().filter(d => values[d.id] !== previous[d.id]).map(d => d.id);
        try { this.applier.apply(values); }
        catch (error) {
            try { this.applier.apply(previous); }
            catch (rollback) { throw new Error(`${String(error)}; rollback: ${String(rollback)}`); }
            throw error;
        }
        this.store.setRuntime(values);
        this.emit(reason, ids);
    }
    private emit(reason: SettingsChange['reason'], ids: readonly string[]): void {
        this.listeners.forEach(listener => listener({ snapshot: this.runtime, reason, ids }));
    }
    private fail(notice: SettingsNotice, error: unknown): void { this.notice = notice; this.lastError = String(error); }
}
