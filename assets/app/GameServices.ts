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
import { createPrototypeContent } from '../content/PrototypeContent';
import { GENERATED_BUILD_INFO } from '../runtime/GeneratedBuildInfo';
import { BuildInfo, buildPolicy } from '../runtime/BuildInfo';
import { TimeService } from '../runtime/TimeService';
import { RandomService } from '../runtime/RandomService';
import { FeatureFlagService } from '../runtime/FeatureFlagService';
import { GameLogger } from '../runtime/GameLogger';
import { UINavigationService } from '../runtime/UINavigationService';
import { InputGlyphService } from '../runtime/InputGlyphService';
import { SaveService } from '../save/SaveService';
import { SaveSerializer } from '../save/SaveSerializer';
import { CocosSaveStorage } from '../platform/CocosSaveStorage';

/** Explicit scene lifetime and independently namespaced persistence. */
export class GameServices {
    public readonly build: BuildInfo = { ...GENERATED_BUILD_INFO,
        variant: !DEBUG && GENERATED_BUILD_INFO.variant === 'development' ? 'release' : GENERATED_BUILD_INFO.variant };
    public readonly policy = buildPolicy(this.build.variant);
    public readonly logger = new GameLogger(this.build.variant, entry => {
        const message = `[${entry.category}] ${entry.message}`;
        if (entry.level === 'ERROR') console.error(message); else if (entry.level === 'WARN') console.warn(message); else console.log(message);
    });
    public readonly content = createPrototypeContent();
    public readonly time = new TimeService();
    public readonly random = new RandomService();
    public readonly flags = new FeatureFlagService(this.build.variant);
    public readonly navigation = new UINavigationService();
    public readonly saves = new SaveService(new CocosSaveStorage(), new SaveSerializer(this.content));
    public readonly labSaves = new SaveService(new CocosSaveStorage('duogame.labs.saves'), new SaveSerializer(this.content));
    public readonly platform = new CocosPlatform();
    public readonly audio = new AudioService();
    public readonly pause = new PauseService();
    public readonly localization = new LocalizationService();
    public readonly accessibility = new AccessibilityService();
    public readonly diagnostics = new DiagnosticsService(this.policy.developerTools);
    public readonly settings = new SettingsService(createSettingsRegistry(), this.platform.capabilities,
        new CocosSettingsPersistence(), { apply: values => {
            this.platform.setFrameLimit(String(values['display.frameLimit']));
            this.audio.configure(values);
            this.pause.configure(values['gameplay.pauseWhenUnfocused'] === true);
            this.accessibility.configure(values);
            this.localization.setLocale(String(values['language.locale']));
        } });
    public readonly glyphs = new InputGlyphService(this.localization, () => this.settings.runtime);
    public boot(hasAsset: (id: string) => boolean, lab = false): void {
        if (lab && !this.policy.labs) throw new Error('Test labs are disabled in this build');
        this.content.validate(hasAsset, id => this.localization.t(id) !== id);
        this.platform.initializeView(); this.settings.boot();
        this.logger.log('BOOT', 'INFO', `${this.build.version} / ${this.build.buildId} / ${this.build.commit} / ${this.build.variant}`);
    }
    public setFocused(focused: boolean): void { this.pause.setFocused(focused); this.audio.setFocused(focused); }
    public dispose(): void { this.settings.dispose(); this.audio.dispose(); this.saves.completed.clear(); this.labSaves.completed.clear(); this.navigation.clear(); }
}
