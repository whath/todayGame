import { DomainEvent } from '../runtime/DomainEvent';
export type Owner = 'None' | 'Player1' | 'Player2' | 'Team' | 'World';
export type Relation = 'Self' | 'Partner' | 'Team' | 'Neutral' | 'Hostile';
export type ActionSemantic = 'Move' | 'PrimaryAction' | 'SecondaryAction' | 'Interact' | 'SpecialAction';
export class Actor {
    public state = 'idle';
    public readonly tags = new Set<string>();
    public owner: Owner = 'None';
    public readonly actions = new ActionRunner();
    public constructor(public readonly id: string, public readonly controller: string, public readonly team: string | null = null) { if (!id) throw Error('Actor ID required'); }
    public relationTo(other: Actor): Relation {
        if (other.id === this.id) return 'Self';
        if (this.team && this.team === other.team) return this.tags.has('actor.player') && other.tags.has('actor.player') ? 'Partner' : 'Team';
        return this.tags.has(`hostile.${other.team}`) ? 'Hostile' : 'Neutral';
    }
}
export interface ActionContract {
    canStart(): boolean; start(): void; update(dt: number): boolean; complete(): void; cancel(reason: string): void;
}
export class ActionRunner {
    public status: 'Idle' | 'Running' | 'Complete' | 'Cancelled' = 'Idle';
    public semantic: ActionSemantic | null = null;
    public readonly changed = new DomainEvent<{ semantic: ActionSemantic; status: string }>();
    private active: ActionContract | null = null;
    public start(semantic: ActionSemantic, action: ActionContract): boolean {
        if (this.active || !action.canStart()) return false;
        this.active = action; this.semantic = semantic; this.status = 'Running';
        try { action.start(); } catch (error) { this.cancel('start-failed'); throw error; }
        this.changed.publish({ semantic, status: this.status }); return true;
    }
    public tick(dt: number): void {
        if (!this.active) return;
        if (!Number.isFinite(dt) || dt < 0) throw Error('Invalid action delta');
        try {
            if (this.active.update(dt)) {
                const done = this.active; done.complete(); this.active = null; this.status = 'Complete';
                this.changed.publish({ semantic: this.semantic!, status: this.status });
            }
        } catch (error) { this.cancel('update-failed'); throw error; }
    }
    public cancel(reason: string): void {
        const active = this.active; if (!active) return; this.active = null; this.status = 'Cancelled';
        try { active.cancel(reason); } finally { this.changed.publish({ semantic: this.semantic!, status: this.status }); }
    }
}
export class TriggerRule<T> {
    private fired = false;
    public constructor(private readonly trigger: (context: T) => boolean, private readonly condition: (context: T) => boolean,
        private readonly action: (context: T) => void, private readonly once = true) {}
    public evaluate(context: T): boolean {
        if ((this.once && this.fired) || !this.trigger(context) || !this.condition(context)) return false;
        this.action(context); this.fired = true; return true;
    }
    public reset(): void { this.fired = false; }
}
