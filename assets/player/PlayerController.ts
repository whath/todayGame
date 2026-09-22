import { _decorator, Color, Component, Graphics, Label, Layers, Node, UITransform } from 'cc';
import { CollisionWorld } from '../core/CollisionWorld';
import { MoveVector, PlayerId } from '../core/InputTypes';
import { PlayerInputSlot } from '../input/PlayerInputSlot';
import { PlayerMovement } from './PlayerMovement';
import { PlayerState } from './PlayerState';
const { ccclass } = _decorator;

@ccclass('PlayerController')
export class PlayerController extends Component {
    public playerId: PlayerId = 1;
    public state = PlayerState.Waiting;
    private slot!: PlayerInputSlot;
    private movement!: PlayerMovement;
    private body!: Graphics;
    private nameLabel!: Label;
    private tint = new Color();
    private pulse = 0;
    private lastAction = '';

    public initialize(slot: PlayerInputSlot): void {
        this.slot = slot;
        this.playerId = slot.playerId;
        this.node.name = `Player ${this.playerId}`;
        this.node.layer = Layers.Enum.UI_2D;
        this.movement = this.getComponent(PlayerMovement)!;
        this.node.addComponent(UITransform).setContentSize(this.movement.halfSize * 2, this.movement.halfSize * 2);
        this.body = this.node.addComponent(Graphics);
        this.tint = this.playerId === 1 ? new Color(72, 199, 255) : new Color(255, 181, 91);
        const labelNode = new Node('Player label');
        labelNode.layer = Layers.Enum.UI_2D;
        labelNode.parent = this.node;
        labelNode.setPosition(0, 38, 0);
        labelNode.addComponent(UITransform).setContentSize(200, 30);
        this.nameLabel = labelNode.addComponent(Label);
        this.nameLabel.fontSize = 18;
        this.nameLabel.lineHeight = 24;
        this.nameLabel.color = this.tint;
        this.nameLabel.horizontalAlign = Label.HorizontalAlign.CENTER;
        this.nameLabel.string = `P${this.playerId}`;
        this.draw();
    }

    /** Called by the composition root after input sampling; no device/camera knowledge. */
    public tick(dt: number, world: CollisionWorld, canMove: boolean): void {
        this.pulse = Math.max(0, this.pulse - dt);
        if (!this.slot.connected) {
            this.state = this.slot.assigned ? PlayerState.Disconnected : PlayerState.Waiting;
        } else if (!canMove) {
            this.state = PlayerState.Waiting;
        } else {
            this.state = this.movement.step(this.slot.getMoveVector(), dt, world) ? PlayerState.Moving : PlayerState.Idle;
            if (this.slot.isPrimaryPressed()) this.showAction('PRIMARY');
            if (this.slot.isSecondaryPressed()) this.showAction('SECONDARY');
            if (this.slot.isInteractPressed()) this.showAction('INTERACT');
        }
        this.nameLabel.string = this.pulse > 0 ? `P${this.playerId} ${this.lastAction}` : `P${this.playerId}`;
        this.draw();
    }

    public reset(spawn: MoveVector): void {
        this.node.setPosition(spawn.x, spawn.y, 0);
        this.pulse = 0;
        this.lastAction = '';
        this.state = PlayerState.Waiting;
    }

    private showAction(name: string): void { this.lastAction = name; this.pulse = 0.35; }
    private draw(): void {
        const half = this.movement.halfSize;
        this.body.clear();
        this.body.fillColor = this.state === PlayerState.Disconnected ? new Color(120, 128, 142) : this.tint;
        this.body.roundRect(-half, -half, half * 2, half * 2, 5);
        this.body.fill();
        this.body.strokeColor = this.pulse > 0 ? Color.WHITE : new Color(24, 34, 50);
        this.body.lineWidth = this.pulse > 0 ? 4 : 2;
        this.body.roundRect(-half, -half, half * 2, half * 2, 5);
        this.body.stroke();
    }
}
