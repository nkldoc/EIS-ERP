<!DOCTYPE html>
<html lang="th">
    <head>
        <meta charset="UTF-8">
        <title>อัปโหลด/ถ่ายรูปบัตรประชาชน</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                padding: 20px;
            }
            .hidden {
                display: none;
            }
            #previewImage {
                max-width: 300px;
                margin-top: 10px;
                border: 1px solid #ccc;
            }
        </style>
    </head>
    <body>
        <h2>📄 บัตรประชาชน - OCR</h2>

        <button onclick="showCamera()">📷 ถ่ายรูป</button>
        <button onclick="showUpload()">📁 อัปโหลด</button>

        <!-- ถ่ายรูป -->
        <div id="cameraSection" class="hidden">
            <video id="video" width="320" height="240" autoplay></video><br>
            <button onclick="captureImage()">📸 ถ่ายภาพ</button>
        </div>

        <!-- อัปโหลด -->
        <div id="uploadSection" class="hidden">
            <input type="file" accept="image/*" id="uploadInput">
        </div>

        <!-- Preview -->
        <canvas id="canvas" width="320" height="240" class="hidden"></canvas>
        <img id="previewImage" class="hidden">

        <!-- ปุ่มส่ง -->
        <br>
        <button onclick="uploadToServer()">✅ ส่งไป OCR</button>

        <div id="resultBox" style="margin-top:20px; white-space: pre-wrap;"></div>

        <script>
            let capturedBlob = null;

            function showCamera() {
                document.getElementById('cameraSection').classList.remove('hidden');
                document.getElementById('uploadSection').classList.add('hidden');
                document.getElementById('previewImage').classList.add('hidden');
                capturedBlob = null;

                navigator.mediaDevices.getUserMedia({video: true})
                        .then(stream => {
                            document.getElementById('video').srcObject = stream;
                        })
                        .catch(err => alert("ไม่สามารถเปิดกล้องได้: " + err));
            }

            function showUpload() {
                document.getElementById('uploadSection').classList.remove('hidden');
                document.getElementById('cameraSection').classList.add('hidden');
                document.getElementById('previewImage').classList.add('hidden');
                capturedBlob = null;
            }

            document.getElementById('uploadInput').addEventListener('change', function () {
                const file = this.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = function (e) {
                        const img = document.getElementById('previewImage');
                        img.src = e.target.result;
                        img.classList.remove('hidden');
                    };
                    reader.readAsDataURL(file);
                    capturedBlob = file; // เตรียมไว้ส่ง
                }
            });

            function captureImage() {
                const video = document.getElementById('video');
                const canvas = document.getElementById('canvas');
                const context = canvas.getContext('2d');
                context.drawImage(video, 0, 0, canvas.width, canvas.height);

                canvas.toBlob(blob => {
                    capturedBlob = blob;

                    const url = URL.createObjectURL(blob);
                    const img = document.getElementById('previewImage');
                    img.src = url;
                    img.classList.remove('hidden');
                }, 'image/jpeg');
            }

            async function uploadToServer() {
                if (!capturedBlob) {
                    alert("กรุณาเลือกรูป หรือถ่ายภาพก่อนส่ง");
                    return;
                }

                const formData = new FormData();
                formData.append('file', capturedBlob, 'idcard.jpg');

                const response = await fetch('/supplies/ocr-idcard', {
                    method: 'POST',
                    body: formData
                });

                const resultBox = document.getElementById('resultBox');

                try {
                    const data = await response.json();
                    if (data.success) {
                        const r = data.data;
                        resultBox.textContent = `✅ สำเร็จ:
      📌 เลขบัตร: ${r.nationalId}
      👤 ชื่อ (ไทย): ${r.nameTh}
      🌐 ชื่อ (อังกฤษ): ${r.nameEn}
      🎂 เกิด: ${r.dateOfBirth}
      🏠 ที่อยู่: ${r.address}
      🪪 ออกบัตร: ${r.issueDate}
      📆 หมดอายุ: ${r.expiryDate}`;
                    } else {
                        resultBox.textContent = "❌ ประมวลผลไม่สำเร็จ";
                    }
                } catch (e) {
                    resultBox.textContent = "❌ มีข้อผิดพลาด: " + e;
                }
            }
        </script>
    </body>
</html>
