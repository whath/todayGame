import { BoxCollider, Color, geometry, Node, PhysicsSystem, Quat, RigidBody, Vec3 } from 'cc';
import { PlayerInputSlot } from '../../input/PlayerInputSlot';
import { VehicleDefinition } from '../../packs/racing/RacingContent';
import { DriveControl, suspensionLoad, tireForces } from '../../packs/racing/VehicleDynamics';
import { greybox } from '../GreyboxGeometry';
const UP = new Vec3(0, 1, 0);
/** Both players use exactly this vehicle factory/controller; no camera or physical-button dependency. */
export class RacingVehicle {
    public readonly node: Node;
    public readonly body: RigidBody;
    private readonly controls = new DriveControl();
    private readonly wheels: { offset: Vec3; visual: Node; front: boolean }[] = [];
    private spin = 0;
    public speed = 0;
    public constructor(parent: Node, public readonly slot: PlayerInputSlot, public readonly definition: VehicleDefinition) {
        this.node = new Node('Racer P' + slot.playerId); this.node.parent = parent;
        this.body = this.node.addComponent(RigidBody); this.body.mass = definition.mass;
        this.body.group = 1; this.body.allowSleep = false; this.body.useCCD = true;
        this.body.linearDamping = 0.02; this.body.angularDamping = 0.3;
        const collider = this.node.addComponent(BoxCollider); collider.size = new Vec3(1.7, 0.6, 3.6);
        greybox(this.node, 'Chassis', [0, 0, 0], [1.7, 0.6, 3.6], slot.playerId === 1 ? new Color(55, 170, 235) : new Color(250, 170, 55));
        greybox(this.node, 'Cabin', [0, 0.5, 0.2], [1.35, definition.id === 'racing.car.sport' ? 0.4 : 0.65, 1.65], new Color(95, 190, 210));
        // Different roof stripes identify players without relying only on colour.
        for (let i = 0; i < slot.playerId; i++) greybox(this.node, 'Identity stripe', [-0.2 + i * 0.4, definition.id === 'racing.car.sport' ? 0.71 : 0.84, 0.2], [0.16, 0.02, 1.2], new Color(250, 250, 245));
        greybox(this.node, 'Front marker', [0, 0.1, -1.81], [1.3, 0.14, 0.03], new Color(255, 250, 195));
        for (const x of [-0.85, 0.85]) for (const z of [-definition.wheelbase / 2, definition.wheelbase / 2]) {
            const visual = greybox(this.node, 'Wheel', [x, -0.4, z], [0.32, 0.64, 0.64], new Color(32, 36, 45), 'sphere').node;
            this.wheels.push({ offset: new Vec3(x, 0, z), visual, front: z < 0 });
        }
    }
    public reset(position: { x: number; y: number; z: number }, yaw: number): void {
        this.node.setWorldPosition(position.x, position.y, position.z); this.node.setWorldRotation(Quat.fromEuler(new Quat(), 0, yaw, 0));
        this.body.clearState(); this.body.setLinearVelocity(Vec3.ZERO); this.body.setAngularVelocity(Vec3.ZERO);
        this.controls.reset(); this.speed = 0;
    }
    public step(dt: number, canDrive: boolean): void {
        const velocity = new Vec3(), angular = new Vec3(); this.body.getLinearVelocity(velocity); this.body.getAngularVelocity(angular);
        const rotation = this.node.worldRotation;
        const forward = Vec3.transformQuat(new Vec3(), new Vec3(0, 0, -1), rotation);
        const up = Vec3.transformQuat(new Vec3(), UP, rotation);
        this.speed = Vec3.dot(velocity, forward);
        const command = this.controls.update(canDrive ? this.slot.getDrivingInput() : { steering: 0, throttle: 0, brake: 1 }, this.speed, dt);
        this.spin += this.speed * dt / 0.32;
        for (const wheel of this.wheels) {
            const offset = Vec3.transformQuat(new Vec3(), wheel.offset, rotation);
            const origin = Vec3.add(new Vec3(), this.node.worldPosition, offset);
            const ray = new geometry.Ray(origin.x, origin.y, origin.z, -up.x, -up.y, -up.z);
            let length = 0.7;
            // Group 2 contains driveable road only, never another car or a guard rail.
            if (PhysicsSystem.instance.raycastClosest(ray, 2, 1.02, false)) {
                const hit = PhysicsSystem.instance.raycastClosestResult;
                length = Math.max(0, hit.distance - 0.32);
                const contactOffset = Vec3.subtract(new Vec3(), hit.hitPoint, this.node.worldPosition);
                const pointVelocity = Vec3.cross(new Vec3(), angular, contactOffset); pointVelocity.add(velocity);
                const normal = hit.hitNormal;
                const load = suspensionLoad(this.definition, 0.7 - length, Vec3.dot(pointVelocity, normal));
                const wheelRotation = Quat.multiply(new Quat(), rotation, Quat.fromEuler(new Quat(), 0, wheel.front ? -command.steerAngle * 180 / Math.PI : 0, 0));
                const tangent = Vec3.transformQuat(new Vec3(), new Vec3(0, 0, -1), wheelRotation);
                tangent.subtract(Vec3.multiplyScalar(new Vec3(), normal, Vec3.dot(tangent, normal))).normalize();
                const right = Vec3.cross(new Vec3(), tangent, normal).normalize();
                const force = tireForces(this.definition, load, Vec3.dot(pointVelocity, tangent), Vec3.dot(pointVelocity, right), command.drive, command.brake, dt);
                const total = Vec3.multiplyScalar(new Vec3(), normal, load);
                total.add(Vec3.multiplyScalar(new Vec3(), tangent, force.longitudinal));
                total.add(Vec3.multiplyScalar(new Vec3(), right, force.lateral));
                this.body.applyForce(total, contactOffset);
            }
            wheel.visual.setPosition(wheel.offset.x, -length, wheel.offset.z);
            wheel.visual.setRotationFromEuler(this.spin * 180 / Math.PI, wheel.front ? -command.steerAngle * 180 / Math.PI : 0, 0);
        }
        const magnitude = velocity.length();
        this.body.applyForce(Vec3.multiplyScalar(new Vec3(), velocity, -0.45 * magnitude));
    }
}
