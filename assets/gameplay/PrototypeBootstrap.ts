import {
    _decorator, Camera, Color, Component, game, Game, instantiate, Layers, Node,
    Prefab, RenderRoot2D, ResolutionPolicy, view,
} from 'cc';
import { SharedCamera } from '../camera/SharedCamera';
import { GameSession } from '../core/GameSession';
import { InputManager } from '../input/InputManager';
import { CocosGamepadAdapter } from '../platform/CocosGamepadAdapter';
import { KeyboardAdapter } from '../platform/KeyboardAdapter';
import { PlayerController } from '../player/PlayerController';
import { PrototypeHUD } from '../ui/PrototypeHUD';
import { PrototypeRoom } from './PrototypeRoom';
const { ccclass, property } = _decorator;

/** Composition root owns lifecycle and deterministic input → player → camera order. */
@ccclass('PrototypeBootstrap')
export class PrototypeBootstrap extends Component {
    @property(Prefab) public playerPrefab: Prefab | null = null;
    private readonly inputManager = new InputManager();
    private readonly keyboard = new KeyboardAdapter();
    private readonly gamepads = new CocosGamepadAdapter(device => this.inputManager.register(device));
    private readonly session = new GameSession();
    private readonly room = new PrototypeRoom();
    private readonly players: PlayerController[] = [];
    private sharedCamera!: SharedCamera;
    private hud!: PrototypeHUD;
    private ready = false;
    private paused = false;
    private adaptersActive = false;

    protected start(): void {
        view.setDesignResolutionSize(1280, 720, ResolutionPolicy.SHOW_ALL);
        const world = new Node('Game World');
        world.parent = this.node;
        world.layer = Layers.Enum.UI_2D;
        world.addComponent(RenderRoot2D);
        this.room.build(world);

        const cameraNode = new Node('Shared Camera');
        cameraNode.parent = this.node;
        cameraNode.setPosition(0, 0, 1000);
        const camera = cameraNode.addComponent(Camera);
        camera.projection = Camera.ProjectionType.ORTHO;
        camera.orthoHeight = 360;
        camera.near = 1;
        camera.far = 2000;
        camera.clearFlags = Camera.ClearFlag.SOLID_COLOR;
        camera.clearColor = new Color(14, 21, 33);
        camera.visibility = Layers.Enum.UI_2D;
        this.hud = new PrototypeHUD(camera);
        this.hud.update(this.inputManager, this.session, false);

        if (!this.playerPrefab) {
            this.hud.showError('Setup error: assign assets/player/Player.prefab to PrototypeBootstrap.playerPrefab.');
            return;
        }
        for (const slot of this.inputManager.slots) {
            const node = instantiate(this.playerPrefab);
            node.parent = world;
            const player = node.getComponent(PlayerController)!;
            player.initialize(slot);
            this.players.push(player);
        }
        this.resetPlayers();
        this.sharedCamera = cameraNode.addComponent(SharedCamera);
        this.sharedCamera.initialize(camera, this.players.map(player => player.node), this.room.bounds);
        this.keyboard.devices.forEach(device => this.inputManager.register(device));
        this.ready = true;
        this.startAdapters();
    }

    protected onEnable(): void { if (this.ready) this.startAdapters(); }
    protected onDisable(): void { this.stopAdapters(); }
    protected onDestroy(): void { this.stopAdapters(); this.inputManager.dispose(); }

    protected update(dt: number): void {
        if (!this.ready) return;
        if (this.paused) { this.hud.update(this.inputManager, this.session, true); return; }
        // Discard long stalls instead of simulating a huge movement after focus returns.
        const step = Math.min(Math.max(dt, 0), 1 / 20);
        this.inputManager.update();
        if (this.keyboard.lobbyPressed) {
            this.session.returnToLobby(this.inputManager);
            this.resetPlayers();
        } else {
            this.session.update(this.inputManager);
            if (this.keyboard.resetPressed) this.resetPlayers();
        }
        this.keyboard.endFrame();
        this.players.forEach(player => player.tick(step, this.room.collision, this.session.phase === 'playing'));
        this.sharedCamera.tick(step);
        this.hud.update(this.inputManager, this.session, false);
    }

    private resetPlayers(): void {
        this.players.forEach((player, index) => player.reset(this.room.spawns[index]));
    }

    private startAdapters(): void {
        if (this.adaptersActive) return;
        this.adaptersActive = true;
        this.paused = false;
        this.keyboard.start();
        this.gamepads.start();
        game.on(Game.EVENT_HIDE, this.onHide, this);
        game.on(Game.EVENT_SHOW, this.onShow, this);
        if (typeof window !== 'undefined') {
            window.addEventListener('blur', this.onHide);
            window.addEventListener('focus', this.onShow);
        }
    }

    private stopAdapters(): void {
        if (!this.adaptersActive) return;
        this.adaptersActive = false;
        this.keyboard.stop();
        this.gamepads.stop();
        this.inputManager.clearFrames();
        game.off(Game.EVENT_HIDE, this.onHide, this);
        game.off(Game.EVENT_SHOW, this.onShow, this);
        if (typeof window !== 'undefined') {
            window.removeEventListener('blur', this.onHide);
            window.removeEventListener('focus', this.onShow);
        }
    }

    private readonly onHide = (): void => {
        this.paused = true;
        this.keyboard.clear();
        this.inputManager.clearFrames();
    };
    private readonly onShow = (): void => { this.paused = false; };
}
