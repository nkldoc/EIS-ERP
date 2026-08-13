<?php
/* ========== ตาราง gl_tran_hdr & gl_balance_cost ========== */		
 
	// สถานะสมุดรายวัน 							(gl_tran_hdr.i_post  , gl_balance_cost.i_post)
	define("BOOK_ACC_NOT_POST",1); 					//รายการรอลงบัญชี  		(ไม่มี gl_tran_hdr.c_code กับ gl_tran_hdr.c_code_post)
	define("BOOK_ACC_GX",2); 						//GX - ยังไม่ผ่านรายการ (มี gl_tran_hdr.c_code = GX)
	define("BOOK_ACC_GL",3); 						//GL - ผ่านรายการแล้ว   (มี gl_tran_hdr.c_code_post = GL)	
	
	// สถานะ เป็นสมุดรายวันที่ปิดปี หรือไม่  	(gl_tran_hdr.i_close_year, gl_balance_cost.i_close_year)
	define("GL_CLOSE_YEAR_PERIOD",1);				//เป็น 
	define("GL_CLOSE_YEAR_NONE",2); 				//ไม่เป็น  
	
/* ========== ตาราง gl_tran_hdr ========== */
		
	// เลขที่รหัสสมุดรายวัน 					(gl_tran_hdr.c_code ,c_code_post)
	define("BOOK_ACC_GX_CODE","GX"); 				//ก่อน POST [มีเฉพาะ c_code = GX] 
	define("BOOK_ACC_GL_CODE","GL"); 				//POST แล้ว [มีทั้ง  c_code = GX + c_code_post = GL]  

	// สถานะ ประเภทการปิดปี  					(gl_tran_hdr.i_close_year_type)
	define("GL_CLOSE_YEAR_TYPE_M4",1);				// ปิดรายได้
	define("GL_CLOSE_YEAR_TYPE_M5",2); 				// ปิดค่าใช้จ่าย
	define("GL_CLOSE_YEAR_TYPE_PROFIT",3); 			// โอนกำไร
	define("GL_CLOSE_YEAR_TYPE_DIVIDENCE",4); 		// โอนเงินปันผล
	define("GL_CLOSE_YEAR_TYPE_NONE",9);			// ไม่ใช่รายการปิดปี
	
	// สถานะ เป็นรายการโอนกลับต้นงวด หรือไม่	(gl_tran_hdr.i_reverse)
	define("GL_REVERSE_TRUE",1); 					// เป็น
	define("GL_REVERSE_FALSE",2); 					// ไม่เป็น
	
	// สถานะเอกสาร								(gl_tran_hdr.i_type)
	define("GL_TYPE_MANUAL",1); 					// Manual - Key In เอกสารเอง
	define("GL_TYPE_AUTO",2); 						// AUTO - GENERATE ให้เบื้องต้นจากระบบ
 
	// สถานะแสดงรายการทั้งหมดก่อนบันทึกจริง		(gl_tran_hdr.i_preview)
	define("GL_PREVIEW_TRUE",1); 					// แสดง
	define("GL_PREVIEW_FALSE",2); 					// ไม่แสดง 
	
	// สถานะตรวจสอบ รายละเอียดสมุดรายวัน 		(gl_tran_hdr.i_chk_gl_dtl)
	define("GL_CHK_DTL_TRUE",1);					//ตรวจสอบผ่านแล้ว
	define("GL_CHK_DTL_FALSE",2);  					//ยังไม่ตรวจสอบ/ตรวจสอบแล้วไม่ผ่าน
	
	// สถานะตรวจสอบ รายละเอียดภาษีซื้อ 			(gl_tran_hdr.i_chk_gl_purchase)
	define("GL_CHK_VAT_TRUE",1);					//ตรวจสอบผ่านแล้ว
	define("GL_CHK_VAT_FALSE",2);  					//ยังไม่ตรวจสอบ/ตรวจสอบแล้วไม่ผ่าน	
	
/* ========== ตาราง gl_tran_dtl ========== */
		
	// สถานะ เป็นรายการบวกกลับหรือไม่			(gl_tran_dtl.i_nontax)
	define("GL_NONTAX_TRUE",1); 					// เป็น
	define("GL_NONTAX_FALSE",2); 					// ไม่เป็น 

/* ========== ตาราง gl_balance_cost ========== */ 
 	
	//สถานะ ดูรายงาน งบการเงินหรือไม่ 			( gl_balance_cost.i_report)
	define("GL_BAL_REPORT_SHOW",1); 				//แสดง
	define("GL_BAL_REPORT_NONE",2); 				//ไม่แสดง

	//สถาะแสดงยอดยกมาที่รายงานเคลื่อนไหวหรือไม่ (gl_balance_cost.i_show_f_begin)
	define("GL_BAL_SHOW_MONEY_TRUE",1); 			//แสดง
	define("GL_BAL_SHOW_MONEY_FALSE",2); 			//ไม่แสดง	

/* ========== ตาราง gl_tran_purchase ========== */
 
	//ภาษีซื้อ สถานะ สถานประกอบการ 				(gl_tran_purchase.i_branch)
	define("GL_PR_LOCATION_BRANCH",1); 				//สาขา					LOCATION
	define("GL_PR_LOCATION_HEADQUARTER",2); 		//สำนักงานใหญ่
	define("GL_PR_LOCATION_OTHER",3); 				//อื่นๆ
	 
	//ภาษีซื้อ สถานะ ยื่นภาษีซื้อเพิ่มเติม 		(gl_tran_purchase.i_more)
	define("GL_PR_MORE_SEND_TRUE",1); 				//ยื่น					 
	define("GL_PR_MORE_SEND_FALSE",2); 				//ไม่ยื่น  

/* ========== ตาราง gl_dc_period ========== */ 

	// สถานะ เป็นงวดล่าสุดในแต่ละเดือน			(gl_dc_period.i_last_period)
	define("GL_LAST_PERIOD_TRUE",1); 				// เป็น
	define("GL_LAST_PERIOD_FALSE",2); 				// ไม่เป็น

	// สถานะระบบ ของการปิด/เปิดงวด				(gl_dc_period.i_system)
	define("GL_PERIOD_SYSTEM_GL",1); 				// บัญชีแยกประเภททั่วไป
	define("GL_PERIOD_SYSTEM_AR",2); 				// ลูกหนี้+รับเงิน
	define("GL_PERIOD_SYSTEM_AP",3); 				// เจ้าหนี้+จ่ายเงิน
		   	
	// สถานะ เปิด/ปิดงวด 						(gl_dc_period.i_status)
	define("GL_PERIOD_OPEN",1); 				// เปิดงวด
	define("GL_PERIOD_CLOSE",2); 				// ปิดงวด


/* ========== ตาราง gl_config ========== */  
   
	// สถานะ ประเภทค่าคงที่ 					(gl_config.i_config)
	define("GL_CFG_COST_ACC",1); 							// บันทึกบัญชี ทั่วไป o ศูนย์ต้นทุน สำนักบัญชีและการเงิน
	define("GL_CFG_COST_HEADQUARTER",2); 					// บันทึกบัญชี ทั่วไป o ศูนย์ต้นทุนสำนักงานใหญ่
	define("GL_CFG_CLOSE_YEAR_COST_ACC",3);					// บันทึกบัญชี ปิดปี  | ศูนย์ต้นทุน สำนักบัญชีและการเงิน
	define("GL_CFG_CLOSE_YEAR_COST_HEADQUARTER",4);			// บันทึกบัญชี ปิดปี  | ศูนย์ต้นทุนสำนักงานใหญ่ 
	define("GL_CFG_CLOSE_YEAR_ACC_DIVIDEND",5);				// บันทึกบัญชี ปิดปี  | บัญชี เงินปันผลจ่าย
	define("GL_CFG_CLOSE_YEAR_ACC_PROFIT_UNALLOCATE",6);	// บันทึกบัญชี ปิดปี  | บัญชี กำไร(ขาดทุน)สะสม-ยังไม่ได้จัดสรร
	define("GL_CFG_CLOSE_YEAR_ACC_PROFIT_YEAR",7);			// บันทึกบัญชี ปิดปี  | บัญชี กำไร(ขาดทุน)สะสม-สุทธิ ประจำปี 
	define("GL_CFG_VAT_BUY",8);								// บันทึกบัญชี ทั่วไป o ภาษีซื้อ
	define("GL_CFG_CLOSE_YEAR_LICENSE_ANALOG",9);			// บันทึกบัญชี ปิดปี  | ใบอนุญาต Analog
	define("GL_CFG_VOUCHER",10);							// บันทึกบัญชี ทั่วไป o ค่าใช้จ่ายค้างจ่าย-ใบสำคัญจ่าย
	define("GL_CFG_VAT_BUY_NOT_DUE",11);					// บันทึกบัญชี ทั่วไป o ภาษีซื้อยังไม่ถึงกำหนด
	define("GL_CFG_SET_CREDITOR_PRODUCT",12);				// บันทึกบัญชี ทั่วไป o ตั้งเจ้าหนี้-ค่าสินค้าและบริการ 
	define("GL_CFG_SET_CREDITOR_CONSTRUCTION",13);			// บันทึกบัญชี ทั่วไป o ตั้งเจ้าหนี้-งานก่อสร้าง
	 
	
	// สถานะ ประเภทค่าคงที่ 					(gl_config.i_config ไว้สำหรับแสดงข้อความ @ UI)
	define("GL_CFG_COST_ACC_TXT","[ทั่วไป] - ศูนย์ต้นทุน สำนักบัญชีและการเงิน");
	define("GL_CFG_COST_HEADQUARTER_TXT","[ทั่วไป] - ศูนย์ต้นทุน (สำนักงานใหญ่)");
	define("GL_CFG_CLOSE_YEAR_COST_ACC_TXT","[ปิดปี] - ศูนย์ต้นทุน สำนักบัญชีและการเงิน");
	define("GL_CFG_CLOSE_YEAR_COST_HEADQUARTER_TXT","[ปิดปี] - ศูนย์ต้นทุน (สำนักงานใหญ่)");
	define("GL_CFG_CLOSE_YEAR_ACC_DIVIDEND_TXT","[ปิดปี] - ผังบัญชี เงินปันผลจ่าย");
	define("GL_CFG_CLOSE_YEAR_ACC_PROFIT_UNALLOCATE_TXT","[ปิดปี] - ผังบัญชี กำไร(ขาดทุน)สะสม-ยังไม่ได้จัดสรร");
	define("GL_CFG_CLOSE_YEAR_ACC_PROFIT_YEAR_TXT","[ปิดปี] - ผังบัญชี กำไร(ขาดทุน)สะสม-สุทธิ ประจำปี)");	 
	define("GL_CFG_VAT_BUY_TXT","[ทั่วไป] - รหัสบัญชีที่บันทึกภาษีซื้อ");	 
	define("GL_CFG_CLOSE_YEAR_LICENSE_ANALOG_TXT","[ปิดปี] - ใบอนุญาต Analog");				 
	define("GL_CFG_VOUCHER_TXT","[ทั่วไป] - รหัสบัญชีค่าใช้จ่ายค้างจ่าย-ใบสำคัญจ่าย");
	define("GL_CFG_VAT_BUY_NOT_DUE_TXT","[ทั่วไป] - รหัสบัญชีที่บันทึกภาษีซื้อยังไม่ถึงกำหนด");
	define("GL_CFG_SET_CREDITOR_PRODUCT_TXT","[ทั่วไป] - รหัสบัญชีตั้งเจ้าหนี้ค่าสินค้าและบริการ");
	define("GL_CFG_SET_CREDITOR_CONSTRUCTION_TXT","[ทั่วไป] - รหัสบัญชีตั้งเจ้าหนี้งานก่อสร้าง");
	
 	$ARR_GL_CFG_TEXT = array(
			GL_CFG_COST_ACC			=> GL_CFG_COST_ACC_TXT,
			GL_CFG_COST_HEADQUARTER	=>GL_CFG_COST_HEADQUARTER_TXT,
			GL_CFG_VAT_BUY=>GL_CFG_VAT_BUY_TXT, 
			GL_CFG_CLOSE_YEAR_COST_ACC=>GL_CFG_CLOSE_YEAR_COST_ACC_TXT,
			GL_CFG_CLOSE_YEAR_COST_HEADQUARTER=>GL_CFG_CLOSE_YEAR_COST_HEADQUARTER_TXT,
			GL_CFG_CLOSE_YEAR_ACC_DIVIDEND=>GL_CFG_CLOSE_YEAR_ACC_DIVIDEND_TXT,
			GL_CFG_CLOSE_YEAR_ACC_PROFIT_UNALLOCATE=>GL_CFG_CLOSE_YEAR_ACC_PROFIT_UNALLOCATE_TXT,
			GL_CFG_CLOSE_YEAR_ACC_PROFIT_YEAR=>GL_CFG_CLOSE_YEAR_ACC_PROFIT_YEAR_TXT,
			GL_CFG_CLOSE_YEAR_LICENSE_ANALOG=>GL_CFG_CLOSE_YEAR_LICENSE_ANALOG_TXT,
 			GL_CFG_VOUCHER=>GL_CFG_VOUCHER_TXT,
			GL_CFG_VAT_BUY_NOT_DUE=>GL_CFG_VAT_BUY_NOT_DUE_TXT,
			GL_CFG_SET_CREDITOR_PRODUCT=>GL_CFG_SET_CREDITOR_PRODUCT_TXT,
			GL_CFG_SET_CREDITOR_CONSTRUCTION=>GL_CFG_SET_CREDITOR_CONSTRUCTION_TXT
 	);	 
 
/* ========== ตาราง dc_acc ========== */  
	
   	// หมวดผังบัญชี 							(dc_acc.i_group)
	define("GL_ACC_GROUP1_ASSET",1); 				//1000000000	สินทรัพย์
	define("GL_ACC_GROUP2_DEBT",2); 				//2000000000	หนี้สิน
	define("GL_ACC_GROUP3_SHARE",3); 				//3000000000	ส่วนของผู้ถือหุ้น
	define("GL_ACC_GROUP4_REVENUE",4); 				//4000000000	รายได้
	define("GL_ACC_GROUP5_EXPENSE",5); 				//5000000000	ค่าใช้จ่าย
	
	// ระดับบัญชี 								(dc_acc.i_level)
	define("GL_ACC_1ST_LEVEL",1);					//Level 1 บนสุด
	define("GL_ACC_2ND_LEVEL",2);					//Level 2
	define("GL_ACC_3RD_LEVEL",3);					//Level 3
	define("GL_ACC_4TH_LEVEL",4);					//Level 4 
	define("GL_ACC_5TH_LEVEL",5);					//Level 5
	define("GL_ACC_6TH_LEVEL",6);					//Level 6 ล่างสุด ไว้สำหรับบันทึกข้อมูลสมุดรายวัน	
	
	//ประเภทบัญชี 								(dc_acc.i_last)
	define("GL_ACC_LAST_FALSE",2); 					//บัญชีคุม
	define("GL_ACC_LAST_TRUE",1); 					//บัญชีย่อย	ไว้สำหรับบันทึกข้อมูลสมุดรายวัน	

	//ประเภทดุล 								(dc_acc.i_debit)
	define("GL_ACC_DR",2); 							//เดบิต
	define("GL_ACC_CR",1); 							//เครดิต 
   
/* ========== ตาราง gl_rep_acc_hdr ========== */  
	
	// เลขที่รหัสรายงานตามบัญชี 				(gl_rep_acc_hdr.c_code)
	define("CODE_GL_REP_BY_ACC","REPA");

/* ========== ตาราง gl_rep_conf_dtl ========== */ 
        
    $arr_i_source       = array( 1=>"บันทึกระหว่างงวด (GX/GL)", 2=>"ประมวลผลลงบัญชี");        
    $arr_i_source_item1  = array(1=>"ยอดรวมของ ผลต่าง เดบิต-เครดิต",
                                2=>"ยอดรวมของ ผลต่าง เครดิต-เดบิต"); 
    $arr_i_source_item2  = array(1=>"ยอดรวมของ ผลต่าง ยอดยกมาเดบิต-ยอดยกมาเครดิต",
                                2=>"ยอดรวมของ ผลต่าง ยอดยกมาเครดิต-ยอดยกมาเดบิต",
                                3=>"ยอดรวมของ ผลต่าง เดบิต-เครดิต",
                                4=>"ยอดรวมของ ผลต่าง เครดิต-เดบิต",
                                5=>"ยอดรวมของ ผลต่าง ยอดยกไปเดบิต-ยอดยกไปเครดิต",
                                6=>"ยอดรวมของ ผลต่าง ยอดยกไปเครดิต-ยอดยกไปเดบิต"); 	 	
	
	//สำหรับ ออกรายงาน งบแสดงฐานะการเงิน
	define("GL_ACC_PROFIT_LV2_FIXED","30200000000"); 	
	define("GL_ACC_PROFIT_LV3_FIXED","30202000000");
	define("GL_ACC_PROFIT_LV4_FIXED","30202020000");
	define("GL_ACC_PROFIT_LV5_FIXED","30202020100"); 
	define("GL_ACC_PROFIT_LV6_FIXED","30202020101"); 	
 
	define("GL_CFG_BOSS_ID",10); //7=พี่ฮุ้ง 10=พี่บัว
	define("GL_CFG_BOSS_COST_ID",36); 

	define("GL_CFG_DEFAULT_CREDITOR_PRODUCT",11); //FIXED ID
?>
