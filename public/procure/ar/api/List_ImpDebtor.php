<?php
include("../../conf/config.php");
include("../../lib/database/DatabaseServer.php");
include("../../lib/database/apiUtil.php");
include("../../lib/date/i_date.class.php");

$db         = new DatabaseServer();
$date       = new i_date();
$util       = new apiUtil();

$root        = "data";
$data        = array();
$con        = null;

if ($_REQUEST["type"] == "chk_dc_debtor_type") {

    $arr = json_decode($_REQUEST["data"], true);
    if ($arr) {
        $no = 0;
        foreach ($arr as $index => $name) {
            $id = $db->GetDataBySQL("
                    SELECT
                        a.dc_debtor_type_id
                    FROM dbo.dc_debtor_type a
                    WHERE a.i_enable = 1
                        AND a.c_name = ?;", array($name));
            if (empty($id)) {
                $temp = array(
                    "no"                        => ++$no,
                    "c_name"                    => $name
                );
                ${$root}[] = $temp;
            }
        }
    }

    $rowCounts["rowCounts"] = $no;

    echo json_encode(array("success" => true, "totalCount" => $rowCounts["rowCounts"], $root => ${$root}));
    exit;
} else if ($_REQUEST["type"] == "chk_dc_debtor_claim") {

    $arr = json_decode($_REQUEST["data"], true);
    if ($arr) {
        $no = 0;
        foreach ($arr as $index => $name) {
            $id = $db->GetDataBySQL("
                    SELECT
                        a.dc_debtor_claim_id
                    FROM dbo.dc_debtor_claim a
                    WHERE a.i_enable = 1
                        AND a.c_name = ?;", array($name));
            if (empty($id)) {
                $temp = array(
                    "no"                        => ++$no,
                    "c_name"                    => $name
                );
                ${$root}[] = $temp;
            }
        }
    }

    $rowCounts["rowCounts"] = $no;

    echo json_encode(array("success" => true, "totalCount" => $rowCounts["rowCounts"], $root => ${$root}));
    exit;
} else if ($_REQUEST["type"] == "chk_dc_cost_debtor") {

    $arr = json_decode($_REQUEST["data"], true);
    if ($arr) {
        $no = 0;
        foreach ($arr as $index => $name) {
            $id = $db->GetDataBySQL("
                    SELECT
                        a.dc_cost_debtor_id
                    FROM dbo.dc_cost_debtor a
                    WHERE a.i_enable = 1
                        AND a.c_name = ?;", array($name));
            if (empty($id)) {
                $temp = array(
                    "no"                        => ++$no,
                    "c_name"                    => $name
                );
                ${$root}[] = $temp;
            }
        }
    }

    $rowCounts["rowCounts"] = $no;

    echo json_encode(array("success" => true, "totalCount" => $rowCounts["rowCounts"], $root => ${$root}));
    exit;
}
