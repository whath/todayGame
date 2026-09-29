import { BoxCollider, Camera, Color, ERigidBodyType, Layers, Node, PhysicsSystem, Rect, RigidBody, Vec3 } from 'cc';
import { PlayerInputSlot } from '../../input/PlayerInputSlot';
import { RacingSelection, resolveRace, TrackDefinition } from '../../packs/racing/RacingContent';
import { RaceSession } from '../../packs/racing/RaceSession';
import { greybox } from '../GreyboxGeometry';
import { RacingVehicle } from './RacingVehicle';
/** Engine adapter for racing only. Shell owns time/pause/input; domain owns race progress. */
export class RacingWorld {
    public readonly root = new Node('Racing category');
    public readonly race: RaceSession;
    public readonly cars: RacingVehicle[];
    private readonly cameras: Camera[] = [];
    private accumulator = 0;
    private readonly resetCooldown = [0, 0];
    private readonly pendingReset = [false, false];
    public constructor(parent: Node, slots: readonly PlayerInputSlot[], selection: RacingSelection) {
        if (PhysicsSystem.PHYSICS_NONE || PhysicsSystem.PHYSICS_BUILTIN) throw Error('Racing requires Cocos Bullet/Cannon/PhysX dynamics');
        const content = resolveRace(selection); this.race = new RaceSession(content.track);
        this.root.active = false; this.root.parent = parent;
        this.cars = [];
        try {
            this.buildTrack(content.track);
            slots.forEach((slot, i) => {
                const car = new RacingVehicle(this.root, slot, content.cars[i]); this.cars.push(car);
                const cameraNode = new Node('Racing camera P' + slot.playerId); cameraNode.parent = this.root;
                const camera = cameraNode.addComponent(Camera); camera.projection = Camera.ProjectionType.PERSPECTIVE;
                camera.fov = 65; camera.near = 0.15; camera.far = 350;
                camera.visibility = Layers.Enum.DEFAULT; camera.priority = i;
                camera.rect = new Rect(i * 0.5, 0, 0.5, 1);
                camera.clearFlags = Camera.ClearFlag.SOLID_COLOR; camera.clearColor = new Color(150, 206, 230);
                this.cameras.push(camera);
            });
        } catch (error) { this.root.destroy(); throw error; }
    }
    public activate(): void {
        this.root.active = true;
        this.cars.forEach((car, i) => { const pose = this.race.resetPose(i); car.reset(pose.position, pose.yaw); });
        PhysicsSystem.instance.syncSceneToPhysics(); this.updateCameras(1, 0);
    }
    private buildTrack(track: TrackDefinition): void {
        greybox(this.root, 'Landscape', [0, -1, 0], [160, 0.3, 160], new Color(99, 155, 94));
        const box = (name: string, position: readonly [number, number, number], size: readonly [number, number, number], color: Color, yaw: number, pitch: number, group: number) => {
            const node = new Node(name); node.parent = this.root; node.setPosition(...position); node.setRotationFromEuler(pitch, yaw, 0);
            const body = node.addComponent(RigidBody); body.type = ERigidBodyType.STATIC; body.group = group;
            const collider = node.addComponent(BoxCollider); collider.size = new Vec3(...size);
            greybox(node, 'Mesh', [0, 0, 0], size, color);
        };
        track.points.forEach((a, i) => {
            const b = track.points[(i + 1) % track.points.length], dx = b.x - a.x, dz = b.z - a.z;
            const flat = Math.hypot(dx, dz), length = Math.hypot(flat, b.y - a.y);
            const yaw = Math.atan2(-dx, -dz) * 180 / Math.PI, pitch = Math.atan2(b.y - a.y, flat) * 180 / Math.PI;
            const x = (a.x + b.x) / 2, y = (a.y + b.y) / 2, z = (a.z + b.z) / 2;
            box('Road ' + i, [x, y - 0.25, z], [track.width, 0.5, length + 3], new Color(82, 91, 110), yaw, pitch, 2);
            for (const sign of [-1, 1]) box('Guard rail', [x - dz / flat * (track.width / 2 + 0.5) * sign, y + 0.7, z + dx / flat * (track.width / 2 + 0.5) * sign],
                [0.6, 1.4, length], new Color(230, 205, 130), yaw, pitch, 4);
            // Road markings use exactly the same oriented gate geometry as the race rules.
            const incoming = track.points[(i + track.points.length - 1) % track.points.length];
            const gateYaw = Math.atan2(-(a.x - incoming.x), -(a.z - incoming.z)) * 180 / Math.PI;
            const marker = greybox(this.root, 'Checkpoint ' + i, [a.x, a.y + 0.04, a.z], [track.width, 0.04, i === 0 ? 1.2 : 0.25],
                i === 0 ? new Color(255, 250, 245) : new Color(230, 185, 65)); marker.node.setRotationFromEuler(0, gateYaw, 0);
        });
    }
    public tick(dt: number, smoothCamera: number): void {
        if (dt <= 0) return;
        this.cars.forEach((car, i) => { this.pendingReset[i] ||= car.slot.isInteractPressed(); });
        this.accumulator = Math.min(this.accumulator + dt, 0.2);
        const step = 1 / 120;
        while (this.accumulator >= step) {
            this.accumulator -= step;
            const running = this.race.tick(step);
            const before = this.cars.map(car => ({ x: car.node.worldPosition.x, y: car.node.worldPosition.y, z: car.node.worldPosition.z }));
            this.cars.forEach((car, i) => {
                this.resetCooldown[i] = Math.max(0, this.resetCooldown[i] - step);
                const p = car.node.worldPosition;
                const reset = this.pendingReset[i] || p.y < -5 || Math.abs(p.x) > 90 || Math.abs(p.z) > 90;
                if (reset && this.resetCooldown[i] === 0) {
                    // Try certified points on this segment; never cross the next required gate.
                    const pose = [4, 9, 14].map(along => this.race.resetPose(i, along)).find(candidate =>
                        this.cars.every((other, j) => i === j || Vec3.distance(other.node.worldPosition,
                            new Vec3(candidate.position.x, candidate.position.y, candidate.position.z)) > 4.5));
                    if (pose) {
                        car.reset(pose.position, pose.yaw); before[i] = { ...pose.position }; this.resetCooldown[i] = 2; this.pendingReset[i] = false;
                    }
                }
            });
            PhysicsSystem.instance.syncSceneToPhysics();
            this.cars.forEach((car, i) => car.step(step, running && this.race.racers[i].finishedAt === null));
            PhysicsSystem.instance.step(step); PhysicsSystem.instance.emitEvents();
            PhysicsSystem.instance.syncSceneToPhysics();
            this.cars.forEach((car, i) => this.race.advance(i, before[i], car.node.worldPosition));
        }
        this.updateCameras(dt, smoothCamera);
    }
    private updateCameras(dt: number, smooth: number): void {
        this.cars.forEach((car, i) => {
            const forward = Vec3.transformQuat(new Vec3(), new Vec3(0, 0, -1), car.node.worldRotation);
            forward.y = 0; if (forward.lengthSqr() < 0.01) forward.set(0, 0, -1); forward.normalize();
            const target = car.node.worldPosition.clone(); target.y += 1;
            const desired = Vec3.subtract(new Vec3(), target, Vec3.multiplyScalar(new Vec3(), forward, 9 + Math.min(4, Math.abs(car.speed) * 0.08))); desired.y += 5;
            const camera = this.cameras[i]; camera.node.setWorldPosition(Vec3.lerp(new Vec3(), camera.node.worldPosition, desired, smooth ? 1 - Math.exp(-smooth * dt) : 1));
            camera.node.lookAt(target);
        });
    }
    public dispose(): void { this.root.active = false; this.root.destroy(); }
}
