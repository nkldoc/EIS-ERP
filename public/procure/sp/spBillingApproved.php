<?php
include("../conf/config.php");
include("../lib/database/DatabaseServer.php");
include("../lib/database/apiUtil.php");
include("../lib/date/i_date.class.php");
//
//print_r($_SESSION);
//exit();
if (!isset($_SESSION['user_id'])) {
    echo "<script>window.top.location.href =\"../access/signin.php\"</script>";
    exit;
}
$i_is_ap = $_REQUEST["i_is_ap"] ?? null;
// This standalone billing page loads its own script below; no TOR status is required.
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
        .td-succeed {
            background: #e4ffe4;
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

        /*        .x-panel-body .x-panel-body-noheader{
                    background: #ccc !important;
                }*/
    </style>
    <script type="text/javascript">
        //--------config ---------------------------------------------------------------
        Ext.menu_name = 'อัพโหลด PDF เอกสารก่อส่งเบิก';
        Ext.appFromAp = <?PHP echo ($i_is_ap == true) ? 1 : 0; ?>;
        //?i_is_ap=true
        Ext.DateCreate = new Date('2023-10-20').format("d-m-Y");
//        Ext.DateCreate = new Date().format("d-m-Y");
        
        console.log('\n\r CODE =>' + Ext.menu_code +
            '\n\r menu_id สถานะ TOR => ' + Ext.menu_id +
            '\n\r menu_i_entrance สถานะ TOR => ' + Ext.menu_i_entrance +
            '\n\r menu_type_id วิธีดำเนินงาน => ' + Ext.menu_type_id +
            '\n\r Alarm => ' + Ext.menu_i_alarm +
            '\n\r PA => ' + Ext.menu_i_day +
            '\n\r Menu => ' + Ext.menu_name +
            '\n\r menu_js => ' + Ext.menu_js +
            '\n\r menu_js => ' + Ext.menu_i_last +
            '\n\r menu_i_config => ' + Ext.menu_i_config
        );
        //------------------------------------------------------------------------------
    </script> 
    <script type="text/javascript" src="./uiData/configStoreUi.js?_dc=<?= __VPRODUCT_; ?>"></script>
    <script type="text/javascript" src="./tor/torUiBilling.js?_dc=<?= __VPRODUCT_; ?>"></script>
    <script type="text/javascript" src="../alert/js/RowExpander.js?_dc=<?= __VPRODUCT_; ?>"></script>
    <script type="text/javascript" src="./tor/spBillingApproved.js?_dc=<?= __VPRODUCT_; ?>"></script>
    <script type="text/javascript" src="./tor/pageStatus.js?_dc=<?= __VPRODUCT_; ?>"></script>
</head>

<body>
</body>

</html>