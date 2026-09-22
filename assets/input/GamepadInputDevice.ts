import { RawInput } from '../core/InputTypes';
import { InputDevice } from './InputDevice';

/** Every physical connection gets a new id; reconnect requires explicit joining. */
export class GamepadInputDevice extends InputDevice {
    public constructor(
        id: string,
        label: string,
        private readonly reader: () => RawInput,
        private readonly isConnected: () => boolean,
    ) { super(id, label, 'gamepad'); }
    public get connected(): boolean { return this.isConnected(); }
    protected read(): RawInput { return this.reader(); }
}
