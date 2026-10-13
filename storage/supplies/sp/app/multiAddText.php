<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>PDF Viewer with Addable Text</title>
  <script src="./js/pdf.min.js"></script>
  <style>
    #pdf-canvas {
      border: 1px solid black;
      cursor: crosshair;
      margin-top: 10px;
    }
    #controls {
      margin-bottom: 10px;
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
  <h2>📌 คลิกบน PDF เพื่อเลือกตำแหน่ง ➕ เพิ่มข้อความ ➡ ส่งข้อมูล</h2>

  <div id="controls">
    <label>ข้อความ: <input type="text" id="text-input" value="ทดสอบข้อความ" /></label>
    <label>หน้า: <input type="number" id="page-num" value="1" min="1" style="width: 60px;"></label>
    <span id="page-count"></span>
    <button id="add-button">➕ เพิ่มข้อความ</button>
  </div>
<div id="position"></div>
<div><button id="submitArrayID">📤 ส่ง Multi Array Json</button><div>

  <canvas id="pdf-canvas"></canvas>
  

  <h3>📋 รายการข้อความที่บันทึก:</h3>
  <table>
    <thead>
      <tr>
        <th>ข้อความ</th>
        <th>หน้า</th>
        <th>X</th>
        <th>Y</th>
        <th>ลบ</th>
      </tr>
    </thead>
    <tbody id="text-table-body"></tbody>
  </table>

  <script>
    pdfjsLib.GlobalWorkerOptions.workerSrc = './js/pdf.worker.min.js';

    const url = 'https://eis.vajira.ac.th:8443/supplies/upload/serve_pdf.php?pr=D%3A%2FDocuments%2F2025%2FPR25651100016&filename=PR25680600073.pdf';

    const canvas = document.getElementById('pdf-canvas');
    const ctx = canvas.getContext('2d');
    const textInput = document.getElementById('text-input');
    const pageNumInput = document.getElementById('page-num');
    const pageCountSpan = document.getElementById('page-count');
    const positionDiv = document.getElementById('position');
    const tableBody = document.getElementById('text-table-body');

    let pdf = null;
    let scale = 1.5;
    let viewport = null;
    let lastPdfX = null;
    let lastPdfY = null;
    let textsArray = [];

    // โหลด PDF
    pdfjsLib.getDocument(url).promise.then(pdfDoc => {
      pdf = pdfDoc;
      pageCountSpan.textContent = `/ ${pdf.numPages} หน้า`;
      renderPage(parseInt(pageNumInput.value));
    }).catch(err => {
      positionDiv.textContent = 'เกิดข้อผิดพลาดในการโหลด PDF';
      console.error(err);
    });

    function renderPage(pageNumber) {
      if (!pdf || pageNumber < 1 || pageNumber > pdf.numPages) return;
      pdf.getPage(pageNumber).then(page => {
        viewport = page.getViewport({scale: scale});
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const renderContext = {
          canvasContext: ctx,
          viewport: viewport
        };
        return page.render(renderContext).promise;
      });
    }

    pageNumInput.addEventListener('change', () => {
      const page = parseInt(pageNumInput.value);
      if (!isNaN(page)) renderPage(page);
    });

    // คลิก PDF → เก็บตำแหน่งล่าสุด
    canvas.addEventListener('click', function (event) {
      const rect = canvas.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      lastPdfX = parseFloat((x / scale).toFixed(2));
      lastPdfY = parseFloat(((canvas.height - y) / scale).toFixed(2));

      positionDiv.innerText = `ตำแหน่ง PDF: X = ${lastPdfX}, Y = ${lastPdfY}`;
    });

    // ➕ เพิ่มข้อความลง array + ตาราง
    document.getElementById("add-button").addEventListener("click", function () {
      const text = textInput.value.trim();
      const page = parseInt(pageNumInput.value);
      if (!text || isNaN(page) || lastPdfX === null || lastPdfY === null) {
        alert("กรุณาคลิก PDF และกรอกข้อความก่อน");
        return;
      }

      const item = { text, x: lastPdfX, y: lastPdfY, pages: [page] };
      textsArray.push(item);

      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${item.text}</td>
        <td>${page}</td>
        <td>${item.x}</td>
        <td>${item.y}</td>
        <td><button class="delete-row">ลบ</button></td>
      `;
      tr.querySelector(".delete-row").addEventListener("click", () => {
        tr.remove();
        textsArray = textsArray.filter(t =>
          !(t.text === item.text && t.x === item.x && t.y === item.y && t.pages[0] === page)
        );
      });
      tableBody.appendChild(tr);

      // reset input
      // textInput.value = '';
      positionDiv.innerText = '';
      
    });

    // 📤 ส่ง textsArray ไปยังเซิร์ฟเวอร์
    document.getElementById("submitArrayID").addEventListener("click", function () {
      if (textsArray.length === 0) {
        alert("ยังไม่มีข้อมูลในรายการ");
        return;
      }

      const jsonData = {
        pdfUrl: url,
        texts: textsArray
      };

      fetch("/supplies/pdfAddMulti", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(jsonData)
      })
      .then(response => response.json())
      .then(data => {
        console.log("✅ ส่งสำเร็จ:", data);
        alert(data.message || "ส่งข้อมูลสำเร็จ");
      })
      .catch(error => {
        console.error("❌ Error:", error);
        alert("เกิดข้อผิดพลาดในการส่งข้อมูล");
      });
    });
  </script>
</body>
</html>
