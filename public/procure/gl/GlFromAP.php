<?php
include("../conf/config.php"); 
include("../ap/conf/configAp.php");
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
	echo "Ext.AP_BARTER_NO		= ".AP_BARTER_NO."; \r\n";
	echo "Ext.AP_SALARY_IN		= ".AP_SALARY_IN."; \r\n";
	echo "Ext.AP_SEND_TAX_YES	= ".AP_SEND_TAX_YES."; \r\n";
	echo "Ext.AP_PURCHASE		= ".AP_PURCHASE."; \r\n";
	
	echo "var PERSON_TYPE_DEBTOR	= ".PERSON_TYPE_DEBTOR.";	/*ลูกหนี้	[ตาราง dc_debtor]*/";
	echo "var PERSON_TYPE_CREDITOR	= ".PERSON_TYPE_CREDITOR."; /*เจ้าหนี้ผู้ขาย/ผู้รับจ้าง 	[ตาราง dc_creditor]*/";
	echo "var PERSON_TYPE_EMPLOYEE	= ".PERSON_TYPE_EMPLOYEE."; /*เจ้าหนี้พนักงาน 	[ตาราง dc_emp]*/";
	echo "var PERSON_TYPE_OTHER		= ".PERSON_TYPE_OTHER.";	/*เจ้าหนี้ทั่วไป*/";
?>
</script>
<script type="text/javascript" src="js/GlFromAP.js?_dc=<?php echo rand(0,100000); ?>"></script>
</head>
<body>
</body>
</html>