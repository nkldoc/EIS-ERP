<!DOCTYPE html>
<html lang="th">
  <head>
    <meta charset="utf-8" />
    <title>Bookmarks – ExtJS 3.4 TreeGrid (Maximgb) CRUD</title>

    <!-- ExtJS 3.4 -->
    <link href="../../js/ext-3.4.0/resources/css/ext-all.css" rel="stylesheet" type="text/css"/>
    <script src="js/extjs3.4.1-1/ext-base.js" type="text/javascript"></script>
    <script src="js/extjs3.4.1-1/ext-all.js" type="text/javascript"></script>

    <!-- Maximgb TreeGrid -->
    <link rel="stylesheet" href="./css/maximgb-treegrid.css" />
    <script src="../../js/TreeGrid/TreeGrid.js"></script>

    <style>
      body{ margin:0px }
      .hit{ animation:hitpulse 1s ease-in-out 0s 2; background:#fffae6!important }
      @keyframes hitpulse{ 0%{background:#fff3b0} 50%{background:#fff} 100%{background:#fff3b0} }
      .badge-1,.badge-2,.badge-3,.badge-4{ padding:2px 6px; border-radius:10px; border:1px solid }
      .badge-1{ background:#f5f5f5; color:#555; border-color:#ddd }
      .badge-2{ background:#fff7e6; color:#a35d00; border-color:#ffd59c }
      .badge-3{ background:#e8ffe8; color:#2b8a3e; border-color:#bfe8bf }
      .badge-4{ background:#c00; color:#fff; border-color:#bfe8bf }
      a.clear-dt{ color:#c00; text-decoration:underline }

      /* เปลี่ยนสัญลักษณ์ expand/collapse เป็น ▸ / ▾ */
      .x-tree-node .x-tree-ec-icon{ width:0!important; height:16px!important; overflow:hidden!important; background:none!important; }
      .x-tree-node .x-tree-node-el{ position:relative; }
      .x-tree-node .x-tree-node-el:before{
        content:"▸"; display:inline-block; width:16px; line-height:16px; text-align:center; margin-right:2px; color:#555; vertical-align:middle;
      }
      .x-tree-node-expanded .x-tree-node-el:before{ content:"▾"; }
      .x-tree-node-leaf .x-tree-node-el:before{ content:""; width:0; margin-right:0; }
      
      @keyframes blinkColors {
  0%   { color: red; }
  33%  { color: blue; }
  66%  { color: black; }
  100% { color: white; }
}

.blink-text {
  font-weight: bold;
  animation: blinkColors 4s infinite;
}
/* แถวลูก = น้ำเงิน */
.x-grid3-row.row-child .x-grid3-cell-inner{
  color:#1976d2;  /* น้ำเงินอ่านง่าย */
}

/* ถ้าต้องการให้เฉพาะใบไม้ (leaf) เป็นน้ำเงินเข้มกว่า */
.x-grid3-row.row-leaf .x-grid3-cell-inner{
  color:#0d47a1;
}
    </style>
  </head>
  <body>
    <!--<div id="grid-wrap"></div>-->

    <script>
      Ext.onReady(function () {
        Ext.QuickTips.init();

        /* ====== CONFIG/CONST ====== */
        var CASCADE_CHILDREN = false;
        var HIST_KEY = 'tg.search.history';
        var MAX_HIST = 20;
        var LAST_JSON_KEY = 'tg.last.json.path3';
        Ext.pathServer = (function(){ try{ return localStorage.getItem(LAST_JSON_KEY) || 'type_tor3.json'; }catch(e){ return 'type_tor3.json'; }})();
        var READ_URL = 'bookmarks.php?action=readPath';

        /* ====== Util วันที่ ====== */
        function pad2(n){ return (n<10?'0':'')+n; }
        function toYmd(val){
          if(!val) return null;
          if(Ext.isDate(val)) return val.getFullYear()+'-'+pad2(val.getMonth()+1)+'-'+pad2(val.getDate());
          var m=String(val).match(/^(\d{4})-(\d{2})-(\d{2})$/); if(m) return val;
          var m2=String(val).match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
          if(m2) return m2[3]+'-'+pad2(parseInt(m2[2],10))+'-'+pad2(parseInt(m2[1],10));
          return null;
        }
        function fmtDateThai(d){
          if(!d) return '-';
          var dt = Ext.isDate(d) ? d : new Date(String(d).replace(/-/g,'/')+' 00:00:00');
          if(isNaN(dt.getTime())) return '-';
          return pad2(dt.getDate())+'/'+pad2(dt.getMonth()+1)+'/'+dt.getFullYear();
        }
        var dateEditor = new Ext.form.DateField({format:'d/m/Y', altFormats:'Y-m-d|d-m-Y|d/m/Y|Y/m/d'});

        /* ====== Search history ====== */
        var memHist = [];
        function loadHistory(){ try{ var s=localStorage?localStorage.getItem(HIST_KEY):null; if(!s) return memHist.slice(0); var a=Ext.decode(s); return Ext.isArray(a)?a:[]; }catch(e){ return memHist.slice(0); } }
        function saveHistory(arr){ try{ if(localStorage) localStorage.setItem(HIST_KEY, Ext.encode(arr)); else memHist=arr.slice(0);}catch(e){ memHist=arr.slice(0);} }
        function refreshHistoryStore(arr){ var d=[]; for(var i=0;i<arr.length;i++) d.push([arr[i]]); historyStore.loadData(d); }
        function addHistory(q){
          q=(q||'').replace(/^\s+|\s+$/g,''); if(!q) return;
          var arr=loadHistory(); for(var i=arr.length-1;i>=0;i--) if((arr[i]||'').toLowerCase()===q.toLowerCase()) arr.splice(i,1);
          arr.unshift(q); if(arr.length>MAX_HIST) arr.length=MAX_HIST; saveHistory(arr); refreshHistoryStore(arr);
        }

        /* ====== Flatten / Build Tree ====== */
        function flatten(nodes){
          var out=[], seq=1;
          (function walk(arr, parentId){
            for(var i=0;i<arr.length;i++){
              var n=arr[i], id=n.id||('n'+(seq++)), kids=n.children||[];
              out.push({ id:id, title:n.title||n.text||'', page:Number(n.page||1), group:Number(n.group!=null?n.group:1),
                _parent:parentId||null, _is_leaf:kids.length===0, picked:false,
                status:Number(n.status!=null?n.status:1), sigLayout:Number(n.sigLayout!=null?n.sigLayout:1),
                receivedDate:n.receivedDate||null, signedDate:n.signedDate||null });
              if(kids.length) walk(kids, id);
            }
          })(nodes, null);
          return out;
        }

        function buildTreeFromStore(store){
          var recs=store.getRange(), byId={}, roots=[];
          for(var i=0;i<recs.length;i++){
            var r=recs[i];
            byId[r.id]={ id:r.id, title:r.get('title'), page:r.get('page'), group:r.get('group'),
              status:r.get('status'), sigLayout:r.get('sigLayout'),
              receivedDate:toYmd(r.get('receivedDate')), signedDate:toYmd(r.get('signedDate')), children:[] };
          }
          for(var j=0;j<recs.length;j++){
            var r2=recs[j], pid=r2.get('_parent'), node=byId[r2.id];
            if(pid && byId[pid]) byId[pid].children.push(node); else roots.push(node);
          }
          (function prune(arr){ for(var k=0;k<arr.length;k++){ var n=arr[k]; if(n.children && n.children.length) prune(n.children); else delete n.children; } })(roots);
          return roots;
        }

        function buildSelectedTree(store){
          var picked=[], byId={}, nodes={}, roots=[];
          store.each(function(r){ if(r.get('picked')) picked.push(r); });
          for(var i=0;i<picked.length;i++){
            var r=picked[i];
            var node=nodes[r.id]={ id:r.id, title:r.get('title'), page:r.get('page'), group:r.get('group'),
              status:r.get('status'), sigLayout:r.get('sigLayout'),
              receivedDate:toYmd(r.get('receivedDate')), signedDate:toYmd(r.get('signedDate')), children:[] };
            byId[r.id]=node;
          }
          for(var j=0;j<picked.length;j++){
            var r2=picked[j], pid=r2.get('_parent');
            if(pid && byId[pid]) byId[pid].children.push(byId[r2.id]); else roots.push(byId[r2.id]);
          }
          (function prune(arr){ for(var k=0;k<arr.length;k++){ var n=arr[k]; if(n.children && n.children.length) prune(n.children); else delete n.children; } })(roots);
          return roots;
        }

        function copyToClipboard(text){
          var ta=document.createElement('textarea'); ta.style.position='fixed'; ta.style.opacity='0'; ta.value=text;
          document.body.appendChild(ta); ta.select(); try{ document.execCommand('copy'); }catch(e){} document.body.removeChild(ta);
        }

        function setAllPicked(val){ store.each(function(r){ r.set('picked', !!val); }); refreshHeaderCheckbox(); }
        function setPickedDescendants(rec, val){
          var stack=[rec];
          while(stack.length){
            var cur=stack.pop();
            store.each(function(r){
              if(r.get('_parent')===cur.id){ r.set('picked', !!val); stack.push(r); }
            });
          }
        }

        var lastHit=null, hdrCbEl=null;
        function clearPrevHighlight(){
          if(!lastHit) return;
          var idx=store.indexOf(lastHit);
          if(idx>=0){ var row=grid.getView().getRow(idx); if(row) Ext.fly(row).removeClass('hit'); }
          lastHit=null;
        }
        function expandAncestors(rec){
          var pid=rec.get('_parent');
          while(pid){
            var p=store.getById(pid); if(!p) break;
            store.expandNode(p); pid=p.get('_parent');
          }
        }

        /* ====== Search ====== */
        function getSigLabel(v){ var rec=sigLayoutStore.query('value', v).first(); return rec?rec.get('text'):'-'; }
        function getStatusLabel(v){ var map={1:'รอดำเนินการ',2:'รอเซ็นเอกสาร',3:'ดำเนินการแล้ว'}; return map[v]||''; }

        function recToSearchString(r){
          var parts=[];
          parts.push(String(r.id||r.get&&r.get('id')||'')); // id
          var title=r.get?r.get('title'):r.title; parts.push(String(title||''));
          var page=r.get?r.get('page'):r.page; var group=r.get?r.get('group'):r.group;
          parts.push(String(page||'')); parts.push(String(group||''));
          var status=r.get?r.get('status'):r.status; parts.push(String(status||'')); parts.push(getStatusLabel(status||''));
          var sig=r.get?r.get('sigLayout'):r.sigLayout; parts.push(String(sig||'')); parts.push(getSigLabel(sig||''));
          var rcv=r.get?r.get('receivedDate'):r.receivedDate; var sgn=r.get?r.get('signedDate'):r.signedDate;
          if(rcv){ parts.push(String(rcv)); parts.push(fmtDateThai(rcv)); }
          if(sgn){ parts.push(String(sgn)); parts.push(fmtDateThai(sgn)); }
          return parts.join(' ').toLowerCase();
        }
        function tokenize(q){ return (q||'').toLowerCase().split(/\s+/).filter(function(t){ return !!t; }); }
        function matchAllTermsInString(hay, terms){ for(var i=0;i<terms.length;i++){ if(hay.indexOf(terms[i])===-1) return false; } return true; }
        function collectHits(terms){
          var arr=[]; store.each(function(r){ var hay=recToSearchString(r); if(matchAllTermsInString(hay, terms)) arr.push(r); });
          return arr;
        }

        var searchState={q:'', terms:[], hits:[], idx:-1};
        function updateSearchBadge(){
          var tb=Ext.getCmp('searchBadge'); if(!tb) return;
          if(!searchState.hits.length) tb.setText(''); else tb.setText((searchState.idx+1)+' / '+searchState.hits.length);
        }
        function gotoHit(i){
          var rec=searchState.hits[i]; if(!rec) return;
          expandAncestors(rec);
          var idx=store.indexOf(rec);
          if(idx>=0){
            clearPrevHighlight();
            grid.getSelectionModel().selectRow(idx);
            var rowEl=grid.getView().getRow(idx);
            if(rowEl){ Ext.fly(rowEl).addClass('hit'); grid.getView().focusRow(idx); }
            lastHit=rec;
          }
          updateSearchBadge();
        }
        function doSearchCycle(direction){
          var tf=Ext.getCmp('searchTitle');
          var q=tf?(tf.getRawValue()||''):'';
          q=q.replace(/^\s+|\s+$/g,'');
          if(!q){ Ext.Msg.alert('ค้นหา','กรุณาพิมพ์คำค้น'); return; }
          var terms=tokenize(q);
          if(q!==searchState.q){
            searchState={q:q, terms:terms, hits:collectHits(terms), idx:-1};
            if(!searchState.hits.length){ updateSearchBadge(); Ext.Msg.alert('ค้นหา','ไม่พบ "'+q+'"'); return; }
            addHistory(q);
            searchState.idx=(direction===-1)?(searchState.hits.length-1):0;
            gotoHit(searchState.idx); return;
          }
          if(!searchState.hits.length){ Ext.Msg.alert('ค้นหา','ไม่พบ "'+q+'"'); updateSearchBadge(); return; }
          searchState.idx=(searchState.idx+direction+searchState.hits.length)%searchState.hits.length;
          gotoHit(searchState.idx);
        }

        /* ====== Header checkbox ====== */
        function refreshHeaderCheckbox(){
          if(!hdrCbEl) return;
          var total=0, picked=0;
          store.each(function(r){ total++; if(r.get('picked')) picked++; });
          if(total===0){ hdrCbEl.dom.checked=false; hdrCbEl.dom.indeterminate=false; return; }
          if(picked===0){ hdrCbEl.dom.checked=false; hdrCbEl.dom.indeterminate=false; }
          else if(picked===total){ hdrCbEl.dom.checked=true; hdrCbEl.dom.indeterminate=false; }
          else { hdrCbEl.dom.checked=false; hdrCbEl.dom.indeterminate=true; }
        }

        /* ====== Store / Reader ====== */
        var reader = new Ext.data.JsonReader({idProperty:'id', root:'data', totalProperty:'total'}, [
          {name:'id'},{name:'title'},{name:'page',type:'int'},{name:'group',type:'int'},
          {name:'_parent'},{name:'_is_leaf',type:'bool'},{name:'picked',type:'bool',defaultValue:false},
          {name:'status',type:'int',defaultValue:1},{name:'sigLayout',type:'int',defaultValue:1},
          {name:'receivedDate'},{name:'signedDate'}
        ]);
        var store = new Ext.ux.maximgb.tg.AdjacencyListStore({reader: reader});
        store.on('update', refreshHeaderCheckbox);
        store.on('datachanged', function(){
          refreshHeaderCheckbox(); searchState={q:'',terms:[],hits:[],idx:-1};
          var badge=Ext.getCmp('searchBadge'); if(badge) badge.setText('');
        });

        // บูตด้วยข้อมูลว่าง -> จะกด "เพิ่ม" ได้ทันที
        store.loadData({data:[], total:0});
        store.expandAll();

        /* ====== Search history store ====== */
        var historyStore = new Ext.data.ArrayStore({
          fields:['q'],
          data:(function(){ var a=loadHistory(), d=[]; for(var i=0;i<a.length;i++) d.push([a[i]]); return d; })()
        });

        /* ====== Combo stores ====== */
        var statusStore = new Ext.data.ArrayStore({
          fields:['value','text'],
          data:[[1,'รอดำเนินการ'],[2,'รอเซ็นเอกสาร'],[3,'ดำเนินการแล้ว'],[4,'ยกเลิกทำใหม่']]
        });
        var sigLayoutStore = new Ext.data.ArrayStore({
          fields:['value','text'],
          data:[[0,'-'],[1,'เจ้าหน้าที่'],[2,'หัวหน้าสายงาน'],[3,'หัวหน้าเจ้าหน้าที่'],[4,'เลขารองคณบดี'],[5,'รองคณบดี'],[6,'เลขาคณบดี'],[7,'คณบดีลงนาม']]
        });

        /* ====== helper: โครงสร้าง/การแทรก ====== */
        function isDescendantOf(r, ancestorId){
          var pid=r.get('_parent');
          while(pid){
            if(pid===ancestorId) return true;
            var p=store.getById(pid);
            pid = p ? p.get('_parent') : null;
          }
          return false;
        }
        // ตำแหน่ง index สุดท้ายของ "ทั้งกิ่ง" ของ node ที่ให้มา
        function subtreeEndIndex(node){
          var baseIdx = store.indexOf(node);
          var endIdx = baseIdx;
          for(var i=baseIdx+1;i<store.getCount();i++){
            var r=store.getAt(i);
            if(isDescendantOf(r, node.id)) endIdx=i; else break;
          }
          return endIdx;
        }
        // สำหรับ “เพิ่มระดับเดียวกัน”: แทรกถัดจากทั้งกิ่งของ sel
        function insertAfterSubtree(sel, rec){
          var insertIdx = subtreeEndIndex(sel) + 1;
          store.insert(insertIdx, rec);
        }
        // สำหรับ “เพิ่มเป็นลูก”: แทรกเป็นลูกใหม่ “ท้ายสุด” ใต้พ่อ (หลังทั้งกิ่งของพ่อ)
        function insertChildAtProperPosition(parent, rec){
          var insertIdx = subtreeEndIndex(parent) + 1;
          store.insert(insertIdx, rec);
        }
// === helper: เช็กลูกหลานของ node (ใช้กับโหมด subtree)
function isDescendantOfId(record, ancestorId){
  var pid = record.get('_parent');
  while(pid){
    if(pid === ancestorId) return true;
    var p = store.getById(pid);
    pid = p ? p.get('_parent') : null;
  }
  return false;
}

// === อัพเดทเลขหน้าแบบยืดหยุ่น
function runUpdatePages(mode){
  // mode: 'all' | 'fromSelected' | 'subtree'
  var sel = sm.getSelected();
  if((mode==='fromSelected' || mode==='subtree') && !sel){
    Ext.Msg.alert('แจ้งเตือน','กรุณาเลือกแถวก่อน'); 
    return;
  }

  var startIdx   = 0;
  var startPage  = 1;
  var anchorId   = sel ? sel.id : null;

  if(mode==='fromSelected'){
    startIdx  = store.indexOf(sel);
    startPage = sel.get('page') || 1;
  }

  // ยืนยันก่อนทำ
  var title = 'อัพเดทหน้าตามลำดับ';
  var msg   = (mode==='all') 
      ? 'จะรันเลขหน้าใหม่ทั้งกริด เริ่มที่ 1'
      : (mode==='fromSelected'
          ? 'จะรันเลขหน้าใหม่ตั้งแต่แถวที่เลือกลงไป โดยเริ่มที่เลขหน้าปัจจุบันของแถวที่เลือก'
          : 'จะรันเลขหน้าใหม่เฉพาะกิ่ง (subtree) ของแถวที่เลือก โดยเริ่มที่เลขหน้าปัจจุบันของแถวที่เลือก');

  Ext.Msg.confirm(title, msg + ' ต้องการดำเนินการต่อหรือไม่?', function(btn){
    if(btn !== 'yes') return;

    // ทำงานแบบ batch เพื่อลดการ refresh บ่อย
    store.suspendEvents();

    if(mode==='all'){
      for(var i=0;i<store.getCount();i++){
        store.getAt(i).set('page', i+1);
      }
    }else if(mode==='fromSelected'){
      var p = startPage;
      for(var i=startIdx;i<store.getCount();i++){
        store.getAt(i).set('page', p++);
      }
    }else if(mode==='subtree'){
      // รันเฉพาะลูกหลานรวมทั้งโหนดที่เลือกเอง
      var basePage = startPage;
      // จัดชุด index ที่เป็น subtree ตามลำดับบนลงล่าง
      var idxs = [];
      for(var i=0;i<store.getCount();i++){
        var r = store.getAt(i);
        if(r.id===anchorId || isDescendantOfId(r, anchorId)) idxs.push(i);
      }
      for(var k=0;k<idxs.length;k++){
        store.getAt(idxs[k]).set('page', basePage++);
      }
    }

    store.resumeEvents();
    grid.getView().refresh();
    Ext.Msg.alert('สำเร็จ','อัพเดทเลขหน้าเรียบร้อยแล้ว');
  });
}
        /* ====== Grid ====== */
        var hdrPickId = Ext.id();
        var sm = new Ext.grid.RowSelectionModel({singleSelect:true});

        var grid = new Ext.ux.maximgb.tg.EditorGridPanel({   
//          renderTo:'grid-wrap',
          useArrows:true,
          title:'โครงสร้างบุ๊กมาร์กเอกสาร (Maximgb TreeGrid)',
          width:1400, height:600, store:store, master_column_id:1, clicksToEdit:2, sm:sm,
          /**/
          listeners:{
              afterrender:function(){
  /*window.parent.*/                 
                  Ext.globValue = window.parent.Ext.globValue;
                  Ext.spTypeStatusStore = window.parent.Ext.spTypeStatusStore;
                  
                    var typeStatus = window.parent.Ext.getText(Ext.spTypeStatusStore, Ext.globValue.tor_type_id);
                        // สร้างส่วนที่กระพริบ
                    var blinking = '<span class="blink-text">'
                                 + Ext.globValue.pr_code + " Doc " + typeStatus
                                 + '</span>';

                    // ตั้ง title
                    this.setTitle('โครงสร้างบุ๊กมาร์กเอกสาร ' + blinking + " " + Ext.globValue.c_name);
                }
          },
                viewConfig:{
    getRowClass: function(r){
      // ใส่คลาสสำหรับ "ลูก"
      if (r.get('_parent')) {
        // ถ้าอยากไฮไลต์เฉพาะใบไม้ ให้ใช้ row-leaf แทน row-child เมื่อ _is_leaf = true
        return r.get('_is_leaf') ? 'row-leaf' : 'row-child';
      }
      return '';
    }
  },
          columns:[
            {header:'<input type="checkbox" id="'+hdrPickId+'" />', dataIndex:'picked', width:38, align:'center',
              sortable:false, menuDisabled:true,
              renderer:function(v){ return '<input type="checkbox" class="rowpick" '+(v?'checked':'')+' />'; }
            },
            {header:'หัวข้อ', dataIndex:'title', width:420, editor:new Ext.form.TextField({allowBlank:false})},
            {header:'หน้า (page)', dataIndex:'page', width:100, align:'right',
              editor:new Ext.form.NumberField({allowDecimals:false, minValue:1})},
            {header:'สถานะดำเนินการ', dataIndex:'status', width:160,
              editor:new Ext.form.ComboBox({store:statusStore, mode:'local', triggerAction:'all', editable:false, displayField:'text', valueField:'value'}),
              renderer:function(v){
                var map={1:{text:'รอดำเนินการ',cls:'badge-1'}, 2:{text:'รอเซ็นเอกสาร',cls:'badge-2'}, 3:{text:'ดำเนินการแล้ว',cls:'badge-3'}, 4:{text:'ยกเลิกทำใหม่',cls:'badge-4'}};
                var o=map[v]||map[1]; return '<span class="'+o.cls+'">'+o.text+'</span>';
              }
            },
            {header:'กลุ่มเอกสาร', dataIndex:'group', width:70, align:'right',
              editor:new Ext.form.NumberField({allowDecimals:false, minValue:1})},
            {header:'ลงนาม/ตรวจสอบ', dataIndex:'sigLayout', width:130, align:'left',
              editor:new Ext.form.ComboBox({store:sigLayoutStore, mode:'local', triggerAction:'all', editable:false, displayField:'text', valueField:'value'}),
              renderer:function(v){ return getSigLabel(v); }
            },
            {header:'วันที่รับ', dataIndex:'receivedDate', width:130, editor:dateEditor,
              renderer:function(v){ return v?fmtDateThai(v):'<span style="color:#999">-</span>'; }},
            {header:'วันที่ดำเนินการเสร็จ', dataIndex:'signedDate', width:130, editor:dateEditor,
              renderer:function(v){ return v?fmtDateThai(v):'<span style="color:#999">-</span>'; }},
            {header:'ล้าง', width:70, renderer:function(){ return '<a href="javascript:;" class="clear-dt">ล้าง</a>'; }}
          ],
          stripeRows:true, frame:true,
          tbar:[
            {
              text:'เพิ่มระดับเดียวกัน',
              handler:function(){
                var sel = sm.getSelected();
                var parentId = sel ? sel.get('_parent') : null;
                var defGroup = sel ? (sel.get('group')||1) : 1;
                var rec = new store.recordType({
                  id:Ext.id(), title:'หัวข้อใหม่', page:1,
                  group:defGroup, _parent:parentId, _is_leaf:true,
                  picked:false, status:1, sigLayout:1, receivedDate:null, signedDate:null
                });

                if(!sel){ store.add(rec); } // root ต่อท้าย
                else { insertAfterSubtree(sel, rec); }

                if(parentId){
                  var parent = store.getById(parentId);
                  if(parent) parent.set('_is_leaf', false);
                }
                grid.getSelectionModel().selectRecords([rec]);
                grid.startEditing(store.indexOf(rec), 1);
              }
            },
            {
              text:'เพิ่มเป็นลูก',
              handler:function(){
                var sel=sm.getSelected();
                var parentId = sel ? sel.id : null;
                if(!parentId){ Ext.Msg.alert('แจ้งเตือน','กรุณาเลือกโหนดก่อน'); return; }

                var defGroup = sel ? (sel.get('group')||1) : 1;
                var rec = new store.recordType({
                  id:Ext.id(), title:'หัวข้อย่อยใหม่', page:1,
                  group:defGroup, _parent:parentId, _is_leaf:true,
                  picked:false, status:1, sigLayout:1, receivedDate:null, signedDate:null
                });

                // แทรก “เป็นลูก” ตำแหน่งที่ถูกต้อง: ต่อท้ายกิ่งของพ่อ (อยู่ใต้พ่อและลูกเดิมทั้งหมด)
                insertChildAtProperPosition(sel, rec);

                // อัปเดตสถานะใบไม้ของพ่อ + ขยายพ่อ
                sel.set('_is_leaf', false);
                store.expandNode(sel);

                grid.getSelectionModel().selectRecords([rec]);
                grid.startEditing(store.indexOf(rec), 1);
              }
            },
            '-', {text:'ลบ', handler:function(){
              var sel=sm.getSelected(); if(!sel) return;
              Ext.Msg.confirm('ยืนยัน','ต้องการลบโหนดนี้และลูกทั้งหมดหรือไม่?', function(btn){
                if(btn==='yes'){ store.remove(sel); }
              });
            }},
            '-', {text:'ขยายทั้งหมด', handler:function(){ store.expandAll(); }}, 
            {text:'ย่อทั้งหมด', handler:function(){ store.collapseAll(); }},
                        '-', {
  text:'อัพเดทหน้าตามลำดับ',
  handler:function(){
    // กล่องเลือกโหมดแบบง่าย ๆ
    var form = new Ext.form.FormPanel({
      bodyStyle:'padding:10px',
      labelWidth:1,
      items:[
        {xtype:'radio', boxLabel:'ทั้งกริด (เริ่มที่ 1)',              name:'mode', inputValue:'all',         checked:true},
        {xtype:'radio', boxLabel:'ตั้งแต่แถวที่เลือกลงไป',            name:'mode', inputValue:'fromSelected'},
        {xtype:'radio', boxLabel:'เฉพาะกิ่ง (subtree) ของแถวที่เลือก', name:'mode', inputValue:'subtree'}
      ]
    });

    var win = new Ext.Window({
      title:'เลือกโหมดอัพเดทหน้า',
      width:360, height:180, layout:'fit', modal:true, resizable:false, items:form,
      buttons:[
        {text:'ยกเลิก', handler:function(){ win.close(); }},
        {text:'ตกลง',  handler:function(){
          var v = form.getForm().getValues();
          runUpdatePages(v.mode || 'all');
          win.close();
        }}
      ]
    });
    win.show();
  }
},
            '->','ค้นหา:',
            {xtype:'combo', id:'searchTitle', width:260, store:historyStore, displayField:'q', valueField:'q',
              mode:'local', typeAhead:true, minChars:0, triggerAction:'all', editable:true,
              emptyText:'หลายคำคั่นด้วยช่องว่าง • Enter=ถัดไป',
              listeners:{
                specialkey:function(f,e){ if(e.getKey()===e.ENTER){ doSearchCycle(e.shiftKey?-1:+1); } },
                select:function(){ setTimeout(function(){ doSearchCycle(+1); },10); }
              }},
            {xtype:'tbtext', id:'searchBadge', text:'', style:'margin-left:6px;color:#666'},
            {text:'ค้นหา ⏎', handler:function(){ doSearchCycle(+1); }},
            {text:'ย้อนกลับ', handler:function(){ doSearchCycle(-1); }},
            '-', {text:'บันทึกทั้งหมด', handler:function(){
              var treeData = buildTreeFromStore(store);
              Ext.Ajax.request({
                url:'bookmarks.php?action=save&file='+Ext.pathServer, method:'POST', jsonData:{data:treeData},
                success:function(resp){
                  try{
                    var o=Ext.decode(resp.responseText);
                    if(o && o.success){ Ext.Msg.alert('สำเร็จ','บันทึกโครงสร้างเรียบร้อยแล้ว'); reloadFromServer(); }
                    else Ext.Msg.alert('ผิดพลาด', (o&&o.message)||'ไม่ทราบสาเหตุ');
                  }catch(e){ Ext.Msg.alert('ผิดพลาด','Response ไม่ถูกต้อง'); }
                },
                failure:function(resp){
                  var msg='HTTP '+resp.status;
                  try{ msg=Ext.decode(resp.responseText).message||msg; }catch(e){}
                  Ext.Msg.alert('ผิดพลาด', msg);
                }
              });
            }},
            {text:'รีเฟรช', handler:function(){ reloadFromServer(); }}
          ],
          bbar:[
            '-', {text:'คัดลอกที่เลือก (JSON)', handler:function(){
              var selTree = buildSelectedTree(store);
              copyToClipboard(JSON.stringify(selTree, null, 2));
              Ext.Msg.alert('คัดลอกแล้ว','คัดลอก JSON ของรายการที่เลือกไปยังคลิปบอร์ดแล้ว');
            }},
            {text:'เลือกทั้งหมด', handler:function(){ setAllPicked(true); }},
            {text:'ล้างเลือก', handler:function(){ setAllPicked(false); }},
            '-', {text:'ลบประวัติการค้นหา', handler:function(){
              saveHistory([]); refreshHistoryStore([]); Ext.getCmp('searchBadge').setText('');
              searchState={q:'',terms:[],hits:[],idx:-1};
              var cb=Ext.getCmp('searchTitle'); if(cb) cb.reset();
              Ext.Msg.alert('เสร็จสิ้น','ลบประวัติการค้นหาแล้ว');
            }},
            '->',
            {text:'โหลด Json To Grid', handler:function(){ openLoadJsonWindow(true); }},
            {text:'วาง JSON ลงกริด', handler:function(){ openPasteJsonWindow(); }},
            {text:'เริ่มต้นสร้าง json Create Pdf & Bookmarks', handler:function(){
              Ext.Ajax.request({
                url:'https://eis.vajira.ac.th:8443/supplies/loadJsonBookmarksSave?jsonName='+Ext.pathServer+'&outName=template.pdf',
                method:'POST',
                success:function(resp){
                  try{
                    var o=Ext.decode(resp.responseText);
                    if(o && o.status==="OK"){
                      Ext.Msg.alert('สำเร็จ','บันทึกโครงสร้างลง PDF Template เรียบร้อยแล้ว<br>Path: '+o.output);
                      reloadFromServer();
                    }else Ext.Msg.alert('ผิดพลาด', (o&&o.message)||'ไม่ทราบสาเหตุ');
                  }catch(e){ Ext.Msg.alert('ผิดพลาด','Response ไม่ถูกต้อง'); }
                },
                failure:function(resp){
                  var msg='HTTP '+resp.status;
                  try{ msg=Ext.decode(resp.responseText).message||msg; }catch(e){}
                  Ext.Msg.alert('ผิดพลาด', msg);
                }
              });
            }},
            {text:'แทรก pdf to Page & Bookmark Pdf', handler:function(){}},
            {text:'อัพเดท Bookmark to Json', handler:function(){}}
          ]
        });

        /* ====== Events ====== */
        grid.on('cellclick', function(g,row,col,e){
          var rec=store.getAt(row);
          if(col===0){
            var t=e.getTarget('input.rowpick',1,true);
            if(rec && t){
              var val=!rec.get('picked');
              rec.set('picked', val);
              if(CASCADE_CHILDREN) setPickedDescendants(rec, val);
              refreshHeaderCheckbox();
            }
            return;
          }
          var clearA=e.getTarget('a.clear-dt',1,true);
          if(clearA){ rec.set('receivedDate',null); rec.set('signedDate',null); }
        });

        grid.on('render', function(){
          var hdrCell=grid.getView().getHeaderCell(0);
          hdrCbEl=Ext.get(hdrCell).down('input[id="'+hdrPickId+'"]');
          if(hdrCbEl){
            hdrCbEl.dom.indeterminate=false;
            hdrCbEl.on('click', function(e){ setAllPicked(e.target.checked); });
          }
          refreshHeaderCheckbox();
        });
   
        new Ext.KeyMap(document, [{key: Ext.EventObject.F3, fn:function(e){ doSearchCycle(e.shiftKey?-1:+1); }}]);

        /* ====== Load/Apply Payload ====== */
        function applyPayload(payload){
          var nested = payload && payload.data ? (payload.data.children || payload.data) : payload;
          if(nested && nested.length===undefined && nested.children) nested = nested.children;
          if(!Ext.isArray(nested)) nested=[];
          var flat=flatten(nested);
          store.removeAll();
          store.loadData({data:flat, total:flat.length});
          store.expandAll();
          refreshHeaderCheckbox();
          searchState={q:'',terms:[],hits:[],idx:-1};
          var badge=Ext.getCmp('searchBadge'); if(badge) badge.setText('');
        }

        function reloadFromServer(){
          Ext.Ajax.request({
            url:'bookmarks.php?action=read&file='+Ext.pathServer, method:'GET',
            success:function(resp){
              try{ var payload=Ext.decode(resp.responseText); applyPayload(payload); }
              catch(e){ Ext.Msg.alert('ผิดพลาด','โหลดข้อมูลไม่สำเร็จ (JSON ไม่ถูกต้อง)'); }
            },
            failure:function(resp){ Ext.Msg.alert('ผิดพลาด','โหลดข้อมูลไม่สำเร็จ: HTTP '+resp.status); }
          });
        }

        function openLoadJsonWindow(showWin){
          var lastVal=(function(){ try{ return localStorage.getItem(LAST_JSON_KEY)||''; }catch(e){ return ''; }})();
          var jsonStore=new Ext.data.ArrayStore({fields:['v'], data:[['type_tor1.json'],['type_tor2.json'],['type_tor3.json'],['type_tor4.json'],['type_tor5.json']]});
          var initialVal=(/^type_tor[1-5]\.json$/i.test(lastVal)? lastVal : 'type_tor1.json');

          var form=new Ext.form.FormPanel({
            labelWidth:110, border:false, bodyStyle:'padding:10px',
            items:[
              {xtype:'combo', id:'jsonPathField', fieldLabel:'เลือกไฟล์ JSON',
               store:jsonStore, mode:'local', triggerAction:'all', editable:false, forceSelection:true,
               displayField:'v', valueField:'v', value:initialVal, anchor:'100%'},
              {xtype:'checkbox', id:'rememberJsonChoice', boxLabel:'จำไฟล์ที่เลือก', checked:true}
            ]
          });
          function onLoadJsonHandler(){
            var path=Ext.getCmp('jsonPathField').getValue();
            Ext.pathServer=path;
            if(!path){ Ext.Msg.alert('แจ้งเตือน','กรุณาเลือกไฟล์ JSON'); return; }
            if(Ext.getCmp('rememberJsonChoice').getValue()){
              try{ localStorage.setItem(LAST_JSON_KEY, path); }catch(e){}
            }
            loadJsonToGrid(path, function(){ reloadFromServer(); Ext.getCmp('windLoadID').close(); });
          }
          var win=new Ext.Window({
            id:'windLoadID', title:'โหลด JSON เข้ากริด', width:520, height:160, layout:'fit', modal:true, resizable:false, items:form,
            buttons:[ {text:'ยกเลิก', handler:function(){ win.close(); }}, {text:'โหลด', handler:onLoadJsonHandler} ]
          });
          if(showWin){ win.show(); } else { onLoadJsonHandler(); }
        }

        function loadJsonToGrid(path, done){
          Ext.Msg.wait('กำลังโหลด...','โปรดรอ');
          Ext.Ajax.request({
            url:READ_URL, method:'GET', params:{path:path},
            success:function(resp){
              Ext.Msg.hide();
              try{ var payload=Ext.decode(resp.responseText); applyPayload(payload); if(typeof done==='function') done(); }
              catch(e){ Ext.Msg.alert('ผิดพลาด','รูปแบบ JSON ไม่ถูกต้อง'); }
            },
            failure:function(resp){
              if(/\.json(\?|$)/i.test(path)){
                Ext.Ajax.request({
                  url:path, method:'GET',
                  success:function(resp2){
                    Ext.Msg.hide();
                    try{ var payload=Ext.decode(resp2.responseText); applyPayload(payload); if(typeof done==='function') done(); }
                    catch(e){ Ext.Msg.alert('ผิดพลาด','อ่าน JSON โดยตรงไม่สำเร็จ'); }
                  },
                  failure:function(resp2){
                    Ext.Msg.hide(); Ext.Msg.alert('ผิดพลาด','โหลดไฟล์ไม่สำเร็จ: HTTP '+resp2.status);
                  }
                });
              }else{
                Ext.Msg.hide(); Ext.Msg.alert('ผิดพลาด','โหลดไฟล์ไม่สำเร็จ: HTTP '+resp.status);
              }
            }
          });
        }

        /* ====== NEW: วาง JSON ลงกริด ====== */
        function openPasteJsonWindow(){
          var ta=new Ext.form.TextArea({
            id:'pasteJsonText', fieldLabel:'วาง JSON', height:220, anchor:'100%',
            emptyText:'วาง JSON ที่คัดลอกจากที่อื่น แล้วกด "โหลดลงกริด"'
          });
          var form=new Ext.form.FormPanel({labelWidth:90, border:false, bodyStyle:'padding:10px', items:[ta]});
          var win=new Ext.Window({
            title:'วาง JSON ลงกริด', width:640, height:340, layout:'fit', modal:true, resizable:true, items:form,
            buttons:[
              {text:'ยกเลิก', handler:function(){ win.close(); }},
              {text:'โหลดลงกริด', handler:function(){
                var raw=Ext.getCmp('pasteJsonText').getValue();
                if(!raw){ Ext.Msg.alert('แจ้งเตือน','กรุณาวาง JSON ก่อน'); return; }
                try{ var payload=Ext.decode(raw); applyPayload(payload); win.close(); }
                catch(e){ Ext.Msg.alert('ผิดพลาด','JSON ไม่ถูกต้อง: '+e); }
              }}
            ]
          });
          win.show();
        }

        // initial: บูตสโตร์ว่างแล้วค่อยโหลดของจริง (จะกด "เพิ่ม" ได้ทันที)
        openLoadJsonWindow(false);
                        new Ext.Viewport({
                    layout: "fit", // fit layout = ขยายเต็ม
                    items:grid
                });
      });
    </script>
  </body>
</html>
