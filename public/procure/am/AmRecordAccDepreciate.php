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
    echo "Ext.ASSET_CAL_POST_YES = ".ASSET_CAL_POST_YES."; // ลงบัญชีแล้ว";
?>
var i_add 		= true; //user_right_add;
var i_edit 		= true; //user_right_edit;
var i_delete            = true; //user_right_delete;
var i_read 		= true; //user_right_read;

user_right_add = false;
user_right_edit = false;
user_right_delete = false;
user_right_read = i_read;

</script>
<script type="text/javascript" src="js/AmRecordAccDepreciate.js?_dc=<?php echo rand(0,100000); ?>"></script>

<style>
.first { background: #E2E8E9; }
.second { background: #E2E8E9; }
.third { background: #C6D2D1; }
.fourth { background: #FFFFFF; }
	.my-label-style {
	    font-weight: bold;
	    font-size:12px;
	}	
	.message-label-style {
	    font-weight: bold;
	    color:red;
	    font-size:16px;
	    background-color:#ffffff;
	}
	.label-inv-style {
	    font-weight: bold;
	    color:blue;
	    font-size:12px;
	}
	.space-h{
		padding:11px;
	}
</style>		
</head>
<body>
</body>
</html>