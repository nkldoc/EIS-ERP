
<?php
include("../conf/config.php");
include("../lib/database/DatabaseServer.php");
include("../lib/database/apiUtil.php");
include("../lib/date/i_date.class.php");
if (!isset($_SESSION['user_id'])) {
    echo "<script>window.top.location.href =\"../access/signin.php\"</script>";
    exit;
}
// This page embeds the EIS protest screen; it does not require a TOR status.
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
        <style>
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

            label[for^="bbf"] {
                font-weight: bold;
                text-align: right;
            }

            .x-item-disabled {
                color: black;
                cursor: default;
                opacity: 1;
                /* filter: alpha(opacity=90); */
            }

            .x-item-disabled * {
                color: black !important;
            }

            .ext-el-mask {
                background-color: transparent ;
            }

            /* .ux-item-disabled .x-form-field,
            .ux-item-disabled .x-form-display-field,
            .ux-item-disabled .x-form-trigger {
                filter: alpha(opacity=30);
                opacity: .3;
            } */

            /* .x-item-disabled .x-form-item-label,
            .x-form-check-wrap .x-item-disabled,
            .x-item-disabled .x-form-cb-label {
                filter: progid:DXImageTransform.Microsoft.Alpha(Opacity=90);
                opacity: 0.9;
            } */


            /*        .x-panel-body .x-panel-body-noheader{
                        background: #ccc !important;
                    }*/
        </style>

        <script type="text/javascript">
            Ext.SS_I_TYPE_USER = 3;
            Ext.SS_DC_COST_ACC_ID = 38;
        </script>

        <!-- System ERP :: -->
        <script type="text/javascript" src="../lib/right/GrantPermission.php?_dc=<?= __VPRODUCT_; ?>&f=<?php echo $_SERVER["PHP_SELF"]; ?>"></script>
        
        <script type="text/javascript" src="./uiData/configStoreUi.js?_dc=<?= __VPRODUCT_; ?>"></script>
        <!-- System ERP :: -->
        <iframe src="<?= OST_HOST ?>://<?= NMU_EIS_HOST ?>/access/login_1.php?ss_user_id=<?= $_SESSION['dc_center_user'] ?>" style="position: absolute; width:0; height:0; border:0;" height="1" width="1"></iframe>
        <iframe src="<?= OST_HOST ?>://<?= NMU_HOST ?>/access/login_1.php?ss_user_id=<?= $_SESSION['dc_center_user'] ?>" style="position: absolute; width:0; height:0; border:0;" height="1" width="1"></iframe>
        <iframe src="<?= OST_HOST ?>://<?= NMU_PERMISSION_HOST ?>/access/login_1.php?ss_user_id=<?= $_SESSION['dc_center_user'] ?>" style="position: absolute; width:0; height:0; border:0;" height="1" width="1"></iframe>
        <iframe src="<?= OST_HOST ?>://<?= FM_NMU_HOST ?>/access/login_1.php?ss_user_id=<?= $_SESSION['dc_center_user'] ?>" style="position: absolute; width:0; height:0; border:0;" height="1" width="1"></iframe>
            
        <iframe src="<?= OST_HOST ?>://<?= NMU_EIS_HOST ?>/po/poProtest.php?_dc=<?= __VPRODUCT_; ?>" frameborder="0" style="overflow:hidden;overflow-x:hidden;overflow-y:hidden;height:100%;width:100%;position:absolute;top:0px;left:0px;right:0px;bottom:0px" height="100%" width="100%"></iframe>

    </head>

    <body>
    </body>

</html>