import { Color, Graphics, Label, Layers, Node, UITransform } from 'cc';
import { Box } from '../core/CollisionWorld';
import { CoopChallenge } from '../core/CoopChallenge';
import { LocalizationService } from '../services/LocalizationService';
/** Geometry-only world feedback; puzzle state belongs to the pure challenge. */
export class CoopPresentation {
    private readonly graphics: Graphics;
    private readonly gateLabel: Label;
    private signature = '';
    public constructor(parent: Node, private readonly challenge: CoopChallenge, private readonly locale: LocalizationService) {
        const root = new Node('Relay mechanisms'); root.parent = parent; root.layer = Layers.Enum.UI_2D;
        // Floor is first; draw mechanisms below player bodies, not over them.
        root.setSiblingIndex(1);
        this.graphics = root.addComponent(Graphics);
        const c = challenge.definition;
        this.label(root, 'coop.plate', c.plate.x + c.plate.width / 2, c.plate.y - 30);
        this.label(root, 'coop.terminal', c.terminal.x, c.terminal.y - 65);
        this.label(root, 'coop.exit', c.exit.x + c.exit.width / 2, c.exit.y - 30);
        this.gateLabel = this.label(root, 'coop.closed', c.gate.x + c.gate.width / 2, c.gate.y - 30);
        this.update();
    }
    public update(): void {
        const c = this.challenge, d = c.definition;
        const signature = `${c.gateOpen}/${c.gateLatched}/${c.platePlayer}/${c.completed}`;
        if (signature === this.signature) return; this.signature = signature;
        const g = this.graphics; g.clear();
        this.box(d.plate, c.platePlayer ? new Color(77, 196, 146) : new Color(202, 167, 70));
        this.box(d.exit, c.completed ? new Color(77, 196, 146) : new Color(52, 103, 145));
        if (!c.gateOpen) this.box(d.gate, new Color(195, 89, 91));
        else { g.strokeColor = new Color(77, 196, 146); g.lineWidth = 3; g.rect(d.gate.x, d.gate.y, d.gate.width, d.gate.height); g.stroke(); }
        g.fillColor = c.gateLatched ? new Color(77, 196, 146) : new Color(202, 167, 70);
        g.circle(d.terminal.x, d.terminal.y, 25); g.fill();
        g.strokeColor = new Color(210, 220, 230); g.lineWidth = 1; g.circle(d.terminal.x, d.terminal.y, d.interactRadius); g.stroke();
        this.gateLabel.string = this.locale.t(c.gateLatched ? 'coop.latched' : c.gateOpen ? 'coop.open' : 'coop.closed');
    }
    private box(b: Box, color: Color): void { this.graphics.fillColor = color; this.graphics.rect(b.x, b.y, b.width, b.height); this.graphics.fill(); }
    private label(parent: Node, id: string, x: number, y: number): Label {
        const node = new Node(id); node.parent = parent; node.layer = Layers.Enum.UI_2D; node.setPosition(x, y);
        node.addComponent(UITransform).setContentSize(210, 42);
        const label = node.addComponent(Label); label.string = this.locale.t(id); label.fontSize = 19; label.lineHeight = 23;
        label.color = new Color(240, 240, 240); label.overflow = Label.Overflow.SHRINK;
        return label;
    }
}
