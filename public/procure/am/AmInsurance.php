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
	echo "Ext.ASSET_STATUS_WAIT = ".ASSET_STATUS_WAIT.";"; //รอดำเนินการ
	echo "Ext.ASSET_STATUS_SUCCESS = ".ASSET_STATUS_SUCCESS.";"; //สมบูรณ์
?>
</script>
<script type="text/javascript" src="js/AmInsurance.js?_dc=<?php echo rand(0,100000); ?>"></script>
<style>
.first { background: #C6D2D1; }
.second { background: #E2E8E9; }
.third { background: #FFFFFF; }
.fourth { background: #E2E8E9; }
.bgblue{
	color:blue;
	background: #f0f4fa;
}
.space-h{
		padding:10px;
	}
</style>
</head>
<body>
</body>
</html>