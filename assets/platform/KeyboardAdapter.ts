import { EventKeyboard, input, Input, KeyCode } from 'cc';
import { EMPTY_RAW, RawInput } from '../core/InputTypes';
import { MenuInput } from '../core/MenuInput';
import { KeyboardInputDevice } from '../input/KeyboardInputDevice';
import { BINDABLE_KEYS, CONTROL_ACTIONS, ControlAction } from '../settings/DefaultSettings';
import { SettingsSnapshot } from '../settings/SettingDefinition';

/** Persist portable names; only this adapter knows engine-specific physical key codes. */
export class KeyboardAdapter {
    private readonly held = new Set<KeyCode>();
    private readonly pressed = new Set<KeyCode>();
    private readonly keyCodes = new Map<string, KeyCode>();
    private readonly mappingSignatures = new Map<string, string>();
    private readonly waitForRelease = new Set<string>();
    public readonly devices: readonly KeyboardInputDevice[];
    private peakKeys = 0;
    public get diagnosticKeys(): { held: readonly string[]; peak: number } {
        this.peakKeys = Math.max(this.peakKeys, this.held.size);
        return { held: [...this.held].map(code => [...this.keyCodes].find(([, value]) => value === code)?.[0] ?? String(code)), peak: this.peakKeys };
    }

    public constructor(private readonly settings: () => SettingsSnapshot,
        private readonly owner: (id: string) => 1 | 2 | undefined) {
        for (const key of BINDABLE_KEYS) {
            const enumName = key.startsWith('Key') ? `KEY_${key.slice(3)}` : key.startsWith('Digit') ? `DIGIT_${key.slice(5)}`
                : key.startsWith('Arrow') ? `ARROW_${key.slice(5).toUpperCase()}` : 'SPACE';
            this.keyCodes.set(key, KeyCode[enumName as keyof typeof KeyCode] as KeyCode);
        }
        this.devices = [
            new KeyboardInputDevice('keyboard:a', 'keyboard:a', () => this.read('keyboard:a', 1)),
            new KeyboardInputDevice('keyboard:b', 'keyboard:b', () => this.read('keyboard:b', 2)),
        ];
    }
    public start(): void {
        input.on(Input.EventType.KEY_DOWN, this.onDown, this);
        input.on(Input.EventType.KEY_UP, this.onUp, this);
    }
    public stop(): void {
        input.off(Input.EventType.KEY_DOWN, this.onDown, this);
        input.off(Input.EventType.KEY_UP, this.onUp, this);
        this.clear();
    }
    public menuInput(): MenuInput {
        const has = (key: KeyCode): boolean => this.pressed.has(key);
        let bindingKey: string | null | undefined;
        if (has(KeyCode.BACKSPACE)) bindingKey = null;
        else for (const [name, code] of this.keyCodes) if (has(code)) { bindingKey = name; break; }
        return {
            up: has(KeyCode.ARROW_UP), down: has(KeyCode.ARROW_DOWN), left: has(KeyCode.ARROW_LEFT), right: has(KeyCode.ARROW_RIGHT),
            accept: has(KeyCode.ENTER), back: has(KeyCode.ESCAPE), tab: has(KeyCode.TAB) && !this.held.has(KeyCode.SHIFT_LEFT),
            previousTab: has(KeyCode.TAB) && this.held.has(KeyCode.SHIFT_LEFT),
            settings: has(KeyCode.F2), pause: has(KeyCode.ESCAPE), reset: has(KeyCode.F5), diagnostics: has(KeyCode.F1), bindingKey,
        };
    }
    public endFrame(): void { this.pressed.clear(); }
    public clear(): void { this.held.clear(); this.pressed.clear(); }
    private onDown(event: EventKeyboard): void {
        if (!this.held.has(event.keyCode)) this.pressed.add(event.keyCode);
        this.held.add(event.keyCode);
    }
    private onUp(event: EventKeyboard): void { this.held.delete(event.keyCode); }
    private read(id: string, fallback: 1 | 2): RawInput {
        const other = this.owner(id === 'keyboard:a' ? 'keyboard:b' : 'keyboard:a');
        const profile = this.owner(id) ?? (other ? (other === 1 ? 2 : 1) : fallback);
        const values = this.settings();
        const signature = JSON.stringify([profile, ...CONTROL_ACTIONS.map(action => values[`controls.p${profile}.${action}`])]);
        const previous = this.mappingSignatures.get(id);
        this.mappingSignatures.set(id, signature);
        if (previous !== undefined && previous !== signature && this.held.size > 0) this.waitForRelease.add(id);
        if (this.waitForRelease.has(id)) {
            if (this.held.size > 0) return EMPTY_RAW;
            this.waitForRelease.delete(id);
        }
        const key = (action: ControlAction): KeyCode | undefined => {
            const value = values[`controls.p${profile}.${action}`];
            return typeof value === 'string' ? this.keyCodes.get(value) : undefined;
        };
        const active = (action: ControlAction): boolean => { const code = key(action); return code !== undefined && this.held.has(code); };
        return {
            x: Number(active('right')) - Number(active('left')), y: Number(active('up')) - Number(active('down')),
            primary: active('primary'), secondary: active('secondary'), interact: active('interact'),
            join: CONTROL_ACTIONS.some(active), joinPulse: CONTROL_ACTIONS.some(action => { const code = key(action); return code !== undefined && this.pressed.has(code); }),
        };
    }
}
