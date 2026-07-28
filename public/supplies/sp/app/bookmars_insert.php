<!DOCTYPE html>
<html lang="th">
    <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>แทรกหน้า PDF ตรง Bookmark พร้อมลบหน้า</title>
        <style>
            body {
                font-family: sans-serif;
                padding: 20px;
            }
            label, select, input, button {
                display: block;
                margin-top: 15px;
                width: 100%;
                max-width: 600px;
            }
            pre {
                background: #f0f0f0;
                padding: 10px;
                white-space: pre-wrap;
            }

            /* สไตล์สำหรับคอนเทนเนอร์หลักที่ทำหน้าที่เป็นตาราง */
            .container {
                display: flex; /* ใช้ Flexbox สำหรับการจัดเรียงองค์ประกอบ */
                width: 100%; /* ตั้งค่าความกว้างให้เต็ม 100% ของพื้นที่ */
                border: 1px solid #ccc; /* เพิ่มเส้นขอบเพื่อให้เห็นขอบเขต */
                box-sizing: border-box; /* ทำให้ padding และ border รวมอยู่ในความกว้างด้วย */
                font-family: sans-serif;
            }

            /* สไตล์สำหรับแต่ละคอลัมน์ภายในตาราง */
            .column {
                flex: 1; /* กำหนดให้แต่ละคอลัมน์มีสัดส่วนเท่ากัน ทำให้มีความกว้างเท่ากัน */
                padding: 15px; /* เพิ่มระยะห่างภายในคอลัมน์ */
                border-right: 1px solid #ccc; /* เพิ่มเส้นขอบด้านขวาเพื่อแยกคอลัมน์ */
            }

            /* สไตล์สำหรับคอลัมน์สุดท้ายเพื่อเอาเส้นขอบขวาออก */
            .column:last-child {
                border-right: none;
            }

            /* สไตล์สำหรับข้อความที่อยู่ด้านบนซ้าย */
            .top-left-text {
                /* ข้อความจะชิดด้านบนซ้ายโดยอัตโนมัติด้วย Flexbox */
                margin: 0; /* ลบ margin เริ่มต้นของ p tag */
            }

        </style>
    </head>
    <body>

        <h2>📄 แทรกหน้า PDF ที่ Bookmark พร้อมลบหน้า</h2>


        <form id="pdfForm">
            <!-- คอนเทนเนอร์หลักสำหรับตาราง -->
            <div class="container">
                <!-- คอลัมน์ที่ 1 -->
                <div class="column">

                    <label>📎 PDF ต้นทาง (หน้าที่จะใช้แทรก):</label>
                    <input type="file" id="pdf1" name="pdf1" accept="application/pdf" required>

                    <label>📎 PDF หลัก (มี Bookmark):</label>
                    <input type="file" id="pdf2" name="pdf2" accept="application/pdf" required>

                    <button type="button" onclick="loadBookmarks()">🔍 โหลด Bookmark จาก PDF2</button>

                    <label for="bookmarkSelect">🔖 เลือก Bookmark:</label>
                    <select id="bookmarkSelect" name="bookmark" required disabled>
                        <option value="">-- โปรดเลือก --</option>
                    </select>

                    <label for="insertMode">📌 แทรก:</label>
                    <select id="insertMode" name="insertMode" required>
                        <option value="before">ก่อนหน้า Bookmark</option>
                        <option value="after">หลัง Bookmark</option>
                    </select>

                    <label for="fromPage">📄 หน้าใน PDF1 ที่จะแทรก (เลขหน้าเริ่มที่ 1):</label>
                    <input type="number" id="fromPage" name="fromPage" value="1" min="1" required>

                    <label for="pagesToRemove">🗑️ ลบหน้าจาก OutPut PDF (กรอกเลขหน้า คั่นด้วย comma เช่น 1,2,5):</label>
                    <input type="text" id="pagesToRemove" name="pagesToRemove" placeholder="ระบุเลขหน้าเช่น 1,2,3">

                    <button type="submit">🚀 แทรก PDF</button>
                </div>

                <!-- คอลัมน์ที่ 2 -->
                <div class="column">
                    <label for="docType">📄 ชื่อเอกสารอ้าง (เช่น เลข PR25651100016 ):</label>
                    <input type="text" id="docType" name="docType" value="PR25651100016" required><!-- comment -->

                    <label for="pdfBook">📄 ชื่อเล่มเอกสาร book1 (เช่น PR25651100016_book1 ):</label>
                    <input type="text" id="pdfBook" name="pdfBook" value="book1" required><!-- comment -->
                    <h3>ผลลัพธ์:</h3>
                    <pre id="result">ยังไม่มีผลลัพธ์</pre>
                    <progress id="progressBar" value="0" max="100"></progress>
                    <div id="status"></div>
                    <iframe name="printf" id="printfID" src="./view_pdf.php" style="width:100%; height:100%; border-style:hidden;"></iframe>
                </div>
            </div>   


        </form>


        <script>
            async function loadBookmarks() {
                const fileInput = document.getElementById("pdf2");
                const resultBox = document.getElementById("result");
                const bookmarkSelect = document.getElementById("bookmarkSelect");

                if (!fileInput.files[0]) {
                    alert("กรุณาเลือก PDF2 ก่อน");
                    return;
                }

                const formData = new FormData();
                formData.append("pdf2", fileInput.files[0]);

                resultBox.textContent = "⏳ กำลังโหลด Bookmark...";

                try {
                    const response = await fetch("/supplies/loadBookmarks", {method: "POST", body: formData});
                    const bookmarks = await response.json();

                    bookmarkSelect.innerHTML = '<option value="">-- โปรดเลือก --</option>';
                    bookmarks.forEach(b => {
                        const option = document.createElement("option");
                        option.value = b.title;
                        option.textContent = `${b.title} (หน้า ${b.page})`;
                        bookmarkSelect.appendChild(option);
                    });

                    bookmarkSelect.disabled = false;
                    resultBox.textContent = "✅ โหลด Bookmark สำเร็จ";
                } catch (err) {
                    resultBox.textContent = "❌ โหลด Bookmark ไม่สำเร็จ: " + err;
                }
            }
//            document.getElementById("uploadForm").addEventListener("submit", function (e) {
            document.getElementById("pdfForm").addEventListener("submit", async function (e) {
                e.preventDefault();
                let formData = new FormData(this);
                let xhr = new XMLHttpRequest();
                xhr.open("POST", "/supplies/pdfUpdateBookmarks", true);
                // อัปเดต progress bar ระหว่างอัปโหลด
                xhr.upload.addEventListener("progress", function (e) {
                    if (e.lengthComputable) {
                        let percent = (e.loaded / e.total) * 100;
                        document.getElementById("progressBar").value = percent;
                        document.getElementById("status").textContent = `กำลังอัปโหลด... ${percent.toFixed(2)}%`;
                    }
                });
                // เมื่ออัปโหลดเสร็จ
                xhr.onload = function () {
                    if (xhr.status === 200) {
                        try {
                            let res = JSON.parse(xhr.responseText);
                            if (res.status === "success") {
                                document.getElementById("status").textContent = "✅ สำเร็จ: " + res.message;
                                if (res.outputFile) {
                                    document.getElementById("status").innerHTML += `<br>📄 ไฟล์ที่ได้: ${res.outputFile}`;
                                    const iframe = document.getElementById('printfID');
//                    const result = await response.json();
//                    if (result.status === "success") {
//                        resultBox.textContent = `✅ สำเร็จ: ${result.message}\n📁 ${result.outputFile}`;
//                        
                                    const currentSrc = iframe.src;
                                    // ตั้งค่า src เป็นค่าเดิม ทำให้เบราว์เซอร์มองว่าต้องโหลดใหม่
                                    iframe.src = currentSrc;
//                
//                    
//                    } else {
//                        resultBox.textContent = `❌ ผิดพลาด: ${result.message}`;
//                    }
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
//            document.getElementById("pdfForm").addEventListener("submit", async function (e) {
//                e.preventDefault();
//                const formData = new FormData();
//
//                formData.append("pdf1", document.getElementById("pdf1").files[0]);
//                formData.append("pdf2", document.getElementById("pdf2").files[0]);
//                formData.append("bookmark", document.getElementById("bookmarkSelect").value);
//                formData.append("insertMode", document.getElementById("insertMode").value);
//                formData.append("fromPage", document.getElementById("fromPage").value);
//                formData.append("docType", document.getElementById("docType").value);
//                formData.append("pdfBook", document.getElementById("pdfBook").value);
//
//                // เพิ่มส่งข้อมูลลบหน้า
//                formData.append("pagesToRemove", document.getElementById("pagesToRemove").value.trim());
//
//                const resultBox = document.getElementById("result");
//                resultBox.textContent = "⏳ กำลังประมวลผล...";
//
//                try {
//                    const response = await fetch("/supplies/pdfUpdateBookmarks", {
//                        method: "POST",
//                        body: formData
//                    });
//                    const iframe = document.getElementById('printfID');
//                    const result = await response.json();
//                    if (result.status === "success") {
//                        resultBox.textContent = `✅ สำเร็จ: ${result.message}\n📁 ${result.outputFile}`;
//                        
//                         const currentSrc = iframe.src;
//                        // ตั้งค่า src เป็นค่าเดิม ทำให้เบราว์เซอร์มองว่าต้องโหลดใหม่
//                        iframe.src = currentSrc;
//                
//                    
//                    } else {
//                        resultBox.textContent = `❌ ผิดพลาด: ${result.message}`;
//                    }
//                } catch (err) {
//                    resultBox.textContent = "⚠️ เกิดข้อผิดพลาด: " + err;
//                }
            });
        </script>



    </body>
</html>
