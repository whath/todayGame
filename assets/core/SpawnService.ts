import { Box } from './CollisionWorld';
import { MoveVector } from './InputTypes';
export class SpawnService {
    public safe(p: MoveVector, bounds: Box, obstacles: readonly Box[], half: number, occupied: readonly MoveVector[] = []): boolean {
        return Number.isFinite(p.x) && Number.isFinite(p.y) && half > 0 && Number.isFinite(half)
            && p.x - half >= bounds.x && p.x + half <= bounds.x + bounds.width && p.y - half >= bounds.y && p.y + half <= bounds.y + bounds.height
            && !obstacles.some(b => p.x + half > b.x && p.x - half < b.x + b.width && p.y + half > b.y && p.y - half < b.y + b.height)
            && !occupied.some(q => Math.abs(p.x - q.x) < half * 2 && Math.abs(p.y - q.y) < half * 2);
    }
    public resolve(preferred: MoveVector, fallbacks: readonly MoveVector[], bounds: Box, obstacles: readonly Box[], half: number, occupied: readonly MoveVector[] = []): MoveVector {
        const candidate = [preferred, ...fallbacks].find(p => this.safe(p, bounds, obstacles, half, occupied));
        if (!candidate) throw Error('No safe spawn candidate'); return { x: candidate.x, y: candidate.y };
    }
}
