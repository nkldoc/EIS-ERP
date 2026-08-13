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
	// ข้อมูลระดับของข้อมูลหลักสินค้า
	echo "Ext.TREE_LEVEL_START = ".TREE_LEVEL_START."; // เริ่มที่ Lv0 \r\n";
	echo "Ext.TREE_LEVEL_END = ".TREE_LEVEL_END."; // สิ้นสุดที่ Lv3 \r\n";
	echo "Ext.TREE_LEVEL_MAP_ACC = ".TREE_LEVEL_MAP_ACC."; // สามารเลือกรายการบัญชีได้ที่ Lv1\r\n";
	
        // ประเภทสินทรัพย์ (dc_inv_type->asset_type)
	echo "Ext.ASSET_TYPE_LAND = ".ASSET_TYPE_LAND.";"; //// ที่ดิน
        echo "Ext.ASSET_TYPE_EQUIP = ".ASSET_TYPE_EQUIP.";"; //// อาคารและอุปกรณ์
        echo "Ext.ASSET_TYPE_VEHICLE = ".ASSET_TYPE_VEHICLE.";"; //// พาหนะ
?>
</script>
<script type="text/javascript" src="js/DcAssetType.js?_dc=<?php echo rand(0,100000); ?>"></script>
</head>
<body>
</body>
</html>