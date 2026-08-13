<?php 	include("../conf/config.php"); 
		include("conf/configAr.php");
// 		print_r($arr_product_type_region); exit;
?>
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
	echo "Ext.AR_CLASS_TYPE_TV					= ".AR_CLASS_TYPE_TV."; //โทรทัศน์  \r\n";
	echo "Ext.AR_CLASS_TYPE_RADIO				= ".AR_CLASS_TYPE_RADIO." //วิทยุ \r\n"; 
	echo "Ext.AR_CLASS_TYPE_JOIN				= ".AR_CLASS_TYPE_JOIN."; //รายได้จากการร่วมดำเนินกิจการ  \r\n";
	echo "Ext.AR_CLASS_TYPE_PROJECT				= ".AR_CLASS_TYPE_PROJECT." //โครงการ \r\n";
	echo "Ext.AR_CLASS_TYPE_PERIOD				= ".AR_CLASS_TYPE_PERIOD."; //รายได้ที่เป็นงวด  \r\n";
	echo "Ext.AR_CLASS_TYPE_OTHER				= ".AR_CLASS_TYPE_OTHER." //รายได้อื่นๆ \r\n"; 
	echo "Ext.AR_REPOER_GROUP_TYPE_ADVERTISE	= ".AR_REPOER_GROUP_TYPE_ADVERTISE."; //โฆษณา  \r\n";
	echo "Ext.AR_REPOER_GROUP_TYPE_RENT			= ".AR_REPOER_GROUP_TYPE_RENT." //เช่าเวลา  \r\n"; 
	
	echo "Ext.AR_PROCUT_TYPE_CENTER				= ".AR_PROCUT_TYPE_CENTER.";   \r\n";
	echo "Ext.AR_PROCUT_TYPE_REGION				= ".AR_PROCUT_TYPE_REGION.";    \r\n"; 
	echo "Ext.AR_PROCUT_TYPE_OTHER				= '0';   \r\n"; 
	echo "Ext.AR_PROCUT_TEXT_OTHER				= 'อื่นๆ';  \r\n"; 
	echo "Ext.AR_PROCUT_TEXT_CENTER				= '".$arr_product_type_region[AR_PROCUT_TYPE_CENTER]."';  \r\n";
	echo "Ext.AR_PROCUT_TEXT_REGION				= '".$arr_product_type_region[AR_PROCUT_TYPE_REGION]."';   \r\n"; 
	?>

	</script>
	<script type="text/javascript" src="js/DcPayment.js?_dc=<?php echo rand(0,100000); ?>"></script>
	<style>
	#ext-comp-1080{ color:red; }
	</style>
</head>
<body>
</body>
</html>