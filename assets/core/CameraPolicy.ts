import { Box } from './CollisionWorld';
import { MoveVector } from './InputTypes';
export interface CameraPose { center: MoveVector; halfHeight: number }
export interface CameraPolicy {
    readonly id: string;
    frame(targets: readonly MoveVector[], bounds: Box, aspect: number): CameraPose;
}
/** Planar 3D greybox framing. Values remain in the level's logical centimetres. */
export class SharedGroupCameraPolicy implements CameraPolicy {
    public readonly id = 'shared-group';
    public frame(targets: readonly MoveVector[], bounds: Box, aspect: number): CameraPose {
        const xs = targets.map(p => p.x), ys = targets.map(p => p.y);
        const minX = Math.min(...xs), maxX = Math.max(...xs), minY = Math.min(...ys), maxY = Math.max(...ys);
        const center = targets.length ? { x: (minX + maxX) / 2, y: (minY + maxY) / 2 }
            : { x: bounds.x + bounds.width / 2, y: bounds.y + bounds.height / 2 };
        // Keep a useful amount of the room visible; reserve overlay/header space.
        const halfHeight = targets.length ? Math.max(480, (maxY - minY) * 0.5 + 200,
            ((maxX - minX) * 0.5 + 180) / Math.max(0.1, aspect)) : 480;
        const zoom = Math.min(1200, halfHeight);
        const clamp = (value: number, start: number, length: number, half: number) => half * 2 >= length
            ? start + length / 2 : Math.max(start + half, Math.min(start + length - half, value));
        return { center: { x: clamp(center.x, bounds.x, bounds.width, zoom * Math.max(0.1, aspect)),
            y: clamp(center.y, bounds.y, bounds.height, zoom / Math.sin(Math.atan2(16, 10))) }, halfHeight: zoom };
    }
}
/** A second concrete policy for the existing camera lab, not a genre framework. */
export class FixedRoomCameraPolicy implements CameraPolicy {
    public readonly id = 'fixed-room';
    public frame(_targets: readonly MoveVector[], bounds: Box, aspect: number): CameraPose {
        return { center: { x: bounds.x + bounds.width / 2, y: bounds.y + bounds.height / 2 },
            halfHeight: Math.max(bounds.height * 0.5 + 160, (bounds.width * 0.5 + 100) / Math.max(0.1, aspect)) };
    }
}
