<?php
include("../../conf/config.php");
include("../../lib/database/DatabaseServer.php");
include("../../lib/date/i_date.class.php");

$db        = new DatabaseServer();
$date     = new i_date();

$root        = "data";
$data        = array();
$con        = "";

$mode        = $_REQUEST["mode"];
$arrParam    = array();
$addField    = null;
$addValue    = null;
$arrValue    = array();

switch ($mode) {

    case "SEND_DATA":

        $msg = "";
        $json = json_decode($_REQUEST["data"], true);
        if (count($json) > 0) {
            foreach ($json as $key => $val) {
                // ตรวจสอบ ID ที่ไม่ได้ระบุกลุ่มสิทธิ์
                $ar = $db->GetDataBySQL("
                    SELECT
                        a.ar_cut_hdr_id
                        ,a.c_code_cut
                        ,d.ar_treat_right_group_id
                        ,a.d_cut_date
                        ,CASE 
                            WHEN a.d_cut_date BETWEEN '{$_REQUEST["d_start"]}' AND '{$_REQUEST["d_end"]}' THEN 1
                            ELSE 0
                        END AS i_between
                    FROM dbo.ar_cut_hdr a
                        INNER JOIN dbo.ar_cut_dtl b ON a.ar_cut_hdr_id = b.ar_cut_hdr_id
                        INNER JOIN dbo.ar_treat_right c ON b.ar_treat_right_id = c.ar_treat_right_id
                        LEFT JOIN dbo.ar_treat_right_group d ON c.ar_treat_right_group_id = d.ar_treat_right_group_id
                    WHERE a.ar_cut_hdr_id = ?
                    GROUP BY a.ar_cut_hdr_id, a.c_code_cut, a.d_cut_date, d.ar_treat_right_group_id;", array($val));
                if ($ar["ar_treat_right_group_id"] == "") { // ยังไม่ระบุกลุ่มสิทธิ์ในข้อมูลหลัก
                    $msg .= "กรุณาระบุกลุ่มสิทธิ์การรักษา : " . $ar["c_code_cut"] . "<br>";
                }
                if ($ar["i_between"] == 0) { // วันที่เรียกเก็บไม่อยู่ในช่วงเดือน

                    $msg .= "วันที่เรียกเก็บไม่อยู่ในช่วงเดือน : " . $ar["c_code_cut"] . "<br>";
                }
            }

            if ($msg == "") {
                $vval = "";
                foreach ($json as $key => $val) {
                    $vval .= ", {$val}";
                }

                if ($vval != "") {

                    $data["i_status"]                           = 1;
                    $data["dc_user_update_id"]                  = $_SESSION["user_id"];
                    $data["dc_user_update_cost_id"]             = $_SESSION["dc_cost_id"];
                    $data["d_update"]                           = date("Y-m-d H:i:s");

                    foreach ($data as $fld => $value) {
                        $addField .= ($value != "") ? ", {$fld} = '{$value}'" : ", {$fld} = NULL";
                    }

                    $sql = "
                        BEGIN TRANSACTION;
                        UPDATE dbo.ar_cut_dtl
                            SET " . substr($addField, 1) . "
                        WHERE ar_cut_hdr_id IN (" . substr($vval, 1) . ");
                        COMMIT;";

                    $para = $db->QueryParam($sql, array());
                    $re = array(
                        "success"           => true,
                        "msg"               => $msg
                    );
                }
            } else {
                $re = array(
                    "success"           => false,
                    "msg"               => $msg
                );
            }
        }

        break;

    case "BACK_DATA":

        $msg = "";

        $data["i_status"]                           = "0";
        $data["dc_user_update_id"]                  = $_SESSION["user_id"];
        $data["dc_user_update_cost_id"]             = $_SESSION["dc_cost_id"];
        $data["d_update"]                           = date("Y-m-d H:i:s");

        foreach ($data as $fld => $value) {
            $addField .= ($value != "") ? ", {$fld} = '{$value}'" : ", {$fld} = NULL";
        }
        $sql = "
            BEGIN TRANSACTION;
            UPDATE dbo.ar_cut_dtl SET " . substr($addField, 1) . " WHERE ar_cut_hdr_id = {$_REQUEST["id"]};
            COMMIT;";

        $para = $db->QueryParam($sql, array());
        if ($para) {
            $re = array(
                "success"           => true,
                "msg"               => $msg
            );
        } else {
            $re = array(
                "success"           => false,
                "msg"               => $msg
            );
        }

        break;

    case "SAVE_LOG_APPROVE":

        $msg = "";

        $d_start = $date->shot_date_from_db($_REQUEST["d_start"]);
        $d_end = $date->shot_date_from_db($_REQUEST["d_end"]);

        $c_name = substr($d_start, 0, -5) . " - " . $d_end;

        $i_success_approve = $db->GetDataBySQL("
            SELECT
                DISTINCT
                i_success_approve
            FROM dbo.ar_cut_log a
            WHERE a.d_action_date BETWEEN '{$_REQUEST["d_start"]} 00:00:00.000' AND '{$_REQUEST["d_end"]} 23:59:59.000';", array());

        $f_total = $db->GetDataBySQL("
            SELECT
                SUM(ISNULL(c.f_cut,0)) AS f_cut
            FROM dbo.ar_cut_hdr a
                INNER JOIN dbo.ar_cut_dtl b ON a.ar_cut_hdr_id = b.ar_cut_hdr_id
                    AND b.i_status IN (0 , 1)
                INNER JOIN dbo.ar_cut_item c ON b.ar_cut_dtl_id = c.ar_cut_dtl_id
                    AND c.i_enable = 1
                    AND c.lastdate BETWEEN '{$_REQUEST["d_start"]} 00:00:00.000' AND '{$_REQUEST["d_end"]} 23:59:59.000';", array());

        $f_approve = $db->GetDataBySQL("
            SELECT
                SUM(ISNULL(c.f_cut,0)) AS f_cut
            FROM dbo.ar_cut_hdr a
                INNER JOIN dbo.ar_cut_dtl b ON a.ar_cut_hdr_id = b.ar_cut_hdr_id
                    AND b.i_status = 1
                INNER JOIN dbo.ar_cut_item c ON b.ar_cut_dtl_id = c.ar_cut_dtl_id
                    AND c.i_enable = 1
                    AND c.lastdate BETWEEN '{$_REQUEST["d_start"]} 00:00:00.000' AND '{$_REQUEST["d_end"]} 23:59:59.000';", array());

        if ($i_success_approve == 1) {
            $msg = "ประมวลผลรายการช่วงเดือน {$c_name} แล้ว !!!";
        } else if ($f_total != $f_approve) {
            $msg = "กรุณาตรวจสอบจำนวนเงินทั้งหมดก่อน !!!";
        } else if ($_REQUEST["d_start"] == "" || $_REQUEST["d_end"] == "") {
            $msg = "กรุณาเลือกช่วงเดือน !!!";
        }

        if ($msg == "") {
            $sql = "
                BEGIN TRANSACTION;
                UPDATE dbo.ar_cut_log
                    SET i_success_approve = 1
                WHERE d_action_date BETWEEN '{$_REQUEST["d_start"]} 00:00:00.000' AND '{$_REQUEST["d_end"]} 23:59:59.000';
                COMMIT;";

            $para = $db->QueryParam($sql, array());
            $re = array(
                "success"           => true,
                "msg"               => "ประมวลผลเรียบร้อย"
            );
        } else {
            $re = array(
                "success"           => false,
                "msg"               => $msg
            );
        }

        break;
}
echo json_encode($re);
exit;
