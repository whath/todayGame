import { SettingsSnapshot } from '../settings/SettingDefinition';
import { LocalizationService } from '../services/LocalizationService';
export type GlyphAction = 'primary' | 'secondary' | 'interact' | 'confirm' | 'back' | 'settings' | 'nextTab';
export class InputGlyphService {
    public activeDevice: 'keyboard' | 'gamepad' = 'keyboard';
    public constructor(private readonly locale: LocalizationService, private readonly settings: () => SettingsSnapshot) {}
    public get(action: GlyphAction, player: 1 | 2 = 1, device = this.activeDevice): string {
        if (device === 'gamepad') return this.locale.t(`glyph.${action}`);
        const fixed = { confirm: 'Enter', back: 'Esc', settings: 'F2', nextTab: 'Tab' };
        if (action in fixed) return `[${fixed[action as keyof typeof fixed]}]`;
        return `[${this.locale.keyName(this.settings()[`controls.p${player}.${action}`] as string | null)}]`;
    }
}
