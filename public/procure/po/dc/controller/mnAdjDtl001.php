<?php

include_once './../../../conf/config.php';
include_once './../../../access/checkSession.php';
include_once './../../../lib/database/DatabaseServer.php';
include_once './../../../lib/database/apiUtil.php';
include_once './../../../lib/date/i_date.class.php';
include_once './../../../lib/mon/mon.class.php';

$db = new DatabaseServer();
$date = new i_date();
$util = new apiUtil();
$mon = new mon(); 
$mode = $_REQUEST["mode"];
$table = "ar_bill_invoice_dtl";
$keyName = "ar_bill_invoice_dtl_id"; 
$data = $util->mnUser($_REQUEST); 

function sammaryToHdr($db, $mon, $data, $opt = "ADD") {
    $sqls = "SELECT c.i_class_type
                , a.i_is_invoice
                , a.i_is_disc_cash
                , a.vat_rate
                , (SELECT dc_tax_id FROM dc_tax_def 
                    WHERE dc_product_class_id in(SELECT dc_product_class_id FROM dc_product_type 
                                                WHERE dc_product_type_id=a.dc_product_type_id)) as tax_wht_id
                , sum(isnull(b.f_total_cost,0)) as f_total_cost
                , sum(isnull(b.f_disc_com,0)) as f_disc_com
                , sum(isnull(b.f_net_disc_comm_amt,0)) as f_net_disc_comm_amt
                , sum(isnull(b.f_disc_cash,0)) as f_disc_cash
                , sum(isnull(b.f_net_cost,0)) as f_net_cost
                , sum(isnull(b.f_new_net_cost,0)) as f_new_net_cost
                , sum(isnull(b.f_req_amt,0)) as f_req_amt
                , sum(isnull(b.f_wht_amt,0)) as f_wht_amt
            FROM ar_bill_invoice_hdr a
                inner join ar_bill_invoice_dtl b on a.ar_bill_invoice_hdr_id = b.ar_bill_invoice_hdr_id
                inner join ar_so_hdr c on a.ar_so_hdr_id = c.ar_so_hdr_id
            WHERE a.ar_bill_invoice_hdr_id = ?
            GROUP BY c.i_class_type
                , a.i_is_invoice
                , a.i_is_disc_cash
                , a.vat_rate
                , a.dc_product_type_id ";

    $rs = $db->GetDataBySQL($sqls, array($data['ar_bill_invoice_hdr_id']));
  
    $sql = "SELECT f_tax_rate FROM dc_tax WHERE dc_tax_id = ?";
    $wht_rate = $db->GetDataBySQL($sql, array($rs['tax_wht_id']));
    $f_vat_amt = $mon->round54(($rs["f_net_cost"] * $rs['vat_rate']/100), 2);
    $data_update = array();

    //=== Assign value of each variable
    $data_update["dc_tax_id_tax"]   = $rs['tax_wht_id'];    // รหัสภาษีหัก ณ ที่จ่าย
    $data_update["vat_rate"]        = $rs['vat_rate'];      // อัตราภาษีมูลค่าเพิ่ม
    $data_update["tax_rate"]        = $wht_rate;            // อัตราภาษีหัก ณ.ที่จ่าย
    $data_update["f_vat_amt"]       = $f_vat_amt;           // ภาษีมูลค่าเพิ่ม
    $data_update["f_tax_amt"]       = $rs["f_wht_amt"] ;    // จำนวนเงินภาษี หัก ณ.ที่จ่าย
    $data_update["f_total_cost_amt"]= $rs["f_total_cost"];  // จำนวนเงินก่อนหักรายการต่างๆ
    $data_update["f_disc_com_amt"]	= $rs["f_disc_com"];    // จำนวนเงินส่วนลดการค้า
    $data_update["f_disc_cash_amt"]	= $rs["f_disc_cash"];   // จำนวนเงินส่วนลดเงินสด
    $data_update["f_net_cost_amt"]  = $rs["f_net_cost"];    // จำนวนเงินหลังหักส่วนลดต่างๆ
    $data_update["f_new_net_cost"]  = $rs["f_new_net_cost"];//จำนวนเงินสุทธิหลังปรับปรุงหนี้
    $data_update["f_req_amt"]       = $rs["f_req_amt"];     //จำนวนเงินที่ขอปรับลด
    $data_update["f_net_disc_comm_amt"] = $rs["f_net_disc_comm_amt"]; // จำนวนเงินหลังหักส่วนลดการค้า


    // === ในกรณีที่ i_is_disc_cash=1 คือให้ส่วนลดล่วงหน้าเป็นกรณพิเศษ
    if ($rs["i_is_invoice"]==1){
        if ($rs["i_is_disc_cash"] == 0){
            $data_update["f_vat_amt"] =  $mon->round54(($rs["f_net_disc_comm_amt"] * $rs['vat_rate']/100), 2); //case invoice ==1 and i_is_show_disc_cash=0 ให้ใช้ยอดหักส่วนลดการค้ามาคำนวณภาษีมูลค่าเพิ่ม
            $data_update["f_tax_amt"] =  $mon->round54(($rs["f_net_disc_comm_amt"] * $wht_rate/100), 2); //case invoice ==1 and i_is_show_disc_cash=0ให้ใช้ยอดหักส่วนลดการค้ามาคำนวณภาษีหัก ณ.ที่จ่าย
        }else if ($rs["i_is_disc_cash"]==1){
            $data_update["f_vat_amt"] =  $mon->round54(($rs["f_net_cost"] * $rs['vat_rate']/100), 2);//case i_is_show_disc_cash ==1 ให้ใช้ยอดหักส่วนลดการค้ามาคำนวณภาษีมูลค่าเพิ่ม
            $data_update["f_tax_amt"] =  $mon->round54(($rs["f_net_cost"] * $wht_rate/100), 2);//case i_is_show_disc_cash ==1 ให้ใช้ยอดหักส่วนลดการค้ามาคำนวณภาษีหัก ณ.ที่จ่าย
        }
    }

    if (($rs["i_class_type"] == 3) || ($rs["i_class_type"] == 4) || ($rs["i_class_type"] == 5))
    {
        $data_update["f_vat_amt"] =  $mon->round54(($rs["f_net_cost"] * $rs['vat_rate']/100), 2);//case invoice ==1 ให้ใช้ยอดหักส่วนลดการค้ามาคำนวณภาษีมูลค่าเพิ่ม
        $data_update["f_tax_amt"] =  $mon->round54(($rs["f_net_cost"] * $wht_rate/100), 2);//case invoice ==1 ให้ใช้ยอดหักส่วนลดการค้ามาคำนวณภาษีหัก ณ.ที่จ่าย
    }

    $data_update["f_net_comm_add_vat_amt"] = $rs["f_net_disc_comm_amt"]+$data_update["f_vat_amt"]; // จำนวนเงินหลังหักส่วนลดการค้า บวก ภาษีมูลค่าเพิ่ม
    $data_update["f_net_cost_add_vat_amt"]	= $rs["f_net_cost"] + $data_update["f_vat_amt"]; // จำนวนเงินหลังหักส่วนลดต่างๆ บวกภาษี yun add

    if (($rs["i_class_type"] == 3) || ($rs["i_class_type"] == 4) || ($rs["i_class_type"] == 5))
    {	
        $data_update["f_net_comm_add_vat_amt"] = $rs["f_net_cost"]+$data_update["f_vat_amt"]; // จำนวนเงินหลังหักส่วนลดการค้า และ ส่วนลดเงินสด บวก ภาษีมูลค่าเพิ่ม
    }

    if (empty($data_update["f_total_cost_amt"])){
        $data_update["f_total_cost_amt"]			=0;
        $data_update["f_vat_amt"]					=0;
        $data_update["f_disc_com_amt"]				=0;
        $data_update["f_disc_cash_amt"]			    =0;
        $data_update["f_net_disc_comm_amt"]		    =0;
        $data_update["f_net_comm_add_vat_amt"]		=0;
        $data_update["f_net_cost_add_vat_amt"]		=0;
        $data_update["f_tax_amt"]					=0;
        $data_update["f_req_amt"]					=0;
        $data_update["f_new_net_cost"]				=0;
        $data_update["f_net_cost_amt"]				=0;
    }

    $sql = "UPDATE dbo.ar_bill_invoice_hdr
            SET [dc_tax_id_tax] = ?
                , [vat_rate] = ?
                , [tax_rate] = ?
                , [f_vat_amt] = ?

                , [f_tax_amt] = ?
                , [f_total_cost_amt] = ?
                , [f_disc_com_amt] = ?
                , [f_disc_cash_amt] = ?

                , [f_net_cost_amt] = ?
                , [f_new_net_cost] = ?
                , [f_req_amt] = ?
                , [f_net_disc_comm_amt] = ?

                , [f_net_comm_add_vat_amt] = ?
                , [f_net_cost_add_vat_amt] = ?
            WHERE ar_bill_invoice_hdr_id = ?;
    ";

    $params = array($data_update["dc_tax_id_tax"]
                    , $data_update["vat_rate"]
                    , $data_update["tax_rate"]
                    , $data_update["f_vat_amt"]

                    , $data_update["f_tax_amt"]
                    , $data_update["f_total_cost_amt"]
                    , $data_update["f_disc_com_amt"]
                    , $data_update["f_disc_cash_amt"]

                    , $data_update["f_net_cost_amt"]
                    , $data_update["f_new_net_cost"]
                    , $data_update["f_req_amt"]
                    , $data_update["f_net_disc_comm_amt"]

                    , $data_update["f_net_comm_add_vat_amt"]
                    , $data_update["f_net_cost_add_vat_amt"]
                    , $data['ar_bill_invoice_hdr_id']);
    $smtUP = $db->QueryParam($sql, $params);

    return $smtUP;
}//END Fn

if ($mode == 'ADD' || $mode == 'EDIT') {
    $db->BeginTran();
    $checkVal = 0;
    $bill_dtl_ids = "";






    if (is_array($data["f_req_amt"])){
        foreach($data["f_req_amt"] as $ar_bill_invoice_dtl_id => $val){
            $bill_dtl_ids .= ", {$ar_bill_invoice_dtl_id}";
        }

        $sql = "SELECT a.ar_bill_invoice_dtl_id
                    , a.ar_so_dtl_id
                    , a.ar_condi_pay_hdr_id
                    , a.ar_condi_pay_dtl_id
                    , a.ar_dtl_period_onair_id
                    , a.dc_wht_tax_id
                    , b.f_tax_rate
                FROM ar_bill_invoice_dtl a
                    INNER JOIN dc_tax b on b.dc_tax_id=a.dc_wht_tax_id
                WHERE a.ar_bill_invoice_dtl_id IN (0 {$bill_dtl_ids})
                ORDER BY a.ar_bill_invoice_dtl_id";

        $stmt = $db->QueryParam($sql, array());
        $arrInsert = array();
        $sql_insert = "";
        while ($row = $db->Fetch($stmt)) {

            $sql_insert .= "INSERT INTO ar_bill_invoice_dtl (ar_bill_invoice_hdr_id, ar_condi_pay_hdr_id, ar_condi_pay_dtl_id
                                                        , ar_so_dtl_id, ar_dtl_period_onair_id, pj_send_period_dtl_id
                                                        , pj_period_budget_id, ar_so_activi_id, i_parent_edit_id
                                                        , dc_wht_tax_id, f_total_cost, f_new_net_cost
                                                        , f_req_amt, f_req_total_amt, f_disc_com
                                                        , f_disc_cash, f_net_disc_comm_amt, f_net_cost
                                                        , f_wht_amt, f_left_cost, f_balance_amt
                                                        , i_is_adjust, i_is_receive, c_comment
                                                        , create_id, create_org_id, t_create_dt
                                                        , update_id, update_org_id, t_update_dt
                                                        )VALUES(
                                                            ?, ?, ?
                                                            , ?, ?, ?
                                                            , ?, ?, ?
                                                            , ?, ?, ?
                                                            , ?, ?, ?
                                                            , ?, ?, ?
                                                            , ?, ?, ?
                                                            , ?, ?, ?
                                                            , ?, ?, ?
                                                            , ?, ?, ?
                                                        );";
            $fq_adj_req     = str_replace(",","",$data["fq_adj_req"][$row["ar_bill_invoice_dtl_id"]]);
            $f_req_amt      = str_replace(",","",$data["f_req_amt"][$row["ar_bill_invoice_dtl_id"]]);
            $f_req_total_amt = $fq_adj_req + $f_req_amt;
            $f_new_net_cost = str_replace(",","",$data["f_new_cost"][$row["ar_bill_invoice_dtl_id"]]);
            $f_wht_amt      = $f_new_net_cost * ($row["f_tax_rate"]/100);
            $f_net_cost     = str_replace(",","",$data["fq_net1"][$row["ar_bill_invoice_dtl_id"]]);
            $f_left_cost    = round($f_net_cost,2) - round($f_req_total_amt,2);
            $f_left_cost    = ($f_left_cost > 0)? $f_left_cost : round($f_net_cost,2);

            $arrInsert[]    = $data["ar_bill_invoice_hdr_id"];
            $arrInsert[]    = $row["ar_condi_pay_hdr_id"];
            $arrInsert[]    = $row["ar_condi_pay_dtl_id"];

            $arrInsert[]    = $row["ar_so_dtl_id"];
            $arrInsert[]    = $row["ar_dtl_period_onair_id"];
            $arrInsert[]    = 0; // pj_send_period_dtl_id

            $arrInsert[]    = 0; // pj_period_budget_id
            $arrInsert[]    = 0; // ar_so_activi_id
            $arrInsert[]    = $row["ar_bill_invoice_dtl_id"];

            $arrInsert[]    = $row["dc_wht_tax_id"];
            $arrInsert[]    = $mon->round54($data["fq_total"][$row["ar_bill_invoice_dtl_id"]],2);//f_total_cost
            $arrInsert[]    = $mon->round54($f_new_net_cost,2);//f_new_net_cost
            
            $arrInsert[]    = $mon->round54($f_req_amt,2);//f_req_amt
            $arrInsert[]    = $mon->round54($f_req_total_amt,2);//f_req_total_amt
            $arrInsert[]    = $mon->round54($data["fq_disc_com"][$row["ar_bill_invoice_dtl_id"]],2);//f_disc_com

            $arrInsert[]    = $mon->round54($data["fq_disc_cash"][$row["ar_bill_invoice_dtl_id"]],2);//f_disc_cash
            $arrInsert[]    = $mon->round54($data["fq_after_disc_com"][$row["ar_bill_invoice_dtl_id"]],2);//f_net_disc_comm_amt
            $arrInsert[]    = $mon->round54($f_net_cost,2);//f_net_cost
            
            $arrInsert[]    = $mon->round54($f_wht_amt,2); // f_wht_amt
            $arrInsert[]    = $mon->round54($f_left_cost,2); // f_left_cost
            $arrInsert[]    = 0; // f_balance_amt

            $arrInsert[]    = 0; // i_is_adjust
            $arrInsert[]    = 0; // i_is_receive
            $arrInsert[]    = NULL; // c_comment
            
            $arrInsert[]    = $data["dc_user_update_id"];
            $arrInsert[]    = $data["dc_user_update_cost_id"];
            $arrInsert[]    = $data["d_update"];

            $arrInsert[]    = $data["dc_user_update_id"];
            $arrInsert[]    = $data["dc_user_update_cost_id"];
            $arrInsert[]    = $data["d_update"];
        }

     

        $stmChkMaster = $db->QueryParam($sql_insert, $arrInsert);

        if ($stmChkMaster === false) {
            $checkVal += 1;
        } else {

            $smtUP = sammaryToHdr($db, $mon, $data, "ADD"); 
        }
    }

    if ($checkVal > 0) {
        $db->RollBackTran();
        $re = array("reval" => 1, "success" => "Error", "msg" => "Error");
    
    } else {
    
        
        $db->CommitTran();
        $re = array("reval" => 0, "success" => "Success", "msg" => "บันทึกเรียร้อย");
    }
 
    echo json_encode($re);
    exit;
} else if ($mode == 'DELETE') {
    $db->BeginTran();

    $smtDel = $db->QueryParam("DELETE FROM ar_bill_invoice_dtl WHERE ar_bill_invoice_dtl_id =?", array($_REQUEST['id']));
    //$smtUP = TRUE; //
    $smtUP = sammaryToHdr($db, $mon, $data, "DELETE");
    if (!$smtUP) {
        $db->RollBackTran();
        $re = array("reval" => 1, "success" => "Error", "msg" => "Error");
    } else {
        $db->CommitTran();
        $re = array("reval" => 0, "success" => "Success", "msg" => "บันทึกเรียร้อย");
    } echo json_encode($re);
    exit;
} else if ($mode == 'GENCODE'){
    $db->BeginTran();
    $ret_id = $data["id"];
    $code_dc = (string) "ADJ";
    $dc_area_id = $db->GetDataBySQL("select dc_area_id from ar_bill_invoice_hdr where ar_bill_invoice_hdr_id = ?", array($ret_id));    
    
    //code
    $data["update_id"] = $_SESSION["user_id"];
    $data["update_org_id"] = $_SESSION["dc_cost_id"];
    $data["t_update_dt"] = date("Y-m-d H:i:s");

    $c_yyyy_mm = date("Ym");

    $arrParam = array($code_dc, $c_yyyy_mm, $data['update_id'], $data['update_org_id'], $ret_id);
    $sql = "EXEC SP_GEN_CODE ?,?,?,?,?;";
    $stmt = $db->QueryParam($sql, $arrParam);
    $arr_gen_code = $db->Fetch($stmt);

    $c_code = $arr_gen_code["c_code_gen"];
    $ref_id = $arr_gen_code["reference_id"];

    $arrParam = array($code_dc, $c_yyyy_mm, $dc_area_id, $data['update_id'], $data['update_org_id'], $ret_id);
    $sql = "EXEC SP_GEN_CODE_AREA ?,?,?,?,?,?;";
    $stmt = $db->QueryParam($sql, $arrParam);
    $arr_gen_code = $db->Fetch($stmt);

    $c_code1 = $arr_gen_code["c_code_gen_area"];
    $ref_id1 = $arr_gen_code["reference_id"];

    if ($ret_id == $ref_id) {
        $sql2 = "UPDATE ar_bill_invoice_hdr
        SET c_ref_doc = ?
            , c_area_ref_doc = ?
            , update_id =?
            , update_org_id =?
            , t_update_dt =?
        WHERE ar_bill_invoice_hdr_id = ?";
        $arrParam2 = array($c_code
            , $c_code1
            , $_SESSION["user_id"]
            , $_SESSION["dc_cost_id"]
            , date("Y-m-d H:i:s")
            , $ret_id);

        $stmt2 = $db->QueryParam($sql2, $arrParam2);
        if (!$stmt2) {
            $db->RollBackTran();
            $re = array("reval" => 1, "success" => "Error", "msg" => "Error", "c_code" => "");
        } else {
            $db->CommitTran();
            $re = array("reval" => 0, "success" => "Success", "msg" => "บันทึกเรียร้อย", "c_code" => $c_code1);
        } echo json_encode($re);
        exit;
    }
}
?>
