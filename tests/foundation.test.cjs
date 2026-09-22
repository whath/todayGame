const { test } = require('node:test');
const assert = require('node:assert/strict');
const { createSettingsRegistry } = require('../temp/core-tests/settings/DefaultSettings');
const { SettingsService } = require('../temp/core-tests/settings/SettingsService');
const { PlatformCapabilityService } = require('../temp/core-tests/services/PlatformCapabilityService');
const { PauseService } = require('../temp/core-tests/services/PauseService');
const { AudioService } = require('../temp/core-tests/services/AudioService');
const { AccessibilityService } = require('../temp/core-tests/services/AccessibilityService');
const { LocalizationService } = require('../temp/core-tests/services/LocalizationService');
const { DiagnosticsService } = require('../temp/core-tests/services/DiagnosticsService');
const { InputManager } = require('../temp/core-tests/input/InputManager');
const { KeyboardInputDevice } = require('../temp/core-tests/input/KeyboardInputDevice');
const { GamepadInputDevice } = require('../temp/core-tests/input/GamepadInputDevice');
const { EMPTY_RAW, applyStickDeadzone } = require('../temp/core-tests/core/InputTypes');
const { CollisionWorld } = require('../temp/core-tests/core/CollisionWorld');

function fixture(raw = null, options = {}) {
    const persistence = { raw, writes: 0, fail: false,
        load() { if (options.loadFailure) throw new Error('storage denied'); return this.raw; },
        save(value) { if (this.fail) throw new Error('disk full'); this.raw = value; this.writes++; },
    };
    const applied = [];
    const clock = { now: 0 };
    const registry = createSettingsRegistry();
    if (options.restart) registry.register({ id: 'test.restart', category: 'graphics', scope: 'global', applyMode: 'restartRequired',
        labelId: 'test', descriptionId: 'test', valueType: 'boolean', defaultValue: false });
    const capabilities = new PlatformCapabilityService({ audio: true, keyboard: true, gamepad: true, uiScale: true, frameLimit: true, fullscreen: !!options.fullscreen });
    const service = new SettingsService(registry, capabilities, persistence,
        { apply(values) { if (options.failApply?.(values)) throw new Error('adapter failed'); applied.push({ ...values }); } }, () => clock.now);
    service.boot();
    return { service, persistence, applied, clock, registry };
}
const saved = values => JSON.stringify({ schemaVersion: 2, values });

test('defaults boot without disk writes; duplicate IDs fail', () => {
    const f = fixture();
    assert.equal(f.service.runtime['audio.masterVolume'], 80);
    assert.equal(f.service.runtime['controls.p1.up'], 'KeyW');
    assert.equal(f.persistence.writes, 0);
    assert.throws(() => f.registry.register(f.registry.get('audio.masterVolume')), /Duplicate/);
});
test('invalid numbers, booleans, enum values, missing fields and keys recover', () => {
    const { service } = fixture(saved({ 'audio.masterVolume': 999999, 'audio.musicVolume': -8,
        'display.frameLimit': 'banana', 'accessibility.uiScale': 'huge', 'gameplay.pauseWhenUnfocused': 'false', 'controls.p1.up': 'Escape' }));
    assert.equal(service.runtime['audio.masterVolume'], 100);
    assert.equal(service.runtime['audio.musicVolume'], 0);
    assert.equal(service.runtime['display.frameLimit'], '60');
    assert.equal(service.runtime['accessibility.uiScale'], 1);
    assert.equal(service.runtime['gameplay.pauseWhenUnfocused'], true);
    assert.equal(service.runtime['controls.p1.up'], 'KeyW');
});
test('corrupt storage falls back without overwriting it', () => {
    const f = fixture('{broken');
    assert.equal(f.service.notice, 'invalid');
    assert.equal(f.persistence.raw, '{broken');
    assert.equal(f.persistence.writes, 0);
});
test('storage read failure uses defaults and reports failure', () => {
    const f = fixture(null, { loadFailure: true });
    assert.equal(f.service.notice, 'loadFailed');
    assert.equal(f.service.runtime['display.frameLimit'], '60');
});
test('v1 migrates renamed volume and both gamepad profiles', () => {
    const f = fixture(JSON.stringify({ schemaVersion: 1, values: { 'audio.master': 0.35, 'input.deadzone': 0.3 } }));
    assert.equal(f.service.runtime['audio.masterVolume'], 35);
    assert.equal(f.service.runtime['controls.p1.deadzone'], 0.3);
    assert.equal(f.service.runtime['controls.p2.deadzone'], 0.3);
    f.service.begin(); assert.equal(f.service.apply(), 'saved');
    assert.equal(JSON.parse(f.persistence.raw).schemaVersion, 2);
});
test('future schema is read-only and preserved', () => {
    const raw = JSON.stringify({ schemaVersion: 99, values: { futureData: 1 } });
    const f = fixture(raw); f.service.begin();
    assert.equal(f.service.notice, 'future');
    assert.equal(f.service.set('audio.masterVolume', 20), false);
    f.service.reset(); assert.equal(f.service.apply(), 'failed');
    assert.equal(f.persistence.raw, raw);
});
test('live preview and onApply edit are distinct; cancel restores both', () => {
    const f = fixture(); f.service.begin();
    f.service.set('audio.masterVolume', 25); f.service.set('display.frameLimit', '30');
    assert.equal(f.service.runtime['audio.masterVolume'], 25);
    assert.equal(f.service.runtime['display.frameLimit'], '60');
    assert.equal(f.persistence.writes, 0);
    f.service.cancel();
    assert.equal(f.service.runtime['audio.masterVolume'], 80);
    assert.equal(f.service.runtime['display.frameLimit'], '60');
});
test('apply saves once and new session loads the committed values', () => {
    const f = fixture(); f.service.begin();
    for (let n = 0; n <= 50; n += 5) f.service.set('audio.masterVolume', n);
    f.service.set('display.frameLimit', '30'); assert.equal(f.persistence.writes, 0);
    assert.equal(f.service.apply(), 'saved'); assert.equal(f.persistence.writes, 1);
    const next = fixture(f.persistence.raw);
    assert.equal(next.service.runtime['audio.masterVolume'], 50);
    assert.equal(next.service.runtime['display.frameLimit'], '30');
});
test('save failure rolls runtime back and keeps working edits for retry', () => {
    const f = fixture(); f.service.begin(); f.service.set('audio.masterVolume', 10); f.persistence.fail = true;
    assert.equal(f.service.apply(), 'failed');
    assert.equal(f.service.notice, 'saveFailed');
    assert.equal(f.service.runtime['audio.masterVolume'], 80);
    assert.equal(f.service.values['audio.masterVolume'], 10);
    f.persistence.fail = false; assert.equal(f.service.apply(), 'saved');
    assert.equal(f.service.runtime['audio.masterVolume'], 10);
});
test('preview adapter error restores runtime and working value', () => {
    const f = fixture(null, { failApply: values => values['audio.masterVolume'] === 10 }); f.service.begin();
    assert.equal(f.service.set('audio.masterVolume', 10), false);
    assert.equal(f.service.runtime['audio.masterVolume'], 80);
    assert.equal(f.service.values['audio.masterVolume'], 80);
    assert.equal(f.persistence.writes, 0);
});
test('risky display changes require confirmation; expiry restores without saving', () => {
    const f = fixture(null, { fullscreen: true }); f.service.begin(); f.service.set('display.mode', 'fullscreen');
    assert.equal(f.service.apply(), 'confirm'); assert.equal(f.persistence.writes, 0);
    assert.equal(f.service.runtime['display.mode'], 'fullscreen');
    f.clock.now = 15001; f.service.tick();
    assert.equal(f.service.runtime['display.mode'], 'windowed');
    assert.equal(f.service.awaitingConfirmation, false); assert.equal(f.persistence.writes, 0);
});
test('explicit Keep commits; late Keep cannot bypass timeout', () => {
    const f = fixture(null, { fullscreen: true }); f.service.begin(); f.service.set('display.mode', 'fullscreen');
    f.service.apply(); f.clock.now = 12000; assert.equal(f.service.keepChanges(), 'saved');
    assert.equal(f.persistence.writes, 1);
    f.service.set('display.mode', 'windowed'); f.service.apply(); f.clock.now = 28000;
    assert.equal(f.service.keepChanges(), 'failed'); assert.equal(f.persistence.writes, 1);
    assert.equal(f.service.runtime['display.mode'], 'fullscreen');
});
test('capability filtering prevents unsupported display and vibration edits', () => {
    const f = fixture(); f.service.begin();
    assert.equal(f.service.set('display.mode', 'fullscreen'), false);
    assert.equal(f.service.set('controls.p1.vibration', false), false);
    assert.deepEqual(f.service.capabilities.getSupportedResolutions(), []);
});
test('reset category preserves other category and remains cancellable', () => {
    const f = fixture(saved({ 'audio.masterVolume': 30, 'accessibility.uiScale': 1.2 })); f.service.begin();
    f.service.reset('audio'); assert.equal(f.service.runtime['audio.masterVolume'], 80);
    assert.equal(f.service.runtime['accessibility.uiScale'], 1.2);
    f.service.cancel(); assert.equal(f.service.runtime['audio.masterVolume'], 30);
});
test('reset all affects only settings namespace', () => {
    const f = fixture(saved({ 'audio.masterVolume': 30, 'accessibility.uiScale': 1.2 }));
    f.service.begin(); f.service.reset(); f.service.apply();
    assert.deepEqual(f.service.values, f.registry.defaults());
    assert.deepEqual(Object.keys(JSON.parse(f.persistence.raw)).sort(), ['schemaVersion', 'values']);
});
test('binding conflicts support cancel, swap and unbind across players', () => {
    const f = fixture(); f.service.begin();
    assert.equal(f.service.bindingConflict('controls.p1.primary', 'KeyJ'), 'controls.p2.primary');
    assert.equal(f.service.rebind('controls.p1.primary', 'KeyJ'), false);
    assert.equal(f.service.rebind('controls.p1.primary', 'KeyJ', 'swap'), true);
    assert.equal(f.service.values['controls.p2.primary'], 'KeyF');
    assert.equal(f.service.runtime['controls.p1.primary'], 'KeyF');
    f.service.rebind('controls.p1.interact', 'KeyF', 'unbind');
    assert.equal(f.service.values['controls.p2.primary'], null);
    f.service.apply(); assert.equal(f.service.runtime['controls.p1.primary'], 'KeyJ');
});
test('restoring one player defaults unbinds collisions without corrupting the other profile', () => {
    const f = fixture(); f.service.begin();
    f.service.rebind('controls.p1.primary', 'KeyJ', 'swap'); f.service.reset('controls', 1);
    assert.equal(f.service.values['controls.p1.primary'], 'KeyF');
    assert.equal(f.service.values['controls.p2.primary'], null);
    assert.equal(f.service.values['controls.p2.up'], 'ArrowUp');
});
test('external duplicate bindings are repaired to unique keys', () => {
    const f = fixture(saved({ 'controls.p1.primary': 'KeyW', 'controls.p2.up': 'KeyW' }));
    const keys = f.registry.all().filter(d => d.valueType === 'binding').map(d => f.service.runtime[d.id]).filter(Boolean);
    assert.equal(new Set(keys).size, keys.length);
});
test('restart-required saves without changing runtime until next boot', () => {
    const f = fixture(null, { restart: true }); f.service.begin(); f.service.set('test.restart', true); f.service.apply();
    assert.equal(f.service.runtime['test.restart'], false); assert.equal(f.service.restartRequired, true);
    assert.equal(fixture(f.persistence.raw, { restart: true }).service.runtime['test.restart'], true);
});
test('typed change subscribers can unsubscribe', () => {
    const f = fixture(); const events = []; const off = f.service.onChanged(event => events.push(event));
    f.service.begin(); f.service.set('audio.masterVolume', 20); off(); f.service.set('audio.masterVolume', 30);
    assert.equal(events.length, 1); assert.deepEqual(events[0].ids, ['audio.masterVolume']);
});
test('pause reasons compose and changing focus policy cannot clear manual pause', () => {
    const pause = new PauseService(); pause.toggleManual(); pause.setFocused(false);
    pause.configure(false); assert.equal(pause.paused, true); assert.deepEqual(pause.reasons, ['manual']);
    pause.toggleManual(); assert.equal(pause.paused, false);
    pause.set('controller', true); pause.set('settings', true); pause.set('settings', false);
    assert.deepEqual(pause.reasons, ['controller']);
});
test('audio buses multiply master and bus; focus mute is independent from pause', () => {
    const audio = new AudioService(); const values = { ...createSettingsRegistry().defaults(), 'audio.masterVolume': 50,
        'audio.musicVolume': 40, 'audio.muteWhenUnfocused': true };
    const volumes = []; const unregister = audio.register('music', { setVolume: volume => volumes.push(volume), stop() {} });
    audio.configure(values); assert.equal(volumes.at(-1), 0.2);
    assert.equal(audio.effectiveVolume('sfx'), 0.5); assert.equal(audio.effectiveVolume('ui'), 0.5);
    audio.setFocused(false); assert.equal(volumes.at(-1), 0);
    audio.setFocused(true); assert.equal(volumes.at(-1), 0.2);
    unregister(); const count = volumes.length; audio.setFocused(false); assert.equal(volumes.length, count);
});
test('accessibility modifiers and Chinese string lookup', () => {
    const service = new AccessibilityService();
    service.configure({ ...createSettingsRegistry().defaults(), 'accessibility.reduceFlashing': true, 'accessibility.uiScale': 1.2 });
    assert.equal(service.reduceFlashing, true); assert.equal(service.uiScale, 1.2); assert.equal(service.effectiveShake(10, 1), 0);
    const locale = new LocalizationService(); assert.equal(locale.keyName('ArrowUp'), '↑'); assert.equal(locale.t('device.gamepad', { index: 2 }), '手柄 2');
    for (const definition of createSettingsRegistry().all()) {
        assert.notEqual(locale.t(definition.labelId), definition.labelId);
        assert.notEqual(locale.t(definition.descriptionId), definition.descriptionId);
    }
});
test('release diagnostics cannot be enabled', () => {
    const release = new DiagnosticsService(false); release.toggle(); release.sample(1); assert.equal(release.visible, false); assert.equal(release.fps, 0);
    const dev = new DiagnosticsService(true); dev.toggle(); for (let n = 0; n < 61; n++) dev.sample(1 / 60);
    assert.equal(dev.visible, true); assert.equal(dev.fps, 60);
});
test('join ownership survives settings changes and menus suppress new joins', () => {
    const manager = new InputManager(); let a = { ...EMPTY_RAW, join: true, x: 1 }; let b = { ...EMPTY_RAW, join: true, y: 1 };
    manager.register(new KeyboardInputDevice('a', 'a', () => a)); manager.register(new KeyboardInputDevice('b', 'b', () => b));
    manager.update(false); assert.equal(manager.bothReady, false);
    a = EMPTY_RAW; b = EMPTY_RAW; manager.update();
    a = { ...EMPTY_RAW, join: true, x: 1 }; b = { ...EMPTY_RAW, join: true, y: 1 }; manager.update();
    const f = fixture(); f.service.begin(); f.service.set('controls.p1.deadzone', 0.4); f.service.apply();
    assert.equal(manager.slots[0].deviceId, 'a'); assert.equal(manager.slots[1].deviceId, 'b');
    assert.deepEqual(manager.slots[0].getMoveVector(), { x: 1, y: 0 });
    assert.deepEqual(manager.slots[1].getMoveVector(), { x: 0, y: 1 });
});
test('disconnect preserves slot and explicit new connection recovers it', () => {
    const manager = new InputManager(); let live = true;
    manager.register(new GamepadInputDevice('pad:1:1', 'Pad', () => ({ ...EMPTY_RAW, join: true }), () => live)); manager.update();
    live = false; manager.update(); assert.equal(manager.slots[0].assigned, true); assert.equal(manager.slots[0].connected, false);
    manager.register(new GamepadInputDevice('pad:1:2', 'Pad', () => ({ ...EMPTY_RAW, join: true }), () => true)); manager.update();
    assert.equal(manager.slots[0].deviceId, 'pad:1:2'); assert.equal(manager.slots[1].assigned, false);
});
test('existing collision sweeps prevent tunneling and preserve wall sliding', () => {
    const world = new CollisionWorld({ x: -100, y: -100, width: 200, height: 200 }, [{ x: 0, y: -20, width: 20, height: 40 }]);
    assert.deepEqual(world.move({ x: -80, y: 0 }, { x: 500, y: 10 }, 5), { x: -5, y: 10 });
    assert.deepEqual(world.move({ x: -80, y: 70 }, { x: -500, y: 500 }, 5), { x: -95, y: 95 });
});

test('gamepad deadzone modifies actual movement without changing its direction', () => {
    assert.deepEqual(applyStickDeadzone(0.15, 0, 0.2), { x: 0, y: 0 });
    assert.ok(applyStickDeadzone(0.3, 0, 0.1).x > 0);
    assert.deepEqual(applyStickDeadzone(0.3, 0, 0.4), { x: 0, y: 0 });
    const diagonal = applyStickDeadzone(1, 1, 0.2);
    assert.ok(Math.abs(Math.hypot(diagonal.x, diagonal.y) - 1) < 1e-10);
});

// Lightweight event bridge mock exercises real adapter code, not the Cocos runtime.
function keyboardFixture() {
    const fs = require('node:fs'); const path = require('node:path'); const vm = require('node:vm'); const ts = require('typescript');
    const codes = { ARROW_UP: 38, ARROW_DOWN: 40, ARROW_LEFT: 37, ARROW_RIGHT: 39, SPACE: 32, BACKSPACE: 8,
        ENTER: 13, ESCAPE: 27, TAB: 9, F1: 112, F2: 113, F5: 116 };
    for (const letter of 'ABCDEFGHIJKLMNOPQRSTUVWXYZ') codes[`KEY_${letter}`] = letter.charCodeAt(0);
    for (let n = 0; n < 10; n++) codes[`DIGIT_${n}`] = 48 + n;
    const exports = {};
    const js = ts.transpileModule(fs.readFileSync('assets/platform/KeyboardAdapter.ts', 'utf8'), {
        compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
    }).outputText;
    vm.runInNewContext(js, { exports, require: id => id === 'cc'
        ? { KeyCode: codes, input: { on() {}, off() {} }, Input: { EventType: { KEY_DOWN: 'down', KEY_UP: 'up' } } }
        : require(path.resolve('temp/core-tests/platform', id)) });
    const f = fixture(); const manager = new InputManager();
    const adapter = new exports.KeyboardAdapter(() => f.service.runtime, id => manager.playerForDevice(id));
    adapter.devices.forEach(device => manager.register(device));
    const frame = () => { manager.update(); adapter.endFrame(); };
    return { ...f, manager, adapter, codes, frame };
}
test('keyboard B joining P1 cannot auto-join a second slot with its held arrow key', () => {
    const f = keyboardFixture(); f.frame();
    f.adapter.onDown({ keyCode: f.codes.ARROW_UP }); f.frame(); f.frame();
    assert.equal(f.manager.slots[0].deviceId, 'keyboard:b');
    assert.equal(f.manager.slots[1].assigned, false);
    f.adapter.onUp({ keyCode: f.codes.ARROW_UP }); f.frame();
    f.adapter.onDown({ keyCode: f.codes.ARROW_UP }); f.frame();
    assert.equal(f.manager.slots[1].deviceId, 'keyboard:a');
});
test('changed player binding reaches the existing device without changing ownership', () => {
    const f = keyboardFixture(); f.frame();
    f.adapter.onDown({ keyCode: f.codes.KEY_W }); f.frame(); f.adapter.onUp({ keyCode: f.codes.KEY_W }); f.frame();
    f.service.begin(); f.service.rebind('controls.p1.up', 'KeyT'); f.service.apply(); f.frame();
    f.adapter.onDown({ keyCode: f.codes.KEY_T }); f.frame();
    assert.equal(f.manager.slots[0].deviceId, 'keyboard:a');
    assert.equal(f.manager.slots[0].getMoveVector().y, 1);
    f.adapter.onUp({ keyCode: f.codes.KEY_T }); f.frame();
    f.adapter.onDown({ keyCode: f.codes.KEY_W }); f.frame();
    assert.equal(f.manager.slots[0].getMoveVector().y, 0);
});
