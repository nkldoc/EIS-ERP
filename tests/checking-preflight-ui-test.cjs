const fs=require('fs'),vm=require('vm'),assert=require('assert'),path=require('path');
let pending,tabs,win,timers=[];
const Ext={util:{Format:{htmlEncode:v=>String(v).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'),number:v=>Number(v).toFixed(2)}},each:(a,fn)=>a.forEach(fn),decode:JSON.parse,
 TabPanel:function(c){tabs=this;this.setActiveTab=()=>{};c.items.forEach(item=>{item.update=function(html){this.html=html;};item.body={events:{},on:function(event,fn){this.events[event]=fn;},dom:{querySelector:()=>null,querySelectorAll:()=>[]}};});this.items={get:i=>c.items[i]};},
 Button:function(c){Object.assign(this,c);this.setDisabled=v=>this.disabled=v;this.setVisible=v=>this.visible=v;},Window:function(c){Object.assign(this,c);win=this;this.show=()=>{};},
 getBody:()=>({getViewSize:()=>({width:1200,height:800})}),Ajax:{request:c=>pending=c},Msg:{alert:()=>{}}};
vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../public/supplies/sp/tor/contractDetails.js'),'utf8'),{Ext,copyToClipboard:()=>{},setTimeout:fn=>timers.push(fn)});
const record={get:key=>key==='sp_tor_contract_id'?7:'CONTRACT'};
Ext.showContractDetails(record,{initialTab:3,sp_check_period_hdr_id:21});
const data={success:true,pr:[],funds:[],items:[],bidders:[],bidderGuarantees:[],contracts:[],contractFunds:[],periods:[],periodItems:[],checks:[{sp_check_period_hdr_id:21,payment_period:2,c_code:'CHECK-21'}],checkItems:[],debtItems:[]};
pending.callback({},true,{responseText:JSON.stringify(data)});
const panel=tabs.items.get(4);assert(panel.html.includes('วิเคราะห์ก่อนส่งเบิก'));
const select={value:'21'},output={innerHTML:''},button={disabled:false,textContent:''};
panel.body.dom.querySelector=selector=>selector.includes('select')?select:output;
panel.body.events.click({},button);
assert.equal(pending.params.preflight,1);assert.equal(pending.params.sp_check_period_hdr_id,21);assert.equal(pending.params.sp_tor_contract_id,7);assert(button.disabled);
const analysis={check_code:'CHECK<script>',payment_period:2,analyzed_at:'17-10-2569',blocked:1,warnings:1,ready:false,rules:[]};
for(let i=0;i<5;i++)analysis.rules.push({title:'RULE_'+i,status:i===0?'block':i===1?'warning':'pass',message:'EXPLANATION_'+i,evidence:['EVIDENCE_'+i],action:i===0?'ACTION_<unsafe>':''});
pending.callback({},true,{responseText:JSON.stringify({success:true,analysis})});
assert(output.innerHTML.includes('RULE_0'));assert(!output.innerHTML.includes('RULE_1'));
while(timers.length)timers.shift()();
for(let i=0;i<5;i++)assert(output.innerHTML.includes('RULE_'+i));
assert(output.innerHTML.includes('1 ข้อที่ต้องแก้ไข'));assert(output.innerHTML.includes('1 ข้อที่ต้องตรวจสอบเพิ่ม'));
assert(output.innerHTML.includes('CHECK&lt;script&gt;'));assert(!output.innerHTML.includes('<script>'));
assert(!button.disabled);assert.equal(button.textContent,'วิเคราะห์อีกครั้ง');
panel.body.events.click({},button);pending.callback({},false,{responseText:'invalid'});
assert(output.innerHTML.includes('วิเคราะห์ไม่สำเร็จ'));assert(!button.disabled);
panel.body.events.click({},button);pending.callback({},true,{responseText:JSON.stringify({success:true,analysis})});
win.isDestroyed=true;const before=output.innerHTML;while(timers.length)timers.shift()();assert.equal(output.innerHTML,before);
console.log('PASS: selected-row analysis request, five sequential cards, evidence/actions, escaped text, summary, retry, and closed-window cancellation');
