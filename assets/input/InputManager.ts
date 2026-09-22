import { InputDevice } from './InputDevice';
import { PlayerInputSlot } from './PlayerInputSlot';

export class InputManager {
    public readonly slots: readonly PlayerInputSlot[] = [new PlayerInputSlot(1), new PlayerInputSlot(2)];
    private readonly devices = new Map<string, InputDevice>();
    public get bothReady(): boolean { return this.slots.every(slot => slot.connected); }
    public get connectedGamepads(): number {
        let count = 0;
        this.devices.forEach(device => { if (device.kind === 'gamepad' && device.connected) count++; });
        return count;
    }
    public register(device: InputDevice): void { this.devices.set(device.id, device); }

    public update(): void {
        this.devices.forEach((device, key) => {
            device.sample();
            if (!device.connected) {
                // The slot retains the disconnected object and its label until replacement.
                this.devices.delete(key);
                return;
            }
            if (!device.frame.joinPressed || this.slots.some(slot => slot.deviceId === device.id)) return;
            // Recover disconnected players before assigning a brand-new player.
            const slot = this.slots.find(item => item.assigned && !item.connected)
                ?? this.slots.find(item => !item.assigned);
            slot?.bind(device);
        });
    }

    public clearFrames(): void { this.devices.forEach(device => device.clear()); }
    public releaseAll(): void { this.slots.forEach(slot => slot.release()); }
    public dispose(): void { this.releaseAll(); this.devices.clear(); }
}
