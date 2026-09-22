import { EMPTY_INPUT, InputFrame, MoveVector, PlayerId } from '../core/InputTypes';
import { InputDevice } from './InputDevice';

export class PlayerInputSlot {
    public constructor(public readonly playerId: PlayerId) {}
    private device: InputDevice | null = null;
    public get deviceId(): string | null { return this.device?.id ?? null; }
    public get deviceLabel(): string { return this.device?.label ?? 'Press a mapped key / controller button'; }
    public get connected(): boolean { return this.device?.connected ?? false; }
    public get assigned(): boolean { return this.device !== null; }
    public get frame(): InputFrame { return this.connected ? this.device!.frame : EMPTY_INPUT; }
    public getMoveVector(): MoveVector { return this.frame.move; }
    public isPrimaryPressed(): boolean { return this.frame.primaryPressed; }
    public isSecondaryPressed(): boolean { return this.frame.secondaryPressed; }
    public isInteractPressed(): boolean { return this.frame.interactPressed; }

    /** Ownership is coordinated exclusively by InputManager. */
    public bind(device: InputDevice): void { this.device = device; }
    public release(): void { this.device = null; }
}
