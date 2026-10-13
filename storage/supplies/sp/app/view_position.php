<!DOCTYPE html>
<html>
<head>
  <title>PDF Viewer with Click Position</title>
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
  </style>
</head>
<body>
  <h2>คลิกบน PDF เพื่อดูพิกัด X Y</h2>

  <div id="controls">
    <label>เลือกหน้าที่จะแสดง: <input type="number" id="page-num" value="1" min="1" style="width: 60px;"></label>
    <span id="page-count"></span>
  </div>

  <canvas id="pdf-canvas"></canvas>
  <div id="position"></div>

  <script>
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.10.377/pdf.worker.min.js';

    const url = 'https://eis.vajira.ac.th:8443/supplies/upload/serve_pdf.php?pr=D%3A%2FDocuments%2F2025%2FPR25651100016&filename=PR25680600073.pdf';

    const canvas = document.getElementById('pdf-canvas');
    const ctx = canvas.getContext('2d');
    const pageNumInput = document.getElementById('page-num');
    const pageCountSpan = document.getElementById('page-count');
    const positionDiv = document.getElementById('position');

    let pdf = null;
    let scale = 1.5;
    let viewport = null;

    // โหลด PDF
    pdfjsLib.getDocument(url).promise.then(pdfDoc => {
      pdf = pdfDoc;
      pageCountSpan.textContent = `/ ${pdf.numPages} หน้า`;
      renderPage(parseInt(pageNumInput.value));
    }).catch(err => {
      positionDiv.textContent = 'เกิดข้อผิดพลาดในการโหลด PDF';
      console.error(err);
    });

    // ฟังก์ชันเรนเดอร์หน้า
    function renderPage(pageNumber) {
      if (!pdf || pageNumber < 1 || pageNumber > pdf.numPages) return;

      pdf.getPage(pageNumber).then(page => {
        viewport = page.getViewport({ scale: scale });
        canvas.width = viewport.width;
        canvas.height = viewport.height;

        const renderContext = {
          canvasContext: ctx,
          viewport: viewport
        };
        return page.render(renderContext).promise;
      });
    }

    // เมื่อเปลี่ยนเลขหน้า
    pageNumInput.addEventListener('change', () => {
      const page = parseInt(pageNumInput.value);
      if (!isNaN(page)) {
        renderPage(page);
      }
    });

    // แสดงตำแหน่งเมื่อคลิก
    canvas.addEventListener('click', function(event) {
      const rect = canvas.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;

      const pdfX = (x / scale).toFixed(2);
      const pdfY = ((canvas.height - y) / scale).toFixed(2);

      positionDiv.innerText =
        `ตำแหน่ง Canvas: X = ${x.toFixed(2)}, Y = ${y.toFixed(2)} | พิกัด PDF: X = ${pdfX}, Y = ${pdfY}`;
    });
  </script>
</body>
</html>
