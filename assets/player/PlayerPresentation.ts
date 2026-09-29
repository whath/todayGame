import { _decorator, Color, Component } from 'cc';
import { PlayerId } from '../core/InputTypes';
import { WORLD_SCALE } from '../core/WorldCoordinates';
import { AccessibilityService } from '../services/AccessibilityService';
import { LocalizationService } from '../services/LocalizationService';
import { GreyboxGeometry, greybox } from '../gameplay/GreyboxGeometry';
import { PlayerState } from './PlayerState';
const { ccclass } = _decorator;

/** Input- and camera-independent 3D presentation; shape also distinguishes P1/P2. */
@ccclass('PlayerPresentation')
export class PlayerPresentation extends Component {
    private body!: GreyboxGeometry;
    private pulse = 0;
    private color = new Color();
    private accessibility!: AccessibilityService;
    private signature = '';
    public initialize(playerId: PlayerId, halfSize: number, _locale: LocalizationService, accessibility: AccessibilityService): void {
        this.accessibility = accessibility;
        this.color = playerId === 1 ? new Color(72, 199, 255) : new Color(255, 181, 91);
        const size = halfSize * 2 * WORLD_SCALE;
        this.body = greybox(this.node, 'Player body', [0, 0.35, 0], [size, 0.7, size], this.color, playerId === 1 ? 'sphere' : 'box');
        this.tick(0, PlayerState.Waiting);
    }
    public requestAction(_action: 'primary' | 'secondary' | 'interact'): void { this.pulse = 0.35; }
    public reset(): void { this.pulse = 0; }
    public tick(dt: number, state: PlayerState): void {
        this.pulse = Math.max(0, this.pulse - dt);
        const highlight = this.pulse > 0 && !this.accessibility.reduceFlashing;
        const signature = state + '/' + highlight;
        if (signature === this.signature) return; this.signature = signature;
        this.body.tint(state === PlayerState.Disconnected ? new Color(120, 128, 142) : highlight ? Color.WHITE : this.color);
    }
}
