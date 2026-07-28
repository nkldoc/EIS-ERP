<?php
include("../../conf/config.php");
include("../../lib/database/DatabaseServer.php");
include("../../lib/database/apiUtil.php");
include("../../lib/date/i_date.class.php");
$db = new DatabaseServer();
$date = new i_date();
$mode = $_REQUEST["mode"];
$table = "dbo.sp_tor";
/* * eakibanez 2025/01/28 */
switch ($mode) {
    case "ReadFile" :
        //-------PUT---------
        //file_put_contents('D:/newfile.txt', 'run');
        //-------GET----
        $file = file_get_contents('D:/newfile.txt') ?? null; // bar
        //----------------------------
        $root = "data";
        $arr = array("aa", "bb");
        $totalCount = 0;
        $i = 0;
        ${$root} = null;
        if ($file == "run") { // newfile ==run
            foreach ($arr as $v) {
                $temp = array("no" => $i++);
                ${$root}[] = $temp;
            }
            $totalCount = $i;
            file_put_contents('D:/newfile.txt', 'clear');
        }

        echo json_encode(array("debug" => true, "totalCount" => $totalCount, "data" => ${$root}));
        exit();
        break;
    case "LIST" :
        $check = $_REQUEST['check'] ?? null;
        $modfy = $db->GetDataBySQL("select convert(varchar(20), last_user_update, 120) as last_user_update
                        ,last_user_scan
                        ,last_user_seek
                        ,object_name(object_id) as OBJ_NAME
                        from sys.dm_db_index_usage_stats
                        where object_name(object_id)=?", array('sp_tor'));
        $last = $modfy["last_user_update"] ?? $modfy["last_user_scan"];
        if ($check == "true") {
            echo json_encode(array("batchCounter" => $last ?? null, "totalCount" => 0, "data" => null));
            exit();
        } else {


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

            $arrParam = array();
            $arrCountParam = array();
            $con = null;
            $conDtl = null;
            $wh = null;

            $type = $_REQUEST["type"] ?? null;
            $act = $_REQUEST["act"] ?? null;
            $value = $_REQUEST["value"] ?? null;
            if ($type == "po_working_dtl") {

                if ($act == "SEARCH") {
                    $typeText = $_REQUEST['TypeTxt']??null;
                    switch ($typeText) {
                        case 1 : $wh .= ($value != "") ? " and a.d_doc_ref like '%" . $value . "%' " : "";  break;
                        case 2: $wh .= ($value != "") ? " and a.c_name like '%" . $value . "%' " : "";  break;
                        case 3: $wh .= ($value != "") ? " and a.c_code like '%" . $value . "%' " : "";  break;
                        case 4: $wh .= ($value != "") ? " and a.index_receive like '%" . $value . "%' " : "";  break;

                    }
                } else {
                    $wh .= "";
                }

                $arrParam = array();
                $arrCountParam = array();
                $sqlTempTable = "select a.tor_id
                    , a.po_expense_id
                    , a.po_creditor_id
                    , a.dc_expense_budget_type_id
                    , a.bg_budget_dtl_project_id
                        , a.dc_department_id
                        , a.dc_cost_id
                        , a.i_is_rename
                        , a.tor_type_id
                        , a.i_is_more
                        , a.i_step
                        , a.i_forword
                        , a.i_backword
                        , a.index_receive
                        , a.tor_status_id
                        , a.sp_emp_id
                        , a.i_edit
                        , a.i_enabled
                        , convert(varchar(10), case when  isnull(a.d_tor_date_alert,'') !='' then a.d_tor_date_alert else DATEADD(DAY,1,a.d_tor_date) end, 120) as d_tor_date_alert
                        , convert(varchar(10), a.d_tor_date_pa, 120) as d_tor_date_pa
                        , convert(varchar(10), case when  isnull(a.d_tor_date_alert,'') !='' then a.d_tor_status_date else a.d_tor_date end, 120) as d_tor_status_date
                        , DATEDIFF(day, convert(varchar(10), getdate(), 120),convert(varchar(10), case when  isnull(a.d_tor_date_alert,'') !='' then a.d_tor_date_alert else DATEADD(DAY,1,a.d_tor_date) end, 120)) AS DateDiff
                        , convert(varchar(10), b.d_doc_date, 120) as po_date
                        ---- ORDER BY
                        , row_number() over (order by case when
                        DATEDIFF(day, convert(varchar(10), getdate(), 120), convert(varchar(10), a.d_tor_date_alert, 120)) > 0
                        then -1 when DATEDIFF(day, convert(varchar(10), getdate(), 120), convert(varchar(10), a.d_tor_date_alert, 120)) < 0 then
                            1 else
                            0 end DESC
---- ORDER BY
                        , DATEDIFF(day, convert(varchar(10), getdate(), 120),convert(varchar(10), a.d_tor_date_alert, 120)) ) as row
                        from dbo.sp_tor a
                        left join sp_tor_contract b on b.sp_tor_id = a.tor_id 
                        where isnull(a.i_enabled,0) = 1
                        and isnull(a.i_is_pause,0) <> 1
                        and isnull(a.i_is_notor,0) <> 1
                        and isnull(a.c_code,'') !='' 
                        and a.i_enabled = 1 
                        and isnull(a.i_is_complete,0) <> 1 
                        and NOT EXISTS (SELECT 1 FROM dbo.sp_tor_contract  
                        WHERE isnull(dbo.sp_tor_contract.c_code,'') !='' and dbo.sp_tor_contract.sp_tor_id = a.tor_id)
                        " . $wh; // d_tor_date_alert d_tor_date_pa d_tor_status_date DateDiff
//             echo $sqlTempTable;
//             exit;
                $arrParam[] = $start;
                $arrParam[] = $limit;
                $sqlMain = "select a.* , s.c_code
                        , s.c_budget_dtl_project
                        , s.c_name
                        , (select top 1 c_name from dbo.sp_department where dc_department_id=s.dc_department_id)  as c_department
                        , s.d_doc_ref
                        , s.sp_emp_id
                        , (select top 1 c_name from dbo.sp_emp where sp_emp_id=s.sp_emp_id) as emp_name
                        , case when  isnull(s.d_tor_date_alert,'') !='' then (select top 1 c_code from dbo.sp_status_hdr where sp_status_hdr_id=s.tor_status_id) else 'ST0000' end as c_code_status
                        , case when  isnull(s.d_tor_date_alert,'') !='' then (select top 1 c_name from dbo.sp_status_hdr where sp_status_hdr_id=s.tor_status_id) else 'ธุรการ' end as c_name_status
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
                        , b.c_code as po_code
                        , s.i_yyyy
                        , s.d_doc_ref
                        , s.i_menu_edit
                        , (select top 1 c_name from sp_status_hdr where sp_status_hdr_id=s.i_menu_edit) as menu_edit
                        , s.po_creditor_id
                        , (select top 1 c_name from dbo.po_creditor where po_creditor_id=s.po_creditor_id)  as po_creditor_idTxt
                        , (select top 1 c_name from dbo.dc_cost where dc_cost_id=a.dc_cost_id)  as dc_cost_idTxt
                        , (select top 1 c_full_name from dbo.dc_user where dc_user_id=s.dc_user_create_id) as c_create_name
                        , (select top 1 c_name from dbo.dc_cost where dc_cost_id=s.dc_user_create_cost_id) as c_cost_creat_name
                        , convert(varchar, s.d_create, 120) as d_create
                        , (select top 1 c_full_name from dbo.dc_user where dc_user_id=s.dc_user_update_id) as c_update_name
                        , (select top 1 c_name from dbo.dc_cost where dc_cost_id=s.dc_user_update_cost_id) as c_cost_update_name
                        , convert(varchar, s.d_update, 120) as d_update "
                        . " from ({$sqlTempTable}) a "
                        . " inner join dbo.sp_tor s on s.tor_id=a.tor_id"
                        . " left join dbo.sp_tor_contract b on  b.sp_tor_id  = s.tor_id"
                
                        . " -- WHERE a.row > ? and a.row <= ?"
                        . "order by po_doc_date desc";
//             echo $sqlMain;
//             exit;
                $stmt = $db->QueryParam($sqlMain, $arrParam);
                $i = $start + 1;
                $i_purchase = array(1 => 'ซื้อ', 2 => 'จ้าง', 3 => 'เช่า');
                $editArry = array(3 => '<span style="color:red">ส่งแก้ไข</span>' // พนักงานสายงาน
                    , 2 => '<span style="color:red">ส่งแก้ไข</span>' // หัวหน้าสายงาน
                    , 1 => '<span style="color:red">แก้ไขแล้ว</span>' // ธุระการ
                    , 4 => '<span style="color:blue">แก้ไขแล้ว</span>'
                    , 5 => '<span style="color:blue">ธุระการแก้ไขแล้ว</span>'
                    , 6 => '<span style="color:blue">หัวหน้าสายงานตรวจสอบแล้ว</span>'
                );

                while ($row = $db->Fetch($stmt)) {

                    $txtEdit = ($row['i_edit'] == (1 || 4 || 5 || 6 )) ? $editArry[$row['i_edit']] : '';

                    $temp = array(
                        "no" => $i++,
                        "id" => intval($row["tor_id"]),
                        "i_step" => intval($row["i_step"]),
                        "i_forword" => intval($row["i_forword"]),
                        "i_backword" => intval($row["i_backword"]),
                        "c_code" => $txtEdit . "<b>" . $row["c_code"] . "</b>",
                        "po_code" => $row["po_code"],
                        "c_codeStatus" => $row["c_code"], //database_start.png
                        "bg_budget_dtl_project_id" => intval($row["bg_budget_dtl_project_id"]),
                        "i_is_more" => intval($row["i_is_more"]),
                        "f_total_amt" => number_format($row["f_total_amt"], 2),
                        "i_is_rename" => intval($row["i_is_rename"]),
                        "c_budget_dtl_project" => $row["c_budget_dtl_project"],
                        "c_name" => $row["c_name"], //emp_name
                        "emp_name" => $row["emp_name"], //
                        "sp_emp_id" => $row["sp_emp_id"], //
                        "i_edit" => intval($row["i_edit"]),
                        "i_menu_edit" => intval($row["i_menu_edit"]),
                        "menu_edit" => $row["menu_edit"],
                        "i_alert_balance" => intval($row["DateDiff"]),
                        "DateDiff" => intval($row["DateDiff"]), // DateDiff d_tor_date_alert d_tor_date_pa d_tor_status_date DateDiff
                        "d_tor_date_alert" => ((empty($row["d_tor_date_alert"])) ? "" : $date->extDateBuddha($row["d_tor_date_alert"])), //d_tor_date
                        "d_tor_date_pa" => ((empty($row["d_tor_date_pa"])) ? "" : $date->extDateBuddha($row["d_tor_date_pa"])), //d_tor_date
                        "d_tor_status_date" => ((empty($row["d_tor_status_date"])) ? "" : $date->extDateBuddha($row["d_tor_status_date"])), //d_tor_date
                        "d_tor_date" => ((empty($row["d_tor_date"])) ? "" : $date->extDateBuddha($row["d_tor_date"])), //d_tor_date
                        "po_date" => ((empty($row["po_date"])) ? "" : $date->extDateBuddha($row["po_date"])),
                        "c_code_to_status" => $row["c_code_status"],
                        "c_code_status" => " <span style='font-weight:bold;color:blue'>" . $row["c_code_status"] . "</span>",
                        "c_name_status" => " <span style='color:blue'>" . $row["c_name_status"] . "</span>",
                        "tor_status_id" => $row["tor_status_id"],
                        "dc_cost_id" => intval($row["dc_cost_id"]),
                        "dc_cost_idTxt" => $row["dc_cost_idTxt"],
                        "dc_department_id" => intval($row["dc_department_id"]),
                        "c_department" => $row["c_department"],
                        "i_parent" => $row["i_parent"],
                        "i_is_parent" => $row["i_is_parent"],
                        "index_receive" => $row["index_receive"],
                        "d_doc_ref" => $row["d_doc_ref"],
                        "i_yyyy" => $row["i_yyyy"],
                        "c_year" => (intval($row["i_yyyy"]) + 543),
                        "tor_type_id" => $row["tor_type_id"],
                        "c_tor_type" => $row["c_type_name"], // $tor_type[$row["tor_type_id"]],
                        "i_purchase" => intval($row["i_purchase"]),
                        "c_purchase" => $i_purchase[$row["i_purchase"]],
                        "dc_expense_budget_type_id" => intval($row["dc_expense_budget_type_id"]),
                        "po_expense_id" => intval($row["po_expense_id"]),
                        "dc_user_create_id" => $row["c_create_name"],
                        "dc_user_create_cost_id" => $row["c_cost_creat_name"],
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
                echo json_encode(array("batchCounter" => $last ?? null, "totalCount" => $totalCount, $root => ${$root}));
                exit();
            }
        }
}
