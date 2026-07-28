<?php
include("../../conf/config.php");
?>
<!DOCTYPE html>
<html lang="th">
  <head>
    <meta charset="utf-8" />
    <title>mnBookmarkTemplate – ExtJS 3.4 TreeGrid (Maximgb) CRUD</title>

    <!-- ExtJS 3.4 -->
    <link href="../../js/ext-3.4.0/resources/css/ext-all.css" rel="stylesheet" type="text/css"/>
    <script src="js/extjs3.4.1-1/ext-base.js" type="text/javascript"></script>
    <script src="js/extjs3.4.1-1/ext-all.js" type="text/javascript"></script>

    <!-- Maximgb TreeGrid -->
    <link rel="stylesheet" href="./css/maximgb-treegrid.css" />
    <script src="../../js/TreeGrid/TreeGrid.js"></script>
    <link href="../../css/icon_all.css" rel="stylesheet" type="text/css"/> 
    <style>
      body{ margin:0px }
      .hit{ animation:hitpulse 1s ease-in-out 0s 2; background:#fffae6!important }
      @keyframes hitpulse{ 0%{background:#fff3b0} 50%{background:#fff} 100%{background:#fff3b0} }
      .badge-0,.badge-1,.badge-2,.badge-3,.badge-4,.badge-5{ padding:2px 6px; border-radius:10px; border:1px solid }
      .badge-0{ background:#c00; color:#555; border-color:#ddd }
      .badge-1{ background:#f5f5f5; color:#555; border-color:#ddd }
      .badge-2{ background:#fff7e6; color:#a35d00; border-color:#ffd59c }
      .badge-3{ background:#e8ffe8; color:#2b8a3e; border-color:#bfe8bf }
      .badge-4{ background:#1976d2; color:#fff; border-color:#bfe8bf }
      .badge-5{ background:#1976d2; color:#fff; border-color:#bfe8bf }
      a.clear-dt{ color:#c00; text-decoration:underline }

      /* เปลี่ยนสัญลักษณ์ expand/collapse เป็น ▸ / ▾ */
      .x-tree-node .x-tree-ec-icon{ width:0!important; height:16px!important; overflow:hidden!important; background:none!important; }
      .x-tree-node .x-tree-node-el{ position:relative; }
      .x-tree-node .x-tree-node-el:before{
        content:"▸"; display:inline-block; width:16px; line-height:16px; text-align:center; margin-right:2px; color:#555; vertical-align:middle;
      }
      .x-tree-node-expanded .x-tree-node-el:before{ content:"▾"; }
      .x-tree-node-leaf .x-tree-node-el:before{ content:""; width:0; margin-right:0; }

      @keyframes blinkColors { 0%{color:red} 33%{color:blue} 66%{color:black} 100%{color:white} }
      .blink-text { font-weight: bold; animation: blinkColors 4s infinite; }

      /* แถวลูก = น้ำเงิน */
      .x-grid3-row.row-child .x-grid3-cell-inner{ color:#1976d2; }
      /* ใบไม้ = น้ำเงินเข้ม */
      .x-grid3-row.row-leaf .x-grid3-cell-inner{ color:#0d47a1; }

      /* progress wrap (ใช้คู่กับ XHR) */
      .x-progress-wrap{ background:#fafafa }
      .x-progress-inner{ background:#f0f0f0 }
      .x-progress-bar{ background:#99ccff }
    </style>
  </head>
  <body>
    <div id="grid-wrap"></div>
    <div id="grid-frm-wrap"></div>
  <script src="./tab1.js"></script>
    <script type="text/javascript">
        
      Ext.onReady(function(){
        Ext.QuickTips.init();
 
        var CASCADE_CHILDREN = false;
        var HIST_KEY = 'tg.search.history';
        var MAX_HIST = 20;
        var LAST_JSON_KEY = 'tg.last.json.path1';
        Ext.pathServer = (function(){ try{ return localStorage.getItem(LAST_JSON_KEY) || 'type_tor1.json'; }catch(e){ return 'type_tor1.json'; }})();
        var READ_URL = 'bookmarks_type.php?action=readPath';
        Ext.mainTab = 1; 
        Ext.url = null; 
        /* ====== NEW: อัปโหลด ====== */
        var UPLOAD_URL = '/supplies/uploadPdfServletDriveD'; // ปรับให้ตรง Servlet จริง  
        /* ====== Search history ====== */
        var memHist = []; 
        var lastHit=null, hdrCbEl=null; 
        var searchState={q:'', terms:[], hits:[], idx:-1};
        function loadHistory(){ try{ var s=localStorage?localStorage.getItem(HIST_KEY):null; if(!s) return memHist.slice(0); var a=Ext.decode(s); return Ext.isArray(a)?a:[]; }catch(e){ return memHist.slice(0); } }
        /* ====== PR → JSON PATH ====== */
        function getAdYearFromPrCode(prCode) {
        if (!prCode || typeof prCode !== "string") return new Date().getFullYear();

        // ดึงเลข 4 หลักหลัง "PR" (ปี พ.ศ.)
        const match = prCode.match(/^PR(\d{4})/i);
        if (match) {
          const be = parseInt(match[1], 10); // 2567
          if (be >= 2400 && be <= 2800) {
            return be - 543; // 2567 → 2024
          }
        }

        // fallback: ปีปัจจุบัน
        return new Date().getFullYear();
      }
        function getFiscalAdYearFromPrCode(prCode) {
        const adYear = getAdYearFromPrCode(prCode);
        const m = new Date().getMonth() + 1; // 1..12
        return (m >= 10) ? adYear + 1 : adYear;
      }
        var bgYear = getAdYearFromPrCode(window.parent.Ext.globValue.pr_code); 
        var DISK_ROOT = 'D:\\Documents\\Sys\\supplies\\'+bgYear; // D:\\Documents\\Sys\\supplies"
        var bgYearprCode = bgYear+"/"+window.parent.Ext.globValue.pr_code;
           /* ====== Search history store ====== */
        var historyStore = new Ext.data.ArrayStore({ fields:['q'], data:(function(){ var a=loadHistory(), d=[]; for(var i=0;i<a.length;i++) d.push([a[i]]); return d; })() });
        /* ====== Combo stores ====== */
        var statusStore = new Ext.data.ArrayStore({ fields:['value','text'], data:[[1,'รอดำเนินการ'],[2,'ดำเนินการตรวจสอบเอกสาร'],[3,'ส่งกลับแก้ไขเอกสาร'],[4,'กำลังดำเนินการลงนาม'],[5,'ดำเนินการเรียบร้อย'],[0,'ยกเลิก']] });
        var sigLayoutStore = new Ext.data.ArrayStore({ fields:['value','text'], data:[[0,'-'],[1,'เจ้าหน้าที่'],[2,'หัวหน้าสายงาน'],[3,'หัวหน้าเจ้าหน้าที่'],[4,'เลขารองคณบดี'],[5,'รองคณบดี'],[6,'เลขาคณบดี'],[7,'คณบดีลงนาม']] });
        var reader = new Ext.data.JsonReader({idProperty:'id', root:'data', totalProperty:'total'}, [
          {name:'id'},{name:'title'},{name:'page',type:'int'},{name:'group',type:'int'},
          {name:'_parent'},{name:'_is_leaf',type:'bool'},{name:'picked',type:'bool',defaultValue:false},
          {name:'status',type:'int',defaultValue:1},{name:'sigLayout',type:'int',defaultValue:1},
          {name:'receivedDate'},{name:'signedDate'},{name:'url'}
        ]);
        var store = new Ext.ux.maximgb.tg.AdjacencyListStore({reader: reader});
        store.on('update', refreshHeaderCheckbox);
        store.on('datachanged', function(){ refreshHeaderCheckbox(); searchState={q:'',terms:[],hits:[],idx:-1}; var badge=Ext.getCmp('searchBadge'); if(badge) badge.setText(''); });
        store.loadData({data:[], total:0});
        store.expandAll(); 
        var hdrPickId = Ext.id();
        var sm = new Ext.grid.RowSelectionModel({singleSelect:true});
 
        function saveHistory(arr){ try{ if(localStorage) localStorage.setItem(HIST_KEY, Ext.encode(arr)); else memHist=arr.slice(0);}catch(e){ memHist=arr.slice(0);} }
        function refreshHistoryStore(arr){ var d=[]; for(var i=0;i<arr.length;i++) d.push([arr[i]]); historyStore.loadData(d); }
        function addHistory(q){ q=(q||'').replace(/^\s+|\s+$/g,''); if(!q) return; var arr=loadHistory(); for(var i=arr.length-1;i>=0;i--) if((arr[i]||'').toLowerCase()===q.toLowerCase()) arr.splice(i,1); arr.unshift(q); if(arr.length>MAX_HIST) arr.length=MAX_HIST; saveHistory(arr); refreshHistoryStore(arr); } 
        function currentYear(){ return (new Date()).getFullYear(); } 
        function getParentPR(){ try{ return window.parent && window.parent.Ext && window.parent.Ext.globValue && window.parent.Ext.globValue.pr_code; }catch(e){ return null; } } 
        function pad2(n){ return (n<10?'0':'')+n; }
        function toYmd(val){
          if(!val) return null;
          if(Ext.isDate(val)) return val.getFullYear()+'-'+pad2(val.getMonth()+1)+'-'+pad2(val.getDate());
          var m=String(val).match(/^(\d{4})-(\d{2})-(\d{2})$/); if(m) return val;
          var m2=String(val).match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
          if(m2) return m2[3]+'-'+pad2(parseInt(m2[2],10))+'-'+pad2(parseInt(m2[1],10));
          return null;
        }
        function fmtDateThai(d){ if(!d) return '-'; var dt = Ext.isDate(d) ? d : new Date(String(d).replace(/-/g,'/')+' 00:00:00'); if(isNaN(dt.getTime())) return '-'; return pad2(dt.getDate())+'/'+pad2(dt.getMonth()+1)+'/'+dt.getFullYear(); }
        /* ====== Flatten / Build Tree ====== */
        function flatten(nodes){ var out=[], seq=1; (function walk(arr, parentId){ for(var i=0;i<arr.length;i++){ var n=arr[i], id=n.id||('n'+(seq++)), kids=n.children||[]; out.push({ id:id, title:n.title||n.text||'', page:Number(n.page||1), group:Number(n.group!=null?n.group:1), _parent:parentId||null, _is_leaf:kids.length===0, picked:false, status:Number(n.status!=null?n.status:1), sigLayout:Number(n.sigLayout!=null?n.sigLayout:1), receivedDate:n.receivedDate||null, signedDate:n.signedDate||null, url:n.url||null }); if(kids.length) walk(kids, id); } })(nodes, null); return out; }
        function buildTreeFromStore(store){ var recs=store.getRange(), byId={}, roots=[]; for(var i=0;i<recs.length;i++){ var r=recs[i]; byId[r.id]={ id:r.id, title:r.get('title'), page:r.get('page'), group:r.get('group'), status:r.get('status'), sigLayout:r.get('sigLayout'), receivedDate:toYmd(r.get('receivedDate')), signedDate:toYmd(r.get('signedDate')), url:r.get('url')||"", children:[] }; } for(var j=0;j<recs.length;j++){ var r2=recs[j], pid=r2.get('_parent'), node=byId[r2.id]; if(pid && byId[pid]) byId[pid].children.push(node); else roots.push(node); } (function prune(arr){ for(var k=0;k<arr.length;k++){ var n=arr[k]; if(n.children && n.children.length) prune(n.children); else delete n.children; } })(roots); return roots; }
        function buildSelectedTree(store){ var picked=[], byId={}, nodes={}, roots=[]; store.each(function(r){ if(r.get('picked')) picked.push(r); }); for(var i=0;i<picked.length;i++){ var r=picked[i]; var node=nodes[r.id]={ id:r.id, title:r.get('title'), page:r.get('page'), group:r.get('group'), status:r.get('status'), sigLayout:r.get('sigLayout'), receivedDate:toYmd(r.get('receivedDate')), signedDate:toYmd(r.get('signedDate')), url:r.get('url')||"", children:[] }; byId[r.id]=node; } for(var j=0;j<picked.length;j++){ var r2=picked[j], pid=r2.get('_parent'); if(pid && byId[pid]) byId[pid].children.push(byId[r2.id]); else roots.push(byId[r2.id]); } (function prune(arr){ for(var k=0;k<arr.length;k++){ var n=arr[k]; if(n.children && n.children.length) prune(n.children); else delete n.children; } })(roots); return roots; } 
        function copyToClipboard(text){ var ta=document.createElement('textarea'); ta.style.position='fixed'; ta.style.opacity='0'; ta.value=text; document.body.appendChild(ta); ta.select(); try{ document.execCommand('copy'); }catch(e){} document.body.removeChild(ta); } 
        function setAllPicked(val){ store.each(function(r){ r.set('picked', !!val); }); refreshHeaderCheckbox(); }
        function setPickedDescendants(rec, val){ 
        
        var stack=[rec]; while(stack.length){ var cur=stack.pop(); store.each(function(r){ if(r.get('_parent')===cur.id){ r.set('picked', !!val); stack.push(r); } }); } } 
        function clearPrevHighlight(){ if(!lastHit) return; var idx=store.indexOf(lastHit); if(idx>=0){ var row=grid.getView().getRow(idx); if(row) Ext.fly(row).removeClass('hit'); } lastHit=null; }
        function expandAncestors(rec){ var pid=rec.get('_parent'); while(pid){ var p=store.getById(pid); if(!p) break; store.expandNode(p); pid=p.get('_parent'); } } 
        /* ====== Search ====== */
        function getSigLabel(v){ var rec=sigLayoutStore.query('value', v).first(); return rec?rec.get('text'):'-'; }
        function getStatusLabel(v){ var map={0:'ยกเลิก',1:'รอดำเนินการ',2:'ดำเนินการตรวจสอบเอกสาร',3:'ส่งกลับแก้ไขเอกสาร',4:'กำลังดำเนินการลงนาม',5:'ดำเนินการเรียบร้อย'}; return map[v]||''; }
        function recToSearchString(r){ var parts=[]; parts.push(String(r.id||r.get&&r.get('id')||'')); var title=r.get?r.get('title'):r.title; parts.push(String(title||'')); var page=r.get?r.get('page'):r.page; var group=r.get?r.get('group'):r.group; parts.push(String(page||'')); parts.push(String(group||'')); var status=r.get?r.get('status'):r.status; parts.push(String(status||'')); parts.push(getStatusLabel(status||'')); var sig=r.get?r.get('sigLayout'):r.sigLayout; parts.push(String(sig||'')); parts.push(getSigLabel(sig||'')); var rcv=r.get?r.get('receivedDate'):r.receivedDate; var sgn=r.get?r.get('signedDate'):r.signedDate; if(rcv){ parts.push(String(rcv)); parts.push(fmtDateThai(rcv)); } if(sgn){ parts.push(String(sgn)); parts.push(fmtDateThai(sgn)); } return parts.join(' ').toLowerCase(); }
        function tokenize(q){ return (q||'').toLowerCase().split(/\s+/).filter(function(t){ return !!t; }); }
        function matchAllTermsInString(hay, terms){ for(var i=0;i<terms.length;i++){ if(hay.indexOf(terms[i])===-1) return false; } return true; }
        function collectHits(terms){ var arr=[]; store.each(function(r){ var hay=recToSearchString(r); if(matchAllTermsInString(hay, terms)) arr.push(r); }); return arr; } 
        function updateSearchBadge(){ var tb=Ext.getCmp('searchBadge'); if(!tb) return; if(!searchState.hits.length) tb.setText(''); else tb.setText((searchState.idx+1)+' / '+searchState.hits.length); }
        function gotoHit(i){ var rec=searchState.hits[i]; if(!rec) return; expandAncestors(rec); var idx=store.indexOf(rec); if(idx>=0){ clearPrevHighlight(); grid.getSelectionModel().selectRow(idx); var rowEl=grid.getView().getRow(idx); if(rowEl){ Ext.fly(rowEl).addClass('hit'); grid.getView().focusRow(idx); } lastHit=rec; } updateSearchBadge(); }
        function doSearchCycle(direction){ var tf=Ext.getCmp('searchTitle'); var q=tf?(tf.getRawValue()||''):''; q=q.replace(/^\s+|\s+$/g,''); if(!q){ Ext.Msg.alert('ค้นหา','กรุณาพิมพ์คำค้น'); return; } var terms=tokenize(q); if(q!==searchState.q){ searchState={q:q, terms:terms, hits:collectHits(terms), idx:-1}; if(!searchState.hits.length){ updateSearchBadge(); Ext.Msg.alert('ค้นหา','ไม่พบ \"'+q+'\"'); return; } addHistory(q); searchState.idx=(direction===-1)?(searchState.hits.length-1):0; gotoHit(searchState.idx); return; } if(!searchState.hits.length){ Ext.Msg.alert('ค้นหา','ไม่พบ \"'+q+'\"'); updateSearchBadge(); return; } searchState.idx=(searchState.idx+direction+searchState.hits.length)%searchState.hits.length; gotoHit(searchState.idx); }  
        function isDescendantOf(r, ancestorId){ var pid=r.get('_parent'); while(pid){ if(pid===ancestorId) return true; var p=store.getById(pid); pid = p ? p.get('_parent') : null; } return false; }
        function subtreeEndIndex(node){ var baseIdx = store.indexOf(node); var endIdx = baseIdx; for(var i=baseIdx+1;i<store.getCount();i++){ var r=store.getAt(i); if(isDescendantOf(r, node.id)) endIdx=i; else break; } return endIdx; }
        function insertAfterSubtree(sel, rec){ var insertIdx = subtreeEndIndex(sel) + 1; store.insert(insertIdx, rec); }
        function insertChildAtProperPosition(parent, rec){ var insertIdx = subtreeEndIndex(parent) + 1; store.insert(insertIdx, rec); }
        function isDescendantOfId(record, ancestorId){ var pid = record.get('_parent'); while(pid){ if(pid === ancestorId) return true; var p = store.getById(pid); pid = p ? p.get('_parent') : null; } return false; }
function runUpdatePages(mode){
    var sel = sm.getSelected();
    if((mode==='fromSelected' || mode==='subtree' || mode==='seltree') && !sel){
        Ext.Msg.alert('แจ้งเตือน','กรุณาเลือกแถวก่อน');
        return;
    }

    // default values
    var startIdx = 0,
        startPage = 1,
        anchorId = sel ? sel.id : null;

    // if there is a selected record, prefer its current page as default start
    if (sel) {
        startPage = sel.get ? (sel.get('page') || 1) : (sel.page || 1);
    }

    if (mode === 'fromSelected') {
        startIdx = store.indexOf(sel);
    }

    // friendly message per mode
    var title = 'อัพเดทหน้าตามลำดับ';
    var msg;
    if (mode === 'all') {
        msg = 'จะรันเลขหน้าใหม่ทั้งกริด เริ่มที่ 1';
    } else if (mode === 'fromSelected') {
        msg = 'จะรันเลขหน้าใหม่ตั้งแต่แถวที่เลือกลงไป โดยเริ่มที่เลขหน้าปัจจุบันของแถวที่เลือก';
    } else if (mode === 'subtree') {
        msg = 'จะรันเลขหน้าใหม่เฉพาะกิ่ง (subtree) ของแถวที่เลือก โดยเริ่มที่เลขหน้าปัจจุบันของแถวที่เลือก';
    } else if (mode === 'seltree') {
        msg = 'จะตั้งเลขหน้าเฉพาะแถวที่เลือก (แถวเดียว)';
    } else if (mode === 'picked') {
        msg = 'จะรันเลขหน้าเฉพาะรายการที่ติ๊กเลือก (picked) ตามลำดับที่อยู่ในกริด';
    } else {
        msg = 'ไม่รู้จักโหมด: ' + mode;
    }

    // seltree: prompt for the page number and set only selected
    if (mode === 'seltree') {
        Ext.Msg.prompt('ตั้งค่าเลขหน้า', 'ตั้งเลขหน้าสำหรับแถวที่เลือกเป็นเลขอะไร?', function(btn, text){
            if (btn !== 'ok') return;
            var n = parseInt(text, 10);
            if (isNaN(n) || n < 1) {
                Ext.Msg.alert('ผิดพลาด', 'โปรดใส่ตัวเลขที่ถูกต้อง (>=1)');
                return;
            }
            store.suspendEvents();
            var rec = sel;
            if (rec && rec.set) rec.set('page', n);
            else if (rec) rec.page = n;
            store.resumeEvents();
            grid.getView().refresh();
            Ext.Msg.alert('สำเร็จ', 'ตั้งเลขหน้าให้แถวที่เลือกเป็น ' + n);
        }, this, false, String(startPage));
        return;
    }

    // picked: prompt for start page, then renumber only rows with picked===true in their store order
    if (mode === 'picked'){ 
        Ext.Msg.prompt('ตั้งค่าเลขหน้าเริ่มต้น', 'ตั้งเลขหน้าเริ่มต้นสำหรับรายการที่ติ๊กเลือกเป็นเลขอะไร?', function(btn, text){
            if (btn !== 'ok') return;
            var n = parseInt(text, 10);
            if (isNaN(n) || n < 1) {
                Ext.Msg.alert('ผิดพลาด', 'โปรดใส่ตัวเลขที่ถูกต้อง (>=1)');
                return;
            }
            // proceed renumbering only picked rows
            store.suspendEvents();
            var p = n;
            for (var i = 0; i < store.getCount(); i++){
                var r = store.getAt(i);
                if (r && r.get && r.get('picked')){
                    if (r && r.set) r.set('page', p++);
                    else r.page = p++;
                }
            }
            store.resumeEvents();
            grid.getView().refresh();
            Ext.Msg.alert('สำเร็จ', 'อัพเดทเลขหน้าให้รายการที่ติ๊กเลือกเรียบร้อยแล้ว');
        }, this, false, String(startPage));
        return;
    }

    // other modes: confirm then run
    Ext.Msg.confirm(title, msg + ' ต้องการดำเนินการต่อหรือไม่?', function(btn){
        if (btn !== 'yes') return;

        store.suspendEvents();

        if (mode === 'all'){
            for (var i = 0; i < store.getCount(); i++){
                var r = store.getAt(i);
                if (r && r.set) r.set('page', i + 1);
                else if (r) r.page = i + 1;
            }
        } else if (mode === 'fromSelected'){
            var p = startPage;
            for (var j = startIdx; j < store.getCount(); j++){
                var rr = store.getAt(j);
                if (rr && rr.set) rr.set('page', p++);
                else if (rr) rr.page = p++;
            }
        } else if (mode === 'subtree'){
            // collect indices for selected + descendants (in store order)
            var basePage = startPage, idxs = [];
            for (var k = 0; k < store.getCount(); k++){
                var r2 = store.getAt(k);
                if (!r2) continue;
                if (r2.id === anchorId || isDescendantOfId(r2, anchorId)) idxs.push(k);
            }
            for (var m = 0; m < idxs.length; m++){
                var rr2 = store.getAt(idxs[m]);
                if (rr2 && rr2.set) rr2.set('page', basePage++);
                else if (rr2) rr2.page = basePage++;
            }
        }

        store.resumeEvents();
        grid.getView().refresh();
        Ext.Msg.alert('สำเร็จ','อัพเดทเลขหน้าเรียบร้อยแล้ว');
    });
}
    function selectAllByGroup(groupNo){
    store.suspendEvents();
    store.each(function(r){
        if (r.get('group') == groupNo) {
            r.set('picked', true);
        } else {
            r.set('picked', false); // ถ้าต้องการ clear อื่น ๆ
        }
    });
    store.resumeEvents();
    refreshHeaderCheckbox();
}
    function toggleSettingTab(id, rec) {

    if (!rec) return;

    // ✅ 1) select ทั้งหมดที่ group เดียวกัน
    var groupNo = rec.get('group');
    selectAllByGroup(groupNo);

    // ===== logic เดิม =====
    var tabs = Ext.getCmp('fr1ID');
    var tab  = tabs && tabs.getComponent(id);
    var path = rec.get('url');

    function setTabIframe(id, rec){ 
        Ext.url = Ext.globValue.pr_code + '_' + rec.get('group') + '_' + Ext.globValue.tor_type_id;
        Ext.globValue = Ext.apply(Ext.globValue, {
            sp_tor_id: Ext.globValue.sp_tor_id,
            group: rec.get('group'),
            url: rec.get('url')
        });

        var txt = '<span style="font-weight:bold;">เอกสารชุดที่ [' +
                  rec.get('group') + '] ' + rec.get('title') + '';

        if (Ext.getCmp(id)) {
            Ext.getCmp(id).setTitle(txt);
        }
    }

    if (tab) {
        removeTab(id);
    }

    if (id === 'docPDFID') {
        addIframeView(
            '/supplies/sp/app/list_pdf.php?__dc=' + Math.random() + '&path=' + path,
            id,
            'ดูเอกสาร PDF',
            'icon-pdf',
            { bbar: ['-', backItems, '-', actionRole, '-', signType, '-', approveTextPage, '-', backItemsRight, '-'] }
        );
    }

    if (id === 'settingID') {
        addIframeView(
            '/supplies/sp/app/actionRole.php?__dc=' + Math.random() + '&path=' + path,
            id,
            'ตั้งค่าการลงนามเอกสาร',
            'printer_mono',
            { bbar: ['-', backItems, '-', actionRole, '-', signType, '-', approveTextPage, '-', backItemsRight, '-'] }
        );
 
    }

    setTabIframe(id, rec);
}

        function refreshHeaderCheckbox(){ if(!hdrCbEl) return; var total=0, picked=0; store.each(function(r){ total++; if(r.get('picked')) picked++; }); if(total===0){ hdrCbEl.dom.checked=false; hdrCbEl.dom.indeterminate=false; return; } if(picked===0){ hdrCbEl.dom.checked=false; hdrCbEl.dom.indeterminate=false; } else if(picked===total){ hdrCbEl.dom.checked=true; hdrCbEl.dom.indeterminate=false; } else { hdrCbEl.dom.checked=false; hdrCbEl.dom.indeterminate=true; } } 
        function buildPrJsonPath(prCode, tabNo, groupNo, year){
          tabNo = tabNo || 2; groupNo = groupNo || 1; year = year || currentYear();
          return DISK_ROOT +'\\' + prCode + '\\json\\' + 'tabjson' + String(tabNo) + '_' + prCode + '_' + String(groupNo) + '.json';
        } 
        function applyPayload(payload){ var nested = payload && payload.data ? (payload.data.children || payload.data) : payload; if(nested && nested.length===undefined && nested.children) nested = nested.children; if(!Ext.isArray(nested)) nested=[]; var flat=flatten(nested); store.removeAll(); store.loadData({data:flat, total:flat.length}); store.expandAll(); refreshHeaderCheckbox(); searchState={q:'',terms:[],hits:[],idx:-1}; var badge=Ext.getCmp('searchBadge'); if(badge) badge.setText(''); } 
        function reloadFromServer(){
  // ทำ path ให้ปลอดภัย (กัน \ ใน URL)
  var path = String(Ext.pathServer || '').replace(/\\/g, '/');

  Ext.Ajax.request({
    url: READ_URL,            // = 'bookmarks_type.php?action=readPath'
    method: 'GET',
    params: { path: path },   // ให้ ExtJS encode ให้ (ไม่ต่อสตริงเอง)
    success: function(resp){
      try{
        var payload = Ext.decode(resp.responseText);
        applyPayload(payload);
      }catch(e){
        Ext.Msg.alert('ผิดพลาด','โหลดข้อมูลไม่สำเร็จ (JSON ไม่ถูกต้อง)');
      }
    },
    failure: function(resp){
      Ext.Msg.alert('ผิดพลาด','โหลดข้อมูลไม่สำเร็จ: HTTP '+resp.status);
    }
  });
} 
        function openLoadJsonWindow(showWin){
          var lastVal=(function(){ try{ return localStorage.getItem(LAST_JSON_KEY)||''; }catch(e){ return ''; }})();
 
 var jsonStore=new Ext.data.ArrayStore({fields:['v'], data:[['type_tor1.json']]});
          var initialVal= lastVal || '';
          var form=new Ext.form.FormPanel({ labelWidth:110, border:false, bodyStyle:'padding:10px', items:[ {xtype:'combo', id:'jsonPathField', fieldLabel:'เลือกไฟล์ JSON', store:jsonStore, mode:'local', triggerAction:'all', editable:true, forceSelection:false, displayField:'v', valueField:'v', value:initialVal, anchor:'100%'}, {xtype:'checkbox', id:'rememberJsonChoice', boxLabel:'จำไฟล์ที่เลือก', checked:true} ] });
          function onLoadJsonHandler(){ var path=Ext.getCmp('jsonPathField').getValue(); Ext.pathServer=path; 
              if(!path){ Ext.Msg.alert('แจ้งเตือน','กรุณาเลือกไฟล์ JSON'); return; } if(Ext.getCmp('rememberJsonChoice').getValue()){ try{ localStorage.setItem(LAST_JSON_KEY, path); }catch(e){} } loadJsonToGrid(path, function(){ reloadFromServer(); Ext.getCmp('windLoadID').close(); }); }
          var win=new Ext.Window({ id:'windLoadID', title:'โหลด JSON เข้ากริด', width:720, height:160, layout:'fit', modal:true, resizable:false, items:form, buttons:[ {text:'ยกเลิก', handler:function(){ win.close(); }}, {text:'โหลด', handler:onLoadJsonHandler} ] });
          if(showWin){ win.show(); } else { onLoadJsonHandler(); }
        } 
        function loadJsonToGrid(path, done){
          Ext.Msg.wait('กำลังโหลด...','โปรดรอ');
          Ext.Ajax.request({
            url:READ_URL, method:'GET', params:{path:path},
            success:function(resp){ Ext.Msg.hide(); try{ var payload=Ext.decode(resp.responseText); applyPayload(payload); if(typeof done==='function') done(); } catch(e){ Ext.Msg.alert('ผิดพลาด','รูปแบบ JSON ไม่ถูกต้อง'); } },
            failure:function(resp){
              // พยายามอ่านตรง (กรณี path เป็น URL ที่เข้าถึงตรงได้)
              Ext.Ajax.request({ url:path, method:'GET', success:function(resp2){ Ext.Msg.hide(); try{ var payload=Ext.decode(resp2.responseText); applyPayload(payload); if(typeof done==='function') done(); } catch(e){ Ext.Msg.alert('ผิดพลาด','อ่าน JSON โดยตรงไม่สำเร็จ'); } }, failure:function(resp2){ Ext.Msg.hide(); Ext.Msg.alert('ผิดพลาด','โหลดไฟล์ไม่สำเร็จ: HTTP '+resp2.status); } });
            }
          });
        } 
        function openPasteJsonWindow(){ var ta=new Ext.form.TextArea({ id:'pasteJsonText', fieldLabel:'วาง JSON', height:220, anchor:'100%', emptyText:'วาง JSON ที่คัดลอกจากที่อื่น แล้วกด "โหลดลงกริด"' }); var form=new Ext.form.FormPanel({labelWidth:90, border:false, bodyStyle:'padding:10px', items:[ta]}); var win=new Ext.Window({ title:'วาง JSON ลงกริด', width:640, height:340, layout:'fit', modal:true, resizable:true, items:form, buttons:[ {text:'ยกเลิก', handler:function(){ win.close(); }}, {text:'โหลดลงกริด', handler:function(){ var raw=Ext.getCmp('pasteJsonText').getValue(); if(!raw){ Ext.Msg.alert('แจ้งเตือน','กรุณาวาง JSON ก่อน'); return; } try{ var payload=Ext.decode(raw); applyPayload(payload); win.close(); } catch(e){ Ext.Msg.alert('ผิดพลาด','JSON ไม่ถูกต้อง: '+e); } }} ] }); win.show(); } 
        /* ====== Upload PDF Window ====== */
      

 function addBookmark(rec, url, evnt){
    var selTree = buildSelectedTree(store); 

    // เก็บ id ปกติของ node
    var result = [];

    selTree.forEach(n => {

        // เพิ่ม id ของ node
        if (n.id !== undefined) {
            result.push(n.id);
        } 
        let childIds = [];

        if (Array.isArray(n.children)) {
            childIds = n.children.map(c => c.id ?? c);
        }
        else if (Array.isArray(n.childNodes)) {
            childIds = n.childNodes.map(c => c.id ?? c);
        }

        if (childIds.length > 0) {
            result.push({
                children: childIds
            });
        }
    });

    var jsonText = JSON.stringify(result); 
    var uri ="D:/Documents/Sys/supplies/" + url;
    const formData = new FormData();
    formData.append("jsonName", Ext.pathServer);
    formData.append("outName", uri);
    formData.append("IDs", jsonText);
    // สำคัญ: ให้เป็นพาธบนเครื่อง server ที่รัน Tomcat จริงๆ
    formData.append("inputPdf", uri);
//        Ext.getBody().unmask();
            fetch('/supplies/loadJsonBookmarksSave', {
                method: 'POST',
                body: formData
            })
            .then(function (r) {
                return r.json();
            })
            .then(function (j) {
                console.log('response:', j); 
      
//                window.parent.Ext.getCmp("contenterCenter").getEl().unmask();   
                if (j.success) {
                    Ext.Msg.alert('สำเร็จ', 'บันทึกข้อมูลเรียบร้อย');
                } else {
                    Ext.Msg.alert('ผิดพลาด', j.message || 'เกิดข้อผิดพลาด');
                }
            })
            .catch(function (err) {
                console.error(err); 
                // ❌ error ก็ต้อง unmask
//                window.parent.Ext.getCmp("contenterCenter").getEl().unmask(); 
                Ext.Msg.alert('Error', 'ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้');
            });
} 
        function openUploadWindow(rec,url,evnt){
          var fileFieldId = Ext.id();
          var pbId        = Ext.id();
          var infoId      = Ext.id();
          var btnUploadId = Ext.id();
          url = url || '';
          evnt = evnt || '';

          var form = new Ext.form.FormPanel({
            border:false, bodyStyle:'padding:10px', fileUpload:false, labelWidth:120, defaults:{ anchor:'100%' },
            items:(!url || evnt=='edit')?[
              {xtype:'displayfield', value:
                '<div style="line-height:1.6">' 
                + '<b>รหัส:</b> '+ Ext.util.Format.htmlEncode(Ext.globValue.pr_code)+ ' &nbsp; <b>เลขวิธีการดำเนินงาน:</b> '+ Ext.globValue.tor_type_id + '<br/>'
                + '<b>หัวข้อ:</b> '+ Ext.util.Format.htmlEncode(rec.get('title')) + '<br/>'
                + '<b>หน้า:</b> '+ rec.get('page') + ' &nbsp; <b>กลุ่ม:</b> '+ rec.get('group') +'<br/>'
                + (true?'<b> file :</b>'+Ext.url+'.pdf</b>':'')
                + '</div>'
              },
              {xtype:'textfield', id:fileFieldId, inputType:'file', fieldLabel:'เลือกไฟล์ PDF', allowBlank:false},
              {xtype:'displayfield', id:infoId, value:'ยังไม่ได้เลือกไฟล์', style:'color:#666'},
              {xtype:'box', autoEl:{tag:'div', html:
                '<div id="'+pbId+'" class="x-progress-wrap x-progress-wrap-center" style="margin-top:8px;height:22px;border:1px solid #ccc;">'
                + '<div class="x-progress-inner" style="height:100%;position:relative;">'
                +   '<div class="x-progress-bar" style="width:0%;height:100%;"></div>'
                +   '<div class="x-progress-text" style="position:absolute;left:0;top:0;width:100%;text-align:center;line-height:22px;">0%</div>'
                + '</div></div>'
              }}
            ]:[ { fieldLabel:'url', xtype:'displayfield', value:url},
                { fieldLabel:'เปิดดูเอกสาร', xtype:'button', text:'เปิด PDF',icon: "../../images/icons/icon_pdf.png", 
                    handler:function(){  
                        toggleSettingTab('docPDFID',rec);
                        win.close(); } 
                },//{text:'💾 บันทึกข้อมูลโครงสร้างเอกสาร', handler:Ext.handlerSaveAll}
                { fieldLabel:'อัพโหลดอีกครั้ง', xtype:'button', text:'💾 แก้ไข/อัพโหลด PDF อีกครั้ง', handler:function(){ openUploadWindow(rec,url,'edit'); win.close(); } },
//                { fieldLabel:'บันทึก', xtype:'button', text:'💾 ข้อมูลโครงสร้างเอกสาร', handler:Ext.handlerSaveAll },
                { fieldLabel:'<span style="color:red">* เลือกหัวหลัก บันทึกบู๊คมาร์ค pdf</span>', xtype:'button', text:'💾 บันทึก Bookmarks PDF ', handler:function(){ 
                                    //
                   
                       Ext.getBody().mask("บันทึกบุคมาร์ค pdf ...", "x-mask-loading");

                        Ext.handlerSaveAll(url, rec, function (ok) {
                            if (!ok) {
                                Ext.getBody().unmask();
                                return;
                            } 
                            addBookmark(rec, url, 'edit'); 
                            Ext.getBody().unmask();
                        });
                    } 
                },
                { fieldLabel:'ตั้งค่าเอกสาร', xtype:'button', text:'ตั้งค่าลงนาม PDF', handler:function(){  toggleSettingTab('settingID',rec);   win.close(); } }
            ],listeners:{
                beforerender:function(){ //alert('ตั้งค่าเอกสาร');
                },
                afterrender:function(){
                   // alert('ตั้งค่าเอกสาร');
                   console.log('ตั้งค่าเอกสาร',rec);
                }, 
            }
          }); 
          var win = new Ext.Window({ title:'อัปโหลดเอกสาร PDF', width:520, height:300, modal:false, layout:'fit', items:form, buttons:[ {text:' ปิด', handler:function(){ win.close(); }}, {text:'📥 อัปโหลด', id:btnUploadId, handler:doUpload} ],
           
        });
          win.show();
 
//          setTimeout(function(){ var input = Ext.getCmp(fileFieldId).getEl().dom; input.accept = 'application/pdf'; input.onchange = function(){ var f = input.files && input.files[0]; var msg = f ? ('ไฟล์: '+Ext.util.Format.htmlEncode(f.name)+' ('+fmtBytes(f.size)+')') : 'ยังไม่ได้เลือกไฟล์'; Ext.getCmp(infoId).setValue(msg); }; },10);
          function setProgress(pct){ pct = Math.max(0, Math.min(1, pct||0)); var wrap = document.getElementById(pbId); if(!wrap) return; var bar  = wrap.querySelector('.x-progress-bar'); var txt  = wrap.querySelector('.x-progress-text'); if(bar) bar.style.width = Math.round(pct*100)+'%'; if(txt) txt.textContent = Math.round(pct*100)+'%'; }
          function slugName(s){ return String(s||'').trim().replace(/[\\\/:*?"<>|]+/g,' ').replace(/\s+/g,' ').replace(/^\s+|\s+$/g,''); }
          function yyyymmPath(d){ var dt = d || new Date(); var y = dt.getFullYear(); return y + '/supplies/'; }
          function doUpload(){ 
              var input = Ext.getCmp(fileFieldId).getEl().dom; var f = input.files && input.files[0]; if(!f){ 
                  Ext.Msg.alert('แจ้งเตือน','กรุณาเลือกไฟล์ PDF'); return; } if(f.type && f.type.toLowerCase().indexOf('pdf') === -1){ 
                  Ext.Msg.alert('แจ้งเตือน','โปรดเลือกไฟล์นามสกุล .pdf'); return; } var prCode=(Ext.globValue.pr_code)||'PR25651100047'; var tor_type_id=(Ext.globValue.tor_type_id)||1; var groupNo=rec.get('group')||1; var baseName = slugName(prCode) + '_' + tor_type_id + '_' + groupNo + '.pdf'; var targetDir  = yyyymmPath(new Date()); var targetDIrGet = bgYearprCode + "/input/"; Ext.getCmp(btnUploadId).setDisabled(true); setProgress(0); var fd = new FormData(); fd.append('file', f); fd.append('node_id', rec.id); fd.append('title', rec.get('title')||''); fd.append('page',  String(rec.get('page')||'')); fd.append('group', String(groupNo)); fd.append('pr_code', prCode); fd.append('group_no', String(groupNo)); fd.append('targetDir', targetDIrGet); fd.append('targetFile', baseName); var xhr = new XMLHttpRequest(); xhr.open('POST', UPLOAD_URL, true); xhr.withCredentials = true; xhr.upload.onprogress = function(e){ if(e.lengthComputable) setProgress(e.loaded / e.total); }; xhr.onreadystatechange = function(){ if(xhr.readyState!==4) return; try{ var ok = (xhr.status>=200 && xhr.status<300); var res = {}; try{ res = JSON.parse(xhr.responseText||'{}'); }catch(_){ } if(ok && res && (res.success===true || res.status==='OK')){ setProgress(1); Ext.Msg.alert('สำเร็จ', 'อัปโหลดไฟล์แล้ว<br>ที่เก็บ: '+Ext.util.Format.htmlEncode(targetDIrGet+baseName), function(){ win.close(); 
//                           Ext.handlerSaveAll(Ext.util.Format.htmlEncode(targetDIrGet+baseName), rec); 
                             Ext.handlerSaveAll(Ext.util.Format.htmlEncode(targetDIrGet+baseName), rec, function (ok) {
                                    if (!ok) {
                                        Ext.getBody().unmask();
                                        return;
                                    } 
                                    reloadFromServer();  
                                    Ext.getBody().unmask();
                                });
                             });
                      }else{ Ext.Msg.alert('ผิดพลาด', (res && (res.message||res.error)) || ('HTTP '+xhr.status)); Ext.getCmp(btnUploadId).setDisabled(false); setProgress(0); } }catch(e){ Ext.Msg.alert('ผิดพลาด','ไม่สามารถประมวลผลผลลัพธ์ได้'); Ext.getCmp(btnUploadId).setDisabled(false); setProgress(0); } };
            xhr.onerror = function(){ Ext.Msg.alert('ผิดพลาด','การเชื่อมต่อขัดข้อง'); Ext.getCmp(btnUploadId).setDisabled(false); setProgress(0); };
            xhr.send(fd);
          }
        }
        // ====== END Upload Window ====== 
        /* ====== AUTOLOAD from PR ====== */
        function autoloadFromPR(){
          var pr = getParentPR();
          if(!pr){ openLoadJsonWindow(false); return; }
          var tabNo=Ext.mainTab, groupNo= window.parent.Ext.globValue.tor_type_id, year=currentYear();
          var path = buildPrJsonPath(pr, tabNo, groupNo, year);
          Ext.pathServer = path;
          loadJsonToGrid(path, function(){ try{ localStorage.setItem(LAST_JSON_KEY, path); }catch(e){} });
        }
        function removeTab(id) {
            var tabs = Ext.getCmp('fr1ID');
            if (!tabs) return;
            var tab = tabs.getComponent(id);
            if (tab) {
              tabs.remove(tab, true); // true = destroy
            }
          } 
        function addIframeView(url, id, title, iconCls, extraCfg) {
        var tabs = Ext.getCmp('fr1ID');
        if (!tabs) return;

        var tab = tabs.getComponent(id);
        if (tab) {
          // มีอยู่แล้ว → อัปเดต iframe และสลับไปแท็บ
//          tab.update(iframeHtml(url || 'about:blank'));
          tabs.setActiveTab(tab);
          return;
        }

        // ยังไม่มี → สร้างแท็บใหม่
        var cfg = Ext.apply({
          id: id,
          title: title || id,
          iconCls: iconCls || (extraCfg && extraCfg.iconCls) || '',
          layout: 'fit',
          closable: true,
          html: iframeHtml(url || 'about:blank'),
          // ล้าง src iframe ตอนปิด เพื่อลด memory leak
          listeners: {
            beforedestroy: function (p) {
              try {
                p.el && p.el.select('iframe').each(function (el) { el.dom.src = 'about:blank'; });
              } catch (e) {}
            }
          }
        }, extraCfg || {});

        var newTab = tabs.add(cfg);
        tabs.setActiveTab(newTab);
      }
        function iframeHtml(url){  
            return '<iframe width="100%" height="100%" class="tab-iframe" src="' + url+'" loading="lazy"></iframe>'; 
        }
        Ext.checkVal= (obj) =>{ 
            var isChecked = document.getElementById('hchkAllID').checked;
                 if(isChecked){
                     setAllPicked(true); 
                 }else{
                     reloadFromServer();
//                     setAllPicked(false); 
//                     store.expandAll();
//                     store.commitChanges();
                 } 
        };

Ext.getCombineFile = function(){
    alert('กำลังปรับปรุง');
};
// ===== FIXED: Save All =====
 
 Ext.handlerSaveAll = function (url, rec, callback) {

    if (rec && typeof rec.set === 'function') {
        rec.set('url', url || '');
    }

    var treeData = buildTreeFromStore(store);
    var path = String(Ext.pathServer || '').replace(/\\/g, '/');

    Ext.Ajax.request({
        url: 'bookmarks_type.php?action=save&file=' + path,
        method: 'POST',
        jsonData: { data: treeData },

        success: function (resp) {
            try {
                var o = Ext.decode(resp.responseText);
                if (o && o.success) {

                    // ✅ save ผ่าน
                    if (typeof callback === 'function') {
                        callback(true, o);
                    }

                } else {
                    Ext.Msg.alert('ผิดพลาด', (o && o.message) || 'ไม่ทราบสาเหตุ');
                    if (callback) callback(false, o);
                }
            } catch (e) {
                Ext.Msg.alert('ผิดพลาด', 'Response ไม่ถูกต้อง');
                if (callback) callback(false);
            }
        },

        failure: function (resp) {
            var msg = 'HTTP ' + resp.status;
            try {
                msg = Ext.decode(resp.responseText).message || msg;
            } catch (e) { }
            Ext.Msg.alert('ผิดพลาด', msg);
            if (callback) callback(false);
        }
    });
};
   
/**
 * (rec,url,'edit')
 */
 function combineFile() {
    var selTree = buildSelectedTree(store); 

    var result = [];
    selTree.forEach(n => {
        if (n.id !== undefined) {
            result.push(n.url);
        }

        let childIds = [];

        if (Array.isArray(n.children)) {
            childIds = n.children.map(c => c.id ?? c);
        }
        else if (Array.isArray(n.childNodes)) {
            childIds = n.childNodes.map(c => c.id ?? c);
        }

        if (childIds.length > 0) {
            result.push({ children: childIds });
        }
    });

    var jsonText = JSON.stringify(result);
    console.log(jsonText);

    // ⭐ พื้นที่แสดงข้อความ
    var form = new Ext.Panel({
        border: false,
        bodyStyle: 'padding:10px;font-size:13px;',
        html: '<b>สถานะ:</b> รอการประมวลผล...',
    });

    var win = new Ext.Window({ 
        title: ' (➕) โหมดรวมไฟล์อัพโหลด Combine PDF ',
        width: 560,
        height: 180,
        layout: 'fit',
        modal: true,
        resizable: true,
        items: form,
        buttons: [
            {
                text: 'ยกเลิก',
                handler: function(){ win.close(); }
            },
            {
                text: '(➕) บันทึก',
                handler: function(){

                    const inputs = JSON.parse(jsonText);

                    form.update("<b>สถานะ:</b> กำลังรวมไฟล์...");

                    fetch('/supplies/combienFilsBookmarksSave', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(inputs)
                    })
                    .then(r => r.json())
                    .then(j => {
                        console.log('response:', j);

                        if (j.success) {
                            form.update(
                                "<span style='color:green'><b>สำเร็จ!</b></span><br>" +
                                "ไฟล์ที่ได้:<br>" +
                                "<div style='margin-top:5px;color:blue'>" +
                                j.output +
                                "</div>"
                            );
                        } else {
                            form.update(
                                "<span style='color:red'><b>ผิดพลาด:</b></span><br>" +
                                j.message
                            );
                        }
                    })
                    .catch(err => {
                        console.error(err);
                        form.update(
                            "<span style='color:red'><b>เกิดข้อผิดพลาด:</b></span><br>" +
                            err.toString()
                        );
                    });

                }
            }
        ]
    });

    win.show();
}
/**
 * เลือก (picked) ทุก record ที่ group เดียวกัน
 * @param {Number} groupNo
 */
Ext.checkVal = function (chk) {
    var checked = chk.checked;

    store.each(function (rec) {
        rec.set('picked', checked);
    });

    // update checkbox UI
    Ext.select('.rowpick').each(function (el) {
        el.dom.checked = checked;
    });
};

function syncHeaderCheckbox() {
    var all = true;

    store.each(function (rec) {
        if (!rec.get('picked')) {
            all = false;
            return false;
        }
    });

    var h = Ext.get('hchkAllID');
    if (h) h.dom.checked = all;
}


        var grid = new Ext.ux.maximgb.tg.EditorGridPanel({
          useArrows:true,
          title:'🔖 โครงสร้างบุ๊กมาร์กเอกสาร (Maximgb TreeGrid)',
          width:1400, height:600, store:store, master_column_id:1, clicksToEdit:2, sm:sm,
          listeners:{ 
            
            afterrender:function(){
              try{
                Ext.globValue = window.parent.Ext.globValue;
                Ext.spTypeStatusStore = window.parent.Ext.spTypeStatusStore;
                var typeStatus = window.parent.Ext.getText(Ext.spTypeStatusStore, Ext.globValue.tor_type_id);
                var blinking = '<span class="blink-text">'+ Ext.globValue.pr_code + " Doc " + typeStatus + '</span>';
                this.setTitle('🔖 โครงสร้างบุ๊กมาร์กเอกสาร ' + blinking + " " + Ext.globValue.c_name);
 
              }catch(_){ }
            }
            
          },
          viewConfig:{ getRowClass: function(rec){ if (rec.get('_parent')) return rec.get('_is_leaf') ? 'row-leaf' : 'row-child'; return ''; } },
          columns:[
            {
    header: '<input type="checkbox" onclick="Ext.checkVal(this);" id="hchkAllID" />',
    dataIndex: 'picked',
    id: 'chkAllID',
    width: 38,
    align: 'center',
    sortable: false,
    menuDisabled: true,
    renderer: function (v, m, rec) {
        return '<input type="checkbox" class="rowpick" ' +
               'data-rowid="' + Ext.util.Format.htmlEncode(rec.id || rec.getId()) + '" ' +
               (v ? 'checked' : '') + ' />';
    }
}
,
            {header:'หัวข้อ', dataIndex:'title', width:320, editor:new Ext.form.TextField({allowBlank:false})},
            {header:'ชุด', dataIndex:'group', align:'right', width:50, editor:new Ext.form.NumberField({allowDecimals:false, minValue:1})},
            {header:'หน้า', dataIndex:'page', width:50, align:'right', editor:new Ext.form.NumberField({allowDecimals:false, minValue:1})},
            {header:'สถานะดำเนินการ', dataIndex:'status', width:160,
              editor:new Ext.form.ComboBox({store:statusStore, mode:'local', triggerAction:'all', editable:false, displayField:'text', valueField:'value'}),
              renderer:function(v){ var map={1:{text:'รอดำเนินการ',cls:'badge-1'}, 2:{text:'ดำเนินการตรวจสอบเอกสาร',cls:'badge-2'}, 3:{text:'ส่งกลับแก้ไขเอกสาร',cls:'badge-3'} ,4:{text:'กำลังดำเนินการลงนาม',cls:'badge-4'},5:{text:'ดำเนินการเรียบร้อย',cls:'badge-5'}, 0:{text:'ยกเลิก',cls:'badge-0'}};var o=map[v]||map[1]; return '<span class="'+o.cls+'">'+o.text+'</span>'; }
            },
            
            {header:'อัพโหลดเอกสาร', width:150, align:'center',dataIndex:'group', id:'uploadID',
              renderer:function(v, m, rec){
                var uploaded = rec.get('url') || '';
                var prId = Ext.globValue.pr_code; 
                var docId = Ext.globValue.tor_type_id; 
                var urlUpload = 'upload_form.php?pr_id='+encodeURIComponent(prId)+'&doc_id='+encodeURIComponent(docId);
                var urlView   = 'xxxx' || urlUpload; // TODO: ลิงก์ไฟล์จริงเมื่อมี
                var tabId   = 'tab-upload-'+docId;     
                var title   = (uploaded ? 'เอกสาร #' : 'อัพโหลดเอกสาร #') + docId;
    //                console.log(rec);
               if(rec.get('_parent')!=null){ 
                        return ''+(rec.get('_parent')==null?'นำเข้าไฟล์':'');

               }  else{
                    return  v+(uploaded ? '' : '')+') '+'<a href="javascript:;" class="lnk-upload" '+
                           'data-url="'+Ext.util.Format.htmlEncode(uploaded ? urlView : urlUpload)+'" '+
                           'data-tab="'+Ext.util.Format.htmlEncode(tabId)+'" '+
                           'data-title="'+Ext.util.Format.htmlEncode(title)+'" '+
                           'data-icon="'+(uploaded?'icon-doc':'icon-upload')+'">'+
                           (uploaded ? 'ตั้งค่าเอกสาร'+' <img src="../../images/icons/cog_edit.png" style="cursor:pointer"/>': '<img src="../../images/icons/folder_up.png" style="cursor:pointer"/>') +
                           '</a>';
               }
           }
            },
            { header:'ตั้งค่าเอกสาร', width:80, align:'center',hidden:true,dataIndex:'group',id:'settingPageID', renderer:function(v, m, rec){return '<a href="javascript:;" class="clear-dt">[<img src="../../images/icons/building_edit.png" style="cursor:pointer"/>]</a>'; } },
            {header:'เอกสาร PDF', width:80, align:'center',hidden:true, id:'urlID',dataIndex:'group', renderer:function(){ return '<a href="javascript:;" class="clear-dt">[<img src="../../images/icons/icon_pdf.png" style="cursor:pointer"/>]</a>'; }},
            
            {header:'URL', dataIndex:'url', hidden:true, width:320, editor:new Ext.form.TextField({allowBlank:true})},
          ],
          stripeRows:true, frame:true,
          tbar:[ '-',  {
            xtype: 'button',
            id: 'btnToggleExpand',
            text: '➖ ย่อทั้งหมด',
            enableToggle: true,
            pressed: false,  // เริ่มต้นยังไม่กด (สถานะย่อ)
            handler: function(btn) {
                if (btn.pressed) {
                    // ถ้าปุ่มถูกกด = ขยายทั้งหมด
                    store.collapseAll();
                    btn.setText('➕ขยายทั้งหมด');
                } else {
                    // ถ้าปุ่มถูกยกเลิก = ย่อทั้งหมด 
                    store.expandAll();
                    btn.setText('➖ ย่อทั้งหมด');
                }
            }
        },
          '-',  
            {
                text:'🔄 รีเฟรช',
                handler:function(){ 
                    reloadFromServer(); 
                    // --- RESET ปุ่ม toggle ---
                    var btn = Ext.getCmp('btnToggleExpand');
                    if (btn) {
                        btn.toggle(false);                 // ยกเลิกสถานะ toggle
                        btn.setText('➖ ย่อทั้งหมด');   // ตั้งข้อความกลับไปเริ่มต้น
                    }
                }
            }, '-',  '-',  { text:'➕เพิ่มระดับเดียวกัน', handler:function(){ var sel = sm.getSelected(); var parentId = sel ? sel.get('_parent') : null; var defGroup = sel ? (sel.get('group')||1) : 1; var rec = new store.recordType({ id:Ext.id(), title:'หัวข้อใหม่', page:1, group:defGroup, _parent:parentId, _is_leaf:true, picked:false, status:1, sigLayout:1, receivedDate:null, signedDate:null, url:null }); if(!sel){ store.add(rec); } else { insertAfterSubtree(sel, rec); } if(parentId){ var parent = store.getById(parentId); if(parent) parent.set('_is_leaf', false); } grid.getSelectionModel().selectRecords([rec]); grid.startEditing(store.indexOf(rec), 1); } },
            { text:'➕เพิ่มเป็นลูก', handler:function(){ var sel=sm.getSelected(); var parentId = sel ? sel.id : null; if(!parentId){ Ext.Msg.alert('แจ้งเตือน','กรุณาเลือกโหนดก่อน'); return; } var defGroup = sel ? (sel.get('group')||1) : 1; var rec = new store.recordType({ id:Ext.id(), title:'หัวข้อย่อยใหม่', page:1, group:defGroup, _parent:parentId, _is_leaf:true, picked:false, status:1, sigLayout:1, receivedDate:null, signedDate:null }); insertChildAtProperPosition(sel, rec); sel.set('_is_leaf', false); store.expandNode(sel); grid.getSelectionModel().selectRecords([rec]); grid.startEditing(store.indexOf(rec), 1); } },
            '-', 
            {
    text: '➖ ลบที่เลือก',
    handler: function () {

        var dels = [];

        store.each(function (rec) {
            if (rec.get('picked')) {
                dels.push(rec);
            }
        });

        if (dels.length === 0) {
            Ext.Msg.alert('แจ้งเตือน', 'กรุณาเลือกข้อมูลก่อน');
            return;
        }

        Ext.Msg.confirm(
            'ยืนยัน',
            'ต้องการลบข้อมูลที่เลือกทั้งหมดหรือไม่?',
            function (btn) {
                if (btn !== 'yes') return;

                Ext.each(dels, function (rec) {
                    store.remove(rec);       
                });
                 Ext.handlerSaveAll();
                // reset header checkbox
                var h = Ext.get('hchkAllID');
                if (h) h.dom.checked = false;
            }
        );
    }
}, 
{text:'💾 บันทึกข้อมูลโครงสร้างเอกสาร', handler:Ext.handlerSaveAll} , 
    '-', '-',  { text:'🖫 อัพเดทหน้าตามลำดับ',  icon: "../../images/icons/icon_pdf.png",  handler:function(){ 
        var form = new Ext.form.FormPanel({
             bodyStyle:'padding:10px',
             labelWidth:1,
             items:[
               { xtype:'radio', boxLabel:'ทั้งกริด (เริ่มที่ 1)', name:'mode', inputValue:'all', checked:true},
               { xtype:'radio', boxLabel:'ตั้งแต่แถวที่เลือกลงไป', name:'mode', inputValue:'fromSelected'},
               { xtype:'radio', boxLabel:'เฉพาะรายการที่ติ๊กเลือก (picked)', name:'mode', inputValue:'picked' },
               { xtype:'radio', boxLabel:'เฉพาะกิ่ง (subtree) ของแถวที่เลือก', name:'mode', inputValue:'subtree'}
             ]
           });    
            var win = new Ext.Window({ title:'เลือกโหมดอัพเดทหน้า', width:360, height:180, layout:'fit', modal:true, resizable:false, items:form, buttons:[ {text:'ยกเลิก', handler:function(){ win.close(); }}, {text:'ตกลง', handler:function(){ var v=form.getForm().getValues(); runUpdatePages(v.mode||'all'); win.close(); }} ] }); win.show(); 
        } }, '-', { text:'🖫 (➕)รวมไฟล์ Combine PDF'
        , handler:function(){ 
        combineFile();
    }
    }, '-', {text:'ไฟล์ PDF ส่งคลังล่าสุด', handler:Ext.getCombineFile,icon: "../../images/icons/icon_pdf.png",},'-', 
            
           
            '->','-', '-', 
            '-', '-','🔍 ค้นหา:',
            {xtype:'combo', id:'searchTitle', width:260, store:historyStore, displayField:'q', valueField:'q', mode:'local', typeAhead:true, minChars:0, triggerAction:'all', editable:true, emptyText:'หลายคำคั่นด้วยช่องว่าง • Enter=ถัดไป', listeners:{ specialkey:function(f,e){ if(e.getKey()===e.ENTER){ doSearchCycle(e.shiftKey?-1:+1); } }, select:function(){ setTimeout(function(){ doSearchCycle(+1); },10); } }},
            {xtype:'tbtext', id:'searchBadge', text:'', style:'margin-left:6px;color:#666'},
            {text:'ค้นหา ⏎', handler:function(){ doSearchCycle(+1); }},
            {text:'ย้อนกลับ', handler:function(){ doSearchCycle(-1); }},
             
          ],
          bbar:[
             '-',
            {text:'เลือกทั้งหมด', handler:function(){ setAllPicked(true); }}, 
            '-', {text:'🗐 คัดลอกที่เลือก (JSON)', handler:function(){ var selTree = buildSelectedTree(store); copyToClipboard(JSON.stringify(selTree, null, 2)); Ext.Msg.alert('คัดลอกแล้ว','คัดลอก JSON ของรายการที่เลือกไปยังคลิปบอร์ดแล้ว'); }},        
            '-',{text:'ล้างเลือก', handler:function(){ setAllPicked(false); }},
            '-', {text:'➖ ลบประวัติการค้นหา', handler:function(){ saveHistory([]); refreshHistoryStore([]); Ext.getCmp('searchBadge').setText(''); searchState={q:'',terms:[],hits:[],idx:-1}; var cb=Ext.getCmp('searchTitle'); if(cb) cb.reset(); Ext.Msg.alert('เสร็จสิ้น','ลบประวัติการค้นหาแล้ว'); }},
            '->', {text:'📥 โหลด Json To Grid', handler:function(){ openLoadJsonWindow(true); }},
            '-',{text:'⤵ วาง JSON ลงกริด', handler:function(){ openPasteJsonWindow(); }},
            '-',
            {text:'📝 เริ่มต้นสร้าง json Create Pdf & Bookmarks', handler:function(){ 
                    Ext.Ajax.request({ url:'/supplies/loadJsonBookmarksSave?jsonName='+Ext.pathServer+'&outName=template.pdf', method:'POST', success:function(resp){ try{ var o=Ext.decode(resp.responseText); if(o && o.status==="OK"){ Ext.Msg.alert('สำเร็จ','บันทึกโครงสร้างลง PDF Template เรียบร้อยแล้ว<br>Path: '+o.output); reloadFromServer(); }else Ext.Msg.alert('ผิดพลาด', (o&&o.message)||'ไม่ทราบสาเหตุ'); }catch(e){ Ext.Msg.alert('ผิดพลาด','Response ไม่ถูกต้อง'); } }, failure:function(resp){ var msg='HTTP '+resp.status; try{ msg=Ext.decode(resp.responseText).message||msg; }catch(e){} Ext.Msg.alert('ผิดพลาด', msg); } }); }},
            {text:'✚ แทรก pdf to Page & Bookmark Pdf', handler:function(){}},
            {text:'📝 อัพเดท Bookmark to Json', handler:function(){}}
          ]
        }); 
        grid.on('afterrender', function () {
        grid.getEl().on('click', function (e) {

        var t = e.getTarget('.rowpick');
        if (!t) return;

        var rowId = t.getAttribute('data-rowid');
        var rec = store.getById(rowId);
        if (!rec) return;

        rec.set('picked', t.checked);

        // sync header checkbox
        syncHeaderCheckbox();
    });
});

        grid.on('cellclick', function(g,row,col,e){
          var rec=store.getAt(row);
          if(col===0){  
              var t=e.getTarget('input.rowpick',1,true); 
              if(rec && t){ var val=!rec.get('picked');
                  rec.set('picked', val); if(CASCADE_CHILDREN) setPickedDescendants(rec, val); refreshHeaderCheckbox(); } return;
          }
          var clearA=e.getTarget('a.clear-dt',1,true); if(clearA){ rec.set('receivedDate',null); rec.set('signedDate',null); return; }
          var colId = grid.getColumnModel().getColumnId(col);
          if(colId === 'uploadID' && !rec.get('url')){ openUploadWindow(rec); return; }
          else if(colId === 'uploadID' && rec.get('url')){ openUploadWindow(rec,rec.get('url')); return; }
if (colId === 'settingPageID') {
            toggleSettingTab('settingID', rec);
            return;
        }
          
          if(colId === 'urlID'){ 
              toggleSettingTab('docPDFID',rec); return;
          }
 
        });

        grid.on('render', function(){ var hdrCell=grid.getView().getHeaderCell(0); hdrCbEl=Ext.get(hdrCell).down('input[id="'+hdrPickId+'"]'); if(hdrCbEl){ hdrCbEl.dom.indeterminate=false; hdrCbEl.on('click', function(e){ setAllPicked(e.target.checked); }); } refreshHeaderCheckbox(); });
        new Ext.KeyMap(document, [{key: Ext.EventObject.F3, fn:function(e){ doSearchCycle(e.shiftKey?-1:+1); }}]);

        /* ====== Tabs & Viewport ====== */
        var backItems = {iconCls: 'icon-button-backletf',text:'ย้อนกลับ',handler:function(){ Ext.getCmp('fr1ID').setActiveTab(0); }};
        var backItemsRight = {iconCls: 'icon-button-backright',text:'ย้อนกลับ',handler:function(){ Ext.getCmp('fr1ID').setActiveTab(0); }};
        var actionRole = {iconCls: 'icon-vcard',text:'กำหนดเจ้าหน้าที่ดำเนินการลงนาม/ตรวจสอบเอกสาร',handler:function(){ var win = new Ext.Window({ title:this.getText(), width:1120, height:500, plain: true, maximizable: true, collapsible: true, closable: true, modal:true, layout:'fit', html: iframeHtml('./actionRole.php'), buttonAlign:'left', buttons:[ {text:'ปิด', handler:function(){ win.close(); }} ] }); win.show(); }};
        var signType = {iconCls: 'icon-view',text:'รูปแบบการลงนามในเอกสาร',handler:function(){ var win = new Ext.Window({ title:this.getText(), width:1120, height:500, plain: true, maximizable: true, collapsible: true, closable: true, modal:true, layout:'fit', items:[], buttonAlign:'left', buttons:[ {text:'ปิด', handler:function(){ win.close(); }} ] }); win.show(); }};
        var approveTextPage = {iconCls: 'icon-view',text:'คำอนุมัติในเอกสาร',handler:function(){ var win = new Ext.Window({ title:this.getText(), width:1120, height:500, plain: true, maximizable: true, collapsible: true, closable: true, modal:true, layout:'fit', items:[], buttonAlign:'left', buttons:[ {text:'ปิด', handler:function(){ win.close(); }} ] }); win.show(); }};

        Ext.contenterCenter = window.parent.Ext.getCmp('tabs-panel-sign');

/** ลบแท็บตาม id (ถ้ามี) */

/** ตัวอย่างการเรียกให้ตรงกับที่คุณต้องการ */
            addIframeView(
              '/supplies/sp/app/list_pdf.php',
              'docPDFID',
              'เอกสาร PDF',
              'printer_mono',
              {
                bbar: ['-', backItems, '-', actionRole, '-', signType, '-', approveTextPage, '-', backItemsRight, '-']
              }
            );
         var tabPanel = new Ext.TabPanel({ id:'fr1ID', activeTab:0, enableTabScroll:true, items:[ { title:'ข้อมูลหลักเอกสารซื้อจ้าง',id:'main-group1ID', layout:'fit', iconCls:'icon-vcard', items: grid }] });
      
        new Ext.Viewport({ layout: "fit", items: tabPanel });

        /* ====== INITIAL LOAD ====== */
        autoloadFromPR();
      });
    </script>
 
  </body>
</html>