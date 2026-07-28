<?php //Test
 require_once __DIR__ . "/../conf/config.php";
 require_once __DIR__ . "/../lib/database/DatabaseServer.php";
 require_once __DIR__ . "/../lib/database/apiUtil.php";
 require_once __DIR__ . "/../lib/date/i_date.class.php"; //pageStatus.class
 require_once __DIR__ . "/class/pageStatus.class.php"; //pageStatus.class
 if (!isset($_SESSION['user_id'])) {
    echo "<script>window.top.location.href =\"../access/signin.php\"</script>";
    exit;
}
 $db = new DatabaseServer();
 $pg = new clsPageStatus($db, $_GET["st"] ?? $_SESSION["st"]);
 $_SESSION["st"] = $_GET["st"] ?? $_SESSION["st"];
 $js = $pg->get_js() . ".js?__dc=" . __VPRODUCT_;
?>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">

    <head>
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
        <base href="/supplies/sp/" />
        <title><?php echo COMPANY_NAME; ?></title>
        <!-- System ERP :: Src js  -->
        <?php include __DIR__ . "/../lib/loadJs.php"; ?>
        <?php include __DIR__ . "/../lib/loadCss.php"; ?>
        <!-- System ERP :: -->
        <script type="text/javascript" src="../lib/right/GrantPermission.php?_dc=<?= __VPRODUCT_; ?>&f=<?php echo $_SERVER["PHP_SELF"]; ?>"></script>
        <!-- System ERP :: -->
        <script type="text/javascript" src="./js/helps/checkingHelp.js?_dc=<?= __VPRODUCT_; ?>"></script>
        <script type="text/javascript">
                /*
                 * IIS canonicalizes *.php to an extensionless URL with HTTP 301.
                 * Browsers may turn a POST into GET while following that redirect,
                 * which drops the request body. Normalize the affected ExtJS API
                 * URLs before the request is sent so mode/type remain intact.
                 */
                (function installIisPostUrlNormalizer() {
                    if (!Ext.data || !Ext.data.Connection || Ext.iisPostUrlNormalizerInstalled) {
                        return;
                    }

                    var originalRequest = Ext.data.Connection.prototype.request;
                    var affectedEndpoints = /(mnCheckingController|All_PoWorkingImpHdr)\.php(?=([?#]|$))/i;

                    Ext.data.Connection.prototype.request = function (options) {
                        if (options && typeof options.url === "string") {
                            options.url = options.url.replace(affectedEndpoints, "$1");
                        }

                        return originalRequest.call(this, options);
                    };

                    Ext.iisPostUrlNormalizerInstalled = true;
                }());

                //--------config ---------------------------------------------------------------
                Ext.menu_name = '<?PHP echo "{$pg->get_menu()}"; $_SESSION['menu'] = "{$pg->get_menu()}"; ?>';
                Ext.menu_code = '<?PHP echo "{$pg->get_code()}"; ?>';
                Ext.menu_id = <?PHP echo "{$pg->get_id()}"; ?>;
                Ext.menu_type_id = <?PHP echo "{$pg->get_type_id()}"; ?>;
                Ext.menu_i_alarm = <?PHP echo "{$pg->get_i_alarm()}"; ?>;
                Ext.menu_i_day = <?PHP echo "{$pg->get_i_day()}"; ?>;
                Ext.menu_i_config = <?PHP echo "{$pg->get_i_config()}"; ?>;
                Ext.menu_js = '<?PHP echo "{$pg->get_js()}"; ?>';
                Ext.pOntimePass = '<?PHP echo STATIC_HOURLY_TOKEN; ?>';

                console.log(
                    '\n\r f_under_rate =>' + Ext.f_under_rate
                    +'\n\r menu_code =>' + Ext.menu_code
                    +'\n\r menu_name =>' + Ext.menu_name
                );
        
                //------------------------------------------------------------------------------
        </script>

        <script type="text/javascript" src="./uiData/configStoreUi.js?_dc=<?= __VPRODUCT_; ?>"></script>
        <script type="text/javascript" src="../js/config_function.js?dc=<?= __VPRODUCT_ ?>"></script>
        <script type="text/javascript" src="./tor/receive-validation/ui/receive-validation-history.js?_dc=<?= __VPRODUCT_; ?>"></script>
        <script type="text/javascript" src="./tor/<?PHP echo $js; ?>"></script>
        <!-- <script type="text/javascript" src="./tor/deliverWork.js?_dc=<?= __VPRODUCT_; ?>"></script> -->
        <!-- <script type="text/javascript" src="./tor/pageStatus.js?_dc=<?= __VPRODUCT_; ?>"></script> -->
        <style type="text/css">
        #i_status_checkingID input[type="radio"]:checked+label {
            font-weight: bold;
            border-bottom: 1px solid #000;
            text-decoration: underline;
        }

        .ext-el-mask {
             background-color: #ffff; 
             opacity : 0;
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
        .row-highlight .x-grid3-cell {
            background: #ffe48d !important;
            font-weight: bold;
        }
    </style>
    </head>

    <body>
    </body>

</html>
