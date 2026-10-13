<?php require __DIR__ . '/api/erpConfirmationBootstrap.php'; ?>
<!doctype html>
<html lang="th">
    <head>
        <meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
        <meta name="csrf-token" content="<?= htmlspecialchars($erpCsrf, ENT_QUOTES, 'UTF-8') ?>">
        <title>ยืนยันข้อมูลจาก ERP</title>
        <style>
            body{
                margin:0;
                padding:24px;
                font:15px Tahoma,sans-serif;
                color:#243649;
                background:#f4f7fa
            }
            h1{
                font-size:23px;
                margin:0 0 10px
            }
            p{
                line-height:1.7;
                color:#536477
            }
            .toolbar{
                display:flex;
                gap:12px;
                align-items:center;
                flex-wrap:wrap;
                margin:20px 0
            }
            button,select{
                font:inherit;
                border:1px solid #bbc9d5;
                border-radius:5px;
                padding:9px 14px;
                background:white;
                color:#243649
            }
            button{
                cursor:pointer
            }
            button:disabled{
                opacity:.5;
                cursor:default
            }
            .primary{
                background:#17639a;
                color:white;
                border-color:#17639a
            }
            .table-wrap{
                overflow:auto;
                background:white;
                border:1px solid #dce4eb;
                border-radius:8px
            }
            table{
                border-collapse:collapse;
                width:100%;
                white-space:nowrap
            }
            th,td{
                text-align:left;
                padding:13px;
                border-bottom:1px solid #e5ebef
            }
            th{
                background:#edf3f7;
                font-size:13px
            }
            .status{
                font-weight:bold;
                color:#8a5d05
            }
            .confirmed{
                color:#23714d
            }
            #message{
                min-height:24px;
                color:#a32c22
            }
            dialog{
                width:min(850px,90vw);
                border:1px solid #c7d4df;
                border-radius:8px;
                padding:22px
            }
            dialog::backdrop{
                background:#142b4599
            }
            pre{
                white-space:pre-wrap;
                overflow-wrap:anywhere;
                background:#f2f5f8;
                padding:16px;
                max-height:50vh;
                overflow:auto;
                font-size:14px
            }
            #detail-meta{
                overflow-wrap:anywhere
            }
            .ref-group{
                display:flex;
                flex-wrap:wrap;
                gap:10px;
                white-space:normal
            }
            .ref-field label{
                display:block;
                font-size:12px;
                color:#536477;
                margin-bottom:2px
            }
            .ref-field .ref-value{
                background:#f2f5f8;
                border-radius:6px;
                padding:6px 10px;
                min-height:20px;
                min-width:56px
            }
            footer{
                display:flex;
                align-items:center;
                gap:14px;
                margin-top:18px
            }
        </style>
    </head>
    <body>
        <h1>ยืนยันข้อมูลจาก ERP</h1>
        <p>ข้อมูลรับเข้าเวชภัณฑ์จาก ERP • ตรวจสอบรายละเอียดก่อนยืนยันข้อมูล</p>
        <div class="toolbar"><label for="state">สถานะ</label><select id="state"><option value="pending">รอยืนยัน</option><option value="confirmed">ยืนยันแล้ว</option><option value="all">ทั้งหมด</option></select><button id="reload">โหลดข้อมูลใหม่</button><span id="count"></span></div>
        <div id="message" role="status" aria-live="polite"></div>
        <div class="table-wrap"><table><thead><tr><th>วันที่รับข้อมูล</th><th>ข้อมูลอ้างอิง</th><th>เอกสารอ้างอิง</th><th>ลำดับในชุดข้อมูล</th><th>ผู้ส่ง</th><th>สถานะ</th><th>รายละเอียด</th></tr></thead><tbody id="rows"></tbody></table></div>
        <footer><button id="prev">ก่อนหน้า</button><span id="page"></span><button id="next">ถัดไป</button></footer>
        <dialog id="detail"><h2>รายละเอียดข้อมูลจาก ERP</h2><p id="detail-meta"></p><pre id="payload"></pre><p id="confirm-note">การยืนยันนี้บันทึกผลตรวจสอบข้อมูลเท่านั้น ยังไม่สร้างรายการส่งมอบงาน</p><div id="detail-message" role="status"></div><div class="toolbar"><button class="primary" id="confirm">ยืนยันข้อมูลรายการนี้</button><button id="close">ปิด</button></div></dialog>
<script src="erpConfirmation.js?v=3"></script>
</body></html>
