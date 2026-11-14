# Edit Contract Budget - Module

นี่คือ module สำหรับแก้ไขงบประมาณของรายการสัญญา

## ไฟล์ที่สร้าง

### 1. Main Files
- **editContractBudget.php** - หน้าหลักสำหรับแก้ไขงบประมาณสัญญา

### 2. UI Files (editBudgetUi folder)
- **FormGrid.js** - แสดงรายการสัญญาเป็น Grid
- **FormAdd.js** - ฟอร์มแก้ไขงบประมาณสัญญา (มี 2 tabs)
- **stores.js** - ส่วนที่กำหนด Store สำหรับเก็บข้อมูล

### 3. PHP Files (editBudgetUi/php folder)
- **mn_editContractBudgetController.php** - Controller สำหรับจัดการข้อมูล
- **CreateTable_sp_tor_contract_budget_reserve.sql** - SQL script สำหรับสร้างตาราง

## การติดตั้ง

### ขั้นตอนที่ 1: สร้างฐานข้อมูล
1. เปิด SQL Server Management Studio
2. รัน SQL script: `CreateTable_sp_tor_contract_budget_reserve.sql`

### ขั้นตอนที่ 2: เพิ่มลิงก์ในเมนู
ไปที่หน้า contract.php และเพิ่มลิงก์ชี้ไปยัง `editContractBudget.php`

### ขั้นตอนที่ 3: ทดสอบ
1. เปิด URL: `http://[your-server]/procure/sp/editContractBudget.php`
2. ควรจะเห็นรายการสัญญา
3. คลิกปุ่มแก้ไขเพื่อแก้ไขงบประมาณ

## โครงสร้าง

### Frontend (ExtJS)
```
editContractBudget.php
  ├── FormGrid.js - แสดงรายการสัญญา
  ├── FormAdd.js - ฟอร์มแก้ไขงบประมาณ
  │   ├── Tab 1: ข้อมูลสัญญา (อ่านอย่างเดียว)
  │   └── Tab 2: แก้ไขงบประมาณ
  └── stores.js - ข้อมูล Store
```

### Backend (PHP)
```
mn_editContractBudgetController.php
  ├── LOAD_CONTRACT_LIST - โหลดรายการสัญญา
  ├── LOAD_BUDGET_RESERVE - โหลดงบประมาณสัญญา
  └── SAVE_BUDGET_RESERVE - บันทึกงบประมาณสัญญา
```

### Database
```
sp_tor_contract_budget_reserve
  ├── sp_tor_contract_budget_reserve_id (PK)
  ├── sp_tor_contract_id (FK)
  ├── f_reserve_money (จำนวนงบประมาณ - หนึ่ง)
  ├── f_budget (จำนวนงบประมาณ - สอง)
  ├── i_enable (สถานะ)
  ├── c_create_by, d_create_dt (สร้าง)
  └── c_last_modify_by, d_last_modify_dt (แก้ไข)
```

## Functionality

### Grid View
- แสดงรายการสัญญาทั้งหมด
- คอลัมน์: เลขที่สัญญา, ผู้ขาย, แหล่งเงิน, หมวดค่าใช้จ่าย, จำนวนเงิน, วันที่สัญญา
- คลิกปุ่มแก้ไขเพื่อเปิด Form

### Form View (แก้ไข)

#### Tab 1: ข้อมูลสัญญา (Read-only)
- เลขที่สัญญา
- ผู้ขาย/ผู้รับจ้าง
- แหล่งเงิน
- หมวดค่าใช้จ่าย
- จำนวนเงินทั้งสิ้น

#### Tab 2: แก้ไขงบประมาณ
- **จำนวนงบประมาณ (หนึ่ง)** - ฟิลด์ที่แก้ไขได้
- **จำนวนงบประมาณ (สอง)** - ฟิลด์ที่แก้ไขได้
- **งบประมาณคงเหลือ** - แสดงผลอัตโนมัติ (แสดงอย่างเดียว)
- **แก้ไขเมื่อ** - วันที่แก้ไขล่าสุด

### ปุ่ม
- **บันทึกข้อมูล** - บันทึกงบประมาณ (ต้องยืนยันโดยพิมพ์ "ยืนยัน")
- **ย้อนกลับ** - กลับไปที่รายการสัญญา

## Notes
- ระบบใช้ Ext.JS สำหรับ UI
- ใช้ AJAX สำหรับการสื่อสารกับ Backend
- ข้อมูลจะถูกยืนยันก่อนบันทึก
