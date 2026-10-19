
<?php
include("../conf/config.php");
include("../lib/database/DatabaseServer.php");
include("../lib/database/apiUtil.php");
include("../lib/date/i_date.class.php");
if (!isset($_SESSION['user_id'])) {
    echo "<script>window.top.location.href =\"../access/signin.php\"</script>";
    exit;
}
$eisMenuName = 'ส่งคืนทักท้วง EIS';
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
            Ext.menu_name = <?= json_encode($eisMenuName, JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT) ?>;
        </script>
        <script type="text/javascript">
            Ext.SS_I_TYPE_USER = 3;
            Ext.SS_DC_COST_ACC_ID = 38;
        </script>

        <!-- System ERP :: -->
        <script type="text/javascript" src="../lib/right/GrantPermission.php?_dc=<?= __VPRODUCT_; ?>&f=<?php echo $_SERVER["PHP_SELF"]; ?>"></script>

        <script type="text/javascript" src="./uiData/configStoreUi.js?_dc=<?= __VPRODUCT_; ?>"></script>
        <!-- System ERP :: -->
        <p id="eis-handoff-status">กำลังเข้าสู่ระบบส่งคืนทักท้วง EIS...</p>
        <iframe id="eis-request-frame" src="about:blank" frameborder="0" style="display:none;overflow:hidden;height:100%;width:100%;position:absolute;top:0;left:0;right:0;bottom:0" height="100%" width="100%"></iframe>
        <script>
        (function () {
            var eisBase = <?= json_encode('/NMU_EIS', JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT) ?>;
            var centerUser = <?= json_encode((int) ($_SESSION['dc_center_user'] ?? 0)) ?>;
            var status = document.getElementById('eis-handoff-status');
            if (!centerUser) {
                status.textContent = 'ไม่พบบัญชีผู้ใช้ EIS ที่เชื่อมโยง กรุณาเข้าสู่ระบบจัดซื้อใหม่';
                return;
            }
            fetch(eisBase + '/access/login_1.php?handoff=1&ss_user_id=' + encodeURIComponent(centerUser), {
                credentials: 'include', cache: 'no-store'
            }).then(function (response) {
                if (!response.ok) throw new Error('EIS login failed');
                return response.json();
            }).then(function (result) {
                if (!result.success) throw new Error('EIS session was not created');
                var frame = document.getElementById('eis-request-frame');
                frame.src = eisBase + '/po/poProtest.php?_dc=' + Date.now();
                frame.style.display = 'block';
                status.style.display = 'none';
            }).catch(function () {
                status.textContent = 'ไม่สามารถเข้าสู่ระบบส่งคืนทักท้วง EIS ได้ กรุณาเข้าสู่ระบบจัดซื้อใหม่แล้วเปิดเมนูอีกครั้ง';
            });
        }());
        </script>
    </head>

    <body>
    </body>

</html>