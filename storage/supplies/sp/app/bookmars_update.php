<!DOCTYPE html>
<html lang="th">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>แทรกหน้า PDF ตรง Bookmark พร้อมลบหน้า</title>
  <style>
    body {
      font-family: sans-serif;
      padding: 20px;
    }
    label, select, input, button {
      display: block;
      margin-top: 15px;
      width: 100%;
      max-width: 600px;
    }
    pre {
      background: #f0f0f0;
      padding: 10px;
      white-space: pre-wrap;
    }
    .container {
      display: flex;
      width: 100%;
      border: 1px solid #ccc;
      box-sizing: border-box;
    }
    .column {
      flex: 1;
      padding: 15px;
      border-right: 1px solid #ccc;
    }
    .column:last-child {
      border-right: none;
    }
    iframe {
      width: 100%;
      height: 500px;
      border: none;
      margin-top: 10px;
    }
  </style>
</head>
<body>

<h2>📄 แทรกหน้า PDF ที่ Bookmark พร้อมลบหน้า</h2>

<form id="pdfForm">
  <div class="container">
    <!-- คอลัมน์ที่ 1 -->
    <div class="column">
      <label>📎 PDF ต้นทาง (PDF1):</label>
      <input type="file" id="pdf1" name="pdf1" accept="application/pdf" required>

      <label>📎 PDF หลัก (PDF2 - มี Bookmark):</label>
      <input type="file" id="pdf2" name="pdf2" accept="application/pdf" required onchange="previewPDF(this)">

      <button type="button" onclick="loadBookmarks()">🔍 โหลด Bookmark จาก PDF2</button>

      <label for="bookmarkSelect">🔖 เลือก Bookmark:</label>
      <select id="bookmarkSelect" name="bookmark" required disabled>
        <option value="">-- โปรดเลือก --</option>
      </select>

      <label for="insertMode">📌 แทรก:</label>
      <select id="insertMode" name="insertMode" required>
        <option value="before">ก่อนหน้า Bookmark</option>
        <option value="after">หลัง Bookmark</option>
      </select>

      <label for="fromPage">📄 หน้าใน PDF1 ที่จะแทรก (เริ่มที่ 1):</label>
      <input type="number" id="fromPage" name="fromPage" value="1" min="1" required>

      <label for="pagesToRemove">🗑️ ลบหน้าใน Output PDF (เช่น 1,2,5):</label>
      <input type="text" id="pagesToRemove" name="pagesToRemove" placeholder="ระบุเลขหน้าเช่น 1,2,3">

      <button type="submit">🚀 แทรก PDF</button>
    </div>

    <!-- คอลัมน์ที่ 2 -->
    <div class="column">
      <label for="docType">📄 ชื่อเอกสารอ้าง (เช่น PR25651100016):</label>
      <input type="text" id="docType" name="docType" value="PR25651100016" required>

      <label for="pdfBook">📘 ชื่อเล่ม (เช่น book1):</label>
      <input type="text" id="pdfBook" name="pdfBook" value="book1" required>

      <h3>📋 ผลลัพธ์:</h3>
      <pre id="result">ยังไม่มีผลลัพธ์</pre>

      <iframe id="previewFrame" src="./view_pdf.php"></iframe>
    </div>
  </div>
</form>

<script>
  async function loadBookmarks() {
    const pdf2File = document.getElementById("pdf2").files[0];
    const resultBox = document.getElementById("result");
    const bookmarkSelect = document.getElementById("bookmarkSelect");

    if (!pdf2File) {
      alert("กรุณาเลือก PDF2 ก่อน");
      return;
    }

    const formData = new FormData();
    formData.append("pdf2", pdf2File);

    resultBox.textContent = "⏳ กำลังโหลด Bookmark...";

    try {
      const res = await fetch("/supplies/loadBookmarks", { method: "POST", body: formData });
      const bookmarks = await res.json();

      bookmarkSelect.innerHTML = '<option value="">-- โปรดเลือก --</option>';
      bookmarks.forEach(b => {
        const option = document.createElement("option");
        option.value = b.title;
        option.textContent = `${b.title} (หน้า ${b.page})`;
        bookmarkSelect.appendChild(option);
      });

      bookmarkSelect.disabled = false;
      resultBox.textContent = "✅ โหลด Bookmark สำเร็จ";
    } catch (err) {
      resultBox.textContent = "❌ ไม่สามารถโหลด Bookmark ได้: " + err;
    }
  }

  function previewPDF(input) {
    const file = input.files[0];
    if (file && file.type === "application/pdf") {
      const blobURL = URL.createObjectURL(file);
      document.getElementById("previewFrame").src = blobURL;
    }
  }

  document.getElementById("pdfForm").addEventListener("submit", async function (e) {
    e.preventDefault();
    const resultBox = document.getElementById("result");
    resultBox.textContent = "⏳ กำลังประมวลผล...";

    const formData = new FormData();
    formData.append("pdf1", document.getElementById("pdf1").files[0]);
    formData.append("pdf2", document.getElementById("pdf2").files[0]);
    formData.append("bookmark", document.getElementById("bookmarkSelect").value);
    formData.append("insertMode", document.getElementById("insertMode").value);
    formData.append("fromPage", document.getElementById("fromPage").value);
    formData.append("pagesToRemove", document.getElementById("pagesToRemove").value.trim());
    formData.append("docType", document.getElementById("docType").value);
    formData.append("pdfBook", document.getElementById("pdfBook").value);

    try {
      const res = await fetch("/supplies/insertPageAfterUpdateBookmark", {
        method: "POST",
        body: formData
      });

      const result = await res.json();
      if (result.status === "success") {
        resultBox.textContent = `✅ สำเร็จ: ${result.message}\n📁 ${result.outputFile}`;

        // โหลด PDF ผลลัพธ์ใน iframe
        document.getElementById("previewFrame").src = result.outputFile;
      } else {
        resultBox.textContent = `❌ ผิดพลาด: ${result.message}`;
      }
    } catch (err) {
      resultBox.textContent = "⚠️ เกิดข้อผิดพลาด: " + err;
    }
  });
</script>

</body>
</html>
