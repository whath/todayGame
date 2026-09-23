import { Camera, Color, Graphics, Label, Layers, Node, RenderRoot2D, UITransform, view } from 'cc';
import { GameServices } from '../app/GameServices';
import { GameSession } from '../core/GameSession';
import { InputManager } from '../input/InputManager';
import { CONTROL_ACTIONS } from '../settings/DefaultSettings';

/** Single-camera HUD; all user-facing text comes from localization IDs. */
export class PrototypeHUD {
    private readonly root = new Node('HUD');
    private readonly header: Label;
    private readonly status: Label;
    private readonly help: Label;
    private readonly debug: Label;
    private readonly panel: Graphics;
    private previousWidth = 0;

    public constructor(private readonly camera: Camera, private readonly services: GameServices) {
        this.root.layer = Layers.Enum.UI_2D;
        this.root.parent = camera.node;
        this.root.setPosition(0, 0, -500);
        this.root.addComponent(RenderRoot2D);
        this.panel = this.root.addComponent(Graphics);
        this.header = this.label('Title', 24);
        this.status = this.label('Session and devices', 16);
        this.help = this.label('Controls', 14);
        this.debug = this.label('Development diagnostics', 16);
    }
    public update(manager: InputManager, session: GameSession, challenge?: { title: string; help: string }): void {
        const services = this.services;
        const t = services.localization.t.bind(services.localization);
        const scale = services.accessibility.uiScale;
        const size = view.getVisibleSize();
        const width = 720 * size.width / Math.max(1, size.height) / scale;
        const height = 720 / scale;
        this.root.setScale(this.camera.orthoHeight / 360 * scale, this.camera.orthoHeight / 360 * scale, 1);
        const left = -width / 2 + 22;
        const top = height / 2;
        this.header.node.setPosition(left, top - 16);
        this.status.node.setPosition(left, top - 53);
        this.help.node.setPosition(left, -top + 88);
        this.debug.node.setPosition(left, top - 158);
        if (width !== this.previousWidth) {
            this.previousWidth = width;
            this.panel.clear();
            this.panel.fillColor = new Color(12, 19, 31, 235);
            this.panel.rect(-width / 2, top - 139, width, 139);
            this.panel.rect(-width / 2, -top, width, 100);
            this.panel.fill();
            [this.header, this.status, this.help].forEach(label => label.getComponent(UITransform)!.setContentSize(width - 44, 84));
            this.debug.getComponent(UITransform)!.setContentSize(width - 44, 170);
        }
        this.header.string = challenge?.title ?? t('hud.title');
        const phase = services.pause.paused ? t('hud.paused', { reasons: services.pause.reasons.map(reason => t(`pause.${reason}`)).join(' / ') })
            : t(`hud.${session.phase}`);
        this.status.string = phase + '\n' + manager.slots.map(slot => {
            const id = slot.deviceId;
            const device = !id ? t('device.waiting') : id.startsWith('keyboard:') ? t(id === 'keyboard:a' ? 'device.keyboardA' : 'device.keyboardB')
                : t('device.gamepad', { index: Number(id.split(':')[1]) + 1 });
            return t('hud.slots', { player: slot.playerId, device, state: t(slot.connected ? 'state.ready' : slot.assigned ? 'state.disconnected' : 'state.waiting') });
        }).join('    ') + '\n' + t('hud.controllers', { count: manager.connectedGamepads });
        const bindings = [1, 2].map(player => {
            const params: Record<string, string | number> = { player };
            for (const action of CONTROL_ACTIONS) params[action] = services.localization.keyName(services.settings.runtime[`controls.p${player}.${action}`] as string | null);
            return t('hud.binding', params);
        });
        this.help.string = (challenge?.help ?? bindings.join('\n')) + '\n' + t('hud.help') + (services.diagnostics.enabled ? `   ${t('hud.debugHint')}` : '');
        this.debug.node.active = services.diagnostics.enabled && services.diagnostics.visible;
        if (this.debug.node.active) {
            const p = this.camera.node.worldPosition;
            this.debug.string = t('debug.summary', {
                fps: services.diagnostics.fps, ms: services.diagnostics.frameMs.toFixed(1),
                slots: manager.slots.map(slot => `P${slot.playerId}=${slot.deviceId ?? '-'} (${slot.getMoveVector().x.toFixed(2)},${slot.getMoveVector().y.toFixed(2)})`).join(' | '),
                pads: manager.connectedGamepads, x: p.x.toFixed(0), y: p.y.toFixed(0), zoom: this.camera.orthoHeight.toFixed(0),
                settings: services.settings.dirty ? t('menu.dirty') : t('menu.clean'), notice: t(`notice.${services.settings.notice}`), error: services.settings.lastError,
            });
        }
    }
    public showError(message: string): void { this.status.string = message; }
    private label(name: string, fontSize: number): Label {
        const node = new Node(name); node.layer = Layers.Enum.UI_2D; node.parent = this.root;
        const transform = node.addComponent(UITransform); transform.setAnchorPoint(0, 1); transform.setContentSize(1232, 84);
        const label = node.addComponent(Label); label.fontSize = fontSize; label.lineHeight = fontSize + 6;
        label.color = new Color(225, 237, 252); label.horizontalAlign = Label.HorizontalAlign.LEFT;
        label.verticalAlign = Label.VerticalAlign.TOP; label.overflow = Label.Overflow.SHRINK;
        return label;
    }
}
