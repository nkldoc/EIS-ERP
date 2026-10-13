<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Nutrient.io Style Editor</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    * {
      box-sizing: border-box;
    }

    body {
      margin: 0;
      font-family: 'Segoe UI', sans-serif;
      background-color: #f9fafb;
      height: 100vh;
      display: flex;
      flex-direction: column;
    }

    header {
      background: white;
      padding: 10px 20px;
      border-bottom: 1px solid #ddd;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    header h2 {
      margin: 0;
      font-size: 1.2rem;
    }

    .container {
      display: flex;
      flex: 1;
      overflow: hidden;
    }

    .sidebar {
      width: 250px;
      background: white;
      border-right: 1px solid #ddd;
      padding: 15px;
      overflow-y: auto;
    }

    .editor-area {
      flex: 1;
      padding: 20px;
      background: #f1f5f9;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
    }

    .toolbar {
      margin-bottom: 10px;
    }

    .toolbar button {
      margin-right: 8px;
      padding: 6px 10px;
      border: 1px solid #ccc;
      background: white;
      cursor: pointer;
      border-radius: 4px;
    }

    .toolbar button:hover {
      background: #e2e8f0;
    }

    #editor {
      background: white;
      border: 1px solid #ccc;
      border-radius: 6px;
      padding: 20px;
      min-height: 500px;
      flex: 1;
    }

    .sidebar h3 {
      font-size: 1rem;
      margin-bottom: 10px;
    }

    .sidebar button {
      display: block;
      width: 100%;
      margin-bottom: 10px;
      padding: 10px;
      background: #fff;
      border: 1px solid #ccc;
      cursor: pointer;
      text-align: left;
      border-radius: 4px;
    }

    .sidebar button:hover {
      background-color: #f0f0f0;
    }
  </style>
</head>
<body>
  <header>
    <h2>My Document Editor</h2>
    <button onclick="exportHTML()">Export HTML</button>
  </header>

  <div class="container">
    <div class="sidebar">
      <h3>Insert</h3>
      <button onclick="insertElement('heading')">+ Heading</button>
      <button onclick="insertElement('paragraph')">+ Paragraph</button>
      <button onclick="insertElement('image')">+ Image</button>
    </div>

    <div class="editor-area">
      <div class="toolbar">
        <button onclick="document.execCommand('bold')"><b>Bold</b></button>
        <button onclick="document.execCommand('italic')"><i>Italic</i></button>
        <button onclick="document.execCommand('underline')"><u>Underline</u></button>
      </div>
      <div id="editor" contenteditable="true">
        <p>Start writing your document...</p>
      </div>
    </div>
  </div>

  <script>
    function insertElement(type) {
      const editor = document.getElementById('editor');
      let html = '';
      switch (type) {
        case 'heading':
          html = '<h2 contenteditable="true">New Heading</h2>';
          break;
        case 'paragraph':
          html = '<p contenteditable="true">New paragraph text...</p>';
          break;
        case 'image':
          html = '<img src="https://via.placeholder.com/400x200" alt="image" style="max-width:100%;margin:10px 0;">';
          break;
      }
      editor.innerHTML += html;
      editor.focus();
    }

    function exportHTML() {
      const html = document.getElementById("editor").innerHTML;
      const newWin = window.open("", "", "width=800,height=600");
      newWin.document.write("<pre>" + html.replace(/</g, "&lt;").replace(/>/g, "&gt;") + "</pre>");
    }
  </script>
</body>
</html>
