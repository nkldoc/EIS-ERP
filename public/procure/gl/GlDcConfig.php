<?php
	include("../conf/config.php");
	include("conf/configGl.php");
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
	echo "Ext.GL_CFG_COST_ACC							=".GL_CFG_COST_ACC."; \r\n";
	echo "Ext.GL_CFG_COST_HEADQUARTER					=".GL_CFG_COST_HEADQUARTER."; \r\n";
	echo "Ext.GL_CFG_VAT_BUY							=".GL_CFG_VAT_BUY."; \r\n";
	echo "Ext.GL_CFG_CLOSE_YEAR_COST_ACC				=".GL_CFG_CLOSE_YEAR_COST_ACC."; \r\n";
	echo "Ext.GL_CFG_CLOSE_YEAR_COST_HEADQUARTER		=".GL_CFG_CLOSE_YEAR_COST_HEADQUARTER."; \r\n";
	echo "Ext.GL_CFG_CLOSE_YEAR_ACC_DIVIDEND			=".GL_CFG_CLOSE_YEAR_ACC_DIVIDEND."; \r\n";
	echo "Ext.GL_CFG_CLOSE_YEAR_ACC_PROFIT_UNALLOCATE	=".GL_CFG_CLOSE_YEAR_ACC_PROFIT_UNALLOCATE."; \r\n";
	echo "Ext.GL_CFG_CLOSE_YEAR_ACC_PROFIT_YEAR			=".GL_CFG_CLOSE_YEAR_ACC_PROFIT_YEAR."; \r\n";
	echo "Ext.GL_CFG_CLOSE_YEAR_LICENSE_ANALOG			=".GL_CFG_CLOSE_YEAR_LICENSE_ANALOG."; \r\n";
	echo "Ext.GL_CFG_VOUCHER							=".GL_CFG_VOUCHER."; \r\n"; 
	echo "Ext.GL_CFG_SET_CREDITOR_PRODUCT				=".GL_CFG_SET_CREDITOR_PRODUCT."; \r\n"; 
	echo "Ext.GL_CFG_SET_CREDITOR_CONSTRUCTION			=".GL_CFG_SET_CREDITOR_CONSTRUCTION."; \r\n";  
	
	echo "Ext.GL_CFG_COST_ACC_TXT							='".GL_CFG_COST_ACC_TXT."'; \r\n";
	echo "Ext.GL_CFG_COST_HEADQUARTER_TXT					='".GL_CFG_COST_HEADQUARTER_TXT."'; \r\n";
	echo "Ext.GL_CFG_VAT_BUY_TXT 							='".GL_CFG_VAT_BUY_TXT ."'; \r\n";
	echo "Ext.GL_CFG_CLOSE_YEAR_COST_ACC_TXT				='".GL_CFG_CLOSE_YEAR_COST_ACC_TXT."'; \r\n";
	echo "Ext.GL_CFG_CLOSE_YEAR_COST_HEADQUARTER_TXT		='".GL_CFG_CLOSE_YEAR_COST_HEADQUARTER_TXT."'; \r\n";
	echo "Ext.GL_CFG_CLOSE_YEAR_ACC_DIVIDEND_TXT			='".GL_CFG_CLOSE_YEAR_ACC_DIVIDEND_TXT."'; \r\n";
	echo "Ext.GL_CFG_CLOSE_YEAR_ACC_PROFIT_UNALLOCATE_TXT	='".GL_CFG_CLOSE_YEAR_ACC_PROFIT_UNALLOCATE_TXT."'; \r\n";
	echo "Ext.GL_CFG_CLOSE_YEAR_ACC_PROFIT_YEAR_TXT			='".GL_CFG_CLOSE_YEAR_ACC_PROFIT_YEAR_TXT."'; \r\n";
	echo "Ext.GL_CFG_CLOSE_YEAR_LICENSE_ANALOG_TXT			='".GL_CFG_CLOSE_YEAR_LICENSE_ANALOG_TXT."'; \r\n";
	echo "Ext.GL_CFG_VOUCHER_TXT 							='".GL_CFG_VOUCHER_TXT ."'; \r\n";
	echo "Ext.GL_CFG_SET_CREDITOR_PRODUCT_TXT 				='".GL_CFG_SET_CREDITOR_PRODUCT_TXT ."'; \r\n";
	echo "Ext.GL_CFG_SET_CREDITOR_CONSTRUCTION_TXT 			='".GL_CFG_SET_CREDITOR_CONSTRUCTION_TXT ."'; \r\n";
?>
</script>
<script type="text/javascript" src="../lib/right/GrantPermission.php?_dc=<?php echo rand(0,100000); ?>&f=<?php echo $_SERVER["PHP_SELF"];?>"></script>
<!-- System ERP :: -->
<script type="text/javascript" src="js/GlDcConfig.js?_dc=<?php echo rand(0,100000); ?>"></script>
</head>
<body>
</body>
</html>