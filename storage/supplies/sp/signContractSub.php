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

class clsPageStatus
{

    private $temp;

    function __construct($db, $req)
    {
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
    function set_name($name)
    {
        $this->name = $name;
    }

    function get_name()
    {
        return $this->name;
    }

    function get_id()
    {
        return $this->temp['id'] ?? 0;
    }

    function get_type_id()
    {
        return $this->temp['type_id'] ?? 0;
    }

    function get_i_alarm()
    {
        return $this->temp['i_alarm'] ?? 0;
    }

    function get_i_day()
    {
        return $this->temp['i_day'] ?? 0;
    }

    function get_i_config()
    {
        return $this->temp['i_config'] ?? 0;
    }

    function get_js()
    {
        return $this->temp['js'];
    }

    function get_i_last()
    {
        return $this->temp['i_last'] ?? 0;
    }

    function get_i_entrance()
    {
        return $this->temp['i_entrance'] ?? 0;
    }

    function get_code()
    {
        return $this->temp['c_code'];
    }

    function get_code_tomenu()
    {
        return $this->temp['code_tomenu'];
    }

    function get_menu()
    {
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


    </style>
    <script type="text/javascript">
        //--------config ---------------------------------------------------------------
        Ext.menu_name = '<?PHP echo "{$pg->get_menu()}"; $_SESSION['menu'] = "{$pg->get_menu()}"; ?>';
        Ext.menu_code = '<?PHP echo "{$pg->get_code()}"; ?>';
        Ext.menu_i_entrance = '<?PHP echo "{$pg->get_i_entrance()}"; ?>';
        Ext.menu_id = <?PHP echo "{$pg->get_id()}"; ?>; //
        Ext.menu_type_id = <?PHP echo "{$pg->get_type_id()}"; ?>;
        Ext.menu_i_alarm = <?PHP echo "{$pg->get_i_alarm()}"; ?>;
        Ext.menu_i_day = <?PHP echo "{$pg->get_i_day()}"; ?>;
        Ext.menu_i_config = <?PHP echo "{$pg->get_i_config()}"; ?>;
        Ext.menu_i_last = '<?PHP echo "{$pg->get_i_last()}"; ?>';
        Ext.menu_code_tomenu = '<?PHP echo "{$pg->get_code_tomenu()}"; ?>';
        Ext.menu_js = '<?PHP echo "{$pg->get_js()}"; ?>';
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
    <script type="text/javascript" src="./tor/torUi2_check.js?_dc=<?= __VPRODUCT_; ?>"></script>
    <script type="text/javascript" src="./tor/contractSub_check.js?_dc=<?= __VPRODUCT_; ?>"></script>
    <script type="text/javascript" src="./tor/pageStatus.js?_dc=<?= __VPRODUCT_; ?>"></script>
</head>

<body>
</body>

</html>