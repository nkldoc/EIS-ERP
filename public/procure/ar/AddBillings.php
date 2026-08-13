<?php 	include("../conf/config.php"); 
		include("conf/configAR.php");
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
		<script type="text/javascript" src="./js/configStoreUi.js?_dc=<?php echo rand(0,100000); ?>"></script>  
	<!-- System ERP :: --> 
	<script type="text/javascript" src="js/AddBillings.js?_dc=<?php echo rand(0,100000); ?>"></script>
	<script type="text/javascript">
		var i_add 			= user_right_add;
		var i_read 			= user_right_read;
		var i_edit          = user_right_edit;
		var i_delete        = user_right_delete;   
		
		Ext.global = Ext.apply({customer_th:'<?php echo CUSTOMER_NAME_TH?>',});
		
	</script>
    </head>
    <body>
    </body>
</html>