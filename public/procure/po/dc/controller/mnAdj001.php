<?php
include_once './../../../conf/config.php';
include_once './../../../access/checkSession.php';
include_once './../../../lib/database/DatabaseServer.php';
include_once './../../../lib/database/apiUtil.php';
include_once './../../../lib/date/i_date.class.php';
include_once './../../../lib/mon/mon.class.php';
include_once './../../conf/configAR.php';
include_once './../../api/class/ar.status.class.php';
$db = new DatabaseServer();
$date = new i_date();
$util = new apiUtil();
$mon = new mon(); // convert floatval

$table = "ar_bill_invoice_hdr";
$keyName = "ar_bill_invoice_hdr_id";

//add info & clean data comma
$data = $util->mnUser($util->cleanData($_POST));
$mode = $data["mode"] ?? null;

$c_code_mu = "ADJ";
$msg = "บันทึกเรียร้อย";

function checkListData($id) {
    global $db, $date, $_POST;
    $ret_id = $id;
    $stmChkDelDtl = true;
    $chek = (isset($_POST['removeDtl'])) ? $_POST['removeDtl'] : '';

    if ($chek == 'CHGHEADER') {
        $sqlDelDtl = "Declare @hdrID as bigint;
                                 set @hdrID = ?;
                                 delete from dbo.ar_bill_invocd_dtl where ar_bill_invoice_hdr_id =@hdrID;
                     ";

        $arrParamDelDtl = array($ret_id);
        $stmChkDelDtl = $db->QueryParam($sqlDelDtl, $arrParamDelDtl);
        $msgWanning = "Yes Dtl removeDtl = {$chek}";
    } else {
        $msgWanning = "NO Dtl removeDtl = ";
    }

    //get to list

    $row = $db->GetDataBySQL("select ar_bill_invoice_hdr_id,i_parent, vat_rate,tax_rate from dbo.ar_bill_invoice_hdr where ar_bill_invoice_hdr_id=?", array($ret_id));

    return array("stm" => $stmChkDelDtl,
        "data" => array(
            "id" => $row['ar_bill_invoice_hdr_id'],
            "i_parent" => $row['i_parent'],
            "msg" => "บันทึกรายการเรียบร้อย"
        ),
        "log" => " id = " . $id
    );
}

$db->BeginTran();
$stmChkMaster = true; // as so
$stmChkDelDtl = true; // as dtl

/***MODE ACTION */
switch ($mode) {

    case "GENCODE2" :

        $ret_id = $_POST["id"];
        $f1 = $db->GetDataBySQL("select
			(select top 1 dc_cost_id from dbo.ar_so_hdr where ar_so_hdr_id=ar_bill_invoice_hdr.ar_so_hdr_id) as dc_cost_id
			,right(c_yyyy_mm,4) as yymm
			,*
			from dbo.ar_bill_invoice_hdr where ar_bill_invoice_hdr_id = ?", array($_POST['id']));

        $f2 = $db->GetDataBySQL("select top 1
			(select top 1 f_tax_rate from dc_tax where dc_tax_id=ar_bill_invoice_dtl.dc_wht_tax_id) as f_tax_rate
				,(select top 1 dc_product_type_id from dbo.ar_bill_invoice_hdr where ar_bill_invoice_hdr_id=ar_bill_invoice_dtl.ar_bill_invoice_hdr_id) as dc_product_type_id
				, sum(isnull(f_total_cost,0)) as f_total_cost
				, sum(isnull(f_disc_com,0)) as f_disc_com
				, sum(isnull(f_disc_cash,0)) as f_disc_cash
				, sum(isnull(f_net_cost,0)) as f_net_cost
				, sum(isnull(f_net_disc_comm_amt,0)) as f_net_disc_comm_amt
				, sum(isnull(f_new_net_cost,0)) as f_new_net_cost
				, sum(isnull(f_wht_amt,0)) as f_wht_amt
				, sum(isnull(f_req_amt,0)) as f_req_amt
				, dc_wht_tax_id
			from ar_bill_invoice_dtl where ar_bill_invoice_hdr_id = ?
			group by ar_bill_invoice_hdr_id,dc_wht_tax_id
			", array($data['id']));
        // tax
        $data["dc_tax_id_tax"] = $f2["dc_wht_tax_id"];
        $data["tax_rate"] = $f2["f_tax_rate"];
        $data["f_tax_amt"] = $data["f_wht_amt"];


        $sql2 = "UPDATE {$table}
            SET c_area_print	= ?
			, f_tax_amt		= ?
			, dc_tax_id_tax = ?
			, tax_rate		= ?
			, f_vat_amt		= ?
			, f_total_cost_amt		= ?
			, f_disc_com_amt		= ?
			, f_disc_cash_amt 		= ?
			, f_net_cost_amt 		= ?
			, f_new_net_cost 		= ?
			, f_req_amt 			= ?
			, f_net_disc_comm_amt	= ?
            , dc_user_update_id =?
            , dc_user_update_cost_id =?
            , d_update =?
            WHERE {$keyName} = ?";
        $arrParam2 = array('0'
            , $mon->parseFloat($data['f_tax_amt'])
            , $data['dc_tax_id_tax']
            , $mon->parseFloat($data['tax_rate'])
            , $mon->parseFloat($data['f_vat_amt']) /* , $data['dc_tax_id_vat'], $data['vat_rate'] */
            , $mon->parseFloat($data['f_total_cost_amt'])
            , $f2['f_disc_com']
            , $f2['f_disc_cash']
            , $_mon->parseFloat($data['f_net_cost_amt'])
            , $f2['f_new_net_cost']
            , $f2['f_req_amt']
            , $f2['f_net_disc_comm_amt']
            , $_SESSION["user_id"]
            , $_SESSION["dc_cost_id"]
            , date("Y-m-d H:i:s")
            , $ret_id);

        $stmt2 = $db->QueryParam($sql2, $arrParam2);


        $msg = '';
        $ret = array("stm" => $stmt2
            , "log" => ""
            , "data" => array("c_code" => 'บันทึกรายการเรียบร้อย', "msg" => $msg)
        );

        $returnData = @$ret['data'];
        $stmChkDelDtl = @$ret['stm'];
        $log = @$ret['log'];
        break;
//AR CODE
    case "GENCODE" :
        $f1 = $db->GetDataBySQL("select
			(select top 1 dc_cost_id from dbo.ar_so_hdr where ar_so_hdr_id=ar_bill_invoice_hdr.ar_so_hdr_id) as dc_cost_id
			,right(c_yyyy_mm,4) as yymm
			,*
			from dbo.ar_bill_invoice_hdr where ar_bill_invoice_hdr_id = ?", array($_POST['id']));

        $f2 = $db->GetDataBySQL("select top 1
			(select top 1 f_tax_rate from dc_tax where dc_tax_id=ar_bill_invoice_dtl.dc_wht_tax_id) as f_tax_rate
				,(select top 1 dc_product_type_id from dbo.ar_bill_invoice_hdr where ar_bill_invoice_hdr_id=ar_bill_invoice_dtl.ar_bill_invoice_hdr_id) as dc_product_type_id
				, sum(isnull(f_total_cost,0)) as f_total_cost
				, sum(isnull(f_disc_com,0)) as f_disc_com
				, sum(isnull(f_disc_cash,0)) as f_disc_cash
				, sum(isnull(f_net_cost,0)) as f_net_cost
				, sum(isnull(f_net_disc_comm_amt,0)) as f_net_disc_comm_amt
				, sum(isnull(f_new_net_cost,0)) as f_new_net_cost
				, sum(isnull(f_wht_amt,0)) as f_wht_amt
				, sum(isnull(f_req_amt,0)) as f_req_amt
				, dc_wht_tax_id
			from ar_bill_invoice_dtl where ar_bill_invoice_hdr_id = ?
			group by ar_bill_invoice_hdr_id,dc_wht_tax_id
			", array($data['id']));
        // tax
        $data["dc_tax_id_tax"] = $f2["dc_wht_tax_id"];
        $data["tax_rate"] = $f2["f_tax_rate"];

        $data["f_tax_amt"] = floatval(str_replace(',', '', $data["f_wht_amt"]));
        $data["vat_rate"] = floatval(str_replace(',', '', $data["f_vat_rate"]));
        $data["f_total_cost_amt"] = floatval(str_replace(',', '', $data["f_total_cost_amt"]));
        $data["f_disc_cash_amt"] = floatval(str_replace(',', '', $data["f_disc_cash_amt"]));
        $data["f_net_cost_amt"] = floatval(str_replace(',', '', $data["f_net_cost_amt"]));
        $data["f_vat_amt"] = floatval(str_replace(',', '', $data["f_vat_amt"]));
        $data["f_net_cost_add_vat_amt"] = floatval(str_replace(',', '', $data["f_net_cost_add_vat_amt"]));
        $data["f_tax_amt"] = floatval(str_replace(',', '', $data["f_wht_amt"]));
        $data["f_vat_dtl"] = (($data["f_vat_dtl"] ?? null) ? floatval(str_replace(',', '', $data["f_vat_dtl"])) : null);

        $data["c_class"] = $db->GetDataBySQL("select (select top 1 c_ref_doc from dc_product_class where dc_product_class_id=dc_product_type.dc_product_class_id) as c_ref_doc from dc_product_type where dc_product_type_id = ?", array($f2["dc_product_type_id"]));
        $data["yymm"] = $f1["yymm"];
        $data["dc_cost_id"] = $f1["dc_cost_id"];

        $ret_id = $data["id"];
        $code_dc = (string) "AR";
        //code
        $data["update_id"] = $_SESSION["user_id"];
        $data["update_org_id"] = $_SESSION["dc_cost_id"];
        $data["t_update_dt"] = date("Y-m-d H:i:s");

        $arrParam = array($code_dc, $f1['c_yyyy_mm'], $data['update_id'], $data['update_org_id'], $ret_id);
        $sql = "EXEC SP_GEN_CODE ?,?,?,?,?;";
        $stmt = $db->QueryParam($sql, $arrParam);
        $arr_gen_code = $db->Fetch($stmt);

        $c_code = $arr_gen_code["c_code_gen"];
        $ref_id = $arr_gen_code["reference_id"];

        $arrParam = array($code_dc, $f1['c_yyyy_mm'], $f1['dc_area_id'], $data['update_id'], $data['update_org_id'], $ret_id);
        $sql = "EXEC SP_GEN_CODE_AREA ?,?,?,?,?,?;";
        $stmt = $db->QueryParam($sql, $arrParam);
        $arr_gen_code = $db->Fetch($stmt);

        $c_code1 = $arr_gen_code["c_code_gen_area"];
        $ref_id1 = $arr_gen_code["reference_id"];

        if ($ret_id == $ref_id) {
            $sql2 = "UPDATE {$table}
            SET c_code		= ?
			, c_area_code	= ?
			, c_area_print	= ?
			, f_tax_amt		= ?
			 , dc_tax_id_tax = ?
			 , tax_rate		= ?
                        , vat_rate =?
			, f_vat_amt		= ?
			, f_total_cost_amt		= ?
			, f_disc_com_amt		= ?
			, f_disc_cash_amt 		= ?
			, f_net_cost_amt 		= ?
			, f_new_net_cost 		= ?
			, f_req_amt 			= ?
			, f_net_disc_comm_amt	= ?
            , update_id =?
            , update_org_id =?
            , t_update_dt =?
            WHERE {$keyName} = ?";
            $arrParam2 = array($c_code
                , $c_code1
                , '0'
                , $mon->parseFloat($data['f_tax_amt'])
                , $data['dc_tax_id_tax']
                , $mon->parseFloat($data['tax_rate'])
                , $mon->parseFloat($data['vat_rate'])
                , $data['f_vat_amt'] /* , $data['dc_tax_id_vat'], $data['vat_rate'] */
                , $mon->parseFloat($data['f_total_cost_amt'])
                , $f2['f_disc_com']
                , $f2['f_disc_cash']
                , $mon->parseFloat($data['f_net_cost_amt'])
                , $f2['f_new_net_cost']
                , $f2['f_req_amt']
                , $f2['f_net_disc_comm_amt']
                , $_SESSION["user_id"]
                , $_SESSION["dc_cost_id"]
                , date("Y-m-d H:i:s")
                , $ret_id);
 

            $stmt2 = $db->QueryParam($sql2, $arrParam2);
        }
        $msg = '';
        $ret = array("stm" => $stmt2
            , "log" => ""
            , "data" => array("c_code" => $c_code1, "msg" => $msg)
        );

        $returnData = @$ret['data'];
        $stmChkDelDtl = @$ret['stm'];
        $log = @$ret['log'];
        break;
    case "ADD" :
        $sql = "SET NOCOUNT ON;

                DECLARE @d_adjust_date as varchar(10);
                DECLARE @dc_comment_dec_id as numeric;
                DECLARE @user_id as numeric;
                DECLARE @user_cost_id as numeric;
                DECLARE @c_comment2 as varchar(250);
                DECLARE @d_doc_date as varchar(10);
                DECLARE @i_adj_rest as tinyint;
                DECLARE @parent_id as bigint;
                
                SET @d_adjust_date = ?;
                SET @dc_comment_dec_id = ?;
                SET @user_id = ?;
                SET @user_cost_id = ?;
                SET @c_comment2 = ?;
                SET @d_doc_date = ?;
                SET @i_adj_rest = ?;
                SET @parent_id = ?;
                
                INSERT INTO ar_bill_invoice_hdr
                SELECT c_code, c_ref_doc, c_ref_code, dc_tax_id_vat, vat_rate
                    , dc_tax_id_tax, tax_rate, dc_cnt_id, ar_so_hdr_id, c_adj_code
                    , i_type_status, ar_condi_pay_hdr_id, pj_send_period_hdr_id, i_is_activity, pj_hdr_id
                    , c_yyyy_mm, i_is_billing, i_is_invoice, i_is_disc_cash, i_is_show_txt_dtl
                    , 0 as i_is_show_disc_cash, d_billing_date, CONVERT(datetime, @d_adjust_date, 102) as d_request_adjust_date, d_adj_date, d_end_credit
                    , d_end_pay, 0 as f_total_cost_amt, 0 as f_disc_com_amt, 0 as f_disc_cash_amt, 0 as f_vat_amt
                    , 0 as f_new_net_cost, 0 as f_req_amt, 0 as f_tax_amt, 0 as f_net_cost_amt, 0 as f_net_disc_comm_amt
                    , 0 as f_net_comm_add_vat_amt, 0 as f_net_cost_add_vat_amt, 0 as f_balance_amt, ar_bill_invoice_hdr_id as i_parent, i_is_tv
                    , i_is_project, i_class_type, i_enabled, i_is_complete, i_is_status
                    , 0 as i_is_print_dec, 0 as i_is_print_bill_inv, 0 as i_is_print_adj, 0 as i_is_print_req_adj
                    , (SELECT c_name FROM dc_comment_dec WHERE dc_comment_dec_id = @dc_comment_dec_id) as c_comment
                    , c_remark, @user_id as create_id, @user_cost_id as create_org_id, getdate() as t_create_dt
                    , @user_id as update_id, @user_cost_id as update_org_id, getdate() as t_update_dt, @dc_comment_dec_id as dc_comment_dec_id, @c_comment2 as c_comment2
                    , i_type_region, dc_area_id, c_area_code, c_area_print, is_billing_cont
                    , c_billing_name, c_billing_addr, due_bill, condition_pay, c_area_ref_doc
                    , c_area_adj_code, CONVERT(datetime, @d_doc_date, 102) as d_doc_date, dc_product_type_id, i_no_order, c_inv_old
                    , dc_ar_adjust_id, old_dc_ar_adjust_id, NULL as c_invoice_item, @i_adj_rest as i_adj_rest
                    , i_reprint_dt, d_send_bill, i_group_bill, disc_code
                FROM ar_bill_invoice_hdr WHERE ar_bill_invoice_hdr_id = @parent_id;
                
                SELECT @@IDENTITY as id;";
        $arrParam = array();
        $arrParam[] = $date->bc_to_ad($data["d_request_adjust_date"]);
        $arrParam[] = $data["dc_comment_dec_id"];
        $arrParam[] = $data["dc_user_update_id"];
        $arrParam[] = $data["dc_user_update_cost_id"];
        $arrParam[] = $data["c_comment2"];
        $arrParam[] = date("Y-m-d");
        $arrParam[] = $data["i_adj_rest"];
        $arrParam[] = $data["i_parent"];
      
        $stmChkMaster = $db->QueryParam($sql, $arrParam);
        if ($stmChkMaster) {
            
            $ff = $db->Fetch($stmChkMaster);

            $ret_id = $ff["id"];
            $ret = @checkListData($ret_id);
            $stmChkDelDtl = @$ret['stm'];
            $returnData = @$ret['data'];
            $log = @$ret['data']['log'];
        }
        break;
//ออกเลข ar แล้วและออก BL comment วันที่.
    case "EDITDTL" :
 ///////////
 $fld = array("f_total_cost_amt"
            , "f_vat_amt"
            , "f_tax_amt"
            , "f_net_cost_amt"
            //, "f_net_disc_comm_amt"
            //, "f_net_comm_add_vat_amt"
            , "f_net_cost_add_vat_amt"
            , "update_id"
            , "update_org_id"
            , "t_update_dt");
        $f2 = $db->GetDataBySQL("select top 1
			(select top 1 f_tax_rate from dc_tax where dc_tax_id=ar_bill_invoice_dtl.dc_wht_tax_id) as f_tax_rate
				,(select top 1 dc_product_type_id from dbo.ar_bill_invoice_hdr where ar_bill_invoice_hdr_id=ar_bill_invoice_dtl.ar_bill_invoice_hdr_id) as dc_product_type_id
				, sum(isnull(f_total_cost,0)) as f_total_cost
				, sum(isnull(f_disc_com,0)) as f_disc_com
				, sum(isnull(f_disc_cash,0)) as f_disc_cash
				, sum(isnull(f_net_cost,0)) as f_net_cost
				, sum(isnull(f_net_disc_comm_amt,0)) as f_net_disc_comm_amt
				, sum(isnull(f_new_net_cost,0)) as f_new_net_cost
				, sum(isnull(f_wht_amt,0)) as f_wht_amt
				, sum(isnull(f_req_amt,0)) as f_req_amt
				, dc_wht_tax_id
			from ar_bill_invoice_dtl where ar_bill_invoice_hdr_id = ?
			group by ar_bill_invoice_hdr_id,dc_wht_tax_id
			", array($data['id']));
        // tax
        $data["dc_tax_id_tax"] = $f2["dc_wht_tax_id"];
        $data["tax_rate"] = $f2["f_tax_rate"];
        $data["f_tax_amt"] = floatval(str_replace(',', '', $data["f_wht_amt"]));
        $data["vat_rate"] = floatval(str_replace(',', '', $data["f_vat_rate"]));
        $data["f_total_cost_amt"] = floatval(str_replace(',', '', $data["f_total_cost_amt"]));
        $data["f_disc_cash_amt"] = floatval(str_replace(',', '', $data["f_disc_cash_amt"]));
        $data["f_net_cost_amt"] = floatval(str_replace(',', '', $data["f_net_cost_amt"]));
        $data["f_vat_amt"] = floatval(str_replace(',', '', $data["f_vat_amt"]));
        $data["f_net_cost_add_vat_amt"] = floatval(str_replace(',', '', $data["f_net_cost_add_vat_amt"]));
        $data["f_tax_amt"] = floatval(str_replace(',', '', $data["f_wht_amt"]));
        $data["f_vat_dtl"] = floatval(str_replace(',', '', $data["f_vat_dtl"]));
        //  
        $data["update_id"] = $_SESSION["user_id"];
        $data["update_org_id"] = $_SESSION["dc_cost_id"];
        $data["t_update_dt"] = date("Y-m-d H:i:s");
        ///////////////

        $arrParam = array();
        $upField = "";
        foreach ($fld as $value) {
                $upField .= ", {$value} = ?";
            $arrParam[] = $data[$value];
        }
        $sql = "UPDATE {$table} SET " . substr($upField, 1) . " WHERE {$keyName} = ?";
        $arrParam[] = $data["id"];

//        print($sql);
//        print_r($arrParam);
//        exit();
        $stmChkMaster = $db->QueryParam($sql, $arrParam);
//chgHeader
        $ret = checkListData($data['id']);
        $returnData = @$ret['data'];
        $stmChkDelDtl = @$ret['stm'];
        $log = @$ret['log'];
        break;
    case "EDIT" :

        $f1 = $db->GetDataBySQL("select i_parent,vat_rate from dbo.ar_bill_invoice_hdr where ar_bill_invoice_hdr_id = ?", array($_POST['ar_bill_invoice_hdr_id']));
        // $w = "{$data['f_vat_rate']} != {$f1['vat_rate']} === {$data['dc_product_type_id']} != {$f1['dc_product_type_id']}";
        $f1['vat_rate'] = intval($f1['vat_rate']);
        $f1['i_parent'] = intval($f1['i_parent']);
        $data['i_parent'] = intval($data['i_parent']);
        $data['vat_rate'] = intval($data['vat_rate']);

        if (( $data['i_parent'] != $f1['i_parent'] ) || ($data['vat_rate'] != $f1['vat_rate'] )) {
            $stmDelDtl = $db->QueryParam(
                    ""
                    . "DELETE FROM ar_bill_invoice_dtl where ar_bill_invoice_hdr_id=?;"
                    , array($data["ar_bill_invoice_hdr_id"]));
            $data["vat_rate"] = 0;

//            print(" CHANGE " . $w);
//            print_r($data);
//            exit();
        }

        $data["id"] = $data["ar_bill_invoice_hdr_id"];
        $arrParam = array();
        $upField = "";
        foreach ($fld as $value) {
            if (!empty($data[$value])) {
                $upField .= ", {$value} = ?";
                $arrParam[] = $data[$value];
            } else if ($value == 'i_is_show_disc_cash' 
            || $value == 'vat_rate' || $value == 'f_vat_amt' || $value == 'i_is_show_txt_dtl' || $value == 'pj_hdr_id' || $value == 'i_parent'
            || $value == 'i_is_invoice'
            ) {
                $upField .= ", {$value} = ?";
                $arrParam[] = $data[$value];
            }
        }
        $sql = "UPDATE {$table} SET " . substr($upField, 1) . " WHERE {$keyName} = ?";
        $arrParam[] = $data["id"];
        $stmChkMaster = $db->QueryParam($sql, $arrParam);
//chgHeader
        $ret = checkListData($data['id']);
        $returnData = @$ret['data'];
        $stmChkDelDtl = @$ret['stm'];
        $log = @$ret['log'];
        break;
    // delete & remove
    case "DELETE" :
    
        $stmChkDelDtl = true;
        $stmChkMaster = true;
        $valid = 0;
        if ($_POST["statusBu"] == 'del') {

            // ยังไม่ออกเลย ar && bl
            $sql = "Declare @idx as bigint;
                        set @idx = ?;
                        delete from ar_bill_invoice_dtl where ar_bill_invoice_hdr_id 		=@idx;
						delete from dbo.ar_bill_invoice_hdr where ar_bill_invoice_hdr_id	=@idx;
						";
            $arrParam = array($data["id"]);
            $msg = "ท่านได้ลบเรียบร้อยแล้ว";
            $returnData = array("invalid" => 0);

            $stmChkMaster = $db->QueryParam($sql, $arrParam);
        } elseif ($_POST["statusBu"] == 'cancel') {
            // ออกเลข ar ยังไม่ออกเลย bl
            $onair = 0;
            $rec = 0;
            //
            $adj = 0;
            $dec = 0;
            //Overrid
            $onair = $db->GetDataBySQL("select top 1 count(*) from dbo.vw_ar_check_bill_onair where ar_bill_invoice_hdr_id = ?", array($_POST['id']));
            $rec = $db->GetDataBySQL("select top 1 count(*) from dbo.vw_receive_all_bill where ar_bill_invoice_hdr_id = ?", array($_POST['id']));
            $adj = $db->GetDataBySQL("select top 1 count(*) from dbo.ar_bill_invoice_hdr where isnull(i_enabled,2)=1 and i_parent = ?", array($_POST['id']));
            $dec = $db->GetDataBySQL("select top 1 count(*) from dbo.fi_dec_receive_hdr where isnull(i_enabled,2)=1 and ar_bill_reduced_debt_id = ?", array($_POST['id']));

            //onair

            if ($adj == 1) { //ถ้าเป็น BL ที่มีรายการปรับปรุงหนี้อยู่ไม่สามารถยกเลิกรายการได้ 17-09-2010
                $valid += 1;
                $msg = "ไม่สามารถยกเลิก BL ได้ปรับปรุงหนี้อยู่ไม่สามารถยกเลิกรายการได้";
            } else if ($dec == 1) {// ถ้าเป็น BL ที่มีรายการผูกกับรายการลดหนี้แล้วไม่ให้ยกเลิกรายการได้ 17-09-2010
                $valid += 1;
                $msg = "ไม่สามารถยกเลิก BL ได้มีรายการผูกกับรายการลดหนี้แล้วไม่ให้ยกเลิกรายการได้";
            } else if ($onair == 1) {//ถ้าใบวางบิลถูกบันทึกยืนยันรายได้แล้วไม่ให้ยกเลิกรายการได้ (แต่ให้ใช้งานรายการได้)
                $valid += 1;
                $msg = "ไม่สามารถยกเลิก BL ได้ถูกบันทึกยืนยันรายได้แล้วไม่ให้ยกเลิกรายการได้";
            } else if ($rec == 1) { //ถ้าใบวางบิลถูกรับเงินแล้วไม่ให้ยกเลิกรายการได้ (แต่ให้ใช้งานรายการได้)
                $valid += 1;
                $msg = "ไม่สามารถยกเลิก BL ได้ถูกรับเงินแล้วไม่ให้ยกเลิกรายการได้";
            }
            if ($valid) { //
                $returnData = array("invalid" => 1);
            } else {

                $sql = "UPDATE ar_bill_invoice_hdr
                    SET i_enabled=?
                    ,update_id =?
                    ,update_org_id =?
                    ,t_update_dt =?
                    WHERE ar_bill_invoice_hdr_id = ?;
                    Delete from ar_process_month_report where c_ref_doc like 'BL%' and ar_bill_invoice_hdr_id =?;
                    ";

                $arrParam = array(STATUS_DISABLE
                    , $_SESSION["user_id"]
                    , $_SESSION["dc_cost_id"]
                    , date("Y-m-d H:i:s")
                    , $data["id"]
                    , $data["id"]);
                $msg = "ท่านได้ยกเลิก BL เรียบร้อยแล้ว";
                $returnData = array("invalid" => 0);
                $stmChkMaster = $db->QueryParam($sql, $arrParam);
            } // End Check
        } elseif ($_POST["statusBu"] == 'enabled') {
            // ออกเลข ar ยังไม่ออกเลย bl
            $sql = "UPDATE ar_bill_invoice_hdr
                                        SET i_enabled=?
                                        ,dc_user_update_id =?
                                        ,dc_user_update_cost_id =?
                                        ,d_update =?
                                        WHERE ar_bill_invoice_hdr_id = ?;
                        Delete from ar_process_month_report where c_ref_doc like 'BL%' and ar_bill_invoice_hdr_id =?;
                        ";

            $arrParam = array(STATUS_ENABLE
                , $_SESSION["user_id"]
                , $_SESSION["dc_cost_id"]
                , date("Y-m-d H:i:s")
                , $data["id"]
                , $data["id"]);

            $msg = "ท่านได้นำ BL กลับมาใช้งาน เรียบร้อยแล้ว";
            $returnData = array("invalid" => 0);
            $stmChkMaster = $db->QueryParam($sql, $arrParam);
        }

        break;
}

if ($stmChkDelDtl && $stmChkMaster) {
    $db->CommitTran();
    $re = array("reval" => 0, "success" => "Success", "msg" => $msg, "data" => @$returnData, "log" => @$log);
} else {
    $db->RollBackTran();
    $re = array("reval" => 1, "success" => "Error", "msg" => "Error");
}
echo json_encode($re);
exit;
?>
