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
                "i_last" => $row["i_last"] ?? 0,
                "code_tomenu" => $row["code_tomenu"] ?? 0,
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
        return $this->temp['id'];
    }

    function get_type_id()
    {
        return $this->temp['type_id'];
    }

    function get_i_alarm()
    {
        return $this->temp['i_alarm'];
    }

    function get_i_day()
    {
        return $this->temp['i_day'];
    }

    function get_i_config()
    {
        return $this->temp['i_config'];
    }

    function get_js()
    {
        return $this->temp['js'];
    }

    function get_i_last()
    {
        return $this->temp['i_last'];
    }

    function get_i_entrance()
    {
        return $this->temp['i_entrance'];
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
$i_is_ap = $_REQUEST["i_is_ap"] ?? null;
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

#content-anchor-tip ul {
    float: left;
    width: 200px;
    list-style-type: disc;
    margin-left: 15px;
} 

.ext-ie #content-anchor-tip ul {
    margin: 0;
    padding-left: 15px;
} 

#content-anchor-tip .thumb {
    float: right;
} 

#content-anchor-tip .status-icon {
    position: absolute;
    top: 4px;
    right: 50px;
    padding: 0;
    line-height: 0;
} 

#content-anchor-tip a:link, #content-anchor-tip a:visited {
    color: #339;
}
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
    <script type="text/javascript" src="./tor/torUiAll.js?_dc=<?= __VPRODUCT_; ?>"></script> 
    <!-- controller file.js ingrid-->
    <script type="text/javascript" src="./tor/tor_ap_po.js?_dc=<?= __VPRODUCT_; ?>"></script>
    <script type="text/javascript" src="./tor/pageStatus.js?_dc=<?= __VPRODUCT_; ?>"></script>
</head>

<body> 
</body>

</html>