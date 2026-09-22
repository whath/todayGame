import { EventGamepad, input, Input } from 'cc';
import { EMPTY_RAW, RawInput } from '../core/InputTypes';
import { GamepadInputDevice } from '../input/GamepadInputDevice';

type CocosPad = EventGamepad['gamepad'];
interface Connection { source: CocosPad; live: boolean }

/** Uses Cocos' Web / Windows native abstraction, never navigator in gameplay. */
export class CocosGamepadAdapter {
    private readonly connections = new Map<number, Connection>();
    private generation = 0;
    public constructor(private readonly register: (device: GamepadInputDevice) => void) {}

    public start(): void {
        input.on(Input.EventType.GAMEPAD_CHANGE, this.onPad, this);
        input.on(Input.EventType.GAMEPAD_INPUT, this.onPad, this);
    }
    public stop(): void {
        input.off(Input.EventType.GAMEPAD_CHANGE, this.onPad, this);
        input.off(Input.EventType.GAMEPAD_INPUT, this.onPad, this);
        this.connections.forEach(connection => { connection.live = false; });
        this.connections.clear();
    }
    private onPad(event: EventGamepad): void {
        const pad = event.gamepad;
        const previous = this.connections.get(pad.deviceId);
        if (!pad.connected) {
            if (previous) previous.live = false;
            this.connections.delete(pad.deviceId);
            return;
        }
        if (previous) { previous.source = pad; return; }
        const connection: Connection = { source: pad, live: true };
        this.connections.set(pad.deviceId, connection);
        this.register(new GamepadInputDevice(
            `gamepad:${pad.deviceId}:${++this.generation}`,
            `Gamepad ${pad.deviceId + 1}`,
            () => this.read(connection),
            () => connection.live && connection.source.connected,
        ));
    }
    private read(connection: Connection): RawInput {
        if (!connection.live || !connection.source.connected) return EMPTY_RAW;
        const pad = connection.source;
        const stick = pad.leftStick.getValue();
        const dpad = pad.dpad.getValue();
        const magnitude = Math.hypot(stick.x, stick.y);
        const deadzone = 0.2;
        const amount = magnitude > deadzone ? Math.min(1, (magnitude - deadzone) / (1 - deadzone)) : 0;
        const useDpad = Math.hypot(dpad.x, dpad.y) > 0.1;
        const primary = pad.buttonSouth.getValue() > 0.5;
        const secondary = pad.buttonEast.getValue() > 0.5;
        const interact = pad.buttonWest.getValue() > 0.5;
        const join = [pad.buttonNorth, pad.buttonSouth, pad.buttonEast, pad.buttonWest,
            pad.buttonL1, pad.buttonR1, pad.buttonL2, pad.buttonR2, pad.buttonL3,
            pad.buttonR3, pad.buttonShare, pad.buttonOptions, pad.buttonStart]
            .some(button => button.getValue() > 0.5) || useDpad;
        return {
            x: useDpad ? dpad.x : (magnitude > 0 ? stick.x / magnitude * amount : 0),
            y: useDpad ? dpad.y : (magnitude > 0 ? stick.y / magnitude * amount : 0),
            primary, secondary, interact, join,
        };
    }
}
