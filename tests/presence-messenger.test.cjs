'use strict';
const {test} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const source = name => fs.readFileSync(path.join(__dirname, '../public/supplies/assets/js', name), 'utf8');
const flush = async () => { for (let i = 0; i < 12; i++) await Promise.resolve(); };

function timers() {
  let id = 0; const pending = new Map();
  return {
    pending,
    setTimeout(fn, ms) { pending.set(++id, {fn, ms}); return id; },
    clearTimeout(id) { pending.delete(id); },
    run(ms) { const entry = [...pending].find(([, t]) => t.ms === ms); assert.ok(entry, 'timer at ' + ms); pending.delete(entry[0]); entry[1].fn(); },
  };
}
function client(fetchImpl) {
  const clock = timers(), events = {}, sockets = [], notices = [], errors = [];
  const window = {EISPresenceConfig: {tokenUrl:'/token', loginUrl:'/login'}, addEventListener(type, fn) { events[type] = fn; }};
  class Socket {
    static OPEN = 1;
    constructor(url) { this.url = url; this.readyState = 0; this.sent = []; sockets.push(this); }
    send(data) { if (this.fail) throw Error('closed'); this.sent.push(JSON.parse(data)); }
    close() { this.readyState = 3; this.onclose?.(); }
    open() { this.readyState = 1; this.onopen(); }
    message(data) { this.onmessage({data:JSON.stringify(data)}); }
  }
  const navigator = {onLine:true};
  vm.runInNewContext(source('presence-client.js'), {
    window, navigator, document:{addEventListener(){}}, WebSocket:Socket, AbortController,
    fetch:fetchImpl || (async () => ({ok:true,status:200,json:async()=>({token:'test',url:'wss://test'})})),
    ...clock, Math:Object.assign(Object.create(Math), {random:()=>0}), console:{error(...args){errors.push(args);}},
  });
  window.EISPresence.on(type => notices.push(type));
  return {clock, events, sockets, notices, errors, window, navigator};
}
const authenticated = {type:'authenticated',identity:{system:'SUPPLIES',uid:'1',name:'User',admin:false}};

test('reconnect starts at 500ms, online event never opens parallel sockets, stale events are ignored', async () => {
  const h = client(); await flush(); const first = h.sockets[0]; first.open(); first.message(authenticated);
  assert.equal(h.window.EISPresence.send({type:'page'}), true);
  first.close(); h.clock.run(500); await flush();
  h.events.online(); h.events.online(); await flush(); assert.equal(h.sockets.length, 2);
  first.message(authenticated); assert.equal(h.notices.filter(n=>n==='connected').length, 1);
  h.sockets[1].open(); h.sockets[1].message(authenticated);
  assert.equal(h.notices.filter(n=>n==='connected').length, 2);
  assert.equal([...h.clock.pending.values()].filter(t=>t.ms===20000).length, 1);
});
test('offline aborts an in-flight token fetch and online starts only one replacement', async () => {
  let calls = 0;
  const h = client(async (_, options) => { calls++; if(calls>1)return {ok:true,status:200,json:async()=>({token:'test',url:'wss://test'})}; return new Promise((_,reject)=>options.signal.addEventListener('abort',()=>reject(Error('aborted')))); });
  h.navigator.onLine=false; h.events.offline(); await flush();
  assert.equal(h.clock.pending.size, 0);
  h.navigator.onLine=true; h.events.online(); h.events.online(); await flush();
  assert.equal(calls, 2); assert.equal(h.sockets.length, 1);
});
test('token timeout recovers and authentication timeout closes the stuck socket', async () => {
  const h = client((_, options) => new Promise((_, reject)=>options.signal.addEventListener('abort',()=>reject(Error('aborted')))));
  h.clock.run(8000); await flush(); assert.ok([...h.clock.pending.values()].some(t=>t.ms===500));
  const connected = client(); await flush(); connected.clock.run(10000);
  assert.equal(connected.sockets[0].readyState, 3);
  assert.ok([...connected.clock.pending.values()].some(t=>t.ms===500));
});
test('401, including a non-JSON body, stops retries permanently', async () => {
  const h = client(async()=>({ok:false,status:401,json:async()=>{throw Error('HTML body');}})); await flush();
  assert.ok(h.notices.includes('unauthorized')); assert.equal(h.clock.pending.size, 0);
  h.events.online(); await flush(); assert.equal(h.sockets.length, 0);
});
test('a chat loaded after authentication can detect that it missed the bootstrap events', async()=>{
 const h=client();await flush();h.sockets[0].open();h.sockets[0].message(authenticated);
 h.sockets[0].message({type:'chat-ready',capabilities:{conversations:true},rooms:[]});
 let replay;h.window.EISPresence.on((type,data)=>{if(type==='connected')replay=data.replay;});
 assert.equal(replay,true);
});
test('renewal has no overlap; send failure returns false; listener failure does not block authentication', async () => {
  let requests=0, resolve;
  const h=client(async()=>{requests++; if(requests===1)return {ok:true,status:200,json:async()=>({token:'test',url:'wss://test'})};return new Promise(r=>resolve=r);});
  h.window.EISPresence.on(()=>{throw Error('consumer failure');});
  await flush(); const s=h.sockets[0];s.open();s.message(authenticated);h.clock.run(20000);await flush();
  assert.equal(requests,2);assert.equal([...h.clock.pending.values()].filter(t=>t.ms===20000).length,0);
  resolve({ok:true,status:200,json:async()=>({token:'new',url:'wss://test'})});await flush();
  assert.equal(s.sent.at(-1).type,'renew');assert.equal(h.errors.length,1);
  s.fail=true;assert.equal(h.window.EISPresence.send({type:'chat-send'}),false);
  h.window.EISPresence.logout();h.events.online();await flush();assert.equal(h.sockets.length,1);
});

class Element {
  constructor(tag='div') { this.tag=tag;this.children=[];this.className='';this.scrollTop=0;this.clientHeight=100;this.value='';this.hidden=false;this.classList={add:()=>{},toggle:()=>{}}; }
  get firstChild(){return this.children[0]||null;}
  get nextSibling(){return this.parent?.children[this.parent.children.indexOf(this)+1]||null;}
  get scrollHeight(){return this.children.length*100;}
  append(...nodes){nodes.forEach(node=>this.insertBefore(node,null));}
  appendChild(node){this.append(node);}
  insertBefore(node,next){node.remove();const i=next?this.children.indexOf(next):this.children.length;this.children.splice(i,0,node);node.parent=this;}
  remove(){if(this.parent){this.parent.children.splice(this.parent.children.indexOf(this),1);this.parent=null;}}
  replaceWith(node){const parent=this.parent,next=this.nextSibling;this.remove();parent.insertBefore(node,next);}
  replaceChildren(...nodes){this.children.forEach(n=>n.parent=null);this.children=[];this.append(...nodes);}
  before(node){this.parent.insertBefore(node,this);}
  add(node){this.append(node);}
  setAttribute(){} removeAttribute(){} addEventListener(){} focus(){} show(){this.open=true;} close(){this.open=false;}
  querySelectorAll(selector){const found=[];for(const n of this.children){if(selector==='.'+n.className)found.push(n);found.push(...n.querySelectorAll(selector));}return found;}
}
function chat(script = source('presence-chat.js')){
  const frames=[], sent=[], clock=timers(), body=new Element('body'), selectors=new Map();let listener,creates=0;
  const get=q=>{if(!selectors.has(q)){const e=new Element();selectors.set(q,e);}return selectors.get(q);};
  const document={body,visibilityState:'visible',addEventListener(){},getElementById(){return null;},createElement(tag){creates++;const e=new Element(tag);if(tag==='dialog'){e.querySelector=get;Object.defineProperty(e,'innerHTML',{set(){e.append(get('.eis-chat-controls'),get('.eis-chat-log'));}});}return e;}};
  const window={EISPresence:{send(value){sent.push(value);return true;},on(fn){listener=fn;}}};
  vm.runInNewContext(script,{window,document,Option:class extends Element{constructor(text,value){super('option');this.textContent=text;this.value=value;}},requestAnimationFrame(fn){frames.push(fn);return frames.length;},location:{pathname:'/supplies/'},crypto:{randomUUID:()=> 'draft-id'},...clock,console});
  return {window,sent,clock,get,body,emit:(type,data)=>listener(type,data),frames:()=>{while(frames.length)frames.shift()();},creates:()=>creates,log:get('.eis-chat-log'),dialog:body.children[1]};
}
const room={id:'all',title:'All'};
const message=(seq,roomId='all')=>({id:'m'+seq,seq,room:roomId,text:'Message '+seq,at:0,sender:{key:'["SUPPLIES","2"]',system:'SUPPLIES',name:'Other'}});
const replay=(h,m,r=room)=>h.emit('chat-message',{message:m,room:r,replay:true,unread:true});

test('server replay sends no redundant sync and creates no message DOM while closed',()=>{
  const h=chat();h.emit('connected',authenticated);const count=h.creates();
  for(let i=1;i<=40;i++)replay(h,message(i));h.frames();
  assert.equal(h.sent.filter(x=>x.type==='chat-sync').length,0);assert.equal(h.log.children.length,0);assert.equal(h.dialog.open,undefined);
  // Only one options refresh runs for the entire replay burst.
  assert.equal(h.creates(),count);
  h.window.EISChat.all();h.frames();assert.equal(h.log.children.length,40);
});
test('duplicate replay reuses nodes; one live message keeps scroll position; retraction replaces only its node',()=>{
  const h=chat();h.emit('connected',authenticated);for(let i=1;i<=5;i++)replay(h,message(i));h.window.EISChat.all();h.frames();
  const nodes=[...h.log.children];h.log.scrollTop=100;
  replay(h,message(3));replay(h,message(6));h.frames();
  assert.equal(h.log.scrollTop,100);assert.equal(h.log.children.length,6);assert.equal(h.log.children[2],nodes[2]);
  h.emit('chat-retracted',{room,message:{...message(3),text:'Withdrawn',retractedAt:1}});h.frames();
  assert.notEqual(h.log.children[2],nodes[2]);assert.equal(h.log.children[0],nodes[0]);
  h.emit('disconnected');h.frames();assert.equal(h.log.children.length,6);
});
test('job history is fetched once on open, pages merge in sequence, and prepend preserves reading position',()=>{
  const h=chat(), job={id:'job',job:true,title:'Job',people:[{system:'SUPPLIES',uid:'1',name:'User'},{system:'SUPPLIES',uid:'2',name:'Other'}]};
  h.emit('connected',authenticated);h.emit('chat-ready',{rooms:[room,job]});h.window.EISChat.room(job);h.window.EISChat.room(job);
  assert.equal(h.sent.filter(x=>x.type==='chat-job-detail').length,1);
  h.emit('chat-job-detail',{room:job,messages:[message(4,'job'),message(5,'job')],more:true});h.frames();
  const older=h.dialog.children.find(n=>n.className==='eis-chat-older');assert.equal(older.hidden,false);
  h.log.scrollTop=20;older.onclick();older.onclick();assert.equal(h.sent.filter(x=>x.type==='chat-job-detail').length,2);assert.equal(h.sent.at(-1).before,4);
  h.emit('chat-job-detail',{room:job,messages:[message(2,'job'),message(3,'job')],more:false});h.frames();
  assert.equal(h.log.children.length,4);assert.equal(h.log.scrollTop,220);assert.equal(older.hidden,true);
  h.window.EISChat.room(job);assert.equal(h.sent.filter(x=>x.type==='chat-job-detail').length,2);
});
test('reconnect retains visible history until authoritative detail arrives; unauthorized clears the UI',()=>{
  const h=chat(),job={id:'job',ticket:true,title:'Job',people:[]};h.emit('connected',authenticated);h.emit('chat-ready',{rooms:[room,job]});h.window.EISChat.room(job);
  h.emit('chat-job-detail',{room:job,messages:[message(1,'job')],more:false});h.frames();
  h.emit('disconnected');h.emit('connected',authenticated);h.frames();assert.equal(h.log.children.length,1);
  h.emit('chat-job-detail',{room:job,messages:[message(8,'job')],more:true});h.frames();assert.equal(h.log.children.length,1);assert.equal(h.log.children[0].children[1].textContent,'Message 8');
  h.emit('unauthorized');h.frames();assert.equal(h.log.children.length,0);assert.equal(h.dialog.open,false);assert.equal(h.body.children[0].hidden,true);
});

test('clicking a user opens their existing private room, keeps systems separate, and allows offline targets',()=>{
  for(const script of [source('presence-chat.js'),fs.readFileSync('D:/EIS-DOCS/app/public/assets/js/presence-chat.js','utf8')]){
    const h=chat(script),person={system:'SUPPLIES',uid:'2',name:'Other'};
    const job={id:'conversation-existing',conversation:true,title:'Existing',people:[authenticated.identity,person],members:['["SUPPLIES","1"]','["SUPPLIES","2"]']};
    h.emit('connected',authenticated);h.emit('chat-ready',{rooms:[room,job]});
    h.window.EISChat.private(person);h.frames();
    assert.equal(h.get('[data-rooms]').value,job.id);
    assert.ok(h.sent.some(m=>m.type==='chat-job-detail'&&m.room===job.id));
    // Same numeric ID in the other system is a different participant.
    h.window.EISChat.private({...person,system:'EIS-DOCS'});h.frames();
    assert.equal(h.get('[data-rooms]').value,'new');
  }
});

test('both roles see separate room lists; general team and ticket creation send distinct commands',()=>{
  const h=chat(),ticket={id:'ticket-1',ticket:true,title:'Issue',people:[]},general={id:'conversation-1',conversation:true,team:true,title:'General',people:[authenticated.identity],members:['["SUPPLIES","1"]']};
  h.emit('connected',authenticated);h.emit('chat-ready',{capabilities:{conversations:true},rooms:[room,ticket,general]});h.frames();
  const values=()=>h.get('[data-rooms]').children.map(n=>n.value),tabs=h.dialog.children.find(n=>n.className==='eis-chat-modes').children;
  assert.deepEqual(values(),['all',general.id]);assert.equal(h.get('[data-support]').hidden,true);
  tabs[1].onclick();h.frames();assert.deepEqual(values(),[ticket.id]);assert.equal(h.get('[data-support]').hidden,false);
  h.get('[data-support]').onclick();h.frames();h.get('textarea').value='Problem';h.get('form').onsubmit({preventDefault(){}});
  const support=h.sent.at(-1);assert.equal(support.support,true);assert.equal(support.conversation,undefined);
  h.emit('chat-sent',{clientId:support.clientId,room:ticket.id,delivered:0});
  tabs[0].onclick();h.frames();assert.deepEqual(values(),['all',general.id]);
  const team=h.dialog.children.find(n=>n.className==='eis-chat-team-start');team.onclick();h.frames();assert.equal(h.get('[data-rooms]').value,general.id);
  const fresh=chat();fresh.emit('connected',authenticated);fresh.emit('chat-ready',{capabilities:{conversations:true},rooms:[room]});fresh.frames();
  fresh.dialog.children.find(n=>n.className==='eis-chat-team-start').onclick();fresh.frames();fresh.get('textarea').value='Hello';fresh.get('form').onsubmit({preventDefault(){}});
  assert.equal(fresh.sent.at(-1).generalTeam,true);assert.equal(fresh.sent.at(-1).conversation,true);assert.equal(fresh.sent.at(-1).support,undefined);
  const admin=chat();admin.emit('connected',{...authenticated,identity:{...authenticated.identity,admin:true}});admin.emit('chat-ready',{capabilities:{conversations:true},rooms:[room,ticket,general]});admin.frames();
  admin.dialog.children.find(n=>n.className==='eis-chat-modes').children[1].onclick();admin.frames();
  assert.equal(admin.get('[data-inbox]').hidden,false);assert.equal(admin.get('[data-recipient-label]').hidden,true);assert.equal(admin.get('[data-support]').hidden,true);
});
test('general chat creation never falls back to a legacy ticket on a server without channel support',()=>{
  const h=chat();h.emit('connected',authenticated);h.emit('chat-ready',{rooms:[room]});h.frames();
  h.dialog.children.find(n=>n.className==='eis-chat-team-start').onclick();h.get('textarea').value='Hello';h.get('form').onsubmit({preventDefault(){}});
  assert.equal(h.sent.filter(m=>m.type==='chat-send').length,0);
});
test('a late chat subscriber requests the missed readiness and history exactly once',()=>{
 const h=chat();h.emit('connected',{...authenticated,replay:true});
 assert.equal(h.sent.filter(m=>m.type==='chat-sync').length,1);
 h.emit('chat-ready',{capabilities:{conversations:true},rooms:[room]});h.frames();
 h.dialog.children.find(n=>n.className==='eis-chat-team-start').onclick();h.get('textarea').value='Hello';h.get('form').onsubmit({preventDefault(){}});
 assert.equal(h.sent.at(-1).generalTeam,true);
});
