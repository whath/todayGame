import { DEBUG } from 'cc/env';
import { CocosPlatform } from '../platform/CocosPlatform';
import { CocosSettingsPersistence } from '../platform/CocosSettingsPersistence';
import { AccessibilityService } from '../services/AccessibilityService';
import { AudioService } from '../services/AudioService';
import { DiagnosticsService } from '../services/DiagnosticsService';
import { LocalizationService } from '../services/LocalizationService';
import { PauseService } from '../services/PauseService';
import { createSettingsRegistry } from '../settings/DefaultSettings';
import { SettingsService } from '../settings/SettingsService';

/** Explicit scene lifetime: no global locator and no speculative save-game backend. */
export class GameServices {
    public readonly platform = new CocosPlatform();
    public readonly audio = new AudioService();
    public readonly pause = new PauseService();
    public readonly localization = new LocalizationService();
    public readonly accessibility = new AccessibilityService();
    public readonly diagnostics = new DiagnosticsService(DEBUG);
    public readonly settings = new SettingsService(createSettingsRegistry(), this.platform.capabilities,
        new CocosSettingsPersistence(), { apply: values => {
            this.platform.setFrameLimit(String(values['display.frameLimit']));
            this.audio.configure(values);
            this.pause.configure(values['gameplay.pauseWhenUnfocused'] === true);
            this.accessibility.configure(values);
            this.localization.setLocale(String(values['language.locale']));
        } });
    public boot(): void { this.platform.initializeView(); this.settings.boot(); }
    public setFocused(focused: boolean): void { this.pause.setFocused(focused); this.audio.setFocused(focused); }
    public dispose(): void { this.settings.dispose(); this.audio.dispose(); }
}
