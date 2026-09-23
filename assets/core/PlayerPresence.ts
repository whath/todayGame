import { DomainEvent } from '../runtime/DomainEvent';
export type PresenceState = 'Empty' | 'Joining' | 'Ready' | 'Active' | 'Disconnected' | 'Downed' | 'Spectating' | 'Leaving';
export class PlayerPresence {
    public readonly changed = new DomainEvent<{ from: PresenceState; to: PresenceState }>();
    public state: PresenceState = 'Empty';
    private resume: PresenceState = 'Ready';
    public constructor(public readonly playerId: 1 | 2) {}
    public join(): void { if (this.state !== 'Empty' && this.state !== 'Disconnected') throw Error('Player already present'); this.set('Joining'); }
    public ready(): void { if (this.state !== 'Joining') throw Error('Join first'); this.set(this.resume); }
    public activate(): void { if (this.state === 'Ready') { this.resume = 'Active'; this.set('Active'); } }
    public disconnect(): void {
        if (['Empty', 'Leaving', 'Disconnected'].includes(this.state)) return;
        this.resume = this.state === 'Joining' ? 'Ready' : this.state; this.set('Disconnected');
    }
    public setGameplay(state: 'Active' | 'Downed' | 'Spectating'): void {
        if (!['Active', 'Downed', 'Spectating'].includes(this.state)) throw Error('Player is not active');
        this.resume = state; this.set(state);
    }
    public leave(): void { if (this.state === 'Empty') return; this.set('Leaving'); this.resume = 'Ready'; this.set('Empty'); }
    private set(to: PresenceState): void { const from = this.state; if (from === to) return; this.state = to; this.changed.publish({ from, to }); }
}
