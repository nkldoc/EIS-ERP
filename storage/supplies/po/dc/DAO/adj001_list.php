<?php

include_once './../../../conf/config.php';
include_once './../../../access/checkSession.php';
include_once './../../../lib/database/DatabaseServer.php';
include_once './../../../lib/database/apiUtil.php';
include_once './../../../lib/date/i_date.class.php';
include_once './../../../lib/mon/mon.class.php';
include_once './../../conf/configAR.php';
include_once './../../api/class/ar.status.class.php';
###################-------------------------------------------------------------------------------------------------
$db = new DatabaseServer();
$mon = new mon(); // convert floatval
$date = new i_date();
$util = new apiUtil();
######## Print & EDIT BILLING ###########
$table = "ar_bill_invoice_hdr";

/* @var $_POST type */
$_POST = $_POST ?? null;
$root = "data";
$data = array();
$sta = array(0 => "แก้ไข", 2 => "ปกติ", 3 => "ไม่สมบูรณ์", "" => "เลือกทั้งหมด");
$sta_txt = array("0" => "<font color=\"#ff0000\">ยกเลิก", "1" => "<font color=\"#800080\">รออนุมัติ", "2" => "<font color=\"#0000ff\">ส่งกลับ", "3" => "<font color=\"#008000\">อนุมัติแล้ว");

$i_enabled_txt = array("0" => "ไม่ใช้งาน", "1" => "<font color=blue>ใช้งาน", "2" => "<font color=red>ยกเลิก");

$orderTypeArr = array(1 => "<font color=red>แลกเปลี่ยน</font>", 0 => "<font color=red>ไม่แลกเปลี่ยน</font>");

$sqlClose = "select max(bill_yyyy_mm) from ar_close_bill_hdr where i_close_bill=? and i_is_center=?"; //ส่วนกลาง
$bill_close_yyyy_mm = $db->GetDataBySQL($sqlClose, array(0, 1));
$bill_close_yyyy_mm ?? '';

function DtlBilling($id = 0) {
    if ($id > 0) {
        $sql = "select count(a.ar_bill_invoice_dtl_id) from ar_bill_invoice_dtl a
                                            inner join ar_bill_invoice_hdr b on a.ar_bill_invoice_hdr_id = b.ar_bill_invoice_hdr_id
                                    where isnull(b.i_enabled,2) = 1 and a.ar_so_dtl_id =?";
        return $this->db->GetDataBySQL($sql, array($id));
    } else {
        return 0;
    }
}

// END FUNCTION

function getStatus($row = array(), $bill_close_yyyy_mm = false) {
    //i_is_status :{ code , print
    //1:{0, 0},
    //2:{0, 1},
    //3:{1, 1}
    //}

    if (!$bill_close_yyyy_mm) {

        if ($row["c_area_ref_doc"] == "0") {
            $i_is_status = 1;
        } else {
            $i_is_status = 2;
        }
        return (int) $i_is_status;
    } else {
        return (int) 4;
    }
}

// END FUNCTION

function getReq() {

    global $_POST;
    $mode = $_POST["mode"] ?? null;
    $filter = $_POST["filter"] ?? null;
    $value = $_POST["value"] ?? null;
    $i_read = $_POST["i_read"] ?? null;

    $limit = $_POST["limit"] ?? 20;
    $dir = $_POST["dir"] ?? "DESC";
    $sort = $_POST["sort"] ?? "d_billing_date";
    $start = $_POST["start"] ?? 0;
    $limit = $start + $limit;


//$ mode $ filter $ value $ i_read $ limit $ dir $ sort $ start
    return array(
        "mode" => $start, "filter" => $sort, "value" => $value, "i_read" => $i_read, "limit" => $limit, "dir" => $dir, "sort" => $sort, "start" => $start
    );
}

function interlizeCondionSQLMain() {
    global $_POST, $arrParam, $arrCountParam, $wh;
    $mode = $_POST["mode"] ?? null;
    $value = $_POST["value"] ?? null;
    $typeStore = $_POST['typeStore'] ?? null;

    if ($typeStore) { //Requst GET ROW
        $wh = " WHERE b.ar_bill_invoice_hdr_id=?";
        $arrParam[] = $typeStore;
        $arrCountParam[] = $typeStore;
    } else {

        $wh = " WHERE isnull(b.i_adj_rest,0)=0
                and isnull(b.i_no_order,0)=0
                and b.i_enabled in(?,2) 
                and isnull(b.i_parent,0) !=0
                and b.d_request_adjust_date is null
                -- and convert(varchar,d_request_adjust_date,120) between  '" . (date('Y-m-d')) . "' and '" . (date('Y-m-d')) . "'
                ";
        $arrParam[] = STATUS_ENABLE;
        $arrCountParam[] = STATUS_ENABLE;
    }
    if ($mode == "SEARCH") {
        $wh = " WHERE isnull(b.i_adj_rest,0)= 0
                and isnull(b.i_no_order,0)= 0
                and b.i_enabled in(?,2)
                and isnull(b.i_parent,0) !=0 
                ";
        $startDate = substr($_POST["startDate"], 0, 10);
        $endDate = substr($_POST["endDate"], 0, 10);

        $wh .= " and b.d_request_adjust_date between ? and ?";

        $arrParam[] = $startDate;
        $arrCountParam[] = $startDate;

        $arrParam[] = $endDate;
        $arrCountParam[] = $endDate;

        if ($value != '') {
            if ($_POST['filter'] == 'cnt_name') {
                $wh .= " and c.dc_cnt_id in (select dc_cnt_id from dbo.dc_cnt where c_name like ?)";
                $arrParam[] = "%{$value}%";
                $arrCountParam[] = "%{$value}%";
            } else {
                $wh .= " and " . $_POST['filter'] . " like ?";
                $arrParam[] = "%{$value}%";
                $arrCountParam[] = "%{$value}%";
            }
        }

        if ($_POST['i_is_bill_complete'] != -1) {
            $wh .= " and isnull(i_is_bill_complete,0) = ?";
            $arrParam[] = $_POST['i_is_bill_complete'];
            $arrCountParam[] = $_POST['i_is_bill_complete'];
        }
    }
 
    return array($arrParam, $arrCountParam, $wh) ?? null;
}

extract(getReq());
extract(interlizeCondionSQLMain());

$sqlTempTable = "SELECT ax.* FROM (
                    select row_number() over (order by b.d_billing_date desc,s.c_code ) as row
                        ,b.ar_bill_invoice_hdr_id
                        ,b.i_parent
                        ,b.ar_so_hdr_id
                        ,s.dc_cost_id
                        ,b.dc_cnt_id
                    from dbo.ar_bill_invoice_hdr b
                    inner join dbo.ar_so_hdr s on s.ar_so_hdr_id=b.ar_so_hdr_id"
        . $wh
        . $util->viewAcc("b", $i_read) . ") ax ";
        
$sqlMain = "SELECT bl.ar_bill_invoice_hdr_id
            , bl.dc_cnt_id
            , bl.ar_so_hdr_id
            , bl.i_parent 
            , bl.c_area_ref_doc
            , bl.i_is_status
            , convert(varchar(10), bl.d_request_adjust_date, 120) as d_request_adjust_date
            , isnull(bl.c_area_code,'') as c_area_code
            , isnull(bl.c_area_print,'') as c_area_print
            , so.pj_hdr_id
            , so.c_code as so_code
            , cnt.c_name as c_cnt_name

            , bl.f_net_cost_amt
            , bl.f_new_net_cost
            , bl.f_req_amt
            , bl.f_vat_amt
            , bl.f_req_amt+bl.f_vat_amt AS f_net_cost_add_vat_amt
            , bl.vat_rate
            , bl.tax_rate
            , bl.f_req_amt*(bl.tax_rate/100) AS f_tax_amt

            , bl.c_billing_name
            , cnt.c_code as c_cnt_code
            , (select top 1 c_code +' '+ c_name from dc_cnt_type where dc_cnt_type_id=cnt.dc_cnt_type_id) as dc_cnt_type_name
            , cnt.c_tax_value
            , cnt.c_address as c_address
            , cnt.c_telephone
            , cnt.c_mobile
            , cnt.c_fax

            , so.c_so_no
            , so.c_po_no
            , so.c_contract_no
            , isnull((select top 1 c_code +' '+ c_name from dc_comm where dc_comm_id=so.dc_comm_id), 'ไม่พบข้อมูล') as dc_comm_name
            , convert(varchar(10), so.d_so_date, 120) as d_so_date

            , pr.c_area_print as bl_code
            , convert(varchar(10), pr.d_billing_date, 120) as d_billing_date
            , pr.i_is_show_disc_cash
            , pr.i_is_billing
            , pr.i_is_invoice
            , pr.f_total_cost_amt as f_total_cost_amt1
            , pr.f_disc_com_amt as f_disc_com_amt1
            , pr.f_net_disc_comm_amt as f_net_disc_comm_amt1
            , pr.f_net_cost_amt as f_net_cost_amt1
            , pr.f_vat_amt as f_vat_amt1
            , pr.f_net_cost_add_vat_amt as f_net_cost_add_vat_amt1
            , pr.f_disc_cash_amt as f_disc_cash_amt1
            , pr.vat_rate as vat_rate1

            , (select dc_comment_dec_id from dc_comment_dec where c_name = bl.c_comment) as dc_comment_dec_id
            , bl.c_comment
            , bl.c_comment2

            , '{$bill_close_yyyy_mm}' AS close_month
            "
        . $util->getInfoTable("bl")
        . " FROM ($sqlTempTable) a
            inner join dbo.vw_customer cnt on cnt.dc_cnt_id=a.dc_cnt_id
            inner join dbo.ar_bill_invoice_hdr bl on bl.ar_bill_invoice_hdr_id=a.ar_bill_invoice_hdr_id
            inner join dbo.ar_bill_invoice_hdr pr on pr.ar_bill_invoice_hdr_id=a.i_parent
            inner join dbo.ar_so_hdr so on so.ar_so_hdr_id=bl.ar_so_hdr_id
        WHERE a.row > ? and a.row <= ? ;";

$arrParam[] = $start;
$arrParam[] = $limit;
//print_R($arrParam);
//echo $sqlMain;
//exit();
$stmt = $db->QueryParam($sqlMain, $arrParam);
$i = $start + 1;

function i_is_status() {

}

while ($row = $db->Fetch($stmt)) {
//GET STSTUST
  //  $i_is_status = getSoStatus($row);
    $isDel = true;     // false
    $isEdit = true;     //  SOME Content
    $isCancel = true;   // DELETE Cancel

    $f_net_cost_amt = number_format($row["f_net_cost_amt"], 2);
    $f_new_net_cost = number_format($row["f_new_net_cost"],2);
    $f_req_amt = number_format($row["f_req_amt"],2);
    $f_vat_amt = number_format($row["f_vat_amt"], 2);
    $f_net_cost_add_vat_amt = number_format(($row["f_net_cost_add_vat_amt"]),2);

    $f_total_cost_amt1 = number_format($row["f_total_cost_amt1"], 2);
    $f_disc_com_amt1 = number_format($row["f_disc_com_amt1"], 2);
    $f_net_disc_comm_amt1 = number_format($row["f_net_disc_comm_amt1"], 2);

    $f_net_cost_amt1 = number_format($row["f_net_cost_amt1"], 2);
    $f_vat_amt1 = number_format($row["f_vat_amt1"], 2);
    $f_net_cost_add_vat_amt1 = number_format($row["f_net_cost_add_vat_amt1"], 2);
    $f_disc_cash_amt1 = number_format($row["f_disc_cash_amt1"],2);
    if ($row["i_is_show_disc_cash"]==1 ){   
        $f_net_cost_amt1= number_format(($row["f_net_cost_amt1"]-$row["f_disc_cash_amt1"]), 2);
        $f_vat_amt1= number_format((($row["f_net_cost_amt1"]-$row["f_disc_cash_amt1"])*($row["vat_rate1"]/100)), 2); 
        $f_net_cost_add_vat_amt1 = number_format((($row["f_net_cost_amt1"]-$row["f_disc_cash_amt1"]) + (($row["f_net_cost_amt1"]-$row["f_disc_cash_amt1"])*($row["vat_rate1"]/100))), 2);
    } else if ($row["i_is_show_disc_cash"]==0){ 
        if ($row["i_is_billing"]==1){   
            $f_net_cost_amt1= number_format(($row["f_net_disc_comm_amt1"]-$row["f_disc_cash_amt1"]), 2);
            $f_vat_amt1= number_format((($row["f_net_disc_comm_amt1"]-$row["f_disc_cash_amt1"])*($row["vat_rate1"]/100)), 2); 
        }else if($row["i_is_invoice"]==1){  
            $f_disc_cash_amt1 = number_format(0,2);
        }
    } 

    $i_is_status = getStatus($row, false); //


    if ($i_is_status === 1) {      //NO GEN CODE ALL
        $isDel = true; // TRUE
        $isEdit = true; // trueALL"; //ALL CONTENT
        $isCancel = true; // false
    } else if ($i_is_status === 2) { //AR GENCODE waingting Print
        $isDel = false;     //  false
        $isEdit = false; // "trueSome";     // SOME CONTENT
        $isCancel = false;   // FALSE
    } else if ($i_is_status === 4) { //GEN CODE AR CODE PRINT CODE waiting CM
        $isDel = false;     // false
        $isEdit = false; // "trueSome";     //  SOME Content
        $isCancel = false;   // DELETE Cancel
    }

    $print_code = $row['c_area_ref_doc'] == '0' ? '<img src="../images/icons/printer_mono.png" style="cursor:pointer"/>' : '';

    $temp = array(
        "no" => ($i++),
        "delID" => ($isDel) ? '<img src="../images/icons/decline.png" style="cursor:pointer"/>' : '',
        "editID" => ($isEdit) ? '<img src="../images/icons/document_edit.gif" style="cursor:pointer"/>' : '',
        "cancelID" => ($isCancel) ? "<button id='cancle" . $row["ar_bill_invoice_hdr_id"] . "'>ยกเลิก</button>" : '',
        "id" => $row["ar_bill_invoice_hdr_id"] ?? NULL,
        "dc_cnt_id" => $row["dc_cnt_id"] ?? NULL,
        "ar_so_hdr_id" => $row["ar_so_hdr_id"] ?? NULL,
        "i_parent" => $row["i_parent"] ?? NULL,
        "c_area_ref_doc" => $row["c_area_ref_doc"] ?? NULL,
        "txt_status" => $sta_txt[$i_is_status] ?? null,
        "d_request_adjust_date" => $date->extDateBuddha($row["d_request_adjust_date"]),
        "c_area_code" => $row["c_area_code"] ?? NULL,
        "c_area_print" => $row["c_area_print"] ?? NULL,
        "so_code" => ($row["pj_hdr_id"] > 0) ? $row["so_code"] . "<span style='color:red'> IMC</span>" : $row["so_code"],
        "txtar_so_hdr_idID" => $row["so_code"] ?? NULL,
        "c_cnt_name" => $row["c_cnt_name"],

        "f_net_cost_amt" => $f_net_cost_amt,
        "f_new_net_cost" => $f_new_net_cost,
        "f_req_amt" => $f_req_amt,
        "f_vat_amt" => $f_vat_amt,
        "f_net_cost_add_vat_amt" => $f_net_cost_add_vat_amt,
        "vat_rate" => number_format($row["vat_rate"], 2),
        "tax_rate" => number_format($row["tax_rate"], 2),
        "f_tax_amt" => number_format($row["f_tax_amt"], 2),
        

        "txtdc_cnt_idID" => $row["c_billing_name"] ? $row["c_cnt_code"] . " " . $row["c_billing_name"] : "ไม่มีข้อมูลรหัส[" . $row["dc_cnt_id"] . "]", //frm
        "dc_cnt_type_name" => $row["dc_cnt_type_name"],
        "c_tax_value" => $row["c_tax_value"],
        "c_address" => $row["c_address"],
        "c_telephone" => $row["c_telephone"],
        "c_mobile" => $row["c_mobile"],
        "c_fax" => $row["c_fax"],
        
        "c_so_no" => $row["c_so_no"] ?? NULL,
        "c_po_no" => $row["c_po_no"] ?? NULL,
        "c_contract_no" => $row["c_contract_no"] ?? NULL,
        "dc_comm_name" => $row["dc_comm_name"] ?? NULL,
        "d_so_date" => $date->shot_date_from_db($row["d_so_date"]),

        "txtar_bill_invoice_hdr_idID" => $row["c_area_print"] ?? NULL,
        "bl_code" => $row["bl_code"],
        "d_billing_date" => $date->shot_date_from_db($row["d_billing_date"]),
        "f_total_cost_amt1" => $f_total_cost_amt1,
        "f_disc_com_amt1" => $f_disc_com_amt1,
        "f_net_disc_comm_amt1" => $f_net_disc_comm_amt1,
        "f_net_cost_amt1" => $f_net_cost_amt1,
        "f_vat_amt1" => $f_vat_amt1,
        "f_net_cost_add_vat_amt1" => $f_net_cost_add_vat_amt1,
        "f_disc_cash_amt1" => $f_disc_cash_amt1,

        "dc_comment_dec_id" => $row["dc_comment_dec_id"],
        "c_comment" => $row["c_comment"],
        "c_comment2" => $row["c_comment2"],

        "create_id" => $row["c_create_name"],
        "create_org_id" => $row["c_cost_creat_name"],
        "t_create_dt" => $date->extDateBuddha($row["t_create_dt"]),
        "update_id" => $row["c_update_name"],
        "update_org_id" => $row["c_cost_update_name"],
        "t_update_dt" => $date->extDateBuddha($row["t_update_dt"])
    );
    ${$root}[] = $temp;
}  //End while
$sqlCount = "select count(*) as totalCount from ({$sqlTempTable}) a";
$totalCount = $db->GetDataBySQL($sqlCount, $arrCountParam);
echo json_encode(array("debug" => true, "totalCount" => $totalCount, $root => ${$root}));
