<?php
include("../conf/config.php");
include("./conf/configDc.php");
include("../lib/database/DatabaseServer.php");
include("../lib/database/apiUtil.php");
include("../lib/date/i_date.class.php"); //pageStatus.class
include("./class/pageStatus.class.php"); //pageStatus.class
$db = new DatabaseServer();
$pg = new clsPageStatus($db, $_GET["st"] ?? $_SESSION["st"]);
$_SESSION["st"] = $_GET["st"] ?? $_SESSION["st"];
$js = $pg->get_js() . ".js?__dc=" . __VPRODUCT_;
?>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">

    <head>
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
        <title><?php echo COMPANY_NAME; ?></title>
        <!-- System ERP :: Src js  -->
        <?php include("../lib/loadJs.php"); ?>
        <?php include("../lib/loadCss.php"); ?>
        <!-- System ERP :: -->
        <script type="text/javascript" src="../lib/right/GrantPermission.php?_dc=<?= __VPRODUCT_; ?>&f=<?php echo $_SERVER["PHP_SELF"]; ?>"></script>
        <!-- System ERP :: -->

        <script type="text/javascript" src="dc/js/DcExpenseAccVSN.js?_dc=<?php echo rand(0, 100000); ?>"></script>
    </head>
    <body>
    </body>
</html>