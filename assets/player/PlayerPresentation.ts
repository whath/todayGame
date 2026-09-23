import { _decorator, Color, Component, Graphics, Label, Layers, Node, UITransform } from 'cc';
import { PlayerId } from '../core/InputTypes';
import { AccessibilityService } from '../services/AccessibilityService';
import { LocalizationService } from '../services/LocalizationService';
import { PlayerState } from './PlayerState';
const { ccclass } = _decorator;

/** Semantic presentation adapter: no input sampling, collision, or camera ownership. */
@ccclass('PlayerPresentation')
export class PlayerPresentation extends Component {
    private body!: Graphics;
    private label!: Label;
    private playerId: PlayerId = 1;
    private halfSize = 18;
    private pulse = 0;
    private action = '';
    private color = new Color();
    private locale!: LocalizationService;
    private accessibility!: AccessibilityService;
    public initialize(playerId: PlayerId, halfSize: number, locale: LocalizationService, accessibility: AccessibilityService): void {
        this.playerId = playerId; this.halfSize = halfSize; this.locale = locale; this.accessibility = accessibility;
        this.node.layer = Layers.Enum.UI_2D;
        this.node.addComponent(UITransform).setContentSize(halfSize * 2, halfSize * 2);
        this.body = this.node.addComponent(Graphics);
        this.color = playerId === 1 ? new Color(72, 199, 255) : new Color(255, 181, 91);
        const node = new Node('Player label'); node.parent = this.node; node.layer = Layers.Enum.UI_2D; node.setPosition(0, 38, 0);
        node.addComponent(UITransform).setContentSize(200, 30);
        this.label = node.addComponent(Label); this.label.fontSize = 18; this.label.lineHeight = 24;
        this.label.color = this.color; this.label.horizontalAlign = Label.HorizontalAlign.CENTER;
        this.tick(0, PlayerState.Waiting);
    }
    public requestAction(action: 'primary' | 'secondary' | 'interact'): void { this.action = action; this.pulse = 0.35; }
    public reset(): void { this.pulse = 0; this.action = ''; }
    public tick(dt: number, state: PlayerState): void {
        this.pulse = Math.max(0, this.pulse - dt);
        this.label.string = `P${this.playerId}` + (this.pulse > 0 ? ` ${this.locale.t(`action.${this.action}`)}` : '');
        const half = this.halfSize;
        const highlight = this.pulse > 0 && !this.accessibility.reduceFlashing;
        this.body.clear(); this.body.fillColor = state === PlayerState.Disconnected ? new Color(120, 128, 142) : this.color;
        this.body.roundRect(-half, -half, half * 2, half * 2, this.playerId === 1 ? 5 : 0); this.body.fill();
        this.body.strokeColor = highlight ? Color.WHITE : new Color(24, 34, 50); this.body.lineWidth = highlight ? 4 : 2;
        this.body.roundRect(-half, -half, half * 2, half * 2, this.playerId === 1 ? 5 : 0); this.body.stroke();
    }
}
