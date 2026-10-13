<?php
$pr = $_GET['pr'] ?? '';
$filename = $_GET['filename'] ?? '';
$filepath = "{$pr}/output/" . basename($filename); // path ไปยัง PDF จริง
?>

<!DOCTYPE html>
<html>
    <head>
        <meta charset="UTF-8">
        <title>PDF Viewer</title>
        <script src="./js/pdf-lib.min.js"></script>
        <style>
            body {
                margin: 0;
                overflow: hidden;
            }
            #pdfContainer {
                position: relative;
                width: 100%;
                height: 100vh;
            }
            iframe {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                z-index: 1;
            }
            canvas#annotationCanvas {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                z-index: 10;
            }
        </style>
    </head>
    <body>   
<!--        <button id="downloadBtn">Download PDF with Annotations</button>
            <button id="penToolBtn">Enable Pen Tool</button>
            <button id="saveAnnotationsBtn">Save Annotations</button>-->
        <div id="pdfContainer"> 
            <!-- iframe แสดง PDF แยกต่างหาก -->
            <iframe id="pdfViewer" src="serve_pdf.php?pr=<?= urlencode($pr) ?>&filename=<?= urlencode($filename) ?>"></iframe>
            <!-- canvas สำหรับ annotation -->
            <canvas id="annotationCanvas" width="800" height="1100"></canvas>
        </div>
 
    </body>
</html>
