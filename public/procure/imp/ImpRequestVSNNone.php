<?php
include("../conf/config.php");
include("../dc/conf/configDc.php");
include("../gl/conf/configGl.php");
?>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">

<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <title><?php echo COMPANY_NAME; ?></title>
    <!-- System ERP :: Src js  -->
    <?php include("../lib/loadJs.php"); ?>
    <?php include("../lib/loadCss.php"); ?>
    <style>
        .padd-6 {
            padding: 6px 0px;
        }
    </style>
    <script type="text/javascript">
        <?php 
            echo "Ext.DC_EXP_BG_ITYPE_VISIONNET		            =". DC_EXP_BG_ITYPE_VISIONNET . ";\r\n"; 
            echo "Ext.GL_CFG_SET_CREDITOR_PRODUCT				=".GL_CFG_SET_CREDITOR_PRODUCT."; \r\n"; 
            echo "Ext.GL_CFG_SET_CREDITOR_CONSTRUCTION			=".GL_CFG_SET_CREDITOR_CONSTRUCTION."; \r\n";  
            echo "Ext.GL_CFG_DEFAULT_CREDITOR_PRODUCT			=".GL_CFG_DEFAULT_CREDITOR_PRODUCT."; \r\n";   

        ?>
        Ext.ITYPE_JV = true; // นำเข้าค่าใช้จ่าย VISIONNET == true, บันทึกบัญชีค่าใช้จ่าย VISIONNET == false
        Ext.I_MENU_JVCR  = 1; 
    </script>
    <!-- System ERP :: -->
    <script type="text/javascript" src="../lib/right/GrantPermission.php?_dc=<?php echo rand(0, 100000); ?>&f=<?php echo $_SERVER["PHP_SELF"]; ?>"></script>
    <!-- System ERP :: -->
    <script type="text/javascript" src="func/ImpRequestVSNNone/stores.js?_dc=<?= __VPRODUCT_; ?>"></script>
    <script type="text/javascript" src="func/ImpRequestVSNNone/FormAdd.js?_dc=<?= __VPRODUCT_; ?>"></script>
    <script type="text/javascript" src="func/ImpRequestVSNNone/FormGrid.js?_dc=<?= __VPRODUCT_; ?>"></script>
    <script type="text/javascript" src="func/ImpRequestVSNNone/FormGridDtl.js?_dc=<?= __VPRODUCT_; ?>"></script>
    <script type="text/javascript" src="func/ImpRequestVSNNone/popDtlMini.js?_dc=<?php echo rand(0, 100000); ?>"></script>
</head>

<body>
</body>

</html>