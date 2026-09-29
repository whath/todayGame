/** Stable category identity. The shell knows metadata, never vehicle or relay rules. */
export interface GameCategory { readonly id: string; readonly titleId: string; readonly descriptionId: string }
export class CategoryRegistry {
    private readonly entries = new Map<string, GameCategory>();
    public register(category: GameCategory): void {
        if (!/^[a-z][a-z0-9.-]*$/.test(category.id) || this.entries.has(category.id)) throw Error('Invalid or duplicate category');
        this.entries.set(category.id, Object.freeze({ ...category }));
    }
    public get(id: string): GameCategory { const value = this.entries.get(id); if (!value) throw Error('Unknown category: ' + id); return value; }
    public get all(): readonly GameCategory[] { return [...this.entries.values()]; }
}
