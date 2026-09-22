import { AudioClip, AudioSource, Node } from 'cc';
import { AudioBus, AudioService, AudioVoice } from '../services/AudioService';

/** All sources use mixer-owned volume, including effects (no unmanaged playOneShot). */
export class CocosAudioAdapter {
    private readonly stops = new Set<() => void>();
    public constructor(private readonly parent: Node, private readonly mixer: AudioService) {}
    public play(clip: AudioClip, bus: AudioBus, loop = false): () => void {
        const node = new Node(`Audio ${bus}`);
        node.parent = this.parent;
        const source = node.addComponent(AudioSource);
        source.playOnAwake = false;
        source.clip = clip;
        source.loop = loop;
        let stopped = false;
        let unregister = (): void => {};
        const stop = (): void => {
            if (stopped) return;
            stopped = true;
            node.off(AudioSource.EventType.ENDED, stop);
            source.stop();
            unregister();
            this.stops.delete(stop);
            node.destroy();
        };
        const voice: AudioVoice = { setVolume: value => { source.volume = value; }, stop };
        unregister = this.mixer.register(bus, voice);
        this.stops.add(stop);
        node.on(AudioSource.EventType.ENDED, stop);
        source.play();
        return stop;
    }
    public dispose(): void { [...this.stops].forEach(stop => stop()); }
}
