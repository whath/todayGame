import { Color, Graphics, Layers, Node, UITransform } from 'cc';
import { Box, CollisionWorld } from '../core/CollisionWorld';
import { MoveVector } from '../core/InputTypes';
import { LevelDefinition } from '../content/ContentRegistry';
import { PROTOTYPE_LEVEL } from '../content/PrototypeContent';

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
        const node = new Node('Floor, boundary and obstacles');
        node.layer = Layers.Enum.UI_2D;
        node.parent = parent;
        node.addComponent(UITransform).setContentSize(this.bounds.width, this.bounds.height);
        const graphics = node.addComponent(Graphics);
        const b = this.bounds;
        graphics.fillColor = new Color(29, 39, 55);
        graphics.rect(b.x, b.y, b.width, b.height);
        graphics.fill();
        graphics.lineWidth = 1;
        graphics.strokeColor = new Color(40, 52, 70);
        for (let x = b.x; x <= b.x + b.width; x += 50) {
            graphics.moveTo(x, b.y); graphics.lineTo(x, b.y + b.height);
        }
        for (let y = b.y; y <= b.y + b.height; y += 50) {
            graphics.moveTo(b.x, y); graphics.lineTo(b.x + b.width, y);
        }
        graphics.stroke();
        graphics.lineWidth = 10;
        graphics.strokeColor = new Color(109, 128, 154);
        graphics.rect(b.x - 5, b.y - 5, b.width + 10, b.height + 10);
        graphics.stroke();
        graphics.fillColor = new Color(87, 106, 132);
        this.obstacles.forEach(box => { graphics.rect(box.x, box.y, box.width, box.height); graphics.fill(); });
        this.spawns.forEach((spawn, index) => {
            graphics.strokeColor = index === 0 ? new Color(72, 199, 255, 150) : new Color(255, 181, 91, 150);
            graphics.lineWidth = 2;
            graphics.circle(spawn.x, spawn.y, 30);
            graphics.stroke();
        });
    }
}
