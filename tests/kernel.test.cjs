const test=require('node:test');const assert=require('node:assert/strict');
const core=name=>require('../temp/core-tests/'+name);
const {PlayerPresence}=core('core/PlayerPresence');const {SpawnService}=core('core/SpawnService');
const {resolvePairMotion}=core('core/CoopPolicies');const {CollisionWorld}=core('core/CollisionWorld');
const {Actor,ActionRunner,TriggerRule}=core('core/GameplayKernel');const {InteractionService,OwnershipService}=core('core/InteractionService');
const {UINavigationService}=core('runtime/UINavigationService');const {FeedbackService}=core('runtime/FeedbackService');
const bounds={x:-500,y:-500,width:1000,height:1000},world=new CollisionWorld(bounds,[]);
test('presence preserves actor identity and gameplay state across reconnect and explicit leave',()=>{
 const p=new PlayerPresence(1),states=[];p.changed.subscribe(e=>states.push(e.to));p.join();p.ready();p.activate();p.setGameplay('Downed');p.disconnect();p.join();p.ready();
 assert.equal(p.state,'Downed');assert.equal(p.playerId,1);p.setGameplay('Spectating');p.leave();assert.equal(p.state,'Empty');p.join();p.ready();assert.equal(p.state,'Ready');
 assert.ok(states.includes('Leaving'));assert.throws(()=>p.join());
});
test('leaving a slot cannot rejoin on its still-held input; neutral and a fresh press can rejoin',()=>{
 const {InputManager}=core('input/InputManager');const {KeyboardInputDevice}=core('input/KeyboardInputDevice');const {EMPTY_RAW}=core('core/InputTypes');
 let raw={...EMPTY_RAW,join:true};const m=new InputManager();m.register(new KeyboardInputDevice('keyboard:a','A',()=>raw));m.update();m.leave(1);m.update();assert.equal(m.slots[0].assigned,false);
 raw=EMPTY_RAW;m.update();raw={...EMPTY_RAW,join:true};m.update();assert.equal(m.slots[0].assigned,true);
});
test('spawn resolves blocked and overlapping candidates or fails explicitly when no safe point exists',()=>{
 const s=new SpawnService(),obstacles=[{x:-20,y:-20,width:40,height:40}];
 assert.deepEqual(s.resolve({x:0,y:0},[{x:100,y:0},{x:200,y:0}],bounds,obstacles,18,[{x:100,y:0}]),{x:200,y:0});
 assert.throws(()=>s.resolve({x:0,y:0},[],bounds,obstacles,18),/safe/);assert.equal(s.safe({x:NaN,y:0},bounds,[],18),false);
});
test('separation defaults warn without teleporting; hard and soft tether reduce increasing separation',()=>{
 const before=[{x:-20,y:0},{x:20,y:0}],proposed=[{x:-100,y:0},{x:100,y:0}];
 const resolve=mode=>resolvePairMotion(before,proposed,world,10,{mode,maximumDistance:100},'off');
 assert.deepEqual(resolve('warning').positions,proposed);assert.equal(resolve('warning').warning,true);
 assert.deepEqual(resolve('hardTether').positions,before);assert.equal(resolve('softTether').positions[0].x,-36);
 assert.equal(resolve('blockProgress').blockProgress,true);for(const mode of ['autoRegroup','teleport'])assert.equal(resolve(mode).regroupRequested,true);
});
test('solid collision prevents overlap and swept swapping while Off preserves pass-through',()=>{
 const before=[{x:-60,y:0},{x:60,y:0}],after=[{x:60,y:0},{x:-60,y:0}],policy={mode:'warning',maximumDistance:900};
 assert.deepEqual(resolvePairMotion(before,after,world,18,policy,'solid').positions,before);
 assert.deepEqual(resolvePairMotion(before,after,world,18,policy,'off').positions,after);
 const apart=resolvePairMotion([{x:-18,y:0},{x:18,y:0}],[{x:-30,y:0},{x:30,y:0}],world,18,policy,'solid');assert.equal(apart.positions[0].x,-30);
});
test('soft collision separates in place without pushing through static walls',()=>{
 const wall=new CollisionWorld(bounds,[{x:15,y:-100,width:50,height:200}]);const result=resolvePairMotion([{x:0,y:0},{x:0,y:0}],[{x:0,y:0},{x:0,y:0}],wall,10,{mode:'warning',maximumDistance:900},'soft');
 assert.ok(result.positions[0].x<result.positions[1].x);assert.ok(result.positions[1].x<=5);
});
test('menu owner blocks partner and pointer, modal inherits ownership; disconnect releases all owned layers',()=>{
 const nav=new UINavigationService(),calls=[];nav.push('app','screen',()=>calls.push('app'));
 nav.push('pause','overlay',()=>calls.push('pause'),'player.1');const pop=nav.push('settings','modal',()=>calls.push('settings'),nav.owner);
 assert.equal(nav.dispatch({accept:true},'player.2'),false);assert.equal(nav.accepts('keyboard'),false);nav.dispatch({accept:true},'player.1');assert.deepEqual(calls,['settings']);
 nav.releaseOwner('player.1');nav.dispatch({back:true},'player.2');pop();assert.equal(nav.owner,null);nav.dispatch({back:true},'keyboard');assert.deepEqual(calls,['settings','settings','pause']);
});
test('actor relation and tags remain independent from combat or engine components',()=>{
 const a=new Actor('player.1','slot.1','players'),b=new Actor('player.2','slot.2','players'),n=new Actor('door','world');a.tags.add('actor.player');b.tags.add('actor.player');
 assert.equal(a.relationTo(a),'Self');assert.equal(a.relationTo(b),'Partner');assert.equal(a.relationTo(n),'Neutral');
 const ally=new Actor('ally','world','players');assert.equal(a.relationTo(ally),'Team');a.tags.add('hostile.enemies');assert.equal(a.relationTo(new Actor('e','ai','enemies')),'Hostile');
});
function action(events,overrides={}){return{canStart:()=>true,start:()=>events.push('start'),update:()=>true,complete:()=>events.push('complete'),cancel:r=>events.push(r),...overrides}}
test('action lifecycle denies concurrent starts, completes once, and cancels without completion',()=>{
 const r=new ActionRunner(),events=[];assert.equal(r.start('Interact',action(events,{canStart:()=>false})),false);
 r.start('Interact',action(events));assert.equal(r.start('PrimaryAction',action(events)),false);r.tick(0.1);r.tick(0.1);assert.deepEqual(events,['start','complete']);
 r.start('Move',action(events,{update:()=>false}));r.cancel('disconnected');r.tick(0.1);assert.equal(r.status,'Cancelled');assert.equal(events.at(-1),'disconnected');
});
test('action failure clears active work and allows later actions',()=>{
 const r=new ActionRunner(),e=[];r.start('Interact',action(e,{complete:()=>{throw Error('effect')}}));assert.throws(()=>r.tick(0));assert.equal(r.status,'Cancelled');
 assert.equal(r.start('SpecialAction',action(e)),true);r.cancel('shutdown');
});
test('trigger checks condition before action and only fires once until reset',()=>{
 let fired=0;const rule=new TriggerRule(c=>c.both,c=>c.power,()=>fired++);assert.equal(rule.evaluate({both:true,power:false}),false);
 rule.evaluate({both:true,power:true});rule.evaluate({both:true,power:true});assert.equal(fired,1);rule.reset();rule.evaluate({both:true,power:true});assert.equal(fired,2);
});
const requests=ids=>ids.map(actorId=>({actorId,targetId:'switch'}));
function interaction(policy,options={}){const service=new InteractionService(),calls=[];service.register({id:'switch',policy,canInteract:()=>true,execute:ids=>calls.push([...ids]),...options});return{service,calls};}
test('exclusive arbitration is independent of request order and ownership blocks competitors',()=>{
 const {service,calls}=interaction('Exclusive');const result=service.resolve(requests(['player.2','player.1','player.1']));assert.deepEqual(calls,[['player.1']]);assert.equal(result.length,2);
 assert.equal(service.ownership.owner('switch'),'Player1');assert.equal(service.resolve(requests(['player.2']))[0].reason,'claimed');service.releaseActor('player.1');assert.equal(service.resolve(requests(['player.2']))[0].accepted,true);
});
test('shared, simultaneous and cooperative policies enforce their different participation requirements',()=>{
 const shared=interaction('Shared');shared.service.resolve(requests(['player.1','player.2']));assert.equal(shared.calls[0].length,2);
 const simultaneous=interaction('Simultaneous');simultaneous.service.resolve(requests(['player.1']));assert.equal(simultaneous.calls.length,0);simultaneous.service.resolve(requests(['player.1','player.2']));assert.equal(simultaneous.calls.length,1);
 let power=false;const coop=interaction('Cooperative',{participants:1,cooperate:()=>power});coop.service.resolve(requests(['player.1']));assert.equal(coop.calls.length,0);power=true;coop.service.resolve(requests(['player.1']));assert.equal(coop.calls.length,1);
});
test('queued interaction waits for release and revalidates range; disconnected actors are removed',()=>{
 let available=true;const {service,calls}=interaction('Queued',{canInteract:()=>available});service.resolve(requests(['player.2','player.1']));assert.deepEqual(calls,[['player.1']]);
 service.resolve([]);assert.equal(calls.length,1);service.releaseActor('player.1');service.resolve([]);assert.deepEqual(calls[1],['player.2']);
 service.resolve(requests(['player.1']));available=false;service.releaseActor('player.2');assert.equal(service.resolve([])[0].reason,'denied');
 service.clear();assert.equal(service.resolve(requests(['player.1']))[0].reason,'missing');
});
test('interaction exceptions release exclusive claims; World and Team claims require their actual owner to release',()=>{
 const {service}=interaction('Exclusive',{execute:()=>{throw Error('broken')}});assert.throws(()=>service.resolve(requests(['player.1'])));assert.equal(service.ownership.owner('switch'),'None');
 const claims=new OwnershipService();assert.equal(claims.claim('gate','team','Team'),true);assert.equal(claims.claim('gate','player.1','Player1'),false);claims.release('gate','player.1');assert.equal(claims.owner('gate'),'Team');claims.releaseActor('team');assert.equal(claims.owner('gate'),'None');
});
test('feedback targets only the intended controllers and sends semantic presentation IDs',()=>{
 const rumble=[],audio=[];const feedback=new FeedbackService({ui(){},rumble:id=>rumble.push(id),audio:(id,target)=>audio.push([id,target])},()=>({shake:0,vibration:true}));
 feedback.request({kind:'failure',target:'Player2'});assert.deepEqual(rumble,[2]);feedback.request({kind:'success',target:'AllPlayers'});assert.deepEqual(rumble,[2,1,2]);
 feedback.request({kind:'pickup',target:'World'});assert.equal(rumble.length,3);assert.deepEqual(audio[0],['interaction.fail','Player2']);
});
test('HUD model exports semantic prompts and context without UI or localization dependencies',()=>{
 const {coopViewModel}=core('core/GameHUDViewModel'),{CoopChallenge}=core('core/CoopChallenge'),{COOP_LEVEL}=core('content/CoopLevel');
 const c=new CoopChallenge(COOP_LEVEL.coop,18),actors=[{playerId:1,x:-335,y:0,interact:false},{playerId:2,x:240,y:0,interact:false}];c.update(actors,false);
 const model=coopViewModel(c,actors,true);assert.equal(model.players[0].promptId,'coop.keepPlate');assert.equal(model.players[1].promptId,'coop.useTerminal');assert.deepEqual(model.notifications,['coop.separated']);
});

test('real gamepad adapter keeps independent menu edges and removes disconnected source',()=>{
 const fs=require('fs'),path=require('path'),vm=require('vm'),ts=require('typescript'),exports={};
 const js=ts.transpileModule(fs.readFileSync('assets/platform/CocosGamepadAdapter.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText;
 vm.runInNewContext(js,{exports,require:id=>id==='cc'?{input:{on(){},off(){}},Input:{EventType:{GAMEPAD_INPUT:'input',GAMEPAD_CHANGE:'change'}}}:require(path.resolve('temp/core-tests/platform',id))});
 function pad(id){const state={south:0};const source={deviceId:id,connected:true,dpad:{getValue:()=>({x:0,y:0})},leftStick:{getValue:()=>({x:0,y:0})}};
 for(const name of ['South','East','West','North','L1','R1','L2','R2','L3','R3','Share','Options','Start'])source['button'+name]={getValue:()=>name==='South'?state.south:0};return{state,source};}
 const a=pad(0),b=pad(1),adapter=new exports.CocosGamepadAdapter(()=>{});adapter.onPad({gamepad:a.source});adapter.onPad({gamepad:b.source});
 a.state.south=1;let frames=adapter.menuInputs();assert.equal(frames[0].input.accept,true);assert.equal(frames[1].input.accept,false);
 b.state.south=1;frames=adapter.menuInputs();assert.equal(frames[0].input.accept,false);assert.equal(frames[1].input.accept,true);
 a.source.connected=false;adapter.onPad({gamepad:a.source});assert.equal(adapter.connectedIds.length,1);assert.equal(adapter.menuInputs()[0].deviceId,frames[1].deviceId);
});

test('mixed keyboard and gamepad interaction prompts use each player device rather than last menu source',()=>{
 const {InputGlyphService}=core('runtime/InputGlyphService'),{LocalizationService}=core('services/LocalizationService'),{createSettingsRegistry}=core('settings/DefaultSettings');
 const glyphs=new InputGlyphService(new LocalizationService(),()=>createSettingsRegistry().defaults());glyphs.activeDevice='gamepad';
 assert.equal(glyphs.get('interact',1,'keyboard'),'[E]');assert.equal(glyphs.get('interact',2,'keyboard'),'[L]');assert.equal(glyphs.get('interact',2,'gamepad'),'[手柄左方键]');
});
