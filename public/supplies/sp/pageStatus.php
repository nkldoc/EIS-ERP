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
                "i_day" => $row["i_day"] ?? 0,
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
        return $this->name ?? null;
    }

    function get_id()
    {
        return $this->temp['id'] ?? null;
    }

    function get_type_id()
    {
        return $this->temp['type_id'] ?? null;
    }

    function get_i_alarm()
    {
        return $this->temp['i_alarm'] ?? null;
    }

    function get_i_day()
    {
        return $this->temp['i_day'] ?? null;
    }

    function get_i_config()
    {
        return $this->temp['i_config'] ?? null;
    }

    function get_js()
    {
        return $this->temp['js'] ?? null;
    }

    function get_i_last()
    {
        return $this->temp['i_last'] ?? null;
    }

    function get_i_entrance()
    {
        return $this->temp['i_entrance'] ?? null;
    }

    function get_code()
    {
        return $this->temp['c_code'] ?? null;
    }

    function get_code_tomenu()
    {
        return $this->temp['code_tomenu'] ?? null;
    }

    function get_menu()
    {
        return $this->temp['c_name'] ?? null;
    }
}
$user_type_audit = $db->GetDataBySQL("select case when count(*) > 0 then 'audit' else null end as is_audit from dc_user_menu  where dc_menu_id = 150741 and dc_user_id = ?", array($_SESSION["user_id"]));
$level = ($_SESSION["i_level"] == 2) ? 0 : 1;
$dc_department_id = $_SESSION["dc_department_id"];
$st = $_GET["st"] ?? $_SESSION["st"];
$_SESSION["st"] = $st ?? $_SESSION["st"];
$pg = new clsPageStatus($db, $st);
$js = $pg->get_js() . ".js?__dc=" . __VPRODUCT_;
?>
<!DOCTYPE html> 
<html lang="en">  
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

        .padd-2 {
            padding: 2px 0px;
        }

        .td-select {
            background: #e4ffe4;
        }

        .td-succeed {
            background: #e4ffe4;
        }

        .td-unsucceed {
            background: #FDE3E3;
        }

        .td-wait {
            background: #D5D8DC;
        }
    </style>
    <script type="text/javascript">
        if (!Ext.isEmpty(Ext.session)) {
            console.log(Ext.session);
        } else {
            window.top.location.href = "../access/logout.php";
        }
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
        Ext.LOGIN_LEVEL_SHOW = <?PHP echo intVal($level) ?>; //สำหรับแก้ไขการ load งาน
        Ext.dc_department_id = <?PHP echo intVal($dc_department_id) ?>; //สำหรับแก้ไขการ load งาน
        Ext.menuAudit = "<?PHP echo ($user_type_audit ?? null); ?>";
        Ext.isAudit = (Ext.menuAudit === 'audit') ? true : false; //สำหรับแก้ไขการ load งาน


        console.log('\n\r CODE =>' + Ext.menu_code +
            '\n\r menu_id สถานะ TOR => ' + Ext.menu_id +
            '\n\r menu_i_entrance สถานะ TOR => ' + Ext.menu_i_entrance +
            '\n\r menu_type_id วิธีดำเนินงาน => ' + Ext.menu_type_id +
            '\n\r Alarm => ' + Ext.menu_i_alarm +
            '\n\r PA => ' + Ext.menu_i_day +
            '\n\r Menu => ' + Ext.menu_name +
            '\n\r menu_js => ' + Ext.menu_js +
            '\n\r menu_js => ' + Ext.menu_i_last +
            '\n\r menu_i_config => ' + Ext.menu_i_config +
            '\n\r menuAudit => ' + Ext.menuAudit +
            '\n\r isAudit => ' + Ext.isAudit
        );
        //------------------------------------------------------------------------------
    </script>
    <script type="text/javascript" src="../js/config_function.js?dc=<?= __VPRODUCT_ ?>"></script>
    <script type="text/javascript" src="./uiData/configStoreUi.js?_dc=<?= __VPRODUCT_; ?>"></script>
    <script type="text/javascript" src="./tor/torUi.js?_dc=<?= __VPRODUCT_; ?>"></script>
    <script type="text/javascript" src="./tor/<?PHP echo $js; ?>"></script>
    <script type="text/javascript" src="./tor/pageStatus.js?_dc=<?= __VPRODUCT_; ?>"></script>
</head>

<body>
</body>

</html>