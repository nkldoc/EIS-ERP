<?php
	//เฉพาะผู้ขาย / ผู้รับจ้าง ที่rateไม่ถึง10% แล้วไปเบิกAP/APS ม.40(2),>=25000 บ. ให้fix rate นี้ [10%]
	define ("TAX_FIX_CNT_RATE",5);	//อัตรา 10 % ก่อน 1 มกรา 25557 ____ หลัง 1 มกรา 25557 ใช้ 5%
	define ("TAX_FIX_CNT_MONEY",25000);	//จำนวนเงินเบิก 25,000 บาท
	
	//หมวดภาษีอากร ตาราง pr_section_tax ฟิลด์  pr_section_tax_id
	define ("TAX_CFG_M40_2",2);	//มาตรา40(2)
	define ("TAX_CFG_M40_1",1);	//มาตรา40(1)
	define ("TAX_CFG_M40_3",3);	//มาตรา40(3)
	
    //การสรุปข้อมูล dc_tax_income.i_is_method:(1=ไม่ต้องสรุปข้อมูลรายปี, 2=ต้องสรุปข้อมูลรายปี)
    define("DC_TAX_INCOME_METHOD_NOSUM", 1); //ไม่ต้องสรุปข้อมูลรายปี
    define("DC_TAX_INCOME_METHOD_ISSUM", 2); //ต้องสรุปข้อมูลรายปี
    
    //ประเภทแบบ dc_tax_income.i_is_type:(1=แบบแสดงรายการประจำเดือน, 2=แบบสรุปรายการประจำปี)
    define("DC_TAX_INCOME_TYPE_MONTH", 1); //แบบแสดงรายการประจำเดือน
    define("DC_TAX_INCOME_TYPE_YEAR", 2); //แบบสรุปรายการประจำปี
    
    //มีรายการภาษีเงินได้สำหรับจัดซื้อจัดจ้าง  รายการภาษีเงินไดั dc_tax_customer.i_is_type:
    define ("DC_TAX_IS_INCOME",1); // มีรายการภาษีเงินได้สำหรับจัดซื้อจัดจ้าง
    define ("DC_TAX_IS_INCOME_NONE",2); // ไม่มีรายการภาษีเงินได้สำหรับจัดซื้อจัดจ้าง
    
    //การคิดภาษีหัก ณ ที่จ่ายของประเภทกิจการ (ระบบเจ้าหนี้/บริหารการเงิน ตรวจจ่าย) ตาราง dc_tax_customer.i_type_tax
    define ("TAX_NOT",0); // ยังไม่ระบุ
    define ("TAX_JURISTIC_PERSON",1); // นิติบุคคล
    define ("TAX_NORMAL_PERSON",2); // บุคคลธรรมดา
    
    //dc_tax&dc_vat.i_cal  --คิด/หัก ภาษี
    define("TAX_CAL_YES", 1); //คิด/หัก
    define("TAX_CAL_NO", 2); //ไม่คิด/ไม่หัก
    
    //ประเภทการคิดภาษี ตาราง dc_tax.i_type_whtax
    define("TAX_BY_RATE"	,1);//หักตามอัตราภาษี
    define("TAX_BY_PROGRESS"    ,2);//หักตามอัตราก้าวหน้า
    define("TAX_BY_M48"		,3);//หักตามเกณฑ์มาตรา 48
    define("TAX_BY_PENSION"	,4);//หัก ณ ที่จ่ายจากบำเหน็จ
    define("TAX_BY_NONE"	,5);//ไม่หัก ณ ที่จ่าย

    //กำหนดแสดงอัตราภาษีฯ dc_tax.i_show_by
    define("TAX_SHOW_BY_NONE", 1); // ไม่แสดงอัตราภาษีหัก ณ ที่จ่าย
    define("TAX_SHOW_BY_TAX", 2); // แสดง ตามอัตราภาษีหัก ณ ที่จ่าย
    define("TAX_SHOW_BY_PROGRESS", 3); // แสดง แบบสะสมยอด อัตราก้าวหน้า
    
    //กำหนดแสดงชื่อภาษี สำหรับใบสำคัญจ่ายเงิน (Payment Voucher) dc_tax.i_show
    define("TAX_SHOW_NONE", 1); // ไม่แสดงชื่อภาษี
    define("TAX_SHOW_NONE_ISPROGRESS", 2); // ไม่แสดงชื่อภาษี แต่สะสมยอดที่ภาษีหัก ณ ที่จ่ายอัตราก้าวหน้า
    define("TAX_SHOW_YES", 3); // แสดงชื่อภาษี
    
    //การคำนวณภาษี dc_section_tax.i_type_tax
    define("TAX_SECTION_TYPE_40", 1); // มาตรา40(1)และ(2)
    define("TAX_SECTION_TYPE_OTHER", 2); // มาตราอื่น
    define("TAX_SECTION_TYPE_NONE", 3); // ค่าใช้จ่ายไม่คิดภาษี
?>
