import { DomainEvent } from './DomainEvent';
export type FeedbackKind = 'uiConfirm' | 'uiCancel' | 'interact' | 'success' | 'failure' | 'pickup';
export type FeedbackTarget = 'Player1' | 'Player2' | 'AllPlayers' | 'World';
export interface FeedbackRequest { readonly kind: FeedbackKind; readonly playerId?: 1 | 2; readonly target?: FeedbackTarget }
export interface FeedbackHooks {
    ui(kind: FeedbackKind): void;
    camera?(intensity: number): void;
    rumble?(playerId: 1 | 2, intensity: number): void;
    audio?(id: string, target: FeedbackTarget): void;
    vfx?(id: string, target: FeedbackTarget): void;
}
export class FeedbackService {
    public readonly played = new DomainEvent<FeedbackRequest>();
    public constructor(private readonly hooks: FeedbackHooks, private readonly modifiers: () => { shake: number; vibration: boolean }) {}
    public request(event: FeedbackRequest): void {
        const modifiers = this.modifiers();
        this.hooks.ui(event.kind);
        if (modifiers.shake > 0) this.hooks.camera?.(modifiers.shake);
        const target = event.target ?? (event.playerId === 1 ? 'Player1' : event.playerId === 2 ? 'Player2' : 'World');
        const players: (1 | 2)[] = target === 'AllPlayers' ? [1, 2] : target === 'Player1' ? [1] : target === 'Player2' ? [2] : [];
        if (modifiers.vibration) players.forEach(id => this.hooks.rumble?.(id, 0.15));
        const ids = { uiConfirm: 'ui.confirm', uiCancel: 'ui.cancel', interact: 'player.interact', success: 'interaction.success', failure: 'interaction.fail', pickup: 'pickup' };
        this.hooks.audio?.(ids[event.kind], target); this.hooks.vfx?.(ids[event.kind], target);
        this.played.publish(event);
    }
    public dispose(): void { this.played.clear(); }
}
