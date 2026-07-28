<?php include("../conf/config.php");
$ss_user_id = $_SESSION["user_id"] ?? null;
if (!$ss_user_id) { 
    session_destroy();
    echo "<script>window.location.href =\"".NMU_PERMISSION_HOST."/access/signin.php\"</script>";
    exit;
}
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
    <script type="text/javascript">
                Ext.C_CODE_SYS = "SP";
        if (!Ext.isEmpty(Ext.session)) {
            //console.log(Ext.session);
        } else {
            window.top.location.href = "../access/logout.php";
        }
    </script>
    <style>
        .buttonx {
            width: 100px;
            height: 60px;
            background: #fa4;
            border-radius: 5px;
            font-family: "Arial";
            font-size: 24px;
            border: 5px solid #afd;
        }

        .disabled-row {

            color: #15428b !important;
            text-decoration: line-through;
            font-style: italic !important;

        }

        .warning-label-style {
            font-weight: bold !important;
            color: red;
        }

        label[for=is_stockID],
        label[for=i_is_advanceID],
        label[for=i_is_advanceID],
        label[for=i_is_productID] {
            font-weight: bold !important;
        }

        .x-form-display-field {
            padding: 2px;
        }

        .topAlign {
            color: blue !important;
            border-bottom: 1px solid #ccc;
        }

        input.fqty {
            width: 80%;
        }

        .bnt-null {
            padding: 2px;
        }

        .td-succeed {
            background: #e4ffe4;
        }

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

        .color-green {
            background: #E4FFE4;
        }

        .color-red {
            background: #FFEBEB;
        }

        .color-grey {
            background: #E6E6E6;
        }

        .color-yellow {
            background: #FEF8C2;
        }

        .td-primary {
            background: #FEFAD1;
        }

        .td-quick {
            background: #FFC9C9;
        }

        .td-mark_delete {
            background: #FEF8C2;
        }

        .delete-color-red {
            background: #ff8282;
        }

        label[for^="bbf"] {
            font-weight: bold;
            text-align: right;
        }

        /* Chrome, Safari, Edge, Opera */
        input::-webkit-outer-spin-button,
        input::-webkit-inner-spin-button {
            -webkit-appearance: none;
            margin: 0;
        }

        /* Firefox */
        input[type=number] {
            -moz-appearance: textfield;
        }
    </style>
    <script type="text/javascript" src="../js/config_function.js?dc=<?= __VPRODUCT_ ?>"></script>

    <script type="text/javascript" src="./uiData/configStoreUi.js?_dc=<?= __VPRODUCT_; ?>"></script>
    <script type="text/javascript" src="CheckList/stores.js?_dc=<?= __VPRODUCT_; ?>"></script>
    <script type="text/javascript" src="CheckList/Function.js?_dc=<?= __VPRODUCT_; ?>"></script>
    <script type="text/javascript" src="CheckList/FormGridDtl.js?_dc=<?= __VPRODUCT_; ?>"></script>
    <script type="text/javascript" src="CheckList/FormGrid.js?_dc=<?= __VPRODUCT_; ?>"></script>
    </head>

<body>
</body>

</html>