const test = require('node:test');
const assert = require('node:assert/strict');
const core = name => require('../temp/core-tests/' + name);
const { toWorld, toGround } = core('core/WorldCoordinates');
const { SharedGroupCameraPolicy, FixedRoomCameraPolicy } = core('core/CameraPolicy');
const { Actor } = core('core/GameplayKernel');
const { InteractionService, OwnershipService } = core('core/InteractionService');
const { CollisionWorld } = core('core/CollisionWorld');
const { CoopChallenge } = core('packs/relay/CoopChallenge');
const { COOP_LEVEL } = core('content/CoopLevel');
test('3D ground adapter preserves old level/save positions and maps forward to -Z', () => {
    for (const p of [...COOP_LEVEL.spawns, COOP_LEVEL.coop.terminal, { x: 513.75, y: -104.25 }]) {
        const world = toWorld(p, 1.4), roundtrip = toGround(world);
        assert.equal(world.y, 1.4);
        assert.ok(Math.abs(roundtrip.x - p.x) < 1e-9 && Math.abs(roundtrip.y - p.y) < 1e-9);
    }
    assert.deepEqual(toWorld({ x: 100, y: 100 }), { x: 1, y: 0, z: -1 });
});
test('3D movement still collides with closed relay gate on the ground plane', () => {
    const challenge = new CoopChallenge(COOP_LEVEL.coop, 18);
    const world = challenge.collision(COOP_LEVEL.bounds, COOP_LEVEL.obstacles);
    const before = toWorld({ x: -100, y: 0 });
    const next = world.move(toGround(before), { x: 200, y: 0 }, 18);
    assert.ok(toWorld(next).x <= -0.43);
    assert.ok(Math.abs(toWorld(next).z) < 1e-9);
});
test('camera policies frame empty, shared and fixed-room targets without genre assumptions', () => {
    const bounds = COOP_LEVEL.bounds, group = new SharedGroupCameraPolicy(), fixed = new FixedRoomCameraPolicy();
    for (const targets of [[], COOP_LEVEL.spawns, [{ x: -600, y: 0 }, { x: 600, y: 0 }]]) {
        const a = group.frame(targets, bounds, 16/9), b = fixed.frame(targets, bounds, 16/9);
        assert.ok(Number.isFinite(a.halfHeight) && a.halfHeight >= 480);
        assert.deepEqual(b.center, { x: 0, y: 0 });
    }
    const large = {x:-2000,y:-1000,width:4000,height:2000};
    assert.notDeepEqual(group.frame(COOP_LEVEL.spawns,large,16/9).center, fixed.frame(COOP_LEVEL.spawns,large,16/9).center);
});
test('players are not partners by default; only game configuration selects opponent/team', () => {
    const p1 = new Actor('player.1','slot.1'), p2 = new Actor('player.2','slot.2');
    p1.tags.add('actor.player'); p2.tags.add('actor.player');
    assert.equal(p1.relationTo(p2), 'Player');
    p1.tags.add('opponent.player.2'); assert.equal(p1.relationTo(p2), 'Opponent');
    assert.equal(p1.relationTo(p1), 'Self');
});
test('competitive arbitration requires a rule, validates its winner, and releases claims on failure', () => {
    const service = new InteractionService(), events = [];
    const requests = ['player.1','player.2'].map(actorId => ({ actorId, targetId: 'pickup' }));
    assert.throws(() => service.register({id:'invalid',policy:'Competitive',canInteract:()=>true,execute:()=>{}}));
    service.register({id:'pickup',policy:'Competitive',canInteract:()=>true,compete: ids=>ids.includes('player.2')?'player.2':null,execute: ids=>events.push(...ids)});
    service.resolve(requests); assert.deepEqual(events,['player.2']);
    assert.equal(service.ownership.owner('pickup'),'Player2');
    service.resolve(requests); assert.equal(events.length,1);
    service.releaseActor('player.2'); service.resolve(requests); assert.equal(events.length,2);
    const bad = new InteractionService();
    bad.register({id:'pickup',policy:'Competitive',canInteract:()=>true,compete:()=> 'absent',execute:()=>assert.fail()});
    assert.throws(()=>bad.resolve(requests),/eligible/); assert.equal(bad.ownership.owner('pickup'),'None');
    const failed = new InteractionService();
    failed.register({id:'pickup',policy:'Competitive',canInteract:()=>true,compete:ids=>ids[0],execute:()=>{throw Error('effect')}});
    assert.throws(()=>failed.resolve(requests),/effect/); assert.equal(failed.ownership.owner('pickup'),'None');
});
test('shared ownership survives one holder disconnecting and cannot be stolen by exclusive claim', () => {
    const ownership = new OwnershipService();
    assert.equal(ownership.claim('resource','player.1','Shared'),true);
    assert.equal(ownership.claim('resource','player.2','Shared'),true);
    assert.equal(ownership.claim('resource','player.1','Player1'),false);
    ownership.releaseActor('player.1'); assert.equal(ownership.owner('resource'),'Shared');
    ownership.release('resource','stranger'); assert.equal(ownership.owner('resource'),'Shared');
    ownership.releaseActor('player.2'); assert.equal(ownership.owner('resource'),'None');
    const service = new InteractionService();
    service.register({id:'protected',policy:'Exclusive',canInteract:()=>true,execute:()=>assert.fail('Must not steal team claim')});
    service.ownership.claim('protected','player.1','Team');
    assert.equal(service.resolve([{actorId:'player.1',targetId:'protected'}])[0].accepted,false);
    assert.equal(service.ownership.owner('protected'),'Team');
});

test('v5 content rejects unsupported relationship/camera policies instead of silently defaulting', () => {
    const { createPrototypeContent } = core('content/PrototypeContent');
    for (const override of [{ relationship: 'surprise' }, { cameraPolicy: 'missing-camera' }]) {
        const registry = createPrototypeContent();
        registry.register({ ...COOP_LEVEL, ...override, id: 'level.invalid_policy' });
        assert.throws(() => registry.validate(() => true, () => true), /Invalid (relationship|camera policy)/);
    }
});
test('scene assets preload the greybox material effect and retain the shared player prefab', () => {
    const fs = require('node:fs'), path = require('node:path');
    for (const folder of ['assets/scenes','assets/labs']) for (const file of fs.readdirSync(folder).filter(f=>f.endsWith('.scene'))) {
        const scene = JSON.parse(fs.readFileSync(path.join(folder,file),'utf8'));
        const bootstrap = scene.find(node=>node.playerPrefab);
        assert.equal(bootstrap.greyboxMaterial.__uuid__,'8c068f42-c908-48ea-becb-2c763f27403d');
        assert.equal(bootstrap.playerPrefab.__uuid__,'1dc33516-053f-5074-ac6f-c013827f2a2a');
    }
    const material = JSON.parse(fs.readFileSync('assets/gameplay/Greybox.mtl','utf8'));
    assert.equal(material._effectAsset.__uuid__,'c8f66d17-351a-48da-a12c-0212d28575c4');
});
