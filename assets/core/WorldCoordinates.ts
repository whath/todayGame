import { MoveVector } from './InputTypes';
/** Legacy level/save coordinates are centimetres on the ground plane, not engine Y. */
export const WORLD_SCALE = 0.01;
export interface WorldPoint { readonly x: number; readonly y: number; readonly z: number }
export function toWorld(point: MoveVector, height = 0): WorldPoint {
    return { x: point.x * WORLD_SCALE, y: height, z: -point.y * WORLD_SCALE };
}
export function toGround(point: WorldPoint): MoveVector {
    return { x: point.x / WORLD_SCALE, y: -point.z / WORLD_SCALE };
}
