<?php
include("../conf/config.php");
include("../dc/conf/configDc.php");
include("../ap/conf/configAp.php");
include("./../gl/conf/configGl.php");
include("./../tax/conf/configTax.php");
?>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
<title><?php echo COMPANY_NAME;?></title>
<!-- System ERP :: Src js  -->
<?php include("../lib/loadJs.php"); ?>
<?php include("../lib/loadCss.php"); ?>
<!-- System ERP :: -->
<script type="text/javascript">
<?php

echo "PAGE_TYPE		= 2;"; // ตรวจอนุมัติเงินเบิกค่าใข้จ่าย

echo "Ext.AP_EXPENSE		= ".AP_EXPENSE.";		// 	ใบเบิก AP ค่าใช้จ่าย \r\n";
echo "Ext.ITYPEWHTAX5		= ".ITYPEWHTAX5."; 					//  i_type_whtax \r\n";
echo "Ext.PNT_NO			= ".PNT_NO."; 			// 	ไม่มีค่าปรับ  \r\n";
echo "Ext.PNT_CAL_TAX		= ".PNT_CAL_TAX."; 		//  ค่าปรับนำไปหักในการคำนวณ(หักภาษี)  \r\n";
echo "Ext.PNT_NON_TAX		= ".PNT_NON_TAX."; 		//  ค่าปรับนำไปหักในการคำนวณ(ไม่หักภาษี)  \r\n";
echo "Ext.PNT_NOT_CAL_TAX	= ".PNT_NOT_CAL_TAX."; 	//  ค่าปรับ ไม่นำไปหักในการคำนวณ  \r\n";
echo "Ext.PNT_PAID			= ".PNT_PAID."; 		//  ค่าปรับ ไม่นำไปหักในการคำนวณ  \r\n";

echo "Ext.PNT_NO_TXT			= '".$PENALTY_ARR[PNT_NO]."'; 			// 	ไม่มีค่าปรับ  \r\n";
echo "Ext.PNT_CAL_TAX_TXT		= '".$PENALTY_ARR[PNT_CAL_TAX]."'; 		//  ค่าปรับนำไปหักในการคำนวณ(หักภาษี)  \r\n";
echo "Ext.PNT_NON_TAX_TXT		= '".$PENALTY_ARR[PNT_NON_TAX]."'; 		//  ค่าปรับนำไปหักในการคำนวณ(ไม่หักภาษี)  \r\n";
echo "Ext.PNT_NOT_CAL_TAX_TXT	= '".$PENALTY_ARR[PNT_NOT_CAL_TAX]."'; 	//  ค่าปรับ ไม่นำไปหักในการคำนวณ  \r\n";
echo "Ext.PNT_PAID_TXT			= '".$PENALTY_ARR[PNT_PAID]."'; 			//  ค่าปรับ ไม่นำไปหักในการคำนวณ  \r\n";


echo "Ext.DC_EXP_DOC_EXP_TYPE_SPECIAL	= '".DC_EXP_DOC_EXP_TYPE_SPECIAL."'; //ใบรายจ่ายพิเศษ  \r\n";
echo "Ext.DC_EXP_DOC_EXP_TYPE_OTHER		= '".DC_EXP_DOC_EXP_TYPE_OTHER."'; //อื่นๆ  \r\n"; 

echo "Ext.PERSON_CREDITOR 				= ".PERSON_CREDITOR."; // ผู้ขาย/ผู้รับจ้าง \r\n";
echo "Ext.PERSON_EMP 					= ".PERSON_EMP."; // บุคคลภายใน \r\n";
echo "Ext.PERSON_OTHER					= ".PERSON_OTHER."; // ทั่วไป \r\n";

echo "Ext.AP_BARTER_NO 				= ".AP_BARTER_NO."; // ไม่ระบุ \r\n";
echo "Ext.AP_BARTER_CHANGE 			= ".AP_BARTER_CHANGE."; // แลกเปลี่ยน \r\n";
echo "Ext.AP_BARTER_SETOFF			= ".AP_BARTER_SETOFF."; // หักลบ/กลบหนี้ \r\n";
echo "Ext.AP_BARTER_MY_INCOME		= ".AP_BARTER_MY_INCOME."; // เบิกเป็นเงินได้ของตนเอง \r\n";

echo "Ext.FI_BR_I_IS_STATUS_1		= ".FI_BR_I_IS_STATUS_1."; //ยกเลิก \r\n";
echo "Ext.FI_BR_I_IS_STATUS0		= ".FI_BR_I_IS_STATUS0."; //ส่งกลับ  \r\n";
echo "Ext.FI_BR_I_IS_STATUS1		= ".FI_BR_I_IS_STATUS1."; //รอทำใบสำคัญจ่าย/รอส่งเบิกพร้อมเงินเดือน  \r\n";
echo "Ext.FI_BR_I_IS_STATUS2		= ".FI_BR_I_IS_STATUS2."; //รอจ่าย  \r\n";
echo "Ext.FI_BR_I_IS_STATUS3		= ".FI_BR_I_IS_STATUS3."; //จ่ายเงิน  \r\n";
echo "Ext.FI_BR_I_IS_STATUS4		= ".FI_BR_I_IS_STATUS4."; //รออนุมัติ \r\n";
echo "Ext.FI_BR_I_IS_STATUS5		= ".FI_BR_I_IS_STATUS5."; //ส่งเบิกพร้อมเงินเดือน \r\n";
echo "Ext.FI_BR_I_IS_STATUS6		= ".FI_BR_I_IS_STATUS6."; //รอทำใบสำคัญจ่าย(แลกเปลี่ยน) \r\n";
echo "Ext.FI_BR_I_IS_STATUS7		= ".FI_BR_I_IS_STATUS7."; //ทำใบสำคัญจ่ายสมบูรณ์(แลกเปลี่ยน)\r\n";
echo "Ext.FI_BR_I_IS_STATUS8		= ".FI_BR_I_IS_STATUS8."; //รอสวัสดิการตรวจสอบ \r\n";
echo "Ext.FI_BR_I_IS_STATUS9		= ".FI_BR_I_IS_STATUS9."; //ส่งกลับโดยสวัสดิการตรวจสอบ \r\n";
echo "Ext.FI_BR_I_IS_STATUS10		= ".FI_BR_I_IS_STATUS10."; //รอทำรายการหักล้าง(BR/BS) \r\n";
echo "Ext.FI_BR_I_IS_STATUS11		= ".FI_BR_I_IS_STATUS11."; //ทำรายการหักล้าง(BR/BS)แล้ว  \r\n";
echo "Ext.FI_BR_I_IS_STATUS12		= ".FI_BR_I_IS_STATUS12."; //อยู่ระหว่างจัดทำใบสำคัญจ่าย \r\n";

echo "Ext.AP_IS_RECEIVER_DIFF1		= ".AP_IS_RECEIVER_DIFF1."; //จ่ายคืนกรณีผู้ทำงานสำรองจ่ายเงินไปก่อน (ผู้รับ คือ ผู้สำรองจ่าย) \r\n";
echo "Ext.AP_IS_RECEIVER_DIFF2		= ".AP_IS_RECEIVER_DIFF2."; //กรณีผู้รับมอบฉันทะเป็นผู้รับเงิน  \r\n";
echo "Ext.AP_IS_RECEIVER_DIFF3		= ".AP_IS_RECEIVER_DIFF3."; //จ่ายให้เจ้าหนี้โดยตรง (ผู้รับ คือ เจ้าหนี้) \r\n";

echo "Ext.TAX_FIX_CNT_RATE 			= ".TAX_FIX_CNT_RATE."; \r\n";
echo "Ext.TAX_FIX_CNT_MONEY 		= ".TAX_FIX_CNT_MONEY."; \r\n";

echo "Ext.TAX_BY_PROGRESS 			= ".TAX_BY_PROGRESS."; //หักตามอัตราก้าวหน้า \r\n";
echo "Ext.TAX_CFG_M40_2 			= ".TAX_CFG_M40_2."; //มาตรา40(2) \r\n";
?>
</script>
<script type="text/javascript" src="../lib/right/GrantPermission.php?_dc=<?php echo rand(0,100000); ?>&f=<?php echo $_SERVER["PHP_SELF"];?>"></script>
<!-- System ERP :: -->
<script type="text/javascript" src="../ap/js/FiPayTranHdrExpen.js?_dc=<?php echo rand(0,100000); ?>"></script>
</head>
<body>
</body>
</html>