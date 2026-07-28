<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>PDF Viewer: Text + Erase + Draw + Jump + Save/Load JSON</title>
  <script src="./js/pdf.min.js"></script>
  <style>
    body { font-family: sans-serif; padding: 20px; }
    #canvas-container { position: relative; display: inline-block; overflow: auto; }
    #pdf-canvas { border: 1px solid black; cursor: crosshair; margin-top: 10px; }
    .text-overlay {
      position: absolute; border: 1px dashed gray; padding: 2px;
      background: rgba(255,255,255,0.8); z-index: 10; min-width: 50px; white-space: nowrap;
    }
    #eraser-box {
      position: absolute; border: 2px dashed red; pointer-events: none; display: none; z-index: 20;
    }
    #controls label, #controls input, #controls button, select { margin-right: 10px; }
    table { margin-top: 16px; border-collapse: collapse; width: 100%; }
    table, th, td { border: 1px solid #333; }
    th, td { padding: 6px 10px; text-align: center; }
    .chip { display:inline-block; padding:2px 8px; border-radius:10px; background:#eef; border:1px solid #99f; font-size:12px }
    .btn-link { padding:4px 8px; border:1px solid #888; background:#fafafa; cursor:pointer; }
  </style>
</head>
<body>
  <h2>📝 พิมพ์ / 🧽 ลบ / ✏️ วาด / 🎯 ดูตำแหน่ง / 💾 บันทึก-โหลด JSON</h2>

  <div id="controls">
    <p>
      <label>URL:
        <input type="text" id="url" value="https://eis.vajira.ac.th:8443/supplies/upload/serve_pdf.php?pr=D%3A%2FDocuments%2F2025%2FPR25651100016&filename=PR25680600073.pdf" style="width:1000px;">
      </label>
    </p>
    <p>
      <label>OutputServer:
        <input type="text" id="outputServer" value="D:/Documents/pdf/xxx_output_.pdf" style="width:700px;">
      </label>
    </p>

    <!-- NEW: โหลด JSON -->
    <p>
      <span class="chip">โหลด JSON</span>
      <label>JSON URL:
        <input type="text" id="json-url" value="./json/PR25680600073_20.json" placeholder="./json/PR25680600073_20.json" style="width:700px;">
      </label>
      <button id="load-json-button">⬇️ โหลด JSON</button>
    </p>

    <!-- NEW: บันทึก JSON -->
    <p>
      <span class="chip">บันทึก JSON</span>
      <label>PR ID: <input type="text" id="pr-id" placeholder="PR25680600073" style="width:180px;"></label>
      <label>Doc ID: <input type="text" id="doc-id" placeholder="20" style="width:80px;"></label>
      <button id="save-json-button">💾 บันทึก JSON → PHP</button>
    </p>

    <span class="chip">ข้อความ</span>
    <label>โหมดข้อความ:
      <select id="text-mode-sub">
        <option value="normal">ข้อความปกติ</option>
        <option value="box">กล่องข้อความ</option>
      </select>
    </label>
    <label>ขนาดฟอนต์: <input type="number" id="font-size" value="16" min="8" style="width:60px;"></label>
    <label><input type="checkbox" id="bold-toggle"> ตัวหนา</label>

    <br><br>

    <span class="chip">วาด/ลบ</span>
    <label>หน้า: <input type="number" id="page-num" value="1" min="1" style="width:60px;"></label>
    <button id="prev-page">⬅</button>
    <button id="next-page">➡</button>
    <span id="page-info">หน้า 1/1</span>

    <label style="margin-left:12px">โหมด:
      <select id="mode-select">
        <option value="text">โหมดข้อความ</option>
        <option value="erase">โหมดลบข้อความ</option>
        <option value="draw-free">วาดเส้นอิสระ</option>
        <option value="draw-rect">วาดสี่เหลี่ยม</option>
        <option value="draw-circle">วาดวงกลม</option>
      </select>
    </label>
    <label>สีเส้น:
      <input type="color" id="stroke-color" value="#ff0000">
    </label>
    <label>ความหนา:
      <input type="number" id="stroke-width" value="2" min="1" max="20" style="width:60px;">
    </label>
  </div>

  <p>
    <button id="undo-button">↩️ Undo ล่าสุด</button>
    <button id="submitArrayID">📤 ส่งข้อมูลข้อความ</button>
    <button id="submitEraser">🧽 ส่งข้อมูลลบ</button>
    <button id="submitDraw">🎨 ส่งข้อมูลวาดรูป</button>
    <button id="save-image-button">🖼️ บันทึกภาพหน้านี้</button>
  </p>

  <div id="position"></div>

  <div id="canvas-container">
    <canvas id="pdf-canvas"></canvas>
    <div id="eraser-box"></div>
  </div>

  <h3>📋 รายการข้อความ:</h3>
  <table>
    <thead>
      <tr><th>ข้อความ</th><th>หน้า</th><th>X</th><th>Y</th><th>ดูตำแหน่ง</th><th>แก้ไข</th><th>ลบ</th></tr>
    </thead>
    <tbody id="text-table-body"></tbody>
  </table>

  <h3>🖌️ รายการรูปวาด:</h3>
  <table>
    <thead>
      <tr><th>ชนิด</th><th>หน้า</th><th>X</th><th>Y</th><th>W×H / R / จุด</th><th>สี</th><th>หนา</th><th>ดูตำแหน่ง</th><th>ลบ</th></tr>
    </thead>
    <tbody id="shape-table-body"></tbody>
  </table>

  <script>
    // ====== PDF.js worker ======
    pdfjsLib.GlobalWorkerOptions.workerSrc = './js/pdf.worker.min.js';

    // ====== DOM refs ======
    const canvas = document.getElementById('pdf-canvas');
    const ctx = canvas.getContext('2d');
    const container = document.getElementById('canvas-container');
    const eraserBox = document.getElementById('eraser-box');
    const fontSizeInput = document.getElementById('font-size');
    const boldToggle = document.getElementById('bold-toggle');
    const textModeSub = document.getElementById('text-mode-sub');
    const modeSelect = document.getElementById('mode-select');
    const pageNumInput = document.getElementById('page-num');
    const pageInfoSpan = document.getElementById('page-info');
    const positionDiv = document.getElementById('position');
    const textTableBody = document.getElementById('text-table-body');
    const shapeTableBody = document.getElementById('shape-table-body');
    const strokeColorInput = document.getElementById('stroke-color');
    const strokeWidthInput = document.getElementById('stroke-width');
    const prIdInput = document.getElementById('pr-id');
    const docIdInput = document.getElementById('doc-id');
    const jsonUrlInput = document.getElementById('json-url');
    const loadJsonBtn = document.getElementById('load-json-button');

    // ====== State ======
    let pdf = null, scale = 1.5, viewport = null, totalPages = 1;
    let textsArray = [];     // { text, x, y, pages:[n], fontSize, bold, isBox }
    let eraseAreas = [];     // { page, x, y, width, height }
    let shapesArray = [];    // { type, pages:[n], x, y, width?, height?, r?, points?, color, stroke }
    let backgroundImageData = null;
    let historyStack = [];   // {type:'text'|'shape', index:number}
    let markTimer = null;    // marker animation timer
    let _rendering = false;  // prevent concurrent renders

    // ====== Helpers ======
    function sanitizeText(str) {
      return str.replace(/[<>&"]/g, c => ({ '<':'&lt;', '>':'&gt;', '&':'&amp;', '"':'&quot;' }[c]));
    }

    function normalizePagesField(arr, fallbackPage = 1) {
      return (arr || []).map(o => {
        const copy = { ...o };
        if (!Array.isArray(copy.pages)) {
          const p = (typeof copy.page === 'number' && copy.page>0) ? copy.page : fallbackPage;
          copy.pages = [p];
        }
        delete copy.page;
        return copy;
      });
    }

    function computeFirstRelevantPage(data) {
      const pages = [];
      (data.texts || []).forEach(t => Array.isArray(t.pages) && pages.push(t.pages[0]));
      (data.shapes || []).forEach(s => Array.isArray(s.pages) && pages.push(s.pages[0]));
      (data.erase  || []).forEach(e => typeof e.page === 'number' && pages.push(e.page));
      const valid = pages.filter(n => Number.isInteger(n) && n>=1);
      return valid.length ? Math.min(...valid) : 1;
    }

    function loadPDF(url) {
      return pdfjsLib.getDocument(url).promise.then(pdfDoc => {
        pdf = pdfDoc;
        totalPages = pdf.numPages;
        pageNumInput.max = totalPages;
        return renderPage(1);
      });
    }

    function renderPage(pageNumber) {
      pageNumber = Math.max(1, Math.min(totalPages || 1, pageNumber|0));
      if (!pdf) return Promise.resolve();
      if (_rendering) {
        return new Promise(res => setTimeout(() => res(renderPage(pageNumber)), 30));
      }
      _rendering = true;
      pageInfoSpan.innerText = `หน้า ${pageNumber}/${totalPages}`;
      pageNumInput.value = pageNumber;

      return pdf.getPage(pageNumber).then(page => {
        viewport = page.getViewport({ scale });
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        return page.render({ canvasContext: ctx, viewport }).promise.then(() => {
          backgroundImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        });
      }).then(() => {
        drawContent(pageNumber);
        _rendering = false;
      }).catch(err => {
        console.error(err);
        _rendering = false;
      });
    }

    function drawContent(pageNumber) {
      if (backgroundImageData) ctx.putImageData(backgroundImageData, 0, 0);

      // shapes
      shapesArray.forEach(s => {
        if (!s.pages || !s.pages.includes(pageNumber)) return;
        ctx.save();
        ctx.strokeStyle = s.color || '#ff0000';
        ctx.lineWidth = s.stroke || 2;
        ctx.lineCap = 'round';

        if (s.type === 'rect') {
          const x = s.x * scale;
          const yTop = canvas.height - s.y * scale;
          ctx.strokeRect(x, yTop, (s.width||0) * scale, (s.height||0) * scale);
        } else if (s.type === 'circle') {
          const cx = s.x * scale;
          const cy = canvas.height - s.y * scale;
          ctx.beginPath();
          ctx.arc(cx, cy, (s.r||0) * scale, 0, Math.PI * 2);
          ctx.stroke();
        } else if (s.type === 'free') {
          const pts = s.points || [];
          if (pts.length > 1) {
            ctx.beginPath();
            for (let i=0; i<pts.length; i++) {
              const cx = pts[i].x * scale;
              const cy = canvas.height - pts[i].y * scale;
              if (i===0) ctx.moveTo(cx, cy); else ctx.lineTo(cx, cy);
            }
            ctx.stroke();
          }
        }
        ctx.restore();
      });

      // texts
      textsArray.forEach(item => {
        if (!item.pages.includes(pageNumber)) return;
        const drawX = item.x * scale;
        const drawY = canvas.height - item.y * scale;
        const font = `${item.bold ? 'bold ' : ''}${item.fontSize || 16}px sans-serif`;
        ctx.font = font;
        ctx.fillStyle = 'black';
        const textWidth = ctx.measureText(item.text).width;

        if (item.isBox) {
          ctx.strokeStyle = 'red';
          ctx.lineWidth = 1.5;
          ctx.strokeRect(drawX, drawY - (item.fontSize || 16), textWidth + 10, (item.fontSize || 16) + 6);
          ctx.fillText(item.text, drawX + 5, drawY - 6);
        } else {
          ctx.beginPath();
          ctx.moveTo(drawX, drawY);
          ctx.lineTo(drawX + textWidth, drawY);
          ctx.strokeStyle = 'red';
          ctx.lineWidth = 1.5;
          ctx.stroke();
          ctx.fillText(item.text, drawX, drawY - 4);
        }
      });
    }

    // ====== Jump/Marker ======
    function drawPulseMarker(cx, cy, baseSize = 10, ms = 1200, color = '#00aaff') {
      const start = performance.now();
      if (markTimer) cancelAnimationFrame(markTimer);
      function frame(t) {
        const ratio = Math.min(1, (t - start) / ms);
        const r = baseSize + ratio * 18;
        const alpha = 1 - ratio;
        drawContent(parseInt(pageNumInput.value)||1);
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI*2); ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(cx - r, cy); ctx.lineTo(cx + r, cy);
        ctx.moveTo(cx, cy - r); ctx.lineTo(cx, cy + r);
        ctx.stroke();
        ctx.restore();
        if (ratio < 1) { markTimer = requestAnimationFrame(frame); }
        else { drawContent(parseInt(pageNumInput.value)||1); }
      }
      markTimer = requestAnimationFrame(frame);
    }

    async function goToPosition(page, xPdf, yPdf, opts = {}) {
      page = Math.max(1, Math.min(totalPages, page|0));
      await renderPage(page);
      const cx = xPdf * scale;
      const cy = canvas.height - yPdf * scale;
      if (opts.kind === 'rect' && opts.width && opts.height) {
        drawContent(page);
        ctx.save(); ctx.setLineDash([6,4]); ctx.strokeStyle = opts.color || '#00aaff'; ctx.lineWidth = 2;
        ctx.strokeRect(cx, cy - opts.height*scale, opts.width*scale, opts.height*scale);
        ctx.restore();
      } else if (opts.kind === 'circle' && opts.r) {
        drawContent(page);
        ctx.save(); ctx.setLineDash([6,4]); ctx.strokeStyle = opts.color || '#00aaff'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(cx, cy, opts.r*scale, 0, Math.PI*2); ctx.stroke();
        ctx.restore();
      }
      drawPulseMarker(cx, cy, 10, 1300, opts.color || '#00aaff');
      canvas.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    // ====== Tables ======
    function addTextRow(item) {
      const tr = document.createElement('tr');
      const page = item.pages[0];
      const tdText = document.createElement('td');
      tdText.innerText = sanitizeText(item.text);
      tr.appendChild(tdText);
      tr.innerHTML += `<td>${page}</td><td>${item.x}</td><td>${item.y}</td>`;

      const tdJump = document.createElement('td');
      const jBtn = document.createElement('button');
      jBtn.className = 'btn-link';
      jBtn.textContent = 'ไป';
      jBtn.onclick = () => goToPosition(page, item.x, item.y, { color:'#00aaff' });
      tdJump.appendChild(jBtn);
      tr.appendChild(tdJump);

      const tdEdit = document.createElement('td');
      const editBtn = document.createElement('button');
      editBtn.textContent = 'แก้ไข';
      editBtn.onclick = () => {
        const newText = prompt('พิมพ์ข้อความใหม่:', item.text);
        if (newText !== null && newText.trim() !== '') {
          item.text = newText.trim();
          tdText.innerText = sanitizeText(newText);
          renderPage(page);
        }
      };
      tdEdit.appendChild(editBtn);
      tr.appendChild(tdEdit);

      const tdDelete = document.createElement('td');
      const deleteBtn = document.createElement('button');
      deleteBtn.textContent = 'ลบ';
      deleteBtn.onclick = () => {
        tr.remove();
        const idx = textsArray.indexOf(item);
        if (idx >= 0) textsArray.splice(idx, 1);
        renderPage(parseInt(pageNumInput.value)||1);
      };
      tdDelete.appendChild(deleteBtn);
      tr.appendChild(tdDelete);

      textTableBody.appendChild(tr);
    }

    function refreshTextTable() {
      textTableBody.innerHTML = '';
      textsArray.forEach(addTextRow);
    }

    function addShapeRow(shape) {
      const tr = document.createElement('tr');
      const page = (shape.pages && shape.pages[0]) || 1;
      const whOrR =
        shape.type === 'rect'   ? `${shape.width} × ${shape.height}` :
        shape.type === 'circle' ? `${shape.r}` :
        shape.type === 'free'   ? `${(shape.points||[]).length} pts` : '-';

      tr.innerHTML = `
        <td>${shape.type}</td>
        <td>${page}</td>
        <td>${shape.x}</td>
        <td>${shape.y}</td>
        <td>${whOrR}</td>
        <td><span style="display:inline-block;width:18px;height:18px;border:1px solid #ccc;vertical-align:middle;background:${shape.color||'#000'}"></span></td>
        <td>${shape.stroke || 2}</td>
      `;

      const tdJump = document.createElement('td');
      const jBtn = document.createElement('button');
      jBtn.className = 'btn-link';
      jBtn.textContent = 'ไป';
      jBtn.onclick = () => {
        if (shape.type === 'rect') {
          goToPosition(page, shape.x, shape.y, { kind:'rect', width:shape.width, height:shape.height, color:'#00aaff' });
        } else if (shape.type === 'circle') {
          goToPosition(page, shape.x, shape.y, { kind:'circle', r:shape.r, color:'#00aaff' });
        } else {
          goToPosition(page, shape.x, shape.y, { color:'#00aaff' });
        }
      };
      tdJump.appendChild(jBtn);
      tr.appendChild(tdJump);

      const tdDel = document.createElement('td');
      const delBtn = document.createElement('button');
      delBtn.textContent = 'ลบ';
      delBtn.onclick = () => {
        const idx = shapesArray.indexOf(shape);
        if (idx >= 0) {
          shapesArray.splice(idx, 1);
          tr.remove();
          renderPage(parseInt(pageNumInput.value)||1);
        }
      };
      tdDel.appendChild(delBtn);
      tr.appendChild(tdDel);

      shapeTableBody.appendChild(tr);
    }

    function refreshShapeTable() {
      shapeTableBody.innerHTML = '';
      shapesArray.forEach(addShapeRow);
    }

    // ====== Navigation ======
    pageNumInput.addEventListener('change', async () => {
      const n = Math.max(1, Math.min(totalPages, parseInt(pageNumInput.value)||1));
      await renderPage(n);
    });
    document.getElementById('prev-page').addEventListener('click', async () => {
      let current = parseInt(pageNumInput.value)||1;
      if (current > 1) await renderPage(current - 1);
    });
    document.getElementById('next-page').addEventListener('click', async () => {
      let current = parseInt(pageNumInput.value)||1;
      if (current < totalPages) await renderPage(current + 1);
    });
    document.getElementById('url').addEventListener('change', () => loadPDF(document.getElementById('url').value));

    // ====== Eraser ======
    canvas.addEventListener('mousedown', e => {
      if (modeSelect.value !== 'erase') return;
      const rect = canvas.getBoundingClientRect();
      const startX = e.clientX - rect.left;
      const startY = e.clientY - rect.top;
      eraserBox.style.left = `${startX}px`;
      eraserBox.style.top = `${startY}px`;
      eraserBox.style.width = '0px';
      eraserBox.style.height = '0px';
      eraserBox.style.display = 'block';

      function onMouseMove(e2) {
        const x = e2.clientX - rect.left;
        const y = e2.clientY - rect.top;
        const w = x - startX;
        const h = y - startY;
        eraserBox.style.left = (w < 0 ? x : startX) + 'px';
        eraserBox.style.top = (h < 0 ? y : startY) + 'px';
        eraserBox.style.width = Math.abs(w) + 'px';
        eraserBox.style.height = Math.abs(h) + 'px';
      }

      function onMouseUp(e2) {
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
        eraserBox.style.display = 'none';

        const endX = e2.clientX - rect.left;
        const endY = e2.clientY - rect.top;
        const rectX = Math.min(startX, endX);
        const rectY = Math.min(startY, endY);
        const rectW = Math.abs(endX - startX);
        const rectH = Math.abs(endY - startY);

        const pdfX = +(rectX / scale).toFixed(2);
        const pdfY = +((canvas.height - rectY) / scale).toFixed(2);
        const pdfW = +(rectW / scale).toFixed(2);
        const pdfH = +(rectH / scale).toFixed(2);

        eraseAreas.push({ page: parseInt(pageNumInput.value)||1, x: pdfX, y: pdfY, width: pdfW, height: pdfH });
        positionDiv.innerText = `🧽 ลบ: X=${pdfX}, Y=${pdfY}, W=${pdfW}, H=${pdfH}`;
      }

      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
    });

    // ====== Text: click place ======
    canvas.addEventListener('click', e => {
      if (modeSelect.value !== 'text') return;
      document.querySelectorAll('.text-overlay').forEach(el => el.remove());
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const page = parseInt(pageNumInput.value)||1;
      const pdfX = parseFloat((x / scale).toFixed(2));
      const pdfY = parseFloat(((canvas.height - y) / scale).toFixed(2));
      positionDiv.innerText = `พิกัด: X=${pdfX}, Y=${pdfY}`;

      const input = document.createElement('div');
      input.contentEditable = true;
      input.className = 'text-overlay';
      input.style.left = `${x}px`;
      input.style.top = `${y - parseInt(fontSizeInput.value)}px`;
      input.style.fontSize = `${fontSizeInput.value}px`;
      input.style.fontWeight = boldToggle.checked ? 'bold' : 'normal';
      container.appendChild(input);
      input.focus();

      input.addEventListener('blur', () => {
        const text = input.innerText.trim();
        if (text) {
          const item = {
            text, x: pdfX, y: pdfY, pages: [page],
            fontSize: parseInt(fontSizeInput.value), bold: boldToggle.checked, isBox: textModeSub.value === 'box'
          };
          textsArray.push(item);
          historyStack.push({type:'text', index:textsArray.length-1});
          addTextRow(item);
          renderPage(page);
        }
        input.remove();
      });

      input.addEventListener('keydown', e => {
        if (e.key === 'Enter') { e.preventDefault(); input.blur(); }
      });
    });

    // ====== Draw modes ======
    let drawing = false;
    let tempPoints = [];
    let startXc = 0, startYc = 0;

    function previewRedraw(page) {
      if (!backgroundImageData) return;
      ctx.putImageData(backgroundImageData, 0, 0);
      drawContent(page);
      const mode = modeSelect.value;
      const color = strokeColorInput.value;
      const stroke = parseInt(strokeWidthInput.value) || 2;
      ctx.save();
      ctx.strokeStyle = color;
      ctx.lineWidth = stroke;
      ctx.lineCap = 'round';

      if (mode === 'draw-free' && tempPoints.length > 1) {
        ctx.beginPath();
        for (let i=0;i<tempPoints.length;i++){
          const p = tempPoints[i];
          if (i===0) ctx.moveTo(p.x, p.y); else ctx.lineTo(p.x, p.y);
        }
        ctx.stroke();
      } else if (mode === 'draw-rect') {
        const last = tempPoints[tempPoints.length - 1];
        if (last) {
          const x = Math.min(startXc, last.x);
          const y = Math.min(startYc, last.y);
          const w = Math.abs(last.x - startXc);
          const h = Math.abs(last.y - startYc);
          ctx.strokeRect(x, y, w, h);
        }
      } else if (mode === 'draw-circle') {
        const last = tempPoints[tempPoints.length - 1];
        if (last) {
          const cx = startXc, cy = startYc;
          const dx = last.x - cx, dy = last.y - cy;
          const r = Math.sqrt(dx*dx + dy*dy);
          ctx.beginPath();
          ctx.arc(cx, cy, r, 0, Math.PI*2);
          ctx.stroke();
        }
      }
      ctx.restore();
    }

    function pushShapeRect(page, color, stroke, pdfX, pdfYTop, pdfW, pdfH){
      shapesArray.push({ type:'rect', pages:[page], x:pdfX, y:pdfYTop, width:pdfW, height:pdfH, color, stroke });
      historyStack.push({type:'shape', index:shapesArray.length-1});
      addShapeRow(shapesArray[shapesArray.length-1]);
    }
    function pushShapeCircle(page, color, stroke, pdfCX, pdfCY, pdfR){
      shapesArray.push({ type:'circle', pages:[page], x:pdfCX, y:pdfCY, r:pdfR, color, stroke });
      historyStack.push({type:'shape', index:shapesArray.length-1});
      addShapeRow(shapesArray[shapesArray.length-1]);
    }
    function pushShapeFree(page, color, stroke, ptsPdf){
      const head = ptsPdf[0];
      shapesArray.push({ type:'free', pages:[page], x:head.x, y:head.y, points:ptsPdf, color, stroke });
      historyStack.push({type:'shape', index:shapesArray.length-1});
      addShapeRow(shapesArray[shapesArray.length-1]);
    }

    canvas.addEventListener('mousedown', e => {
      const mode = modeSelect.value;
      if (!mode.startsWith('draw-')) return;
      const rect = canvas.getBoundingClientRect();
      startXc = e.clientX - rect.left;
      startYc = e.clientY - rect.top;
      tempPoints = [{x:startXc, y:startYc}];
      drawing = true;
    });

    document.addEventListener('mousemove', e => {
      if (!drawing) return;
      const rect = canvas.getBoundingClientRect();
      const x = Math.max(0, Math.min(canvas.width, e.clientX - rect.left));
      const y = Math.max(0, Math.min(canvas.height, e.clientY - rect.top));
      tempPoints.push({x,y});
      previewRedraw(parseInt(pageNumInput.value)||1);
    });

    document.addEventListener('mouseup', e => {
      if (!drawing) return;
      drawing = false;

      const mode = modeSelect.value;
      const page = parseInt(pageNumInput.value)||1;
      const color = strokeColorInput.value;
      const stroke = parseInt(strokeWidthInput.value) || 2;

      if (mode === 'draw-free') {
        const ptsPdf = tempPoints.map(p => ({
          x: +(p.x / scale).toFixed(2),
          y: +((canvas.height - p.y) / scale).toFixed(2)
        }));
        if (ptsPdf.length > 1) pushShapeFree(page, color, stroke, ptsPdf);
      } else if (mode === 'draw-rect') {
        const last = tempPoints[tempPoints.length - 1];
        if (last) {
          const x = Math.min(startXc, last.x);
          const y = Math.min(startYc, last.y);
          const w = Math.abs(last.x - startXc);
          const h = Math.abs(last.y - startYc);

          const pdfX = +(x / scale).toFixed(2);
          const pdfYTop = +((canvas.height - y) / scale).toFixed(2);
          const pdfW = +(w / scale).toFixed(2);
          const pdfH = +(h / scale).toFixed(2);

          pushShapeRect(page, color, stroke, pdfX, pdfYTop, pdfW, pdfH);
        }
      } else if (mode === 'draw-circle') {
        const last = tempPoints[tempPoints.length - 1];
        if (last) {
          const cx = startXc, cy = startYc;
          const dx = last.x - cx, dy = last.y - cy;
          const r = Math.sqrt(dx*dx + dy*dy);

          const pdfCX = +(cx / scale).toFixed(2);
          const pdfCY = +((canvas.height - cy) / scale).toFixed(2);
          const pdfR  = +(r / scale).toFixed(2);

          pushShapeCircle(page, color, stroke, pdfCX, pdfCY, pdfR);
        }
      }
      tempPoints = [];
      renderPage(page);
    });

    // ====== Undo ======
    document.getElementById('undo-button').addEventListener('click', async () => {
      const page = parseInt(pageNumInput.value)||1;
      if (historyStack.length === 0) return alert('ไม่มีรายการให้ Undo');
      const last = historyStack.pop();
      if (last.type === 'text' && textsArray.length) {
        textsArray.pop();
        if (textTableBody.lastChild) textTableBody.removeChild(textTableBody.lastChild);
      } else if (last.type === 'shape' && shapesArray.length) {
        shapesArray.pop();
        if (shapeTableBody.lastChild) shapeTableBody.removeChild(shapeTableBody.lastChild);
      }
      await renderPage(page);
    });

    // ====== Submit buttons ======
    document.getElementById('submitArrayID').addEventListener('click', () => {
      const pdfUrl = document.getElementById('url').value;
      const outputServer = document.getElementById('outputServer').value;
      const jsonData = { pdfUrl, outputServer, texts: textsArray };
      fetch('/supplies/pdfAddMulti', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(jsonData)
      })
      .then(res => res.json())
      .then(data => alert(data.message || '✅ ส่งข้อความสำเร็จ'))
      .catch(() => alert('❌ ส่งข้อความผิดพลาด'));
    });

    document.getElementById('submitEraser').addEventListener('click', () => {
      if (eraseAreas.length === 0) return alert('ไม่มีพื้นที่ลบ');
      const pdfUrl = document.getElementById('url').value;
      const jsonData = { pdfUrl, erase: eraseAreas };
      fetch('/supplies/pdfTextErase', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(jsonData)
      })
      .then(res => res.json())
      .then(data => alert(data.message || '✅ ลบข้อความสำเร็จ'))
      .catch(() => alert('❌ ลบข้อความผิดพลาด'));
    });

    document.getElementById('submitDraw').addEventListener('click', () => {
      if (shapesArray.length === 0) return alert('ยังไม่มีรูปวาด');
      const pdfUrl = document.getElementById('url').value;
      const outputServer = document.getElementById('outputServer').value;
      const jsonData = { pdfUrl, outputServer, shapes: shapesArray };
      fetch('/supplies/pdfDraw', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(jsonData)
      })
      .then(res => res.json())
      .then(data => alert(data.message || '✅ ส่งรูปวาดสำเร็จ'))
      .catch(() => alert('❌ ส่งรูปวาดผิดพลาด'));
    });

    document.getElementById('save-image-button').addEventListener('click', () => {
      const image = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `page_${pageNumInput.value}.png`;
      link.href = image;
      link.click();
    });

    // ====== Save JSON → PHP ======
    function buildStatePayload() {
      return {
        pr_id: (prIdInput.value || '').trim(),
        doc_id: (docIdInput.value || '').trim(),
        pdfUrl: document.getElementById('url').value,
        outputServer: document.getElementById('outputServer').value,
        scale,
        totalPages,
        texts: textsArray,
        erase: eraseAreas,
        shapes: shapesArray,
        timestamp: new Date().toISOString()
      };
    }

    document.getElementById('save-json-button').addEventListener('click', () => {
      const state = buildStatePayload();
      if (!state.pr_id || !state.doc_id) {
        alert('กรุณาระบุ PR ID และ Doc ID ให้ครบก่อนบันทึก');
        return;
      }
      fetch('/supplies/sp/app/view_drow_save.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(state)
      })
      .then(res => res.json())
      .then(data => {
        if (data && data.success) {
          alert(`✅ บันทึกสำเร็จ: ${state.pr_id}_${state.doc_id}.json\n${data.url || data.file || ''}`);
        } else {
          alert('❌ บันทึกไม่สำเร็จ');
        }
      })
      .catch(() => alert('❌ เรียกใช้งาน PHP ไม่สำเร็จ'));
    });

    // ====== NEW: Load JSON from URL ======
    async function applyLoadedState(data) {
      try {
        // normalize
        data.texts  = normalizePagesField(data.texts, 1);
        data.shapes = normalizePagesField(data.shapes, 1);

        // set UI fields
        if (data.pr_id)  prIdInput.value = data.pr_id;
        if (data.doc_id) docIdInput.value = data.doc_id;
        if (data.outputServer) document.getElementById('outputServer').value = data.outputServer;

        // update state
        textsArray  = data.texts  || [];
        shapesArray = data.shapes || [];
        eraseAreas  = data.erase  || [];
        historyStack = []; // reset history

        // adopt saved scale if present
        if (typeof data.scale === 'number' && data.scale > 0.1 && data.scale < 10) {
          scale = data.scale;
        }

        // load PDF if provided
        let needRender = true;
        if (data.pdfUrl) {
          const cur = document.getElementById('url').value;
          if (cur !== data.pdfUrl) {
            document.getElementById('url').value = data.pdfUrl;
            await loadPDF(data.pdfUrl);
            needRender = false; // renderPage done by loadPDF
          }
        }

        // refresh tables
        refreshTextTable();
        refreshShapeTable();

        // go to first relevant page
        const firstPage = computeFirstRelevantPage(data);
        await renderPage(firstPage);
      } catch (e) {
        console.error(e);
        alert('❌ โหลด JSON แล้วนำไปใช้ไม่สำเร็จ');
      }
    }

    async function loadStateFromUrl(url) {
      try {
        const res = await fetch(url, { cache: 'no-store' });
        if (!res.ok) throw new Error('HTTP ' + res.status);
        const data = await res.json();
        await applyLoadedState(data);
        alert('✅ โหลด JSON สำเร็จ');
      } catch (e) {
        console.error(e);
        alert('❌ โหลด JSON ไม่สำเร็จ (ตรวจสอบ URL/CORS/สิทธิ์การเข้าถึง)');
      }
    }

    loadJsonBtn.addEventListener('click', async () => {
      const url = (jsonUrlInput.value || '').trim();
      if (!url) { alert('กรุณากรอก JSON URL'); return; }
      await loadStateFromUrl(url);
    });

    jsonUrlInput.addEventListener('keydown', async (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        const url = (jsonUrlInput.value || '').trim();
        if (!url) { alert('กรุณากรอก JSON URL'); return; }
        await loadStateFromUrl(url);
      }
    });

    // ====== Start ======
    loadPDF(document.getElementById('url').value);
  </script>
</body>
</html>
