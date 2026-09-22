import { EventKeyboard, game, Game, input, Input, KeyCode } from 'cc';
import { RawInput } from '../core/InputTypes';
import { KeyboardInputDevice } from '../input/KeyboardInputDevice';

interface KeyboardMap {
    up: KeyCode; down: KeyCode; left: KeyCode; right: KeyCode;
    primary: KeyCode; secondary: KeyCode; interact: KeyCode;
}

const MAP_A: KeyboardMap = {
    up: KeyCode.KEY_W, down: KeyCode.KEY_S, left: KeyCode.KEY_A, right: KeyCode.KEY_D,
    primary: KeyCode.KEY_F, secondary: KeyCode.KEY_G, interact: KeyCode.KEY_E,
};
const MAP_B: KeyboardMap = {
    up: KeyCode.ARROW_UP, down: KeyCode.ARROW_DOWN, left: KeyCode.ARROW_LEFT, right: KeyCode.ARROW_RIGHT,
    primary: KeyCode.KEY_J, secondary: KeyCode.KEY_K, interact: KeyCode.KEY_L,
};

/** All physical keyboard codes stay in this platform adapter. */
export class KeyboardAdapter {
    private readonly held = new Set<KeyCode>();
    private readonly pressed = new Set<KeyCode>();
    public readonly devices = [
        new KeyboardInputDevice('keyboard:a', 'Keyboard A [WASD]', () => this.read(MAP_A)),
        new KeyboardInputDevice('keyboard:b', 'Keyboard B [Arrows]', () => this.read(MAP_B)),
    ];

    public start(): void {
        input.on(Input.EventType.KEY_DOWN, this.onDown, this);
        input.on(Input.EventType.KEY_UP, this.onUp, this);
        game.on(Game.EVENT_HIDE, this.clear, this);
        if (typeof window !== 'undefined') window.addEventListener('blur', this.onBlur);
    }
    public stop(): void {
        input.off(Input.EventType.KEY_DOWN, this.onDown, this);
        input.off(Input.EventType.KEY_UP, this.onUp, this);
        game.off(Game.EVENT_HIDE, this.clear, this);
        if (typeof window !== 'undefined') window.removeEventListener('blur', this.onBlur);
        this.clear();
    }
    public get resetPressed(): boolean { return this.pressed.has(KeyCode.KEY_R); }
    public get lobbyPressed(): boolean { return this.pressed.has(KeyCode.ESCAPE); }
    public endFrame(): void { this.pressed.clear(); }
    public clear(): void { this.held.clear(); this.pressed.clear(); }
    private readonly onBlur = (): void => { this.clear(); };
    private onDown(event: EventKeyboard): void {
        if (!this.held.has(event.keyCode)) this.pressed.add(event.keyCode);
        this.held.add(event.keyCode);
    }
    private onUp(event: EventKeyboard): void { this.held.delete(event.keyCode); }
    private read(map: KeyboardMap): RawInput {
        const active = (key: KeyCode): boolean => this.held.has(key);
        const keys = [map.up, map.down, map.left, map.right, map.primary, map.secondary, map.interact];
        return {
            x: Number(active(map.right)) - Number(active(map.left)),
            y: Number(active(map.up)) - Number(active(map.down)),
            primary: active(map.primary), secondary: active(map.secondary), interact: active(map.interact),
            join: keys.some(active), joinPulse: keys.some(key => this.pressed.has(key)),
        };
    }
}
