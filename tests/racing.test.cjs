const test = require('node:test');
const assert = require('node:assert/strict');
const core = name => require('../temp/core-tests/' + name);
const { CategoryRegistry } = core('runtime/GameCategory');
const { VEHICLES, TRACKS, direction, resolveRace, validateRacingContent } = core('packs/racing/RacingContent');
const { RaceSession } = core('packs/racing/RaceSession');
const { RacingSetup } = core('packs/racing/RacingSetup');
const { DriveControl, tireForces, suspensionLoad } = core('packs/racing/VehicleDynamics');
const { InputDevice } = core('input/InputDevice');
const { InputManager } = core('input/InputManager');
const { EMPTY_RAW } = core('core/InputTypes');
const { TimeService } = core('runtime/TimeService');
const { PauseService } = core('services/PauseService');
const { LocalizationService } = core('services/LocalizationService');
const track = TRACKS[0];
function crossing(race, player, gate = race.racers[player].next, backwards = false, outside = 0) {
    const p = track.points[gate], d = direction(track, (gate + track.points.length - 1) % track.points.length);
    const a = { x: p.x - d.x - d.z * outside, y: p.y + 0.9, z: p.z - d.z + d.x * outside };
    const b = { x: p.x + d.x - d.z * outside, y: p.y + 0.9, z: p.z + d.z + d.x * outside };
    race.tick(1 / 120); race.advance(player, backwards ? b : a, backwards ? a : b);
}
function started(){const race=new RaceSession(track);race.tick(3);return race;}
test('categories retain stable identity and reject unknown or duplicated installation',()=>{
    const c=new CategoryRegistry();c.register({id:'racing',titleId:'category.racing',descriptionId:'category.racing.detail'});
    c.register({id:'relay',titleId:'category.relay',descriptionId:'category.relay.detail'});
    assert.equal(c.all.length,2);assert.equal(c.get('racing').id,'racing');
    assert.throws(()=>c.register(c.get('racing')));assert.throws(()=>c.get('invented'));assert.throws(()=>c.register({...c.get('racing'),id:'../bad'}));
});
test('race lobby invalidates readiness after own car/track/device changes and permits identical cars',()=>{
    const lobby=new RacingSetup();assert.equal(lobby.canStart,false);
    [0,1].forEach(i=>{lobby.syncDevice(i,'pad:'+i);lobby.toggleReady(i);});assert.equal(lobby.canStart,true);
    assert.doesNotThrow(()=>resolveRace(lobby.selection));
    lobby.chooseCar(0);assert.deepEqual(lobby.ready,[false,true]);lobby.toggleReady(0);
    lobby.syncDevice(1,null);assert.equal(lobby.canStart,false);lobby.syncDevice(1,'replacement');assert.equal(lobby.canStart,false);
    lobby.toggleReady(1);lobby.chooseTrack();assert.deepEqual(lobby.ready,[false,false]);
});
test('race content has finite physics, non-degenerate closed route and localized names',()=>{
    const locale=new LocalizationService();validateRacingContent(VEHICLES,TRACKS,id=>locale.t(id)!==id);
    assert.throws(()=>resolveRace({carIds:['bad',VEHICLES[0].id],trackId:track.id}));
    assert.throws(()=>validateRacingContent([{...VEHICLES[0],mass:NaN}],TRACKS));
    assert.throws(()=>validateRacingContent(VEHICLES,[{...track,points:track.points.map(()=>track.points[0])}]));
});
test('countdown, every ordered gate and three complete laps are required for each finisher',()=>{
    const race=new RaceSession(track);crossing(race,0);assert.equal(race.racers[0].next,1);race.tick(3);
    crossing(race,0,0);assert.equal(race.racers[0].laps,0);
    for(let lap=0;lap<3;lap++){for(let gate=1;gate<track.points.length;gate++)crossing(race,0,gate);crossing(race,0,0);assert.equal(race.racers[0].laps,lap+1);}
    assert.notEqual(race.racers[0].finishedAt,null);assert.equal(race.finished,false);
    for(let lap=0;lap<3;lap++){for(let gate=1;gate<track.points.length;gate++)crossing(race,1,gate);crossing(race,1,0);}
    assert.equal(race.finished,true);assert.deepEqual(race.order([track.points[0],track.points[0]]),[0,1]);
    const elapsed=race.elapsed;race.tick(1);assert.equal(race.elapsed,elapsed);
});
test('backwards, missed gates, out-of-width crossings and teleport cannot increase progress',()=>{
    const race=started();crossing(race,0,2);crossing(race,0,1,true);crossing(race,0,1,false,20);
    const p=track.points[1];race.advance(0,{x:p.x,y:1,z:p.z+10},{x:p.x,y:1,z:p.z-10});assert.equal(race.racers[0].next,1);
    crossing(race,0);assert.equal(race.racers[0].next,2);
});
test('reset is behind next gate, preserves earned progress and separates the two spawn lanes',()=>{
    const race=started();crossing(race,0);const before=JSON.stringify(race.racers[0]);
    const pose=race.resetPose(0);assert.equal(JSON.stringify(race.racers[0]),before);
    assert.equal(race.racers[0].lastCrossing,1);assert.equal(pose.position.z<track.points[1].z,true);
    const initial=started(),a=initial.resetPose(0),b=initial.resetPose(1);
    assert.ok(Math.hypot(a.position.x-b.position.x,a.position.z-b.position.z)>=5);
});
test('race order uses route progress before finish and interpolated crossing time after finish',()=>{
    const race=started();crossing(race,1);assert.equal(race.order([track.points[0],track.points[1]])[0],1);
    race.racers[0].finishedAt=7.6;race.racers[1].finishedAt=7.4;assert.deepEqual(race.order([track.points[0],track.points[0]]),[1,0]);
});
test('steering is rate limited and reduced at speed; braking precedes reverse',()=>{
    const c=new DriveControl();const first=c.update({steering:1,throttle:0,brake:1},20,1/120);
    assert.ok(first.steerAngle>0&&first.steerAngle<0.02);assert.equal(first.drive,0);assert.equal(first.brake,1);
    for(let i=0;i<70;i++)c.update({steering:1,throttle:0,brake:1},0,1/120);
    assert.equal(c.update({steering:1,throttle:0,brake:1},0,1/120).drive,0);
    for(let i=0;i<30;i++)c.update({steering:1,throttle:0,brake:1},0,1/120);
    assert.ok(c.update({steering:1,throttle:0,brake:1},-2,1/120).drive<0);
    assert.equal(c.update({steering:0,throttle:1,brake:0},-2,1/120).drive,0);
    c.reset();assert.equal(c.steering,0);
});
test('tires share a friction budget, have no airborne grip and resist lateral sliding',()=>{
    const car=VEHICLES[0];const f=tireForces(car,2000,12,8,1,0,1/120);
    assert.ok(f.lateral<0);assert.ok(Math.hypot(f.longitudinal,f.lateral)<=2000*car.grip+1e-9);
    const airborne=tireForces(car,0,12,8,1,1,1/120);assert.equal(Math.hypot(airborne.longitudinal,airborne.lateral),0);
    assert.ok(tireForces(car,3000,car.maxSpeed+1,0,1,0,1/120).longitudinal<0);
});
test('suspension supports static weight, damps compression and cannot pull the road',()=>{
    const car=VEHICLES[0],weight=car.mass*9.81/4,compression=weight/car.spring;
    assert.ok(Math.abs(suspensionLoad(car,compression,0)-weight)<1e-9);
    assert.ok(suspensionLoad(car,compression,-0.2)>weight);assert.equal(suspensionLoad(car,compression,100),0);
});
class Device extends InputDevice {
    raw={...EMPTY_RAW};live=true;
    constructor(id,kind){super(id,id,kind);}get connected(){return this.live;}read(){return this.raw;}
}
for(const kinds of [['keyboard','keyboard'],['keyboard','gamepad'],['gamepad','keyboard'],['gamepad','gamepad']]) test('driving actions stay independent: '+kinds.join('+'),()=>{
    const manager=new InputManager(),devices=kinds.map((kind,i)=>new Device(kind+':'+i,kind));
    devices.forEach(d=>{manager.register(d);d.raw={...EMPTY_RAW,join:true};});manager.update();assert.equal(manager.bothReady,true);
    devices[0].raw={...EMPTY_RAW,x:1,y:1,...(kinds[0]==='gamepad'?{throttle:0.8,brake:0.1}:{})};
    devices[1].raw={...EMPTY_RAW,x:-1,y:-1,...(kinds[1]==='gamepad'?{throttle:0.2,brake:0.9}:{})};manager.update(false);
    const a=manager.slots[0].getDrivingInput(),b=manager.slots[1].getDrivingInput();assert.equal(a.steering,1);assert.equal(b.steering,-1);
    assert.equal(a.throttle,kinds[0]==='gamepad'?0.8:1);assert.equal(b.brake,kinds[1]==='gamepad'?0.9:1);
    assert.notEqual(manager.slots[0].deviceId,manager.slots[1].deviceId);devices[0].live=false;manager.update(false);
    assert.deepEqual(manager.slots[0].getDrivingInput(),{steering:0,throttle:0,brake:0});assert.equal(manager.slots[1].getDrivingInput().steering,-1);
});
test('pause reasons freeze countdown and race clock without advancing after an elapsed wall-clock gap',()=>{
    const pause=new PauseService(),time=new TimeService(),race=new RaceSession(track);
    for(const reason of ['manual','settings','controller','unfocused']){pause.set(reason,true);time.tick(60,pause.paused);race.tick(time.gameDelta);assert.equal(race.countdown,3);pause.set(reason,false);}
    time.tick(60,pause.paused);race.tick(time.gameDelta);assert.equal(race.countdown,2.95);
});
const { AssetService } = core('runtime/AssetService');
const { SceneFlowService } = core('runtime/SceneFlowService');
test('category route is delivered to preparation and failed category load retains the active world',async()=>{
    const assets=new AssetService({load:async()=>({}),release:()=>{}}),events=[];
    const flow=new SceneFlowService(assets,{prepare:async(request)=>{
        events.push(request.categoryId+':prepare');
        if(request.contentId==='missing')throw Error('invalid content');
        return {activate:()=>events.push(request.categoryId+':activate'),dispose:()=>events.push(request.categoryId+':dispose')};
    }});
    assert.equal(await flow.requestTransition({target:'gameplay',categoryId:'relay'}),true);
    assert.equal(await flow.requestTransition({target:'gameplay',categoryId:'racing',contentId:'missing'}),false);
    assert.equal(flow.state.current,'gameplay');assert.equal(events.includes('relay:dispose'),false);
    assert.equal(await flow.requestTransition({target:'gameplay',categoryId:'racing',contentId:track.id}),true);
    assert.ok(events.indexOf('racing:activate')<events.indexOf('relay:dispose'));flow.dispose();assert.equal(events.at(-1),'racing:dispose');
});
test('fallback reset stays before the next gate and follows ramp elevation without awarding progress',()=>{
    const race=started();race.racers[0].lastCrossing=6;race.racers[0].next=7;
    const saved=JSON.stringify(race.racers[0]);
    const a=race.resetPose(0,4),b=race.resetPose(0,14),c=race.resetPose(0,10000);
    assert.ok(Math.hypot(a.position.x-b.position.x,a.position.z-b.position.z)>4.5);
    assert.ok(b.position.y>a.position.y);assert.ok(c.position.z<track.points[7].z);
    assert.equal(JSON.stringify(race.racers[0]),saved);
});
