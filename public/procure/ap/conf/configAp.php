<?php
	//**************************************************** DC_CNT ****************************************************
 	//========= สถานะสถานประกอบการ (dc_cnt.i_branch) =========
	define("BOOK_BRANCH_HEADQUARTER", 1);	//สำนักงานใหญ่
	define("BOOK_BRANCH", 2);				//สาขา
	define("BOOK_BRANCH_OTHER", 3);			//อื่นๆ
	
	$CONF_I_BRANCH	= array(
		BOOK_BRANCH_HEADQUARTER => "สำนักงานใหญ่",
		BOOK_BRANCH => "สาขา",
		BOOK_BRANCH_OTHER => "อื่นๆ"
	);	
	
	//****************************************** DC_CREDITOR_TYPE ******************************************
	//========= CONFIG ประเภทเจ้าหนี้/ลูกหนี้  (เดิมคือตาราง dc_creditor_type และมีค่า 1,3,4 เหมือนปัจจุบัน แต่1จะรวมทั้งเจ้าหนี้และลูกหนี้ ) =========
	define("PERSON_DEBTOR",1); 		//ลูกหนี้ ข้อมูลจากตาราง dc_debtor
	define("PERSON_CREDITOR",2); 	//เจ้าหนี้ ข้อมูลจากตาราง dc_creditor
	define("PERSON_EMP",3);	   		//พนักงาน ข้อมูลจากตาราง dc_emp
	define("PERSON_OTHER",4);   	//เจ้าหนี้ทั่วไป ข้อมูลหลักไม่มี Key ที่ตารางใบเบิก AP/APS
	
	//========= ประเภทเจ้าหนี้ ใช้สำหรับบันทึกใบเบิก AP/APS =========
	$ARR_CREDITOR_TYPE_4KEY = array(
			PERSON_CREDITOR=>"เจ้าหนี้",
			PERSON_EMP=>"พนักงาน",
			PERSON_OTHER=>"เจ้าหนี้ทั่วไป"
	);
	//**************************************************** AP + APS + BR ****************************************************
	//========= สถานะใบเบิก (i_is_status)
	define("FI_BR_I_IS_STATUS_1",-1);
	define("FI_BR_I_IS_STATUS0",0);
	define("FI_BR_I_IS_STATUS1",1);
	define("FI_BR_I_IS_STATUS2",2);
	define("FI_BR_I_IS_STATUS3",3);
	define("FI_BR_I_IS_STATUS4",4);
	define("FI_BR_I_IS_STATUS5",5);
	define("FI_BR_I_IS_STATUS6",6);
	define("FI_BR_I_IS_STATUS7",7);
	define("FI_BR_I_IS_STATUS8",8);
	define("FI_BR_I_IS_STATUS9",9);
	define("FI_BR_I_IS_STATUS10",10);
	define("FI_BR_I_IS_STATUS11",11);
	define("FI_BR_I_IS_STATUS12",12);
	
	$pay_status_arr = Array (   FI_BR_I_IS_STATUS_1 =>"ยกเลิก"
			,FI_BR_I_IS_STATUS0=>"ส่งกลับ"
			,FI_BR_I_IS_STATUS1=> "รอทำใบสำคัญจ่าย/รอส่งเบิกพร้อมเงินเดือน"
			,FI_BR_I_IS_STATUS2=> "รอจ่าย"
			,FI_BR_I_IS_STATUS3=> "จ่ายเงิน "
			,FI_BR_I_IS_STATUS4=> "รออนุมัติ"
			,FI_BR_I_IS_STATUS5=> "ส่งเบิกพร้อมเงินเดือน "
			,FI_BR_I_IS_STATUS6=> "รอทำใบสำคัญจ่าย(แลกเปลี่ยน)"
			,FI_BR_I_IS_STATUS7=> "ทำใบสำคัญจ่ายสมบูรณ์(แลกเปลี่ยน)"
			,FI_BR_I_IS_STATUS8=> "รอสวัสดิการตรวจสอบ"
			,FI_BR_I_IS_STATUS9=> "ส่งกลับโดยสวัสดิการตรวจสอบ"
			,FI_BR_I_IS_STATUS10=> "รอทำรายการหักล้าง(BR/BS)"
			,FI_BR_I_IS_STATUS11=> "ทำรายการหักล้าง(BR/BS)แล้ว "
			,FI_BR_I_IS_STATUS12=> "อยู่ระหว่างจัดทำใบสำคัญจ่าย "
			,''=> "ทั้งหมด" );	
			
	//**************************************************** AP + APS ****************************************************
 	//========= ค่าปรับที่ใบเบิก (.i_is_drpenalty)=========
	DEFINE("PNT_NO",'9');
	DEFINE("PNT_CAL_TAX",'1');
	DEFINE("PNT_NON_TAX",'4'); 
	DEFINE("PNT_NOT_CAL_TAX",'2');
	DEFINE("PNT_PAID",'3');
	
	$PENALTY_ARR = array(PNT_NO=>"ไม่มีค่าปรับ"
			,PNT_CAL_TAX=>"ค่าปรับนำไปหักในการคำนวณ(หักภาษี)"// (มีผลกับจำนวนเงินภาษีหัก ณ ที่จ่ายและจำนวนเงินจ่ายสุทธิ)"
			,PNT_NON_TAX=>"ค่าปรับนำไปหักในการคำนวณ(ไม่หักภาษี)"//ไม่มีผลกับจำนวนเงินภาษีหัก ณ ที่จ่ายและจำนวนเงินจ่ายสุทธิ
			,PNT_NOT_CAL_TAX=>"ค่าปรับ ไม่นำไปหักในการคำนวณ"
			,PNT_PAID=>"ชำระค่าปรับแล้ว ซึ่งไม่นำไปหักในการคำนวณ"
	);
	
	// 	ประเภทการหักภาษี ณ ที่จ่าย	i_type_whtax = ประเภทการหักภาษี ณ ที่จ่าย (1=หักตามอัตราภาษี,2=หักตามอัตราก้าวหน้า,3=หักตามเกณฑ์มาตรา 48,4=หัก ณ ที่จ่ายจากบำเหน็จ,5=ไม่หัก ณ ที่จ่าย)
 
	DEFINE("ITYPEWHTAX1",'1');
	DEFINE("ITYPEWHTAX2",'2');
	DEFINE("ITYPEWHTAX3",'3');
	DEFINE("ITYPEWHTAX4",'4');
	DEFINE("ITYPEWHTAX5",'5');
	
	$WHTAX_TXT = array( ITYPEWHTAX1 => "หักตามอัตราภาษี",
						ITYPEWHTAX2  => "หักตามอัตราก้าวหน้า",
						ITYPEWHTAX3 => "หักตามเกณฑ์มาตรา 48",
						ITYPEWHTAX4 => "หัก ณ ที่จ่ายจากบำเหน็จ",
						ITYPEWHTAX5 => "ไม่หัก ณ ที่จ่าย" 
					);



 	
	//**************************************************** AP **************************************************** 
 	//========= (fi_pay_tran_hdr.i_pay_type) ==== Art Add =====
	DEFINE("AP_EXPENSE",1);		//ใบเบิก AP ค่าใช้จ่าย
	DEFINE("AP_INSURANCE",2); 	//ใบเบิก AP ประกันภัย
	DEFINE("AP_PURCHASE",3);	//ใบเบิก AP จัดซื้อ จัดจ้าง
	DEFINE("AP_SALARY",5);		//ใบเบิก AP ระบบเงินเดือนค่าแรง
	DEFINE("AP_COMMISSION",6);	//ใบเบิก AP คอมมิชชั่น
	DEFINE("AP_RETURN",7);		//ใบเบิก AP ส่งคืนเงิน
	DEFINE("AP_DECREASE",8);	//ใบเบิก AP ลดหนี้
	DEFINE("AP_BANK",9);		//ใบเบิก AP ค่าธรรมเนียมธนาคาร
	
	$AP_NAME_ARR  = array(""=>"ทั้งหมด",AP_EXPENSE=>"รายการค่าใช้จ่าย",AP_INSURANCE=>"ประกันภัย"
							,AP_PURCHASE=>"จัดซื้อจัดจ้าง",AP_SALARY=>"เงินเดือน/ค่าแรง",AP_COMMISSION=>"ค่าคอมมิชชั่น"
							,AP_RETURN=>"ส่งคืนเงิน",AP_DECREASE=>"ลดหนี้",AP_BANK=>"ค่าธรรมเนียมธนาคาร");
	
	//========= (fi_pay_tran_hdr.i_is_barter)
	define("AP_BARTER_CHANGE", 1);
	define("AP_BARTER_SETOFF", 2);
	define("AP_BARTER_MY_INCOME", 3); 
	define("AP_BARTER_NO", 9);
	
	$ap_barter_arr = array(AP_BARTER_NO=>"ไม่ระบุ", AP_BARTER_CHANGE=>"แลกเปลี่ยน", AP_BARTER_SETOFF=>"หักลบ/กลบหนี้", AP_BARTER_MY_INCOME=>"เบิกเป็นเงินได้ของตนเอง");
	
	//========= (fi_pay_tran_hdr.i_is_salary)
	define("AP_SALARY_IN", 1);
	define("AP_SALARY_NO", 2);
	
	$ap_salary_arr = array(AP_SALARY_IN=>"เข้า", AP_SALARY_NO=>"ไม่เข้า");
	
	//========= (fi_pay_tran_hdr.i_send_tax)
	define("AP_SEND_TAX_YES", 1);
	define("AP_SEND_TAX_NO", 2);
	
	$ap_send_tax_arr = array(AP_SEND_TAX_YES=>"นำส่งแล้ว", AP_SEND_TAX_NO=>"รอนำส่ง");
	
	// สถานะสำหรับจัดทำใบรายจ่ายพิเศษ (i_is_receiver_diff)
	define("AP_IS_RECEIVER_DIFF1", 1);	//จ่ายคืนกรณีผู้ทำงานสำรองจ่ายเงินไปก่อน (ผู้รับ คือ ผู้สำรองจ่าย)
	define("AP_IS_RECEIVER_DIFF2", 2);	//กรณีผู้รับมอบฉันทะเป็นผู้รับเงิน
	define("AP_IS_RECEIVER_DIFF3", 3);	//จ่ายให้เจ้าหนี้โดยตรง (ผู้รับ คือ เจ้าหนี้)

	$ap_is_receiver_diff_arr	= array(
			AP_IS_RECEIVER_DIFF1 => "จ่ายคืนกรณีผู้ทำงานสำรองจ่ายเงินไปก่อน (ผู้รับ คือ ผู้สำรองจ่าย)",
			AP_IS_RECEIVER_DIFF2 => "กรณีผู้รับมอบฉันทะเป็นผู้รับเงิน",
			AP_IS_RECEIVER_DIFF3 => "จ่ายให้เจ้าหนี้โดยตรง (ผู้รับ คือ เจ้าหนี้)"
	);		
	
	//**************************************************** BR ****************************************************
	//========= สถานะแสดงยอดคงค้าง ของใบยืมเงิน (fi_br.i_chk) =========
	DEFINE("BR_CHECK_NO",0);			//ยังไม่ระบุ
	DEFINE("BR_CHECK_NOT_SUM",1);	 	//ไม่นับเป็นยอดคงค้าง
	DEFINE("BR_CHECK_SUM",2);			//นับเป็นยอดคงค้าง
	
	$BR_STATUS_CHK_ARR 	= Array (BR_CHECK_NO=>"ไม่ระบุ",BR_CHECK_NOT_SUM=> "ไม่นับเป็นยอดคงค้าง",BR_CHECK_SUM=> "นับเป็นยอดคงค้าง");
	
	//========= (fi_br.i_is_revolve)
	define("FI_BR_REVOLVE_TRUE", 	1); // เงินยืมหมุนเวียน
	define("FI_BR_REVOLVE_FALSE", 	2); // เงินยืมทดรองจ่าย
	$fi_br_revolve_arr = array(FI_BR_REVOLVE_TRUE=>"เงินยืมหมุนเวียน", FI_BR_REVOLVE_FALSE=>"เงินยืมทดรองจ่าย"); 
 	
 	
 	//========= (fi_br.i_return_in)
	define("RETURNID0",'0');
	define("RETURNID10",'10');
	define("RETURNID5",'11');
	define("RETURNID30",'12');
		
	$inDBreturnIn	= array('0' => '0' ,	'10'	=> '1'  ,'15'	=> '2'	, '30'=>'3');
	
	$outDBreturnIn	= array('0' => '0' ,	'1'		=> '10' , '2'   => '15' , '3'=>'30');  

 	//========= (fi_br.i_closed) สถานะสัญญา
	define("FI_BR_CONTRACT_CLOSE", 	1); // ปิดสัญญา
	define("FI_BR_CONTRACT_OPEN", 	2); // เปิดสัญญา
	
	$fi_br_contract_arr = array(FI_BR_CONTRACT_CLOSE=>"ปิดสัญญา", FI_BR_CONTRACT_OPEN=>"เปิดสัญญา"); 


	//**************************************************** APS **************************************************** 
	//ประเภทใบเบิก (FI_BR_GRP_HDR.i_pay_type)
	define("APS_I_PAY_TYPE_MANY", 				1);
	define("APS_I_PAY_TYPE_WELFARE",			2);
	define("APS_I_PAY_TYPE_CLEAR_BRT", 			3);
	define("APS_I_PAY_TYPE_CLEAR_BRM_IN_YEAR",	4);
	define("APS_I_PAY_TYPE_CLEAR_BRM_ENDYEAR",	5);
	define("APS_I_PAY_TYPE_CAMP",				9);
	
	$aps_i_pay_type = array(APS_I_PAY_TYPE_MANY => "ใบเบิกผู้รับหลายคน"
		,APS_I_PAY_TYPE_WELFARE => "ใบเบิกสวัสดิการ"
		,APS_I_PAY_TYPE_CLEAR_BRT => "ใบเบิกหักล้างเงินยืมทดรอง"
		,APS_I_PAY_TYPE_CLEAR_BRM_IN_YEAR => "ใบเบิกคืนเงินยืมหมุนเวียน (ระหว่างปี)"
		,APS_I_PAY_TYPE_CLEAR_BRM_ENDYEAR => "ใบเบิกคืนเงินยืมหมุนเวียน (สิ้นปี)"
		,APS_I_PAY_TYPE_CAMP => "ใบเบิกค่าเบี้ยเลี้ยงที่พัก"
	);	
	
	//สำหรับจัดทำใบรายจ่ายพิเศษ (FI_BR_GRP_HDR.i_is_own_receiver)
	define("APS_OWN_RECEIVER_1", 	1);
	define("APS_OWN_RECEIVER_2",	2);
	define("APS_OWN_RECEIVER_3", 	3);
	
	$aps_own_receiver_arr = array(APS_OWN_RECEIVER_1 => "จ่ายคืนกรณีผู้ทำงานสำรองจ่ายเงินไปก่อน (ผู้รับ คือ ผู้สำรองจ่าย)"
			,APS_OWN_RECEIVER_2 => "กรณีผู้รับมอบฉันทะเป็นผู้รับเงิน"
			,APS_OWN_RECEIVER_3 => "จ่ายให้เจ้าหนี้โดยตรง(ผู้รับ คือ เจ้าหนี้)"
	);
?>
