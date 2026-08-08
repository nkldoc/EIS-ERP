<?php include("../conf/config.php"); ?>
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

        .td-cost {
            background: #e4ffe4;
        }

        .td-total {
            background: #d8d8d8;
        }

        .td-total {
            background: #d8d8d8;
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

    </style>
    <script type="text/javascript">
        Ext.console = false;
        Ext.C_CODE_SYS = "SP";
    </script>
    <!-- System ERP :: -->
    <script type="text/javascript" src="../lib/right/GrantPermission.php?_dc=<?php echo rand(0, 100000); ?>&f=<?php echo $_SERVER["PHP_SELF"]; ?>"></script>
    <script type="text/javascript" src="../js/config_function.js?dc=<?= __VPRODUCT_ ?>"></script>
    <!-- System ERP :: -->
    <script type="text/javascript" src="func/spSetUserCostSysSP/stores.js?_dc=<?= __VPRODUCT_; ?>"></script>
    <script type="text/javascript" src="func/spSetUserCostSysSP/FormAdd.js?_dc=<?= __VPRODUCT_; ?>"></script>
    <script type="text/javascript" src="func/spSetUserCostSysSP/FormGrid.js?_dc=<?= __VPRODUCT_; ?>"></script>
</head>

<body>
</body>

</html>