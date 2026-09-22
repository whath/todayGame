import { game, ResolutionPolicy, view } from 'cc';
import { PlatformCapabilityService } from '../services/PlatformCapabilityService';

export class CocosPlatform {
    public readonly capabilities = new PlatformCapabilityService({
        frameLimit: true, keyboard: true, gamepad: true, audio: true, uiScale: true,
        fullscreen: false, resolutionSwitch: false, vsync: false, gamma: false,
        vibration: false, screenShake: false, subtitles: false,
    });
    public initializeView(): void { view.setDesignResolutionSize(1280, 720, ResolutionPolicy.SHOW_ALL); }
    public setFrameLimit(value: string): void { game.frameRate = value === '30' ? 30 : 60; }
}
