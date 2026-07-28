<!DOCTYPE html>
<html lang="th">
<head>
  <meta charset="UTF-8" />
  <title>Text Editor to PDF พร้อมแก้ไขโค้ด HTML</title>
  <link href="https://cdn.quilljs.com/1.3.6/quill.snow.css" rel="stylesheet" />
  <style>
    body {
      font-family: 'Sarabun', sans-serif;
      padding: 20px;
      background: #f5f5f5;
    }
    .toolbar, .config {
      margin-bottom: 10px;
    }
    .config input, .config select {
      margin-right: 10px;
    }
    #editor-container {
      height: 400px;
      background: white;
    }
    #pdf-frame {
      margin-top: 20px;
      width: 100%;
      height: 500px;
      border: 1px solid #ccc;
      display: none;
    }
    #html-editor-container {
      margin-top: 10px;
      display: none;
    }
    #html-editor {
      width: 100%;
      height: 200px;
      font-family: monospace;
      font-size: 14px;
      background: #222;
      color: #0f0;
      padding: 10px;
      border-radius: 5px;
      resize: vertical;
      white-space: pre-wrap;
    }
    button {
      margin-right: 10px;
      padding: 8px 15px;
      font-size: 1rem;
      cursor: pointer;
    }
  </style>
</head>
<body>

<h2>📝 Text Editor to PDF (เพิ่มแก้ไขโค้ด HTML)</h2>

<div class="toolbar">
  <button class="ql-bold"></button>
  <button class="ql-italic"></button>
  <button class="ql-underline"></button>
  <button class="ql-image"></button>
</div>

<div class="config">
  <label>Font Size(px): <input id="fontSize" type="number" value="16" style="width:60px;" /></label>
  <label>Line Height: <input id="lineHeight" type="number" step="0.1" value="1.5" style="width:60px;" /></label>
  <label>Text Align:
    <select id="textAlign">
      <option value="left">ซ้าย</option>
      <option value="center" selected>กึ่งกลาง</option>
      <option value="right">ขวา</option>
    </select>
  </label>
  <br /><br />
  <label>Margin Top(mm): <input id="marginTop" type="number" value="30" style="width:60px;" /></label>
  <label>Margin Right(mm): <input id="marginRight" type="number" value="30" style="width:60px;" /></label>
  <label>Margin Bottom(mm): <input id="marginBottom" type="number" value="30" style="width:60px;" /></label>
  <label>Margin Left(mm): <input id="marginLeft" type="number" value="30" style="width:60px;" /></label>
</div>

<div id="editor-container"></div>

<br />
<button onclick="generatePDF()">📄 สร้าง PDF</button>
<button id="toggleHtmlEditorBtn" onclick="toggleHtmlEditor()">✏️ แก้ไขโค้ด HTML</button>

<div id="html-editor-container">
  <textarea id="html-editor" spellcheck="false"></textarea>
  <br />
  <button onclick="applyHtmlEdits()">บันทึกโค้ด HTML</button>
</div>

<iframe id="pdf-frame"></iframe>

<script src="https://cdn.quilljs.com/1.3.6/quill.js"></script>
<script>
  const quill = new Quill('#editor-container', {
    theme: 'snow',
    modules: { toolbar: '.toolbar' }
  });

  // ซิงค์การจัดตำแหน่งจาก dropdown ไป Quill
  document.getElementById('textAlign').addEventListener('change', function() {
    quill.format('align', this.value);
  });

  // สลับแสดง/ซ่อน textarea แก้ไขโค้ด HTML
  function toggleHtmlEditor() {
    const container = document.getElementById('html-editor-container');
    const btn = document.getElementById('toggleHtmlEditorBtn');
    if (container.style.display === 'block') {
      container.style.display = 'none';
      btn.textContent = '✏️ แก้ไขโค้ด HTML';
    } else {
      container.style.display = 'block';
      btn.textContent = '❌ ปิดแก้ไขโค้ด HTML';
      // ใส่โค้ด HTML ปัจจุบันลง textarea
      document.getElementById('html-editor').value = quill.root.innerHTML;
    }
  }

  // กดบันทึกโค้ด HTML ใน textarea กลับลง Quill
  function applyHtmlEdits() {
    const editedHtml = document.getElementById('html-editor').value;
    quill.root.innerHTML = editedHtml;
    // ปิด editor โค้ดหลังบันทึก
    toggleHtmlEditor();
  }

  // ส่งข้อมูลสร้าง PDF
  function generatePDF() {
    // ถ้า textarea แสดงอยู่ ให้ส่งโค้ดจาก textarea แทน quill editor
    const html = (document.getElementById('html-editor-container').style.display === 'block')
      ? document.getElementById('html-editor').value
      : quill.root.innerHTML;

    const fontSize = document.getElementById('fontSize').value;
    const lineHeight = document.getElementById('lineHeight').value;
    const textAlign = document.getElementById('textAlign').value;
    const marginTop = document.getElementById('marginTop').value;
    const marginRight = document.getElementById('marginRight').value;
    const marginBottom = document.getElementById('marginBottom').value;
    const marginLeft = document.getElementById('marginLeft').value;

    const params = new URLSearchParams();
    params.append('html', html);
    params.append('fontSize', fontSize);
    params.append('lineHeight', lineHeight);
    params.append('textAlign', textAlign);
    params.append('marginTop', marginTop);
    params.append('marginRight', marginRight);
    params.append('marginBottom', marginBottom);
    params.append('marginLeft', marginLeft);

    fetch('/supplies/wkhtmltopdf', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString()
    })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        const frame = document.getElementById('pdf-frame');
        frame.src = data.url;
        frame.style.display = 'block';
      } else {
        alert('❌ เกิดข้อผิดพลาด: ' + data.error);
      }
    })
    .catch(err => alert('❌ Error: ' + err));
  }
</script>

</body>
</html>
