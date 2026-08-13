<?php include("../conf/config.php"); ?>
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

        .td-quick {
            background: #FFC9C9;
        }

        .td-success {
            background: #e4ffe4;
        }

        .td-error {
            background: #ffe4e4;
        }
    </style>
    <title><?php echo COMPANY_NAME; ?></title>
    <!-- System ERP :: Src js  -->
    <?php include("../lib/loadJs.php"); ?>
    <?php include("../lib/loadCss.php"); ?>
    <script type="text/javascript">
        Ext.C_CODE_SYS = "PO";
        Ext.I_STATUS = 8; // หัวหน้าฝ่ายการคลังลงนามเช็ค
        Ext.I_STATUS_BEFORE = 7; // จัดทำเช็ค
    </script>
    <!-- System ERP :: -->
    <script type="text/javascript" src="../lib/right/GrantPermission.php?_dc=<?= __VPRODUCT_; ?>&f=<?php echo $_SERVER["PHP_SELF"]; ?>"></script>
    <script type="text/javascript" src="./uiData/configStoreUi.js?_dc=<?= __VPRODUCT_; ?>>"></script>
    <script type="text/javascript" src="../js/config_function.js?dc=<?= __VPRODUCT_ ?>"></script>

    <!-- System ERP :: -->
    <script type="text/javascript" src="func/dcUserCopyRight/stores.js?_dc=<?= __VPRODUCT_; ?>"></script>
    <script type="text/javascript" src="func/dcUserCopyRight/FormGrid.js?_dc=<?= __VPRODUCT_; ?>"></script>
</head>
<style>
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
</style>

<body>
</body>

</html>