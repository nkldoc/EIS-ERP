<?php
// ================= PHP PRELUDE =================
include("../../conf/config.php");

$relPath = $_GET['path'] ?? '';
$audit_id = $_GET['audit_id'] ?? 0;
$baseUrl = (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? "https" : "https") . "://" . $_SERVER['HTTP_HOST'];
$filePath = $relPath;

$fileUrl = $baseUrl . "/supplies/sp/app/list_pdf.php?path=" . $filePath;

$fileUrlJson = $baseUrl . "/supplies/sp/app/list_pdfjson.php?path=" . $filePath."&audit_id=".$audit_id;
 
function parsePrFilePath($urlfile) {
  $parts = explode('/', $urlfile);
  if (count($parts) >= 3) {
    $year = $parts[0];
    $pr_code = $parts[1];
    $filename = $parts[2];
    $folder = $year . '/' . $pr_code . '/';
    return ['year'=>$year,'pr_code'=>$pr_code,'filename'=>$filename,'folder'=>$folder];
  }
  return null;
}
$result = parsePrFilePath($relPath);

$fileName = basename($relPath);
$info = pathinfo($fileName);
$jsonName = ($info['filename'] ?? 'state') . '.json';
$genPath = ($result['year'] ?? '2025') . '/' . ($result['pr_code'] ?? 'PRXXXX') . '/json';
$dir = PATH_DOCUMENTS . $genPath;

$full = $dir . '/' . $jsonName;
 
$pathJson = $genPath . '/' . $jsonName;
//$pathJson = $genPath . '/' . preg_replace('/^[0-9]+_/', '', $jsonName);


//echo $pathJson;
//exit();
if (preg_match('/(PR\d{11})/', $fileUrl, $matches)) {
  $pr_code = $matches[1];
} else { 
  $pr_code = '';
} 

?>
<!DOCTYPE html>
<html lang="th">
<head>
<meta charset="UTF-8" />
<title>PDF 10-pages Window Viewer: Text / Erase / Draw / JSON</title>
<meta name="viewport" content="width=device-width, initial-scale=1" />
<script src="./js/pdf.min.js"></script>
<style>
 /* ===== Dark PDF Viewer look for the canvas container ===== */
body{
  background:#333;
  color:#111;
  font: normal 11px arial, tahoma, helvetica, sans-serif;
}
.pagebar {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 2px;
  padding: 6px 8px;
  background: #f8f8fb;
  border: 1px solid #e6e6ef;
  border-radius: 8px;
  margin-top: 4px;
  padding-left: 0;
}
.pagebar-left {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}
.pagebar-left .zoom-level {
  min-width: 50px;
  text-align: center;
  padding: 2px 6px;
  border: 1px solid #ddd;
  border-radius: 6px;
  background: #0062cc;
  color: #fff;
  font-variant-numeric: tabular-nums;
}
#canvas-container{
  position: relative;
  display: block;
  max-width: 100%;
  margin: 10px auto;
  padding: 9px 10px;
  border-radius: 14px;
  box-shadow:
    inset 0 1px 0 rgba(255,255,255,0.06),
    0 14px 36px rgba(0,0,0,0.45);
  border: 1px solid rgba(255,255,255,0.06);
}
#pages-wrap{
  max-height: 80vh;
  overflow: auto;
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 8px 2px;
  border-radius: 10px;
  background:
    linear-gradient(transparent 0, transparent 31px, rgba(255,255,255,0.03) 32px) repeat-y 0 0/100% 32px,
    linear-gradient(90deg, rgba(255,255,255,0.035), rgba(255,255,255,0.02));
}
.page-item{
  position: relative;
  align-self: center;
  padding: 2px;
}
.page-item .page-canvas{
  display: block;
  background: #fff;
  border: none;
  border-radius: 6px;
  box-shadow:
    0 1.5px 2.5px rgba(0,0,0,0.08),
    0 8px 22px rgba(0,0,0,0.28);
}
.pagebar{
  background: rgba(255,255,255,0.06);
  border: 1px solid rgba(255,255,255,0.10);
  color: #e8e8e8;
  backdrop-filter: blur(6px);
}
.pagebar .btn-link,
.pagebar button{
  background: rgba(255,255,255,0.09);
  border: 1px solid rgba(255,255,255,0.18);
  color: #eaeaea;
}
.pagebar .zoom-level{
  background:#0f1115;
  border:1px solid rgba(255,255,255,0.18);
  color:#eaeaea;
}
#eraser-box{
  border: 2px dashed #ff6b6b;
  box-shadow: 0 0 0 2px rgba(255,107,107,0.15);
}
.btn-link{padding:4px 8px;border:1px solid #888;background:#fafafa;cursor:pointer}
.panel{position:fixed;display:none;background:#2b2b25;border:1px solid rgba(255,255,255,0.12);border-radius:12px;box-shadow:0 16px 40px rgba(0,0,0,.5);max-width:96vw;max-height:80vh;overflow:hidden;resize: both; padding-bottom: 6px;}
.panel.show{display:block}
.panel-header{display:flex;align-items:center;gap:8px;padding:8px 12px;background:#1b2230;border-bottom:1px solid rgba(255,255,255,0.08);cursor:move;user-select:none;font-weight:600;color:#eaeaea}
.panel-body{padding:12px;overflow:auto;max-height:calc(80vh - 48px);color:#dfe3ea}
table{margin-top:5px;border-collapse:collapse;width:100%} table,th,td{border:1px solid #333} th,td{padding:6px 10px;text-align:center}

/* Bookmarks list */
#bookmark-list { max-height: 36vh; overflow:auto; padding:6px; background:rgba(0,0,0,0.05); border-radius:8px; color: #dfe3ea}
.bookmark-item { padding:6px 8px; cursor:pointer; border-radius:6px; margin:2px 0; background:transparent; }
.bookmark-item:hover { background: rgba(255,255,255,0.03); }
.bookmark-children { margin-left:14px; }
.bookmark-title { display:inline-block; vertical-align:middle; }
.bookmark-page { float:right; opacity:0.7; font-size:12px; color:#cfe6ff }
/* bookmark toggle & collapse styles */
#bookmark-controls { display:flex; gap:8px; align-items:center; margin-bottom:8px; }
.bookmark-toggle-btn { padding:4px 8px; border-radius:6px; border:1px solid rgba(255,255,255,0.08); background:transparent; cursor:pointer; color:#dfe3ea }
.bookmark-collapse { display:none; margin-left:8px; color:#cfe6ff; font-size:12px; cursor:pointer; }
.bookmark-children.collapsed { display:none !important; }
.bookmark-item .chev { display:inline-block; width:14px; text-align:center; margin-right:6px; color:#9fc6ff; cursor:pointer; user-select:none }
.bookmark-item.has-children { padding-left:6px; }

/* contentEditable overlay */
.text-overlay {
  min-width: 80px;
  max-width: 80%;
  white-space: pre-wrap;
  word-break: break-word;
  outline: none;
}
</style>
</head>
<body>

<div id="position"></div>

<!-- ===== Pagebar Top ===== -->
<div class="pagebar" id="pagebar-top">  
    
    <div class="pagebar-left">
        <button style="margin-right:50px;" id="undo-button">↩ Undo ล่าสุด</button>
    <select id="mode-select" style="margin-right:10px;">
        <option value="draw-rect" selected>วาดสี่เหลี่ยม</option>
        <option value="text">โหมดข้อความ</option>
        <option value="draw-free">วาดเส้นอิสระ</option>
        <option value="draw-circle">วาดวงกลม</option>
        <option value="erase">โหมดลบข้อความ</option>
      </select>    
    <button class="zoom-out"  title="Zoom Out">−</button>
    <span class="zoom-level" title="Zoom Level">150%</span>
    <button class="zoom-in"   title="Zoom In">+</button>
    <button class="fit-width" title="Fit Width">↔</button>
    <button class="fit-page"  title="Fit Page">fit</button>
  </div> 
  <label>หน้า:
    <input type="number" id="page-num1" value="1" min="1" style="width:60px;">
  </label> <span id="page-info1">หน้า 1/1</span>
  <button id="prev-page1">⬅ 10</button>
  <button id="next-page1">10 ➡</button>
<!--  <button id="load-json-buttonH">⬇ แสดงข้อมูลจุดที่ต้องแก้ไข </button> -->
   <button id="fab-menu-data" title="แสดง/ซ่อนข้อมูลในการตรวจสอบ">🎯 bookmarks/เครื่องมือ รายการข้อความ/mark จุดตรวจสอบเอกสาร </button>
   <button style="margin-left:50px;" id="save-json-buttonH">💾 บันทึกจุดที่ต้องแก้ไข</button>
 
 
</div>

<div id="canvas-container">
  <!-- หน้าต่าง 10 หน้าแบบสกอร์ล -->
  <div id="pages-wrap" tabindex="0"></div>
  <!-- กล่องลบ จะถูกย้ายไปไว้ในหน้า active -->
  <div id="eraser-box" style="display:none"></div>
</div>

<!-- ===== Pagebar Bottom ===== -->
<!--<div class="pagebar" id="pagebar-bottom">


  <label>หน้า:
    <input type="number" id="page-num2" value="1" min="1" style="width:60px;">
  </label>
  <button id="prev-page2">⬅ 10</button>
  <button id="next-page2">10 ➡</button>
  <button id="load-json-buttonB"> ⬇ แสดงข้อมูลจุดที่ต้องแก้ไข </button>
  <button id="save-json-buttonB">💾 บันทึกจุดที่ต้องแก้ไข</button>
  <span id="page-info2">หน้า 1/1</span>
  
</div>-->

<!-- FABs -->
<input type="hidden"  id="fab-menu" title="แสดง/ซ่อนเครื่องมือ" text="Tools และการบันทึก"/>

<!-- ===== Panel: Tools ===== -->
<div id="tools" class="panel" style=""></div>

<!-- ===== Panel: Data ===== -->
<div id="tools2" class="panel">
  <div class="panel-header">
    <span>🔧 Tools && 📦 Data 📝 พิมพ์ /  ✏️ วาด / 🎯 ดูตำแหน่ง / 💾 บันทึก-โหลดข้อมูล </span> <button slyle="clear:both; float:right;margin-left:100px;" class="panel-close" title="ปิด">✕</button> 
  </div>
  <div class="panel-body" id="tools-content">
<!-- Bookmarks panel (with toggle + expand/collapse all) -->
<div id="bookmarks-panel" style="margin-top:12px;">
  <h3 style="margin:0 0 6px 0; display:flex; align-items:center; justify-content:space-between;">
    <span>📚 Bookmarks / สารบัญ PDF</span>
    <div style="display:flex; gap:6px; align-items:center;">
      <button id="bookmark-showhide" class="bookmark-toggle-btn" title="แสดง/ซ่อน Bookmarks">ซ่อน</button>
      <button id="bookmark-expand-all" class="bookmark-toggle-btn" title="ขยายทั้งหมด">ขยายทั้งหมด</button>
      <button id="bookmark-collapse-all" class="bookmark-toggle-btn" title="พับทั้งหมด">พับทั้งหมด</button>
    </div>
  </h3>
  <div id="bookmark-list-wrap">
    <div id="bookmark-list">(Loading bookmarks...)</div>
  </div>
</div>


    <div id="controls" style="margin-top:6px;"> 
      <input type="color" id="stroke-color" value="#ff0000">
      <input type="hidden" id="stroke-width" value="2" min="1" max="20" style="width:60px;"> 
      <input type="hidden" id="url" value="<?= htmlspecialchars($fileUrl) ?>" /> 
      <input type="hidden" id="outputServer" value="D:/Documents/pdf/xxx_output_.pdf" />     
      <label> 
        <select id="text-mode-sub">
          <option value="normal">ข้อความปกติ</option>
          <option value="box">กล่องปิดทับ</option>
        </select>
      </label>
      <input type="number" id="font-size" value="16" min="8" style="width:60px;"> 
      <label><input type="checkbox" id="bold-toggle"> ตัวหนา</label>

      <p> 
        
        <button id="submitArrayID">📤 ส่งข้อความลง PDF</button>
        <button id="submitEraser">🧽 ส่งข้อมูลลบ</button> 
        <button id="save-image-button">🖼️ บันทึกภาพ “หน้า active”</button>
        <input type="hidden" id="json-url" value="/supplies/sp/app/list_pdfjson.php?path=<?=htmlspecialchars($pathJson) ?>"> 
      </p>
    </div>

    <h3 style="margin-top:12px">📋 รายการข้อความ:</h3>
    <table>
      <thead><tr><th>ข้อความ</th><th>หน้า</th><th>X</th><th>Y</th><th>ดูตำแหน่ง</th><th>แก้ไข</th><th>ลบ</th></tr></thead>
      <tbody id="text-table-body"></tbody>
    </table>

    <h3 style="margin-top:12px">🖌️ รายการรูปวาด:</h3>
    <table>
      <thead><tr><th>ชนิด</th><th>หน้า</th><th>X</th><th>Y</th><th>W×H / R / จุด</th><th>สี</th><th>หนา</th><th>ดูตำแหน่ง</th><th>ลบ</th></tr></thead>
      <tbody id="shape-table-body"></tbody>
    <tfoot>
      <tr>
        <td colspan="9" style="text-align: center; padding: 10px;">
          <input type="hidden" id="pr-id" value="<?= htmlspecialchars($pr_code) ?>">
          <input type="hidden" id="doc-id" placeholder="20">
          <button id="save-json-button">💾 บันทึกจุดที่ต้องแก้ไข</button> 
        </td>
      </tr>
    </tfoot>
    </table>
  </div>
</div>

<script>
document.addEventListener('DOMContentLoaded', () => { 
  // Mask if parent Ext exists
  try { window.parent.Ext.getCmp("reviewForm").getEl().mask("กำลังโหลด PDF รอสักครู่...........", "x-mask-loading"); } catch(e){}

  pdfjsLib.GlobalWorkerOptions.workerSrc = './js/pdf.worker.min.js';

  // DOM
  const pagesWrap = document.getElementById('pages-wrap');
  const eraserBox = document.getElementById('eraser-box');

  // Controls
  const positionDiv = document.getElementById('position');
  const fontSizeInput = document.getElementById('font-size');
  const boldToggle = document.getElementById('bold-toggle');
  const textModeSub = document.getElementById('text-mode-sub');
  const modeSelect = document.getElementById('mode-select');

  const textTableBody = document.getElementById('text-table-body');
  const shapeTableBody = document.getElementById('shape-table-body');
  const strokeColorInput = document.getElementById('stroke-color');
  const strokeWidthInput = document.getElementById('stroke-width');

  const prIdInput = document.getElementById('pr-id');
  const docIdInput = document.getElementById('doc-id');
  const jsonUrlInput = document.getElementById('json-url');

  if (window.parent && window.parent.Ext) {
    try { document.getElementById('doc-id').value = window.parent.Ext.getCmp('document_idID').getValue(); } catch(e){}
  }

  // State
  let pdf = null, scale = 1.5, totalPages = 1, currentPage = 1;
  let textsArray = [], eraseAreas = [], shapesArray = [], historyStack = [];
  let WINDOW_SIZE = 10, windowStart = 1;
  let lastPageAlertShown = false;
  const pageNodes = new Map(); // pageNumber -> {holder, canvas, ctx, backgroundImageData, vpW, vpH}
  let activeCanvas = null, activeCtx = null, activeBg = null;

  // UI helpers
  function updatePageUI(n,total){
    const pageNumEls=[document.getElementById('page-num1'),document.getElementById('page-num2')].filter(Boolean);
    const pageInfoEls=[document.getElementById('page-info1'),document.getElementById('page-info2')].filter(Boolean);
    pageNumEls.forEach(el=>{ el.max = total || el.max || 1; el.value = n; });
    pageInfoEls.forEach(el=> el.innerText = `หน้า ${n}/${total || 1}`);
  }
  function clampScale(v){ return Math.max(0.25, Math.min(8, v)); }
  function getCurrentPage(){ return currentPage; }

  // ensure page loaded in window
  async function ensurePageLoaded(page) {
    if (!pdf) return;
    page = Math.max(1, Math.min(totalPages, parseInt(page) || 1));
    if (pageNodes.has(page)) return;
    const maxStart = Math.max(1, totalPages - WINDOW_SIZE + 1);
    let newStart = Math.min(Math.max(1, page), maxStart);
    await renderWindow(newStart, WINDOW_SIZE);
  }

  // Build window
  function clearWindowDom(){ pageNodes.clear(); pagesWrap.innerHTML=''; }
  function createWindowDom(start, size){
    clearWindowDom();
    const end = Math.min(totalPages, start + size - 1);
    for(let p=start; p<=end; p++){
      const holder = document.createElement('div');
      holder.className = 'page-item';
      holder.dataset.page = String(p);
      const cv = document.createElement('canvas');
      cv.className = 'page-canvas';
      holder.appendChild(cv);
      holder.addEventListener('click', async () => { await ensurePageLoaded(p); setActivePage(p); });
      pagesWrap.appendChild(holder);
      pageNodes.set(p, { holder, canvas: cv, ctx: cv.getContext('2d',{willReadFrequently:true}), backgroundImageData:null, vpW:0, vpH:0 });
    }
  }

  function setActivePage(p){
    currentPage = p;
    updatePageUI(currentPage, totalPages);
    pageNodes.forEach((node, page)=>{ node.holder.style.boxShadow = (page===p) ? '0 0 0 3px rgba(0,153,255,.45)' : 'none'; });
    const node = pageNodes.get(p);
    activeCanvas = node?.canvas || null;
    activeCtx = node?.ctx || null;
    activeBg = node?.backgroundImageData || null;
    if (node?.holder) node.holder.appendChild(eraserBox);
  }

  // Rendering
  async function renderSinglePage(pageNumber){
    const node = pageNodes.get(pageNumber); if(!node) return;
    const page = await pdf.getPage(pageNumber);
    const viewport = page.getViewport({ scale });
    node.canvas.width = viewport.width; node.canvas.height = viewport.height;
    node.vpW = viewport.width; node.vpH = viewport.height;
    await page.render({ canvasContext: node.ctx, viewport }).promise;
    node.backgroundImageData = node.ctx.getImageData(0,0,node.canvas.width,node.canvas.height);
    drawContentToNode(pageNumber, node);
    if (pageNumber === currentPage){ activeCanvas=node.canvas; activeCtx=node.ctx; activeBg=node.backgroundImageData; }
    try{ window.parent.Ext.getCmp("reviewForm").getEl().unmask(); }catch(e){}
  }

  async function renderWindow(start, size=WINDOW_SIZE){
    if(!pdf) return;
    windowStart = Math.max(1, Math.min(totalPages, start));
    createWindowDom(windowStart, size);
    const end = Math.min(totalPages, windowStart + size - 1);
    for(let p=windowStart; p<=end; p++) await renderSinglePage(p);
    if (currentPage < windowStart || currentPage > end) setActivePage(windowStart);
    else setActivePage(currentPage);
  }

  function drawContentToNode(pageNumber, node){
    const { canvas, ctx, backgroundImageData } = node;
    if(backgroundImageData) ctx.putImageData(backgroundImageData, 0, 0);

    // Shapes
    shapesArray.forEach(s=>{
      if(!s.pages || !s.pages.includes(pageNumber)) return;
      ctx.save();
      ctx.strokeStyle=s.color||'#ff0000'; ctx.lineWidth=s.stroke||2; ctx.lineCap='round';
      if(s.type==='rect'){
        const x=s.x*scale, yTop=canvas.height - s.y*scale;
        ctx.strokeRect(x, yTop, (s.width||0)*scale, (s.height||0)*scale);
      }else if(s.type==='circle'){
        const cx=s.x*scale, cy=canvas.height - s.y*scale;
        ctx.beginPath(); ctx.arc(cx,cy,(s.r||0)*scale,0,Math.PI*2); ctx.stroke();
      }else if(s.type==='free'){
        const pts=s.points||[]; if(pts.length>1){ ctx.beginPath();
          for(let i=0;i<pts.length;i++){ const cx=pts[i].x*scale, cy=canvas.height - pts[i].y*scale; i===0?ctx.moveTo(cx,cy):ctx.lineTo(cx,cy); }
          ctx.stroke();
        }
      }
      ctx.restore();
    });

    // Texts
    textsArray.forEach(item=>{
      if(!item.pages.includes(pageNumber)) return;
      const drawX=item.x*scale, drawY=canvas.height - item.y*scale;
      const font=`${item.bold?'bold ':''}${item.fontSize||16}px sans-serif`;
      ctx.font=font; ctx.fillStyle='black';
      const textWidth = ctx.measureText(item.text).width;

      if(item.isBox){
        ctx.strokeStyle='red'; ctx.lineWidth=1.5;
        ctx.strokeRect(drawX, drawY-(item.fontSize||16), textWidth+10, (item.fontSize||16)+6);
        ctx.fillText(item.text, drawX+5, drawY-6);
      }else{
        ctx.beginPath(); ctx.moveTo(drawX,drawY); ctx.lineTo(drawX+textWidth,drawY);
        ctx.strokeStyle='red'; ctx.lineWidth=1.5; ctx.stroke();
        ctx.fillText(item.text, drawX, drawY-4);
      }
    });
  }

  // PDF load + outline
  async function loadOutline() {
    try {
      if (!pdf) return;
      const outline = await pdf.getOutline();
      const container = document.getElementById('bookmark-list');
      container.innerHTML = '';
      if (!outline || outline.length === 0) {
        container.innerHTML = '<div style="opacity:.7;padding:8px">ไม่มี bookmarks</div>';
        return;
      }

      // helper to create DOM item (recursive)
      async function makeItem(node) {
        if (!node || typeof node !== 'object') return null;
        const div = document.createElement('div');
        div.className = 'bookmark-item';
        const title = document.createElement('span');
        title.className = 'bookmark-title';
        title.textContent = node.title || '(ไม่ระบุชื่อ)';
        const pageSpan = document.createElement('span');
        pageSpan.className = 'bookmark-page';
        pageSpan.textContent = '';

        div.appendChild(title); div.appendChild(pageSpan);

        // click handler
        div.addEventListener('click', async (ev) => {
          ev.stopPropagation();
          try {
            if (node.url) {
              window.open(node.url, '_blank'); return;
            }
            // node.dest can be name or array - handle both
            let destVal = node.dest ?? node.action ?? null;
            if (!destVal) return;
            // destVal might already be an array of destination items
            let destArray = Array.isArray(destVal) ? destVal : await pdf.getDestination(destVal);
            if (!destArray) return;
            const pageRef = destArray[0];
            const pageIndex = await pdf.getPageIndex(pageRef); // zero-based
            const pageNum = pageIndex + 1;

            // ensure page loaded in window and render it
            await ensurePageLoaded(pageNum);
            // renderSinglePage ensures backgroundImageData and overlays up-to-date
            await renderSinglePage(pageNum);
            setActivePage(pageNum);

            // handle optional Y coordinate in destArray (best-effort)
            const nodeEl = pageNodes.get(pageNum);
            if (nodeEl && destArray.length >= 3) {
              // destArray typical: [ref, 'XYZ' or /XYZ, left, top, zoom] or variations
              // find first numeric that likely represents Y (search indices 2..4)
              let topCoordPdf = null;
              for (let i = 2; i < Math.min(destArray.length, 6); i++) {
                if (typeof destArray[i] === 'number') { topCoordPdf = destArray[i]; break; }
              }
              if (typeof topCoordPdf === 'number') {
                // convert pdf user-space Y to pixel on canvas (approx)
                const canvasHeightPx = nodeEl.canvas.height;
                const yPx = Math.round(canvasHeightPx - (topCoordPdf * scale));
                const holderTop = nodeEl.holder.offsetTop;
                const pagesWrapHeight = pagesWrap.clientHeight || window.innerHeight;
                const targetScroll = Math.max(0, holderTop + yPx - Math.round(pagesWrapHeight / 2));
                pagesWrap.scrollTo({ top: targetScroll, behavior: 'smooth' });
                // highlight briefly
                nodeEl.holder.style.boxShadow = '0 0 0 4px rgba(255,200,0,0.3)';
                setTimeout(()=>{ if(nodeEl?.holder) nodeEl.holder.style.boxShadow = (parseInt(nodeEl.holder.dataset.page,10) === currentPage) ? '0 0 0 3px rgba(0,153,255,.45)' : 'none'; }, 900);
                return;
              }
            }

            // fallback: center whole page
            nodeEl?.holder?.scrollIntoView({behavior:'smooth', block:'center'});

          } catch (err) {
            console.error('Cannot navigate bookmark dest', err);
            // fallback: try to scroll to page element if available
            const fallbackEl = document.querySelector(`[data-page="${(node.page||1)}"]`);
            if (fallbackEl) fallbackEl.scrollIntoView({behavior:'smooth', block:'center'});
          }
        });

        // children
        if (node.items && node.items.length) {
          const childWrap = document.createElement('div');
          childWrap.className = 'bookmark-children';
          for (const ch of node.items) {
            const c = await makeItem(ch);
            if (c) childWrap.appendChild(c);
          }
          div.appendChild(childWrap);
        }

        // try to resolve page number and show it
        (async () => {
          try {
            if (node.url) { pageSpan.textContent = 'link'; return; }
            const destVal = node.dest ?? node.action ?? null;
            if (!destVal) { pageSpan.textContent = ''; return; }
            const destArray = Array.isArray(destVal) ? destVal : await pdf.getDestination(destVal);
            if (!destArray) return;
            const ref = destArray[0];
            const idx = await pdf.getPageIndex(ref);
            pageSpan.textContent = (idx + 1);
          } catch (e) { /* ignore */ }
        })();

        return div;
      }

      // build list
      for (const item of outline) {
        const el = await makeItem(item);
        if (el) container.appendChild(el);
      }

    } catch (e) {
      console.error('loadOutline error', e);
    }
  }

  // loadPDF (calls renderWindow then loadOutline)
  function loadPDF(url){
    return pdfjsLib.getDocument(url).promise.then(async doc=>{
      pdf = doc;
      totalPages = pdf.numPages;
      currentPage = 1;
      updatePageUI(1,totalPages);
      lastPageAlertShown = false;
      await renderWindow(1, WINDOW_SIZE);
      // load outline after pages rendered (no setTimeout)
      await loadOutline();
      return pdf;
    });
  }

  // --- zoom / fit (existing code) ---
  const zoomInBtns   = Array.from(document.querySelectorAll('.pagebar-left .zoom-in'));
  const zoomOutBtns  = Array.from(document.querySelectorAll('.pagebar-left .zoom-out'));
  const fitWidthBtns = Array.from(document.querySelectorAll('.pagebar-left .fit-width'));
  const fitPageBtns  = Array.from(document.querySelectorAll('.pagebar-left .fit-page'));
  const zoomLabels   = Array.from(document.querySelectorAll('.pagebar-left .zoom-level'));

  function updateZoomLabels(){ const pct=Math.round((scale||1)*100); zoomLabels.forEach(el=>el.textContent=pct+'%'); }
  async function applyScale(newScale){ scale=clampScale(newScale); updateZoomLabels(); await renderWindow(windowStart, WINDOW_SIZE); }
  async function fitWidth(){
    if(!pdf) return;
    const page = await pdf.getPage(currentPage);
    const vw = page.getViewport({ scale: 1 });
    const inner = pagesWrap.clientWidth ? (pagesWrap.clientWidth - 24) : vw.width;
    const s = inner / vw.width;
    await applyScale(s);
  }
  async function fitPage(){
    if(!pdf) return;
    const page = await pdf.getPage(currentPage);
    const vw = page.getViewport({ scale: 1 });
    const innerW = pagesWrap.clientWidth  ? (pagesWrap.clientWidth - 24) : vw.width;
    const innerH = pagesWrap.clientHeight ? (pagesWrap.clientHeight - 24) : vw.height;
    await applyScale(Math.min(innerW/vw.width, innerH/vw.height));
  }
  zoomInBtns.forEach(b=>b.addEventListener('click',()=>applyScale(scale*1.1)));
  zoomOutBtns.forEach(b=>b.addEventListener('click',()=>applyScale(scale/1.1)));
  fitWidthBtns.forEach(b=>b.addEventListener('click',()=>fitWidth()));
  fitPageBtns.forEach(b=>b.addEventListener('click',()=>fitPage()));
  updateZoomLabels();

  // Prev/Next window
  const prevBtns=[document.getElementById('prev-page1'),document.getElementById('prev-page2')].filter(Boolean);
  const nextBtns=[document.getElementById('next-page1'),document.getElementById('next-page2')].filter(Boolean);
  prevBtns.forEach(btn=>{
    btn.addEventListener('click', async ()=>{
      try{ window.parent.Ext.getCmp("reviewForm").getEl().mask("กำลังโหลด PDF รอสักครู่...........", "x-mask-loading"); }catch(e){}
      const targetStart = Math.max(1, windowStart - WINDOW_SIZE);
      await renderWindow(targetStart, WINDOW_SIZE);
      try{ window.parent.Ext.getCmp("reviewForm").getEl().unmask(); }catch(e){}
    });
  });
  nextBtns.forEach(btn=>{
    btn.addEventListener('click', async ()=>{
      const maxStart = Math.max(1, totalPages - WINDOW_SIZE + 1);
      const targetStart = Math.min(maxStart, windowStart + WINDOW_SIZE);
      await renderWindow(targetStart, WINDOW_SIZE);
    });
  });

  // Page num inputs
  const pageNumEls=[document.getElementById('page-num1'),document.getElementById('page-num2')].filter(Boolean);
  pageNumEls.forEach(el=>{
    el.addEventListener('change', async ()=>{
      const n = Math.max(1, Math.min(totalPages, parseInt(el.value)||1));
      if (n < windowStart || n >= windowStart + WINDOW_SIZE) {
        await ensurePageLoaded(n);
      }
      setActivePage(n);
      const node = pageNodes.get(n);
      node?.holder?.scrollIntoView({behavior:'smooth', block:'center'});
    });
  });

  // Text table & shape table helper functions (kept mostly same)
  function sanitizeText(str){ return (str||'').replace(/[<>&"]/g, c => ({'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;'}[c])); }
  function addTextRow(item){
    const tr=document.createElement('tr'), page=item.pages[0], tdText=document.createElement('td');
    tdText.innerText=sanitizeText(item.text); tr.appendChild(tdText);
    tr.innerHTML+=`<td>${page}</td><td>${item.x}</td><td>${item.y}</td>`;
    const tdJump=document.createElement('td'); const jBtn=document.createElement('button'); jBtn.className='btn-link'; jBtn.textContent='ไป';
    jBtn.onclick=async ()=>{ await ensurePageLoaded(page); setActivePage(page); const node=pageNodes.get(page); node?.holder?.scrollIntoView({behavior:'smooth',block:'center'}); };
    tdJump.appendChild(jBtn); tr.appendChild(tdJump);
    const tdEdit=document.createElement('td'); const editBtn=document.createElement('button'); editBtn.textContent='แก้ไข';
    editBtn.onclick=async ()=>{ const txt=prompt('พิมพ์ข้อความใหม่:',item.text); if(txt!==null&&txt.trim()!==''){ item.text=txt.trim(); tdText.innerText=sanitizeText(txt); await renderSinglePage(page);} };
    tdEdit.appendChild(editBtn); tr.appendChild(tdEdit);
    const tdDelete=document.createElement('td'); const delBtn=document.createElement('button'); delBtn.textContent='ลบ';
    delBtn.onclick=async ()=>{ tr.remove(); const idx=textsArray.indexOf(item); if(idx>=0) textsArray.splice(idx,1); await renderSinglePage(page); };
    tdDelete.appendChild(delBtn); tr.appendChild(tdDelete);
    textTableBody.appendChild(tr);
  }
  function refreshTextTable(){ textTableBody.innerHTML=''; textsArray.forEach(addTextRow); }

  function addShapeRow(shape){
    const page = (shape.pages && shape.pages[0]) || 1;
    if (shape.type === 'rect' && (!shape.width || !shape.height || shape.width === 0 || shape.height === 0)) return;
    if (shape.type === 'circle' && (!shape.r || shape.r === 0)) return;
    if (shape.type === 'free' && (!shape.points || shape.points.length < 2)) return;

    const tr = document.createElement('tr');
    const whOrR = shape.type === 'rect' ? `${shape.width} × ${shape.height}` :
                  shape.type === 'circle' ? `${shape.r}` :
                  shape.type === 'free' ? `${(shape.points || []).length} pts` : '-';
    tr.innerHTML = `
      <td>${shape.type}</td>
      <td>${page}</td>
      <td>${shape.x}</td>
      <td>${shape.y}</td>
      <td>${whOrR}</td>
      <td><span style="display:inline-block;width:18px;height:18px;border:1px solid #ccc;vertical-align:middle;background:${shape.color || '#000'}"></span></td>
      <td>${shape.stroke || 2}</td>
    `;
    const tdJump = document.createElement('td'); const jBtn = document.createElement('button'); jBtn.className='btn-link'; jBtn.textContent='ไป';
    jBtn.onclick = async () => { await ensurePageLoaded(page); setActivePage(page); const node = pageNodes.get(page); node?.holder?.scrollIntoView({ behavior: 'smooth', block: 'center' }); };
    tdJump.appendChild(jBtn); tr.appendChild(tdJump);
    const tdDel = document.createElement('td'); const delBtn = document.createElement('button'); delBtn.textContent = 'ลบ';
    delBtn.onclick = async () => { const idx = shapesArray.indexOf(shape); if (idx >= 0) { shapesArray.splice(idx, 1); tr.remove(); await renderSinglePage(page); } };
    tdDel.appendChild(delBtn); tr.appendChild(tdDel);
    shapeTableBody.appendChild(tr);
  }
  function refreshShapeTable(){ shapeTableBody.innerHTML=''; shapesArray.forEach(addShapeRow); }

  // Modes (text/erase/draw) - improved text overlay handler integrated here
  // -------------------- IMPROVED TEXT HANDLER --------------------
  pagesWrap.addEventListener('click', async (e) => {
    if (modeSelect.value !== 'text') return;
    const cv = e.target.closest('.page-canvas'); if (!cv) return;
    const holder = cv.parentElement; const page = parseInt(holder.dataset.page, 10) || currentPage;
    await ensurePageLoaded(page);
    setActivePage(page);
    const rect = cv.getBoundingClientRect();
    const x = e.clientX - rect.left, y = e.clientY - rect.top;
    const pdfX = +(x/scale).toFixed(2), pdfY = +((cv.height - y)/scale).toFixed(2);
//    positionDiv.innerText = `พิกัด: X=${pdfX}, Y=${pdfY}`;

    // remove previous overlays
    document.querySelectorAll('.text-overlay').forEach(el=>el.remove());

    // create contentEditable overlay
    const input = document.createElement('div');
    input.contentEditable = true;
    input.className = 'text-overlay';
    input.style.position = 'absolute';
    input.style.left = `${x}px`;
    // place top so baseline aligns with expected location
    input.style.top = `${y - parseInt(fontSizeInput.value)}px`;
    input.style.minWidth = '60px';
    input.style.padding = '2px 6px';
    input.style.fontSize = `${fontSizeInput.value}px`;
    input.style.fontWeight = boldToggle.checked ? 'bold' : 'normal';
    input.style.background = 'rgba(255,255,255,0.95)';
    input.style.borderRadius = '4px';
    input.style.boxShadow = '0 1px 6px rgba(0,0,0,0.2)';
    input.style.zIndex = 9999;
    // accessibility + keyboard focus
    input.setAttribute('role','textbox');
    input.setAttribute('aria-multiline','true');
    input.setAttribute('tabindex','0');

    // append and focus
    holder.appendChild(input);

    // helper: put caret at end
    function placeCaretAtEnd(el) {
      el.focus();
      if (typeof window.getSelection !== "undefined"
          && typeof document.createRange !== "undefined") {
        const range = document.createRange();
        range.selectNodeContents(el);
        range.collapse(false);
        const sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
      } else if (typeof document.body.createTextRange !== "undefined") {
        const textRange = document.body.createTextRange();
        textRange.moveToElementText(el);
        textRange.collapse(false);
        textRange.select();
      }
    }

    // prevent page scroll while typing on mobile (optional)
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    // focus caret at end
    placeCaretAtEnd(input);

    // event handlers: commit on Enter, allow Shift+Enter for newline, Escape to cancel, Tab to commit
    const onBlur = async () => {
      cleanupAndCommit();
    };

    let committed = false;
    async function cleanupAndCommit() {
      if (committed) return;
      committed = true;
      // restore scroll behavior
      document.body.style.overflow = prevOverflow || '';
      // read text
      const text = (input.innerText || '').trim();
      input.remove();
      if (!text) return;
      const item = {
        text,
        x: pdfX,
        y: pdfY,
        pages: [page],
        fontSize: parseInt(fontSizeInput.value),
        bold: !!boldToggle.checked,
        isBox: textModeSub.value === 'box'
      };
      textsArray.push(item);
      historyStack.push({ type: 'text', index: textsArray.length - 1 });
      addTextRow(item);
      await renderSinglePage(page);
    }

    const onKeyDown = (ev) => {
      if (ev.key === 'Escape') {
        // cancel without committing
        committed = true;
        document.body.style.overflow = prevOverflow || '';
        input.remove();
        ev.preventDefault();
        return;
      }
      if (ev.key === 'Enter') {
        if (ev.shiftKey) {
          // allow newline in contentEditable
          return;
        }
        // commit on Enter
        ev.preventDefault();
        input.blur(); // triggers onBlur -> commit
        return;
      }
      if (ev.key === 'Tab') {
        // commit and move focus back to pages container (or next UI element)
        ev.preventDefault();
        input.blur();
        // after commit, try to focus pagesWrap so keyboard can be used further
        setTimeout(()=>{ pagesWrap.focus && pagesWrap.focus(); }, 50);
        return;
      }
      // keep font style in sync with controls while typing (live preview)
      if (ev.key.length === 1 && (ev.ctrlKey || ev.metaKey)) {
        // ignore control/meta combos
        return;
      }
      // update style live (in case user toggles controls while editing)
      input.style.fontSize = `${fontSizeInput.value}px`;
      input.style.fontWeight = boldToggle.checked ? 'bold' : 'normal';
    };

    input.addEventListener('keydown', onKeyDown);
    input.addEventListener('blur', onBlur);

    // cleanup in case something else removes the holder (safety)
    const observer = new MutationObserver((mutations) => {
      if (!document.body.contains(input)) {
        // already removed
        document.body.style.overflow = prevOverflow || '';
        observer.disconnect();
        input.removeEventListener('keydown', onKeyDown);
        input.removeEventListener('blur', onBlur);
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });
  });
  // -------------------- END TEXT HANDLER --------------------

  // Erase
  let erasing = false, eraseStart = null, eraseCanvasRect = null, eraseTargetCanvas = null, erasePage = null;
  pagesWrap.addEventListener('mousedown', async (e)=>{
    if (modeSelect.value !== 'erase') return;
    const cv = e.target.closest('.page-canvas'); if(!cv) return;
    const holder=cv.parentElement; eraseTargetCanvas=cv; erasePage=parseInt(holder.dataset.page,10)||currentPage;
    await ensurePageLoaded(erasePage);
    setActivePage(erasePage);
    eraseCanvasRect = cv.getBoundingClientRect();
    const sx = e.clientX - eraseCanvasRect.left, sy = e.clientY - eraseCanvasRect.top;
    erasing=true; eraseStart={x:sx,y:sy};
    holder.appendChild(eraserBox);
    eraserBox.style.display='block'; eraserBox.style.left=sx+'px'; eraserBox.style.top=sy+'px'; eraserBox.style.width='0px'; eraserBox.style.height='0px';
  });
  document.addEventListener('mousemove', (e)=>{
    if(!erasing || !eraseCanvasRect) return;
    const x = Math.max(0, Math.min(eraseCanvasRect.width, e.clientX - eraseCanvasRect.left));
    const y = Math.max(0, Math.min(eraseCanvasRect.height, e.clientY - eraseCanvasRect.top));
    const w = x - eraseStart.x, h = y - eraseStart.y;
    eraserBox.style.left = (w<0 ? x : eraseStart.x)+'px';
    eraserBox.style.top  = (h<0 ? y : eraseStart.y)+'px';
    eraserBox.style.width = Math.abs(w)+'px';
    eraserBox.style.height= Math.abs(h)+'px';
  });
  document.addEventListener('mouseup', async (e)=>{
    if(!erasing) return; erasing=false; eraserBox.style.display='none';
    if(!eraseTargetCanvas || !eraseCanvasRect) return;
    const ex = e.clientX - eraseCanvasRect.left, ey = e.clientY - eraseCanvasRect.top;
    const x = Math.min(eraseStart.x, ex), y = Math.min(eraseStart.y, ey);
    const w = Math.abs(ex - eraseStart.x), h = Math.abs(ey - eraseStart.y);
    const pdfX=+(x/scale).toFixed(2), pdfY=+((eraseTargetCanvas.height - y)/scale).toFixed(2);
    const pdfW=+(w/scale).toFixed(2), pdfH=+(h/scale).toFixed(2);
    eraseAreas.push({page:erasePage, x:pdfX, y:pdfY, width:pdfW, height:pdfH});
    positionDiv.innerText=`🧽 ลบ: X=${pdfX}, Y=${pdfY}, W=${pdfW}, H=${pdfH}`;
    await renderSinglePage(erasePage);
    eraseTargetCanvas=null; eraseCanvasRect=null; erasePage=null;
  });

  // Draw (free/rect/circle)
  let drawing=false, drawMode=null, startXc=0, startYc=0, tempPoints=[], drawCanvas=null, drawPage=null;
  pagesWrap.addEventListener('mousedown', async (e)=>{
    if(!modeSelect.value.startsWith('draw-')) return;
    const cv = e.target.closest('.page-canvas'); if(!cv) return;
    const holder=cv.parentElement; drawCanvas=cv; drawPage=parseInt(holder.dataset.page,10)||currentPage; 
    await ensurePageLoaded(drawPage);
    setActivePage(drawPage);
    const rect=cv.getBoundingClientRect(); startXc=e.clientX - rect.left; startYc=e.clientY - rect.top;
    tempPoints=[{x:startXc,y:startYc}]; drawMode=modeSelect.value; drawing=true;
  });
  document.addEventListener('mousemove', (e)=>{
    if(!drawing || !drawCanvas) return;
    const rect=drawCanvas.getBoundingClientRect();
    const x=Math.max(0, Math.min(drawCanvas.width, e.clientX - rect.left));
    const y=Math.max(0, Math.min(drawCanvas.height, e.clientY - rect.top));
    tempPoints.push({x,y}); 
    previewRedraw(drawPage, drawCanvas);
  });
  document.addEventListener('mouseup', async (e)=>{
    if(!drawing) return; drawing=false;
    const color=strokeColorInput.value, stroke=parseInt(strokeWidthInput.value)||2;
    if(drawMode==='draw-free'){
      const ptsPdf=tempPoints.map(p=>({x:+(p.x/scale).toFixed(2), y:+((drawCanvas.height - p.y)/scale).toFixed(2)}));
      if(ptsPdf.length>1){ shapesArray.push({type:'free',pages:[drawPage],x:ptsPdf[0].x,y:ptsPdf[0].y,points:ptsPdf,color,stroke}); historyStack.push({type:'shape',index:shapesArray.length-1}); addShapeRow(shapesArray[shapesArray.length-1]); }
    }else if(drawMode==='draw-rect'){
      const last=tempPoints[tempPoints.length-1]; if(last){
        const x=Math.min(startXc,last.x), y=Math.min(startYc,last.y), w=Math.abs(last.x-startXc), h=Math.abs(last.y-startYc);
        const pdfX=+(x/scale).toFixed(2), pdfYTop=+((drawCanvas.height - y)/scale).toFixed(2), pdfW=+(w/scale).toFixed(2), pdfH=+(h/scale).toFixed(2);
        shapesArray.push({type:'rect',pages:[drawPage],x:pdfX,y:pdfYTop,width:pdfW,height:pdfH,color,stroke});
        historyStack.push({type:'shape',index:shapesArray.length-1}); addShapeRow(shapesArray[shapesArray.length-1]);
      }
    }else if(drawMode==='draw-circle'){
      const last=tempPoints[tempPoints.length-1]; if(last){
        const dx=last.x-startXc, dy=last.y-startYc, r=Math.sqrt(dx*dx+dy*dy);
        const pdfCX=+(startXc/scale).toFixed(2), pdfCY=+((drawCanvas.height - startYc)/scale).toFixed(2), pdfR=+(r/scale).toFixed(2);
        shapesArray.push({type:'circle',pages:[drawPage],x:pdfCX,y:pdfCY,r:pdfR,color,stroke});
        historyStack.push({type:'shape',index:shapesArray.length-1}); addShapeRow(shapesArray[shapesArray.length-1]);
      }
    }
    tempPoints=[]; await renderSinglePage(drawPage); drawCanvas=null; drawPage=null; drawMode=null;
  });
  function previewRedraw(page, cv){
    const node = pageNodes.get(page); if(!node) return;
    const ctx = node.ctx;
    if(node.backgroundImageData) ctx.putImageData(node.backgroundImageData,0,0);
    drawContentToNode(page, node); // redraw static overlays
    const color=strokeColorInput.value, stroke=parseInt(strokeWidthInput.value)||2;
    ctx.save(); ctx.strokeStyle=color; ctx.lineWidth=stroke; ctx.lineCap='round';
    if(modeSelect.value==='draw-free' && tempPoints.length>1){
      ctx.beginPath(); for(let i=0;i<tempPoints.length;i++){ const p=tempPoints[i]; i===0?ctx.moveTo(p.x,p.y):ctx.lineTo(p.x,p.y); } ctx.stroke();
    }else if(modeSelect.value==='draw-rect'){
      const last=tempPoints[tempPoints.length-1]; if(last){ const x=Math.min(startXc,last.x), y=Math.min(startYc,last.y), w=Math.abs(last.x-startXc), h=Math.abs(last.y-startYc); ctx.strokeRect(x,y,w,h); }
    }else if(modeSelect.value==='draw-circle'){
      const last=tempPoints[tempPoints.length-1]; if(last){ const dx=last.x-startXc, dy=last.y-startYc, r=Math.sqrt(dx*dx+dy*dy); ctx.beginPath(); ctx.arc(startXc,startYc,r,0,Math.PI*2); ctx.stroke(); }
    }
    ctx.restore();
  }

  // Undo/Submit/Save image
  document.getElementById('undo-button').addEventListener('click', async ()=>{
    if(historyStack.length===0) return alert('ไม่มีรายการให้ Undo');
    const last=historyStack.pop();
    if(last.type==='text' && textsArray.length){ const rm=textsArray.pop(); await renderSinglePage((rm.pages&&rm.pages[0])||currentPage); if(textTableBody.lastChild) textTableBody.removeChild(textTableBody.lastChild); }
    else if(last.type==='shape' && shapesArray.length){ const rm=shapesArray.pop(); await renderSinglePage((rm.pages&&rm.pages[0])||currentPage); if(shapeTableBody.lastChild) shapeTableBody.removeChild(shapeTableBody.lastChild); }
  });
  document.getElementById('submitArrayID').addEventListener('click', ()=>{
    const pdfUrl=document.getElementById('url').value, outputServer = (window.parent.Ext && window.parent.Ext.getCmp('urlfileID'))?window.parent.Ext.getCmp('urlfileID').getValue():document.getElementById('outputServer').value;
    const jsonData={pdfUrl, outputServer, texts:textsArray};
    fetch('/supplies/pdfAddMulti',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(jsonData)})
      .then(res=>res.json()).then(d=>alert(d.message||'✅ ส่งข้อความสำเร็จ')).catch(()=>alert('❌ ส่งข้อความผิดพลาด'));
  });
  document.getElementById('submitEraser').addEventListener('click', ()=>{
    if(eraseAreas.length===0) return alert('ไม่มีพื้นที่ลบ');
    const pdfUrl=document.getElementById('url').value; const jsonData={pdfUrl, erase:eraseAreas};
    fetch('/supplies/pdfTextErase',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(jsonData)})
      .then(res=>res.json()).then(d=>alert(d.message||'✅ ลบข้อความสำเร็จ')).catch(()=>alert('❌ ลบข้อความผิดพลาด'));
  });
  document.getElementById('save-image-button').addEventListener('click', ()=>{
    const cv = activeCanvas; if(!cv){ alert('ยังไม่ได้เลือกหน้า'); return; }
    const image=cv.toDataURL('image/png'); const link=document.createElement('a'); link.download=`page_${currentPage}.png`; link.href=image; link.click();
  });

  // Save/load JSON (kept)
  function normalizePagesField(arr, fallbackPage=1){
    return (arr||[]).map(o=>{const copy={...o}; if(!Array.isArray(copy.pages)){const p=(typeof copy.page==='number'&&copy.page>0)?copy.page:fallbackPage; copy.pages=[p];} delete copy.page; return copy;});
  }
  function computeFirstRelevantPage(data){
    const pages=[]; (data.texts||[]).forEach(t=>Array.isArray(t.pages)&&pages.push(t.pages[0]));
    (data.shapes||[]).forEach(s=>Array.isArray(s.pages)&&pages.push(s.pages[0]));
    (data.erase||[]).forEach(e=>Number.isInteger(e.page)&&pages.push(e.page));
    const valid=pages.filter(n=>Number.isInteger(n)&&n>=1); return valid.length?Math.min(...valid):1;
  }
  function buildStatePayload(){
    return {
      pr_id:(prIdInput.value||'').trim(), doc_id:(docIdInput.value||'').trim(),
      pdfUrl:document.getElementById('url').value, outputServer:document.getElementById('outputServer').value,
      filePath:'<?= addslashes($filePath) ?>', 
      path:'<?= addslashes($pathJson) ?>',
      scale, totalPages, texts:textsArray, erase:eraseAreas, shapes:shapesArray, timestamp:new Date().toISOString()
    };
  }
  window.savePointCorrect =()=>{
  
   const state=buildStatePayload();
      if(!state.pr_id || !state.doc_id){ alert('กรุณาระบุ PR ID และ Doc ID ให้ครบก่อนบันทึก'); return; }
      fetch('/supplies/sp/app/view_drow_save.php',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(state)})
        .then(res=>res.json()).then(data=>{
          if(data&&data.success){
               window.parent.Ext.example.msg("แจ้งเตือน", `✅ บันทึกสำเร็จ: ${state.pr_id}_${state.doc_id}.json\n${data.url||data.file||''}`, 3);
//                alert(`✅ บันทึกสำเร็จ: ${state.pr_id}_${state.doc_id}.json\n${data.url||data.file||''}`);
            }
          else{ alert('❌ บันทึกไม่สำเร็จ'); }
        }).catch(()=>alert('❌ เรียกใช้งาน PHP ไม่สำเร็จ'));
  };
  document.querySelectorAll('button[id^="save-json-button"]').forEach(btn=>{
    btn.addEventListener('click', ()=>{
     window.savePointCorrect();
    });
  });

  async function applyLoadedState(data){
    try{
      data.texts=normalizePagesField(data.texts,1); data.shapes=normalizePagesField(data.shapes,1);
      if(data.pr_id) prIdInput.value=data.pr_id; if(data.doc_id) docIdInput.value=data.doc_id;
      if(data.outputServer) document.getElementById('outputServer').value=data.outputServer;
      textsArray=data.texts||[]; shapesArray=data.shapes||[]; eraseAreas=data.erase||[]; historyStack=[];
      if(typeof data.scale==='number' && data.scale>0.1 && data.scale<10){ scale=data.scale; updateZoomLabels(); }
      if(data.pdfUrl){ const cur=document.getElementById('url').value; if(cur!==data.pdfUrl){ document.getElementById('url').value=data.pdfUrl; await loadPDF(data.pdfUrl); } }
      refreshTextTable(); refreshShapeTable();
      const firstPage=computeFirstRelevantPage(data);
      const newStart = Math.max(1, Math.min(firstPage, Math.max(1, totalPages - WINDOW_SIZE + 1)));
      await renderWindow(newStart, WINDOW_SIZE);
      await ensurePageLoaded(firstPage);
      setActivePage(firstPage);
      const node = pageNodes.get(firstPage); node?.holder?.scrollIntoView({behavior:'smooth', block:'center'});
    }catch(e){ console.error(e); alert('❌ โหลด JSON แล้วนำไปใช้ไม่สำเร็จ'); }
  }
  async function loadStateFromUrl(url){
    try{
      const res=await fetch(url,{cache:'no-store'}); if(!res.ok) throw new Error('HTTP '+res.status);
      const data=await res.json(); await applyLoadedState(data);
//      console.log(data.shapes.lenght);
      if(res.ok && data.shapes.lenght>0)window.toggleTools();
 
    }catch(e){ console.error(e); console.log('❌ โหลด JSON ไม่สำเร็จ (ตรวจสอบ URL/CORS/สิทธิ์การเข้าถึง)'); }
  }
  
 
  // load json button bindings
  window.loadJsonToImages = (btn) => {
    try{ window.parent.Ext.getCmp("MessageBox_re").getEl().mask("Please wait...", "x-mask-loading"); }catch(e){}
    const but = btn || null;
    if (!but) { try{ window.parent.Ext.getCmp("MessageBox_re").getEl().unmask(); }catch(e){}; return; }
    const handler = async () => {
      const url = (jsonUrlInput.value || '').trim();
      if (!url) { alert('กรุณากรอก JSON URL'); try{ window.parent.Ext.getCmp("MessageBox_re").getEl().unmask(); }catch(e){}; return; }
      await loadStateFromUrl(url);
//      showPanel(document.getElementById('tools2'), 'datasVisible', 'datasPos');
      try{ window.parent.Ext.getCmp("MessageBox_re").getEl().unmask(); }catch(e){}
    };
    if(but==='load'){ handler(); }else{ but.addEventListener('click', handler); }
  };
  document.querySelectorAll('button[id^="load-json-button"]').forEach(btn=>{ window.loadJsonToImages(btn); });
  jsonUrlInput?.addEventListener('keydown', async e=>{ if(e.key==='Enter'){ e.preventDefault(); const url=(jsonUrlInput.value||'').trim(); if(!url) return alert('กรุณากรอก JSON URL'); await loadStateFromUrl(url); }});

  // simple panels/draggable for tools/data (kept minimal)
  const toolsPanel = document.getElementById('tools');
  const datasPanel = document.getElementById('tools2');
  const fabMenu = document.getElementById('fab-menu');
  const fabMenuData = document.getElementById('fab-menu-data');
  function bringToFront(panel){ const base=1001; toolsPanel.style.zIndex=base; datasPanel.style.zIndex=base; panel.style.zIndex=base+2; }
  function normalizeToLeftTop(panel){ const r=panel.getBoundingClientRect(); panel.style.left=r.left+'px'; panel.style.top=r.top+'px'; panel.style.right='auto'; panel.style.bottom='auto'; }
  function clampToViewport(panel){ const r=panel.getBoundingClientRect(), vw=Math.max(document.documentElement.clientWidth,window.innerWidth||0), vh=Math.max(document.documentElement.clientHeight,window.innerHeight||0); let left=r.left, top=r.top, maxLeft=vw-r.width, maxTop=vh-r.height; if(left<0)left=0; if(top<0)top=0; if(left>maxLeft)left=maxLeft; if(top>maxTop)top=maxTop; panel.style.left=left+'px'; panel.style.top=top+'px'; }
  function savePos(panel,key){ const r=panel.getBoundingClientRect(); localStorage.setItem(key,JSON.stringify({left:r.left,top:r.top})); }
  function restorePos(panel,key){ const raw=localStorage.getItem(key); if(!raw) return false; try{const pos=JSON.parse(raw); if(typeof pos.left==='number'&&typeof pos.top==='number'){ panel.style.left=pos.left+'px'; panel.style.top=pos.top+'px'; panel.style.right='auto'; panel.style.bottom='auto'; clampToViewport(panel); return true; }}catch(e){} return false; }
  function makeDraggable(panel, storageKey){ const header=panel.querySelector('.panel-header'); if(!header) return; let dragging=false,startX=0,startY=0,startLeft=0,startTop=0; const onDown=e=>{ if(e.button!==undefined && e.button!==0) return; bringToFront(panel); normalizeToLeftTop(panel); dragging=true; const r=panel.getBoundingClientRect(); startLeft=r.left; startTop=r.top; startX=e.clientX??(e.touches&&e.touches[0].clientX); startY=e.clientY??(e.touches&&e.touches[0].clientY); document.body.style.userSelect='none'; }; const onMove=e=>{ if(!dragging) return; const cx=e.clientX??(e.touches&&e.touches[0].clientX), cy=e.clientY??(e.touches&&e.touches[0].clientY); panel.style.left=(startLeft+(cx-startX))+'px'; panel.style.top=(startTop+(cy-startY))+'px'; clampToViewport(panel); }; const onUp=()=>{ if(!dragging) return; dragging=false; document.body.style.userSelect=''; savePos(panel,storageKey); }; header.addEventListener('mousedown',onDown); window.addEventListener('mousemove',onMove); window.addEventListener('mouseup',onUp); header.addEventListener('touchstart',onDown,{passive:true}); window.addEventListener('touchmove',onMove,{passive:false}); window.addEventListener('touchend',onUp); }
  function showPanel(panel, visKey, posKey){ panel.classList.add('show'); localStorage.setItem(visKey,'1'); if(!restorePos(panel,posKey)){ normalizeToLeftTop(panel); clampToViewport(panel); savePos(panel,posKey); } bringToFront(panel); }
  function hidePanel(panel, visKey){ panel.classList.remove('show'); localStorage.setItem(visKey,'0'); }
  window.togglePanel=(panel, visKey, posKey)=>{ panel.classList.contains('show') ? hidePanel(panel,visKey) : showPanel(panel,visKey,posKey); }
  fabMenu.addEventListener('click', ()=>window.togglePanel(toolsPanel,'toolsVisible','toolsPos'));
  fabMenuData.addEventListener('click', ()=>window.togglePanel(datasPanel,'datasVisible','datasPos'));
  
  toolsPanel.querySelector('.panel-close')?.addEventListener('click',()=>hidePanel(toolsPanel,'toolsVisible'));
  datasPanel.querySelector('.panel-close')?.addEventListener('click',()=>hidePanel(datasPanel,'datasVisible'));
  makeDraggable(toolsPanel,'toolsPos'); makeDraggable(datasPanel,'datasPos');
  if(localStorage.getItem('toolsVisible')==='1') showPanel(toolsPanel,'toolsVisible','toolsPos');
  if(localStorage.getItem('datasVisible')==='1') showPanel(datasPanel,'datasVisible','datasPos');
  // helper to toggle visibility of bookmark list wrap
  const bookmarkListWrap = document.getElementById('bookmark-list-wrap');
  const bookmarkList = document.getElementById('bookmark-list');
  const btnShowHide = document.getElementById('bookmark-showhide');
  const btnExpandAll = document.getElementById('bookmark-expand-all');
  const btnCollapseAll = document.getElementById('bookmark-collapse-all');

  function setBookmarkVisibility(show){
    if(show){
      bookmarkListWrap.style.display = '';
      btnShowHide.textContent = 'ซ่อน';
      localStorage.setItem('bookmarkVisible','1');
    } else {
      bookmarkListWrap.style.display = 'none';
      btnShowHide.textContent = 'แสดง';
      localStorage.setItem('bookmarkVisible','0');
    }
  }
  // init from localStorage
  setBookmarkVisibility(localStorage.getItem('bookmarkVisible') !== '0');

  btnShowHide.addEventListener('click', ()=>{
    const visible = bookmarkListWrap.style.display !== 'none';
    setBookmarkVisibility(!visible);
  });

  function collapseAllBookmarks(){
    bookmarkList.querySelectorAll('.bookmark-children').forEach(el=>el.classList.add('collapsed'));
    // rotate chevrons if any (use data-expanded)
    bookmarkList.querySelectorAll('.bookmark-item .chev').forEach(ch => ch.textContent = '▸');
  }
  function expandAllBookmarks(){
    bookmarkList.querySelectorAll('.bookmark-children').forEach(el=>el.classList.remove('collapsed'));
    bookmarkList.querySelectorAll('.bookmark-item .chev').forEach(ch => ch.textContent = '▾');
  }
  btnCollapseAll.addEventListener('click', collapseAllBookmarks);
  btnExpandAll.addEventListener('click', expandAllBookmarks); 

  window.toggleTools =()=>{ 
        togglePanel(datasPanel,'toolsVisible','toolsPos'); 
        togglePanel(toolsPanel,'toolsVisible','toolsPos'); 
  };

  async function makeItem(node) {
    if (!node || typeof node !== 'object') return null;
    const div = document.createElement('div');
    div.className = 'bookmark-item';

    // children placeholder
    const hasChildren = Array.isArray(node.items) && node.items.length > 0;
    if (hasChildren) {
      div.classList.add('has-children');
    }

    // chevron toggle for items with children
    const chev = document.createElement('span');
    chev.className = 'chev';
    chev.textContent = hasChildren ? '▾' : ''; // ▾ down, ▸ right
    div.appendChild(chev);

    const title = document.createElement('span');
    title.className = 'bookmark-title';
    title.textContent = node.title || '(ไม่ระบุชื่อ)';
    div.appendChild(title);

    const pageSpan = document.createElement('span');
    pageSpan.className = 'bookmark-page';
    pageSpan.textContent = '';
    div.appendChild(pageSpan);

    // click handler for chevron (expand/collapse)
    let childWrap = null;
    chev.addEventListener('click', (ev)=>{
      ev.stopPropagation();
      if(!childWrap) return;
      const collapsed = childWrap.classList.toggle('collapsed');
      chev.textContent = collapsed ? '▸' : '▾';
    });

    // click handler for title -> navigate
    div.addEventListener('click', async (ev) => {
      ev.stopPropagation();
      try {
        if (node.url) { window.open(node.url, '_blank'); return; }
        let destVal = node.dest ?? node.action ?? null;
        if (!destVal) return;
        let destArray = Array.isArray(destVal) ? destVal : await pdf.getDestination(destVal);
        if (!destArray) return;
        const pageRef = destArray[0];
        const pageIndex = await pdf.getPageIndex(pageRef);
        const pageNum = pageIndex + 1;
        await ensurePageLoaded(pageNum);
        await renderSinglePage(pageNum);
        setActivePage(pageNum);
        // scroll into view / respect top coordinate if present
        const nodeEl = pageNodes.get(pageNum);
        if (nodeEl && destArray.length >= 3) {
          let topCoordPdf = null;
          for (let i = 2; i < Math.min(destArray.length, 6); i++) {
            if (typeof destArray[i] === 'number') { topCoordPdf = destArray[i]; break; }
          }
          if (typeof topCoordPdf === 'number') {
            const canvasHeightPx = nodeEl.canvas.height;
            const yPx = Math.round(canvasHeightPx - (topCoordPdf * scale));
            const holderTop = nodeEl.holder.offsetTop;
            const pagesWrapHeight = pagesWrap.clientHeight || window.innerHeight;
            const targetScroll = Math.max(0, holderTop + yPx - Math.round(pagesWrapHeight / 2));
            pagesWrap.scrollTo({ top: targetScroll, behavior: 'smooth' });
            nodeEl.holder.style.boxShadow = '0 0 0 4px rgba(255,200,0,0.3)';
            setTimeout(()=>{ if(nodeEl?.holder) nodeEl.holder.style.boxShadow = (parseInt(nodeEl.holder.dataset.page,10) === currentPage) ? '0 0 0 3px rgba(0,153,255,.45)' : 'none'; }, 900);
            return;
          }
        }
        nodeEl?.holder?.scrollIntoView({behavior:'smooth', block:'center'});
      } catch (err) {
        console.error('bookmark click error:', err);
      }
    });

    // children
    if (hasChildren) {
      childWrap = document.createElement('div');
      childWrap.className = 'bookmark-children';
      for (const ch of node.items) {
        const c = await makeItem(ch);
        if (c) childWrap.appendChild(c);
      }
      div.appendChild(childWrap);
    }

    // resolve and display page number (async)
    (async () => {
      try {
        if (node.url) { pageSpan.textContent = 'link'; return; }
        const destVal = node.dest ?? node.action ?? null;
        if (!destVal) { pageSpan.textContent = ''; return; }
        const destArray = Array.isArray(destVal) ? destVal : await pdf.getDestination(destVal);
        if (!destArray) return;
        const ref = destArray[0];
        const idx = await pdf.getPageIndex(ref);
        pageSpan.textContent = (idx + 1);
      } catch (e) { /* ignore */ }
    })();

    return div;
  }
 
  // Boot
  (async function init(){
    const url = document.getElementById('url').value;
    updateZoomLabels();
    try {
      await loadPDF(url);
    } catch(e) {
      console.error('Error loading PDF', e);
      alert('ไม่สามารถโหลด PDF ได้ (ตรวจสอบ URL/สิทธิ์การเข้าถึง)');
      window.parent.Ext.getCmp("reviewForm").getEl().unmask();
    }
    // try load JSON state automatically if jsonUrl present
    (async ()=>{
      const urlJson=(jsonUrlInput.value||'').trim();
      if(!urlJson) return;
      try { 
          //แปลง json path
          await loadStateFromUrl(urlJson);  
          //
      }catch(e){}
    })();

    try{ window.parent.Ext.getCmp("MessageBox_re").getEl().unmask(); }catch(e){}
  })();

}); // DOMContentLoaded end
</script>
</body>
</html>
