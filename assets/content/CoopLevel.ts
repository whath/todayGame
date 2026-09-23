import { LevelDefinition } from './ContentRegistry';
export const COOP_LEVEL_ID = 'level.coop.relay_01';
export const COOP_LEVEL: LevelDefinition = {
    id: COOP_LEVEL_ID, kind: 'level', nameId: 'content.relay', dependencies: ['character.player.default'], characterId: 'character.player.default',
    bounds: { x: -700, y: -350, width: 1400, height: 700 },
    spawns: [{ x: -540, y: -90 }, { x: -540, y: 90 }],
    obstacles: [{ x: -25, y: -350, width: 50, height: 250 }, { x: -25, y: 100, width: 50, height: 250 }],
    coop: { plate: { x: -390, y: -55, width: 110, height: 110 }, gate: { x: -25, y: -100, width: 50, height: 200 },
        terminal: { x: 240, y: 0 }, interactRadius: 75, exit: { x: 490, y: -110, width: 150, height: 220 } },
};
