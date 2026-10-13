<?php
	// สถานะสถานประเภท PV (fi_pymt_voucher_hdr.i_type_voucher)
	DEFINE("FI_PV_TYPE_AP", 1);						//เงินเบิกค่าใช้จ่าย (AP ค่าใช้จ่าย + AP จัดซื้อ) 	 
	DEFINE("FI_PV_TYPE_BR", 2);						//เงินยืม (BR) 
	DEFINE("FI_PV_TYPE_BS", 3);						//เงินเบิกเบี้ยเลี้ยงที่พัก (BS-งดใช้) 
	DEFINE("FI_PV_TYPE_BA_BR", 4);					//เบิกเพิ่ม เงินยืม (BA) 	 
	DEFINE("FI_PV_TYPE_BA_BS", 5);					//เบิกเพิ่ม เบิกเบี้ยเลี้ยงที่พัก (BA-งดใช้) 
	DEFINE("FI_PV_TYPE_AP_OTHER", 6);				//ใบนำส่งเงินอื่นๆ (AP-งดใช้) 
	DEFINE("FI_PV_TYPE_APS_MANY", 7);				//เงินเบิกกรณีผู้รับหลายคน (APS) 	 
	DEFINE("FI_PV_TYPE_APS_WELFARE", 8);			//เงินเบิกสวัสดิการ (APS) 
	DEFINE("FI_PV_TYPE_APS_CLEAR_BRT", 9);			//เงินเบิกหักล้างเงินยืมทดรอง (APS) 
	DEFINE("FI_PV_TYPE_APS_CLEAR_BRM", 10);			//เงินเบิกหักล้างเงินยืมหมุนเวียน (APS) 	 
	DEFINE("FI_PV_TYPE_APS_CLEAR_BS", 11);			//เงินเบิกหักล้างเบี้ยเลี้ยงที่พัก (APS-งดใช้) 	 
	
	
	$FI_I_TYPE_VOUCHER_ARR	= array(
		FI_PV_TYPE_AP => "เงินเบิกค่าใช้จ่าย (AP)",
		FI_PV_TYPE_BR => "เงินยืม (BR)",
		FI_PV_TYPE_BS => "เงินเบิกเบี้ยเลี้ยงที่พัก (BS-งดใช้)", 
		FI_PV_TYPE_BA_BR => "เบิกเพิ่ม เงินยืม (BA)",
		FI_PV_TYPE_BA_BS => "เบิกเพิ่ม เบิกเบี้ยเลี้ยงที่พัก (BA-งดใช้)",
		FI_PV_TYPE_AP_OTHER => "ใบนำส่งเงินอื่นๆ (AP-งดใช้) ",
		FI_PV_TYPE_APS_MANY => "เงินเบิกกรณีผู้รับหลายคน (APS)",
		FI_PV_TYPE_APS_WELFARE => "เงินเบิกสวัสดิการ (APS)",
		FI_PV_TYPE_APS_CLEAR_BRT => "เงินเบิกหักล้างเงินยืมทดรอง (APS)",
		FI_PV_TYPE_APS_CLEAR_BRM => "เงินเบิกหักล้างเงินยืมหมุนเวียน (APS)",
		FI_PV_TYPE_APS_CLEAR_BS => "เงินเบิกหักล้างเบี้ยเลี้ยงที่พัก (APS-งดใช้)", 
	);	
	
 	// สถานะเช็คจ่าย (dc_cheque.i_enable)
 	DEFINE("DC_CHQ_I_DISABLED",-1);			//เช็คไม่ใช้งาน กรณีเช็คเก่าปีที่แล้ว ปีนี้งดใช้ 
 	DEFINE("DC_CHQ_I_CANCEL",0);			//เช็คถูกยกเลิก 	 
	DEFINE("DC_CHQ_I_FREE",1);				//เช็คว่าง  - หยิบไปใช้ได้ 	 
	DEFINE("DC_CHQ_I_USED",2);				//เช็คถูกใช้แล้ว / จ่ายเงินแล้ว (PVP) 	 
	DEFINE("DC_CHQ_I_RESERV",3);			//เช็คจองแล้ว - PRE อื่นยังหยิบไปใช้ได้	 


	//สถานะยกเลิก PRE/PV  ตาราง fi_pymt_voucher_hdr (fi_pymt_voucher_hdr.i_is_cancel_pre/i_is_cancel_pv) 
	DEFINE("CM_CANCEL_PRE",1);			//ยกเลิก PRE
	DEFINE("CM_CANCEL_PV",2);			//ยกเลิก PV

	DEFINE("FI_TXT_PRE_HEADER","บริษัท อสมท จำกัด (มหาชน)");
	
	// ประเภทเงินจ่าย ตาราง fi_cash_type (fi_cash_type.i_type)
	DEFINE("CM_PAY_CASH",1);		// เงินสด/ใบสำคัญ
	DEFINE("CM_PAY_CHEQUE",2);		// เช็ค
	DEFINE("CM_PAY_BANK_TRANF",3);	// โอนเงิน
	DEFINE("CM_PAY_BARTER",4);		// แลกเปลี่ยน
	DEFINE("CM_PAY_WITHDRAW",5);	// ใบถอน
	DEFINE("CM_PAY_CLEAR_BR",6);	// ใบสำคัญ 
	DEFINE("CM_PAY_CLEAR_BR1",7);	// ใบสำคัญ หักล้างเงินยืมทดรอง (ปิดสัญญา)
	DEFINE("CM_PAY_CLEAR_BR2",8);	// ใบสำคัญ หักล้างเงินยืมหมุนเวียน (ปิดสัญญา)	
?>
