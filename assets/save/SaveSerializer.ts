import { ContentRegistry, isWalkable } from '../content/ContentRegistry';
import { SAVE_SCHEMA_VERSION, saveKey, SaveSnapshot } from './SaveSnapshot';
import { inside } from '../core/CoopChallenge';

export class FutureSaveError extends Error {}
function object(value: unknown): value is Record<string, unknown> { return typeof value === 'object' && value !== null && !Array.isArray(value); }
function integer(value: unknown, min = 0, max = Number.MAX_SAFE_INTEGER): value is number { return typeof value === 'number' && Number.isSafeInteger(value) && value >= min && value <= max; }

export class SaveSerializer {
    public constructor(private readonly content: ContentRegistry) {}
    public serialize(snapshot: SaveSnapshot): string { return JSON.stringify(this.validate(snapshot)); }
    public deserialize(raw: string): SaveSnapshot {
        const parsed: unknown = JSON.parse(raw);
        if (!object(parsed) || !integer(parsed.schemaVersion, 1)) throw new Error('Invalid save envelope');
        if (parsed.schemaVersion > SAVE_SCHEMA_VERSION) throw new FutureSaveError('Save uses a newer schema');
        if (parsed.schemaVersion === 1) {
            // v1 had profile.unlocks and seed only. Original source remains in backup on save.
            if (object(parsed.profile)) { parsed.profile.unlockedContentIds = parsed.profile.unlocks ?? []; delete parsed.profile.unlocks; }
            if (object(parsed.session)) parsed.session.randomState = parsed.session.seed;
            parsed.schemaVersion = 2;
        }
        if (parsed.schemaVersion === 2) {
            // v2 predates cooperative levels; preserve its original room and positions.
            if (object(parsed.session) && parsed.session.coop !== undefined) throw new Error('Unexpected v2 cooperative state');
            parsed.schemaVersion = 3;
        }
        return this.validate(parsed);
    }
    public validate(value: unknown): SaveSnapshot {
        if (!object(value) || value.schemaVersion !== SAVE_SCHEMA_VERSION || typeof value.profileId !== 'string' || typeof value.slotId !== 'string' || !integer(value.savedAt)) throw new Error('Invalid save header');
        saveKey(value.profileId, value.slotId);
        const profile = value.profile;
        if (!object(profile) || !integer(profile.sessionsStarted)) throw new Error('Invalid profile');
        const ids = (raw: unknown, levels: boolean): string[] => {
            if (!Array.isArray(raw) || raw.some(id => typeof id !== 'string' || !this.content.has(id) || (levels && this.content.get(id).kind !== 'level'))) throw new Error('Invalid saved content id');
            return [...new Set(raw as string[])];
        };
        const unlocked = ids(profile.unlockedContentIds, false); const completed = ids(profile.completedLevelIds, true);
        let session: SaveSnapshot['session'] = null;
        if (value.session !== null) {
            const s = value.session;
            if (!object(s) || typeof s.levelId !== 'string' || typeof s.characterId !== 'string' || !integer(s.seed, 1, 0xffffffff)
                || !integer(s.randomState, 1, 0xffffffff) || typeof s.elapsedSeconds !== 'number' || !Number.isFinite(s.elapsedSeconds) || s.elapsedSeconds < 0
                || !Array.isArray(s.players) || s.players.length !== 2) throw new Error('Invalid session');
            const level = this.content.level(s.levelId); const character = this.content.character(s.characterId);
            if (level.characterId !== character.id) throw new Error('Character does not belong to this level');
            const seen = new Set<number>();
            const players = s.players.map(p => {
                if (!object(p) || (p.playerId !== 1 && p.playerId !== 2) || typeof p.x !== 'number' || typeof p.y !== 'number'
                    || seen.has(p.playerId) || !isWalkable(level, { x: p.x, y: p.y }, character.halfSize)) throw new Error('Invalid player position/identity');
                seen.add(p.playerId); return { playerId: p.playerId, x: p.x, y: p.y } as { playerId: 1 | 2; x: number; y: number };
            }).sort((a, b) => a.playerId - b.playerId);
            session = { levelId: s.levelId, characterId: s.characterId, seed: s.seed, randomState: s.randomState, elapsedSeconds: s.elapsedSeconds, players };
            if (level.coop) {
                if (!object(s.coop) || typeof s.coop.gateLatched !== 'boolean' || typeof s.coop.completed !== 'boolean'
                    || (s.coop.completed && (!s.coop.gateLatched || !players.every(p => inside(level.coop!.exit, p))))) throw new Error('Invalid cooperative save state');
                session.coop = { gateLatched: s.coop.gateLatched, completed: s.coop.completed };
            } else if (s.coop !== undefined) throw new Error('Cooperative state requires a cooperative level');
        }
        // Reconstruct only known DTO fields; never return caller-owned engine objects.
        return { schemaVersion: 3, profileId: value.profileId, slotId: value.slotId, savedAt: value.savedAt,
            profile: { unlockedContentIds: unlocked, completedLevelIds: completed, sessionsStarted: profile.sessionsStarted }, session };
    }
}
