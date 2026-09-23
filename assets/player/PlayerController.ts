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
const { ccclass } = _decorator;

@ccclass('PlayerController')
export class PlayerController extends Component {
    public playerId: PlayerId = 1;
    public state = PlayerState.Waiting;
    private slot!: PlayerInputSlot;
    private movement!: PlayerMovement;
    private presentation!: PlayerPresentation;
    public initialize(slot: PlayerInputSlot, locale: LocalizationService, accessibility: AccessibilityService, definition: CharacterDefinition): void {
        this.slot = slot; this.playerId = slot.playerId; this.node.name = `Player ${this.playerId}`;
        this.movement = this.getComponent(PlayerMovement)!;
        this.movement.speed = definition.speed; this.movement.halfSize = definition.halfSize;
        this.presentation = this.node.addComponent(PlayerPresentation);
        this.presentation.initialize(this.playerId, definition.halfSize, locale, accessibility);
    }
    public tick(dt: number, world: CollisionWorld, canMove: boolean): void {
        if (!this.slot.connected) this.state = this.slot.assigned ? PlayerState.Disconnected : PlayerState.Waiting;
        else if (!canMove) this.state = PlayerState.Waiting;
        else {
            this.state = this.movement.step(this.slot.getMoveVector(), dt, world) ? PlayerState.Moving : PlayerState.Idle;
            if (this.slot.isPrimaryPressed()) this.presentation.requestAction('primary');
            if (this.slot.isSecondaryPressed()) this.presentation.requestAction('secondary');
            if (this.slot.isInteractPressed()) this.presentation.requestAction('interact');
        }
        this.presentation.tick(dt, this.state);
    }
    public reset(spawn: MoveVector): void {
        this.node.setPosition(spawn.x, spawn.y, 0); this.presentation.reset(); this.state = PlayerState.Waiting;
    }
}
