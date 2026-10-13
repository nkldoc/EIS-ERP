# ยืนยันข้อมูลแล้วบันทึก MSSQL

## ขอบเขตที่ติดตั้ง

ปุ่มยืนยันอ่าน payload ที่เก็บใน MySQL แล้วบันทึกทั้งชุดลง MSSQL
`dbo.sp_erp_confirmation_inbox` ผ่าน connection Supplies เดิม (`DB_NAME` ปกติคือ `NMU_ERP`)
พร้อมรหัส PR/PO/งวด/ตรวจรับ เอกสารอ้างอิง ผู้ยืนยัน และเวลา UTC
รายละเอียด line_ids และค่า false/null เก็บครบใน payload แบบ NVARCHAR(MAX)

นี่เป็นตารางรับเข้ารอ mapping ยังไม่เขียน `sp_tor_period_bill_receive` หรือ
`sp_tor_period_bill_checking` เพราะต้นทางยังไม่มี mapping งวด/เลข IR และข้อมูลภาษีครบ
แบบเชื่อมตารางธุรกิจอยู่ใน `erp-confirmation-mysql-mssql-design.md`

## ติดตั้งก่อนเปิดใช้

1. MySQL ที่มี `sp_erp_confirmation`: รัน `public/supplies/sp/sql/erp-confirmation-sync-mysql.sql` หนึ่งครั้ง
2. MSSQL ฐานตาม Supplies config: รัน `public/supplies/sp/sql/erp-confirmation-mssql.sql` (รันซ้ำได้)
3. บัญชี MSSQL ของแอปต้องมี SELECT/INSERT บนตารางรับเข้า บัญชี MySQL ต้องมี SELECT/UPDATE บนตารางเดิม
4. ติดตั้งไฟล์ API, Store, Mssql writer, response helper และหน้า PHP/JS ด้วยกัน แล้วโหลดหน้าใหม่

ไม่มีการสร้างตารางระหว่าง HTTP request และไม่มีการส่งรายการเก่าทั้งหมดอัตโนมัติ
รายการที่ยืนยันก่อนอัปเกรดจะแสดง “ยืนยันแล้ว • รอส่ง MSSQL” เพื่อให้เปิดแล้วกดบันทึกได้
ตรวจ schema ทั้งสองฐานก่อนเปิดให้ผู้ใช้เข้า ไม่รัน MySQL ALTER ซ้ำ

## การบันทึกและ retry

ล็อกแถว MySQL → MSSQL transaction อ่าน/สร้าง receipt → commit MSSQL →
อัปเดต confirmed_at/mssql_id/mssql_synced_at และ commit MySQL → ตอบสำเร็จ
ถ้า MSSQL ไม่สำเร็จ MySQL rollback และรายการยังรอส่ง
ถ้า MSSQL สำเร็จแต่ MySQL ขัดข้อง กดยืนยันอีกครั้งจะอ่าน receipt เดิมและซ่อมสถานะ MySQL
ผู้ยืนยัน/เวลาของครั้งที่บันทึก MSSQL สำเร็จยังคงเดิม

MSSQL UNIQUE(request_id,item_index) + UPDLOCK/HOLDLOCK ป้องกันการสร้างซ้ำจาก retry
payload_hash ต่างกันภายใต้ key เดิมจะถูกปฏิเสธ ไม่เขียนทับ
request ใหม่ถือเป็นข้อมูลรับเข้าคนละชุดตามพฤติกรรมเดิมของ API
จึงยังไม่ใช่การป้องกันเอกสารธุรกิจเดียวกันที่ต้นทางส่งซ้ำด้วย request_id ใหม่

สองฐานไม่ได้ commit พร้อมกัน ผู้ใช้จึงควรกดซ้ำเมื่อไม่ทราบผล ระบบไม่แจ้งว่าสำเร็จ
จนกว่า MSSQL และสถานะ MySQL จะบันทึกครบ ไม่มี background worker ในเวอร์ชันนี้

## ตรวจสอบ

วันที่ 2026-09-24 ติดตั้ง sync columns ใน MySQL และตาราง inbox ใน MSSQL ของเครื่องพัฒนาที่ตั้งค่าไว้แล้ว
ตรวจ query รายการกับฐานจริงผ่าน โดยไม่ยืนยันหรือแก้ไขเอกสารธุรกิจ
หน้าเมนู `medSupIrConfirm.php` ใช้ข้อความสถานะและ JavaScript รุ่นเดียวกับ `erpConfirmation.php`
log ของ API อยู่ใน `storage/logs/erp-confirmation.log` แทนเส้นทาง log ของ PHP ที่อาจไม่มีในเครื่อง

`php tests/erp-confirmation-schema-check.php` ตรวจ schema/query โดยไม่อ่าน payload
ตัวเลือก `--apply` ติดตั้งเฉพาะส่วนที่ขาด ใช้ config ของเครื่องพัฒนาในโครงการนี้
ตรวจการตั้งค่าปลายทางก่อนนำสคริปต์ไปใช้เครื่องอื่น

`php tests/erp-confirmation-sync-test.php` ทดสอบ transaction ฝั่ง Store แบบ offline
โดยใช้ SQLite และจำลอง writer: สำเร็จ, กดซ้ำ, MSSQL ล่ม, MySQL commit ล้มเหลว,
retry, payload ผิด และรายการเก่าที่ยืนยันแล้ว

ก่อน production ทดสอบกับสองฐานใน staging: ข้อความไทย/JSON ยาว, คลิกพร้อมกัน,
ตัดการเชื่อมต่อระหว่าง commit และตรวจว่ามี MSSQL หนึ่งแถวต่อ request/item จริง
การทดสอบ offline ไม่ยืนยัน SQL Server driver, locking, สิทธิ์ หรือ schema ของเซิร์ฟเวอร์จริง
