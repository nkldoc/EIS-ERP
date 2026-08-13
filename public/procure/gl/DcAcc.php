<?php
include("../conf/config.php");
include("../lib/database/DatabaseServer.php");

$db 	= new DatabaseServer();
?>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
<title><?php echo COMPANY_NAME;?></title>
<!-- System ERP :: Src js  -->
<?php include("../lib/loadJs.php"); ?>
<?php include("../lib/loadCss.php"); ?>
<?php

	$gl	= $db->GetDataBySQL("SELECT * FROM gl_config_dc_acc", array());

	if(!$gl) {
		echo "<script>alert('กรุณาตั้งค่าที่เมนู ( config ผังบัญชี ) ก่อน');</script>";
		exit;
	} else {
		
		$i_level	= $gl["i_level_all"];
		for ($i=1;$i<=$i_level;$i++) { $lv[] = $gl["i_level".$i]; }
		
		if(is_array($lv)) {
			echo "<script type='text/javascript'>";
			echo "	var lv	= [];";
			echo "	level	= ".$i_level.";";
			foreach ( $lv AS $index => $position ) {
				echo "lv[".$index."]	= ".$position.";";
			}
			echo "</script>";
		}
	}
?>
<!-- System ERP :: -->
<script type="text/javascript" src="../lib/right/GrantPermission.php?_dc=<?php echo rand(0,100000); ?>&f=<?php echo $_SERVER["PHP_SELF"];?>"></script>
<!-- System ERP :: -->
<script type="text/javascript" src="js/DcAcc.js?_dc=<?php echo rand(0,100000); ?>"></script>
</head>
<body>
</body>
</html>