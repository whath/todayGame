import { SettingsSnapshot } from '../settings/SettingDefinition';

export class AccessibilityService {
    public uiScale = 1;
    public reduceFlashing = false;
    public cameraSmoothing = 6;
    private reduceShake = true;
    public configure(values: SettingsSnapshot): void {
        this.uiScale = Number(values['accessibility.uiScale']);
        this.reduceFlashing = values['accessibility.reduceFlashing'] === true;
        this.cameraSmoothing = Number(values['accessibility.cameraSmoothing']);
        this.reduceShake = values['accessibility.reduceScreenShake'] === true;
    }
    /** Reserved for future camera effects; no shake toggle is shown until an effect exists. */
    public effectiveShake(base: number, userMultiplier: number): number {
        return base * userMultiplier * (this.reduceShake ? 0 : 1);
    }
}
