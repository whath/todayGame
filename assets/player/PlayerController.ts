import { _decorator, Component } from 'cc';
import { CollisionWorld } from '../core/CollisionWorld';
import { MoveVector, PlayerId } from '../core/InputTypes';
import { CharacterDefinition } from '../content/ContentRegistry';
import { PlayerInputSlot } from '../input/PlayerInputSlot';
import { PlayerMovement } from './PlayerMovement';
import { PlayerState } from './PlayerState';
import { PlayerPresentation } from './PlayerPresentation';
import { LocalizationService } from '../services/LocalizationService';
import { AccessibilityService } from '../services/AccessibilityService';
import { Actor, ActionSemantic } from '../core/GameplayKernel';
const { ccclass } = _decorator;

@ccclass('PlayerController')
export class PlayerController extends Component {
    public playerId: PlayerId = 1;
    public state = PlayerState.Waiting;
    private slot!: PlayerInputSlot;
    private movement!: PlayerMovement;
    private presentation!: PlayerPresentation;
    public actor!: Actor;
    public initialize(slot: PlayerInputSlot, locale: LocalizationService, accessibility: AccessibilityService, definition: CharacterDefinition): void {
        this.slot = slot; this.playerId = slot.playerId; this.node.name = `Player ${this.playerId}`;
        this.actor = new Actor(`player.${this.playerId}`, `slot.${this.playerId}`, 'players');
        this.actor.tags.add('actor.player'); this.actor.owner = this.playerId === 1 ? 'Player1' : 'Player2';
        this.movement = this.getComponent(PlayerMovement)!;
        this.movement.speed = definition.speed; this.movement.halfSize = definition.halfSize;
        this.presentation = this.node.addComponent(PlayerPresentation);
        this.presentation.initialize(this.playerId, definition.halfSize, locale, accessibility);
    }
    public tick(dt: number, world: CollisionWorld, canMove: boolean): void {
        this.slot.presence.activate();
        canMove = canMove && this.slot.presence.state === 'Active' && !this.actor.tags.has('state.disabled');
        if (!canMove) this.actor.actions.cancel('unavailable');
        if (!this.slot.connected) this.state = this.slot.assigned ? PlayerState.Disconnected : PlayerState.Waiting;
        else if (!canMove) this.state = PlayerState.Waiting;
        else {
            this.state = this.movement.step(this.slot.getMoveVector(), dt, world) ? PlayerState.Moving : PlayerState.Idle;
            if (this.slot.isPrimaryPressed()) this.act('PrimaryAction', 'primary');
            if (this.slot.isSecondaryPressed()) this.act('SecondaryAction', 'secondary');
            if (this.slot.isInteractPressed()) this.act('Interact', 'interact');
        }
        this.actor.state = this.state;
        this.presentation.tick(dt, this.state);
    }
    private act(semantic: ActionSemantic, presentation: 'primary' | 'secondary' | 'interact'): void {
        this.actor.actions.start(semantic, { canStart: () => !this.actor.tags.has('state.disabled'), start: () => this.presentation.requestAction(presentation),
            update: () => true, complete: () => {}, cancel: () => {} });
        this.actor.actions.tick(0);
    }
    protected onDestroy(): void { this.actor?.actions.cancel('destroyed'); this.actor?.actions.changed.clear(); }
    public reset(spawn: MoveVector): void {
        this.node.setPosition(spawn.x, spawn.y, 0); this.presentation.reset(); this.state = PlayerState.Waiting;
    }
}
