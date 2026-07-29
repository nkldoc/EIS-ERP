<?php
include("../conf/config.php");
include("../lib/database/DatabaseServer.php");
include("../lib/database/apiUtil.php");
include("../lib/date/i_date.class.php");
if (!isset($_SESSION['user_id'])) {
    echo "<script>window.top.location.href =\"../access/signin.php\"</script>";
    exit;
}
$db = new DatabaseServer();
 
?> 
<html xmlns="http://www.w3.org/1999/xhtml"> 
    <head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <title><?php echo COMPANY_NAME; ?></title>
    <!-- System ERP :: Src js  -->
    <?php include("../lib/loadJs.php"); ?>
    <?php include("../lib/loadCss.php"); ?>
    <!-- System ERP :: -->
    <script type="text/javascript" src="../lib/right/GrantPermission.php?_dc=<?= __VPRODUCT_; ?>&f=<?php echo $_SERVER["PHP_SELF"]; ?>"></script>
    <script type="text/javascript" src="./../js/RowExpander.js?_dc=<?= __VPRODUCT_; ?>"></script><!-- comment --><!-- System ERP :: -->
    <style>
        x-tab-panel-header .x-tab-panel-header-noborder .x-unselectable .x-tab-panel-header-plain {
            /*unicode-bidi: isolate;*/
            /*            font-variant-numeric: tabular-nums;
                            text-transform: none;
                text-indent: 0px !important;
                text-align: start !important;
                            text-align-last: start !important;*/
        }

    </style>
    <script type="text/javascript">
        Ext.title_panel = "ข้อมูลรายการทำสัญญา/";
        Ext.dc_rand = '_dc=<?= __VPRODUCT_; ?>';
    </script>



    <script type="text/javascript" src="./app/spContractGroup/stores.js?_dc=<?= __VPRODUCT_; ?>"></script>
    <script type="text/javascript" src="./app/spContractGroup/FormGrid.js?_dc=<?= __VPRODUCT_; ?>"></script>
    <script type="text/javascript" src="./app/spContractGroup/FormAdd.js?_dc=<?= __VPRODUCT_; ?>"></script>
    <script type="text/javascript" src="./app/spContractGroup/FormGridDtl.js?_dc=<?= __VPRODUCT_; ?>"></script>

    <script type="text/javascript" src="./app/spContractGroup/app.js?_dc=<?= __VPRODUCT_; ?>"></script>
    </head>
    <body>
</body>
</html>