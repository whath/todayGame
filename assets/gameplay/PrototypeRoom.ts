import { Color, Node } from 'cc';
import { Box, CollisionWorld } from '../core/CollisionWorld';
import { MoveVector } from '../core/InputTypes';
import { LevelDefinition } from '../content/ContentRegistry';
import { PROTOTYPE_LEVEL } from '../content/PrototypeContent';
import { toWorld, WORLD_SCALE as S } from '../core/WorldCoordinates';
import { greybox } from './GreyboxGeometry';

export class PrototypeRoom {
    public readonly bounds: Box;
    public readonly spawns: readonly MoveVector[];
    public readonly obstacles: readonly Box[];
    public readonly collision: CollisionWorld;
    public constructor(definition: LevelDefinition = PROTOTYPE_LEVEL) {
        this.bounds = definition.bounds; this.spawns = definition.spawns; this.obstacles = definition.obstacles;
        this.collision = new CollisionWorld(this.bounds, this.obstacles);
    }
    public build(parent: Node): void {
        const b = this.bounds;
        const center = toWorld({ x: b.x + b.width / 2, y: b.y + b.height / 2 });
        greybox(parent, 'Floor', [center.x, -0.12, center.z], [b.width * S, 0.24, b.height * S], new Color(58, 73, 88));
        const wall = new Color(112, 133, 152);
        const box = (name: string, rect: Box, height: number) => {
            const p = toWorld({ x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 });
            greybox(parent, name, [p.x, height / 2, p.z], [rect.width * S, height, rect.height * S], wall);
        };
        box('North boundary', { x: b.x, y: b.y + b.height, width: b.width, height: 8 }, 0.25);
        box('South boundary', { x: b.x, y: b.y - 8, width: b.width, height: 8 }, 0.25);
        box('West boundary', { x: b.x - 8, y: b.y, width: 8, height: b.height }, 0.25);
        box('East boundary', { x: b.x + b.width, y: b.y, width: 8, height: b.height }, 0.25);
        this.obstacles.forEach((obstacle, i) => box('Obstacle ' + i, obstacle, 0.65));
        this.spawns.forEach((spawn, i) => {
            const p = toWorld(spawn);
            greybox(parent, 'Spawn ' + (i + 1), [p.x, 0.015, p.z], [0.6, 0.03, 0.6],
                i === 0 ? new Color(46, 124, 162) : new Color(155, 111, 49));
        });
    }
}
