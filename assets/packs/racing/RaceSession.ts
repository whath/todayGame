import { direction, TrackDefinition, TrackPoint } from './RacingContent';
export interface RacerProgress { next: number; laps: number; finishedAt: number | null; lastCrossing: number }
/** Ordered directional swept gates. No progress from resets, backwards crossings or distant teleports. */
export class RaceSession {
    public countdown = 3;
    public elapsed = 0;
    public readonly racers: RacerProgress[] = [0, 1].map(() => ({ next: 1, laps: 0, finishedAt: null, lastCrossing: 0 }));
    public constructor(public readonly track: TrackDefinition) {}
    public get finished(): boolean { return this.racers.every(p => p.finishedAt !== null); }
    public tick(dt: number): boolean {
        if (!Number.isFinite(dt) || dt <= 0 || this.finished) return false;
        if (this.countdown > 0) { this.countdown = Math.max(0, this.countdown - dt); return false; }
        this.elapsed += dt; return true;
    }
    public advance(player: number, before: TrackPoint, after: TrackPoint): void {
        const p = this.racers[player];
        if (this.countdown > 0 || p.finishedAt !== null || Math.hypot(after.x - before.x, after.z - before.z) > 5) return;
        const point = this.track.points[p.next];
        const prev = (p.next + this.track.points.length - 1) % this.track.points.length;
        const d = direction(this.track, prev);
        const a = (before.x - point.x) * d.x + (before.z - point.z) * d.z;
        const b = (after.x - point.x) * d.x + (after.z - point.z) * d.z;
        if (!(a < 0 && b >= 0)) return;
        const t = -a / (b - a), x = before.x + (after.x - before.x) * t, z = before.z + (after.z - before.z) * t;
        const y = before.y + (after.y - before.y) * t;
        if (Math.abs((x - point.x) * -d.z + (z - point.z) * d.x) > this.track.width / 2 || Math.abs(y - point.y) > 3) return;
        p.lastCrossing = p.next;
        if (p.next === 0 && ++p.laps >= this.track.laps) p.finishedAt = this.elapsed - (1 - t) / 120;
        p.next = (p.next + 1) % this.track.points.length;
    }
    public resetPose(player: number, advance = 4): { position: TrackPoint; yaw: number } {
        const i = this.racers[player].lastCrossing, a = this.track.points[i], d = direction(this.track, i);
        const lane = player === 0 ? -2.5 : 2.5;
        const b = this.track.points[(i + 1) % this.track.points.length];
        const length = Math.hypot(b.x - a.x, b.z - a.z);
        const along = Math.max(1, Math.min(advance, length - 4));
        return { position: { x: a.x + d.x * along - d.z * lane, z: a.z + d.z * along + d.x * lane, y: a.y + (b.y - a.y) * along / length + 1.1 },
            yaw: Math.atan2(-d.x, -d.z) * 180 / Math.PI };
    }
    public order(positions: readonly TrackPoint[]): number[] {
        const progress = (i: number) => {
            const p = this.racers[i], a = this.track.points[p.lastCrossing], b = this.track.points[p.next];
            const length = Math.hypot(b.x - a.x, b.z - a.z);
            const fraction = Math.max(0, Math.min(0.99, ((positions[i].x - a.x) * (b.x - a.x) + (positions[i].z - a.z) * (b.z - a.z)) / (length * length)));
            return p.laps * this.track.points.length + p.lastCrossing + fraction;
        };
        return [0, 1].sort((a, b) => {
            const fa = this.racers[a].finishedAt, fb = this.racers[b].finishedAt;
            if (fa !== null || fb !== null) return fa === null ? 1 : fb === null ? -1 : fa - fb;
            return progress(b) - progress(a);
        });
    }
}
