import { CoopSnapshot } from '../core/CoopChallenge';
export const SAVE_SCHEMA_VERSION = 3;
export interface ProfileSnapshot { unlockedContentIds: string[]; completedLevelIds: string[]; sessionsStarted: number }
export interface SessionSnapshot {
    levelId: string; characterId: string; seed: number; randomState: number; elapsedSeconds: number;
    players: { playerId: 1 | 2; x: number; y: number }[];
    coop?: CoopSnapshot;
}
export interface SaveSnapshot {
    schemaVersion: 3; profileId: string; slotId: string; savedAt: number;
    profile: ProfileSnapshot; session: SessionSnapshot | null;
}
/** Adapter owns the namespace and storage medium; keys here are logical slot keys. */
export interface SaveStorage { read(key: string): string | null; write(key: string, value: string): void; remove(key: string): void }
export function saveKey(profileId: string, slotId: string): string {
    if (![profileId, slotId].every(value => /^[a-z0-9_.-]{1,64}$/.test(value))) throw new Error('Invalid profile/slot id');
    return `${profileId}/${slotId}`;
}
