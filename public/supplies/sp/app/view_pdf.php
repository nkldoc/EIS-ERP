<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>File Viewer</title>
  <style>
    body { font-family: Arial; padding: 20px; }
    ul { list-style: none; padding: 0; }
    li { margin: 5px 0; }
    a { text-decoration: none; color: blue; }
  </style>
</head>
<body>

  <h2>📂 All Files in Folder</h2>
  <ul id="file-list">Loading...</ul>

  <script>
    fetch('view_list.php')
      .then(response => response.json())
      .then(files => {
        const list = document.getElementById('file-list');
        list.innerHTML = '';
        if (files.length === 0) {
          list.innerHTML = '<li>No files found.</li>';
        } else {
          files.forEach(file => {
            const li = document.createElement('li');
            const a = document.createElement('a');
            a.href = file;
            a.textContent = file;
            // ลบ a.target = '_blank'; เพื่อให้ไฟล์เปิดในหน้าต่างหลัก
            li.appendChild(a);
            list.appendChild(li);
          });
        }
      })
      .catch(error => {
        document.getElementById('file-list').innerHTML = '<li>Error loading files.</li>';
        console.error(error);
      });
  </script>

</body>
</html>