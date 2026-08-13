<?php
    // ข้อมูลระดับของข้อมูลหลักสินค้า
    define("TREE_LEVEL_START","0"); // เริ่มที่ Lv0
    define("TREE_LEVEL_END", "3"); // สิ้นสุดที่ Lv3
    define("TREE_LEVEL_MAP_ACC", "1"); // สามารเลือกรายการบัญชีได้ที่ Lv1 

    // ข้อมูลสิ้นค้าเริ่มที่รหัส 90 (dc_inv_type->c_code)
    define("CODE_INVENNTORY","90"); // c_code = 90, c_name = พัสดุ(วัสดุ)

    // ประเภทสินทรัพย์ (dc_inv_type->asset_type)
    define("ASSET_TYPE_LAND"	, 1); // ที่ดิน
    define("ASSET_TYPE_EQUIP"	, 2); // อาคารและอุปกรณ์
    define("ASSET_TYPE_VEHICLE"	, 3); // พาหนะ

    // สถานะรายการ SD (am_tran_rg_hdr.i_is_success)
    define("ASSET_STATUS_WAIT", "0"); //  รอดำเนินการ
    define("ASSET_STATUS_SUCCESS", "1"); // สมบูรณ์

    // คิดค่าเสื่อม am_tran_rg_dtl.i_is_expense
    define("ASSET_CAL_YES", "0"); // คำนวณค่าเสื่อม
    define("ASSET_CAL_NO", "1"); // ไม่คำนวณค่าเสื่อม

    // สถานะลงบัญชี gl_depre_hdr.i_is_posted
    define("ASSET_CAL_POST_NO", "0"); // ยังไม่ลงบัญชี
    define("ASSET_CAL_POST_YES", "1"); // ลงบัญชี

    // ข้อมูลประเภทรายการเคลื่อนไหว(ระบบสินค้า) inv_tran_type
    define("AM_TRAN_TYPE_1", 1); //ตัดจำหน่าย
    define("AM_TRAN_TYPE_2", 2); //ปรับลด
    define("AM_TRAN_TYPE_3", 3); //ปรับเพิ่ม
    define("AM_TRAN_TYPE_4", 4); //เบิกจ่าย
    define("AM_TRAN_TYPE_5", 5); //จัดซื้อ
    define("AM_TRAN_TYPE_6", 6); //โอนย้าย
    define("AM_TRAN_TYPE_7", 7); //รับคืน
    define("AM_TRAN_TYPE_8", 8); //รัับสินค้าคงคลัง
    define("AM_TRAN_TYPE_9", 9); //เริ่มต้นระบบ
?>