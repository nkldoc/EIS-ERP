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
	echo "Ext.ASSET_TYPE_LAND = ".ASSET_TYPE_LAND."; // ที่ดิน \r\n";
	echo "Ext.ASSET_TYPE_EQUIP = ".ASSET_TYPE_EQUIP."; // อาคารและอุปกรณ์ \r\n";
        echo "Ext.ASSET_TYPE_VEHICLE = ".ASSET_TYPE_VEHICLE."; // พาหนะ \r\n";
?>
</script>
<link href="../js/treeTable/css/TreeGrid.css" rel="stylesheet" type="text/css" /> 
<script type="text/javascript" src="../js/treeTable/js/treetable.js"></script>
<script type="text/javascript" src="js/AmImport.js?_dc=<?php echo rand(0,100000); ?>"></script>
<style>
.bgblue{
	color:blue;
	background: #f0f4fa;
}
</style>
</head>
<body>
</body>
</html>