import { Box, CollisionWorld } from './CollisionWorld';
import { MoveVector, PlayerId } from './InputTypes';
import { InteractionResult, InteractionService } from './InteractionService';
import { TriggerRule } from './GameplayKernel';
export interface CoopDefinition { readonly plate: Box; readonly gate: Box; readonly terminal: MoveVector; readonly interactRadius: number; readonly exit: Box }
export interface CoopSnapshot { gateLatched: boolean; completed: boolean }
export interface CoopActor extends MoveVector { readonly playerId: PlayerId; readonly interact: boolean }
export function inside(box: Box, p: MoveVector): boolean {
    return p.x >= box.x && p.x <= box.x + box.width && p.y >= box.y && p.y <= box.y + box.height;
}
export function overlaps(box: Box, p: MoveVector, half: number): boolean {
    return p.x + half > box.x && p.x - half < box.x + box.width && p.y + half > box.y && p.y - half < box.y + box.height;
}
/** Pure puzzle rules. The plate is momentary; the terminal permanently opens the gate. */
export class CoopChallenge {
    public gateOpen = false;
    public platePlayer: PlayerId | null = null;
    private state: CoopSnapshot;
    public readonly interactions = new InteractionService();
    public lastResults: readonly InteractionResult[] = [];
    private actors: readonly CoopActor[] = [];
    private readonly exitRule: TriggerRule<readonly CoopActor[]>;
    public constructor(public readonly definition: CoopDefinition, private readonly halfSize: number, snapshot?: CoopSnapshot) {
        this.state = snapshot ? { ...snapshot } : { gateLatched: false, completed: false };
        this.gateOpen = this.state.gateLatched;
        this.interactions.register({ id: 'relay.terminal', policy: 'Cooperative', participants: 1,
            canInteract: id => !this.state.gateLatched && this.actors.some(p => `player.${p.playerId}` === id && p.playerId !== this.platePlayer && this.nearTerminal(p)),
            cooperate: () => this.platePlayer !== null,
            execute: () => { this.state.gateLatched = true; this.interactions.ownership.claim('relay.gate', 'team.players', 'Team'); } });
        if (this.state.gateLatched) this.interactions.ownership.claim('relay.gate', 'team.players', 'Team');
        this.exitRule = new TriggerRule(players => players.every(p => inside(this.definition.exit, p)), () => this.state.gateLatched,
            () => { this.state.completed = true; });
    }
    public get completed(): boolean { return this.state.completed; }
    public get gateLatched(): boolean { return this.state.gateLatched; }
    public snapshot(): CoopSnapshot { return { ...this.state }; }
    public nearTerminal(p: MoveVector): boolean { return Math.hypot(p.x - this.definition.terminal.x, p.y - this.definition.terminal.y) <= this.definition.interactRadius; }
    public update(players: readonly CoopActor[], allowInteraction: boolean): void {
        if (players.length !== 2 || new Set(players.map(p => p.playerId)).size !== 2) throw new Error('Challenge needs two distinct players');
        this.platePlayer = players.find(p => inside(this.definition.plate, p))?.playerId ?? null;
        this.actors = players;
        this.lastResults = allowInteraction ? this.interactions.resolve(players.filter(p => p.interact).map(p => ({ actorId: `player.${p.playerId}`, targetId: 'relay.terminal' }))) : [];
        // Never close inside a player, including a save restored in the doorway.
        this.gateOpen = this.state.gateLatched || this.platePlayer !== null || players.some(p => overlaps(this.definition.gate, p, this.halfSize));
        if (allowInteraction) this.exitRule.evaluate(players);
    }
    public collision(bounds: Box, obstacles: readonly Box[]): CollisionWorld {
        return new CollisionWorld(bounds, this.gateOpen ? obstacles : [...obstacles, this.definition.gate]);
    }
}
