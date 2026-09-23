const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const core = name => require(`../temp/core-tests/${name}`);
const { AssetService } = core('runtime/AssetService');
const { SceneFlowService } = core('runtime/SceneFlowService');
const { SaveService } = core('save/SaveService');
const { SaveSerializer } = core('save/SaveSerializer');
const { saveKey } = core('save/SaveSnapshot');
const { createPrototypeContent, PLAYER_CONTENT_ID, ROOM_CONTENT_ID } = core('content/PrototypeContent');
const { ContentRegistry } = core('content/ContentRegistry');
const { RandomService } = core('runtime/RandomService');
const { TimeService } = core('runtime/TimeService');
const content = createPrototypeContent();
const serializer = new SaveSerializer(content);
function snapshot() {
    return { schemaVersion: 3, profileId: 'profile.default', slotId: 'slot1', savedAt: 1234,
        profile: { unlockedContentIds: [PLAYER_CONTENT_ID, ROOM_CONTENT_ID], completedLevelIds: [], sessionsStarted: 1 },
        session: { levelId: ROOM_CONTENT_ID, characterId: PLAYER_CONTENT_ID, seed: 42, randomState: 42, elapsedSeconds: 12,
            players: content.level(ROOM_CONTENT_ID).spawns.map((p, i) => ({ playerId: i + 1, ...p })) } };
}
function memory() {
    const values = new Map(); return { values, read: key => values.get(key) ?? null,
        write: (key, value) => values.set(key, value), remove: key => values.delete(key) };
}
const key = saveKey('profile.default', 'slot1');
function deferred() { let resolve; const promise = new Promise(r => { resolve = r; }); return { promise, resolve }; }

test('asset scopes share in-flight load and release exactly once after the last owner', async () => {
    let loads = 0, releases = 0;
    const service = new AssetService({ load: async () => { loads++; return {}; }, release: () => releases++ });
    const a = service.createScope('a'), b = service.createScope('b');
    const [x, y] = await Promise.all([a.acquire('player'), b.acquire('player')]);
    assert.equal(x, y); assert.equal(await a.acquire('player'), x); assert.equal(loads, 1);
    a.dispose(); assert.equal(releases, 0); b.dispose(); b.dispose(); assert.equal(releases, 1); assert.equal(service.activeAssets, 0);
});
test('disposing during preload releases the late result and rejects its consumer', async () => {
    const gate = deferred(); let released = 0;
    const service = new AssetService({ load: () => gate.promise, release: () => released++ });
    const scope = service.createScope('late'); const pending = scope.acquire('player');
    const rejected = assert.rejects(pending, /disposed/); scope.dispose(); gate.resolve({}); await rejected;
    assert.equal(released, 1); assert.equal(service.activeAssets, 0);
});
test('failed asset load can be retried in the same scope', async () => {
    let attempt = 0; const service = new AssetService({ load: async () => { if (++attempt === 1) throw Error('missing'); return 7; }, release() {} });
    const scope = service.createScope('retry'); await assert.rejects(scope.acquire('a')); assert.equal(await scope.acquire('a'), 7); scope.dispose();
});
test('scene transition locks reentry, reports monotonic progress and retires old instances before assets', async () => {
    const events = []; const gate = deferred(); let preparing = false;
    const assets = new AssetService({ load: async () => ({}), release: () => events.push('release') });
    const flow = new SceneFlowService(assets, { prepare: async (request, scope, progress) => {
        await scope.acquire(request.target); progress(0.8); progress(0.1);
        if (preparing) await gate.promise;
        return { activate: () => events.push('activate'), dispose: () => events.push('dispose') };
    } });
    assert.equal(await flow.requestTransition({ target: 'mainMenu' }), true);
    preparing = true; const transition = flow.requestTransition({ target: 'gameplay' });
    await new Promise(r => setImmediate(r)); assert.equal(flow.state.current, 'loading'); assert.equal(flow.loading.progress, 0.8);
    assert.equal(await flow.requestTransition({ target: 'localJoin' }), false);
    gate.resolve(); assert.equal(await transition, true); assert.equal(flow.state.current, 'gameplay');
    assert.deepEqual(events, ['activate', 'activate', 'dispose', 'release']); flow.dispose(); assert.equal(assets.activeAssets, 0);
});
test('failed preparation preserves previous view and releases acquired resources', async () => {
    const disposed = []; const assets = new AssetService({ load: async () => ({}), release: id => disposed.push(id) });
    const flow = new SceneFlowService(assets, { prepare: async (r, s) => {
        await s.acquire(r.target); if (r.target === 'gameplay') throw Error('preload failed');
        return { activate() {}, dispose: () => disposed.push('view') };
    } });
    await flow.requestTransition({ target: 'mainMenu' }); assert.equal(await flow.requestTransition({ target: 'gameplay' }), false);
    assert.equal(flow.state.current, 'mainMenu'); assert.deepEqual(disposed, ['gameplay']); assert.match(flow.loading.error, /preload/); flow.dispose();
});
test('retirement failure does not roll back the already activated view', async () => {
    let n = 0; const assets = new AssetService({ load: async () => 1, release() {} });
    const flow = new SceneFlowService(assets, { prepare: async () => { const index = n++; return { activate() {}, dispose() { if (!index) throw Error('old cleanup'); } }; } });
    await flow.requestTransition({ target: 'mainMenu' }); assert.equal(await flow.requestTransition({ target: 'gameplay' }), true);
    assert.equal(flow.state.current, 'gameplay'); assert.match(flow.loading.error, /cleanup/); flow.dispose();
});
test('destroy during preparation cannot activate the late view', async () => {
    const gate = deferred(); let activated = 0, disposed = 0;
    const flow = new SceneFlowService(new AssetService({ load: async () => 1, release() {} }), { prepare: async () => {
        await gate.promise; return { activate: () => activated++, dispose: () => disposed++ };
    } });
    const pending = flow.requestTransition({ target: 'mainMenu' }); flow.dispose(); gate.resolve();
    assert.equal(await pending, false); assert.equal(activated, 0); assert.equal(disposed, 1);
});
test('save roundtrip strips unknown engine fields and preserves DTOs', () => {
    const data = snapshot(); data.node = { irrelevant: true }; data.session.component = 'ignore';
    assert.deepEqual(serializer.deserialize(serializer.serialize(data)), snapshot());
});
test('v1 save migrates unlocks and random state without mutating the source', () => {
    const data = snapshot(); data.schemaVersion = 1; data.profile.unlocks = data.profile.unlockedContentIds;
    delete data.profile.unlockedContentIds; delete data.session.randomState;
    const raw = JSON.stringify(data); assert.deepEqual(serializer.deserialize(raw), snapshot()); assert.equal(JSON.parse(raw).schemaVersion, 1);
});
test('save validation rejects unknown IDs, unsafe positions, duplicate players and invalid seed', () => {
    for (const mutate of [s => s.session.levelId = 'level.missing', s => s.session.players[0].x = 99999,
        s => s.session.players[0].playerId = 2, s => s.session.seed = 0, s => s.profile.sessionsStarted = -1,
        s => s.profileId = '../escape']) { const s = snapshot(); mutate(s); assert.throws(() => serializer.serialize(s)); }
});
test('save recovers previous snapshot from backup after committed corruption', () => {
    const storage = memory(), service = new SaveService(storage, serializer); const first = snapshot(), second = snapshot(); second.savedAt++;
    assert.equal(service.requestSave(first, 'manual'), true); assert.equal(service.requestSave(second, 'manual'), true);
    storage.values.set(key + '/committed', '{broken'); const result = service.load(first.profileId, first.slotId);
    assert.equal(result.status, 'backup'); assert.deepEqual(result.snapshot, first);
});
test('failed commit preserves the old committed save and does not publish completion', () => {
    const storage = memory(), service = new SaveService(storage, serializer); service.requestSave(snapshot(), 'first');
    let events = 0; service.completed.subscribe(() => events++); const original = storage.write;
    storage.write = (k, v) => { if (k.endsWith('/committed')) throw Error('disk full'); original(k, v); };
    const next = snapshot(); next.savedAt++;
    assert.equal(service.requestSave(next, 'second'), false); assert.equal(events, 0);
    assert.deepEqual(service.load(next.profileId, next.slotId).snapshot, snapshot()); assert.match(service.lastError, /disk full/);
});
test('temporary-only save is recoverable; future and wholly corrupt slots are never overwritten', () => {
    const storage = memory(), service = new SaveService(storage, serializer);
    storage.values.set(key + '/temporary', serializer.serialize(snapshot())); assert.equal(service.load('profile.default','slot1').status, 'temporary');
    const future = JSON.stringify({ ...snapshot(), schemaVersion: 99 }); storage.values.set(key + '/committed', future);
    assert.equal(service.load('profile.default','slot1').status, 'future'); assert.equal(service.requestSave(snapshot(),'manual'), false);
    assert.equal(storage.values.get(key + '/committed'), future);
    storage.values.clear(); storage.values.set(key + '/committed', 'broken'); assert.equal(service.requestSave(snapshot(),'manual'), false);
});
test('profile and slot identity mismatch is rejected; independent profiles do not overwrite each other', () => {
    const storage = memory(), service = new SaveService(storage, serializer); const other = snapshot(); other.profileId = 'profile.other';
    service.requestSave(snapshot(),'first'); service.requestSave(other,'other');
    assert.equal(service.load('profile.other','slot1').snapshot.profileId,'profile.other');
    storage.values.set(key + '/committed', serializer.serialize(other)); assert.equal(service.load('profile.default','slot1').status,'failed');
});
test('staged readback mismatch cannot replace the last committed save', () => {
    const storage = memory(), service = new SaveService(storage, serializer); service.requestSave(snapshot(),'first');
    const read = storage.read; storage.read = k => k.endsWith('/temporary') ? 'truncated' : read(k);
    assert.equal(service.requestSave(snapshot(),'second'), false); assert.match(service.lastError,/readback/);
    assert.equal(service.load('profile.default','slot1').status,'loaded');
});
test('prototype definitions validate against real localization and prefab IDs', () => {
    const { LocalizationService } = core('services/LocalizationService'); const locale = new LocalizationService();
    content.validate(id => id === 'prefab.player', id => locale.t(id) !== id);
    assert.equal(Object.isFrozen(content.level(ROOM_CONTENT_ID).spawns), true);
});
test('content rejects duplicate IDs, missing assets, missing strings, missing references and cycles', () => {
    assert.throws(() => content.register(content.character(PLAYER_CONTENT_ID)), /duplicate/);
    assert.throws(() => content.validate(() => false, () => true), /asset/);
    assert.throws(() => content.validate(() => true, () => false), /localization/);
    for (const dependency of ['character.missing', PLAYER_CONTENT_ID]) {
        const registry = new ContentRegistry(); registry.register({ ...content.character(PLAYER_CONTENT_ID), dependencies: [dependency] });
        assert.throws(() => registry.validate(() => true, () => true), /Missing|Cyclic/);
    }
});
test('content rejects out-of-range speed and blocked spawn', () => {
    const badCharacter = new ContentRegistry(); badCharacter.register({ ...content.character(PLAYER_CONTENT_ID), speed: 0 });
    assert.throws(() => badCharacter.validate(() => true, () => true), /range/);
    const registry = new ContentRegistry(); registry.register(content.character(PLAYER_CONTENT_ID));
    registry.register({ ...content.level(ROOM_CONTENT_ID), spawns: [{x:9999,y:0},{x:0,y:0}] });
    assert.throws(() => registry.validate(() => true, () => true), /spawns/);
});
test('top modal consumes Back even when overlay was added later', () => {
    const { UINavigationService } = core('runtime/UINavigationService'); const nav = new UINavigationService(), events=[];
    nav.push('screen','screen',() => events.push('screen')); const pop = nav.push('settings','modal', () => { events.push('modal'); pop(); });
    nav.push('pause','overlay', () => events.push('pause')); nav.push('toast','toast', () => events.push('toast'));
    nav.dispatch({ back:true }); assert.deepEqual(events,['modal']); assert.equal(nav.topId,'pause');
    nav.dispatch({ back:true }); assert.deepEqual(events,['modal','pause']);
});
test('pause freezes game time while UI and unscaled clocks continue', () => {
    const time = new TimeService(); time.tick(1,true); assert.equal(time.gameElapsed,0); assert.equal(time.uiElapsed,0.1); assert.equal(time.unscaledDelta,1);
    time.setScale(0.5); time.tick(0.04,false); assert.equal(time.gameDelta,0.02); time.restore(12); assert.equal(time.gameElapsed,12);
    assert.throws(() => time.setScale(NaN)); time.tick(NaN,false); assert.equal(time.gameDelta,0);
});
test('seed and saved random state reproduce continuation, pick and shuffle keep inputs intact', () => {
    const a = new RandomService(42), b = new RandomService(42);
    assert.deepEqual(Array.from({length:10}, () => a.nextFloat()), Array.from({length:10}, () => b.nextFloat()));
    const state = a.currentState, next = a.nextFloat(); b.reset(42,state); assert.equal(b.nextFloat(),next);
    const input = Object.freeze([1,2,3,4]); assert.deepEqual(a.shuffle(input).sort(),input); assert.ok(input.includes(a.pick(input)));
    assert.throws(() => a.pick([])); assert.throws(() => a.reset(0));
});
test('release disables flags and commands; playtest hides labs and diagnostics', () => {
    const { FeatureFlagService } = core('runtime/FeatureFlagService'); const { DeveloperConsole } = core('runtime/DeveloperConsole'); const { buildPolicy } = core('runtime/BuildInfo');
    const flags = new FeatureFlagService('release'); flags.register('experiment','test',true); assert.equal(flags.enabled('experiment'),false); assert.throws(() => flags.set('experiment',true));
    const console = new DeveloperConsole('release'); let executed = false; console.register('set_seed', () => { executed=true; return 'done'; }); console.execute('set_seed 2'); assert.equal(executed,false);
    assert.equal(buildPolicy('playtest').labs,false); assert.equal(buildPolicy('playtest').developerTools,false);
});
test('feedback modifiers suppress camera shake and vibration without suppressing UI', () => {
    const { FeedbackService } = core('runtime/FeedbackService'); const calls=[];
    const feedback = new FeedbackService({ ui:()=>calls.push('ui'), camera:()=>calls.push('camera'), rumble:()=>calls.push('rumble') }, () => ({shake:0,vibration:false}));
    feedback.request({kind:'uiConfirm',playerId:1}); assert.deepEqual(calls,['ui']);
});
test('release logger filters chatter and bounded history retains latest warnings', () => {
    const { GameLogger } = core('runtime/GameLogger'); const received=[]; const logger = new GameLogger('release', x=>received.push(x),()=>123);
    logger.log('INPUT','DEBUG','hidden'); logger.log('BOOT','INFO','hidden');
    for(let i=0;i<201;i++) logger.log('SAVE','WARN',String(i));
    assert.equal(received.length,201); assert.equal(logger.snapshot().length,200); assert.equal(logger.snapshot()[0].message,'1');
});
test('release and playtest configs exclude all actual lab scenes and replace unsafe exported scene lists', () => {
    const { buildConfig } = require('../tools/build-config.cjs');
    for (const variant of ['release','playtest']) { const config = buildConfig(variant, undefined, { scenes:[{url:'db://assets/labs/SaveLab.scene'}],debug:true });
        assert.equal(config.scenes.length,1); assert.equal(config.scenes[0].url,'db://assets/scenes/Prototype.scene'); assert.equal(config.debug,false); }
    const dev = buildConfig('development'); assert.equal(dev.scenes.length,5);
    for(const scene of dev.scenes.slice(1)) {
        const data = JSON.parse(fs.readFileSync(scene.url.slice(5),'utf8')); assert.ok(data[3].lab.endsWith('Lab')); assert.equal(data[1]._id,scene.uuid);
    }
});

test('saving a migrated slot keeps the original v1 bytes in backup', () => {
    const data=snapshot(); data.schemaVersion=1; data.profile.unlocks=data.profile.unlockedContentIds; delete data.profile.unlockedContentIds; delete data.session.randomState;
    const raw=JSON.stringify(data), storage=memory(), service=new SaveService(storage,serializer);
    storage.values.set(key+'/committed',raw); assert.equal(service.requestSave(snapshot(),'migration'),true);
    assert.equal(storage.values.get(key+'/backup'),raw); assert.equal(JSON.parse(storage.values.get(key+'/committed')).schemaVersion,3);
});
test('domain subscriptions unsubscribe and a failing observer cannot stop other observers', () => {
    const { DomainEvent }=core('runtime/DomainEvent'); const errors=[],seen=[]; const event=new DomainEvent(e=>errors.push(e));
    event.subscribe(()=>{throw Error('observer');}); const stop=event.subscribe(v=>seen.push(v)); event.publish(1); stop(); event.publish(2);
    assert.deepEqual(seen,[1]); assert.equal(errors.length,2); event.clear(); event.publish(3); assert.equal(errors.length,2);
});
