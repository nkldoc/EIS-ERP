<?php
include("../conf/config.php"); 
include("../ap/conf/configAp.php");
include("../cm/conf/configCm.php");
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
<script type="text/javascript" src="../lib/right/GrantPermission.php?_dc=<?php echo rand(0,100000); ?>&f=<?php echo $_SERVER["PHP_SELF"];?>"></script>
<!-- System ERP :: -->
<script type="text/javascript">
<?php 
	echo "Ext.FI_PV_TYPE_AP				= ".FI_PV_TYPE_AP."; \r\n"; //เงินเบิกค่าใช้จ่าย (AP ค่าใช้จ่าย + AP จัดซื้อ)
	echo "Ext.FI_PV_TYPE_BR				= ".FI_PV_TYPE_BR."; \r\n"; //เงินยืม (BR)
	echo "Ext.FI_PV_TYPE_BA_BR			= ".FI_PV_TYPE_BA_BR."; \r\n"; //เบิกเพิ่ม เงินยืม (BA)
	echo "Ext.FI_PV_TYPE_APS_MANY		= ".FI_PV_TYPE_APS_MANY."; \r\n"; //เงินเบิกกรณีผู้รับหลายคน (APS)
	echo "Ext.FI_PV_TYPE_APS_WELFARE	= ".FI_PV_TYPE_APS_WELFARE."; \r\n"; //เงินเบิกสวัสดิการ (APS)
	echo "Ext.FI_PV_TYPE_APS_CLEAR_BRT	= ".FI_PV_TYPE_APS_CLEAR_BRT."; \r\n"; //เงินเบิกหักล้างเงินยืมทดรอง (APS)
	echo "Ext.FI_PV_TYPE_APS_CLEAR_BRM	= ".FI_PV_TYPE_APS_CLEAR_BRM."; \r\n"; //เงินเบิกหักล้างเงินยืมหมุนเวียน (APS)
	
	echo "var PERSON_TYPE_DEBTOR	= ".PERSON_TYPE_DEBTOR.";	/*ลูกหนี้	[ตาราง dc_debtor]*/";
	echo "var PERSON_TYPE_CREDITOR	= ".PERSON_TYPE_CREDITOR."; /*เจ้าหนี้ผู้ขาย/ผู้รับจ้าง 	[ตาราง dc_creditor]*/";
	echo "var PERSON_TYPE_EMPLOYEE	= ".PERSON_TYPE_EMPLOYEE."; /*เจ้าหนี้พนักงาน 	[ตาราง dc_emp]*/";
	echo "var PERSON_TYPE_OTHER		= ".PERSON_TYPE_OTHER.";	/*เจ้าหนี้ทั่วไป*/";
?>
</script>
<script type="text/javascript" src="js/GlFromPV.js?_dc=<?php echo rand(0,100000); ?>"></script>
</head>
<body>
</body>
</html>