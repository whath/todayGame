/** Engine-independent input contract. Positions and movement use +Y = up. */
export interface MoveVector { readonly x: number; readonly y: number }
export type PlayerId = 1 | 2;
export type DeviceKind = 'keyboard' | 'gamepad';

export interface InputFrame {
    readonly move: MoveVector;
    readonly primaryPressed: boolean;
    readonly secondaryPressed: boolean;
    readonly interactPressed: boolean;
    readonly joinPressed: boolean;
}

export const EMPTY_INPUT: InputFrame = Object.freeze({
    move: Object.freeze({ x: 0, y: 0 }),
    primaryPressed: false,
    secondaryPressed: false,
    interactPressed: false,
    joinPressed: false,
});

export interface RawInput {
    readonly x: number;
    readonly y: number;
    readonly primary: boolean;
    readonly secondary: boolean;
    readonly interact: boolean;
    readonly join: boolean;
    readonly joinPulse?: boolean;
}

export const EMPTY_RAW: RawInput = Object.freeze({
    x: 0, y: 0, primary: false, secondary: false, interact: false, join: false,
});

export function normalizeMove(x: number, y: number): MoveVector {
    const length = Math.hypot(x, y);
    const divisor = Math.max(1, length);
    return { x: x / divisor, y: y / divisor };
}
