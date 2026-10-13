<?php
include("../conf/config.php");
?>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">

<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <style>
        .loader {
            border: 4px solid #B9B9B9;
            border-radius: 50%;
            border-top: 4px solid #3498db;
            width: 12px;
            height: 12px;
            -webkit-animation: spin 1s linear infinite;
            /* Safari */
            animation: spin 1s linear infinite;
        }
    </style>
    <title><?php echo COMPANY_NAME; ?></title>
    <!-- System ERP :: Src js  -->
    <?php include("../lib/loadJs.php"); ?>
    <?php include("../lib/loadCss.php"); ?>
    <script type="text/javascript">
        Ext.I_STATUS = 2;
        Ext.SS_I_TYPE_USER = <?php echo $_SESSION["i_type_user"]; ?>;
        Ext.SS_DC_COST_ID = <?php echo $_SESSION["dc_cost_id"]; ?>;
    </script>
    <!-- System ERP :: -->
    <script type="text/javascript" src="../lib/right/GrantPermission.php?_dc=<?= __VPRODUCT_; ?>&f=<?php echo $_SERVER["PHP_SELF"]; ?>"></script>
    <script type="text/javascript" src="./uiData/configStoreUi.js?_dc=<?= __VPRODUCT_; ?>>"></script>
    <!-- System ERP :: -->
    <script type="text/javascript" src="func/poStatusCost/stores.js?_dc=<?= __VPRODUCT_; ?>"></script>
    <script type="text/javascript" src="func/poStatusCost/FormAdd.js?_dc=<?= __VPRODUCT_; ?>"></script>
    <script type="text/javascript" src="func/poStatusCost/FormGrid.js?_dc=<?= __VPRODUCT_; ?>"></script>
</head>

<body>
</body>

</html>