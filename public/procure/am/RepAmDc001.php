<?php include("../conf/config.php"); ?>
<?php include("conf/config_am.php"); ?>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
		<head>
		<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
		<title><?php echo COMPANY_NAME;?></title> 
		 
	<!-- System ERP :: Src js  -->
		<?php include("../lib/loadJs.php"); ?> 
		<?php include("../lib/loadCss.php"); ?>  
	<!-- System ERP :: Permission -->
		<script type="text/javascript" src="../lib/right/GrantPermission.php?_dc=<?php echo rand(0,100000); ?>&f=<?php echo $_SERVER["PHP_SELF"];?>"></script>
	<!-- System ERP :: -->
<script type="text/javascript">
<?php
	// ข้อมูลสิ้นค้าเริ่มที่รหัส 90 (dc_inv_type->c_code)
	echo "Ext.CODE_INVENNTORY = ".CODE_INVENNTORY.";"; // พัสดุ(วัสดุ) หรือ ไม่ระบุ
	
	echo "Ext.STATUS_ENABLE = ".STATUS_ENABLE.";";  // ใช้งาน
	echo "Ext.STATUS_DISABLE = ".STATUS_DISABLE.";"; // ไม่ใช้งาน
?>

</script>
<script type="text/javascript" src="js/RepAmDc001.js?_dc=<?php echo rand(0,100000); ?>"></script>
<style>
.first { background: #E2E8E9; }
.second { background: #FFFFFF; }
</style>
</head>
<body>
</body>
</html>