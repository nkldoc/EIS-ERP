<?php

 include("../../../conf/config.php");
 include("../../../lib/database/DatabaseServer.php");
 include("../../../lib/database/apiUtil.php");
 include("../../../lib/date/i_date.class.php");

###################
 $db = new DatabaseServer();
 $date = new i_date();
 $util = new apiUtil();
 ##########################################
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
     $limit = 40;
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
 
if ($act == "SEARCH") {
    $wh .= ($_REQUEST['tor_type_id'] != 0) ? " and a.tor_type_id =" . $_REQUEST['tor_type_id'] : "";
    $wh .= ($_REQUEST['c_code'] != "") ? " and a.c_code like '%" . $_REQUEST['c_code'] . "%'" : "";
    $wh .= ($_REQUEST['c_name'] != 0) ? " and a.c_name like '%" . $_REQUEST['c_name'] . "%'" : "";
    $wh .= " and a.i_enabled =" . $_REQUEST['i_enabled'];
} else {
    $wh .= ($tor_type_show == true) ? " and tor_status_id is null" : "";
}
 if (true) {
      $mode = @$_REQUEST["mode"];
    $filter = @$_REQUEST["filter"];
    $value = @$_REQUEST["value"];
    $i_read = @$_REQUEST["i_read"];
    ###################
    $root = "data";
    $data = array();
    ###################
    $limit = @$_REQUEST["limit"];
    $dir = @$_REQUEST["dir"];
    $sort = @$_REQUEST["sort"];
    $start = @$_REQUEST["start"];

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
    $act = $_REQUEST['act'] ?? null;
    $wh = "";
    $where = '';
    $c_code = $_REQUEST['c_code'] ?? null;
    if ($act == "SEARCH") {
        $wh .= ($c_code != "") ? "          and ac.c_code like '%" . $c_code . "%'" : "";
        $wh .= ($_REQUEST['c_arrive_code'] != "") ? "   and cc.c_arrive_code like '%" . $_REQUEST['c_arrive_code'] . "%'" : "";
        $wh .= ($_REQUEST['c_doc_ref'] != "") ? "       and cc.c_code like '%" . $_REQUEST['c_doc_ref'] . "%'" : "";
    }
    $i_level = $_SESSION['i_level'];
    $dc_department = $_SESSION['dc_department_id'];
    $sp_emp_id = $_SESSION['sp_emp_id'];
    // print_r($_SESSION);
    if ($i_level == 1) {
        $where = '';
    } else if ($i_level == 2) {
        $where = ' and bb.dc_department_id = ' . $dc_department;
    } else if ($i_level == 3) {
        $where = ' and bb.sp_emp_id = ' . $sp_emp_id;
    }
    $sqlTempTable = "select cc.sp_check_period_hdr_id,s.sp_po_id
                                , cc.sp_tor_hdr_period_id
				, cc.c_arrive_code
				, cc.c_checking_code
				, cc.c_code as c_check_code
				, CASE WHEN ISNULL(s.sp_po_id,0) > 0
                                THEN 1
                                ELSE 0
                 END AS i_is_po
				 , CASE WHEN ISNULL(s.sp_po_id,0) > 0
                                THEN (select top 1 sp_po_id from sp_po_hdr where sp_po_id=s.sp_po_id)
                                ELSE (select top 1 sp_tor_contract_id from sp_tor_contract where sp_tor_contract_id=s.sp_contract_id)
                 END AS id
				 , CASE WHEN ISNULL(s.sp_po_id,0) > 0
                                THEN (select top 1  sp_tor_contract_id from sp_po_hdr where sp_po_id=s.sp_po_id)
                                ELSE (select top 1  sp_tor_contract_id from sp_tor_contract where sp_tor_contract_id=s.sp_contract_id)
                 END AS sp_tor_contract_id
                , isnull(convert(varchar, s.d_start_date, 120),'') as d_start_date
                , isnull(convert(varchar, s.d_end_date, 120),'') as d_end_date
                , cc.i_step
                , cc.i_menu
                , cc.sp_emp_id
                , row_number() over (order by cc.sp_check_period_hdr_id DESC) as row
                from dbo.sp_mn_contract_hdr s
                right join dbo.sp_check_period_hdr cc on cc.sp_mn_contract_hdr_id=s.sp_mn_contract_hdr_id
                inner join dbo.sp_tor_contract ac on s.sp_contract_id = ac.sp_tor_contract_id
                inner join dbo.sp_emp bb on bb.sp_emp_id = s.sp_emp_id

                where cc.c_arrive_code is not null"
            . "{$where}"
            . "{$wh}"
            . "-- and (isnull(i_step,0) <> 3)
                group by cc.sp_check_period_hdr_id,s.sp_po_id
                , cc.i_step
                , cc.i_menu
                        , cc.sp_tor_hdr_period_id
                        , cc.c_arrive_code
                        , cc.c_checking_code
                        , cc.c_code
                        , cc.sp_emp_id
                        , s.sp_po_id
                        , s.sp_contract_id
                        , s.d_start_date
                        , s.d_end_date
                        , s.sp_mn_contract_hdr_id
                        ";
    $arrParam[] = $start;
    $arrParam[] = $limit;
    $sqlMain = "select a.*
            , (SELECT sum(f_net_total_price) FROM sp_check_period_dtl WHERE sp_check_period_hdr_id=c.sp_check_period_hdr_id) AS f_net_total_price
            , isnull((select top 1 c_name from NMU.dbo.dc_creditor where dc_creditor_id=b.dc_creditor_id),'')  as dc_creditor_idTxt
            , (select top 1  sp_check_period_dtl_id from sp_check_period_dtl where sp_tor_hdr_period_id = d.sp_tor_hdr_period_id) as sp_check_period_dtl_id
            , (select top 1  sp_tor_dtl_period_id from sp_tor_dtl_period aaa where sp_tor_hdr_period_id = d.sp_tor_hdr_period_id) as sp_tor_dtl_period_id
	    , (select top 1  i_yyyy from sp_tor where tor_id = b.sp_tor_id) as i_yyyy
            , (select top 1  i_period from sp_tor_hdr_period where sp_tor_hdr_period_id = a.sp_tor_hdr_period_id) as i_period

            , CASE
                WHEN ISNULL(a.i_is_po,0) = 0
                THEN  (select top 1  c_code from sp_tor_contract where sp_tor_contract_id=a.id)
                ELSE (select top 1  c_code from sp_po_hdr where sp_po_id=a.id) END AS c_code
        , b.sp_tor_id
        , isnull(convert(varchar, c.d_checking_date, 120),'') as d_checking_date
        , isnull(convert(varchar, c.d_doc_arrive_dt, 120),'') as d_doc_arrive_dt
        , isnull((select top 1  c_name from dbo.sp_emp where sp_emp_id=c.sp_emp_id),'') as withdraw_name
        --, isnull((select top 1 i_is_waiting from sp_withdraw_item where i_is_waiting =1 and sp_check_period_hdr_id=c.sp_check_period_hdr_id),0) as i_request
        , c.i_is_waiting as i_request
        , b.dc_cost_id
        , b.sp_tor_id
        , case when c.i_yyyy_overlap is null  and b.i_yyyy_overlap is null
            then 	 (select top 1  i_yyyy from sp_tor where tor_id = b.sp_tor_id)
            when c.i_yyyy_overlap  is null  then b.i_yyyy_overlap
            when b.i_yyyy_overlap is null   then c.i_yyyy_overlap
            else
		c.i_yyyy_overlap  end as c_yyyy
        , c.i_yyyy_overlap, c.c_overlap,b.i_overlap,c.bg_reserve_overlap_id
        , c.i_overlap as i_overlapcheck
        , d.i_pr_type1
        , bb.i_type_bg
        , (select top 1  po_expense_id from sp_tor where tor_id = b.sp_tor_id) as po_expense_id
        , (select top 1  c_code from  " . DB_NMU_EIS . "bg_expense cc where bb.po_expense_id = cc.bg_expense_id)
        , b.c_overlap as c_contract_overlap
        , (select top 1  c_name from " . DB_NMU_EIS . "bg_expense ee where bb.po_expense_id = ee.bg_expense_id ) as expense_name
        , (select top 1  c_name from " . DB_CENTER . "dc_expense_budget_type eee where bb.dc_expense_budget_type_id = eee.dc_expense_budget_type_id ) as budget_type
        , d.dc_expense_budget_type_id
        , d.i_is_last
        , c.c_billing_code
        , c.i_is_warranty
        ,(select convert(varchar, DATEADD(year, 543, d_billing_date), 105) from  dbo.sp_bg_billing_dtl where c.d_doc_arrive_dt  between d_start_date and d_end_date ) as d_billing_date
        , b.c_name as c_name
        , bb.dc_cost2_id as dc_cost_id2
        ,case when   isnull (b.i_overlap,0) != 3 and  isnull(bb.i_type_bg,0) = 4    then 1 when   isnull(b.i_overlap,0) = 3   then  2
                else  0 end   as i_status_overlap  -- 0 ปกติ  1 กันเหลื่อมยังไม่ก่อหนี้    2 กันเหลื่อม ก่อหนี้แล้ว
        from ({$sqlTempTable}) a "
            . " inner join sp_tor_contract b on a.sp_tor_contract_id = b.sp_tor_contract_id "
            . " inner join sp_check_period_hdr c on c.sp_check_period_hdr_id = a.sp_check_period_hdr_id"
            . " inner join sp_tor_hdr_period d on d.sp_tor_hdr_period_id = c.sp_tor_hdr_period_id"
            . " left join  sp_tor bb on b.sp_tor_id = bb.tor_id "
            . " WHERE row > ? and row <= ?   ";
 
    $stmt = $db->QueryParam($sqlMain, $arrParam);
    $i = $start + 1;

    while ($row = $db->Fetch($stmt)) {
        $subSql = "select top 1 "
                . " i_purchase"
                . ", i_hire_type "
                . ", i_product_type"
                . ",(select c_name from dbo.sp_emp where sp_emp_id=sp_tor.sp_emp_id) as emp_name "
                . "from dbo.sp_tor where tor_id=?";

        $f1 = $db->GetDataBySQL($subSql, array($row["sp_tor_id"]));

        $row["i_is_waiting"] = $row["i_request"]; //i_request
        $txtRed = "";
        if ($row["c_check_code"] != "" && $row["i_is_waiting"] == 1 && $row["i_step"] == 3) {
            $txtRed = "<font color=red>ส่งแก้ไข</font>";
        } else if ($row["c_check_code"] != "" && $row["i_is_waiting"] == 0 && $row["i_step"] == 4) {
            $txtRed = "<font color=blue>ส่งแก้ไขแล้ว</font>";
        }
        $temp = array(
            "no" => $i++,
            "id" => intVal($row["sp_tor_hdr_period_id"]),
            "sp_check_period_hdr_id" => intval($row["sp_check_period_hdr_id"]),
            "i_status_overlap" => intval($row["i_status_overlap"]),
            "sp_tor_dtl_period_id" => intVal($row["sp_tor_dtl_period_id"]),
            "sp_check_period_dtl_id" => intval($row["sp_check_period_dtl_id"]),
            "i_request" => intval($row["i_request"]),
            "i_step" => intval($row["i_step"]),
            "i_is_warranty" => $row["i_is_warranty"],
            "c_contract_overlap" => $row["c_contract_overlap"],
            "i_yyyy_overlap" => $row["i_yyyy_overlap"],
            "d_billing_date" => $row["d_billing_date"],
            "c_overlap" => $row["c_overlap"],
            "c_billing_code" => $row["c_billing_code"],
            "i_overlap" => $row["i_overlap"],
            "i_type_bg" => $row["i_type_bg"],
            "i_overlapcheck" => $row["i_overlapcheck"],
            "bg_reserve_overlap_id" => $row["bg_reserve_overlap_id"],
            "i_menu" => intval($row["i_menu"]),
            "f_net_total_price" => number_format($row["f_net_total_price"], 2),
            "c_code" => $row["c_code"],
            "c_contract_code" => $row["c_check_code"] . $txtRed,
            "c_checking_code" => $row["c_check_code"],
            "c_arrive_code" => $row["c_arrive_code"],
            "i_is_last" => $row["i_is_last"],
            "c_name" => $row["c_name"],
            "dc_cost_id2" => $row["dc_cost_id2"],
            "expense_name" => $row["expense_name"],
            "budget_type" => $row["budget_type"],
            "po_expense_id" => $row["po_expense_id"],
            "dc_expense_budget_type_id" => $row["dc_expense_budget_type_id"],
            "sp_tor_contract_id" => intVal($row["sp_tor_contract_id"]),
            "dc_cost_id" => intVal($row["dc_cost_id"]),
            "sp_tor_id" => intVal($row["sp_tor_id"]),
            "sp_tor_hdr_period_id" => intVal($row["sp_tor_hdr_period_id"]),
            "i_period" => $row["i_period"],
            "c_yyyy" => intVal($row["c_yyyy"] + 543),
            "use_yyyy" => intVal(date('Y') + 543),
            "i_yyyy" => intVal($row["i_yyyy"]),
            "i_pr_type1" => intVal($row["i_pr_type1"]),
            "i_is_po" => intVal($row["i_is_po"]),
            "i_purchase" => intVal($f1["i_purchase"]),
            "i_hire_type" => intVal($f1["i_hire_type"]),
            "i_product_type" => intVal($f1["i_product_type"]),
            "withdraw_name" => $row["withdraw_name"],
            "emp_name" => $f1["emp_name"],
            "dc_creditor_name" => $row["dc_creditor_idTxt"],
            "d_doc_arrive_dt" => ((empty($row["d_doc_arrive_dt"])) ? "" : $date->extDateBuddha($row["d_doc_arrive_dt"])), //d_tor_date
            "d_checking_date" => ((empty($row["d_checking_date"])) ? "" : $date->extDateBuddha($row["d_checking_date"])), //d_tor_date
            "d_start_date" => ((empty($row["d_start_date"])) ? "" : $date->extDateBuddha($row["d_start_date"])), //d_tor_date
            "d_end_date" => ((empty($row["d_end_date"])) ? "" : $date->extDateBuddha($row["d_end_date"])), //d_tor_date
        );

        ${$root}[] = $temp;
    }
    $sqlCount = "select count(*) as totalCount from ({$sqlTempTable}) a";
    $totalCount = $db->GetDataBySQL($sqlCount, $arrCountParam);
    echo json_encode(array("debug" => true, "totalCount" => $totalCount, $root => ${$root}));
    exit;
} else {
// JSON string for testttttttttttttttttttttttttttttttttttttttttttt
    $jsonData = '{
    "totalCount":3,
    "data": [
        {"id": 1, "name": "Item A", "category": "Category 1"},
        {"id": 2, "name": "Item B", "category": "Category 1"},
        {"id": 3, "name": "Item C", "category": "Category 2"}
    ]
}';
// Decode JSON to PHP array
    $arrayData = json_decode($jsonData, true);
    echo json_encode($arrayData);
    exit();
}


