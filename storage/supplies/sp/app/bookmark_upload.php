<!DOCTYPE html>
<html lang="th">
<head>
<meta charset="UTF-8">
<title>PDF Update Bookmarks - Upload with Progress</title>
<style>
    body {
        font-family: Arial, sans-serif;
        padding: 20px;
        max-width: 600px;
        margin: auto;
    }
    label { display: block; margin-top: 10px; }
    input, select { width: 100%; padding: 6px; margin-top: 4px; }
    button { margin-top: 15px; padding: 10px; width: 100%; }
    progress {
        width: 100%;
        height: 20px;
        margin-top: 10px;
    }
    #status {
        margin-top: 10px;
        font-weight: bold;
    }
</style>
</head>
<body>

<h2>📂 แทรก PDF ที่ Bookmark</h2>

<form id="uploadForm">
    <label>PDF1 (แทรก)</label>
    <input type="file" name="pdf1" accept="application/pdf" required>

    <label>PDF2 (ต้นฉบับ)</label>
    <input type="file" name="pdf2" accept="application/pdf" required>

    <label>Bookmark</label>
    <input type="text" name="bookmark" placeholder="ชื่อ Bookmark" required>

    <label>Insert Mode</label>
    <select name="insertMode">
        <option value="before">ก่อน Bookmark</option>
        <option value="after">หลัง Bookmark</option>
    </select>

    <label>From Page (PDF1)</label>
    <input type="number" name="fromPage" value="1" min="1" required>

    <label>Pages to Remove (เช่น 2,4,5)</label>
    <input type="text" name="pagesToRemove">

    <label>Doc Type</label>
    <input type="text" name="docType" required>

    <label>PDF Book</label>
    <input type="text" name="pdfBook" required>

    <button type="submit">🚀 เริ่มอัปโหลด</button>
</form>

<progress id="progressBar" value="0" max="100"></progress>
<div id="status"></div>

<script>
document.getElementById("uploadForm").addEventListener("submit", function(e) {
    e.preventDefault();

    let formData = new FormData(this);
    let xhr = new XMLHttpRequest();

    xhr.open("POST", "/supplies/pdfUpdateBookmarks", true);

    // อัปเดต progress bar ระหว่างอัปโหลด
    xhr.upload.addEventListener("progress", function(e) {
        if (e.lengthComputable) {
            let percent = (e.loaded / e.total) * 100;
            document.getElementById("progressBar").value = percent;
            document.getElementById("status").textContent = `กำลังอัปโหลด... ${percent.toFixed(2)}%`;
        }
    });

    // เมื่ออัปโหลดเสร็จ
    xhr.onload = function() {
        if (xhr.status === 200) {
            try {
                let res = JSON.parse(xhr.responseText);
                if (res.status === "success") {
                    document.getElementById("status").textContent = "✅ สำเร็จ: " + res.message;
                    if (res.outputFile) {
                        document.getElementById("status").innerHTML += `<br>📄 ไฟล์ที่ได้: ${res.outputFile}`;
                    }
                } else {
                    document.getElementById("status").textContent = "❌ ล้มเหลว: " + res.message;
                }
            } catch (err) {
                document.getElementById("status").textContent = "❌ ข้อมูลตอบกลับไม่ถูกต้อง";
            }
        } else {
            document.getElementById("status").textContent = "❌ HTTP Error: " + xhr.status;
        }
    };

    // เริ่มส่งข้อมูล
    xhr.send(formData);
});
</script>

</body>
</html>
