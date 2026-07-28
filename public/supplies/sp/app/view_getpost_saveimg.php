<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>PDF Viewer: Add Text & Draw</title>
    <script src="./js/pdf.min.js"></script>
    <style>
        body {
            font-family: sans-serif;
            padding: 20px;
        }
        #pdf-canvas {
            border: 1px solid black;
            cursor: crosshair;
            margin-top: 10px;
        }
        #controls label, #controls input, #controls button, select {
            margin-right: 10px;
        }
        table {
            margin-top: 20px;
            border-collapse: collapse;
            width: 100%;
        }
        table, th, td {
            border: 1px solid black;
        }
        th, td {
            padding: 6px 10px;
            text-align: center;
        }
    </style>
</head>
<body>
    <h2>📝 เพิ่มข้อความ | ✍️ วาดเส้น | ↩️ Undo | 📤 ส่งข้อมูล</h2>

    <div id="controls">
        <label>ข้อความ: <input type="text" id="text-input" value="ตัวอย่างข้อความ" /></label>
        <label>โหมดข้อความย่อย:
            <select id="text-mode-sub">
                <option value="normal">พิมพ์ข้อความ</option>
                <option value="box">กล่องข้อความ</option>
            </select>
        </label>
        <label>ขนาดฟอนต์: <input type="number" id="font-size" value="16" min="8" style="width: 60px;"></label>
        <label>ความหนาเส้น: <input type="number" id="stroke-width" value="1.5" step="0.5" min="0.5" style="width: 60px;"></label>
        <label>หน้า: <input type="number" id="page-num" value="1" min="1" style="width: 60px;"></label>
        <button id="prev-page">⬅ หน้า ก่อนหน้า</button>
        <button id="next-page">➡ หน้า ถัดไป</button>
        <span id="page-info">หน้า 1/1</span>
        <select id="mode-select">
            <option value="text">โหมดข้อความ</option>
            <option value="draw">โหมดวาดเส้น</option>
        </select> 
    </div>

    <p>
        <button id="undo-button">↩️ Undo ล่าสุด</button>
        <button id="add-button">➕ เพิ่มข้อความ ก่อนบันทึกลง PDF</button> 
        <button id="submitArrayID">📤 ส่ง บันทึกข้อความลง PDF</button>
        <button id="save-image-button">💾 Save Image ลงเครื่อง</button>
        <button id="save-server-button">💾 Save Image เข้าสู่ระบบ</button>
    </p>

    <div id="position"></div>
    <canvas id="pdf-canvas"></canvas>

    <h3>📋 รายการข้อความที่บันทึก:</h3>
    <table>
        <thead>
            <tr><th>ข้อความ</th><th>หน้า</th><th>X</th><th>Y</th><th>ลบ</th></tr>
        </thead>
        <tbody id="text-table-body"></tbody>
    </table>

    <script>
        pdfjsLib.GlobalWorkerOptions.workerSrc = './js/pdf.worker.min.js';

        const url = 'https://eis.vajira.ac.th:8443/supplies/upload/serve_pdf.php?pr=D%3A%2FDocuments%2F2025%2FPR25651100016&filename=PR25680600073.pdf';

        const canvas = document.getElementById('pdf-canvas');
        const ctx = canvas.getContext('2d');
        const textInput = document.getElementById('text-input');
        const textModeSub = document.getElementById('text-mode-sub');
        const fontSizeInput = document.getElementById('font-size');
        const strokeWidthInput = document.getElementById('stroke-width');
        const pageNumInput = document.getElementById('page-num');
        const modeSelect = document.getElementById('mode-select');
        const tableBody = document.getElementById('text-table-body');
        const positionDiv = document.getElementById('position');
        const pageInfoSpan = document.getElementById('page-info');

        let pdf = null;
        let scale = 1.5;
        let viewport = null;
        let totalPages = 1;
        let textsArray = [];
        let pendingLines = [];
        let isDrawing = false;
        let drawLines = [];
        let currentDrawingLine = null;
        let backgroundImageData = null;

        pdfjsLib.getDocument(url).promise.then(pdfDoc => {
            pdf = pdfDoc;
            totalPages = pdf.numPages;
            pageNumInput.max = totalPages;
            renderPage(parseInt(pageNumInput.value));
        });

        function renderPage(pageNumber) {
            if (pageNumber < 1 || pageNumber > totalPages) return;
            pageInfoSpan.innerText = `หน้า ${pageNumber}/${totalPages}`;
            pageNumInput.value = pageNumber;

            pdf.getPage(pageNumber).then(page => {
                viewport = page.getViewport({scale});
                canvas.width = viewport.width;
                canvas.height = viewport.height;
                return page.render({canvasContext: ctx, viewport}).promise.then(() => {
                    backgroundImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                });
            }).then(() => {
                drawContent(pageNumber);
            });
        }

        function drawContent(pageNumber) {
            if (backgroundImageData)
                ctx.putImageData(backgroundImageData, 0, 0);

            textsArray.forEach(item => {
                if (item.pages.includes(pageNumber)) {
                    const drawX = item.x * scale;
                    const drawY = canvas.height - item.y * scale;
                    if (item.isBox) {
                        ctx.strokeStyle = 'red';
                        ctx.lineWidth = item.strokeWidth || 1.5;
                        ctx.strokeRect(drawX, drawY - 30, 160, 30);
                        ctx.font = `${item.fontSize || 16}px sans-serif`;
                        ctx.fillStyle = 'black';
                        ctx.fillText(item.text, drawX + 5, drawY - 10);
                    } else {
                        ctx.beginPath();
                        ctx.moveTo(drawX, drawY);
                        ctx.lineTo(drawX + 80, drawY);
                        ctx.lineWidth = item.strokeWidth || 1.5;
                        ctx.strokeStyle = 'red';
                        ctx.stroke();
                        ctx.font = `${item.fontSize || 16}px sans-serif`;
                        ctx.fillStyle = 'black';
                        ctx.fillText(item.text, drawX, drawY - 5);
                    }
                }
            });

            drawLines.forEach(line => {
                if (line.page === pageNumber) {
                    ctx.beginPath();
                    ctx.moveTo(line.x1, line.y1);
                    ctx.lineTo(line.x2, line.y2);
                    ctx.strokeStyle = line.color || 'blue';
                    ctx.lineWidth = 2;
                    ctx.stroke();
                }
            });

            pendingLines.forEach(line => {
                if (line.page === pageNumber) {
                    if (line.isBox) {
                        ctx.strokeStyle = 'gray';
                        ctx.lineWidth = line.strokeWidth || 1.5;
                        ctx.strokeRect(line.x, line.y - 30, 160, 30);
                        ctx.font = `${line.fontSize || 16}px sans-serif`;
                        ctx.fillStyle = 'gray';
                        ctx.fillText(line.text, line.x + 5, line.y - 10);
                    } else {
                        ctx.beginPath();
                        ctx.moveTo(line.x, line.y);
                        ctx.lineTo(line.x + 80, line.y);
                        ctx.strokeStyle = 'gray';
                        ctx.lineWidth = line.strokeWidth || 1.5;
                        ctx.stroke();
                        ctx.font = `${line.fontSize || 14}px sans-serif`;
                        ctx.fillStyle = 'gray';
                        ctx.fillText(line.text, line.x, line.y - 5);
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

        canvas.addEventListener('mousedown', e => {
            if (modeSelect.value === 'draw') {
                isDrawing = true;
                const rect = canvas.getBoundingClientRect();
                currentDrawingLine = {
                    x1: e.clientX - rect.left,
                    y1: e.clientY - rect.top,
                    x2: e.clientX - rect.left,
                    y2: e.clientY - rect.top,
                    page: parseInt(pageNumInput.value),
                    color: 'blue'
                };
            }
        });

        canvas.addEventListener('mousemove', e => {
            if (isDrawing && currentDrawingLine) {
                const rect = canvas.getBoundingClientRect();
                currentDrawingLine.x2 = e.clientX - rect.left;
                currentDrawingLine.y2 = e.clientY - rect.top;
                if (backgroundImageData) {
                    ctx.putImageData(backgroundImageData, 0, 0);
                    drawContent(parseInt(pageNumInput.value));
                    ctx.beginPath();
                    ctx.moveTo(currentDrawingLine.x1, currentDrawingLine.y1);
                    ctx.lineTo(currentDrawingLine.x2, currentDrawingLine.y2);
                    ctx.strokeStyle = 'gray';
                    ctx.lineWidth = 1.5;
                    ctx.stroke();
                }
            }
        });

        canvas.addEventListener('mouseup', () => {
            if (isDrawing && currentDrawingLine) {
                drawLines.push({...currentDrawingLine});
                currentDrawingLine = null;
                renderPage(parseInt(pageNumInput.value));
            }
            isDrawing = false;
        });

        canvas.addEventListener('click', e => {
            if (modeSelect.value !== 'text') return;
            const subMode = textModeSub.value;
            const rect = canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const page = parseInt(pageNumInput.value);
            const pdfX = parseFloat((x / scale).toFixed(2));
            const pdfY = parseFloat(((canvas.height - y) / scale).toFixed(2));
            positionDiv.innerText = `ตำแหน่ง PDF: X=${pdfX}, Y=${pdfY}`;

            pendingLines.push({
                x, y, page,
                text: textInput.value.trim(),
                fontSize: parseInt(fontSizeInput.value),
                strokeWidth: parseFloat(strokeWidthInput.value),
                isBox: subMode === 'box'
            });
            drawContent(page);
        });

        document.getElementById("add-button").addEventListener("click", () => {
            const text = textInput.value.trim();
            const page = parseInt(pageNumInput.value);
            if (!text || pendingLines.length === 0) {
                alert("กรุณาคลิกที่ PDF ก่อนเพิ่มข้อความ");
                return;
            }

            const lastLine = pendingLines[pendingLines.length - 1];
            const pdfX = parseFloat((lastLine.x / scale).toFixed(2));
            const pdfY = parseFloat(((canvas.height - lastLine.y) / scale).toFixed(2));

            const item = {
                text,
                x: pdfX,
                y: pdfY,
                pages: [page],
                fontSize: parseInt(fontSizeInput.value),
                strokeWidth: parseFloat(strokeWidthInput.value),
                isBox: textModeSub.value === 'box'
            };

            textsArray.push(item);
            pendingLines = [];

            const tr = document.createElement("tr");
            tr.innerHTML = `<td>${item.text}</td><td>${page}</td><td>${item.x}</td><td>${item.y}</td><td><button class="delete-row">ลบ</button></td>`;
            tr.querySelector(".delete-row").addEventListener("click", () => {
                tr.remove();
                textsArray = textsArray.filter(t => !(t.text === item.text && t.x === item.x && t.y === item.y && t.pages[0] === page));
                renderPage(page);
            });
            tableBody.appendChild(tr);
            renderPage(page);
        });

        document.getElementById("undo-button").addEventListener("click", () => {
            const page = parseInt(pageNumInput.value);
            if (drawLines.length > 0) {
                drawLines.pop();
            } else if (pendingLines.length > 0) {
                pendingLines.pop();
            } else if (textsArray.length > 0) {
                textsArray.pop();
                tableBody.removeChild(tableBody.lastChild);
            } else {
                alert("ไม่มีรายการให้ Undo");
                return;
            }
            renderPage(page);
        });

        document.getElementById("submitArrayID").addEventListener("click", () => {
            const jsonData = {pdfUrl: url, texts: textsArray, lines: drawLines};
            fetch("/supplies/pdfAddMulti", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify(jsonData)
            })
                .then(res => res.json())
                .then(data => alert(data.message || "✅ ส่งข้อมูลสำเร็จ"))
                .catch(err => alert("❌ ส่งข้อมูลผิดพลาด"));
        });

        document.getElementById("save-image-button").addEventListener("click", () => {
            const image = canvas.toDataURL("image/png");
            const link = document.createElement('a');
            link.download = `page_${pageNumInput.value}.png`;
            link.href = image;
            link.click();
        });

        document.getElementById("save-server-button").addEventListener("click", () => {
            const page = pageNumInput.value;
            const imageData = canvas.toDataURL("image/png");
            fetch("./save_canvas_image.php", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({filename: `page_${page}.png`, image: imageData})
            })
                .then(res => res.json())
                .then(data => alert(data.message || "✅ บันทึกสำเร็จ"))
                .catch(err => alert("❌ เกิดข้อผิดพลาดในการส่งภาพ"));
        });
    </script>
</body>
</html>
