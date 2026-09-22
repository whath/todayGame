import { RawInput } from '../core/InputTypes';
import { InputDevice } from './InputDevice';

export class KeyboardInputDevice extends InputDevice {
    public constructor(id: string, label: string, private readonly reader: () => RawInput) {
        super(id, label, 'keyboard');
    }
    public get connected(): boolean { return true; }
    protected read(): RawInput { return this.reader(); }
}
