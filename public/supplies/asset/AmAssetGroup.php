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
        .padd-2 {
            padding: 2px 0px;
        }

        .td-cost {
            background: #e4ffe4;
        }

        .td-total {
            background: #d8d8d8;
        }

        .strikeout {
            position: relative;
        }

        .strikeout:before {
            content: " ";
            position: absolute;
            top: 50%;
            left: 0;
            border-bottom: 1px solid #ff8484;
            width: 100%;
        }
    </style>
    <!-- System ERP :: -->
    <!-- <script type="text/javascript" src="../lib/right/GrantPermission.php?_dc=<?php echo rand(0, 100000); ?>&f=<?php echo $_SERVER["PHP_SELF"]; ?>"></script> -->
    <!-- System ERP :: -->
    <script type="text/javascript" src="func/AmAssetGroup/stores.js?_dc=<?= __VPRODUCT_; ?>"></script>
    <script type="text/javascript" src="func/AmAssetGroup/FormAdd.js?_dc=<?= __VPRODUCT_; ?>"></script>
    <script type="text/javascript" src="func/AmAssetGroup/FormGrid.js?_dc=<?= __VPRODUCT_; ?>"></script>
    <script type="text/javascript" src="func/AmAssetGroup/FormGridDtl.js?_dc=<?= __VPRODUCT_; ?>"></script>
</head>

<body>
</body>

</html>