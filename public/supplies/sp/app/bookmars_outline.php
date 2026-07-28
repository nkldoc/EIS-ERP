<!DOCTYPE html>
<html lang="th">
<head>
  <meta charset="UTF-8">
  <title>แทรกหน้า PDF พร้อม Bookmark</title>
  <style>
    body { font-family: sans-serif; padding: 20px; }
    input, textarea, button { margin-top: 10px; display: block; width: 100%; max-width: 600px; }
    label { margin-top: 20px; font-weight: bold; }
    pre { background: #f0f0f0; padding: 10px; }
  </style>
</head>
<body>

  <h2>📄 แทรกหน้า PDF พร้อม Bookmark</h2>

  <form id="pdfForm">
    <label for="pdf1">📎 PDF ต้นทาง (หน้าที่จะใช้แทรก):</label>
    <input type="file" id="pdf1" name="pdf1" accept="application/pdf" required>

    <label for="pdf2">📎 PDF หลัก (ไฟล์หลักที่จะถูกแทรกหน้าเข้าไป):</label>
    <input type="file" id="pdf2" name="pdf2" accept="application/pdf" required>

    <label for="insertMap">📝 Insert Map (JSON):</label>
    <textarea id="insertMap" name="insertMap" rows="8" required>[
  {
    "fromPage": 1,
    "toPage": 2,
    "bookmark": "หน้าแทรกใหม่"
  },
  {
    "fromPage": 2,
    "toPage": 4,
    "bookmark": "อีกหน้าหนึ่ง"
  }
]</textarea>

    <button type="submit">🚀 ส่งข้อมูล</button>
  </form>

  <h3>ผลลัพธ์:</h3>
  <pre id="result">ยังไม่มีผลลัพธ์</pre>

  <script>
    document.getElementById("pdfForm").addEventListener("submit", async function (e) {
      e.preventDefault();
      const form = e.target;
      const formData = new FormData();

      formData.append("pdf1", form.pdf1.files[0]);
      formData.append("pdf2", form.pdf2.files[0]);
      formData.append("insertMap", form.insertMap.value);

      const resultBox = document.getElementById("result");
      resultBox.textContent = "⏳ กำลังส่งข้อมูล...";

      try {
        const response = await fetch("/supplies/pdfInsertbookmark", {
          method: "POST",
          body: formData
        });

        const data = await response.json();
        if (data.status === "success") {
          resultBox.textContent = `✅ สำเร็จ: ${data.message}\nไฟล์ที่ได้: ${data.outputFile}`;
        } else {
          resultBox.textContent = `❌ ผิดพลาด: ${data.message}`;
        }
      } catch (error) {
        resultBox.textContent = `⚠️ เกิดข้อผิดพลาด: ${error}`;
      }
    });
  </script>
</body>
</html>
