import { Camera, Color, Graphics, Label, Layers, Node, RenderRoot2D, UITransform, view } from 'cc';
import { MenuInput } from '../core/MenuInput';
import { LocalizationService } from '../services/LocalizationService';
import { SettingCategory, SettingDefinition, SettingValue } from '../settings/SettingDefinition';
import { SettingsService } from '../settings/SettingsService';

interface MenuChoice { label: string; run: () => void }
interface Dialog { message: string; choices: MenuChoice[]; selected: number }

/** Registry-driven prototype UI. All physical input stays in platform adapters. */
export class SettingsMenu {
    public readonly root = new Node('Settings Menu');
    private readonly content = new Node('Menu content');
    private categoryIndex = 0;
    private selected = 0;
    private capture: string | null = null;
    private dialog: Dialog | null = null;
    private signature = '';
    private displayChoice = 1;
    private readonly pageSize = 6;

    public constructor(private readonly camera: Camera, private readonly settings: SettingsService,
        private readonly locale: LocalizationService, private readonly onOpenChanged: (open: boolean) => void,
        private readonly returnToLobby: () => void, private readonly allowPointer = () => true) {
        this.root.parent = camera.node;
        this.root.layer = Layers.Enum.UI_2D;
        this.root.setPosition(0, 0, -300);
        this.root.addComponent(RenderRoot2D);
        this.content.layer = Layers.Enum.UI_2D;
        this.content.parent = this.root;
        this.root.active = false;
    }
    public get isOpen(): boolean { return this.root.active; }
    public get capturingBinding(): boolean { return this.capture !== null; }
    public open(): void {
        this.settings.begin();
        this.root.active = true;
        this.onOpenChanged(true);
        this.signature = '';
    }
    public close(): void {
        this.settings.cancel();
        this.capture = null;
        this.dialog = null;
        this.root.active = false;
        this.onOpenChanged(false);
    }
    public handle(input: MenuInput): void {
        if (!this.isOpen) return;
        if (this.settings.awaitingConfirmation) {
            if (input.back) this.settings.revert();
            else {
                if (input.left || input.right || input.up || input.down) this.displayChoice = 1 - this.displayChoice;
                if (input.accept) {
                    if (this.displayChoice === 0) this.settings.keepChanges(); else this.settings.revert();
                }
            }
            return;
        }
        if (this.dialog) {
            if (input.back) { this.dialog = null; return; }
            if (input.left || input.up) this.dialog.selected = (this.dialog.selected + this.dialog.choices.length - 1) % this.dialog.choices.length;
            if (input.right || input.down) this.dialog.selected = (this.dialog.selected + 1) % this.dialog.choices.length;
            if (input.accept) { const choice = this.dialog.choices[this.dialog.selected]; this.dialog = null; choice.run(); }
            return;
        }
        if (this.capture) {
            if (input.back) { this.capture = null; return; }
            if (input.bindingKey !== undefined) this.finishCapture(input.bindingKey);
            return;
        }
        if (input.back || input.settings) { this.requestClose(); return; }
        if (input.tab) { this.categoryIndex = (this.categoryIndex + 1) % this.categories().length; this.selected = 0; }
        if (input.previousTab) { this.categoryIndex = (this.categoryIndex + this.categories().length - 1) % this.categories().length; this.selected = 0; }
        const definitions = this.definitions();
        const count = definitions.length + this.commands().length;
        if (input.up) this.selected = (this.selected + count - 1) % count;
        if (input.down) this.selected = (this.selected + 1) % count;
        if (this.selected < definitions.length) {
            if (input.left) this.adjust(definitions[this.selected], -1);
            if (input.right || input.accept) this.adjust(definitions[this.selected], 1);
        } else if (input.accept) this.commands()[this.selected - definitions.length].run();
    }
    public update(uiScale: number): void {
        if (!this.isOpen) return;
        const visible = view.getVisibleSize();
        const width = 720 * visible.width / Math.max(1, visible.height);
        const fit = Math.min(uiScale, 700 / 640, (width - 20) / 1120);
        const scale = this.camera.orthoHeight / 360 * fit;
        this.root.setScale(scale, scale, 1);
        const signature = JSON.stringify([this.categoryIndex, this.selected, this.settings.values, this.capture,
            this.dialog?.message, this.dialog?.selected, this.settings.notice, this.settings.remainingSeconds,
            this.settings.awaitingConfirmation, this.settings.restartRequired, this.displayChoice]);
        if (signature === this.signature) return;
        this.signature = signature;
        this.render();
    }
    private categories(): SettingCategory[] {
        return [...new Set(this.settings.registry.all().filter(d => this.settings.capabilities.supports(d.capability)).map(d => d.category))];
    }
    private definitions(): SettingDefinition[] {
        const category = this.categories()[this.categoryIndex];
        return this.settings.registry.all().filter(d => d.category === category && this.settings.capabilities.supports(d.capability));
    }
    private commands(): MenuChoice[] {
        const t = (id: string): string => this.locale.t(id);
        const reset = (category?: SettingCategory, player?: 1 | 2): void => {
            this.confirm(t('menu.resetConfirm'), () => this.settings.reset(category, player));
        };
        return [
            { label: t('menu.apply'), run: () => { this.displayChoice = 1; this.settings.apply(); } },
            { label: t('menu.cancel'), run: () => { this.settings.cancel(); this.settings.begin(); } },
            { label: t('menu.resetCategory'), run: () => reset(this.categories()[this.categoryIndex]) },
            { label: t('menu.resetAll'), run: () => reset() },
            { label: t('menu.resetP1'), run: () => reset('controls', 1) },
            { label: t('menu.resetP2'), run: () => reset('controls', 2) },
            { label: t('menu.lobby'), run: () => this.confirm(t('menu.lobbyConfirm'), () => { this.close(); this.returnToLobby(); }) },
            { label: t('menu.back'), run: () => this.requestClose() },
        ];
    }
    private requestClose(): void {
        if (this.settings.dirty) this.confirm(this.locale.t('menu.discardConfirm'), () => this.close());
        else this.close();
    }
    private confirm(message: string, yes: () => void): void {
        this.dialog = { message, selected: 1, choices: [
            { label: this.locale.t('menu.yes'), run: yes }, { label: this.locale.t('menu.no'), run: () => {} },
        ] };
    }
    private adjust(definition: SettingDefinition, direction: number): void {
        const value = this.settings.values[definition.id];
        switch (definition.valueType) {
        case 'binding': this.capture = definition.id; return;
        case 'boolean': this.settings.set(definition.id, !value); return;
        case 'number': this.settings.set(definition.id, Number(value) + direction * definition.step); return;
        case 'enum': {
            const options = definition.options;
            const index = options.findIndex(option => option.value === value);
            this.settings.set(definition.id, options[(index + direction + options.length) % options.length].value);
        }
        }
    }
    private finishCapture(key: string | null): void {
        const id = this.capture!;
        this.capture = null;
        const conflict = this.settings.bindingConflict(id, key);
        if (!conflict) { this.settings.rebind(id, key); return; }
        const other = this.settings.registry.get(conflict);
        this.dialog = {
            message: this.locale.t('menu.conflict', { key: this.locale.keyName(key), action: `P${other.playerId} ${this.locale.t(other.labelId)}` }),
            selected: 2,
            choices: [
                { label: this.locale.t('menu.swap'), run: () => { this.settings.rebind(id, key, 'swap'); } },
                { label: this.locale.t('menu.unbind'), run: () => { this.settings.rebind(id, key, 'unbind'); } },
                { label: this.locale.t('menu.no'), run: () => {} },
            ],
        };
    }
    private valueLabel(definition: SettingDefinition, value: SettingValue): string {
        switch (definition.valueType) {
        case 'boolean': return this.locale.t(value ? 'option.on' : 'option.off');
        case 'binding': return this.locale.keyName(value as string | null);
        case 'enum': return this.locale.t(definition.options.find(option => option.value === value)!.labelId);
        case 'number': return String(value);
        }
    }
    private render(): void {
        for (const child of [...this.content.children]) { child.active = false; child.removeFromParent(); child.destroy(); }
        this.box(this.content, -560, -320, 1120, 640, new Color(14, 23, 39, 252));
        this.label(this.content, this.locale.t('menu.settings'), -520, 288, 1030, 42, 28);
        const categories = this.categories();
        categories.forEach((category, index) => this.button(this.content, this.locale.t(`category.${category}`),
            -520 + index * 174, 230, 162, index === this.categoryIndex,
            () => { if (this.blocked()) return; this.categoryIndex = index; this.selected = 0; }));
        const notice = this.settings.notice === 'none' ? this.locale.t(this.settings.dirty ? 'menu.dirty' : 'menu.clean') : this.locale.t(`notice.${this.settings.notice}`);
        this.label(this.content, notice + (this.settings.restartRequired ? ` · ${this.locale.t('menu.restart')}` : ''), -516, 195, 1040, 32, 16);
        const definitions = this.definitions();
        const page = Math.floor(Math.min(this.selected, Math.max(0, definitions.length - 1)) / this.pageSize);
        const first = page * this.pageSize;
        definitions.slice(first, first + this.pageSize).forEach((definition, offset) => {
            const index = first + offset;
            const y = 148 - offset * 44;
            const label = (definition.playerId ? `P${definition.playerId} · ` : '') + this.locale.t(definition.labelId);
            this.button(this.content, label, -516, y, 585, this.selected === index,
                () => { if (this.blocked()) return; this.selected = index; this.adjust(definition, 1); });
            this.button(this.content, '−', 85, y, 50, false, () => { if (this.blocked()) return; this.selected = index; this.adjust(definition, -1); });
            this.button(this.content, this.valueLabel(definition, this.settings.values[definition.id]), 145, y, 292,
                this.selected === index, () => { if (this.blocked()) return; this.selected = index; this.adjust(definition, 1); });
            this.button(this.content, '+', 447, y, 65, false, () => { if (this.blocked()) return; this.selected = index; this.adjust(definition, 1); });
        });
        this.button(this.content, '‹', 344, -116, 45, false, () => { if (!this.blocked()) this.selected = Math.max(0, first - this.pageSize); });
        this.label(this.content, this.locale.t('menu.page', { page: page + 1, total: Math.max(1, Math.ceil(definitions.length / this.pageSize)) }), 396, -109, 116, 24, 14);
        this.button(this.content, '›', 520, -116, 30, false, () => { if (!this.blocked()) this.selected = Math.min(definitions.length - 1, first + this.pageSize); });
        const selected = definitions[this.selected];
        this.label(this.content, selected ? this.locale.t(selected.descriptionId) : '', -516, -132, 1020, 54, 16);
        this.commands().forEach((command, index) => this.button(this.content, command.label,
            -516 + index % 4 * 260, -217 - Math.floor(index / 4) * 44, 246,
            this.selected === definitions.length + index, () => { if (!this.blocked()) command.run(); }));
        this.label(this.content, this.locale.t('menu.instructions'), -516, -288, 1040, 25, 14);
        if (this.capture) this.renderDialog({ message: this.locale.t('menu.capture'), selected: 0,
            choices: [{ label: this.locale.t('menu.no'), run: () => { this.capture = null; } }] });
        else if (this.settings.awaitingConfirmation) this.renderDialog({
            message: this.locale.t('menu.displayConfirm', { seconds: this.settings.remainingSeconds }), selected: this.displayChoice,
            choices: [{ label: this.locale.t('menu.keep'), run: () => { this.settings.keepChanges(); } },
                { label: this.locale.t('menu.revert'), run: () => this.settings.revert() }],
        });
        else if (this.dialog) this.renderDialog(this.dialog);
    }
    private blocked(): boolean { return this.capture !== null || this.dialog !== null || this.settings.awaitingConfirmation; }
    private renderDialog(dialog: Dialog): void {
        this.box(this.content, -545, -140, 1090, 310, new Color(28, 43, 66, 255));
        this.label(this.content, dialog.message, -496, 120, 990, 115, 22);
        dialog.choices.forEach((choice, index) => this.button(this.content, choice.label,
            -460 + index * 310, -75, 286, index === dialog.selected, () => { this.dialog = null; choice.run(); }));
    }
    private label(parent: Node, text: string, x: number, y: number, width: number, height: number, size: number): void {
        const node = new Node('Text'); node.parent = parent; node.layer = Layers.Enum.UI_2D; node.setPosition(x, y);
        const transform = node.addComponent(UITransform); transform.setAnchorPoint(0, 1); transform.setContentSize(width, height);
        const label = node.addComponent(Label); label.fontSize = size; label.lineHeight = size + 5;
        label.horizontalAlign = Label.HorizontalAlign.LEFT; label.verticalAlign = Label.VerticalAlign.TOP;
        label.overflow = Label.Overflow.SHRINK; label.string = text; label.color = new Color(231, 239, 253);
    }
    private box(parent: Node, x: number, y: number, width: number, height: number, color: Color): Node {
        const node = new Node('Panel'); node.parent = parent; node.layer = Layers.Enum.UI_2D; node.setPosition(x, y);
        const transform = node.addComponent(UITransform); transform.setAnchorPoint(0, 0); transform.setContentSize(width, height);
        const graphics = node.addComponent(Graphics); graphics.fillColor = color; graphics.roundRect(0, 0, width, height, 5); graphics.fill();
        return node;
    }
    private button(parent: Node, text: string, x: number, y: number, width: number, selected: boolean, action: () => void): void {
        const node = this.box(parent, x, y, width, 34, selected ? new Color(50, 99, 148) : new Color(36, 53, 76));
        this.label(node, text, 9, 28, width - 18, 27, 17);
        node.on(Node.EventType.TOUCH_END, () => { if (this.isOpen && this.allowPointer()) action(); });
    }
}
