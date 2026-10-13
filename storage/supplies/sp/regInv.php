<?php
 include("../conf/config.php");
 include("../lib/database/DatabaseServer.php");
 include("../lib/database/apiUtil.php");
 include("../lib/date/i_date.class.php"); //pageStatus.class
 include("./class/pageStatus.class.php"); //pageStatus.class
 if (!isset($_SESSION['user_id'])) {
        echo "<script>window.top.location.href =\"../access/signin.php\"</script>";
        exit;
    }
 $db = new DatabaseServer();
 $pg = new clsPageStatus($db, $_GET["st"] ?? $_SESSION["st"]);
 $_SESSION["st"] = $_GET["st"]??$_SESSION["st"];
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
        <script type="text/javascript">
//--------config ---------------------------------------------------------------
            Ext.menu_name = '<?PHP echo "{$pg->get_menu()}"; $_SESSION['menu'] = "{$pg->get_menu()}"; ?>';
            Ext.menu_code = '<?PHP echo "{$pg->get_code()}"; ?>';
            Ext.menu_id = <?PHP echo "{$pg->get_id()}"; ?>;
            Ext.menu_type_id = <?PHP echo "{$pg->get_type_id()}"; ?>;
            Ext.menu_i_alarm = <?PHP echo "{$pg->get_i_alarm()}"; ?>;
            Ext.menu_i_day = <?PHP echo "{$pg->get_i_day()}"; ?>;
            Ext.menu_i_config = <?PHP echo "{$pg->get_i_config()}"; ?>;
            Ext.menu_js = '<?PHP echo "{$pg->get_js()}"; ?>';
            console.log('\n\r CODE =>'+Ext.menu_code
                            +'\n\r id วิธีดำเนินงาน => '+Ext.menu_id
                            +'\n\r Type id วิธีดำเนินงาน => '+Ext.menu_type_id
                            +'\n\r Alarm => '+Ext.menu_i_alarm
                            +'\n\r PA => '+Ext.menu_i_day
                            +'\n\r Menu => '+Ext.menu_name
                            +'\n\r menu_js => '+Ext.menu_js
                            +'\n\r menu_i_config => '+Ext.menu_i_config
                    );
//------------------------------------------------------------------------------
        </script>
        <script type="text/javascript" src="./uiData/configStoreUi.js?_dc=<?= __VPRODUCT_; ?>"></script>
        <!--<script type="text/javascript" src="./tor/<?PHP echo $js; ?>"></script>-->
        <script type="text/javascript" src="./tor/deliverWork.js?_dc=<?= __VPRODUCT_; ?>"></script>
        <script type="text/javascript" src="./tor/pageStatus.js?_dc=<?= __VPRODUCT_; ?>"></script>
    </head>
    <body>
    </body>
</html>
