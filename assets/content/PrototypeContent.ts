import { ContentRegistry, LevelDefinition } from './ContentRegistry';
import { COOP_LEVEL } from './CoopLevel';
export const PLAYER_CONTENT_ID = 'character.player.default';
export const ROOM_CONTENT_ID = 'level.prototype.room_01';
export const PLAYER_ASSET_ID = 'prefab.player';
export const PROTOTYPE_LEVEL: LevelDefinition = {
    id: ROOM_CONTENT_ID, kind: 'level', nameId: 'content.prototypeRoom', dependencies: [PLAYER_CONTENT_ID], characterId: PLAYER_CONTENT_ID,
    bounds: { x: -800, y: -450, width: 1600, height: 900 },
    spawns: [{ x: -230, y: -170 }, { x: 230, y: -170 }],
    obstacles: [
        { x: -120, y: -60, width: 240, height: 120 }, { x: -520, y: 120, width: 100, height: 180 },
        { x: 420, y: 120, width: 100, height: 180 }, { x: -440, y: -330, width: 170, height: 65 },
        { x: 270, y: -330, width: 170, height: 65 },
    ],
};
export function createPrototypeContent(): ContentRegistry {
    const registry = new ContentRegistry();
    registry.register({ id: PLAYER_CONTENT_ID, kind: 'character', nameId: 'content.defaultPlayer', dependencies: [], prefabId: PLAYER_ASSET_ID, speed: 230, halfSize: 18 });
    registry.register(PROTOTYPE_LEVEL); registry.register(COOP_LEVEL); return registry;
}
