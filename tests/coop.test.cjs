const test = require('node:test');
const assert = require('node:assert/strict');
const { CoopChallenge } = require('../temp/core-tests/core/CoopChallenge');
const { COOP_LEVEL, COOP_LEVEL_ID } = require('../temp/core-tests/content/CoopLevel');
const { createPrototypeContent } = require('../temp/core-tests/content/PrototypeContent');
const { SaveSerializer } = require('../temp/core-tests/save/SaveSerializer');
const { SaveService } = require('../temp/core-tests/save/SaveService');
const definition = COOP_LEVEL.coop;
const actor = (playerId,x,y=0,interact=false) => ({playerId,x,y,interact});
const fresh = () => new CoopChallenge(definition,18);
function saveData(coop,players) { return { schemaVersion:3,profileId:'profile.default',slotId:'slot1',savedAt:1,
    profile:{unlockedContentIds:[COOP_LEVEL_ID],completedLevelIds:[],sessionsStarted:1},
    session:{levelId:COOP_LEVEL_ID,characterId:COOP_LEVEL.characterId,seed:42,randomState:42,elapsedSeconds:1,coop,players:players.map(({playerId,x,y})=>({playerId,x,y}))} }; }
const serializer = new SaveSerializer(createPrototypeContent());
test('closed relay gate and full-height wall prevent crossing and bypass',()=>{
    const c=fresh(), world=c.collision(COOP_LEVEL.bounds,COOP_LEVEL.obstacles);
    assert.equal(world.move({x:-100,y:0},{x:500,y:0},18).x,-43);
    for(const y of [-330,200,330]) assert.equal(world.move({x:-100,y},{x:500,y:0},18).x,-43);
});
test('either player may hold the plate, while only a distinct nearby partner can latch',()=>{
    for(const holder of [1,2]) {
        const c=fresh(), other=holder===1?2:1;
        c.update([actor(holder,-335),actor(other,240)],true); assert.equal(c.gateOpen,true); assert.equal(c.gateLatched,false);
        c.update([actor(holder,-335),actor(other,240,0,true)],true); assert.equal(c.gateLatched,true);
        c.update([actor(holder,100),actor(other,240)],true); assert.equal(c.gateOpen,true);
    }
});
test('terminal rejects interaction without power or outside interaction radius',()=>{
    const c=fresh();c.update([actor(1,-500),actor(2,240,0,true)],true);assert.equal(c.gateLatched,false);
    c.update([actor(1,-335),actor(2,100,0,true)],true);assert.equal(c.gateLatched,false);
});
test('leaving the plate closes the gate unless a player occupies its doorway',()=>{
    const c=fresh();c.update([actor(1,-335),actor(2,-100)],false);assert.equal(c.gateOpen,true);
    c.update([actor(1,-500),actor(2,-100)],false);assert.equal(c.gateOpen,false);
    c.update([actor(1,-500),actor(2,0)],false);assert.equal(c.gateOpen,true);
    c.update([actor(1,-500),actor(2,100)],false);assert.equal(c.gateOpen,false);
});
test('suppressed interaction does not latch or complete when paused or navigating',()=>{
    const c=fresh();c.update([actor(1,-335),actor(2,240,0,true)],false);assert.equal(c.gateLatched,false);
    const latched=new CoopChallenge(definition,18,{gateLatched:true,completed:false});
    latched.update([actor(1,550),actor(2,600)],false);assert.equal(latched.completed,false);
});
test('completion requires permanent latch and both players in exit',()=>{
    const c=fresh();c.update([actor(1,550),actor(2,600)],true);assert.equal(c.completed,false);
    c.update([actor(1,-335),actor(2,240,0,true)],true);
    c.update([actor(1,550),actor(2,240)],true);assert.equal(c.completed,false);
    c.update([actor(1,550),actor(2,600)],true);assert.equal(c.completed,true);
    assert.throws(()=>c.update([actor(1,550),actor(1,600)],true),/distinct/);
});
test('full relay can be completed using collision-constrained movement, with either role assignment',()=>{
    for(const holder of [1,2]) {
        const players=[actor(1,-540,-90),actor(2,-540,90)],c=fresh();
        const walk=(id,x,y)=>{ const p=players[id-1]; for(let n=0;n<300 && Math.hypot(x-p.x,y-p.y)>0.01;n++) {
            c.update(players,false); const dx=x-p.x,dy=y-p.y,dist=Math.hypot(dx,dy),step=Math.min(10,dist);
            Object.assign(p,c.collision(COOP_LEVEL.bounds,COOP_LEVEL.obstacles).move(p,{x:dx/dist*step,y:dy/dist*step},18)); c.update(players,true);
        } assert.ok(Math.hypot(x-p.x,y-p.y)<0.01); };
        const runner=holder===1?2:1;
        walk(holder,-335,0); walk(runner,-150,0); walk(runner,240,0);
        players[runner-1].interact=true;c.update(players,true);players[runner-1].interact=false;
        assert.equal(c.gateLatched,true); walk(holder,-150,0);walk(holder,550,0);walk(runner,600,0);assert.equal(c.completed,true);
    }
});
test('checkpoint and completion roundtrip preserve mechanism state and doorway restoration is safe',()=>{
    for(const state of [{gateLatched:false,completed:false},{gateLatched:true,completed:false},{gateLatched:true,completed:true}]) {
        const players=state.completed?[actor(1,550),actor(2,600)]:[actor(1,-335),actor(2,0)];
        const loaded=serializer.deserialize(serializer.serialize(saveData(state,players)));
        const restored=new CoopChallenge(definition,18,loaded.session.coop);restored.update(players,false);
        assert.deepEqual(restored.snapshot(),state);assert.equal(restored.gateOpen,true);
    }
});
test('save rejects missing, nonboolean and inconsistent cooperative progress',()=>{
    for(const coop of [undefined,{gateLatched:'true',completed:false},{gateLatched:false,completed:true},{gateLatched:true,completed:true}]) {
        assert.throws(()=>serializer.serialize(saveData(coop,[actor(1,-335),actor(2,240)])),/cooperative/);
    }
});
test('v2 room saves migrate to v3 without changing level, coordinates or original backup bytes',()=>{
    const room=createPrototypeContent().level('level.prototype.room_01');
    const data=saveData(undefined,room.spawns.map((p,i)=>actor(i+1,p.x,p.y)));data.schemaVersion=2;data.session.levelId=room.id;
    const raw=JSON.stringify(data),values=new Map([['profile.default/slot1/committed',raw]]);
    const service=new SaveService({read:k=>values.get(k)??null,write:(k,v)=>values.set(k,v),remove:k=>values.delete(k)},serializer);
    const loaded=service.load('profile.default','slot1');assert.equal(loaded.snapshot.schemaVersion,3);assert.equal(loaded.snapshot.session.levelId,room.id);
    assert.deepEqual(loaded.snapshot.session.players,data.session.players);assert.equal(service.requestSave(loaded.snapshot,'migration'),true);
    assert.equal(values.get('profile.default/slot1/backup'),raw);
});
test('restarting a challenge drops transient and checkpoint state',()=>{
    const c=fresh();c.update([actor(1,-335),actor(2,240,0,true)],true);assert.equal(c.gateLatched,true);
    const reset=fresh();assert.deepEqual(reset.snapshot(),{gateLatched:false,completed:false});assert.equal(reset.gateOpen,false);
});
