import { DomainEvent } from '../runtime/DomainEvent';
import { FutureSaveError, SaveSerializer } from './SaveSerializer';
import { saveKey, SaveSnapshot, SaveStorage } from './SaveSnapshot';
export interface SaveLoadResult { status: 'loaded' | 'backup' | 'temporary' | 'empty' | 'failed' | 'future'; snapshot: SaveSnapshot | null; error?: string; sourceRaw?: string }

export class SaveService {
    public readonly completed = new DomainEvent<{ profileId: string; slotId: string; reason: string }>();
    public lastError = '';
    public constructor(private readonly storage: SaveStorage, private readonly serializer: SaveSerializer) {}
    public load(profileId: string, slotId: string): SaveLoadResult {
        const key = saveKey(profileId, slotId);
        let found = false; let error = '';
        try {
            for (const [suffix, status] of [['committed', 'loaded'], ['backup', 'backup'], ['temporary', 'temporary']] as const) {
                const raw = this.storage.read(`${key}/${suffix}`); if (raw === null) continue; found = true;
                try {
                    const snapshot = this.decode(raw, profileId, slotId);
                    return { status, snapshot, sourceRaw: raw };
                } catch (failure) {
                    if (failure instanceof FutureSaveError) return { status: 'future', snapshot: null, error: String(failure) };
                    error = String(failure);
                }
            }
        } catch (failure) { return { status: 'failed', snapshot: null, error: String(failure) }; }
        return { status: found ? 'failed' : 'empty', snapshot: null, error };
    }
    /** Event-triggered write-through journal; no per-frame autosave. */
    public requestSave(snapshot: SaveSnapshot, reason: string): boolean {
        this.lastError = '';
        try {
            const key = saveKey(snapshot.profileId, snapshot.slotId);
            const loaded = this.load(snapshot.profileId, snapshot.slotId);
            if (loaded.status === 'future' || loaded.status === 'failed') throw new Error('Refusing to overwrite unreadable/newer save');
            const raw = this.serializer.serialize(snapshot);
            this.storage.write(`${key}/temporary`, raw);
            const staged = this.storage.read(`${key}/temporary`);
            if (staged !== raw) throw new Error('Staged save readback mismatch');
            this.decode(staged, snapshot.profileId, snapshot.slotId);
            if (loaded.snapshot) this.storage.write(`${key}/backup`, loaded.sourceRaw!);
            this.storage.write(`${key}/committed`, raw);
            if (this.storage.read(`${key}/committed`) !== raw) throw new Error('Committed save readback mismatch');
            // A failed temporary cleanup is non-fatal: committed was already verified.
            try { this.storage.remove(`${key}/temporary`); } catch (error) { this.lastError = `Temporary cleanup: ${String(error)}`; }
            this.completed.publish({ profileId: snapshot.profileId, slotId: snapshot.slotId, reason });
            return true;
        } catch (error) { this.lastError = String(error); return false; }
    }
    private decode(raw: string, profileId: string, slotId: string): SaveSnapshot {
        const result = this.serializer.deserialize(raw);
        if (result.profileId !== profileId || result.slotId !== slotId) throw new Error('Save slot identity mismatch');
        return result;
    }
}
