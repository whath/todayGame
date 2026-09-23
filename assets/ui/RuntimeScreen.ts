import { Camera, Color, Graphics, Label, Layers, Node, RenderRoot2D, UITransform, view } from 'cc';
import { MenuInput } from '../core/MenuInput';
export interface RuntimeChoice { readonly text: string; readonly run: () => void }
export interface RuntimeScreenModel {
    readonly id: string; readonly title: string; readonly detail: string; readonly choices: readonly RuntimeChoice[];
    readonly footer: string; readonly buildLabel: string;
}
/** Small screen renderer; SceneFlow and services own behavior. No platform APIs here. */
export class RuntimeScreen {
    private readonly root = new Node('Runtime UI');
    private readonly content = new Node('Screen content');
    private readonly buildLabel: Label;
    private selected = 0;
    private model: RuntimeScreenModel | null = null;
    private signature = '';
    private pulse = 0;
    public constructor(private readonly camera: Camera) {
        this.root.parent = camera.node; this.root.layer = Layers.Enum.UI_2D; this.root.setPosition(0, 0, -400);
        this.root.addComponent(RenderRoot2D);
        this.content.parent = this.root; this.content.layer = Layers.Enum.UI_2D;
        this.buildLabel = this.label(this.root, '', -520, -334, 1040, 22, 13);
    }
    public feedback(): void { this.pulse = 0.15; }
    public handle(input: MenuInput): void {
        if (!this.model || this.model.choices.length === 0) return;
        const count = this.model.choices.length;
        if (input.up) this.selected = (this.selected + count - 1) % count;
        if (input.down) this.selected = (this.selected + 1) % count;
        if (input.accept) this.model.choices[this.selected].run();
    }
    public update(model: RuntimeScreenModel, uiScale: number, dt: number, interactive: boolean): void {
        this.pulse = Math.max(0, this.pulse - dt);
        if (this.model?.id !== model.id) this.selected = 0;
        this.model = model;
        this.selected = Math.min(this.selected, Math.max(0, model.choices.length - 1));
        const size = view.getVisibleSize(); const width = 720 * size.width / Math.max(1, size.height);
        const scale = this.camera.orthoHeight / 360 * Math.min(uiScale, (width - 20) / 1100, 1.02);
        this.root.setScale(scale, scale, 1);
        this.buildLabel.string = model.buildLabel;
        this.content.active = interactive && model.title !== '';
        const signature = JSON.stringify([model.id, model.title, model.detail, model.choices.map(c => c.text), model.footer, this.selected, this.pulse > 0]);
        if (signature === this.signature) return; this.signature = signature;
        for (const child of [...this.content.children]) { child.active = false; child.removeFromParent(); child.destroy(); }
        if (!model.title) return;
        this.box(this.content, -550, -320, 1100, 640, new Color(14, 23, 39, 248));
        this.label(this.content, model.title, -510, 287, 1020, 48, 30);
        this.label(this.content, model.detail, -510, 224, 1020, 95, 19);
        model.choices.forEach((choice, index) => {
            const node = this.box(this.content, -475, 82 - index * 43, 950, 36,
                index === this.selected ? new Color(50, this.pulse > 0 ? 120 : 99, 148) : new Color(36, 53, 76));
            this.label(node, choice.text, 14, 30, 910, 28, 20);
            node.on(Node.EventType.TOUCH_END, () => { if (this.content.active && this.model?.id === model.id) { this.selected = index; this.model.choices[index]?.run(); } });
        });
        this.label(this.content, model.footer, -510, -284, 1020, 30, 15);
    }
    private box(parent: Node, x: number, y: number, width: number, height: number, color: Color): Node {
        const node = new Node('Panel'); node.parent = parent; node.layer = Layers.Enum.UI_2D; node.setPosition(x, y);
        const t = node.addComponent(UITransform); t.setAnchorPoint(0, 0); t.setContentSize(width, height);
        const g = node.addComponent(Graphics); g.fillColor = color; g.roundRect(0, 0, width, height, 6); g.fill(); return node;
    }
    private label(parent: Node, text: string, x: number, y: number, width: number, height: number, fontSize: number): Label {
        const node = new Node('Text'); node.parent = parent; node.layer = Layers.Enum.UI_2D; node.setPosition(x, y);
        const t = node.addComponent(UITransform); t.setAnchorPoint(0, 1); t.setContentSize(width, height);
        const l = node.addComponent(Label); l.string = text; l.fontSize = fontSize; l.lineHeight = fontSize + 5;
        l.horizontalAlign = Label.HorizontalAlign.LEFT; l.verticalAlign = Label.VerticalAlign.TOP; l.overflow = Label.Overflow.SHRINK;
        l.color = new Color(231, 239, 253); return l;
    }
}
