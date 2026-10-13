<!DOCTYPE html>
<html lang="th">
<head>
  <meta charset="UTF-8">
  <title>อัปเดต PDF และ Bookmark</title>
  <style>
    body { font-family: sans-serif; padding: 20px; }
    input, button, textarea { display: block; margin: 10px 0; width: 100%; }
    textarea { height: 120px; }
  </style>
</head>
<body>

  <h2>เพิ่ม Bookmark และแทรกหน้าว่างใน PDF</h2>

  <label>ที่อยู่ไฟล์ PDF (server path):</label>
  <input type="text" id="pdfPath" value="D:/Documents/2025/PROCUREVJR/PR0000TEST/book1_PROCUREVJR.pdf" />

  <label>รายการหน้าและ Bookmark (JSON):</label>
  <textarea id="pagesInput">[
  { "pageNumber": 1, "bookmark": "หน้าแรก" },
  { "pageNumber": 2, "bookmark": "บทสรุป" }
]</textarea>

  <label>ตำแหน่งหน้า (เลข) ที่ต้องการแทรกหน้าว่าง (JSON array):</label>
  <textarea id="insertBlankAt">[]</textarea>

  <button onclick="submitData()">ส่งข้อมูลไปยังเซิร์ฟเวอร์</button>

  <pre id="responseBox" style="margin-top:20px;color:green;"></pre>

  <script>
    function submitData() {
      const pdfPath = document.getElementById('pdfPath').value;
      const pages = JSON.parse(document.getElementById('pagesInput').value);
      const insertBlankAt = JSON.parse(document.getElementById('insertBlankAt').value);

      fetch('/supplies/pdfUpdate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pdfPath,
          pages,
          insertBlankAt
        })
      })
      .then(res => res.json())
      .then(data => {
        document.getElementById('responseBox').textContent =
          `✅ สถานะ: ${data.status}\nข้อความ: ${data.message}\nไฟล์: ${data.outputFile}`;
      })
      .catch(err => {
        document.getElementById('responseBox').textContent =
          `❌ เกิดข้อผิดพลาด: ${err.message}`;
      });
    }
  </script>

</body>
</html>
