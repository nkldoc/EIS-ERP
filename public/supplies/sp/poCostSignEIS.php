
<?php
include("../conf/config.php");
include("../lib/database/DatabaseServer.php");
include("../lib/database/apiUtil.php");
include("../lib/date/i_date.class.php");
if (!isset($_SESSION['user_id'])) {
    echo "<script>window.top.location.href =\"../access/signin.php\"</script>";
    exit;
}
$db = new DatabaseServer();

// $Date = date('Y-m-d'); //"2010-09-17";
// echo date('Y-m-d', strtotime($Date . ' + 1 days'));
// echo "<br/>";
// echo date('Y-m-d', strtotime($Date . ' + 2 days'));
// exit();

class clsPageStatus {

    private $temp;

    function __construct($db, $req) {
        $this->db = $db;
        $this->req_name = $req;

        $stmt = $this->db->QueryParam("select [sp_status_hdr_id] as id "
                . ",[sp_type_status_id] as type_id "
                . ", js"
                . ", c_code"
                . ", c_name"
                . ", i_alarm"
                . ", i_day"
                . ", i_config "
                . ", i_entrance "
                . ", i_seq "
                . ", isnull(i_last,0) as i_last"
                . ", isnull(code_tomenu,'') as code_tomenu"
                //get_code_tomenu
                . " from dbo.sp_status_hdr "
                . "where c_code=?", array($this->req_name));
        while ($row = $db->Fetch($stmt)) {
            $this->temp = array(
                "id" => $row["id"] ?? 0,
                "type_id" => $row["type_id"] ?? 0, //
                "i_seq" => $row["i_seq"] ?? 0, //
                "js" => $row["js"] ?? null,
                "c_code" => $row["c_code"] ?? null,
                "c_name" => $row["c_name"] ?? 0,
                "i_last" => $row["i_last"],
                "code_tomenu" => $row["code_tomenu"],
                "i_day" => $row["i_day"] ?? 0,
                "i_last" => $row["i_last"] ?? 0,
                "i_alarm" => $row["i_alarm"] ?? 0,
                "i_entrance" => $row["i_entrance"] ?? 0,
                "i_config" => $row["i_config"] ?? 0
            );
        }
    }

    // Methods
    function set_name($name) {
        $this->name = $name;
    }

    function get_name() {
        return $this->name;
    }

    function get_id() {
        return $this->temp['id'];
    }

    function get_type_id() {
        return $this->temp['type_id'];
    }

    function get_i_alarm() {
        return $this->temp['i_alarm'];
    }

    function get_i_day() {
        return $this->temp['i_day'];
    }

    function get_i_config() {
        return $this->temp['i_config'];
    }

    function get_js() {
        return $this->temp['js'];
    }

    function get_i_last() {
        return $this->temp['i_last'];
    }

    function get_i_entrance() {
        return $this->temp['i_entrance'];
    }

    function get_code() {
        return $this->temp['c_code'];
    }

    function get_code_tomenu() {
        return $this->temp['code_tomenu'];
    }

    function get_menu() {
        return $this->temp['c_name'];
    }

}

$pg = new clsPageStatus($db, $_GET["st"] ?? $_SESSION["st"]);
$_SESSION["st"] = $_GET["st"] ?? $_SESSION["st"];
$js = $pg->get_js() . ".js?__dc=" . __VPRODUCT_;
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
            Ext.menu_name = '<?PHP echo "{$pg->get_menu()}"; $_SESSION['menu'] = "{$pg->get_menu()}"; ?>';
                Ext.menu_code = '<?PHP echo "{$pg->get_code()}"; ?>';
                Ext.menu_id = <?PHP echo "{$pg->get_id()}"; ?>;
                Ext.menu_type_id = <?PHP echo "{$pg->get_type_id()}"; ?>;
                Ext.menu_i_alarm = <?PHP echo "{$pg->get_i_alarm()}"; ?>;
                Ext.menu_i_day = <?PHP echo "{$pg->get_i_day()}"; ?>;
                Ext.menu_i_config = <?PHP echo "{$pg->get_i_config()}"; ?>;
                Ext.menu_js = '<?PHP echo "{$pg->get_js()}"; ?>';

                console.log(
                    ''  
                    +'\n\r menu_code =>' + Ext.menu_code
                    +'\n\r menu_name =>' + Ext.menu_name
                );
                // Ext.onReady(function () {
                //     var window = new Ext.Window({
                //     hidden: true,
                //     id : "login-eis",
                //     items: new Ext.form.FormPanel({
                //         id: "login-form",
                //         baseCls: "x-plain",
                //         hidden: true,    
                //         items: [],
                //     }),
                // }).show();
                // var iframe = document.createElement("iframe");
                // iframe.style.visibility = "hidden";
                // iframe.src = Ext.session.NMU_PERMISSION_HOST + "/access/login_1.php?ss_user_id=" + Ext.session.dc_center_user;
                // Ext.getCmp("login-form").getEl().dom.appendChild(iframe);
                // // console.log(Ext.session.NMU_EIS_HOST + "/access/login_1.php?ss_user_id=" + dc_user_id);
                // /*** FM-NMU ***/
                // var iframe = document.createElement("iframe");
                // iframe.style.visibility = "hidden";
                // iframe.src = Ext.session.FM_NMU_HOST + "/access/login_1.php?ss_user_id=" + Ext.session.dc_center_user;
                // Ext.getCmp("login-form").getEl().dom.appendChild(iframe);

                // /*** NMU ***/
                // var iframe = document.createElement("iframe");
                // iframe.style.visibility = "hidden";
                // iframe.src = Ext.session.HOST_NMU + "/access/login_1.php?ss_user_id=" + Ext.session.dc_center_user;
                // Ext.getCmp("login-form").getEl().dom.appendChild(iframe);

                // /*** NMU_EIS ***/
                // var iframe = document.createElement("iframe");
                // iframe.style.visibility = "hidden";
                // iframe.src = Ext.session.NMU_EIS_HOST +  "/access/login_1.php?ss_user_id=" + Ext.session.dc_center_user;
                // Ext.getCmp("login-form").getEl().dom.appendChild(iframe);
                // // let jsonData = Ext.util.JSON.decode(result.responseText); //decode json
                // Ext.getCmp("login-eis").destroy();
                // });
        </script>
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
            
        <iframe src="<?= OST_HOST ?>://<?= NMU_EIS_HOST ?>/po/poCostSign.php?_dc=<?= __VPRODUCT_; ?>" frameborder="0" style="overflow:hidden;overflow-x:hidden;overflow-y:hidden;height:100%;width:100%;position:absolute;top:0px;left:0px;right:0px;bottom:0px" height="100%" width="100%"></iframe>

    </head>

    <body>
    </body>

</html>