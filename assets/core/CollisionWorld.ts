import { MoveVector } from './InputTypes';

export interface Box { readonly x: number; readonly y: number; readonly width: number; readonly height: number }

/** Axis-swept kinematic collision for the axis-aligned prototype room only. */
export class CollisionWorld {
    public constructor(public readonly bounds: Box, public readonly obstacles: readonly Box[]) {}

    public move(position: MoveVector, delta: MoveVector, halfSize: number): MoveVector {
        const left = this.bounds.x + halfSize;
        const right = this.bounds.x + this.bounds.width - halfSize;
        const bottom = this.bounds.y + halfSize;
        const top = this.bounds.y + this.bounds.height - halfSize;
        let x = Math.max(left, Math.min(right, position.x + delta.x));
        let y = position.y;
        for (const box of this.obstacles) {
            if (y + halfSize <= box.y || y - halfSize >= box.y + box.height) continue;
            if (delta.x > 0 && position.x + halfSize <= box.x) x = Math.min(x, box.x - halfSize);
            if (delta.x < 0 && position.x - halfSize >= box.x + box.width) x = Math.max(x, box.x + box.width + halfSize);
        }
        y = Math.max(bottom, Math.min(top, position.y + delta.y));
        for (const box of this.obstacles) {
            if (x + halfSize <= box.x || x - halfSize >= box.x + box.width) continue;
            if (delta.y > 0 && position.y + halfSize <= box.y) y = Math.min(y, box.y - halfSize);
            if (delta.y < 0 && position.y - halfSize >= box.y + box.height) y = Math.max(y, box.y + box.height + halfSize);
        }
        return { x, y };
    }
}
