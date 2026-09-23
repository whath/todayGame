export interface AssetBackend<T> { load(id: string): Promise<T>; release(id: string, asset: T): void }
interface Entry<T> { owners: Set<number>; promise: Promise<T>; asset?: T }

export class AssetService<T> {
    private readonly entries = new Map<string, Entry<T>>();
    private sequence = 0;
    public constructor(private readonly backend: AssetBackend<T>) {}
    public createScope(name: string): AssetScope<T> { return new AssetScope(this, ++this.sequence, name); }
    public acquire(scope: AssetScope<T>, id: string): Promise<T> {
        if (scope.disposed) return Promise.reject(new Error('Asset scope disposed'));
        let entry = this.entries.get(id);
        if (!entry) {
            entry = { owners: new Set(), promise: Promise.resolve(null as T) };
            this.entries.set(id, entry);
            const captured = entry;
            captured.promise = Promise.resolve().then(() => this.backend.load(id)).then(asset => {
                captured.asset = asset;
                if (captured.owners.size === 0) this.drop(id, captured);
                return asset;
            }, error => { if (this.entries.get(id) === captured) this.entries.delete(id); throw error; });
        }
        entry.owners.add(scope.id);
        return entry.promise.then(asset => { if (scope.disposed) throw new Error('Asset scope disposed during load'); return asset; });
    }
    public release(scopeId: number, id: string): void {
        const entry = this.entries.get(id); if (!entry) return;
        entry.owners.delete(scopeId);
        if (entry.owners.size === 0 && entry.asset !== undefined) this.drop(id, entry);
    }
    public get activeAssets(): number { return this.entries.size; }
    private drop(id: string, entry: Entry<T>): void {
        if (this.entries.get(id) !== entry) return;
        this.entries.delete(id);
        if (entry.asset !== undefined) this.backend.release(id, entry.asset);
    }
}
export class AssetScope<T> {
    public disposed = false;
    private readonly held = new Map<string, Promise<T>>();
    public constructor(private readonly service: AssetService<T>, public readonly id: number, public readonly name: string) {}
    public acquire(id: string): Promise<T> {
        if (this.disposed) return Promise.reject(new Error('Asset scope disposed'));
        const existing = this.held.get(id); if (existing) return existing;
        const promise = this.service.acquire(this, id).catch(error => { this.held.delete(id); throw error; });
        this.held.set(id, promise); return promise;
    }
    public dispose(): void {
        if (this.disposed) return;
        this.disposed = true;
        this.held.forEach((_, id) => this.service.release(this.id, id)); this.held.clear();
    }
}
