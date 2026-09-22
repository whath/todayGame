import { SettingsSnapshot } from '../settings/SettingDefinition';

export type AudioBus = 'music' | 'sfx' | 'ui';
export interface AudioVoice { setVolume(volume: number): void; stop(): void }

/** Mixer owns effective volume. Engine adapters own playback and clip lifetimes. */
export class AudioService {
    private master = 0.8;
    private buses: Record<AudioBus, number> = { music: 1, sfx: 1, ui: 1 };
    private muteWhenUnfocused = false;
    private focused = true;
    private readonly voices = new Map<AudioVoice, { bus: AudioBus; gain: number }>();

    public configure(settings: SettingsSnapshot): void {
        this.master = Number(settings['audio.masterVolume']) / 100;
        this.buses = { music: Number(settings['audio.musicVolume']) / 100, sfx: Number(settings['audio.sfxVolume']) / 100, ui: Number(settings['audio.uiVolume']) / 100 };
        this.muteWhenUnfocused = settings['audio.muteWhenUnfocused'] === true;
        this.refresh();
    }
    public setFocused(focused: boolean): void { this.focused = focused; this.refresh(); }
    public effectiveVolume(bus: AudioBus, gain = 1): number {
        return !this.focused && this.muteWhenUnfocused ? 0 : Math.max(0, Math.min(1, this.master * this.buses[bus] * gain));
    }
    public register(bus: AudioBus, voice: AudioVoice, gain = 1): () => void {
        this.voices.set(voice, { bus, gain });
        voice.setVolume(this.effectiveVolume(bus, gain));
        return () => { this.voices.delete(voice); };
    }
    public dispose(): void { this.voices.forEach((_, voice) => voice.stop()); this.voices.clear(); }
    private refresh(): void { this.voices.forEach((entry, voice) => voice.setVolume(this.effectiveVolume(entry.bus, entry.gain))); }
}
