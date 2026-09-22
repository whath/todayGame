import { _decorator, Camera, Color, Component, instantiate, Layers, Node, Prefab, RenderRoot2D } from 'cc';
import { GameServices } from '../app/GameServices';
import { SharedCamera } from '../camera/SharedCamera';
import { GameSession } from '../core/GameSession';
import { MenuInput } from '../core/MenuInput';
import { InputManager } from '../input/InputManager';
import { CocosAudioAdapter } from '../platform/CocosAudioAdapter';
import { CocosFocusAdapter } from '../platform/CocosFocusAdapter';
import { CocosGamepadAdapter } from '../platform/CocosGamepadAdapter';
import { KeyboardAdapter } from '../platform/KeyboardAdapter';
import { PlayerController } from '../player/PlayerController';
import { PrototypeHUD } from '../ui/PrototypeHUD';
import { SettingsMenu } from '../ui/SettingsMenu';
import { PrototypeRoom } from './PrototypeRoom';
const { ccclass, property } = _decorator;

@ccclass('PrototypeBootstrap')
export class PrototypeBootstrap extends Component {
    @property(Prefab) public playerPrefab: Prefab | null = null;
    private readonly services = new GameServices();
    private readonly inputManager = new InputManager();
    private readonly keyboard = new KeyboardAdapter(() => this.services.settings.runtime, id => this.inputManager.playerForDevice(id));
    private readonly gamepads = new CocosGamepadAdapter(device => this.inputManager.register(device), id => {
        const owner = this.inputManager.playerForDevice(id);
        return owner ? Number(this.services.settings.runtime[`controls.p${owner}.deadzone`]) : 0.2;
    });
    private readonly focus = new CocosFocusAdapter(focused => {
        this.focused = focused;
        this.services.setFocused(focused);
        if (!focused) this.keyboard.clear();
    });
    private readonly session = new GameSession();
    private readonly room = new PrototypeRoom();
    private readonly players: PlayerController[] = [];
    private sharedCamera!: SharedCamera;
    private hud!: PrototypeHUD;
    private menu!: SettingsMenu;
    public audio!: CocosAudioAdapter;
    private ready = false;
    private focused = true;
    private adaptersActive = false;

    protected start(): void {
        this.services.boot();
        this.audio = new CocosAudioAdapter(this.node, this.services.audio);
        const world = new Node('Game World'); world.parent = this.node; world.layer = Layers.Enum.UI_2D;
        world.addComponent(RenderRoot2D);
        this.room.build(world);
        const cameraNode = new Node('Shared Camera'); cameraNode.parent = this.node; cameraNode.setPosition(0, 0, 1000);
        const camera = cameraNode.addComponent(Camera);
        camera.projection = Camera.ProjectionType.ORTHO; camera.orthoHeight = 360; camera.near = 1; camera.far = 2000;
        camera.clearFlags = Camera.ClearFlag.SOLID_COLOR; camera.clearColor = new Color(14, 21, 33); camera.visibility = Layers.Enum.UI_2D;
        this.hud = new PrototypeHUD(camera, this.services);
        this.hud.update(this.inputManager, this.session);
        if (!this.playerPrefab) { this.hud.showError(this.services.localization.t('hud.setupError')); return; }
        for (const slot of this.inputManager.slots) {
            const node = instantiate(this.playerPrefab); node.parent = world;
            const player = node.getComponent(PlayerController)!;
            player.initialize(slot, this.services.localization, this.services.accessibility);
            this.players.push(player);
        }
        this.resetPlayers();
        this.sharedCamera = cameraNode.addComponent(SharedCamera);
        this.sharedCamera.initialize(camera, this.players.map(player => player.node), this.room.bounds);
        this.menu = new SettingsMenu(camera, this.services.settings, this.services.localization,
            open => this.services.pause.set('settings', open), () => {
                this.session.returnToLobby(this.inputManager);
                this.services.pause.clearManual();
                this.services.pause.set('controller', false);
                this.resetPlayers();
            });
        this.keyboard.devices.forEach(device => this.inputManager.register(device));
        this.ready = true;
        this.startAdapters();
    }
    protected onEnable(): void { if (this.ready) this.startAdapters(); }
    protected onDisable(): void { this.stopAdapters(); if (this.ready && this.menu.isOpen) this.menu.close(); }
    protected onDestroy(): void { this.stopAdapters(); this.audio?.dispose(); this.services.dispose(); this.inputManager.dispose(); }
    protected update(dt: number): void {
        if (!this.ready) return;
        // Confirmation time uses wall time; never freeze rollback while paused or unfocused.
        this.services.settings.tick();
        this.services.diagnostics.sample(dt);
        const keyboard = this.keyboard.menuInput();
        const pad = this.gamepads.menuInput();
        const command: MenuInput = { ...keyboard };
        for (const key of ['up', 'down', 'left', 'right', 'accept', 'back', 'tab', 'settings'] as const) command[key] = keyboard[key] || pad[key];
        const wasMenuOpen = this.menu.isOpen;
        if (this.focused) {
            if (wasMenuOpen) this.menu.handle(command);
            else if (command.settings) this.menu.open();
            else if (keyboard.back) this.services.pause.toggleManual();
            if (command.diagnostics) this.services.diagnostics.toggle();
        }
        this.inputManager.update(this.focused && !wasMenuOpen && !this.menu.isOpen);
        this.session.update(this.inputManager);
        this.services.pause.set('controller', this.session.phase === 'disconnected');
        const step = Math.min(Math.max(dt, 0), 1 / 20);
        const canMove = this.session.phase === 'playing' && !this.services.pause.paused && !wasMenuOpen;
        if (command.reset && canMove && this.focused) this.resetPlayers();
        this.keyboard.endFrame();
        this.players.forEach(player => player.tick(step, this.room.collision, canMove));
        this.sharedCamera.smoothing = this.services.accessibility.cameraSmoothing;
        this.sharedCamera.tick(step);
        this.hud.update(this.inputManager, this.session);
        this.menu.update(this.services.accessibility.uiScale);
    }
    private resetPlayers(): void { this.players.forEach((player, index) => player.reset(this.room.spawns[index])); }
    private startAdapters(): void {
        if (this.adaptersActive) return;
        this.adaptersActive = true; this.keyboard.start(); this.gamepads.start(); this.focus.start();
    }
    private stopAdapters(): void {
        if (!this.adaptersActive) return;
        this.adaptersActive = false; this.focus.stop(); this.keyboard.stop(); this.gamepads.stop(); this.inputManager.clearFrames();
    }
}
