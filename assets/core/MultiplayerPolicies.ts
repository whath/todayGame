import { MoveVector } from './InputTypes';
import { CollisionWorld } from './CollisionWorld';
export type SeparationMode = 'warning' | 'softTether' | 'hardTether' | 'blockProgress' | 'autoRegroup' | 'teleport';
export interface SeparationPolicy { mode: SeparationMode; maximumDistance: number }
export type PlayerCollisionPolicy = 'off' | 'soft' | 'solid';
export interface PairMotionResult { positions: readonly MoveVector[]; warning: boolean; blockProgress: boolean; regroupRequested: boolean }
/** No Camera dependency. Regroup is a request; the caller must resolve a safe spawn. */
export function resolvePairMotion(before: readonly MoveVector[], proposed: readonly MoveVector[], world: CollisionWorld, half: number,
    separation: SeparationPolicy, collision: PlayerCollisionPolicy): PairMotionResult {
    if (before.length !== 2 || proposed.length !== 2 || !Number.isFinite(separation.maximumDistance) || separation.maximumDistance <= 0) throw Error('Invalid pair policy');
    let positions = proposed.map(p => ({ ...p }));
    const distance = (pair: readonly MoveVector[]) => Math.hypot(pair[1].x - pair[0].x, pair[1].y - pair[0].y);
    const warning = distance(positions) > separation.maximumDistance;
    if (warning && distance(positions) > distance(before)) {
        if (separation.mode === 'hardTether') positions = before.map(p => ({ ...p }));
        if (separation.mode === 'softTether') positions = positions.map((p, i) => world.move(before[i], { x: (p.x - before[i].x) * 0.2, y: (p.y - before[i].y) * 0.2 }, half));
    }
    // Sweep the relative motion so Solid cannot swap players through each other in one frame.
    const relativeStart = { x: before[1].x - before[0].x, y: before[1].y - before[0].y };
    const relativeEnd = { x: positions[1].x - positions[0].x, y: positions[1].y - positions[0].y };
    let enter = 0, exit = 1;
    for (const axis of ['x', 'y'] as const) {
        const delta = relativeEnd[axis] - relativeStart[axis];
        if (delta === 0) { if (Math.abs(relativeStart[axis]) >= half * 2) exit = -1; }
        else {
            const t1 = (-half * 2 - relativeStart[axis]) / delta, t2 = (half * 2 - relativeStart[axis]) / delta;
            enter = Math.max(enter, Math.min(t1, t2)); exit = Math.min(exit, Math.max(t1, t2));
        }
    }
    const sweptOverlap = enter < exit && exit > 0 && enter < 1;
    if (collision === 'solid' && sweptOverlap) positions = before.map(p => ({ ...p }));
    if (collision === 'soft' && Math.abs(positions[1].x - positions[0].x) < half * 2 && Math.abs(positions[1].y - positions[0].y) < half * 2) {
        {
            const dx = positions[1].x - positions[0].x || 1, dy = positions[1].y - positions[0].y, length = Math.hypot(dx, dy);
            positions = positions.map((p, i) => world.move(p, { x: dx / length * (i ? 2 : -2), y: dy / length * (i ? 2 : -2) }, half));
        }
    }
    return { positions, warning, blockProgress: warning && separation.mode === 'blockProgress',
        regroupRequested: warning && (separation.mode === 'autoRegroup' || separation.mode === 'teleport') };
}
