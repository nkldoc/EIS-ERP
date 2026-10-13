<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Bookmark Manager</title>
</head>
<body>
  <h2>Bookmark Manager</h2>

  <input id="title" placeholder="ชื่อ Bookmark">
  <input id="page" type="number" placeholder="หน้า">
  <button onclick="addBookmark()">เพิ่ม</button>
  <button onclick="updateBookmark()">อัปเดต</button>
  <input id="search" placeholder="ค้นหา">
  <button onclick="loadBookmarks()">ค้นหา</button>

  <ul id="bookmark-list"></ul>

  <script>
    let selectedId = null;

    async function loadBookmarks() {
      const query = document.getElementById("search").value;
      const res = await fetch(`/supplies/BookmarkServlet${query ? '?search=' + query : ''}`);
      const json = await res.json();
      const ul = document.getElementById("bookmark-list");
      ul.innerHTML = '';
      json.forEach(b => {
        const li = document.createElement('li');
        li.textContent = `${b.title} (หน้า ${b.page_number})`;
        li.onclick = () => selectBookmark(b);
        const del = document.createElement('button');
        del.textContent = 'ลบ';
        del.onclick = () => deleteBookmark(b.id);
        li.appendChild(del);
        ul.appendChild(li);
      });
    }

    function selectBookmark(b) {
      selectedId = b.id;
      document.getElementById('title').value = b.title;
      document.getElementById('page').value = b.page_number;
    }

    async function addBookmark() {
      const title = document.getElementById('title').value;
      const page = document.getElementById('page').value;
      await fetch('/supplies/BookmarkServlet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, page_number: parseInt(page) })
      });
      clearForm();
      loadBookmarks();
    }

    async function updateBookmark() {
      if (!selectedId) return alert("กรุณาเลือก Bookmark ก่อนแก้ไข");
      const title = document.getElementById('title').value;
      const page = document.getElementById('page').value;
      await fetch('/supplies/BookmarkServlet', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: selectedId, title, page_number: parseInt(page) })
      });
      clearForm();
      loadBookmarks();
    }

    async function deleteBookmark(id) {
      await fetch(`/supplies/BookmarkServlet?id=${id}`, { method: 'DELETE' });
      loadBookmarks();
    }

    function clearForm() {
      document.getElementById('title').value = '';
      document.getElementById('page').value = '';
      selectedId = null;
    }

    loadBookmarks();
  </script>
</body>
</html>
