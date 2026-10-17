const fs=require('fs'),vm=require('vm'),assert=require('assert');
let requests=[],controls=[],windows=[],alerts=[],saved=0;
function Control(c){Object.assign(this,c);this.events={};this.on=(event,fn)=>this.events[event]=fn;this.setReadOnly=v=>this.readOnly=v;controls.push(this);this.getValue=()=>this.value===undefined?'':this.value;this.setValue=v=>this.value=v;this.isValid=()=>{if(this.allowBlank===false&&!String(this.getValue()).trim())return false;return !this.validator||this.validator(this.getValue())===true;};}
function Store(c){this.records=(c.data||[]).map(row=>{let values={...row};return{get:k=>values[k],set:(k,v)=>values[k]=v};});this.each=fn=>this.records.forEach(fn);}
const Ext={util:{Format:{htmlEncode:s=>String(s).replace(/</g,'&lt;')}},each:(a,f)=>a.forEach(f),decode:JSON.parse,encode:JSON.stringify,
 form:{TextField:Control,TextArea:Control,NumberField:Control,ComboBox:Control},data:{SimpleStore:function(){},JsonStore:Store},
 grid:{EditorGridPanel:function(c){Object.assign(this,c);this.stopEditing=()=>{};this.events={};this.on=(event,fn)=>this.events[event]=fn;this.getView=()=>({refresh:()=>{}});}},TabPanel:function(c){Object.assign(this,c);},
 Button:function(c){Object.assign(this,c);this.disable=()=>this.disabled=true;this.enable=()=>this.disabled=false;},
 Window:function(c){Object.assign(this,c);windows.push(this);this.show=()=>{};this.close=()=>this.closed=true;this.getEl=()=>({mask:()=>{},unmask:()=>{}});},
 getBody:()=>({getViewSize:()=>({width:1280,height:900})}),Ajax:{request:c=>requests.push(c)},Msg:{alert:(a,b)=>alerts.push(b)}};
vm.runInNewContext(fs.readFileSync(require('path').join(__dirname,'../public/supplies/sp/tor/checkingAdmin.js'),'utf8'),{Ext,setTimeout:()=>1,clearTimeout:()=>{}});
Ext.editCheckingOverview(6881,()=>saved++);
assert.equal(requests[0].params.sp_check_period_hdr_id,6881);
const data={success:true,csrf_token:'TOKEN',keys:{sp_check_period_hdr:'sp_check_period_hdr_id',sp_check_period_dtl:'sp_check_period_dtl_id',sp_tranf_item:'sp_tranf_item_id'},fields:{sp_check_period_hdr:{c_egp_no:['เลขที่ EGP','text','ข้อมูลตรวจรับ'],d_checking_date:['วันที่ตรวจรับ','date','ข้อมูลตรวจรับ'],i_yyyy:['ปีงบประมาณ','year','ข้อมูลตรวจรับ'],f_pay:['ยอดจ่าย','money','เงิน / ภาษี'],i_is_warranty:['รับประกัน','choice','รับประกัน',{0:'ไม่มี',1:'มี'}]},sp_check_period_dtl:{c_name:['รายการ','text'],i_qty:['จำนวน','quantity']},sp_tranf_item:{f_net_total_price:['ยอดตั้งหนี้','money']}},data:{sp_check_period_hdr:[{sp_check_period_hdr_id:6881,c_code:'CHK',c_egp_no:'OLD',d_checking_date:'2026-10-02',i_yyyy:2027,f_pay:'100.00',i_is_warranty:0}],sp_check_period_dtl:[{sp_check_period_dtl_id:1,c_name:'ITEM',i_qty:1}],sp_tranf_item:[{sp_tranf_item_id:2,f_net_total_price:'100.00'}]}};
requests[0].callback({},true,{responseText:JSON.stringify(data)});
let win=windows[0],save=win.buttons[0];
assert.equal(controls.find(x=>x.fieldLabel==='วันที่ตรวจรับ').getValue(),'02-10-2569');
assert.equal(controls.find(x=>x.fieldLabel==='ปีงบประมาณ').getValue(),2570);
controls.find(x=>x.fieldLabel==='เลขที่ EGP').setValue('NEW');
save.handler();assert.equal(requests.length,1); // reason required
controls.find(x=>x.fieldLabel==='เหตุผลในการแก้ไข').setValue('Correct selected row');
controls.find(x=>x.fieldLabel==='วันที่ตรวจรับ').setValue('31-02-2569');save.handler();assert.equal(requests.length,1);
controls.find(x=>x.fieldLabel==='วันที่ตรวจรับ').setValue('03-10-2569');
win.items[0].items.find(x=>x.title==='รายการตั้งหนี้').store.records[0].set('f_net_total_price','120.00');
save.handler();assert.equal(requests.length,2);
const payload=requests[1].params,changes=JSON.parse(payload.changes);
assert.equal(payload.csrf_token,'TOKEN');assert.equal(payload.sp_check_period_hdr_id,6881);
assert(changes.some(x=>x.field==='d_checking_date'&&x.new_value==='2026-10-03'));
assert(changes.some(x=>x.table==='sp_tranf_item'&&x.row_id===2&&x.old_value==='100.00'&&x.new_value===120));
assert(!changes.some(x=>x.field==='i_yyyy')); // unchanged Buddhist year does not become a write
requests[1].callback({},false,{responseText:JSON.stringify({success:false,msg:'conflict'})});
assert(!win.closed);assert.equal(saved,0);assert(!save.disabled);
save.handler();requests[2].callback({},true,{responseText:JSON.stringify({success:true,msg:'saved'})});
assert(win.closed);assert.equal(saved,1);
console.log('PASS: admin form tabs, selected row, Thai dates/year, required reason, validation, line edits, failure retention, save callback');
const begin=requests.length,controlBegin=controls.length;
Ext.editCheckingOverview(6881,()=>saved++);
const finance=JSON.parse(JSON.stringify(data));finance.finance_token='FINANCE_SNAPSHOT';
Object.assign(finance.fields.sp_check_period_hdr,{
 f_total:['ยอดรวม','money','เงิน / ภาษี'],f_inv_vat:['ขอเบิก','money','เงิน / ภาษี'],f_total_add_vat_amt:['ก่อน VAT','money','เงิน / ภาษี'],
 f_vat_amt:['VAT','money','เงิน / ภาษี'],f_tax_personal:['Tax','money','เงิน / ภาษี'],f_warranty:['ประกันผลงาน','money','เงิน / ภาษี'],f_fine_amt:['ค่าปรับ','money','เงิน / ภาษี'],
 i_edit_vat:['กำหนด VAT เอง','choice','เงิน / ภาษี',{0:'อัตโนมัติ',1:'กำหนดเอง'}]
});
Object.assign(finance.data.sp_check_period_hdr[0],{f_total:'107.00',f_inv_vat:'107.00',f_total_add_vat_amt:'100.00',f_vat_amt:'7.00',f_tax_personal:'1.00',f_warranty:0,f_fine_amt:0,i_edit_vat:'false'});
requests[begin].callback({},true,{responseText:JSON.stringify(finance)});
const financialControls=controls.slice(controlBegin),find=label=>financialControls.find(x=>x.fieldLabel===label);
win=windows[1];save=win.buttons[0];
assert(find('ยอดจ่าย').readOnly);assert.equal(find('กำหนด VAT เอง').getValue(),0);
find('เหตุผลในการแก้ไข').setValue('Recalculate all amounts');find('ยอดรวม').setValue(214);find('ยอดรวม').events.change();
find('วิธีคิดค่าปรับ').setValue('percent');find('อัตราค่าปรับ (%)').setValue(2);find('วิธีคิดค่าปรับ').events.select();
save.handler();
let preview=requests[requests.length-1];assert.equal(preview.params.mode,'calculate');assert.equal(preview.params.finance_token,'FINANCE_SNAPSHOT');
assert.equal(JSON.parse(preview.params.finance_source).kind,'header');assert.equal(JSON.parse(preview.params.fine_calculation).rate,2);
const computed=JSON.parse(JSON.stringify(finance.data));
Object.assign(computed.sp_check_period_hdr[0],{f_total:'214.00',f_inv_vat:'214.00',f_total_add_vat_amt:'200.00',f_vat_amt:'14.00',f_tax_personal:'2.00',f_warranty:'10.70',f_fine_amt:'4.28',f_pay:'197.02',i_edit_vat:0});
computed.sp_check_period_dtl[0].i_qty=2;computed.sp_tranf_item[0].f_net_total_price='214.00';
preview.callback({},true,{responseText:JSON.stringify({success:true,data:computed})});
assert.equal(find('ยอดจ่าย').getValue(),'197.02');
const financeSave=requests[requests.length-1];assert(!financeSave.params.mode);
const financeChanges=JSON.parse(financeSave.params.changes);
for(const name of ['f_total','f_inv_vat','f_total_add_vat_amt','f_vat_amt','f_tax_personal','f_warranty','f_fine_amt','f_pay'])assert(financeChanges.some(x=>x.field===name),name);
assert(financeChanges.some(x=>x.table==='sp_tranf_item'&&x.new_value===214));
assert.equal(financeSave.params.finance_token,'FINANCE_SNAPSHOT');
financeSave.callback({},true,{responseText:JSON.stringify({success:true,msg:'saved finance'})});
assert(win.closed);assert.equal(saved,2);
console.log('PASS: finance preview before save, read-only derived fields, legacy boolean flags, fine percentage, synchronized form/lines, and authoritative save context');
