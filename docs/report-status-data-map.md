# แหล่งข้อมูลสถานะของรายงานฝ่ายพัสดุ

เอกสารนี้สรุปการ์ดรายงานในหน้าต่าง “เข้าหน้ารายงาน” โดยอ้างอิง SQL ที่ระบบใช้งานจริง

## ตารางสถานะหลักของระบบ

| ตาราง | ฟิลด์สำคัญ | ความหมาย |
|---|---|---|
| `NMU_ERP.dbo.sp_tor` | `tor_id`, `tor_status_id`, `i_enabled`, `tor_type_id`, `sp_emp_id`, `i_yyyy` | หัวรายการ PR และสถานะปัจจุบัน |
| `NMU_ERP.dbo.sp_status_hdr` | `sp_status_hdr_id`, `c_code`, `c_name` | Master ชื่อสถานะ/เมนูของ `sp_tor.tor_status_id` และประวัติขั้นตอน |
| `NMU_ERP.dbo.sp_tor_item` | `tor_id`, `sp_status_hdr_id`, `act_date_dt` | ประวัติวันที่ PR ผ่านแต่ละขั้นตอน ใช้ทำรายงานรายเดือน |
| `NMU_ERP.dbo.sp_type_status` | `sp_type_status_id`, `c_name` | Master วิธีดำเนินงานของ `sp_tor.tor_type_id` |
| `NMU_ERP.dbo.sp_tor_contract` | `sp_tor_contract_id`, `sp_tor_id`, `c_code`, `d_doc_date` | การมีสัญญา เลขสัญญา และวันที่สัญญา |
| `NMU_ERP.dbo.sp_tor_hdr_period` | `sp_tor_contract_id`, `sp_tor_hdr_period_id`, `i_is_last` | งวดสัญญา เชื่อมไปขั้นตรวจรับ/เบิก |
| `NMU_ERP.dbo.sp_check_period_hdr` | `sp_tor_hdr_period_id`, `po_working_hdr_id`, `c_code` | ข้อมูลตรวจรับและการเชื่อมใบเบิก |
| `NMU_EIS.dbo.po_working_hdr` | `po_working_hdr_id`, `po_working_begin_hdr_id`, `i_status_last` | สถานะการทำใบเบิก/เบิกจ่าย |
| `NMU_EIS.dbo.po_working_begin_hdr` | `po_working_begin_hdr_id`, `i_sub_status` | สถานะย่อยของใบขอเบิก |
| `NMU_ERP.dbo.sp_tor_event` | `sp_tor_id`, `event_type`, `event_detail`, `event_date`, `sp_status_hdr_name` | ความก้าวหน้าที่ผู้ใช้บันทึก |
| `NMU_ERP.dbo.sp_type_event` | `sp_type_event_id`, `c_name` | Master ประเภทความก้าวหน้า |
| `NMU_ERP.dbo.sp_progress_menu_map` | `menu_code`, `event_type` | ค่าเริ่มต้นประเภทความก้าวหน้าของแต่ละเมนู |

สถานะประวัติที่ใช้กับการจ่ายงาน:

| ID | Code | ชื่อสถานะ |
|---:|---|---|
| 25 | `ST0001` | ลงทะเบียนรับ |
| 26 | `ST0002` | การมอบหมายฝ่ายงาน |
| 24 | `ST0003` | การมอบหมายผู้ปฏิบัติงาน |
| 13 | `ST0004` | ตรวจสอบเอกสาร |
| 20 | `ST0008` | ลงนามในสัญญา |
| 21 | `ST0009` | บันทึกรายละเอียดในสัญญา |

> “จ่ายงานแล้ว” ต้องใช้ `sp_tor_item.sp_status_hdr_id = 24` ไม่ใช่ 25 หรือ 26

## 1. รายงานสถานะการดำเนินงาน

- หน้า: `bi/reports/Report_ChartStatus.php`
- API สรุป: `bi/api/List_Report_ChartStatus.php`
- API รายละเอียด: `bi/api/List_Report_ChartDetail.php`

แหล่งสถานะ:

1. งานเข้าใหม่: วันที่ `sp_tor.d_create`
2. จ่ายงานแล้ว: วันที่แรก (`MIN(act_date_dt)`) ใน `sp_tor_item` ที่ `sp_status_hdr_id = 24`
3. สถานะเมนูปัจจุบัน: `sp_tor.tor_status_id` → `sp_status_hdr.sp_status_hdr_id`
4. สถานะใบขอเบิก: `po_working_begin_hdr.i_sub_status`
5. ความก้าวหน้าล่าสุด: `sp_tor_event.event_type/event_detail` → `sp_type_event`

ข้อควรระวัง: เดือนต้องกรองด้วยช่วงปีงบจริง (`1 ต.ค. ปีก่อน` ถึงก่อน `1 ต.ค. ปีที่เลือก`) ห้ามกรองเฉพาะ `MONTH()` เพราะจะรวมเดือนเดียวกันจากหลายปี

## 2. รายงานวิธีการดำเนินงาน

- หน้า: `bi/reports/Report_ChartTorType_New.php`
- API: `bi/api/List_RepBITorType.php`

แหล่งสถานะ:

1. วิธีดำเนินงาน: `sp_tor.tor_type_id` → `sp_type_status`
2. รอดำเนินการ/อยู่ระหว่างดำเนินการ: คำนวณจาก `sp_tor.tor_status_id`
3. บริหารสัญญา: คำนวณจาก `sp_tor_contract` และ `tor_status_id`
4. ตรวจรับ: ต้องมีรายการ `sp_check_period_hdr` แล้ว (การมีสัญญาอย่างเดียวยังเป็นบริหารสัญญา)
5. ขออนุมัติเบิกจ่าย: `sp_check_period_hdr.po_working_hdr_id` เชื่อมถึง `po_working_hdr` แล้ว แต่ `i_status_last < 11`
6. เบิกจ่ายแล้ว: `po_working_hdr.i_status_last >= 11`
7. ยกเลิก: `sp_tor.i_enabled = 2`

`status_group_id` ที่ API คืนเป็นค่าคำนวณใน PHP ไม่ได้จัดเก็บเป็นคอลัมน์ในฐานข้อมูล

รหัสกลุ่มที่รายงานใช้หลังปรับแก้: 8 รอดำเนินการ, 9 อยู่ระหว่างดำเนินการ, 10 บริหารสัญญา, 11 ตรวจรับ, 12 ขออนุมัติเบิกจ่าย, 13 เบิกจ่ายแล้ว และ 14 ยกเลิก โดย `14` แยกจาก `9` ชัดเจน

## 3. รายงานตามหน่วยงาน

- URL compatibility: `Report_ChartByDept.html`
- ปลายทางจริง: `Report_ChartTorType_New.php`

จึงใช้ตารางและสูตรสถานะชุดเดียวกับ “รายงานวิธีการดำเนินงาน” ต่างกันที่ผู้ใช้กรองส่วนงานจาก `sp_tor.dc_cost2_id` ซึ่งเชื่อม `NMU_DATACENTER.dbo.dc_cost`

## 4. รายงานตามผู้รับผิดชอบ

- URL compatibility: `Report_ChartByEmp.html`
- ปลายทางจริง: `Report_ChartStatus.php`

จึงใช้ตารางและสูตรสถานะชุดเดียวกับ “รายงานสถานะการดำเนินงาน” และกรองผู้รับผิดชอบด้วย `sp_tor.sp_emp_id` → `sp_emp.sp_emp_id`

## 5. รายงาน KPI

- หน้า: `bi/reports/Key_Performance_Indicator.php`
- API: `bi/api/List_Key_Performance_Indicator.php`

KPI “ผ่าน/ไม่ผ่าน” **ไม่ได้เก็บเป็นสถานะในตาราง** แต่คำนวณทุกครั้งจาก:

- วันที่เริ่ม: `sp_tor.d_egp_date`
- วันที่สิ้นสุด: `sp_tor_contract.d_doc_date`
- วันหยุด: `sp_holiday_dtl.d_holiday`
- วิธีดำเนินงาน: `sp_tor.tor_type_id`
- ประเภทสัญญา: `sp_tor.i_type_contract`
- ผู้รับผิดชอบ: `sp_tor.sp_emp_id`

สูตรใช้จำนวนวันทำการและเกณฑ์ 26/40/61 วัน (KPI2) หรือ 60/75/100 วัน (KPI3) แล้วสร้างข้อความ `ผ่าน`/`ไม่ผ่าน` ใน SQL `CASE`

รายงาน KPI นับเฉพาะ PR ที่ใช้งานอยู่ (`i_enabled = 1`), ไม่ใช่รายการ no-TOR/รายการลูก, มีวันที่ e-GP และวันที่ e-GP ต้องไม่อยู่หลังวันที่สัญญา รายการวันที่ผิดลำดับจะไม่นำมาคิดเป็น “ไม่ผ่าน” เพราะเป็นปัญหาคุณภาพข้อมูล ไม่ใช่ผลการปฏิบัติงาน

## ข้อเสนอสำหรับการแก้รายงานให้ตรงกัน

1. ใช้ `sp_tor_item` เป็นแหล่งวันที่ประวัติขั้นตอน และยึด ID จาก `sp_status_hdr` จริง
2. ใช้ `sp_tor.tor_status_id` เฉพาะสถานะปัจจุบัน ไม่ใช้แทนวันที่ผ่านขั้นตอน
3. ใช้ `sp_tor_event` เฉพาะความก้าวหน้าที่ผู้ใช้บันทึก ไม่ใช้แทน workflow หลัก
4. สถานะเบิกต้องอ้าง `po_working_begin_hdr.i_sub_status` และ `po_working_hdr.i_status_last`
5. สถานะคำนวณ เช่น `status_group_id`, `bill_step`, KPI ควรรวมสูตรไว้ที่ API/ฟังก์ชันกลางชุดเดียว เพื่อไม่ให้แต่ละรายงานตีความต่างกัน

หมายเหตุด้านคำเรียก: ใน `Report_ChartStatus` คำว่า “จ่ายงานแล้ว” หมายถึง “หัวหน้าฝ่ายมอบหมายผู้ปฏิบัติงานแล้ว” (`status 24`) ไม่ได้หมายถึงเบิกจ่ายเงินแล้ว
