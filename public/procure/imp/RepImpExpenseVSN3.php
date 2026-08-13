<?php
include("../conf/config.php");
include("../dc/conf/configDc.php");
?>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">

<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <title><?php echo COMPANY_NAME; ?></title>
    <!-- System ERP :: Src js  -->
    <?php include("../lib/loadJs.php"); ?>
    <?php include("../lib/loadCss.php"); ?>
    <script type="text/javascript">
        Ext.TYPE_PAGE = "vsn3";
        <?php echo "Ext.DC_EXP_BG_ITYPE_EPHYS = " . DC_EXP_BG_ITYPE_EPHYS . ";\r\n";  ?>
        <?php echo "Ext.DC_EXP_BG_ITYPE_VISIONNET = " . DC_EXP_BG_ITYPE_VISIONNET . ";\r\n";  ?>
    </script>
    <!-- System ERP :: -->
    <script type="text/javascript" src="../lib/right/GrantPermission.php?_dc=<?php echo rand(0, 100000); ?>&f=<?php echo $_SERVER["PHP_SELF"]; ?>"></script>
    <!-- System ERP :: -->
    <script type="text/javascript" src="js/RepImpExpense.js?_dc=<?php echo rand(0, 100000); ?>"></script>
</head>

<body>
</body>

</html>