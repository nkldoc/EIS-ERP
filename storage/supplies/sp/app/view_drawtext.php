<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>PDF Viewer: Add/Edit/Delete Text</title>
  <script src="./js/pdf.min.js"></script>
  <style>
    body { font-family: sans-serif; padding: 20px; }
    #canvas-container { position: relative; display: inline-block; overflow: auto; }
    #pdf-canvas { border: 1px solid black; cursor: crosshair; margin-top: 10px; }
    .text-overlay {
      position: absolute;
      border: 1px dashed gray;
      padding: 2px;
      background: rgba(255,255,255,0.8);
      z-index: 10;
      min-width: 50px;
      white-space: nowrap;
    }
    #eraser-box {
      position: absolute;
      border: 2px dashed red;
      pointer-events: none;
      display: none;
      z-index: 20;
    }
    #controls label, #controls input, #controls button, select { margin-right: 10px; }
    table { margin-top: 20px; border-collapse: collapse; width: 100%; }
    table, th, td { border: 1px solid black; }
    th, td { padding: 6px 10px; text-align: center; }
  </style>
</head>
<body>
  <h2>📝 พิมพ์หรือ 🧽 ลบข้อความบน PDF</h2>

  <div id="controls">
     <p><label>URL: <input type="text" id="url" value="https://eis.vajira.ac.th:8443/supplies/upload/serve_pdf.php?pr=D%3A%2FDocuments%2F2025%2FPR25651100016&filename=PR25680600073.pdf" style="width:1000px;"></label>  </p> 
    <p> <label>OutputServer: <input type="text" id="outputServer" value="D:/Documents/pdf/xxx_output_.pdf" style="width:700px;"></label>   </p>
    <label>โหมดข้อความ:
      <select id="text-mode-sub">
        <option value="normal">ข้อความปกติ</option>
        <option value="box">กล่องข้อความ</option>
      </select>
    </label>
    <label>ขนาดฟอนต์: <input type="number" id="font-size" value="16" min="8" style="width:60px;"></label>
    <label><input type="checkbox" id="bold-toggle"> ตัวหนา</label>
    <label>หน้า: <input type="number" id="page-num" value="1" min="1" style="width:60px;"></label>
    <button id="prev-page">⬅</button>
    <button id="next-page">➡</button>
    <span id="page-info">หน้า 1/1</span>
    <select id="mode-select">
      <option value="text">โหมดข้อความ</option>
      <option value="erase">โหมดลบข้อความ</option>
    </select>
  </div>

  <p>
    <button id="undo-button">↩️ Undo ล่าสุด</button>
    <button id="submitArrayID">📤 ส่งข้อมูลข้อความ</button>
    <button id="submitEraser">🧽 ส่งข้อมูลลบ</button>
    <button id="save-image-button">💾 บันทึกภาพ</button>
  </p>

  <div id="position"></div>
  <div id="canvas-container">
    <canvas id="pdf-canvas"></canvas>
    <div id="eraser-box"></div>
  </div>

  <h3>📋 รายการข้อความ:</h3>
  <table>
    <thead>
      <tr><th>ข้อความ</th><th>หน้า</th><th>X</th><th>Y</th><th>แก้ไข</th><th>ลบ</th></tr>
    </thead>
    <tbody id="text-table-body"></tbody>
  </table>

  <script>
    pdfjsLib.GlobalWorkerOptions.workerSrc = './js/pdf.worker.min.js';

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
    const tableBody = document.getElementById('text-table-body');

    let pdf = null, scale = 1.5, viewport = null, totalPages = 1;
    let textsArray = [], eraseAreas = [], backgroundImageData = null;

    function loadPDF(url) {
      pdfjsLib.getDocument(url).promise.then(pdfDoc => {
        pdf = pdfDoc;
        totalPages = pdf.numPages;
        pageNumInput.max = totalPages;
        renderPage(1);
      });
    }

    function sanitizeText(str) {
      return str.replace(/[<>&"]/g, c => ({ '<':'&lt;', '>':'&gt;', '&':'&amp;', '"':'&quot;' }[c]));
    }

    function renderPage(pageNumber) {
      if (pageNumber < 1 || pageNumber > totalPages) return;
      pageInfoSpan.innerText = `หน้า ${pageNumber}/${totalPages}`;
      pageNumInput.value = pageNumber;
      pdf.getPage(pageNumber).then(page => {
        viewport = page.getViewport({ scale });
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        return page.render({ canvasContext: ctx, viewport }).promise.then(() => {
          backgroundImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        });
      }).then(() => drawContent(pageNumber));
    }

    function drawContent(pageNumber) {
      if (backgroundImageData)
        ctx.putImageData(backgroundImageData, 0, 0);

      textsArray.forEach(item => {
        if (item.pages.includes(pageNumber)) {
          const drawX = item.x * scale;
          const drawY = canvas.height - item.y * scale;
          const font = `${item.bold ? 'bold ' : ''}${item.fontSize || 16}px sans-serif`;
          ctx.font = font;
          ctx.fillStyle = 'black';
          const textWidth = ctx.measureText(item.text).width;

          if (item.isBox) {
            ctx.strokeStyle = 'red';
            ctx.lineWidth = 1.5;
            ctx.strokeRect(drawX, drawY - (item.fontSize || 16), textWidth + 10, item.fontSize + 6);
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
        }
      });
    }

    pageNumInput.addEventListener('change', () => renderPage(parseInt(pageNumInput.value)));
    document.getElementById('prev-page').addEventListener('click', () => {
      let current = parseInt(pageNumInput.value);
      if (current > 1) renderPage(current - 1);
    });
    document.getElementById('next-page').addEventListener('click', () => {
      let current = parseInt(pageNumInput.value);
      if (current < totalPages) renderPage(current + 1);
    });

    document.getElementById('url').addEventListener('change', () => {
      const newUrl = document.getElementById('url').value;
      loadPDF(newUrl);
    });

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

        eraseAreas.push({ page: parseInt(pageNumInput.value), x: pdfX, y: pdfY, width: pdfW, height: pdfH });
        positionDiv.innerText = `🧽 ลบ: X=${pdfX}, Y=${pdfY}, W=${pdfW}, H=${pdfH}`;
      }

      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
    });

    canvas.addEventListener('click', e => {
      if (modeSelect.value !== 'text') return;
      document.querySelectorAll('.text-overlay').forEach(el => el.remove());
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const page = parseInt(pageNumInput.value);
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
            text,
            x: pdfX,
            y: pdfY,
            pages: [page],
            fontSize: parseInt(fontSizeInput.value),
            bold: boldToggle.checked,
            isBox: textModeSub.value === 'box'
          };
          textsArray.push(item);
          addTableRow(item);
          renderPage(page);
        }
        input.remove();
      });

      input.addEventListener('keydown', e => {
        if (e.key === 'Enter') {
          e.preventDefault();
          input.blur();
        }
      });
    });

    function addTableRow(item) {
      const tr = document.createElement("tr");
      const page = item.pages[0];
      const tdText = document.createElement("td");
      tdText.innerText = sanitizeText(item.text);
      tr.appendChild(tdText);
      tr.innerHTML += `<td>${page}</td><td>${item.x}</td><td>${item.y}</td>`;

      const tdEdit = document.createElement("td");
      const editBtn = document.createElement("button");
      editBtn.textContent = "แก้ไข";
      editBtn.onclick = () => {
        const newText = prompt("พิมพ์ข้อความใหม่:", item.text);
        if (newText !== null && newText.trim() !== "") {
          item.text = newText.trim();
          tdText.innerText = sanitizeText(newText);
          renderPage(page);
        }
      };
      tdEdit.appendChild(editBtn);
      tr.appendChild(tdEdit);

      const tdDelete = document.createElement("td");
      const deleteBtn = document.createElement("button");
      deleteBtn.textContent = "ลบ";
      deleteBtn.onclick = () => {
        tr.remove();
        textsArray = textsArray.filter(t => t !== item);
        renderPage(page);
      };
      tdDelete.appendChild(deleteBtn);
      tr.appendChild(tdDelete);

      tableBody.appendChild(tr);
    }

    document.getElementById("undo-button").addEventListener("click", () => {
      const page = parseInt(pageNumInput.value);
      if (textsArray.length > 0) {
        textsArray.pop();
        tableBody.removeChild(tableBody.lastChild);
        renderPage(page);
      } else {
        alert("ไม่มีข้อความให้ Undo");
      }
    });

    document.getElementById("submitArrayID").addEventListener("click", () => {
      const pdfUrl = document.getElementById('url').value;
      const outputServer = document.getElementById('outputServer').value;
      const jsonData = { pdfUrl, outputServer, texts: textsArray };
      fetch("/supplies/pdfAddMulti", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(jsonData)
      })
      .then(res => res.json())
      .then(data => alert(data.message || "✅ ส่งข้อความสำเร็จ"))
      .catch(err => alert("❌ ส่งข้อความผิดพลาด"));
    });

    document.getElementById("submitEraser").addEventListener("click", () => {
      if (eraseAreas.length === 0) return alert("ไม่มีพื้นที่ลบ");
      const pdfUrl = document.getElementById('url').value;
      const jsonData = { pdfUrl, erase: eraseAreas };
      fetch("/supplies/pdfTextErase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(jsonData)
      })
      .then(res => res.json())
      .then(data => alert(data.message || "✅ ลบข้อความสำเร็จ"))
      .catch(err => alert("❌ ลบข้อความผิดพลาด"));
    });

    document.getElementById("save-image-button").addEventListener("click", () => {
      const image = canvas.toDataURL("image/png");
      const link = document.createElement('a');
      link.download = `page_${pageNumInput.value}.png`;
      link.href = image;
      link.click();
    });

    // เริ่มต้นโหลด PDF
    loadPDF(document.getElementById('url').value);
  </script>
</body>
</html>
