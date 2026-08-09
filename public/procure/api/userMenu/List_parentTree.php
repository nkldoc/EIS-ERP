<?php
include("../../conf/config.php");
include("../../lib/database/DatabaseServer.php");
include("../../lib/database/apiUtil.php");
include("../../lib/date/i_date.class.php");

$db     = new DatabaseServer();
$date     = new i_date();
$util    = new apiUtil();

$root        = "data";
$data        = array();
$con        = null;

if ($_REQUEST["type"] == "GET_PARENT_MENU") {

    $join = ($_SESSION["i_type_user"] != 2) ? "INNER JOIN dbo.dc_user_menu b on a.dc_menu_id = b.dc_menu_id AND b.dc_user_id = {$_SESSION["user_id"]} " : "";
    $sqlMain = "SET NOCOUNT ON
				SELECT
                    ROW_NUMBER() OVER (ORDER BY a.c_code) AS numrow
                    ,a.dc_menu_id
                    ,a.c_name
				INTO #TemData
                FROM dbo.dc_menu a
                    {$join}
                WHERE a.i_enable = 1 AND a.i_delete = 2 AND len(replace(a.c_code,FORMATMESSAGE('%0'+cast((len(c_code)-2) as varchar(3))+'d', 0),'')) = 2;

				SELECT * FROM #TemData a ORDER BY a.numrow;";

    $stmt = $db->QueryParam($sqlMain, array());
    $parent_id1 = "";
    $parent_id2 = "";
    $c_name1 = "";
    $c_name2 = "";
    if (sqlsrv_has_rows($stmt)) {
        while ($row = $db->Fetch($stmt)) {
            if ($parent_id1 != $_REQUEST["parent_id"]) {
                $parent_id1 = $row["dc_menu_id"];
                $c_name1 = $row["c_name"];
            }
            if ($row["dc_menu_id"] != 1 && $parent_id2 == "") {
                $parent_id2 = $row["dc_menu_id"];
                $c_name2 = $row["c_name"];
            }
            $temp = array(
                "no"                                => $row["numrow"],
                "id"                                => $row["dc_menu_id"],
                "c_name"                            => $row["c_name"],
            );

            ${$root}[] = $temp;
        }
    }

    echo json_encode(array(
        "success"           => true,
        "parent_id"         => ($parent_id1 != "") ? $parent_id1 : $parent_id2,
        "c_name"            => ($c_name1 != "") ? $c_name1 : $c_name2,
        $root               => ${$root}
    ));
    exit;
}
