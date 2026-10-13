<!DOCTYPE html>
<html lang="th">
<head>
  <meta charset="UTF-8">
  <title>WYSIWYG ToDo List</title>
  <style>
    body { font-family: sans-serif; padding: 20px; background: #f9f9f9; }
    .todo-item { border: 1px solid #ccc; margin-bottom: 10px; padding: 10px; background: white; }
    .toolbar button { margin-right: 5px; }
    .content[contenteditable] { border: 1px solid #ddd; padding: 10px; min-height: 100px; background: #fff; }
    .meta { font-size: 0.9em; color: #666; margin-top: 5px; }
    .todo-item img { max-width: 150px; height: auto; display: block; margin-top: 5px; }
    #detailModal {
      display: none;
      position: fixed; top: 0; left: 0;
      width: 100%; height: 100%;
      background: rgba(0,0,0,0.6);
      justify-content: center; align-items: center;
    }
    #detailContent {
      background: #fff; padding: 20px; max-width: 80%; max-height: 80%; overflow: auto;
    }
    #detailContent img { max-width: 100%; height: auto; }
    .pagination { margin-top: 15px; text-align: center; }
    .pagination button { margin: 0 3px; padding: 5px 10px; }
    .pagination button.active { background: #333; color: white; }
  </style>
</head>
<body>

<h2>📋 ToDo WYSIWYG (เก็บรูปได้)</h2>

<div>
  <input type="text" id="title" placeholder="หัวข้อ..." style="width: 100%; padding: 8px; margin-bottom: 10px;" />
  <div class="toolbar">
    <button onclick="document.execCommand('bold')">B</button>
    <button onclick="document.execCommand('italic')">I</button>
    <button onclick="document.execCommand('insertUnorderedList')">• List</button>
  </div>
  <div id="content" class="content" contenteditable="true" placeholder="รายละเอียด..."></div>
  <button onclick="addTodo()">➕ เพิ่ม</button>
</div>

<hr>

<h3>รายการที่บันทึก</h3>
<div style="margin-bottom: 10px;">
  🔍 <input type="text" id="searchTitle" placeholder="ค้นหาด้วยหัวข้อ..." 
    oninput="goToPage(1)" 
    style="padding:5px; width: 50%;">
</div>
<div id="todo-list"></div>
<div class="pagination" id="pagination"></div>

<!-- Modal detail -->
<div id="detailModal" onclick="closeDetail(event)">
  <div id="detailContent"></div>
</div>

<script>
  let todos = JSON.parse(localStorage.getItem('todos') || '[]');
  let currentPage = 1;
  const itemsPerPage = 5;

  function saveTodos() {
    localStorage.setItem('todos', JSON.stringify(todos));
    fetch('save.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(todos)
    });
  }

  function addTodo() {
    const title = document.getElementById('title').value.trim();
    const content = document.getElementById('content').innerHTML.trim();
    if (!title || !content) return alert("กรุณาใส่หัวข้อและรายละเอียด");

    const now = new Date().toLocaleString();
    todos.push({
      id: Date.now(),
      title: title,
      content: content,
      created_at: now,
      updated_at: now
    });

    document.getElementById('title').value = '';
    document.getElementById('content').innerHTML = '';
    saveTodos();
    goToPage(1);
  }

  function deleteTodo(id) {
    if (!confirm("ยืนยันการลบ?")) return;
    todos = todos.filter(todo => todo.id !== id);
    saveTodos();
    goToPage(currentPage);
  }

  function editTodo(id) {
    const todo = todos.find(t => t.id === id);
    if (!todo) return;
    document.getElementById('title').value = todo.title;
    document.getElementById('content').innerHTML = todo.content;
    deleteTodo(id);
  }

  function viewDetail(id) {
    const todo = todos.find(t => t.id === id);
    if (!todo) return;
    document.getElementById('detailContent').innerHTML = `
      <h2>${todo.title}</h2>
      <div>${todo.content}</div>
      <div class="meta">สร้างเมื่อ: ${todo.created_at} | แก้ไขล่าสุด: ${todo.updated_at}</div>
    `;
    document.getElementById('detailModal').style.display = 'flex';
  }

  function closeDetail(e) {
    if (e.target.id === 'detailModal') {
      document.getElementById('detailModal').style.display = 'none';
    }
  }

  function renderTodos() {
    const list = document.getElementById('todo-list');
    list.innerHTML = '';

    const searchValue = document.getElementById('searchTitle').value.toLowerCase();
    const sortedTodos = [...todos].sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));
    const filteredTodos = sortedTodos.filter(todo => todo.title.toLowerCase().includes(searchValue));

    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedTodos = filteredTodos.slice(startIndex, startIndex + itemsPerPage);

    paginatedTodos.forEach(todo => {
      let tempDiv = document.createElement('div');
      tempDiv.innerHTML = todo.content;
      let firstImg = tempDiv.querySelector('img');
      let imgHTML = firstImg ? `<img src="${firstImg.src}" alt="" />` : '';

      const div = document.createElement('div');
      div.className = 'todo-item';
      div.innerHTML = `
        <strong>${todo.title}</strong>
        ${imgHTML}
        <div class="meta">สร้างเมื่อ: ${todo.created_at}</div>
        <button onclick="viewDetail(${todo.id})">👁 ดูรายละเอียด</button>
        <button onclick="editTodo(${todo.id})">✏ แก้ไข</button>
        <button onclick="deleteTodo(${todo.id})">🗑 ลบ</button>
      `;
      list.appendChild(div);
    });

    if (filteredTodos.length === 0) {
      list.innerHTML = '<div style="color:#999;">ไม่มีรายการที่ตรงกับการค้นหา</div>';
    }

    renderPagination(filteredTodos.length);
  }

  function renderPagination(totalItems) {
    const pagination = document.getElementById('pagination');
    pagination.innerHTML = '';
    const totalPages = Math.ceil(totalItems / itemsPerPage);

    if (totalPages <= 1) return;

    for (let i = 1; i <= totalPages; i++) {
      const btn = document.createElement('button');
      btn.textContent = i;
      if (i === currentPage) btn.classList.add('active');
      btn.onclick = () => goToPage(i);
      pagination.appendChild(btn);
    }
  }

  function goToPage(page) {
    currentPage = page;
    renderTodos();
  }

  renderTodos();

  document.getElementById('content').addEventListener('paste', function (e) {
    const items = e.clipboardData.items;
    for (let item of items) {
      if (item.type.indexOf("image") !== -1) {
        const file = item.getAsFile();
        const reader = new FileReader();
        reader.onload = function (event) {
          const img = document.createElement("img");
          img.src = event.target.result;
          img.style.maxWidth = "100%";
          img.style.height = "auto";
          document.getElementById('content').appendChild(img);
        };
        reader.readAsDataURL(file);
      }
    }
  });
</script>

</body>
</html>
