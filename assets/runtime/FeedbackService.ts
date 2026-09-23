import { DomainEvent } from './DomainEvent';
export type FeedbackKind = 'uiConfirm' | 'uiCancel';
export interface FeedbackRequest { readonly kind: FeedbackKind; readonly playerId?: 1 | 2 }
export interface FeedbackHooks {
    ui(kind: FeedbackKind): void;
    camera?(intensity: number): void;
    rumble?(playerId: 1 | 2, intensity: number): void;
}
export class FeedbackService {
    public readonly played = new DomainEvent<FeedbackRequest>();
    public constructor(private readonly hooks: FeedbackHooks, private readonly modifiers: () => { shake: number; vibration: boolean }) {}
    public request(event: FeedbackRequest): void {
        const modifiers = this.modifiers();
        this.hooks.ui(event.kind);
        if (modifiers.shake > 0) this.hooks.camera?.(modifiers.shake);
        if (event.playerId && modifiers.vibration) this.hooks.rumble?.(event.playerId, 0.15);
        this.played.publish(event);
    }
    public dispose(): void { this.played.clear(); }
}
