import { EventGamepad, input, Input } from 'cc';
import { applyStickDeadzone, EMPTY_RAW, RawInput } from '../core/InputTypes';
import { GamepadInputDevice } from '../input/GamepadInputDevice';
import { MenuInput } from '../core/MenuInput';

type CocosPad = EventGamepad['gamepad'];
interface Connection { source: CocosPad; live: boolean; id: string }

/** Uses Cocos' Web / Windows native abstraction, never navigator in gameplay. */
export class CocosGamepadAdapter {
    private readonly connections = new Map<number, Connection>();
    private generation = 0;
    private previousMenu: MenuInput = {};
    public constructor(private readonly register: (device: GamepadInputDevice) => void,
        private readonly deadzone: (deviceId: string) => number = () => 0.2) {}

    public start(): void {
        input.on(Input.EventType.GAMEPAD_CHANGE, this.onPad, this);
        input.on(Input.EventType.GAMEPAD_INPUT, this.onPad, this);
    }
    public stop(): void {
        input.off(Input.EventType.GAMEPAD_CHANGE, this.onPad, this);
        input.off(Input.EventType.GAMEPAD_INPUT, this.onPad, this);
        this.connections.forEach(connection => { connection.live = false; });
        this.connections.clear();
        this.previousMenu = {};
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
        const connection: Connection = { source: pad, live: true, id: `gamepad:${pad.deviceId}:${++this.generation}` };
        this.connections.set(pad.deviceId, connection);
        this.register(new GamepadInputDevice(
            connection.id,
            `Gamepad ${pad.deviceId + 1}`,
            () => this.read(connection),
            () => connection.live && connection.source.connected,
        ));
    }
    public menuInput(): MenuInput {
        const held: MenuInput = {};
        this.connections.forEach(({ source: pad, live }) => {
            if (!live || !pad.connected) return;
            const dpad = pad.dpad.getValue();
            const stick = pad.leftStick.getValue();
            held.up ||= dpad.y > 0.5 || stick.y > 0.5;
            held.down ||= dpad.y < -0.5 || stick.y < -0.5;
            held.left ||= dpad.x < -0.5 || stick.x < -0.5;
            held.right ||= dpad.x > 0.5 || stick.x > 0.5;
            held.accept ||= pad.buttonSouth.getValue() > 0.5;
            held.back ||= pad.buttonEast.getValue() > 0.5;
            held.tab ||= pad.buttonR1.getValue() > 0.5;
            held.previousTab ||= pad.buttonL1.getValue() > 0.5;
            held.settings ||= pad.buttonOptions.getValue() > 0.5 || pad.buttonStart.getValue() > 0.5;
        });
        const edge: MenuInput = {};
        for (const key of ['up', 'down', 'left', 'right', 'accept', 'back', 'tab', 'previousTab', 'settings'] as const) edge[key] = held[key] && !this.previousMenu[key];
        edge.pause = edge.settings;
        this.previousMenu = held;
        return edge;
    }
    private read(connection: Connection): RawInput {
        if (!connection.live || !connection.source.connected) return EMPTY_RAW;
        const pad = connection.source;
        const stick = pad.leftStick.getValue();
        const dpad = pad.dpad.getValue();
        const move = applyStickDeadzone(stick.x, stick.y, this.deadzone(connection.id));
        const useDpad = Math.hypot(dpad.x, dpad.y) > 0.1;
        const primary = pad.buttonSouth.getValue() > 0.5;
        const secondary = pad.buttonEast.getValue() > 0.5;
        const interact = pad.buttonWest.getValue() > 0.5;
        const join = [pad.buttonNorth, pad.buttonSouth, pad.buttonEast, pad.buttonWest,
            pad.buttonL1, pad.buttonR1, pad.buttonL2, pad.buttonR2, pad.buttonL3,
            pad.buttonR3, pad.buttonShare, pad.buttonOptions, pad.buttonStart]
            .some(button => button.getValue() > 0.5) || useDpad;
        return {
            x: useDpad ? dpad.x : move.x,
            y: useDpad ? dpad.y : move.y,
            primary, secondary, interact, join,
        };
    }
}
