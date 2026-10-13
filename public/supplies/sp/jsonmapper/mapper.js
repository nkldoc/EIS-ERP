'use strict';
const $ = id => document.getElementById(id);
let data=null, fields=[], columns=[], tables=[], mappings=new Map(), output=null, requestVersion=0, tableRequestVersion=0, selectedTables=new Set(), columnsLoading=false, appliedTableFilter='', jsonDirty=false;
const sample={pr_id:1768,po_id:448,period_id:4082,chk_id:5,c_contract_code:'1C103/2568',d_start_date:'2025-03-27',d_contract_start_date:'2025-03-27',d_end_date:'2025-12-31',i_period:0,f_period_amt:17013,bg_expense_id:133,bg_expense_name:'Test -ค่ายาและเวชภัณฑ์ อวัยวะเทียม',dc_expense_budget_type_id:2,dc_expense_budget_type_name:'[10701] เงินรายได้คณะแพทย์ฯ-โรงพยาบาล',i_is_last:0,i_product_type:1,dc_cost_id:82,c_tax_number_imp:'0105523002118',dc_creditor_id:267,dc_creditor_idTxt:'บริษัท ดีเคเอสเอช (ประเทศไทย) จำกัด',dc_creditor_transfer_code:'0105523002118',dc_creditor_transfer_id:267,dc_creditor_transfer_idTxt:'บริษัท ดีเคเอสเอช (ประเทศไทย) จำกัด',dc_bank_acc_creditor_id:'ธนาคารกสิกรไทย จำกัด (มหาชน)',i_budget_year:'2025',i_budget_year_overlap:'',c_arrive_code:'210309/IN/69000451-0003',d_arrive_date:'2026-05-21',d_checking_date:'2026-05-21',i_reserve_pay:'',i_doc_duo:'',c_doc_ref:false,user_id:2,user_name:'Admin ERP',c_overlap:'',line_ids:[{c_doc_ref:'BL-inv-0003',d_doc_dateSub:'2026-05-21',f_period_amt:17013,chk_line_id:2652}]};
function status(message,error=false){$('status').textContent=message;$('status').className=error?'error':'';}
function invalidate(){output=null;$('copy').disabled=true;$('download').disabled=true;$('preview').textContent='ยังไม่มี SQL — กดสร้าง SQL เพื่ออัปเดต';}
function option(value,label){const o=document.createElement('option');o.value=value;o.textContent=label;return o;}
function flatten(obj,path=[],result=[]){Object.entries(obj).forEach(([key,value])=>{const p=[...path,key];if(value!==null&&typeof value==='object'&&!Array.isArray(value))flatten(value,p,result);else if(!Array.isArray(value))result.push({path:p,value});});return result;}
function get(obj,path){return path.reduce((v,k)=>v!=null&&Object.prototype.hasOwnProperty.call(v,k)?v[k]:undefined,obj);}
function rows(){const selected=$('source').value;return selected?get(data,JSON.parse(selected)):(Array.isArray(data)?data:[data]);}
function writable(c){return !Number(c.is_identity)&&!Number(c.is_computed)&&!Number(c.generated_always_type)&&!['timestamp','rowversion'].includes(c.type);}
function linkedBill(){return ['sp_tor_period_bill','sp_tor_period_bill_receive'].every(name=>chosenTables().some(t=>t.schema==='dbo'&&t.name===name));}
function generatedBillRef(c){return linkedBill()&&c.schema==='dbo'&&c.table==='sp_tor_period_bill_receive'&&c.name==='sp_tor_period_bill_id';}
function required(c){return !generatedBillRef(c)&&writable(c)&&!Number(c.is_nullable)&&!Number(c.default_object_id);}
function buildFields(){fields=[];mappings.clear();invalidate();const seen=new Set();const add=(obj,scope)=>flatten(obj).forEach(f=>{const id=JSON.stringify([scope,...f.path]);if(!seen.has(id)){seen.add(id);fields.push({...f,id,scope,label:(scope==='root'?'root.':'')+f.path.join('.')});}});rows().forEach(r=>add(r,'row'));if($('source').value)add(data,'root');render();}
function parse(){const previousMappings=new Map(mappings),previousSource=$('source').value;try{const parsed=JSON.parse($('json').value);if(!parsed||typeof parsed!=='object')throw Error('JSON ต้องเป็น object หรือ array ของ object');const valid=a=>a.every(x=>x&&typeof x==='object'&&!Array.isArray(x));if(Array.isArray(parsed)&&!valid(parsed))throw Error('แต่ละรายการต้องเป็น object');data=parsed;$('source').replaceChildren(option('',Array.isArray(data)?'รายการหลัก (root array)':'ข้อมูลหลัก (root)'));function arrays(obj,path=[]){Object.entries(obj).forEach(([k,v])=>{const p=[...path,k];if(Array.isArray(v)&&valid(v))$('source').append(option(JSON.stringify(p),p.join('.')+' ('+v.length+' รายการ)'));else if(v&&typeof v==='object'&&!Array.isArray(v))arrays(v,p);});}if(!Array.isArray(data))arrays(data);if(Array.from($('source').options).some(o=>o.value===previousSource))$('source').value=previousSource;buildFields();fields.forEach(f=>{const stored=previousMappings.get(f.id);const targets=(Array.isArray(stored)?stored:(stored?[stored]:[])).filter(key=>columns.some(c=>c.key===key&&writable(c)));if(targets.length)mappings.set(f.id,targets);});jsonDirty=false;render();status('อ่าน JSON สำเร็จ — '+rows().length+' รายการ');return true;}catch(e){data=null;fields=[];mappings=previousMappings;jsonDirty=true;invalidate();render();status(e.message,true);return false;}}
function targetsFor(id){const value=mappings.get(id);return Array.isArray(value)?value:(value?[value]:[]);}
function mappingPairs(){return [...mappings.keys()].flatMap(id=>targetsFor(id).filter(Boolean).map(key=>[id,key]));}
function destinationEditor(field){
 const wrap=document.createElement('div');
 function draw(){wrap.replaceChildren();const targets=targetsFor(field.id);const slots=targets.length?targets:[''];slots.forEach((key,index)=>{const row=document.createElement('div');row.className='destination-row';row.append(columnPicker(field,index));const remove=document.createElement('button');remove.className='secondary';remove.textContent='ลบปลายทาง';remove.disabled=columnsLoading;remove.onclick=()=>{const next=targetsFor(field.id).slice();next.splice(index,1);if(next.length)mappings.set(field.id,next);else mappings.delete(field.id);invalidate();counts();draw();};row.append(remove);wrap.append(row);});const add=document.createElement('button');add.className='secondary';add.textContent='+ เพิ่ม MSSQL column';add.disabled=columnsLoading;add.onclick=()=>{const next=targetsFor(field.id).slice();if(!next.length)next.push('');next.push('');mappings.set(field.id,next);draw();};wrap.append(add);}
 draw();return wrap;
}
function render(){const body=$('mapping');body.replaceChildren();const filter=$('search').value.toLowerCase();fields.filter(f=>f.label.toLowerCase().includes(filter)).forEach(f=>{const tr=document.createElement('tr');[f.label,f.value===null?'null':typeof f.value,JSON.stringify(f.value)].forEach(v=>{const td=document.createElement('td');td.textContent=v;tr.append(td);});const td=document.createElement('td');td.append(destinationEditor(f));tr.append(td);const actions=document.createElement('td');const edit=document.createElement('button'),remove=document.createElement('button');edit.textContent='แก้ไข';edit.className='secondary';edit.onclick=()=>editField(f);remove.textContent='ลบ';remove.className='secondary';remove.onclick=()=>deleteField(f);actions.append(edit,remove);tr.append(actions);body.append(tr);});if(!body.children.length){const tr=document.createElement('tr'),td=document.createElement('td');td.colSpan=5;td.className='empty';td.textContent='ยังไม่มีฟิลด์ หรือไม่พบฟิลด์ที่ค้นหา';tr.append(td);body.append(tr);}counts();}

function columnPicker(field,index=0){
 const wrap=document.createElement('div'),input=document.createElement('input'),list=document.createElement('select'),hint=document.createElement('span');
 wrap.className='column-picker';input.type='text';input.autocomplete='off';input.placeholder='พิมพ์ค้นหาคอลัมน์ / ตาราง…';input.setAttribute('aria-label','ค้นหา MSSQL column สำหรับ '+field.label);
 list.setAttribute('aria-label','ผลค้นหาคอลัมน์สำหรับ '+field.label);list.size=6;list.hidden=true;hint.className='hint';hint.hidden=true;
 input.disabled=columnsLoading;list.disabled=columnsLoading;
 const label=c=>c.schema+'.'+c.table+'.'+c.name;
 const current=()=>{const c=columns.find(c=>c.key===targetsFor(field.id)[index]);return c?label(c):'';};
 input.value=current();
 function filter(){
  const query=input.value.trim().toLowerCase();list.replaceChildren(option('','— ไม่ INSERT ฟิลด์นี้ —'));let count=0;
  chosenTables().forEach(t=>{const group=document.createElement('optgroup');group.label=t.schema+'.'+t.name;
   columns.filter(c=>writable(c)&&c.schema===t.schema&&c.table===t.name&&label(c).toLowerCase().includes(query)).forEach(c=>{group.append(option(c.key,c.name+' · '+c.type+(required(c)?' *':'')));count++;});
   if(group.children.length)list.append(group);
  });
  list.selectedIndex=-1;list.hidden=false;hint.hidden=false;hint.textContent=count?'พบ '+count+' คอลัมน์ — เลือกเพื่อยืนยัน':'ไม่พบคอลัมน์';
 }
 function close(){input.value=current();list.hidden=true;hint.hidden=true;}
 function choose(){if(list.selectedIndex<0)return;const next=targetsFor(field.id).slice();if(list.value&&next.some((key,i)=>i!==index&&key===list.value)){status('เลือกคอลัมน์นี้แล้ว',true);return;}next[index]=list.value;mappings.set(field.id,next);invalidate();counts();close();}
 input.onfocus=()=>{input.value='';filter();};input.oninput=filter;
 input.onkeydown=e=>{if(e.key==='ArrowDown'){e.preventDefault();if(list.hidden)filter();list.focus();list.selectedIndex=list.options.length>1?1:0;}else if(e.key==='Escape'){e.preventDefault();close();}};
 list.onclick=choose;
 list.onkeydown=e=>{if(e.key==='Enter'){e.preventDefault();choose();input.focus();close();}else if(e.key==='Escape'){e.preventDefault();input.focus();close();}};
 wrap.onfocusout=e=>{if(!wrap.contains(e.relatedTarget))close();};
 wrap.append(input,list,hint);return wrap;
}

function validationReport(){
 const sourceRows=data?rows():[];
 return chosenTables().map(t=>{
  const tableColumns=columns.filter(c=>c.schema===t.schema&&c.table===t.name),issues=[];
  const details=tableColumns.filter(writable).map(c=>{
   if(generatedBillRef(c))return {column:c,assigned:true,message:''};
   const assigned=fields.filter(f=>targetsFor(f.id).includes(c.key));let message='';
   if(!assigned.length){if(required(c))message='ยังไม่ได้ mapping';}
   else if(assigned.length>1)message='mapping ซ้ำ';
   else if(!sourceRows.length)message='ไม่มีข้อมูลสำหรับตรวจ';
   else {
    const bad=[];(linkedBill()&&t.name==='sp_tor_period_bill'?[data]:sourceRows).forEach((r,index)=>{const value=get(assigned[0].scope==='root'?data:r,assigned[0].path);
     if(value===undefined||(value===null&&!Number(c.is_nullable))||(!Number(c.is_nullable)&&typeof value==='string'&&!value.trim())||(value!==null&&typeof value==='object'))bad.push(index+1);
    });if(bad.length)message='ค่าไม่ครบ/ไม่ถูกต้อง แถว '+bad.join(', ');
   }
   if(message)issues.push(c.name+': '+message);
   return {column:c,assigned:assigned.length>0,message};
  });
  if(!details.some(d=>d.assigned))issues.push('ยังไม่มี field ที่ mapping สำหรับตารางนี้');
  return {table:t,details,issues};
 });
}
function counts(){
 $('fieldCount').textContent=fields.length;$('columnCount').textContent=columns.length;$('mappedCount').textContent=mappingPairs().length;
 const panel=$('required');panel.replaceChildren();
 if(columnsLoading){panel.textContent='กำลังตรวจโครงสร้างตาราง…';return;}
 validationReport().forEach(report=>{
  const box=document.createElement('div'),title=document.createElement('strong'),list=document.createElement('ul');box.className='validation-table';
  title.textContent=report.table.schema+'.'+report.table.name+' — '+(report.issues.length?'ยังไม่พร้อม: '+report.issues.length+' จุด':'ข้อมูลบังคับครบ');box.append(title);
  report.details.filter(d=>required(d.column)||d.message).forEach(d=>{const item=document.createElement('li');item.textContent=d.column.name+' ('+d.column.type+') — '+(d.message||'มีค่าแล้ว');item.className=d.message?'validation-error':'validation-ok';list.append(item);});
  if(!report.details.some(d=>d.assigned)){const item=document.createElement('li');item.textContent='ยังไม่มี field ที่ mapping สำหรับตารางนี้';item.className='validation-error';list.append(item);}
  box.append(list);panel.append(box);
 });
 if(!selectedTables.size)panel.textContent='เลือกตารางเพื่อตรวจ field บังคับ';
}
async function api(params={}){const response=await fetch('schema.php?'+new URLSearchParams(params),{credentials:'same-origin'});let result;try{result=await response.json();}catch{throw Error('อ่าน API ไม่สำเร็จ กรุณาเปิดหน้านี้ผ่าน PHP server');}if(!response.ok)throw Error(result.error||'อ่าน schema ไม่สำเร็จ');return result.items;}
async function loadTables(){
 const version=++tableRequestVersion;const filter=$('tableFilter').value.trim().toLowerCase();$('reload').disabled=true;$('tableMatches').textContent='กำลังโหลดตาราง…';
 try{const items=await api();if(version!==tableRequestVersion)return;tables=items;appliedTableFilter=filter;selectedTables=new Set([...selectedTables].filter(key=>tables.some(t=>tableKey(t)===key)));renderTables();await loadColumns();}
 catch(e){status(e.message,true);}finally{if(version===tableRequestVersion)$('reload').disabled=false;}
}

async function loadColumns(){
 const version=++requestVersion;columnsLoading=true;columns=[];invalidate();render();
 try{const batches=await Promise.all(chosenTables().map(async t=>(await api({schema:t.schema,table:t.name})).map(c=>({...c,schema:t.schema,table:t.name,key:columnKey(t,c.name)}))));
 if(version!==requestVersion)return false;columns=batches.flat();for(const id of mappings.keys()){const targets=targetsFor(id).filter(key=>columns.some(c=>c.key===key&&writable(c)));if(targets.length)mappings.set(id,targets);else mappings.delete(id);}
 status('Loaded columns from '+selectedTables.size+' tables');return true;
 }catch(e){if(version===requestVersion)status(e.message,true);return false;}
 finally{if(version===requestVersion){columnsLoading=false;render();}}
}

function autoMap(){
 if(columnsLoading)return;mappings.clear();const used=new Set();let ambiguous=0;
 fields.forEach(f=>{const matches=columns.filter(c=>writable(c)&&!used.has(c.key)&&c.name.toLowerCase()===f.path[f.path.length-1].toLowerCase());if(matches.length===1){mappings.set(f.id,matches[0].key);used.add(matches[0].key);}else if(matches.length>1)ambiguous++;});
 invalidate();render();status('Mapped '+mappings.size+' fields; '+ambiguous+' ambiguous fields need manual selection');
}

function generate(){if(jsonDirty&&!parse())return;try{
 if(columnsLoading)throw Error('Please wait for columns to load');
 if(!data||!selectedTables.size||!columns.length||!mappings.size)throw Error('Parse JSON, select tables and map fields first');
 if(!rows().length)throw Error('Source has no rows');
 const problems=validationReport().flatMap(r=>r.issues.map(issue=>r.table.schema+'.'+r.table.name+'.'+issue));if(problems.length)throw Error('ยังสร้าง INSERT ไม่ได้: '+problems.join(' | '));
 const selected=fields.flatMap(f=>targetsFor(f.id).filter(Boolean).map(target=>({...f,target})));const keys=selected.map(f=>f.target);
 if(new Set(keys).size!==keys.length)throw Error('Duplicate destination column');
 if(keys.some(key=>!columns.some(c=>c.key===key&&writable(c))))throw Error('Mapping contains an unavailable column');
 const quote=s=>'['+s.replace(/]/g,']]')+']';
 const statements=chosenTables().map(t=>{
 const targetColumns=columns.filter(c=>c.schema===t.schema&&c.table===t.name);
 const targetFields=selected.filter(f=>targetColumns.some(c=>c.key===f.target));
 if(!targetFields.length)throw Error('No fields mapped for '+t.schema+'.'+t.name);
 const missing=targetColumns.filter(c=>required(c)&&!keys.includes(c.key));if(missing.length)throw Error('Required: '+missing.map(c=>t.schema+'.'+t.name+'.'+c.name).join(', '));
 const mappedColumns=targetFields.map(f=>targetColumns.find(c=>c.key===f.target));
 const parameters=(linkedBill()&&t.schema==='dbo'&&t.name==='sp_tor_period_bill'?[data]:rows()).map((r,index)=>targetFields.map((f,i)=>{const c=mappedColumns[i];let v=get(f.scope==='root'?data:r,f.path);if(v===undefined)throw Error('Row '+(index+1)+' missing '+f.label);if(v===null&&!Number(c.is_nullable))throw Error(c.name+' does not allow null');if(v!==null&&typeof v==='object')throw Error(f.label+' must be scalar');return typeof v==='boolean'?(v?1:0):v;}));
 return {schema:t.schema,table:t.name,mapping:targetFields.map((f,i)=>({scope:f.scope,path:f.path,column:mappedColumns[i].name})),sql:'INSERT INTO [NMU_ERP].'+quote(t.schema)+'.'+quote(t.name)+' ('+mappedColumns.map(c=>quote(c.name)).join(', ')+')\nVALUES ('+mappedColumns.map(()=>'?').join(', ')+');',parameters};
 });
 output={version:2,database:'NMU_ERP',tables:chosenTables(),source:$('source').value?JSON.parse($('source').value):[],statements};
 $('preview').textContent=(linkedBill()?'-- ยืนยันจริง: UPDATE งวดหลักที่ตรงกับ pr_id + po_id + period_id หรือ INSERT ใหม่จาก root แล้วเติม sp_tor_period_bill_receive.sp_tor_period_bill_id จาก ID ที่สร้าง สำหรับ line_ids ทุกแถวใน transaction เดียว\n-- SQL ด้านล่างแสดงเฉพาะคอลัมน์ที่ mapping ไม่ใช่สคริปต์เชื่อม ID สำหรับนำไปรันเอง\n\n':'')+statements.map(s=>s.sql+'\n\n-- Parameters\n'+JSON.stringify(s.parameters,null,2)).join('\n\n');$('copy').disabled=false;$('download').disabled=false;status('Generated INSERT for '+statements.length+' tables');
 }catch(e){invalidate();status(e.message,true);}
}

$('parse').onclick=parse;$('example').onclick=()=>{$('json').value=JSON.stringify(sample,null,2);parse();};$('json').oninput=()=>{jsonDirty=true;invalidate();status('JSON มีการเปลี่ยนแปลง กดอัปเดต mapper หรือ List fields JSON เพื่อเพิ่ม field และคง mapping เดิม');};$('source').onchange=()=>{if(jsonDirty){parse();return;}if(data)buildFields();};$('reload').onclick=loadTables;$('auto').onclick=autoMap;$('search').oninput=render;$('generate').onclick=generate;
$('copy').onclick=async()=>{try{await navigator.clipboard.writeText($('preview').textContent);status('คัดลอก SQL และ parameters แล้ว');}catch{status('คัดลอกอัตโนมัติไม่ได้ กรุณาเลือกข้อความใน preview แล้วคัดลอก',true);}};
$('download').onclick=()=>{if(!output)return;const url=URL.createObjectURL(new Blob([JSON.stringify(output,null,2)],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download='insert-mapping.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);};


let historyState={items:[],active:null}, historyReady=false, historyBusy=false;
function tableKey(t){return JSON.stringify([t.schema,t.name]);}
function columnKey(t,name){return JSON.stringify([t.schema,t.name,name]);}
function chosenTables(){return tables.filter(t=>selectedTables.has(tableKey(t)));}
function renderTables(){
 const query=appliedTableFilter;$('table').replaceChildren();let count=0;
 tables.forEach(t=>{const key=tableKey(t),match=(t.schema+'.'+t.name).toLowerCase().includes(query);if(match)count++;if(!match)return;
 const label=document.createElement('label'),check=document.createElement('input'),text=document.createElement('span');check.type='checkbox';check.checked=selectedTables.has(key);text.textContent=t.schema+'.'+t.name;
 check.onchange=()=>{if(check.checked)selectedTables.add(key);else selectedTables.delete(key);renderTables();loadColumns();};label.append(check,text);$('table').append(label);});
 $('tableMatches').textContent='Found '+count+' / '+tables.length+' tables';$('selectedTables').textContent='เลือกแล้ว '+selectedTables.size+' ตาราง'+(selectedTables.size?' : '+chosenTables().map(t=>t.schema+'.'+t.name).join(', '):'');
 if(!$('table').children.length)$('table').textContent='No matching tables';
}

async function historyApi(body){
 const response=await fetch('history.php',{credentials:'same-origin',cache:'no-store',...(body?{method:'POST',headers:{'Content-Type':'application/json','X-Mapper-Token':historyState.token},body:JSON.stringify(body)}:{})});
 let result;try{result=await response.json();}catch{throw Error('Cannot read history. Check PHP server.');}
 if(!response.ok)throw Error(result.error||'Cannot load history');return result;
}
function renderHistory(){
 const body=$('historyRows');body.replaceChildren();
 const active=historyState.items.find(x=>x.id===historyState.active);
 $('activeLabel').textContent=active?'Active: '+active.document.name:'No active version';
 historyState.items.forEach(entry=>{const tr=document.createElement('tr');const d=entry.document;
 [d.name,(d.tables||[{schema:d.schema,name:d.table}]).map(t=>t.schema+'.'+t.name).join(', '),new Date(entry.savedAt).toLocaleString('th-TH'),entry.id===historyState.active?'Active latest':'History'].forEach(value=>{const td=document.createElement('td');td.textContent=value;tr.append(td);});
 const td=document.createElement('td'),button=document.createElement('button');button.className='secondary';button.textContent='Open / Edit';button.disabled=historyBusy;button.onclick=()=>restoreMapping(entry);td.append(button);tr.append(td);body.append(tr);});
 if(!body.children.length){const tr=document.createElement('tr'),td=document.createElement('td');td.colSpan=5;td.className='empty';td.textContent='No saved history';tr.append(td);body.append(tr);}
 $('saveMapping').disabled=!historyReady||historyBusy;$('updateMapping').disabled=!historyReady||historyBusy||!editingVersion;$('refreshHistory').disabled=historyBusy;
}
async function refreshHistory(){historyBusy=true;renderHistory();try{historyState=await historyApi();historyReady=true;renderHistory();}catch(e){status(e.message,true);}finally{historyBusy=false;renderHistory();}}
async function restoreMapping(entry){
 if(data && !confirm('Replace the current editor with this version?'))return;
 historyBusy=true;renderHistory();
 try{
 const d=entry.document,targets=d.tables||[{schema:d.schema,name:d.table}];
 if(targets.some(target=>!tables.some(t=>tableKey(t)===tableKey(target))))throw Error('Table not found. Reload tables first.');
 mappings.clear();$('source').value='';$('json').value=d.json;parse();if(!data)throw Error('Saved JSON is invalid');
 if(!Array.from($('source').options).some(o=>o.value===d.source))throw Error('Saved source was not found');
 $('source').value=d.source;buildFields();$('tableFilter').value='';appliedTableFilter='';selectedTables=new Set(targets.map(tableKey));renderTables();
 const loaded=await loadColumns();if(!loaded||!columns.length)throw Error('Cannot load columns');
 let skipped=0;d.mapping.forEach(([id,name])=>{const key=d.tables?name:columnKey(targets[0],name);if(fields.some(f=>f.id===id)&&columns.some(c=>c.key===key&&writable(c)))mappings.set(id,[...targetsFor(id),key]);else skipped++;});
 editingVersion=entry.id;resetFieldEditor();$('mappingName').value=d.name;$('editingLabel').textContent='Editing version '+new Date(entry.savedAt).toLocaleString('th-TH')+' - Save to create a new active version';
 invalidate();render();status(skipped?'Loaded with '+skipped+' mappings missing from the current schema. Please review.':'Mapping opened for editing',skipped>0);
 }catch(e){status(e.message,true);}finally{historyBusy=false;renderHistory();}
}
$('tableFilter').onkeydown=e=>{if(e.key==='Enter'){e.preventDefault();loadTables();}};
$('refreshHistory').onclick=refreshHistory;
$('saveMapping').onclick=async()=>{
 const name=$('mappingName').value.trim();if(!name){status('Please enter a mapping name',true);$('mappingName').focus();return;}
 generate();if(!output)return;
 const document={name,json:$('json').value,version:2,tables:output.tables,schema:output.tables[0].schema,table:output.tables[0].name,source:$('source').value,mapping:mappingPairs()};
 historyBusy=true;renderHistory();
 try{historyState=await historyApi({document,expectedActive:historyState.active});editingVersion=historyState.active;$('editingLabel').textContent='Saved - latest version is active';status('Mapping saved with history and set as active');}
 catch(e){status(e.message,true);}finally{historyBusy=false;renderHistory();}
};


let editingVersion=null,editingField=null;
function resetFieldEditor(){editingField=null;$('editPath').value='';$('editValue').value='';$('editScope').disabled=false;$('applyField').textContent='เพิ่ม field';}
function editField(f){editingField=f;$('editScope').value=f.scope;$('editScope').disabled=true;$('editPath').value=f.path.join('.');$('editValue').value=JSON.stringify(f.value);$('applyField').textContent='บันทึกการแก้ไข field';$('editPath').focus();}
function changeField(field,path,value,remove=false){
 if(jsonDirty)throw Error('กด List fields JSON เพื่ออ่านข้อมูลที่แก้ไขก่อน');
 if(!data)throw Error('กรุณาอ่าน JSON ก่อน');
 if(!path.length||path.some(k=>!k||['__proto__','prototype','constructor'].includes(k)))throw Error('ชื่อ field ไม่ถูกต้อง');
 const clone=JSON.parse(JSON.stringify(data)),scope=field?field.scope:$('editScope').value;
 const source=$('source').value;const objects=scope==='root'?[clone]:(source?get(clone,JSON.parse(source)):(Array.isArray(clone)?clone:[clone]));
 if(!Array.isArray(objects)||!objects.length)throw Error('ชุดข้อมูลไม่มีแถว');
 const parent=(obj,keys,create)=>{for(const key of keys){if(!Object.prototype.hasOwnProperty.call(obj,key)){if(!create)return null;obj[key]={};}if(!obj[key]||typeof obj[key]!=='object'||Array.isArray(obj[key]))throw Error('path ชนกับ field ที่ไม่ใช่ object');obj=obj[key];}return obj;};
 objects.forEach(obj=>{
  if(!obj||typeof obj!=='object'||Array.isArray(obj))throw Error('ตำแหน่ง field ต้องเป็น object');
  if(!remove){const dest=parent(obj,path.slice(0,-1),true),key=path[path.length-1];if((!field||JSON.stringify(path)!==JSON.stringify(field.path))&&Object.prototype.hasOwnProperty.call(dest,key))throw Error('มี field ชื่อนี้แล้ว');dest[key]=value;}
  if(field&&(remove||JSON.stringify(path)!==JSON.stringify(field.path))){const old=parent(obj,field.path.slice(0,-1),false);if(old)delete old[field.path[field.path.length-1]];}
 });
 const previous=new Map(mappings),newId=JSON.stringify([scope,...path]);if(field){const target=previous.get(field.id);previous.delete(field.id);if(!remove&&target)previous.set(newId,target);}
 data=clone;$('json').value=JSON.stringify(data,null,2);buildFields();fields.forEach(f=>{if(previous.has(f.id))mappings.set(f.id,previous.get(f.id));});render();resetFieldEditor();status('แก้ไข JSON แล้ว กดอัปเดต mapper เพื่อบันทึกเวอร์ชัน Active ใหม่');
}
function deleteField(f){if(!confirm('ลบ '+f.label+' จากทุกแถวในชุดข้อมูลที่เลือก?'))return;try{changeField(f,f.path,null,true);}catch(e){status(e.message,true);}}
$('applyField').onclick=()=>{try{const value=JSON.parse($('editValue').value);if(value!==null&&typeof value==='object')throw Error('ค่าต้องเป็นข้อความ ตัวเลข boolean หรือ null');changeField(editingField,$('editPath').value.trim().split('.'),value);}catch(e){status(e.message,true);}};
$('cancelField').onclick=resetFieldEditor;
$('updateMapping').onclick=()=>{if(editingVersion)$('saveMapping').onclick();};
render();loadTables();refreshHistory();
