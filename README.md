# EIS-ERP
D:\EIS-ERP\
├── public\
│   ├── index.php
│   ├── supplies\
│   ├── assets\
│   └── api\
├── app\
│   ├── Controllers\
│   ├── Services\
│   ├── Repositories\
│   └── Config\
├── storage\
│   ├── logs\
│   ├── sessions\
│   └── cache\
└── web.config
ไฟล์สำคัญ:
[index.php](D:\\EIS-ERP\\public\\index.php) — คืนค่า JSON สำหรับตรวจสอบสถานะระบบ
[web.config](D:\\EIS-ERP\\web.config) — ตั้งค่า PHP FastCGI ผ่าน C:\PHP\php-cgi.exe
Rewrite URL ทั้งหมดเข้าสู่ public
ป้องกันการเข้าถึง app และ storage โดยตรง
ปิด directory browsing
ป้องกัน dot-files และไฟล์ .config, .ini, .log, .sql
รองรับทุก HTTP verb สำหรับ API
ผลตรวจสอบ:
web.config เป็น XML ที่ถูกต้อง
index.php ผ่านการตรวจ syntax
ทดลองรันแล้วได้ JSON สำเร็จ
ยืนยันพบ C:\PHP\php-cgi.exe
รายการไฟล์และโฟลเดอร์ครบตามคำขอ
IIS ต้องติดตั้งและเปิดใช้งาน CGI/FastCGI กับ URL Rewrite Module จึงจะใช้การตั้งค่านี้ได้ครบถ้วนครับ

ตั้งค่า /supplies ต่อเรียบร้อยแล้ว:
เพิ่ม [public/supplies/index.php](D:\\EIS-ERP\\public\\supplies\\index.php)
PHP syntax ถูกต้อง
https://dev-eis.nmu.ac.th/supplies redirect ไป /supplies/ ตามมาตรฐาน
/supplies/ ตอบกลับ 200 OK
Content-Type เป็น application/json; charset=utf-8
/app/ และ /storage/ ตอบ 404 ยืนยันว่าเข้าถึงโดยตรงไม่ได้
HTTPS certificate ผ่านการตรวจสอบจากเครื่องนี้
ผลตอบกลับของ Supplies:
{
  "success": true,
  "application": "EIS-ERP",
  "module": "supplies",
  "message": "EIS-ERP Supplies module is running.",
  "time": "..."
}
URL พร้อมใช้งาน: https://dev-eis.nmu.ac.th/supplies/
