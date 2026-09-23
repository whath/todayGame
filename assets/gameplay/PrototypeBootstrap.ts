import { _decorator, Camera, Color, Component, instantiate, Layers, Node, Prefab, RenderRoot2D } from 'cc';
import { GameServices } from '../app/GameServices';
import { SharedCamera } from '../camera/SharedCamera';
import { GameSession } from '../core/GameSession';
import { MenuInput } from '../core/MenuInput';
import { PLAYER_ASSET_ID, ROOM_CONTENT_ID, PLAYER_CONTENT_ID } from '../content/PrototypeContent';
import { InputManager } from '../input/InputManager';
import { CocosAudioAdapter } from '../platform/CocosAudioAdapter';
import { CocosAssetBackend } from '../platform/CocosAssetBackend';
import { CocosFocusAdapter } from '../platform/CocosFocusAdapter';
import { CocosGamepadAdapter } from '../platform/CocosGamepadAdapter';
import { KeyboardAdapter } from '../platform/KeyboardAdapter';
import { PlayerController } from '../player/PlayerController';
import { AssetScope, AssetService } from '../runtime/AssetService';
import { SceneFlowService, PreparedView, TransitionRequest } from '../runtime/SceneFlowService';
import { FeedbackService } from '../runtime/FeedbackService';
import { DeveloperConsole } from '../runtime/DeveloperConsole';
import { ProfileSnapshot, SaveSnapshot, SessionSnapshot } from '../save/SaveSnapshot';
import { PrototypeHUD } from '../ui/PrototypeHUD';
import { RuntimeChoice, RuntimeScreen, RuntimeScreenModel } from '../ui/RuntimeScreen';
import { SettingsMenu } from '../ui/SettingsMenu';
import { PrototypeRoom } from './PrototypeRoom';
const { ccclass, property } = _decorator;

@ccclass('PrototypeBootstrap')
export class PrototypeBootstrap extends Component {
    @property(Prefab) public playerPrefab: Prefab | null = null;
    @property public lab = '';
    private readonly services = new GameServices();
    private readonly inputManager = new InputManager();
    private readonly keyboard = new KeyboardAdapter(() => this.services.settings.runtime, id => this.inputManager.playerForDevice(id));
    private readonly gamepads = new CocosGamepadAdapter(device => this.inputManager.register(device), id => {
        const owner = this.inputManager.playerForDevice(id);
        return owner ? Number(this.services.settings.runtime[`controls.p${owner}.deadzone`]) : 0.2;
    });
    private readonly focus = new CocosFocusAdapter(focused => {
        this.focused = focused; this.services.setFocused(focused); if (!focused) this.keyboard.clear();
    });
    private readonly session = new GameSession();
    private room = new PrototypeRoom();
    private players: PlayerController[] = [];
    private profile: ProfileSnapshot = { unlockedContentIds: [PLAYER_CONTENT_ID, ROOM_CONTENT_ID], completedLevelIds: [], sessionsStarted: 0 };
    private pendingResume: SessionSnapshot | null = null;
    private activeSession: SessionSnapshot | null = null;
    private assets!: AssetService<Prefab>;
    private flow!: SceneFlowService<Prefab>;
    private camera!: Camera;
    private sharedCamera!: SharedCamera;
    private hud!: PrototypeHUD;
    private screen!: RuntimeScreen;
    private menu!: SettingsMenu;
    private feedback!: FeedbackService;
    private readonly console = new DeveloperConsole(this.services.build.variant);
    public audio!: CocosAudioAdapter;
    private ready = false;
    private focused = true;
    private adaptersActive = false;
    private subpage: 'none' | 'labs' | 'tools' = 'none';
    private message = '';
    private removeSettings: (() => void) | null = null;
    private removePause: (() => void) | null = null;
    private get saves() { return this.lab ? this.services.labSaves : this.services.saves; }

    protected start(): void {
        const cameraNode = new Node('Shared Camera'); cameraNode.parent = this.node; cameraNode.setPosition(0, 0, 1000);
        this.camera = cameraNode.addComponent(Camera);
        this.camera.projection = Camera.ProjectionType.ORTHO; this.camera.orthoHeight = 360; this.camera.near = 1; this.camera.far = 2000;
        this.camera.clearFlags = Camera.ClearFlag.SOLID_COLOR; this.camera.clearColor = new Color(14, 21, 33); this.camera.visibility = Layers.Enum.UI_2D;
        this.sharedCamera = cameraNode.addComponent(SharedCamera);
        this.hud = new PrototypeHUD(this.camera, this.services);
        this.screen = new RuntimeScreen(this.camera);
        try {
            this.services.boot(id => id === PLAYER_ASSET_ID && this.playerPrefab !== null, this.lab !== '');
        } catch (error) { this.hud.showError(String(error)); this.services.logger.log('BOOT', 'ERROR', String(error)); return; }
        this.audio = new CocosAudioAdapter(this.node, this.services.audio);
        this.assets = new AssetService(new CocosAssetBackend(new Map([[PLAYER_ASSET_ID, this.playerPrefab!]])));
        this.flow = new SceneFlowService(this.assets, { prepare: (request, scope, progress) => this.prepare(request, scope, progress) });
        this.flow.changed.subscribe(event => {
            this.services.logger.log('SCENE', event.phase === 'failed' ? 'ERROR' : 'INFO', `${event.phase}: ${event.request.target} ${event.error ?? ''}`);
        });
        this.inputManager.joined.subscribe(event => this.services.logger.log('INPUT', 'INFO', `P${event.playerId} joined ${event.deviceId}`));
        this.services.saves.completed.subscribe(event => this.services.logger.log('SAVE', 'INFO', `${event.reason}: ${event.profileId}/${event.slotId}`));
        this.services.labSaves.completed.subscribe(event => this.services.logger.log('SAVE', 'DEBUG', `Lab ${event.reason}: ${event.slotId}`));
        this.services.flags.register('ui_feedback', 'Temporary prototype UI confirmation pulse; remove once presentation is chosen', true);
        this.feedback = new FeedbackService({ ui: () => {
            if (this.services.flags.enabled('ui_feedback') && !this.services.accessibility.reduceFlashing) this.screen.feedback();
        } }, () => ({ shake: 0, vibration: false }));
        this.menu = new SettingsMenu(this.camera, this.services.settings, this.services.localization, open => {
            this.services.pause.set('settings', open);
            this.removeSettings?.(); this.removeSettings = null;
            if (open) this.removeSettings = this.services.navigation.push('settings', 'modal', command => this.menu.handle(command));
        }, () => this.returnToJoin());
        this.services.navigation.push('app', 'screen', command => this.handleApp(command));
        this.registerCommands();
        this.keyboard.devices.forEach(device => this.inputManager.register(device));
        this.ready = true; this.startAdapters();
        this.services.diagnostics.visible = this.lab !== '' && this.services.policy.developerTools;
        this.request(this.lab === 'InputLab' ? 'localJoin' : this.lab === 'CameraLab' ? 'gameplay' : 'mainMenu');
        if (this.lab === 'SettingsLab') this.menu.open();
    }
    private async prepare(request: TransitionRequest, scope: AssetScope<Prefab>, progress: (value: number) => void): Promise<PreparedView> {
        if (request.target !== 'gameplay') {
            progress(1);
            return { activate: () => {
                this.players = []; this.activeSession = null;
                this.services.pause.clearManual(); this.services.pause.set('controller', false);
                this.inputManager.releaseAll(); this.session.returnToLobby(this.inputManager);
                this.camera.node.setPosition(0, 0, 1000); this.camera.orthoHeight = 360;
                this.subpage = 'none';
            }, dispose: () => {} };
        }
        const level = this.services.content.level(request.contentId ?? ROOM_CONTENT_ID);
        const character = this.services.content.character(level.characterId);
        progress(0.1); const prefab = await scope.acquire(character.prefabId); progress(0.7);
        const root = new Node('Game World'); root.active = false; root.parent = this.node; root.layer = Layers.Enum.UI_2D;
        const players: PlayerController[] = [];
        try {
            root.addComponent(RenderRoot2D);
            const room = new PrototypeRoom(level); room.build(root);
            for (const slot of this.inputManager.slots) {
                const node = instantiate(prefab); node.parent = root;
                const player = node.getComponent(PlayerController)!;
                player.initialize(slot, this.services.localization, this.services.accessibility, character); players.push(player);
            }
            const resume = this.pendingResume;
            const seed = resume?.seed ?? ((Date.now() >>> 0) || 1);
            const snapshot: SessionSnapshot = resume ?? { levelId: level.id, characterId: character.id, seed, randomState: seed, elapsedSeconds: 0,
                players: room.spawns.map((spawn, index) => ({ playerId: (index + 1) as 1 | 2, x: spawn.x, y: spawn.y })) };
            players.forEach(player => player.reset(snapshot.players.find(p => p.playerId === player.playerId)!));
            progress(1);
            return { activate: () => {
                this.players = players; this.room = room; this.activeSession = snapshot;
                this.services.random.reset(snapshot.seed, snapshot.randomState); this.services.time.restore(snapshot.elapsedSeconds);
                if (!resume) this.profile.sessionsStarted++;
                this.pendingResume = null; root.active = true;
                this.services.pause.clearManual(); this.subpage = 'none';
                this.sharedCamera.initialize(this.camera, players.map(p => p.node), room.bounds);
            }, dispose: () => {
                root.active = false; root.destroy(); if (this.players === players) this.players = [];
            } };
        } catch (error) { root.destroy(); throw error; }
    }
    private request(target: TransitionRequest['target']): void {
        if (this.flow.busy) return;
        this.message = '';
        void this.flow.requestTransition({ target, contentId: this.pendingResume?.levelId ?? ROOM_CONTENT_ID }).then(ok => {
            if (!ok && this.isValid) this.message = this.t('runtime.transitionFailed', { error: this.flow.loading.error });
        });
    }
    private loadForJoin(resume: boolean): void {
        const loaded = this.saves.load('profile.default', 'slot1');
        if (resume && !loaded.snapshot?.session) {
            this.message = loaded.status === 'future' ? this.t('runtime.futureSave') : loaded.status === 'failed'
                ? this.t('runtime.saveFailed', { error: loaded.error ?? '' }) : this.t('runtime.noSave'); return;
        }
        if (loaded.snapshot) this.profile = loaded.snapshot.profile;
        this.pendingResume = resume ? loaded.snapshot!.session : null;
        this.request('localJoin');
        if (loaded.status === 'backup' || loaded.status === 'temporary') this.message = this.t('runtime.recovered', { source: loaded.status });
    }
    private snapshot(): SaveSnapshot {
        let session: SessionSnapshot | null = null;
        if (this.activeSession && this.players.length === 2) session = { ...this.activeSession,
            seed: this.services.random.seed, randomState: this.services.random.currentState, elapsedSeconds: this.services.time.gameElapsed,
            players: this.players.map(player => ({ playerId: player.playerId, x: player.node.position.x, y: player.node.position.y })) };
        return { schemaVersion: 2, profileId: 'profile.default', slotId: 'slot1', savedAt: Date.now(), profile: this.profile, session };
    }
    private save(reason: string): boolean {
        const ok = this.saves.requestSave(this.snapshot(), reason);
        this.message = ok ? this.t('runtime.saved') : this.t('runtime.saveFailed', { error: this.saves.lastError });
        if (!ok) {
            this.services.logger.log('SAVE', 'ERROR', this.saves.lastError);
            if (this.flow.state.current === 'gameplay') this.services.pause.set('manual', true);
        }
        return ok;
    }
    private returnToJoin(): void {
        if (this.players.length && !this.save('return-to-join')) return;
        this.pendingResume = null; this.request('localJoin');
    }
    private returnToMain(): void {
        if (this.lab) { this.leaveLab(); return; }
        if (this.players.length && !this.save('return-to-menu')) return;
        this.pendingResume = null; this.request('mainMenu');
    }
    private leaveLab(): void {
        this.lab = ''; this.pendingResume = null;
        this.profile = { unlockedContentIds: [PLAYER_CONTENT_ID, ROOM_CONTENT_ID], completedLevelIds: [], sessionsStarted: 0 };
        this.services.time.setScale(1); this.request('mainMenu');
    }
    private restart(): void {
        if (this.flow.busy) return;
        this.pendingResume = null; this.request('gameplay');
    }
    private handleApp(command: MenuInput): void {
        if (this.flow.busy) return;
        const state = this.flow.state.current;
        if (command.pause && state === 'gameplay') { this.services.pause.toggleManual(); return; }
        if (command.settings) { this.menu.open(); return; }
        if (command.back) {
            if (this.subpage !== 'none') this.subpage = 'none';
            else if (this.lab) this.leaveLab();
            else if (state === 'localJoin') this.request('mainMenu');
            return;
        }
        this.screen.handle(command);
    }
    private syncPauseLayer(): void {
        const paused = this.services.pause.reasons.includes('manual') && this.flow.state.current === 'gameplay';
        if (paused && !this.removePause) this.removePause = this.services.navigation.push('pause', 'overlay', command => {
            if (command.back && this.subpage === 'tools') this.subpage = 'none';
            else if (command.back || command.pause) { this.subpage = 'none'; this.services.pause.clearManual(); }
            else if (command.settings) this.menu.open(); else this.screen.handle(command);
        });
        if (!paused && this.removePause) { this.removePause(); this.removePause = null; }
    }
    protected update(dt: number): void {
        if (!this.ready) return;
        this.services.settings.tick(); this.services.diagnostics.sample(dt); this.syncPauseLayer();
        const keyboard = this.keyboard.menuInput(); const pad = this.gamepads.menuInput();
        const command: MenuInput = { ...keyboard };
        const keys = ['up', 'down', 'left', 'right', 'accept', 'back', 'tab', 'previousTab', 'settings', 'pause'] as const;
        for (const key of keys) command[key] = keyboard[key] || pad[key];
        if (keys.some(key => pad[key])) this.services.glyphs.activeDevice = 'gamepad';
        else if (keys.some(key => keyboard[key]) || keyboard.bindingKey !== undefined) this.services.glyphs.activeDevice = 'keyboard';
        const hadOverlay = this.menu.isOpen || this.services.pause.paused || this.flow.state.current !== 'gameplay';
        if (this.focused) {
            if (command.accept || command.back) this.feedback.request({ kind: command.accept ? 'uiConfirm' : 'uiCancel' });
            this.services.navigation.dispatch(command);
            if (command.diagnostics) this.services.diagnostics.toggle();
        }
        this.inputManager.update(this.focused && this.flow.state.current === 'localJoin' && !this.menu.isOpen && !this.flow.busy);
        // Disconnected slots can be explicitly reclaimed during gameplay, but never in menus.
        if (this.flow.state.current === 'gameplay' && !this.menu.isOpen && !this.services.pause.reasons.includes('manual') && this.focused) {
            // Input was already sampled; joining is resolved from that same frame.
            this.inputManager.assignFromCurrentFrame();
        }
        this.session.update(this.inputManager);
        this.services.pause.set('controller', this.flow.state.current === 'gameplay' && !this.inputManager.bothReady && this.lab !== 'CameraLab');
        const paused = this.flow.state.current !== 'gameplay' || this.services.pause.paused || hadOverlay;
        this.services.time.tick(dt, paused);
        if (command.reset && !paused && this.focused) this.players.forEach((p, i) => p.reset(this.room.spawns[i]));
        this.keyboard.endFrame();
        this.players.forEach(player => player.tick(this.services.time.gameDelta, this.room.collision, !paused));
        if (this.lab === 'CameraLab' && this.players.length === 2 && !paused) {
            const phase = this.services.time.gameElapsed;
            this.players[0].node.setPosition(-250 - Math.sin(phase * 0.5) * 200, -100 + Math.cos(phase * 0.5) * 150);
            this.players[1].node.setPosition(250 + Math.sin(phase * 0.5) * 200, 100 - Math.cos(phase * 0.5) * 150);
        }
        if (this.players.length) { this.sharedCamera.smoothing = this.services.accessibility.cameraSmoothing; this.sharedCamera.tick(this.services.time.gameDelta); }
        this.hud.update(this.inputManager, this.session);
        this.screen.update(this.screenModel(), this.services.accessibility.uiScale, this.services.time.uiDelta, !this.menu.isOpen);
        this.menu.update(this.services.accessibility.uiScale);
    }
    private screenModel(): RuntimeScreenModel {
        const state = this.flow.state.current;
        const choice = (id: string, run: () => void): RuntimeChoice => ({ text: this.t(id), run: () => { if (!this.flow.busy && !this.menu.isOpen) run(); } });
        const settings = choice('menu.settings', () => this.menu.open());
        let title = ''; let detail = ''; let choices: RuntimeChoice[] = [];
        let id: string = state;
        if (state === 'loading') { title = this.t('runtime.loading'); detail = this.t('runtime.progress', { progress: Math.round(this.flow.loading.progress * 100) }); }
        else if (this.subpage === 'tools') {
            id = 'tools'; title = this.t('runtime.tools'); detail = this.console.execute('help');
            choices = [choice('runtime.slow', () => { this.console.execute('set_timescale 0.5'); }), choice('runtime.normal', () => { this.console.execute('set_timescale 1'); }),
                choice('runtime.newSeed', () => { this.console.execute('set_seed 8492134'); }), choice('runtime.shuffle', () => {
                    if (this.players.length) this.services.random.shuffle(this.room.spawns).forEach((p, i) => this.players[i].reset(p));
                }), choice('runtime.back', () => { this.subpage = 'none'; })];
        } else if (this.subpage === 'labs') {
            id = 'labs'; title = this.t('runtime.labs'); detail = this.t('runtime.labHint');
            choices = ['InputLab', 'CameraLab', 'SettingsLab', 'SaveLab'].map(lab => choice(`runtime.lab.${lab}`, () => {
                this.lab = lab;
                this.profile = { unlockedContentIds: [PLAYER_CONTENT_ID, ROOM_CONTENT_ID], completedLevelIds: [], sessionsStarted: 0 };
                this.pendingResume = null;
                if (lab === 'SettingsLab') { this.subpage = 'none'; this.menu.open(); }
                else this.request(lab === 'InputLab' ? 'localJoin' : lab === 'CameraLab' ? 'gameplay' : 'mainMenu');
            }));
            choices.push(choice('runtime.back', () => { this.subpage = 'none'; }));
        } else if (this.lab === 'SaveLab') {
            id = 'SaveLab'; title = this.t('runtime.lab.SaveLab'); detail = this.t('runtime.labHint');
            choices = [choice('runtime.labWrite', () => { this.save('save-lab'); }), choice('runtime.labRead', () => {
                const loaded = this.saves.load('profile.default', 'slot1');
                this.message = this.t('runtime.labResult', { status: loaded.status, schema: loaded.snapshot?.schemaVersion ?? '-', sessions: loaded.snapshot?.profile.sessionsStarted ?? 0 });
            }), settings, choice('runtime.back', () => this.leaveLab())];
        } else if (state === 'mainMenu') {
            title = this.t('runtime.mainMenu'); detail = this.t('runtime.description');
            choices = [choice('runtime.new', () => this.loadForJoin(false)), choice('runtime.continue', () => this.loadForJoin(true)), settings];
            if (this.services.policy.labs) choices.push(choice('runtime.labs', () => { this.subpage = 'labs'; }));
            if (this.lab) { title = this.t(`runtime.lab.${this.lab}`); choices.push(choice('runtime.back', () => this.leaveLab())); }
        } else if (state === 'localJoin') {
            title = this.t('runtime.join'); detail = this.t('runtime.joinHelp', { p1: this.t(this.inputManager.slots[0].connected ? 'state.ready' : 'state.waiting'), p2: this.t(this.inputManager.slots[1].connected ? 'state.ready' : 'state.waiting') });
            if (this.lab === 'InputLab') {
                title = this.t('runtime.lab.InputLab');
                detail += '\n' + this.inputManager.slots.map(slot => {
                    const move = slot.getMoveVector();
                    return this.t('runtime.inputSample', { player: slot.playerId, device: slot.deviceId ?? '-', x: move.x.toFixed(2), y: move.y.toFixed(2) });
                }).join(' | ');
            }
            choices = [choice('runtime.start', () => { if (this.inputManager.bothReady) this.request('gameplay'); else this.message = this.t('runtime.needPlayers'); }), settings,
                choice('runtime.back', () => this.lab ? this.leaveLab() : this.request('mainMenu'))];
        } else if (state === 'gameplay' && this.services.pause.reasons.includes('manual')) {
            id = 'pause'; title = this.t('runtime.pause');
            detail = this.t('runtime.seed', { seed: this.services.random.seed, time: this.services.time.gameElapsed.toFixed(1) });
            choices = [choice('runtime.resume', () => this.services.pause.clearManual()), settings, choice('runtime.save', () => { this.save('manual'); }),
                choice('runtime.restart', () => this.restart()), choice('runtime.main', () => this.returnToMain())];
            if (this.services.policy.developerTools) choices.push(choice('runtime.tools', () => { this.subpage = 'tools'; }));
        }
        const build = this.services.build;
        return { id, title, detail: detail + (this.message ? `\n${this.message}` : ''), choices,
            footer: this.t('runtime.nav', { confirm: this.services.glyphs.get('confirm'), back: this.services.glyphs.get('back'), settings: this.services.glyphs.get('settings') }),
            buildLabel: this.services.policy.buildLabel ? `${build.version} / ${build.buildId} / ${build.commit} / ${build.variant} / seed ${this.services.random.seed}` : '' };
    }
    private registerCommands(): void {
        this.console.register('reload_scene', () => { this.restart(); return 'requested'; });
        this.console.register('show_inputs', () => { this.services.diagnostics.toggle(); return 'toggled'; });
        this.console.register('show_camera', () => { this.services.diagnostics.toggle(); return 'toggled'; });
        this.console.register('set_timescale', args => { this.services.time.setScale(Number(args[0])); return 'applied'; });
        this.console.register('set_seed', args => { this.services.random.reset(Number(args[0])); return 'applied'; });
        this.console.register('toggle_feature', args => { this.services.flags.set(args[0], !this.services.flags.enabled(args[0])); return 'toggled'; });
    }
    private t(id: string, params: Record<string, string | number> = {}): string { return this.services.localization.t(id, params); }
    protected onEnable(): void { if (this.ready) this.startAdapters(); }
    protected onDisable(): void { this.stopAdapters(); if (this.ready && this.menu.isOpen) this.menu.close(); }
    protected onDestroy(): void {
        this.stopAdapters(); this.flow?.dispose(); this.feedback?.dispose(); this.audio?.dispose(); this.services.dispose(); this.inputManager.dispose();
    }
    private startAdapters(): void { if (this.adaptersActive) return; this.adaptersActive = true; this.keyboard.start(); this.gamepads.start(); this.focus.start(); }
    private stopAdapters(): void { if (!this.adaptersActive) return; this.adaptersActive = false; this.focus.stop(); this.keyboard.stop(); this.gamepads.stop(); this.inputManager.clearFrames(); }
}
