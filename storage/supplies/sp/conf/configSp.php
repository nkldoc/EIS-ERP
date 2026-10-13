<?php
  define("CHECKING_WAITING_BG",7);
  define("CHECKING_WITHDRAW",8);
$CONF_CONTRACT_STATUS = array( 0 => 'เริ่มทำสัญญา',
    1 => 'จัดทำ/ร่าง สัญญา',
    2 => 'ลงนามในสัญญาหรือข้อตกลงเป็นหนังสือ',
    3 => 'บันทึกใบ PO (สัญญาย่อย)',
    4 => 'ลงนามในสัญญา PO (สัญญาย่อย)',
    5 => "ส่งมอบงาน",
    6 => "ตรวจรับพัสดุ/ครุภัณฑ์",
    CHECKING_WAITING_BG  => "รอเงินงบประมาณที่มีอยู่จริง/ตรวจรับพัสดุ/ครุภัณฑ์",
    CHECKING_WITHDRAW => "ส่งเบิกบันทึกใบขอเบิก",
    10 => "ยกเลิก"
);


/**		WHEN i_contract_status = 1 THEN 'จัดทำ/ร่าง สัญญา'
		WHEN i_contract_status = 2 THEN 'ลงนามในสัญญาหรือข้อตกลงเป็นหนังสือ'
		WHEN i_contract_status = 3 THEN 'บันทึกใบ PO (สัญญาย่อย)'
		WHEN i_contract_status = 4 THEN 'ลงนามในสัญญา PO (สัญญาย่อย)'
		WHEN i_contract_status = 5 THEN 'ปิดโดยสมบูรณ์'*/