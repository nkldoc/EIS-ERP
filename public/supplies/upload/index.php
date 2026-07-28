<!DOCTYPE html>
<html lang="th">
    <head>
        <meta charset="UTF-8">
        <title>รวมไฟล์ PDF</title>
    </head>
    <body>
        <p> fileSizeThreshold = 10 * 1024 * 1024, // 1MB</p>
        <p> maxFileSize = 50 * 1024 * 1024, // 5MB per file</p>
        <p> maxRequestSize = 200 * 1024 * 1024 // 20MB total</p>
        <form action="/supplies/merge" method="post" enctype="multipart/form-data">
    <input type="text" name="filename" placeholder="ชื่อไฟล์">
    <input type="text" name="foldername" placeholder="ชื่อโฟลเดอร์">
    <input type="file" name="files" multiple accept="application/pdf">
    <button type="submit">อัปโหลดและรวม PDF</button>
        </form>
 
    </body>
</html>
