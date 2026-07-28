<?php
//เป็นรายการระดับล่างสุด (1=เป็น, 2=ไม่เป็น)
define("DC_LAST_YES", 1);
define("DC_LAST_NO", 2);

// สถานะของเอกสารประกอบค่าใช้จ่าย
// dc_exp_doc.i_exp_type
define("DC_EXP_DOC_EXP_TYPE_SPECIAL", 1); //ใบรายจ่ายพิเศษ
define("DC_EXP_DOC_EXP_TYPE_OTHER", 2); //อื่นๆ

//บัญชีลูกหนี้การค้า
define("DC_ACC_DEBT_CODE", '1104010101'); // ลูกหนี้การค้า

define("DC_BANK_ACC_MAIN_NONE", 5);    // ไม่กำหนด

// สถานะธนาคารหลัก (dc_bank.i_main)
define("DC_BANK_I_MAIN_NONE", 5);         //ไม่กำหนด
define("DC_BANK_I_MAIN_BOOK", 1);         //กำหนดเป็นธนาคารหลัก เมนูสมุดบัญชีธนาคาร
define("DC_BANK_I_MAIN_EMP", 2);         //กำหนดเป็นธนาคารหลัก เมนูข้อมูลเลขที่บัญชีเงินฝาก (ประวัติพนักงาน)
define("DC_BANK_I_MAIN_CNT", 3);    //กำหนดเป็นธนาคารหลัก เมนูข้อมูลเลขที่บัญชีเงินฝาก (ลูกหนี้/เจ้าหนี้)
define("DC_BANK_I_MAIN_ALL", 4);         //กำหนดเป็นธนาคารหลัก ทุกเมนู

$CONF_I_BANK_MAIN    = array(
    DC_BANK_I_MAIN_NONE => "ไม่กำหนด",
    DC_BANK_I_MAIN_BOOK => "กำหนดเป็นธนาคารหลัก เมนูสมุดบัญชีธนาคาร",
    DC_BANK_I_MAIN_EMP => "กำหนดเป็นธนาคารหลัก เมนูข้อมูลเลขที่บัญชีเงินฝาก (ประวัติพนักงาน)",
    DC_BANK_I_MAIN_CNT => "กำหนดเป็นธนาคารหลัก เมนูข้อมูลเลขที่บัญชีเงินฝาก (ลูกหนี้/เจ้าหนี้)",
    DC_BANK_I_MAIN_ALL => "กำหนดเป็นธนาคารหลัก ทุกเมนู"
);

// สถานะประเภทเงินฝากหลัก (dc_bank_deposit_type.i_main)
define("DC_BANK_DEPOSIT_TYPE_I_MAIN_NONE", 5);         //ไม่กำหนด
define("DC_BANK_DEPOSIT_TYPE_I_MAIN_BOOK", 1);         //กำหนดเป็นประเภทเงินฝากหลัก เมนูสมุดบัญชีธนาคาร
define("DC_BANK_DEPOSIT_TYPE_I_MAIN_EMP", 2);         //กำหนดเป็นประเภทเงินฝากหลัก เมนูข้อมูลเลขที่บัญชีเงินฝาก (ประวัติพนักงาน)
define("DC_BANK_DEPOSIT_TYPE_I_MAIN_CNT", 3);    //กำหนดเป็นประเภทเงินฝากหลัก เมนูข้อมูลเลขที่บัญชีเงินฝาก (ลูกหนี้/เจ้าหนี้)
define("DC_BANK_DEPOSIT_TYPE_I_MAIN_ALL", 4);         //กำหนดเป็นประเภทเงินฝากหลัก ทุกเมนู

$CONF_I_BANK_DEPOSIT_TYPE_MAIN    = array(
    DC_BANK_DEPOSIT_TYPE_I_MAIN_NONE    => "ไม่กำหนด",
    DC_BANK_DEPOSIT_TYPE_I_MAIN_BOOK    => "กำหนดเป็นประเภทเงินฝากหลัก เมนูสมุดบัญชีธนาคาร",
    DC_BANK_DEPOSIT_TYPE_I_MAIN_EMP        => "กำหนดเป็นประเภทเงินฝากหลัก เมนูข้อมูลเลขที่บัญชีเงินฝาก (ประวัติพนักงาน)",
    DC_BANK_DEPOSIT_TYPE_I_MAIN_CNT        => "กำหนดเป็นประเภทเงินฝากหลัก เมนูข้อมูลเลขที่บัญชีเงินฝาก (ลูกหนี้/เจ้าหนี้)",
    DC_BANK_DEPOSIT_TYPE_I_MAIN_ALL        => "กำหนดเป็นประเภทเงินฝากหลัก ทุกเมนู"
);

// สถานะเช็คจ่าย (dc_cheque.i_status)
define("DC_CHEQUE_FREE", 1);                 //1 ว่าง (พึ่ง GEN)
define("DC_CHEQUE_MAP_EXPENSE", 2);         //2 ระบุ - อยู่ระหว่างระบุฎีกากับเลขที่เช็ค
define("DC_CHEQUE_MAP_BANK", 3);             //3 ตรวจ - อยู่ระหว่างตรวจสอบ Bank Statement
define("DC_CHEQUE_PAID", 4);                 //4 จ่าย - Confirm ยอดเช็คทุกฎีกากับ Bank Statement
define("DC_CHEQUE_CANCEL", 9);                 //9 ยกเลิก

$CONF_I_STATUS_CHEQUE    = array(
    DC_CHEQUE_FREE => "ว่าง",
    DC_CHEQUE_MAP_EXPENSE => "ระบุ",
    DC_CHEQUE_MAP_BANK => "ตรวจ",
    DC_CHEQUE_PAID => "จ่าย",
    DC_CHEQUE_CANCEL => "ยกเลิก"
);

define("DC_EXP_BG_ITYPE_EPHYS", 1);
define("DC_EXP_BG_ITYPE_VISIONNET", 2);

$CONF_I_TYPE_DC_BG    = array(
    DC_EXP_BG_ITYPE_EPHYS => "e-PHIS",
    DC_EXP_BG_ITYPE_VISIONNET => "Vision Net"
);

// สำหรับรายงานรายละเอียดเงินฝากธนาคาร (dc_bank_deposit_type.i_type)
define("DC_BANK_DEPOSIT_TYPE_ITYPE_SAVING", 1);     //ออมทรัพย์
define("DC_BANK_DEPOSIT_TYPE_ITYPE_DAILY", 2);         //กระแสรายวัน 
define("DC_BANK_DEPOSIT_TYPE_ITYPE_FIXED3M", 3);         //ฝากประจำ 1-3เดือน
define("DC_BANK_DEPOSIT_TYPE_ITYPE_FIXED12M", 4);         //ฝากประจำ 3-12 เดือน
define("DC_BANK_DEPOSIT_TYPE_ITYPE_FIXED_YEARS", 5);         //ฝากประจำ 12 เดือน ++

$CONF_I_BANK_DEPOSIT_TYPE_ITYPE    = array(
    DC_BANK_DEPOSIT_TYPE_ITYPE_SAVING    => "ออมทรัพย์",
    DC_BANK_DEPOSIT_TYPE_ITYPE_DAILY    =>  "กระแสรายวัน",
    DC_BANK_DEPOSIT_TYPE_ITYPE_FIXED3M    =>  "ฝากประจำที่ไม่เกิน 3 เดือน",
    DC_BANK_DEPOSIT_TYPE_ITYPE_FIXED12M    =>  "ฝากประจำที่มากกว่า 3 เดือน แต่ไม่เกิน 1 ปี",
    DC_BANK_DEPOSIT_TYPE_ITYPE_FIXED_YEARS    =>  "ฝากประจำที่เกิน 1 ปี"
);

// กองทุนสิทธิ์การรักษา (dc_debtor_claim.i_fund)
define("DC_FUND_HEALTH", 1);            // กองทุนประกันสุขภาพถ้วนหน้า
define("DC_FUND_AGENCY", 2);            // กองทุนต้นสังกัด
define("DC_FUND_INSURANCE", 3);         // กองทุนประกันสังคม
define("DC_FUND_FAX_CLAIM", 4);         // กองทุน Fax Claim

$CONF_I_FUND_TYPE = array(
    DC_FUND_HEALTH          => "กองทุนประกันสุขภาพถ้วนหน้า",
    DC_FUND_AGENCY          => "กองทุนต้นสังกัด",
    DC_FUND_INSURANCE       => "กองทุนประกันสังคม",
    DC_FUND_FAX_CLAIM       => "กองทุน Fax Claim",
);

define ( "DC_PO_BG_YEAR_START" , 2017 ) ; //start year 2019
define ( "DC_PO_BG_YEAR_END" , (intval ( date ( 'Y' ) ) + 2 ) ) ; //end year +2