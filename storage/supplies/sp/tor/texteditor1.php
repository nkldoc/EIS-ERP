<!DOCTYPE html>
<html lang="th">
<head>
  <meta charset="UTF-8">
  <title>Text Editor to PDF</title>
  <link href="https://cdn.quilljs.com/1.3.6/quill.snow.css" rel="stylesheet">
  <style>
    body {
      font-family: sans-serif;
      margin: 20px;
    }
    #toolbar-container {
      margin-bottom: 10px;
    }
    #editor-container {
      height: 400px;
      background: #fff;
    }
    #pdf-frame {
      width: 100%;
      height: 800px;
      margin-top: 20px;
      border: 1px solid #ccc;
      display: none;
    }
    label {
      font-weight: bold;
    }
  </style>
</head>
<body>
  <h2>Text Editor (A4 PDF Generator)</h2>

  <div>
    <label>ขนาดฟอนต์ (px):</label>
    <input type="number" id="fontSize" value="16">
    
    <label>ระยะบรรทัด (line-height):</label>
    <input type="number" step="0.1" id="lineHeight" value="1.5">

    <label>จัดตำแหน่งข้อความ:</label>
    <select id="textAlign">
      <option value="left">ชิดซ้าย</option>
      <option value="center">กึ่งกลาง</option>
      <option value="right">ชิดขวา</option>
    </select>

    <label>ระยะขอบ A4 (mm):</label>
    <div>
      บน <input type="number" id="marginTop" value="30" style="width: 60px;">
      ขวา <input type="number" id="marginRight" value="30" style="width: 60px;">
      ล่าง <input type="number" id="marginBottom" value="30" style="width: 60px;">
      ซ้าย <input type="number" id="marginLeft" value="30" style="width: 60px;">
    </div>
  </div>

  <div id="toolbar-container">
    <button class="ql-bold"></button>
    <button class="ql-italic"></button>
    <button class="ql-underline"></button>
    <button class="ql-image"></button>
  </div>

  <div id="editor-container"></div>

  <button onclick="generatePDF()">📄 สร้าง PDF</button>
  <p id="result"></p>
  <iframe id="pdf-frame"></iframe>

  <script src="https://cdn.quilljs.com/1.3.6/quill.js"></script>
  <script>
    const quill = new Quill('#editor-container', {
      theme: 'snow',
      modules: {
        toolbar: {
          container: '#toolbar-container',
          handlers: {
            'image': function () {
              const input = document.createElement('input');
              input.setAttribute('type', 'file');
              input.setAttribute('accept', 'image/*');
              input.click();

              input.onchange = () => {
                const file = input.files[0];
                if (/^image\//.test(file.type)) {
                  const reader = new FileReader();
                  reader.onload = () => {
                    const range = quill.getSelection(true);
                    quill.insertEmbed(range.index, 'image', reader.result);
                    quill.setSelection(range.index + 1);
                  };
                  reader.readAsDataURL(file);
                } else {
                  alert('รองรับเฉพาะไฟล์ภาพเท่านั้น');
                }
              };
            }
          }
        }
      }
    });

    // แสดงผลการจัดตำแหน่งทันที
    document.getElementById('textAlign').addEventListener('change', function () {
      const alignment = this.value;
      const editor = document.querySelector('.ql-editor');
      editor.style.textAlign = alignment;
    });

    function generatePDF() {
      const html = quill.root.innerHTML;
      const fontSize = document.getElementById('fontSize').value.trim();
      const lineHeight = document.getElementById('lineHeight').value.trim();
      const textAlign = document.getElementById('textAlign').value;
      const marginTop = document.getElementById('marginTop').value.trim() || "30";
      const marginRight = document.getElementById('marginRight').value.trim() || "30";
      const marginBottom = document.getElementById('marginBottom').value.trim() || "30";
      const marginLeft = document.getElementById('marginLeft').value.trim() || "30";

      const params = new URLSearchParams();
      params.append('html', html);
      params.append('fontSize', fontSize);
      params.append('lineHeight', lineHeight);
      params.append('textAlign', textAlign);
      params.append('marginTop', marginTop);
      params.append('marginRight', marginRight);
      params.append('marginBottom', marginBottom);
      params.append('marginLeft', marginLeft);

      fetch("/supplies/wkhtmltopdf", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: params.toString()
      })
      .then(res => res.json())
      .then(data => {
        const result = document.getElementById("result");
        const frame = document.getElementById("pdf-frame");

        if (data.success) {
          result.innerHTML = "✅ <a href='" + data.url + "' target='_blank'>เปิด PDF</a>";
          frame.src = data.url;
          frame.style.display = "block";
        } else {
          result.innerHTML = "❌ เกิดข้อผิดพลาด: " + data.error;
          frame.style.display = "none";
        }
      })
      .catch(err => {
        document.getElementById("result").innerText = "❌ Error: " + err;
      });
    }
  </script>
</body>
</html>
