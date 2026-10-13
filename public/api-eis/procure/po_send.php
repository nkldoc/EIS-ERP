 <?php
header("Access-Control-Allow-Origin: *"); 
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Content-Type: application/json; charset=UTF-8");  
require __DIR__.'/conf/config.php'; 
include("lib/database/DatabaseServer.php");
include("lib/database/apiUtil.php");
include("lib/date/i_date.class.php");
include("lib/log_access.php");
require __DIR__ . '/classes/Log.php';

$db = new DatabaseServer();
$date = new i_date();
$util = new apiUtil();

$root = "data";
$data = array();
$con = null;
/* @TODO 
 */
$getCookie = $_REQUEST['sessId']??null;
$setCookie = 'session_id='.$getCookie;
$contractId = $_REQUEST['sp_contract_hdr_id']??null; 

if (!$getCookie) {
    echo json_encode(array("retval" => "unsuccess", "retid" => null, "authen" => false));
}
$sqlMain = "select ROW_NUMBER() OVER (ORDER BY a.tor_id) AS numrow 
                        , a.tor_id as pr_id 
, a.dc_expense_budget_type_id as budget_id	
, a.f_type_amt  as f_budget_amt	
, a.dc_expense_budget_type2_id as budget2_id	
, a.f_type2_amt  as f_budget_amt2
, a.dc_expense_budget_type3_id as budget3_id
, a.f_type3_amt  as f_budget_amt3
                        , a.po_expense_id as expense_id 
                        , a.c_code 
                        , a.d_doc_date
                        , a.c_name
                        , b.f_total_amt  
                        , a.i_type_contract as contract_type_id
                        , a.i_product_type
                        , b.sp_tor_contract_id as contract_id  
                        , b.c_code as contract_no
                        , b.f_type_amt	
                        , b.i_pr_type1	
                        , b.bg_reserve_money1_id	
                        , b.dc_expense_budget_type2_id	
                        , b.f_type2_amt	i_pr_type2	
                        , b.bg_reserve_money2_id
                        , convert(varchar, b.d_doc_date, 120) as d_doc_date
                        , convert(varchar, b.d_due_date, 120) as d_due_date
                        ,(select inv_name from NMU.dbo.dc_creditor where dc_creditor_id = b.dc_creditor_id) as partner
                    from dbo.sp_tor a inner
                    join dbo.sp_tor_contract b on b.sp_tor_id = a.tor_id
                    where a.i_type_contract =? and b.sp_tor_contract_id = ?";
$arrParam[] = 3;
$arrParam[] = $contractId;
 
$stmt = $db->QueryParam($sqlMain, $arrParam);
$i = 0;
 
$contract_type_arr = array(1 => "ใบสั่งซื้อ (พัสดุ)");
 
while ($row = $db->Fetch($stmt)) {
    $temp = array(
        "pr_id" => intVal($row["pr_id"]),
        "contract_id" => intVal($row["contract_id"]),
        "purchase_type_erp_id" => strVal($row["i_product_type"]),
        "contract_type_erp_id" => strVal($row["contract_type_id"]),
        "contract_code" => $row["contract_no"], 
        "bg_exp_id" => intVal($row["expense_id"]),
        "bg_budget_type_id" => intVal($row["budget_id"]),
        "bg_budget_type2_id" => intVal($row["budget2_id"]),
        "bg_budget_type3_id" => intVal($row["budget3_id"]),        
        "f_budget_amt" => $row["f_budget_amt"],
        "f_budget_amt2" => $row["f_budget_amt2"],
        "f_budget_amt3" => $row["f_budget_amt3"],
        "f_total_amt" => $row["f_total_amt"],
        "partner" => $row["partner"],
        "contract_type_id" => strVal($row["contract_type_id"]), //ประเภทสัญญา(get ข้อมูลจาก api) or Null
        "purchase_method_id" => strVal($row["i_product_type"]), //วิธีจัดซื้อ/จัดจ้าง(get ข้อมูลจาก api) or Null
        "date_end" => $row["d_doc_date"] . " 00:00:00.000",
        "ordering_date" => $row["d_due_date"],
    );
    $count = $row["numrow"];
    ${$root}[] = $temp;
    


}



$db->NextResult($stmt);
$rowCounts = $db->Fetch($stmt);

$arr = array("datatype" => "contract", "data" => ${$root}); 
$cookie = $setCookie;
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, URL_SERVER_ERP.'/api/chula/createContract'); //https://erpdev.vajira.ac.th/api/chula/createContract
curl_setopt($ch, CURLOPT_HTTPHEADER, array('Content-Type: application/json', 'Cookie: ' . $cookie));
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
curl_setopt($ch, CURLOPT_POST, 1);
// Edit: prior variable $postFields should be $postfields;
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($arr));
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, 0); // On dev server only!
$result = curl_exec($ch);
$arrJsonRe = json_decode($result); 

$msg = array();
if($arrJsonRe->result->retval){
//    if($arrJsonRe->result->Dupicate){
//       $msg['txt_error'] = $arrJsonRe->result->Dupicate;
//       $msg["txt_msg"] ="มีการส่งสัญญาซ้ำ exist contract no";
//       postMsg($msg["txt_msg"]); 
//    }else{
//
//        $id_return = ($arrJsonRe->result->retid[0])?  $arrJsonRe->result->retid[0] :"cookie expire"  ;
//        lineNotif("logtime api->erp->contract->retid::" . $id_return. "=>" . $arr["data"][0]["contract_id"]); 
//        jsonSendLog($arr);  
//       $msg['txt_error'] = null;
        $msg["txt_msg"] = "ส่งสัญญาให้ระบบ ERP เรียบร้อยแล้ว";
        postMsg("ส่งสัญญาให้ระบบ ERP เรียบร้อยแล้ว"); 
//        
//    } 
} 

 

if ($result) {
    //echo $result;
    
    echo json_encode(array("retval" => "success", "authen" => true ,"datas" => $arr, "results" => $arrJsonRe));
} else {
    echo json_encode(array("retval" => "unsuccess", "retid" => null, "authen" => false));
}
exit();
