<?php
include("../../lib/database/DatabaseServer.php");
include("../../lib/database/apiUtil.php");
include("../../lib/date/i_date.class.php");
include("../../lib/database/audit_class.php");
include("../../lib/database/workflow_classs.php");

$db = new DatabaseServer();
$date = new i_date();
$util = new apiUtil();
$audit = new AuditLog($db);
$wf = new WorkflowEngine($db);

//$newStatus = $wf->nextStatus(
//        'DOC',
//        'DOC_DRAFT',
//        'SUBMIT'
//);
//$statusTxt = " STATUSCODE :   " . $newStatus[0] . " , สถานะต่อไป : " . $newStatus[1];
?>
<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Image Pagination</title>
        <style>
            /* ตั้งค่าฟอนต์และพื้นหลังภาพรวม */
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                background-color: #f8f9fa;
                margin: 0;
                padding: 20px 15px; /* ปรับ Padding ให้เหมาะกับมือถือมากขึ้น */
                display: flex;
                flex-direction: column;
                align-items: center;
                min-height: 100vh;
                box-sizing: border-box;
            }

            h3 {
                text-align: center;
                font-size: 1.4rem;
                margin-bottom: 20px;
                word-wrap: break-word;
                max-width: 100%;
            }

            /* Container ครอบรูปภาพ */
            #image-container {
                display: flex;
                justify-content: center;
                align-items: center;
                width: 100%;
                max-width: 1000px;
                margin-bottom: 25px;
            }

            /* สไตล์ของรูปภาพ */
            img {
                width: 100%;
                max-width: 1000px;
                height: auto;
                max-height: 500px;
                object-fit: contain; /* เปลี่ยนเป็น contain เพื่อไม่ให้รูปโดนครอปตัดบนจอแต่ละขนาด */
                border-radius: 12px;
                box-shadow: 0 10px 25px rgba(0, 0, 0, 0.08);
                transition: transform 0.3s ease;
            }

            /* ส่วนควบคุม Pagination */
            .pagination {
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 15px;
                background: #ffffff;
                padding: 10px 20px;
                border-radius: 30px;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
                width: 100%;
                max-width: 320px; /* จำกัดความกว้างปุ่มไม่ให้แผ่ยาวเกินไป */
                box-sizing: border-box;
            }

            /* สไตล์ปุ่มกด */
            button {
                background: linear-gradient(135deg, #4f46e5, #3b82f6);
                color: white;
                border: none;
                padding: 10px 20px;
                font-size: 14px;
                font-weight: 600;
                border-radius: 20px;
                cursor: pointer;
                transition: all 0.2s ease;
                outline: none;
                flex: 1; /* ให้ปุ่มขยายเท่าๆ กัน */
                text-align: center;
            }

            /* เอฟเฟกต์ตอนเอาเมาส์ไปชี้ปุ่ม */
            button:hover {
                transform: translateY(-2px);
                box-shadow: 0 5px 15px rgba(59, 130, 246, 0.4);
                opacity: 0.95;
            }

            /* เอฟเฟกต์ตอนกดปุ่ม */
            button:active {
                transform: translateY(0);
            }

            /* ข้อความบอกตำแหน่งหน้า */
            #page-info {
                font-size: 14px;
                color: #4b5563;
                font-weight: 500;
                white-space: nowrap; /* ห้ามตัวอักษรตัดบรรทัด */
                text-align: center;
            }

            /* สไตล์สำหรับตกแต่งกล่องข้อความ */
            pre {
                background-color: #f4f4f4;
                border: 1px solid #ddd;
                border-left: 3px solid #007bff;
                color: #333;
                font-family: 'Courier New', Courier, monospace;
                font-size: 14px;
                line-height: 1.5;
                margin-bottom: 1.6em;
                width: 100%;
                max-width: 1000px;
                box-sizing: border-box;
                overflow-x: auto; /* เพิ่ม Scrollbar แนวนอนในกรณีที่ Flowchart กว้างเกินหน้าจอมือถือ */
                padding: 15px;
                display: block;
                white-space: pre; /* คงรูปแบบเว้นวรรคของ Flowchart อักษรไว้ */
                border-radius: 6px;
            }

            /* ── Responsive Media Queries ── */
            @media (max-width: 768px) {
                body {
                    padding: 20px 10px;
                }
                pre {
                    font-size: 12px; /* ลดขนาดตัวอักษรของ Flowchart ลงบนแท็บเล็ต/มือถือ */
                    padding: 12px;
                }
                img {
                    max-height: 350px; /* ลดความสูงสูงสุดบนหน้าจอขนาดเล็กเพื่อความกระชับ */
                }
            }

            @media (max-width: 480px) {
                h3 {
                    font-size: 1.1rem;
                }
                pre {
                    font-size: 11px; /* ลดขนาดลงอีกสำหรับมือถือจอเล็กเพื่อให้เห็น Flowchart ครบขึ้น */
                }
                .pagination {
                    gap: 10px;
                    padding: 8px 15px;
                }
                button {
                    padding: 8px 12px;
                    font-size: 13px;
                }
                #page-info {
                    font-size: 12px;
                }
            }
        </style>
    </head>
    <body>
        <h3><? ///$statusTxt  ?></h3>
        <pre>ExtJS UI
   │
   ▼
PHP Controller
   │
   ▼
Workflow Engine
   │
   ├── ตรวจสิทธิ์ Role
   ├── ตรวจสถานะปัจจุบัน
   ├── หา Next Status
   ├── Update Document
   ├── Save Audit Log
   └── Send Notification
   │
   ▼
SQL Server</pre>

        <pre>  CREATE TABLE workflow_transition(
                    transition_id INT IDENTITY PRIMARY KEY,
                    module_code VARCHAR(20),
                    from_status VARCHAR(30),
                    action_code VARCHAR(30),
                    to_status VARCHAR(30),
                    allow_role VARCHAR(100),
                    active_flag BIT
                    )</pre>

        <pre> ExtJS UI
 ↓
โหลดสถานะปัจจุบัน
 ↓
Query workflow_transition
 ↓
สร้างปุ่มอัตโนมัติ
 ↓
ผู้ใช้กดปุ่ม
 ↓
Workflow Engine
 ↓
Update Document Status
 ↓
Save Audit Log
 ↓
Send Notification</pre>

        <pre><h3>ผลลัพธ์ข้อมูลจากระบบ (JSON)</h3>
            ┌────────────┐
             │ สร้าง IR   │APIRGENCODE
             └─────┬──────┘
             │
             ▼
             ┌────────────┐
             │ สร้าง AP   │APBGENCODE  | lส่งคืนทักท้วง => APDPAY
             └─────┬──────┘
             │
             ▼
             ┌────────────┐
             │ รอออกเลข   │ APWCODE
             └─────┬──────┘
             │
             ▼
             ┌────────────┐
             │ รอขึ้นทะเบียน AP  │ APWAMACC
             └─────┬──────┘
             │
             ▼
             ┌────────────┐
             │ ขึ้นครุภัณฑ์แล้วรอยืนยัน│ APAMACCD
             └─────┬──────┘
             │
             ▼
             ┌────────────┐
             │ รอเบิก     │ APDPAY |
             └─────┬──────┘
             │
             ▼
             ┌────────────┐
             │ ทักท้วง   APDPAY | => APBGENCODE     │
             └─────┬──────┘
             │
             ▼
             ┌────────────┐
             │ จ่ายเงิน   │ APDPAYEND
             └─────┬──────┘
             │
             ▼
             ┌────────────┐
             │ ส่งเข้า GL │ GL01
             └────────────┘</pre>

        <pre id="json-output"></pre>

        <script>
            // ข้อมูล JSON จากระบบของคุณ
            const data = {
                "success": true,
                "documentNo": "AP6800001",
                "oldStatus": "APWCODE",
                "action": "GENCODE",
                "newStatus": "APWAMACC",
                "message": "ออกเลขเอกสารเรียบร้อย"
            };

            // ใช้ JSON.stringify ร่วมกับพารามิเตอร์ null, 4 เพื่อจัดย่อหน้า (Indent) ให้สวยงาม
            document.getElementById("json-output").textContent = JSON.stringify(data, null, 4);
        </script>

        <div id="image-container"></div>

        <div class="pagination">
            <button onclick="prevPage()">Previous</button>
            <span id="page-info"></span>
            <button onclick="nextPage()">Next</button>
        </div>

        <script>
            const images = [
                'imgs/imgflow1.jpg',
            ];

            const imagesPerPage = 1;
            let currentPage = 1;

            function displayImages() {
                const start = (currentPage - 1) * imagesPerPage;
                const end = start + imagesPerPage;
                const displayedImages = images.slice(start, end);

                const container = document.getElementById('image-container');
                container.innerHTML = '';
                displayedImages.forEach(src => {
                    const img = document.createElement('img');
                    img.src = src;
                    container.appendChild(img);
                });

                document.getElementById('page-info').textContent = `Page ${currentPage} of ${Math.ceil(images.length / imagesPerPage)}`;
            }

            function nextPage() {
                if (currentPage < Math.ceil(images.length / imagesPerPage)) {
                    currentPage++;
                    displayImages();
                }
            }

            function prevPage() {
                if (currentPage > 1) {
                    currentPage--;
                    displayImages();
                }
            }
            displayImages();

        </script>
    </body>
</html>