<?php
include("../conf/config.php");
if (!isset($_SESSION['user_id'])) {
    $signinUrl = defined('ADMIN_UPDATE_PR_DIRECTORY_ENTRY') ? '../../access/signin.php' : '../access/signin.php';
    echo '<script>window.top.location.href = ' . json_encode($signinUrl) . ';</script>';
    exit;
}
?>

<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">

    <head>
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
        <title><?php echo COMPANY_NAME; ?></title>
        <?php if (defined('ADMIN_UPDATE_PR_DIRECTORY_ENTRY')) { ?>
            <base href="../" />
        <?php } ?>
        <!-- System ERP :: Src js  -->
        <?php include("../lib/loadJs.php"); ?>
        <?php include("../lib/loadCss.php"); ?>
        <!-- System ERP :: -->
        <?php $permissionDir = defined('ADMIN_UPDATE_PR_DIRECTORY_ENTRY') ? dirname(dirname($_SERVER["PHP_SELF"])) : dirname($_SERVER["PHP_SELF"]); ?>
        <script type="text/javascript" src="../lib/right/GrantPermission.php?_dc=<?= __VPRODUCT_; ?>&f=<?php echo $permissionDir; ?>/AdminUpdatePR.php"></script>
        <!-- System ERP :: -->
        <script type="text/javascript">
            if (!Ext.isEmpty(Ext.session)) {
                console.log(Ext.session);
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

            /* Employee directory toolbar actions (Ext JS 3 button markup). */
            .employee-action { margin: 0 3px; }
            .employee-action td { background: none !important; }
            .employee-action button {
                min-height: 30px;
                padding: 5px 13px !important;
                border: 1px solid #b9cce3;
                border-radius: 5px;
                background: #fff;
                color: #245487;
                font-weight: bold;
                cursor: pointer;
            }
            .employee-action-secondary button:hover { background: #edf5ff; border-color: #7da6d3; }
            .employee-action-primary button { background: #245da3; border-color: #245da3; color: #fff; }
            .employee-action-primary button:hover { background: #1b4c89; border-color: #1b4c89; }
            .employee-action button:focus { outline: 2px solid #7fb2ee; outline-offset: 2px; }
            .employee-action.x-item-disabled button { background: #e8edf3; border-color: #ccd6e2; color: #8796a8; cursor: default; }

            .row-highlight .x-grid3-cell {
                background: #ffe48d !important;
                font-weight: bold;
            }
            .row-disabled-strike {
                text-decoration: line-through;
                text-decoration-color: red; /* กำหนดให้เส้นคาดเป็นสีแดง */
                color: #999; /* (Option) ปรับสีตัวอักษรให้จางลงเล็กน้อยเพื่อให้ดูเหมือนถูกปิดใช้งาน */
            }
        </style>
        <script type="text/javascript" src="adminupdatepr/stores.js?_dc=<?= __VPRODUCT_; ?>"></script>
        <script type="text/javascript" src="adminupdatepr/FormAdd.js?_dc=<?= __VPRODUCT_; ?>"></script>
        <script type="text/javascript" src="adminupdatepr/FormGrid.js?_dc=<?= __VPRODUCT_; ?>"></script>
        <script type="text/javascript" src="adminupdatepr/FormGridDtl.js?_dc=<?= __VPRODUCT_; ?>"></script>
        <script type="text/javascript" src="tor/contractDetails.js?_dc=<?= filemtime(__DIR__ . '/tor/contractDetails.js'); ?>"></script>
        <script type="text/javascript" src="adminupdatepr/AdminManagement.js?_dc=<?= __VPRODUCT_; ?>"></script>
    </head>

    <body>
    </body>

</html>
