<?php include("../conf/config.php") ;
include("./conf/configDc.php") ; ?>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">

<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <title><?php echo COMPANY_NAME; ?></title>
    <!-- System ERP :: Src js  -->
    <?php include("../lib/loadJs.php"); ?>
    <?php include("../lib/loadCss.php"); ?>
    <!-- System ERP :: -->
    <script type="text/javascript" src="../lib/right/GrantPermission.php?_dc=<?php echo __VPRODUCT_; ?>&f=<?php echo $_SERVER["PHP_SELF"]; ?>"></script>
 
        <script type="text/javascript">
            var BG_YEAR_START = <?php echo DC_PO_BG_YEAR_START ; ?>;
            var BG_YEAR_END = <?php echo DC_PO_BG_YEAR_END ; ?>; 
        </script>
       
    <script type="text/javascript" src="rep/Rep0003.js?_dc=<?php echo __VPRODUCT_; ?>"></script>
</head>

<body>
</body>

</html>