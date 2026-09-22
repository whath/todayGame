import { Camera, Color, Graphics, Label, Layers, Node, RenderRoot2D, UITransform, view } from 'cc';
import { GameSession } from '../core/GameSession';
import { InputManager } from '../input/InputManager';

/** Camera-relative UI rendered by the same single camera as the room. */
export class PrototypeHUD {
    private readonly root = new Node('HUD');
    private readonly header: Label;
    private readonly status: Label;
    private readonly help: Label;
    private readonly panel: Graphics;
    private previousText = '';
    private previousWidth = 0;

    public constructor(private readonly camera: Camera) {
        this.root.layer = Layers.Enum.UI_2D;
        this.root.parent = camera.node;
        this.root.setPosition(0, 0, -500);
        this.root.addComponent(RenderRoot2D);
        this.panel = this.root.addComponent(Graphics);
        this.header = this.label('Title', 25, new Color(237, 244, 255));
        this.status = this.label('Session and devices', 17, new Color(200, 216, 239));
        this.help = this.label('Controls', 15, new Color(162, 183, 211));
        this.header.string = 'DUOGAME / LOCAL CO-OP FOUNDATION';
        this.help.string = 'Keyboard A: WASD + F / G / E     Keyboard B: Arrows + J / K / L\n'
            + 'Controller: Left stick / D-pad + South / East / West     R: Reset     Esc: Lobby';
    }

    public update(manager: InputManager, session: GameSession, paused: boolean): void {
        const size = view.getVisibleSize();
        const width = 720 * size.width / Math.max(1, size.height);
        this.root.setScale(this.camera.orthoHeight / 360, this.camera.orthoHeight / 360, 1);
        const left = -width / 2 + 24;
        this.header.node.setPosition(left, 334, 0);
        this.status.node.setPosition(left, 292, 0);
        this.help.node.setPosition(left, -303, 0);
        if (width !== this.previousWidth) {
            this.previousWidth = width;
            this.panel.clear();
            this.panel.fillColor = new Color(12, 19, 31, 235);
            this.panel.rect(-width / 2, 214, width, 146);
            this.panel.rect(-width / 2, -360, width, 80);
            this.panel.fill();
            [this.header, this.status, this.help].forEach(label => label.getComponent(UITransform)!.setContentSize(width - 48, 80));
        }
        const phase = paused ? 'PAUSED / Window inactive' : session.phase === 'playing' ? 'PLAYING / Actions show labels only'
            : session.phase === 'disconnected' ? 'PAUSED / Controller disconnected. Press a button on a free device to rejoin.'
                : 'JOIN / First device is P1; next device is P2. Two ready players start automatically.';
        const text = `${phase}\n` + manager.slots.map(slot =>
            `P${slot.playerId}: ${slot.deviceLabel}  [${slot.connected ? 'READY' : slot.assigned ? 'DISCONNECTED' : 'WAITING'}]`).join('     ')
            + `\nControllers detected: ${manager.connectedGamepads} / Reconnect order: P1, then P2`;
        if (text !== this.previousText) { this.previousText = text; this.status.string = text; }
    }

    public showError(message: string): void { this.status.string = message; }

    private label(name: string, fontSize: number, color: Color): Label {
        const node = new Node(name);
        node.layer = Layers.Enum.UI_2D;
        node.parent = this.root;
        const transform = node.addComponent(UITransform);
        transform.setAnchorPoint(0, 1);
        transform.setContentSize(1232, 80);
        const label = node.addComponent(Label);
        label.fontSize = fontSize;
        label.lineHeight = fontSize + 7;
        label.color = color;
        label.horizontalAlign = Label.HorizontalAlign.LEFT;
        label.verticalAlign = Label.VerticalAlign.TOP;
        label.overflow = Label.Overflow.SHRINK;
        return label;
    }
}
