import { _decorator, Component } from 'cc';
import { CollisionWorld } from '../core/CollisionWorld';
import { MoveVector } from '../core/InputTypes';
import { toGround, toWorld } from '../core/WorldCoordinates';
const { ccclass, property } = _decorator;

@ccclass('PlayerMovement')
export class PlayerMovement extends Component {
    @property({ min: 1, tooltip: 'Ground centimetres per second' })
    public speed = 230;

    @property({ min: 1, tooltip: 'Half width/depth of the ground footprint in centimetres' })
    public halfSize = 18;

    public step(move: MoveVector, dt: number, world: CollisionWorld): boolean {
        const position = toGround(this.node.position);
        const next = world.move(position, { x: move.x * this.speed * dt, y: move.y * this.speed * dt }, this.halfSize);
        const moved = Math.abs(next.x - position.x) + Math.abs(next.y - position.y) > 0.001;
        const p = toWorld(next, this.node.position.y);
        this.node.setPosition(p.x, p.y, p.z);
        return moved;
    }
}
