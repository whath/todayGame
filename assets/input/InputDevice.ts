import { DeviceKind, EMPTY_INPUT, EMPTY_RAW, InputFrame, normalizeMove, RawInput } from '../core/InputTypes';

/** Samples once per frame; all consumers see the same non-destructive edges. */
export abstract class InputDevice {
    public frame: InputFrame = EMPTY_INPUT;
    private previous: RawInput = EMPTY_RAW;

    protected constructor(
        public readonly id: string,
        public readonly label: string,
        public readonly kind: DeviceKind,
    ) {}

    public abstract get connected(): boolean;
    protected abstract read(): RawInput;

    public sample(): void {
        if (!this.connected) { this.clear(); return; }
        const raw = this.read();
        this.frame = {
            move: normalizeMove(raw.x, raw.y),
            primaryPressed: raw.primary && !this.previous.primary,
            secondaryPressed: raw.secondary && !this.previous.secondary,
            interactPressed: raw.interact && !this.previous.interact,
            joinPressed: Boolean(raw.joinPulse) || (raw.join && !this.previous.join),
        };
        this.previous = raw;
    }

    public clear(): void {
        this.previous = EMPTY_RAW;
        this.frame = EMPTY_INPUT;
    }
}
