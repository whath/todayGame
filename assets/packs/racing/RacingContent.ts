export interface VehicleDefinition {
    readonly id: string; readonly nameId: string; readonly mass: number;
    readonly engineForce: number; readonly brakeForce: number; readonly grip: number;
    readonly maxSpeed: number; readonly wheelbase: number; readonly spring: number; readonly damper: number;
}
export interface TrackPoint { readonly x: number; readonly z: number; readonly y: number }
export interface TrackDefinition {
    readonly id: string; readonly nameId: string; readonly width: number;
    readonly points: readonly TrackPoint[]; readonly laps: number;
}
export const VEHICLES: readonly VehicleDefinition[] = [
    { id: 'racing.car.tourer', nameId: 'racing.car.tourer', mass: 1100, engineForce: 6500, brakeForce: 14000, grip: 1.15, maxSpeed: 40, wheelbase: 2.5, spring: 34000, damper: 3800 },
    { id: 'racing.car.sport', nameId: 'racing.car.sport', mass: 950, engineForce: 7800, brakeForce: 13000, grip: 1.05, maxSpeed: 48, wheelbase: 2.5, spring: 36000, damper: 3400 },
];
/** Closed clockwise route; checkpoints at EVERY road section prevent skipping corners. Metres, Y up. */
export const TRACKS: readonly TrackDefinition[] = [{
    id: 'racing.track.training', nameId: 'racing.track.training', width: 14, laps: 3,
    points: [
        { x: -45, y: 0, z: 20 }, { x: -45, y: 0, z: -25 },
        { x: -35, y: 0, z: -45 }, { x: -15, y: 0, z: -55 },
        { x: 20, y: 0, z: -55 }, { x: 40, y: 0, z: -40 },
        { x: 50, y: 0, z: -15 }, { x: 50, y: 2, z: 10 },
        { x: 50, y: 0, z: 35 }, { x: 30, y: 0, z: 55 },
        { x: -15, y: 0, z: 55 }, { x: -35, y: 0, z: 45 },
    ],
}];
export interface RacingSelection { readonly carIds: readonly [string, string]; readonly trackId: string }
export function resolveRace(selection: RacingSelection): { cars: readonly [VehicleDefinition, VehicleDefinition]; track: TrackDefinition } {
    validateRacingContent();
    const cars = selection.carIds.map(id => VEHICLES.find(v => v.id === id));
    const track = TRACKS.find(t => t.id === selection.trackId);
    if (!track || !cars[0] || !cars[1]) throw Error('Unknown racing content');
    return { cars: [cars[0], cars[1]], track };
}
export function direction(track: TrackDefinition, index: number): { x: number; z: number } {
    const a = track.points[index], b = track.points[(index + 1) % track.points.length];
    const length = Math.hypot(b.x - a.x, b.z - a.z);
    return { x: (b.x - a.x) / length, z: (b.z - a.z) / length };
}

export function validateRacingContent(vehicles: readonly VehicleDefinition[] = VEHICLES, tracks: readonly TrackDefinition[] = TRACKS,
    hasText: (id: string) => boolean = () => true): void {
    const ids = new Set<string>();
    for (const entry of [...vehicles, ...tracks]) {
        if (!entry.id.startsWith('racing.') || ids.has(entry.id) || !hasText(entry.nameId)) throw Error('Invalid racing identity or localization');
        ids.add(entry.id);
    }
    for (const car of vehicles) for (const value of [car.mass, car.engineForce, car.brakeForce, car.grip, car.maxSpeed, car.wheelbase, car.spring, car.damper]) {
        if (!Number.isFinite(value) || value <= 0) throw Error('Invalid vehicle parameter');
    }
    for (const track of tracks) {
        if (!Number.isInteger(track.laps) || track.laps < 1 || track.width < 10 || !Number.isFinite(track.width) || track.points.length < 4) throw Error('Invalid track');
        track.points.forEach((a, i) => {
            const b = track.points[(i + 1) % track.points.length];
            if (![a.x, a.y, a.z].every(Number.isFinite) || Math.hypot(b.x - a.x, b.z - a.z) < 10) throw Error('Invalid track segment');
        });
    }
}
