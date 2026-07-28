<?php
include("../../../conf/config.php");
include("../../../lib/database/DatabaseServer.php");
include("../../../lib/database/apiUtil.php");
include("../../../lib/date/i_date.class.php");

$db = new DatabaseServer();
$date = new i_date();
$util = new apiUtil();

$mode = $_REQUEST["mode"] ?? null;
$table = "sp_delivery_items";
$keyName = "sp_tor_hdr_period_id";

$data = $util->mnUser($_REQUEST);
$data["i_delete"] = DELETE_FALSE;
$stmt2 = true;
$stmt3 = true;
$db->BeginTran();
//print_r($_REQUEST);
//exit();
function PO_WORKING_PROGRAM_CODE_GEN($bg_expense_id, $dc_cost_id, $i_budget_year, $dc_expense_budget_type_id)
{
	global $db;
	if (in_array($dc_expense_budget_type_id, array(15, 16, 18, 24, 36, 37))) {
		// "กองทุนของคณะแพทยศาสตร์วชิรพยาบาล"
		$dc_cost_id = $db->GetDataBySQL("SELECT TOP 1 dc_cost_id FROM NMU_DATACENTER..dc_cost WHERE dc_expense_budget_type_id = ?", array($dc_expense_budget_type_id));
	}

	/***** SP_PO_WORKING_PROGRAM_CODE_GEN ******/
	$arrValue = array();
	$arrValue[] = $bg_expense_id;
	$arrValue[] = $dc_cost_id;
	$arrValue[] = $i_budget_year;
	// $arrValue[] = $dc_expense_budget_type_id;
	$sql    = "
        SET NOCOUNT ON
        CREATE TABLE #TEMP_SP_PO_WORKING_PROGRAM_CODE_GEN (c_code varchar(50)); 
        INSERT INTO #TEMP_SP_PO_WORKING_PROGRAM_CODE_GEN EXEC NMU_EIS..SP_PO_WORKING_PROGRAM_CODE_GEN ?,?,?;
        SELECT c_code FROM #TEMP_SP_PO_WORKING_PROGRAM_CODE_GEN;
    ";
	$c_code = $db->GetDataBySQL($sql, $arrValue);
	unset($arrValue);
	return $c_code;
}
switch ($mode) {
    case "UPDATE":

// Parameters
$sp_tor_hdr_period_id = $_REQUEST['sp_tor_hdr_period_id']??null;
$dc_cost_id0 = $_REQUEST['dc_cost_id0']??null;
$dc_cost_id =  $_REQUEST['dc_cost_id']??null;
$i_budget_year =  $_REQUEST['i_budget_year']??null;
$i_budget_yearTxt = $_REQUEST['i_budget_yearTxt']??null;
$dc_expense_budget_type_id =$_REQUEST['dc_expense_budget_type_id']??null;
$i_product_type =  $_REQUEST['i_product_type']??null;
$line =  $_REQUEST['line']??null;
$cost_items =  $_REQUEST['dc_cost_item_id']??null;
//$cost_items = [
//    ["dc_cost_item_id" => 9, "po_expense_id22" => 248, "po_expense_id" => "070900090001", "i_qty" => 1, "f_cost_amt" => 89166.66],
//    ["dc_cost_item_id" => 11, "po_expense_id22" => 432, "po_expense_id" => "071000010001", "i_qty" => 1, "f_cost_amt" => 89166.66],
//    ["dc_cost_item_id" => 14, "po_expense_id22" => 248, "po_expense_id" => "070900090001", "i_qty" => 1, "f_cost_amt" => 89166.66]
//];
   $codeGen = PO_WORKING_PROGRAM_CODE_GEN($bg_expense_id, $dc_cost_id, $i_budget_year, $dc_expense_budget_type_id);
// SQL Update Query
foreach ($cost_items as $item) {
    $sql = "UPDATE your_table SET 
                i_budget_year = ?, 
                i_budget_yearTxt = ?, 
                dc_expense_budget_type_id = ?, 
                i_product_type = ?,  
                po_expense_id = ?, 
                i_qty = ?, 
                f_cost_amt = ?
            WHERE sp_tor_hdr_period_id = ? AND dc_cost_id = ? AND dc_cost_item_id = ?";
    
    $params = [
        $i_budget_year,
        $i_budget_yearTxt,
        $dc_expense_budget_type_id,
        $i_product_type, 
        $item['po_expense_id'],
        $item['i_qty'],
        $item['f_cost_amt'],
        $sp_tor_hdr_period_id,
        $dc_cost_id,
        $item['dc_cost_item_id']
    ];
    // 3 time
    echo "<br>";
    echo $sql;
    echo "<br>";
    print_r($params);
    /*
    $stmt = sqlsrv_query($conn, $sql, $params);
    if ($stmt === false) {
        die(print_r(sqlsrv_errors(), true));
    }*/
    
   
$sqll = "SET NOCOUNT ON
        INSERT INTO NMU_EIS..po_working_program_hdr (
            c_code,
            dc_cost_acc_id,
            dc_cost_id,
            i_budget_year,
            bg_expense_id,
            dc_expense_budget_type_id,
            c_comment,
            po_working_hdr_id,
            i_enable,
            i_delete,
            dc_user_update_id,
            dc_user_update_cost_id,
            d_update,
            c_code,
            dc_user_create_id,
            dc_user_create_cost_id,
            d_create
        ) VALUES (
            ?, /*c_code เลขที่ค่าใช้จ่ายโครงการ*/
            ? ,/*dc_cost_acc_id ส่วนงาน*/
            ?, /*dc_cost_id หน่วยงาน*/
            ?, /*i_budget_year ปีงบประมาณ*/
            ?, /*bg_expense_id รายการย่อย (โครงการ)*/
            ?, /*dc_expense_budget_type_id แหล่งเงิน*/
            ?, /*c_comment หมายเหตุ*/
            ?, /*po_working_hdr_id (มากกว่า 0 เบิกแล้วห้ามแก้ไข) null*/
            ?, /*i_enable*/
            ?, /*i_delete*/
            ?, /*dc_user_update_id*/
            ?, /*dc_user_update_cost_id*/
            ?, /*d_update*/
            ?, /*c_code*/
            ?, /*dc_user_create_id*/
            ?, /*dc_user_create_cost_id*/
            ?, /*d_create*/);
        SELECT @@IDENTITY as id";
$sqll2 = "SET NOCOUNT ON
                INSERT INTO NMU_EIS..po_working_program_dtl (
                    po_working_program_hdr_id,
                    bg_expense_catalog_id,
                    dc_cost_acc_id,
                    f_total,
                    c_comment,
                    i_enable,
                    dc_user_update_id,
                    dc_user_update_cost_id,
                    d_update,
                    dc_user_create_id,
                    dc_user_create_cost_id,
                    d_create
                ) VALUES (
                   ? *po_working_program_hdr_id*/,
                   ? /*bg_expense_catalog_id ค่าใช้จ่ายโครงการ*/,
                   ? /*dc_cost_acc_id ส่วนงาน*/,
                   ? /*f_total จำนวนเงิน*/,
                   ? /*c_comment รายละเอียด*/,
                   ?/*i_enable*/,
                   ?/*dc_user_update_id*/,
                   ?/*dc_user_update_cost_id*/,
                   ?/*d_update*/,
                   ?/*dc_user_create_id*/,
                   ?/*dc_user_create_cost_id*/,
                   ?/*d_create*/);
                SELECT @@IDENTITY as id; 
                "; 
}  //Loop
exit();

        $ir = $db->GetDataBySQL("select a.c_arrive_code from sp_check_period_hdr a where a.sp_tor_hdr_period_id=?", array($data["sp_tor_hdr_period_id"]));

        if (!$ir) {
            $re = array("reval" => 1, "success" => "Error", "msg" => "check statement : no contract number");
            echo json_encode($re);
            exit;
        }
        // ============== //
        $cc_hdr_period_id = $db->GetDataBySQL("select count(sp_tor_hdr_period_id) as sp_tor_hdr_period_id from dbo.sp_delivery_items a where a.sp_tor_hdr_period_id=?", array($data["sp_tor_hdr_period_id"]));
        if($cc_hdr_period_id>0){
            $sql = "DELETE dbo.sp_delivery_items WHERE sp_tor_hdr_period_id = ?";
            $arrParam = array($_REQUEST["sp_tor_hdr_period_id"]);
            $stmt = $db->QueryParam($sql, $arrParam);
        }
        
//        echo $cc_hdr_period_id; exit();
        $data["i_enabled"] = 1;
        $data["dc_cost_id"] = $_SESSION["dc_cost_id"];
        $data["dc_user_create_id"] = $_SESSION["user_id"];
        $data["dc_user_create_cost_id"] = $_SESSION["dc_cost_id"];
        $data["d_create"] = date("Y-m-d H:i:s");
        $data["dc_user_update_id"] = $_SESSION["user_id"];
        $data["dc_user_update_cost_id"] = $_SESSION["dc_cost_id"];
        $data["d_update"] = date("Y-m-d H:i:s");

    
    $fld_arr = array('dc_cost_id'	
                    ,'sp_tor_hdr_period_id'
                    ,'dc_product_type_id'	
                    ,'c_ir_code'
                    ,'i_qty'
                    ,'f_period_amt'
                    ,'i_enabled'
                    ,'dc_user_create_id'
                    ,'dc_user_create_cost_id','d_create','dc_user_update_id','dc_user_update_cost_id','d_update');
    
        
    
        foreach ($data["dc_cost_item_id"] as $k => $val) {

            $data["sp_tor_hdr_period_id"] = $_REQUEST["sp_tor_hdr_period_id"];
            $data["dc_product_type_id"] = $_REQUEST["i_product_type"];
            $data["c_ir_code"] = $ir;
            $data["dc_cost_id"] = $val ?? null;
//            $data["f_period_amt"] = $_REQUEST["f_cost_amt"][$k] ?? null;
            $data["f_period_amt"] = !empty($_REQUEST["f_cost_amt"][$k]) ? str_replace(',', '', $_REQUEST["f_cost_amt"][$k]) : 0;  
            $data["i_qty"] = $_REQUEST["i_qty"][$k] ?? null;
            !empty($data["f_total_amt"]) ? str_replace(',', '', $data["f_total_amt"]) : 0;

            $addField = '';
            $addValue = '';
            $arrValue = [];

// Loop through $data array
            $i =0;
            foreach ($fld_arr as $fld) {
                
                $value = $data[$fld];
                $arrValue[] = ($value != "") ? $value : null;
                $addField .= ", {$fld}";
                $addValue .= ", ?"; 
//                echo $fld_arr[$i]."=> {$fld}={$value} <br/>";  
                $i++;
            }
// Remove the first comma from both $addField and $addValue
            $addField = substr($addField, 2); // Remove leading ', '
            $addValue = substr($addValue, 2); // Remove leading ', '
// Create the final SQL query string
            $sql = "SET NOCOUNT ON;
                    INSERT INTO dbo.sp_delivery_items ({$addField}) VALUES ({$addValue});
                ";
//            echo $sql;
//            print_r($arrValue);
//                    exit();
            $stmt = $db->QueryParam($sql, $arrValue);
            


//$stmt1 = $db->QueryParam($sqll, $arrValue);
/****************************** SQL INSERT po_working_program_dtl ******************************/

//            $stmt2 = $db->QueryParam($sqll2, $arrValue);
        } //END LOOP dc_cost_item_id

        break;
    case "DELETE":
        $sql = "DELETE dbo.sp_delivery_items
                WHERE sp_tor_hdr_period_id = ? and dc_cost_id = ?";
        $arrParam = array($_REQUEST["sp_tor_hdr_period_id"], $_REQUEST["dc_cost_id"]);
        $stmt = $db->QueryParam($sql, $arrParam);
    break;
}

if ($stmt) {
    $db->CommitTran();
    $re = array("reval" => 0, "success" => "Success", "msg" => "บันทีกเรียบร้อยแล้ว");
} else {
    $db->RollBackTran();
    $re = array("reval" => 1, "success" => "Error", "msg" => "check statement : {$sql}");
}

echo json_encode($re);
exit;
