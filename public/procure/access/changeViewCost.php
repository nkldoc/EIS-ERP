<?php


include("../conf/config.php");
require_once("../conf/config.php");

if (@$_SESSION['user_id'] != 1) {
    echo "<script>location.href = \"https://\" + location.host + \"/nmu_eis/\"</script>";
    exit;
}
?>



<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">

<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <title>.:: Chula กำหนดมุมมอง </title>
    <!-- System ERP :: Src js  -->
    <?php include("../lib/loadJs.php"); ?>
    <?php include("../lib/loadCss.php"); ?>
    <!-- System ERP :: -->
    <link rel="stylesheet" type="text/css" title="gray" href="../js/ext-3.4.0/resources/css/xtheme-gray.css" />




    <script type="text/javascript">
        Ext.i_type_user = <?= $_SESSION['i_type_user'] ?>;
    </script>
    <script type="text/javascript" src="../lib/right/GrantPermission.php?_dc=<?php echo rand(0, 100000); ?>&f=<?php echo $_SERVER["PHP_SELF"]; ?>"></script>

    <script type="text/javascript" src="../js/config_function.js?dc=<?= __VPRODUCT_ ?>"></script>
    <script type="text/javascript" src="js/changeViewCost.js?_dc=<?= __VPRODUCT_; ?>"></script>
</head>

<body>
</body>

</html>