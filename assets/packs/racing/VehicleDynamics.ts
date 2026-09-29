import { VehicleDefinition } from './RacingContent';
export interface DrivingInput { readonly steering: number; readonly throttle: number; readonly brake: number }
const clamp = (n: number, low: number, high: number) => Math.max(low, Math.min(high, Number.isFinite(n) ? n : 0));
/** Stateful controls, not physics. Brake-to-reverse requires a sustained stop. */
export class DriveControl {
    public steering = 0;
    private reverseHold = 0;
    public reset(): void { this.steering = 0; this.reverseHold = 0; }
    public update(input: DrivingInput, speed: number, dt: number): { steerAngle: number; drive: number; brake: number } {
        const throttle = clamp(input.throttle, 0, 1), brake = clamp(input.brake, 0, 1);
        const time = clamp(dt, 0, 0.1);
        const target = clamp(input.steering, -1, 1);
        this.steering += clamp(target - this.steering, -2.5 * time, 2.5 * time);
        this.reverseHold = brake > 0.1 && throttle < 0.1 && speed < 0.6 ? this.reverseHold + time : 0;
        const reversing = this.reverseHold > 0.7;
        return { steerAngle: this.steering * (0.5 / (1 + Math.abs(speed) / 18)),
            drive: reversing ? -brake * 0.45 : speed < -0.6 && throttle > 0 ? 0 : throttle,
            brake: reversing ? 0 : brake > 0 ? brake : speed < -0.6 ? throttle : 0 };
    }
}
/** Per-wheel friction circle: acceleration and cornering share finite available grip. */
export function tireForces(car: VehicleDefinition, load: number, longitudinalSpeed: number, lateralSpeed: number,
    drive: number, brake: number, dt: number): { longitudinal: number; lateral: number } {
    const safeDt = Math.max(1 / 240, dt);
    const propulsion = Math.abs(longitudinalSpeed) >= (drive < 0 ? car.maxSpeed * 0.25 : car.maxSpeed) && drive * longitudinalSpeed > 0 ? 0 : drive * car.engineForce / 4;
    const braking = Math.sign(longitudinalSpeed) * Math.min(brake * car.brakeForce / 4, Math.abs(longitudinalSpeed) * car.mass / (4 * safeDt));
    let longitudinal = propulsion - braking - longitudinalSpeed * 18;
    let lateral = -lateralSpeed * car.mass / (4 * Math.max(0.16, safeDt));
    const limit = Math.max(0, load) * car.grip, magnitude = Math.hypot(longitudinal, lateral);
    if (magnitude > limit && magnitude > 0) { longitudinal *= limit / magnitude; lateral *= limit / magnitude; }
    return { longitudinal, lateral };
}
export function suspensionLoad(car: VehicleDefinition, compression: number, normalVelocity: number): number {
    return Math.max(0, Math.min(car.mass * 9.81, compression * car.spring - normalVelocity * car.damper));
}
