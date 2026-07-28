<?php

//-- mnContractCode
include("../../../conf/config.php");
include("../../../lib/database/DatabaseServer.php");
include("../../../lib/database/apiUtil.php");
include("../../../lib/date/i_date.class.php");

$db = new DatabaseServer();
$date = new i_date();
$util = new apiUtil();

$mode = $_REQUEST["mode"] ?? null;


$json = trim(file_get_contents(
        'http://localhost/api-nmu/?/bg/BgBudgetAllSupplies/i_year/2022/dc_expense_budget_type_id/2/dc_cost_id/38'), 
        "\xEF\xBB\xBF");
$data = json_decode($json,true);

foreach($data["data"] as $ind => $val){
  //  print_R($val);
    //Array ( [bg_expense_id] => 11 [c_code] => 020101001 [c_name] => ค่าจ้างพนักงานมหาวิทยาลัย [f_plan] => 129000000 [f_total_plan] => 129000000.00 [f_dtl] => 0 [f_total_dtl] => .00 [f_income] => 0 [f_total_income] => .00 )
    echo $val."<br>";
}

    exit;
if (true) {
    //$db->CommitTran();
    $re = array("reval" => 0, "success" => "Success", "data" => $data);
} else {
    //$db->RollBackTran();
    $re = array("reval" => 1, "success" => "Error", "data" => null);
}

echo json_encode($re);
exit;
