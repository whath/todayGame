import { Box } from '../core/CollisionWorld';
import { MoveVector } from '../core/InputTypes';
import { CoopDefinition, overlaps } from '../core/CoopChallenge';
export type ContentId = string;
interface ContentBase { readonly id: ContentId; readonly nameId: string; readonly dependencies: readonly ContentId[] }
export interface CharacterDefinition extends ContentBase {
    readonly kind: 'character'; readonly prefabId: string; readonly speed: number; readonly halfSize: number;
}
export interface LevelDefinition extends ContentBase {
    readonly kind: 'level'; readonly characterId: ContentId; readonly bounds: Box;
    readonly obstacles: readonly Box[]; readonly spawns: readonly MoveVector[];
    readonly coop?: CoopDefinition;
}
export type ContentDefinition = CharacterDefinition | LevelDefinition;
function freeze<T>(value: T): T {
    if (typeof value === 'object' && value !== null) { Object.values(value).forEach(freeze); Object.freeze(value); }
    return value;
}
export class ContentRegistry {
    private readonly definitions = new Map<ContentId, ContentDefinition>();
    public register(definition: ContentDefinition): void {
        if (!/^(character|level)\.[a-z0-9_.]+$/.test(definition.id) || this.definitions.has(definition.id)) throw new Error(`Invalid/duplicate content id: ${definition.id}`);
        // Definitions are JSON DTOs; detach caller-owned arrays before freezing.
        this.definitions.set(definition.id, freeze(JSON.parse(JSON.stringify(definition)) as ContentDefinition));
    }
    public all(): readonly ContentDefinition[] { return [...this.definitions.values()]; }
    public has(id: string): boolean { return this.definitions.has(id); }
    public get(id: string): ContentDefinition {
        const value = this.definitions.get(id); if (!value) throw new Error(`Missing content: ${id}`); return value;
    }
    public character(id: string): CharacterDefinition { const d = this.get(id); if (d.kind !== 'character') throw new Error('Expected character'); return d; }
    public level(id: string): LevelDefinition { const d = this.get(id); if (d.kind !== 'level') throw new Error('Expected level'); return d; }
    public validate(hasAsset: (id: string) => boolean, hasText: (id: string) => boolean): void {
        const visiting = new Set<string>(); const visited = new Set<string>();
        const visit = (id: string): void => {
            if (visiting.has(id)) throw new Error(`Cyclic content dependency: ${id}`);
            if (visited.has(id)) return;
            visiting.add(id); const d = this.get(id);
            if (!hasText(d.nameId)) throw new Error(`Missing localization: ${d.nameId}`);
            for (const dependency of d.dependencies) visit(dependency);
            if (d.kind === 'character') {
                if (!hasAsset(d.prefabId)) throw new Error(`Missing asset: ${d.prefabId}`);
                if (!Number.isFinite(d.speed) || d.speed <= 0 || d.speed > 1000 || !Number.isFinite(d.halfSize) || d.halfSize <= 0 || d.halfSize > 100) throw new Error(`Invalid character range: ${id}`);
            } else {
                const character = this.character(d.characterId);
                if (!d.dependencies.includes(d.characterId)) throw new Error(`Missing declared character dependency: ${id}`);
                for (const box of [d.bounds, ...d.obstacles]) {
                    if (![box.x, box.y, box.width, box.height].every(Number.isFinite) || box.width <= 0 || box.height <= 0) throw new Error(`Invalid box: ${id}`);
                }
                if (d.obstacles.some(box => box.x < d.bounds.x || box.y < d.bounds.y || box.x + box.width > d.bounds.x + d.bounds.width || box.y + box.height > d.bounds.y + d.bounds.height)) throw new Error(`Obstacle outside level: ${id}`);
                if (d.spawns.length !== 2 || d.spawns.some(spawn => !isWalkable(d, spawn, character.halfSize))) throw new Error(`Invalid spawns: ${id}`);
                if (d.coop) {
                    const c = d.coop;
                    for (const box of [c.plate, c.gate, c.exit]) {
                        if (![box.x, box.y, box.width, box.height].every(Number.isFinite) || box.width <= 0 || box.height <= 0
                            || box.x < d.bounds.x || box.y < d.bounds.y || box.x + box.width > d.bounds.x + d.bounds.width
                            || box.y + box.height > d.bounds.y + d.bounds.height) throw new Error(`Invalid cooperative region: ${id}`);
                    }
                    if (!Number.isFinite(c.interactRadius) || c.interactRadius <= 0 || c.interactRadius > 150
                        || !isWalkable(d, c.terminal, character.halfSize)
                        || d.spawns.some(p => overlaps(c.gate, p, character.halfSize))) throw new Error(`Invalid cooperative interaction: ${id}`);
                }
            }
            visiting.delete(id); visited.add(id);
        };
        this.definitions.forEach(d => visit(d.id));
    }
}
export function isWalkable(level: LevelDefinition, p: MoveVector, half: number): boolean {
    const b = level.bounds;
    return Number.isFinite(p.x) && Number.isFinite(p.y) && p.x - half >= b.x && p.x + half <= b.x + b.width
        && p.y - half >= b.y && p.y + half <= b.y + b.height
        && !level.obstacles.some(box => p.x + half > box.x && p.x - half < box.x + box.width && p.y + half > box.y && p.y - half < box.y + box.height);
}
