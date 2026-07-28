<?php include("../conf/config.php");

if (!isset($_SESSION['user_id'])) {
    echo "<script>window.top.location.href =\"../access/signin.php\"</script>";
    exit;
}
?>

<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">

<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <title><?php echo COMPANY_NAME;?></title>
    <!-- System ERP :: Src js  -->
    <?php include("../lib/loadJs.php"); ?>
    <?php include("../lib/loadCss.php"); 
        if (@$_REQUEST["access_by_nmu"] == 1) {
            echo '<link rel="stylesheet" type="text/css" title="gray" href="../js/ext-3.4.0/resources/css/xtheme-blue.css?dc_' . rand(0, 100000) . '" />';
        }
        if (@$_REQUEST["access_by_eis"] == 1) {
            echo '<link rel="stylesheet" type="text/css" title="gray" href="../js/ext-3.4.0/resources/css/xtheme-gray.css?dc_' . rand(0, 100000) . '" />';
        }
    ?>
    <script type="text/javascript">
        Ext.dc_user_id = <?= ($_SESSION["i_type_user"] == 1) ? $_SESSION["user_id"] : "0"; ?>;
    </script>
    <!-- System ERP :: -->
    <script type="text/javascript" src="../lib/right/GrantPermission.php?_dc=<?php echo __VPRODUCT_; ?>&f=<?php echo $_SERVER["PHP_SELF"]; ?>"></script>
    <!-- System ERP :: -->
    <script type="text/javascript" src="js/reports/RepSpContractPeriodnotorNew.js?_dc=<?php echo __VPRODUCT_; ?>"></script>
</head>

<body>
</body>

</html>