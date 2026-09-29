import { Camera, Color, Graphics, Label, Layers, Node, UITransform, view } from 'cc';
import { RacingWorld } from '../gameplay/racing/RacingWorld';
import { LocalizationService } from '../services/LocalizationService';
/** UI follows split viewports; never a dependency of either vehicle. */
export class RacingHUD {
    private readonly root = new Node('Racing HUD');
    private readonly labels: Label[] = [];
    private readonly line: Graphics;
    public constructor(camera: Camera, private readonly localization: LocalizationService) {
        this.root.parent = camera.node; this.root.layer = Layers.Enum.UI_2D; this.root.setPosition(0, 0, -490);
        this.line = this.root.addComponent(Graphics);
        for (let i = 0; i < 2; i++) {
            const node = new Node('Race stats P' + (i + 1)); node.parent = this.root; node.layer = Layers.Enum.UI_2D;
            const transform = node.addComponent(UITransform); transform.setAnchorPoint(0, 1);
            const label = node.addComponent(Label); label.fontSize = 19; label.lineHeight = 26;
            label.color = new Color(255, 255, 255); label.overflow = Label.Overflow.SHRINK;
            label.horizontalAlign = Label.HorizontalAlign.LEFT; label.verticalAlign = Label.VerticalAlign.TOP;
            this.labels.push(label);
        }
        this.root.active = false;
    }
    public update(world: RacingWorld | null, scale: number, paused: string): void {
        this.root.active = !!world; if (!world) return;
        const size = view.getVisibleSize(), width = 720 * size.width / Math.max(1, size.height);
        this.line.clear(); this.line.fillColor = new Color(12, 19, 31, 210);
        this.line.rect(-width / 2, 175, width, 185); this.line.fill();
        this.line.strokeColor = new Color(255, 255, 255); this.line.lineWidth = 3;
        this.line.moveTo(0, -360); this.line.lineTo(0, 360); this.line.stroke();
        const order = world.race.order(world.cars.map(c => c.node.worldPosition));
        this.labels.forEach((label, i) => {
            label.node.setPosition(-width / 2 + i * width / 2 + 18, 345);
            label.getComponent(UITransform)!.setContentSize(width / 2 - 36, 155);
            label.fontSize = Math.min(26, 19 * scale);
            const progress = world.race.racers[i];
            label.string = this.localization.t('racing.hud', { player: i + 1, speed: Math.round(Math.abs(world.cars[i].speed) * 3.6),
                lap: Math.min(progress.laps + 1, world.race.track.laps), laps: world.race.track.laps, rank: order.indexOf(i) + 1,
                next: progress.next, time: (progress.finishedAt ?? world.race.elapsed).toFixed(2) }) + '\n' +
                (paused || (world.race.countdown > 0 ? this.localization.t('racing.countdown', { seconds: Math.ceil(world.race.countdown) })
                    : progress.finishedAt !== null ? this.localization.t('racing.finished') : this.localization.t('racing.controls')));
        });
    }
}
