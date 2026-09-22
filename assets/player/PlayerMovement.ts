import { _decorator, Component } from 'cc';
import { CollisionWorld } from '../core/CollisionWorld';
import { MoveVector } from '../core/InputTypes';
const { ccclass, property } = _decorator;

@ccclass('PlayerMovement')
export class PlayerMovement extends Component {
    @property({ min: 1, tooltip: 'World units per second' })
    public speed = 230;

    @property({ min: 1, tooltip: 'Half width/height of the square collider' })
    public halfSize = 18;

    public step(move: MoveVector, dt: number, world: CollisionWorld): boolean {
        const position = this.node.position;
        const next = world.move(position, { x: move.x * this.speed * dt, y: move.y * this.speed * dt }, this.halfSize);
        const moved = Math.abs(next.x - position.x) + Math.abs(next.y - position.y) > 0.001;
        this.node.setPosition(next.x, next.y, position.z);
        return moved;
    }
}
