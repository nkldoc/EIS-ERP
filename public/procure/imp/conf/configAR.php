<?php // กลุ่มข้อมูลสำหรับรายงานลูกหนี้
 
	define("AR_CLASS_TYPE_TV", 		1); // โทรทัศน์
	define("AR_CLASS_TYPE_RADIO",		2); // วิทยุ
	define("AR_CLASS_TYPE_JOIN",		3); // รายได้จากการร่วมดำเนินกิจการ
	define("AR_CLASS_TYPE_OTHER",		4); // รายได้อื่นๆ
	define("AR_CLASS_TYPE_PERIOD",	5); // รายได้ที่เป็นงวด
	define("AR_CLASS_TYPE_PROJECT",	6); // โครงการพิเศษ

 
	define("AR_PROCUT_TYPE_CENTER",	1); // ส่วนกลาง
	define("AR_PROCUT_TYPE_REGION",	2); // ส่วนภูมิภาค

	//ประเภทลูกหนี้/เจ้าหนี้ (1=ลูกหนี้,2=ลูกหนี้/เจ้าหนี้,3=เจ้าหนี้)

	define("AR_CONTACT_PERSONAL_TYPE1",	1); // 1=ลูกหนี้
	define("AR_CONTACT_PERSONAL_TYPE2",	2); // 2=ลูกหนี้/เจ้าหนี้
	define("AR_CONTACT_PERSONAL_TYPE3",	3); // 3=เจ้าหนี้ 	
	
	//$arr_branch = array(0=>"เลือกทั้งหมด",1=>"สำนักงานใหญ่",2=>"สาขา",3=>"อื่นๆ");

	define("AR_HEAD_OFFICE",	1); // 1=สำนักงานใหญ่
	define("AR_BRANCH_OFFICE",	2); // 2=สาขา
	define("AR_OTHER_OFFICE",	3); // 3=อื่นๆ 	
	//$arr_worker = array(0=>"เลือกทั้งหมด",1=>"เป็นลูกจ้าง",2=>"ไม่เป็นลูกจ้าง");
	
	define("AR_EMPLOYEE",	2); // 2=เป็นลูกจ้าง
	define("AR_NOT_EMPLOYEE", 6); // 3=ไม่เป็นลูกจ้าง 		

	define("AR_EMPLOYEE1",	1); // 2=ลูกจ้างรายวัน
	define("AR_EMPLOYEE2",	2); // 2=ลูกจ้างรายวันไม่มีสัญญาจ้าง
	define("AR_EMPLOYEE3",	3); // 2=ลูกจ้างรายวันมีสัญญาจ้าง
	define("AR_EMPLOYEE4",	4); // 2=ลูกจ้างรายชั่วโมงไม่มีสัญญาจ้าง
	define("AR_EMPLOYEE5",	5); // 2=ลูกจ้างอื่นๆ	
	define("AR_EMPLOYEE6",  6); // 3=ไม่เป็นลูกจ้าง 
	
	$arr_product_type_region = array("0"=>"ไม่ระบุ",AR_PROCUT_TYPE_CENTER=>"ส่วนกลาง",AR_PROCUT_TYPE_REGION=>"ส่วนภูมิภาค");
	
	$arr_ar_class_type = array(AR_CLASS_TYPE_TV=>"โทรทัศน์"
								,AR_CLASS_TYPE_RADIO=>"วิทยุ"
								,AR_CLASS_TYPE_JOIN=>"รายได้จากการร่วมดำเนินกิจการ"
								,AR_CLASS_TYPE_PROJECT=>"โครงการ"
								,AR_CLASS_TYPE_PERIOD=>"รายได้ที่เป็นงวด"
								,AR_CLASS_TYPE_OTHER=>"รายได้อื่นๆ"
								);


	// dc_product_group.i_group_type
	define("AR_REPOER_GROUP_TYPE_ADVERTISE", 	1); // โฆษณา
	define("AR_REPOER_GROUP_TYPE_RENT",			2); // เช่าเวลา
	$arr_ar_report_group_type = array(AR_REPOER_GROUP_TYPE_ADVERTISE=>"โฆษณา"
									,AR_REPOER_GROUP_TYPE_RENT=>"เช่าเวลา");
	
        
        define("AR_WHT",  7); // id ภาษีหัก ณ. ที่จ่าย แทนตัวเก่า  $cfg[wht]
        define("AR_VAT",  6); // id ภาษี มูลค่าเพิ่ม             $cfg[wht] $cfg[vat]
 
			
?>
