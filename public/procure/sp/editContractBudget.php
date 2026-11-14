<?php include("../conf/config.php");
if (!isset($_SESSION['user_id'])) {
    echo '<script>window.top.location.href = "../access/signin.php";</script>';
    exit;
}
?>

<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
    <head>
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
        <title><?php echo COMPANY_NAME ; ?></title>
        <!-- System ERP :: Src js  -->
        <?php include("../lib/loadJs.php") ; ?>
        <?php include("../lib/loadCss.php") ; ?>
        <!-- System ERP :: -->
        <script type="text/javascript" src="../lib/right/GrantPermission.php?_dc=<?=__VPRODUCT_ ; ?>&f=<?php echo $_SERVER["PHP_SELF"]; ?>"></script>
        <!-- System ERP :: -->
        <style>
            .warning-label-style {
                font-weight: bold !important;
                color: red;
            }
            .x-form-display-field {
                padding: 2px;
            }
            .topAlign {
                color: blue !important;
                border-bottom: 1px solid #ccc;
            }
        </style>
        <script type="text/javascript">
            //--------config ---------------------------------------------------------------
            Ext.page_code = 'EDIT_CONTRACT_BG';
            // ดึงพารามิเตอร์ contract_id จาก URL
            var urlParams = new URLSearchParams(window.location.search);
            Ext.contract_id_from_url = urlParams.get('id') || null;
            console.log('\n\r CODE => ' + Ext.page_code);
            console.log('\n\r Contract ID from URL => ' + Ext.contract_id_from_url);
            //------------------------------------------------------------------------------
        </script>

        <script type="text/javascript" src="../js/config_function.js?dc=<?= __VPRODUCT_ ?>"></script>
        <script type="text/javascript" src="./js/validationForm.js?dc=<?= __VPRODUCT_; ?>"></script>
        <script type="text/javascript" src="./uiData/configStoreUi.js?_dc=<?= __VPRODUCT_; ?>"></script>
        <script type="text/javascript" src="./editBudgetUi/stores.js?_dc=<?= __VPRODUCT_; ?>"></script>
        <script type="text/javascript" src="./editBudgetUi/FormAdd.js?_dc=<?= __VPRODUCT_; ?>"></script>
        <script type="text/javascript" src="./editBudgetUi/FormGrid.js?_dc=<?= __VPRODUCT_; ?>"></script>
    </head>

    <body>
    </body>
</html>
