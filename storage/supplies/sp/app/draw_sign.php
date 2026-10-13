<?php
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents("php://input"));
    if (isset($data->image)) {
        $imageData = $data->image;
        $imageData = str_replace('data:image/png;base64,', '', $imageData);
        $imageData = str_replace(' ', '+', $imageData);
        $decodedData = base64_decode($imageData);

        $saveDir = $data->foldername;
        if (!is_dir($saveDir)) {
            mkdir($saveDir, 0777, true);
        }
        $evGen = $_REQUEST['_evGen'] ?? null;
        $fileName = $data->dc_user_id . '_' . $data->document_id . '.png';
        file_put_contents($saveDir . '/' . $fileName, $decodedData);

//        echo $fileName;
        // ข้อมูลที่ต้องการส่ง
        $data = [
            "image" => $decodedData, // base64 image data
            "dc_user_id" => $data->dc_user_id,
            "dc_emp_id" => $data->dc_emp_id,
            "countSign" => $data->countSign,
            "document_id" => $data->document_id,
            "document_type_id" => $data->document_type_id,
            "foldername" => $data->foldername,
            "filename" => $data->filename,
            "showPages" => $data->showPages,
            "docIdParam" => $data->docIdParam,
            "previewSig" => true,
            "poitionX" => $data->poitionX,
            "poitionY" => $data->poitionY
        ];

        // ตั้งค่า HTTP POST
        $ch = curl_init('/supplies/signDoc'); // เปลี่ยน URL ให้ตรงกับ Java Servlet
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            'Content-Type: application/json'
        ]);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));

        // ส่งและรับผลลัพธ์
        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        // ตรวจสอบผลลัพธ์
        if ($httpCode === 200) {
            echo "Success: " . $response;
        } else {
            echo "Failed (HTTP $httpCode): " . $response;
        }
        exit;
    } else {
        echo "ไม่พบข้อมูลภาพ";
        exit;
    }
}
?>

<!DOCTYPE html>
<html lang="th">
    <head>
        <meta charset="UTF-8">
        <title>ลายเซ็นออนไลน์</title>
        <style>
            body {
                font-family: sans-serif;
                
            }
            canvas {
                border: 1px solid #ccc;
                touch-action: none;
            }
            #tools {
                margin-top: 4px;
            }
            #pen-size {
                width: 60px;
            }
        </style>
    </head>
    <body>

        <h2>📂 สร้างหรืออัปโหลดลายเซ็น <span style="color:red;font-size:13px;">*(ฉะเพาะสิทธิ์ผู้ลงนามเอกสาร ลายเซ็นจึงจะปรากฏในเอกสาร PDF) </span></h2> 
        <label>
            <input type="radio" name="mode" value="draw" checked> 🖊 เริ่มใหม่
        </label>
        <label>
            <input type="radio" name="mode" value="upload">📂 เลือกไฟล์ลายเซ็นต์จากเครื่อง
        </label>

        <div id="tools">
          
            <label>ขนาดปากกา:
                <input type="number" id="pen-size" min="1" max="20" value="10">
            </label>
            <label>สีปากกา:
                <input type="color" id="pen-color" value="#000000">
            </label>
            
            <label>หัวปากกา:
                <select id="pen-cap">
                    <option value="round">มน</option>
                    <option value="butt">ตัด</option>
                    <option value="square">เหลี่ยม</option>
                </select>
            </label>
             <input type="checkbox" id="ink-mode"> 🖌 แบบหมึกซึม
            <button id="download">🎯 บันทึกเก็บไว้ใช้ครั้งต่อไป</button>
              <button id="clear-signature">✏️ เขียนใหม่</button>
            <!--<button id="save-to-server">💾 บันทึก ลายเซ็นต์</button>-->
        </div>

        <br>
        <div id="upload-section" style="display: none;">
            <input type="file" id="upload" accept="image/*">
        </div>

        <canvas style="background:#fff" id="canvas" width="920" height="300"></canvas>

        <script>
         const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
let isDrawing = false, lastX = 0, lastY = 0;
let imageLoaded = false, uploadedFile = null;

// 🎨 ฟังก์ชันวาดเส้น
function drawLine(x, y) {
    const penColor = document.getElementById('pen-color').value;
    const penSize = parseInt(document.getElementById('pen-size').value) || 4;
    const penCap = document.getElementById('pen-cap').value;
    const inkMode = document.getElementById('ink-mode').checked;

    ctx.strokeStyle = penColor;
    ctx.lineWidth = penSize;
    ctx.lineCap = penCap;

    if (inkMode) {
        ctx.shadowColor = penColor;
        ctx.shadowBlur = penSize * 0.8;
        ctx.globalAlpha = 0.6;
    } else {
        ctx.shadowBlur = 0;
        ctx.globalAlpha = 1.0;
    }

    ctx.beginPath();
    ctx.moveTo(lastX, lastY);
    ctx.lineTo(x, y);
    ctx.stroke();
    lastX = x;
    lastY = y;
}

// 🎨 ตรวจสี
function colorsMatch(r, g, b, target, tolerance) {
    return (
        Math.abs(r - target.r) <= tolerance &&
        Math.abs(g - target.g) <= tolerance &&
        Math.abs(b - target.b) <= tolerance
    );
}

// 🧽 Undo ล้างภาพ
function undoDrowing() {
    if (imageLoaded && uploadedFile) {
        loadImageToCanvas(uploadedFile);
    } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
}

// 🧩 ทำพื้นหลังโปร่งใส
function makeBackgroundTransparent(img, transparentColor, tolerance = 30) {
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');
    tempCanvas.width = img.width;
    tempCanvas.height = img.height;
    tempCtx.drawImage(img, 0, 0);

    const imageData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
        const r = data[i], g = data[i + 1], b = data[i + 2];
        if (colorsMatch(r, g, b, transparentColor, tolerance)) {
            data[i + 3] = 0;
        }
    }

    tempCtx.putImageData(imageData, 0, 0);
    return tempCanvas;
}

// 🖼 โหลดรูปจากไฟล์หรือ base64
function loadImageToCanvas(src) {
    const img = new Image();
    img.onload = function () {
        canvas.width = img.width;
        canvas.height = img.height;
        const brown = { r: 150, g: 75, b: 0 };
        const transparentCanvas = makeBackgroundTransparent(img, brown, 40);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(transparentCanvas, 0, 0);
        imageLoaded = true;
    };
    img.src = src;
}

// ✋ เมาส์และทัช
canvas.addEventListener('mousedown', e => {
    isDrawing = true;
    const rect = canvas.getBoundingClientRect();
    lastX = e.clientX - rect.left;
    lastY = e.clientY - rect.top;
});
canvas.addEventListener('mousemove', e => {
    if (!isDrawing) return;
    const rect = canvas.getBoundingClientRect();
    drawLine(e.clientX - rect.left, e.clientY - rect.top);
});
canvas.addEventListener('mouseup', () => isDrawing = false);
canvas.addEventListener('mouseout', () => isDrawing = false);

canvas.addEventListener('touchstart', e => {
    isDrawing = true;
    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];
    lastX = touch.clientX - rect.left;
    lastY = touch.clientY - rect.top;
    e.preventDefault();
});
canvas.addEventListener('touchmove', e => {
    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];
    drawLine(touch.clientX - rect.left, touch.clientY - rect.top);
    e.preventDefault();
});
canvas.addEventListener('touchend', () => isDrawing = false);

// 📂 อัปโหลดไฟล์
document.getElementById('upload').addEventListener('change', function (e) {
    const file = e.target.files[0];
    if (!file) return;
    uploadedFile = file;

    const reader = new FileReader();
    reader.onload = function (event) {
        loadImageToCanvas(event.target.result);
    };
    reader.readAsDataURL(file);
});

// 🔁 ปุ่ม clear
document.getElementById('clear-signature').addEventListener('click', undoDrowing);

// 💾 ปุ่มดาวน์โหลด
document.getElementById('download').addEventListener('click', () => {
    const link = document.createElement('a');
    link.download = 'signature.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
});

// 💾 ปุ่ม save to server
//document.getElementById('save-to-server').addEventListener('click', () => {
//    window.parent.Ext.getCmp("MessageBox_re").getEl().mask("Please wait...", "x-mask-loading");
//    const imageData = canvas.toDataURL('image/png');
//    window.parent.Ext.getCmp('imgSignID').setValue(imageData);
//    window.parent.Ext.getCmp('panelSignID').setText('ลงลายเซ็น เรียบร้อย');
//    window.parent.Ext.getCmp("MessageBox_re").destroy();
//    return false;
//});
window.saveSingStep1 = (() => {
//    window.parent.Ext.getCmp("MessageBox_re").getEl().mask("Please wait...", "x-mask-loading");
    const imageData = canvas.toDataURL('image/png');
//    window.parent.Ext.getCmp('imgSignID').setValue(imageData);
    window.parent.Ext.getCmp('btn_save-MessageBox_re').setText('1) ลงลายเซ็นในเอกสาร PDF  ✅  เรียบร้อย');
    window.parent.Ext.getCmp('btn_pre-MessageBox_re').setText('2) เอกสาร PDF  ✅  เรียบร้อย'); 
    window.parent.Ext.getCmp("MessageBox_re-tapSignID").destroy();
    return imageData;
});

// 🔄 สลับโหมด
document.querySelectorAll('input[name="mode"]').forEach(radio => {
    radio.addEventListener('change', () => {
        const mode = document.querySelector('input[name="mode"]:checked').value;
        const uploadSection = document.getElementById('upload-section');
        if (mode === 'upload') {
            uploadSection.style.display = 'block';
        } else {
            uploadSection.style.display = 'none';
            imageLoaded = false;
            uploadedFile = null;
            canvas.width = 1000;
            canvas.height = 400;
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
    });
});

// 🧠 โหลดภาพอัตโนมัติถ้ามีใน imgSignID

window.addEventListener('load', () => {
    
    
  
    try {
       
        const imgValue = window.parent.Ext.signImg || null; 
        if (imgValue && imgValue.startsWith('data:image')) {
            console.log('🖼 โหลดภาพจาก imgSignID (base64)');
            loadImageToCanvas(imgValue);
        } else if (imgValue) {
            console.log('🖼 โหลดภาพจาก path URL:', imgValue);
            loadImageToCanvas(imgValue);
        }
    } catch (err) {
        console.warn('⚠️ ไม่พบ window.parent.Ext หรือ imgSignID', err);
    }
});

 
        </script>
    </body>
</html>
