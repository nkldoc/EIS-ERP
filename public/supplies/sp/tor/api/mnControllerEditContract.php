ฯ<?php
include("../../../conf/config.php");
include("../../../lib/database/DatabaseServer.php");
include("../../../lib/database/apiUtil.php");
include("../../../lib/date/i_date.class.php");
$db = new DatabaseServer();
$date = new i_date();
$util = new apiUtil();

$mode = $_REQUEST["mode"];
$table = "dbo.sp_edit_contract";
$keyName = "tor_id";
$data = $util->mnUser($_REQUEST);
$data["i_delete"] = DELETE_FALSE;
$c_code_gen = "ECNT";

$stmt2 = true;
$stmt3 = true;

//End fn updateStaus
$db->BeginTran();
$d_tor_date = $data['d_tor_date'] ?? null;
$data['d_tor_date'] = !empty($d_tor_date) ? $date->bc_to_ad($data['d_tor_date']) : null;
$f_total_amt = !empty($data["f_total_amt"]) ? str_replace(',', '', $data["f_total_amt"]) : 0; //str_replace(',', '', $data[$value]);
$data['dc_cost_id'] = $data['dc_cost_id'] ?? 38;
$data["c_comment"] = $data["c_comment"] ?? NULL;
switch ($mode) {


    case "GENCODE" :

        $ret_id = $data["id"];
        $code_dc = (string) $c_code_gen;
        $arrParam2 = array($code_dc, date("Ym"), $data['dc_user_create_id'], $data['dc_user_create_cost_id'], $ret_id);
        $sql2 = "EXEC SP_GEN_CODE ?,?,?,?,?;";
        $stmt = $db->QueryParam($sql2, $arrParam2);
        $arr_gen_code = $db->Fetch($stmt);
        $c_code = $arr_gen_code["c_code_gen"];
        $ref_id = $arr_gen_code["reference_id"];

        if ($ret_id == $ref_id) {

            $sql3 = "UPDATE {$table} SET c_code=? WHERE {$keyName} = ?";
            $arrParam3 = array($c_code, $ret_id);
            $stmt3 = $db->QueryParam($sql3, $arrParam3);
        }

        break;
    case "ADD" :

        $arrParam = array();
        $arrParam[] = $data["c_name"];

        $arrParam[] = $data["i_enabled"];
        $arrParam[] = $_SESSION['dc_department_id'];
        $arrParam[] = $_SESSION['dc_department_id'];
        $arrParam[] = $data["dc_user_create_id"];
        $arrParam[] = $data["dc_user_create_cost_id"];
        $arrParam[] = $data["d_create"];
        $arrParam[] = $data["dc_user_update_id"];
        $arrParam[] = $data["dc_user_update_cost_id"];
        $arrParam[] = $data["d_update"];

        $sql = "insert into {$table} (c_name
                                        , i_enabled
                                        , dc_user_create_department_id , dc_user_update_department_id
                                        , dc_user_create_id, dc_user_create_cost_id, d_create
                                        , dc_user_update_id, dc_user_update_cost_id, d_update)
                                values ( ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
                                        , ?
                                        , ? , ?
                                        , ?, ?, ?
                                        , ?, ?, ?);";
        $sql .= "SELECT @@IDENTITY as ret_id";
        $stmt = $db->QueryParam($sql, $arrParam);

        break;
    case "UPDATE" :
        $arrParam = array();
        $arrParam[] = $data["c_name"];
        $arrParam[] = $data["d_tor_date"];
        $arrParam[] = $data["po_expense_id"];
        $arrParam[] = $data["po_creditor_id"];
        $arrParam[] = $data["dc_expense_budget_type_id"];
        $arrParam[] = $data["bg_budget_dtl_project_id"];
        $arrParam[] = $data["c_budget_dtl_project_id"];
        $arrParam[] = $data["dc_department_id"];
        $arrParam[] = $data["dc_cost_id"];
        $arrParam[] = $data["tag"];
        $arrParam[] = ($data["txtsub_cost"] == "*ถ้ามี" ? null : $data["txtsub_cost"]);
        $arrParam[] = (($f_total_amt >= 500000) ? 1 : 0);
        $arrParam[] = $data["i_is_rename"];
        $arrParam[] = $data["d_doc_ref"];
        $arrParam[] = $f_total_amt;
        $arrParam[] = $data["i_purchase"];
        $arrParam[] = $data["tor_type_id"];
        $arrParam[] = $data["i_yyyy"];
        //=====================================================================
        $arrParam[] = $data["c_comment"];
        $arrParam[] = $data["i_enabled"];
        $arrParam[] = $data["dc_user_update_id"];
        $arrParam[] = $data["dc_user_update_cost_id"];
        $arrParam[] = $data["d_update"];

        $sql = "UPDATE {$table}
                    SET  c_name = ?
                        , d_tor_date=?
                        , po_expense_id = ?
                        , po_creditor_id = ?
                        , dc_expense_budget_type_id = ?
                        , bg_budget_dtl_project_id = ?
                        , c_budget_dtl_project = ?
                        , dc_department_id = ?
                        , dc_cost_id = ?
                        , tag = ?
                        , txtsub_cost = ?
                        , i_is_more = ?
                        , i_is_rename = ?
                        , d_doc_ref=?
                        , f_total_amt =?
                        , i_purchase=?
                        , tor_type_id=?
                        , i_yyyy = ?
                        , c_comment = ?
                        , i_enabled = ?
                        , dc_user_update_id = ?
                        , dc_user_update_cost_id = ?
                        , d_update = ?
                WHERE {$keyName} = ?";

        $arrParam[] = $data["id"];

//         print_r($arrParam);
//         echo $sql;
//         exit();
        $stmt = $db->QueryParam($sql, $arrParam);
        break;
    case "DELETE" :
        $sql = "DELETE FROM {$table}
                    WHERE {$keyName} = ?";
        $arrParam = array($data["id"]);
        $stmt = $db->QueryParam($sql, $arrParam);
        break;
    case "LIST" :
        ###########################################
        $mode = $_REQUEST["mode"] ?? null;
        $filter = $_REQUEST["filter"] ?? null;
        $value = $_REQUEST["value"] ?? null;
        $i_read = $_REQUEST["i_read"] ?? null;

        $root = "data";
        $data = array();

        $limit = $_REQUEST["limit"] ?? null;
        $dir = $_REQUEST["dir"] ?? null;
        $sort = $_REQUEST["sort"] ?? null;
        $start = $_REQUEST["start"] ?? null;

        function get($a) {
            return $a ?? 0;
        }

        if (!get($start)) {
            $start = 0;
        }
        if (!get($limit)) {
            $limit = 20;
        } else {
            $limit = ($limit + $start);
        }
        if (!get($dir)) {
            $dir = "DESC";
        }
        if (!get($sort)) {
            $sort = " s.c_code";
        }
#################################
        $arrParam = array();
        $arrCountParam = array();
        $con = null;
        $conDtl = null;
        $wh = null;

        $type = $_REQUEST["type"] ?? null;
        $act = $_REQUEST["act"] ?? null;
        $tor_type_show = $_REQUEST['tor_type_show'] ?? null;
        $i_post = $_REQUEST['i_post'] ?? null;

        if ($type == "po_working_dtl") {
            $tor_status_id = $_REQUEST["tor_status_id"] ?? null; // status id
            $i_alarm = $_REQUEST["i_alarm"] ?? null; // status id
            $i_pa = $_REQUEST["i_pa"] ?? null; // status id


            $step = (!empty($tor_status_id)) ? $tor_status_id : 0;
            $addConfDay1 = (!empty($i_alarm)) ? $i_alarm : 0;
            $addConfDay2 = (!empty($i_pa)) ? $i_pa : 0;

            if ($act == "SEARCH") {
                $wh .= ($_REQUEST['tor_type_id'] != 0) ? " and a.tor_type_id =" . $_REQUEST['tor_type_id'] : "";
                $wh .= ($_REQUEST['c_code'] != "") ? " and a.c_code like '%" . $_REQUEST['c_code'] . "%'" : "";
                $wh .= ($_REQUEST['tag'] != "") ? " and a.tag like '%" . $_REQUEST['tag'] . "%'" : "";
                $wh .= ($_REQUEST['c_name'] != 0) ? " and a.c_name like '%" . $_REQUEST['c_name'] . "%'" : "";
                $wh .= " and a.i_enabled =" . $_REQUEST['i_enabled'];
                if ($i_post != 0) {
                    if ($i_post == 1) {
                        $wh .= " and tor_status_id is not null";
                    } else {
                        $wh .= " and tor_status_id is null";
                    }
                }
            } else {
                $wh .= ($tor_type_show == true) ? " and tor_status_id is null" : "";
            }


            $arrParam = array();
            $arrCountParam = array();
            $sqlTempTable = "select a.tor_id
                  , a.po_expense_id
                   , a.po_creditor_id
                    , a.dc_expense_budget_type_id
                     , a.bg_budget_dtl_project_id
                        , isnull(a.dc_department_id,0) as dc_department_id
                        , a.dc_cost_id
                        , a.i_is_rename
                        , a.index_receive
                        , a.txtsub_cost
                        , a.tor_type_id
                        , a.i_is_more
                        , isnull(a.i_purchase,1) as i_purchase
                        , isnull(a.i_product_type,1) as i_product_type
                        , isnull(a.i_hire_type,0) as i_hire_type
                        , isnull(a.i_is_inv ,0) as i_is_inv
                        , isnull(a.i_delivery_date,0) as i_delivery_date
                        , a.i_step
                        , a.i_forword
                        , a.i_backword
                        , a.tor_status_id
                        , a.i_enabled
                        , row_number() over (order by a.tor_id DESC) as row
                        from dbo.sp_tor a  where 1=1" . $wh . $util->viewDepartment('a', $_SESSION["dc_department_id"]); //
//             echo $sqlTempTable;
//             exit;
            $arrParam[] = $start;
            $arrParam[] = $limit;
            $sqlMain = "select a.* , s.c_code
                        , s.c_budget_dtl_project
                        , s.c_name
                        , s.c_department
                        , s.d_doc_ref
                         , s.tag
                        , (select top 1 c_name from dbo.sp_department  where dc_department_id=s.dc_department_id)  as dc_department_name
                        , (select top 1 c_code from dbo.sp_status_hdr where sp_status_hdr_id=s.tor_status_id)  as c_code_status
                        , (select top 1 c_name from dbo.sp_status_hdr where sp_status_hdr_id=s.tor_status_id)  as c_name_status
                        , (select top 1 c_name from dbo.sp_type_status where sp_type_status_id=s.tor_type_id)  as c_type_name
                        , isnull(s.i_purchase,1) as i_purchase
                        , isnull(s.tor_type_id,1) as tor_type_id
                        , s.f_period_amt
                        , s.f_total_amt
                        , isnull(s.i_parent,0) as i_parent
                        , isnull(s.i_is_parent,0) as i_is_parent
                        , s.start_date
                        , s.end_date
                        , s.c_comment
                        , s.c_remake
                        , s.i_yyyy
                        , convert(varchar, s.d_tor_date, 120) as d_tor_date
                        , s.po_creditor_id
                        , (select top 1 c_name from dbo.po_creditor where po_creditor_id=s.po_creditor_id)  as po_creditor_idTxt
                        , (select top 1 c_name from dbo.dc_cost where dc_cost_id=a.dc_cost_id)  as dc_cost_idTxt
                        , (select top 1 c_full_name from dbo.dc_user where dc_user_id=s.dc_user_create_id) as c_create_name
                        , (select top 1 c_name from dbo.dc_cost where dc_cost_id=s.dc_user_create_cost_id) as c_cost_creat_name

                        , convert(varchar, d_create, 120) as d_create
                        , (select top 1 c_full_name from dbo.dc_user where dc_user_id=s.dc_user_update_id) as c_update_name
                        , (select top 1 c_name from dbo.dc_cost where dc_cost_id=s.dc_user_update_cost_id) as c_cost_update_name
                        , convert(varchar, d_update, 120) as d_update "
                    . " from ({$sqlTempTable}) a "
                    . " inner join dbo.sp_tor s on s.tor_id=a.tor_id"
                    . " WHERE a.row > ? and a.row <= ?"

            ;
//             print_r($arrParam);
//             echo $sqlMain;
//             exit;
            $stmt = $db->QueryParam($sqlMain, $arrParam);
            $i = $start + 1;
            $i_purchase = array(1 => 'ซื้อ', 2 => 'จ้าง', 3 => 'เช่า');
            while ($row = $db->Fetch($stmt)) {
                $temp = array(
                    "no" => $i++,
                    "id" => intval($row["tor_id"]),
                    "i_purchase" => intval($row["i_purchase"]), //i_purchase	i_product_type	i_hire_type	i_is_inv i_delivery_date
                    "i_product_type" => intval($row["i_product_type"]),
                    "i_hire_type" => intval($row["i_hire_type"]),
                    "i_is_inv" => intval($row["i_is_inv"]),
                    "i_delivery_date" => intval($row["i_delivery_date"]),
                    "i_step" => intval($row["i_step"]),
                    "index_receive" => $row["index_receive"],
                    "txtsub_cost" => $row["txtsub_cost"],
                    "i_forword" => intval($row["i_forword"]),
                    "i_backword" => intval($row["i_backword"]),
                    "c_code" => $row["c_code"],
                    "c_codeStatus" => "<b>" . $row["c_code"] . "</b>" . ($row["tor_status_id"] > 0 ? "<image id='img-" . $row['tor_id'] . "' src='../images/icons/database_start.png'/>" : ""), //database_start.png
                    "bg_budget_dtl_project_id" => intval($row["bg_budget_dtl_project_id"]),
                    "i_is_more" => intval($row["i_is_more"]),
                    "f_total_amt" => number_format($row["f_total_amt"], 2),
                    "i_is_rename" => intval($row["i_is_rename"]),
                    "c_budget_dtl_project" => $row["c_budget_dtl_project"], //dc_department_name
                    "txtdc_department_idID" => $row["dc_department_name"], //
                    "c_name" => $row["c_name"],
                    "c_code_status" => $row["c_code_status"],
                    "c_name_status" => $row["c_name_status"],
                    "tor_status_id" => $row["tor_status_id"],
                    "dc_cost_id" => intval($row["dc_cost_id"]),
                    "tag" => ($row["tag"]),
                    "dc_cost_idTxt" => $row["dc_cost_idTxt"],
                    "dc_department_id" => intval($row["dc_department_id"]),
                    "c_department" => $row["c_department"],
                    "i_parent" => $row["i_parent"],
                    "i_is_parent" => $row["i_is_parent"],
                    "d_doc_ref" => $row["d_doc_ref"],
                    "i_yyyy" => $row["i_yyyy"],
                    "c_year" => intval($row["i_yyyy"] + 543),
                    "tor_type_id" => $row["tor_type_id"],
                    "c_tor_type" => $row["c_type_name"], // $tor_type[$row["tor_type_id"]],
                    "i_purchase" => intval($row["i_purchase"]),
                    "c_purchase" => $i_purchase[$row["i_purchase"]],
                    "dc_expense_budget_type_id" => intval($row["dc_expense_budget_type_id"]),
                    "po_expense_id" => intval($row["po_expense_id"]),
                    "dc_user_create_id" => $row["c_create_name"],
                    "dc_user_create_cost_id" => $row["c_cost_creat_name"],
                    "d_tor_date" => ((empty($row["d_tor_date"])) ? "" : $date->extDateBuddha($row["d_tor_date"])), //d_tor_date
                    "d_create" => $date->extDateBuddha($row["d_create"]), //
                    "dc_user_update_id" => $row["c_update_name"],
                    "dc_user_update_cost_id" => $row["c_cost_update_name"],
                    "d_update" => $date->extDateBuddha($row["d_update"]),
                    "start_date" => $date->extDateBuddha($row["start_date"]),
                    "end_date" => $date->extDateBuddha($row["end_date"]),
                    "i_enabled" => intval($row["i_enabled"]),
                    "c_comment" => $row["c_comment"],
                    "c_remake" => $row["c_remake"],
                    "po_creditor_id" => intval($row["po_creditor_id"]),
                    "po_creditor_idTxt" => $row["po_creditor_idTxt"],
                );
                ${$root}[] = $temp;
            }

            $sqlCount = "select count(*) as totalCount from ({$sqlTempTable}) a";
            $totalCount = $db->GetDataBySQL($sqlCount, $arrCountParam);
            echo json_encode(array("debug" => true, "totalCount" => $totalCount, $root => ${$root}));
            exit();
        }
        break;
}

if ($stmt && $stmt2 && $stmt3) {
    $db->CommitTran();
    $re = array("reval" => 0, "success" => "Success", "msg" => "บันทึกเรียบร้อยแล้ว");
} else {
    $db->RollBackTran();
    $re = array("reval" => 1, "success" => "Error", "msg" => "check statement : {$sql}");
}

echo json_encode($re);
exit;

