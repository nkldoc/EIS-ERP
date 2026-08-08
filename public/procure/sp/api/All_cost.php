<?php
include("../../conf/config.php");
include("../../lib/database/DatabaseServer.php");
include("../../lib/database/apiUtil.php");

$db = new DatabaseServer();
$util = new apiUtil();

$root = "data";
$data = array();
$con = null;

if ($_REQUEST["type"] == "dc_cost") {
    if (@$_REQUEST['dc_cost_acc_id']) {
        $con .= " AND a.c_code LIKE (SELECT TOP 1 left(aa.c_code,2) FROM " . DB_CENTER . "dc_cost aa WHERE aa.dc_cost_id= {$_REQUEST["dc_cost_acc_id"]}) + '%'";
    }
    if (@$_REQUEST["all"] == "all") {
        ${$root}[] = array(
            "id"                    => "0",
            "dc_cost_main_id"       => "0",
            "c_name"                => "- เลือกทั้งหมด -",
            "i_main"                => "0",
        );
    }
    // else {
    // 	if (@$_REQUEST["i_read"] < 4) {
    // 		$con .= " AND a.c_code LIKE (SELECT TOP 1 left(aa.c_code,2) FROM " . DB_CENTER . "dc_cost aa WHERE aa.dc_cost_id= {$_SESSION["dc_cost_id"]}) + '%'";
    // 	}
    // }
    $sqlMain = "
		SELECT * FROM " . DB_CENTER . "dc_cost a
		WHERE i_last = 1 AND i_enable = 1 AND i_delete = 2
        {$con}
		AND c_sub between '01' and '07'
		ORDER BY c_code";
    $arrParam = array(STATUS_ENABLE, 1);
    $stmt = $db->QueryParam($sqlMain, $arrParam);
    if ($stmt) {

        if (@$_REQUEST["all"] == "all") {
            ${$root}[] = array(
                "id" => "0",
                "c_code" => "",
                "c_sub" => "",
                "c_name" => "- เลือกทั้งหมด -"
            );
        }

        while ($row = $db->Fetch($stmt)) {
            $temp = array(
                "id" => "{$row["dc_cost_id"]}",
                "c_sub" => "{$row["c_sub"]}",
                "c_name" => $row["c_sub"] . " : " . $row["c_code"] . " : " . $row["c_name"]
            );
            ${$root}[] = $temp;
        }
    }
}else if(@$_REQUEST["type"] == "contract"){
  /*
1    สัญญา	สนธ	4
2	สญ.ซ.	สัญญาซื้อ	i_contract_type1	4
3	สญ.จ.	สัญญาจ้าง	i_contract_type2	4
4	ซ.	ใบสั่งซื้อ	i_contract_type3	4
5	จ.	ใบสั่งจ้าง	i_contract_type4	4  */
    
   
	$i_purchase = $_REQUEST['i_purchase']??null;   
	$i_type_contract = $_REQUEST['i_type_contract']??null;   
	$yyyy = $_REQUEST['i_yyyy']??null;   
	
    $contra = "{$i_type_contract}{$i_purchase}";
    
    switch ($contra) {
	   case 'สญ.ซ.':  $value = 2;
		  break;
	   case 'สญ.จ.':  $value = 3;
		  break;
	   case 'ซ.':  $value = 4;
		  break;
	   case 'จ.': $value = 5;
		  break; 
    }
      $sqlMain = "select top 1 dc_doc_id , ref_id, c_yyyy , i_value
				    , c_gen, c_date, d_gen_date 
				    , dc_user_create_id
				    , dc_user_create_cost_id
				    , d_create  
				    from dbo.sp_doc_gen where i_enabled=1 and c_gen is not null and 
                       c_yyyy = ? and dc_doc_id in(?) order by i_value desc,d_create desc";
    $arrParam = array($yyyy,$value);
//    echo $db->debugSql($sqlMain, $arrParam);
//    exit();
    $stmt = $db->QueryParam($sqlMain, $arrParam);
    if ($stmt) {
	   
        while ($row = $db->Fetch($stmt)) {
            $temp = array(
                "id" => "{$row["i_value"]}", 
                "c_name" => $row["c_gen"]
            );
            ${$root}[] = $temp;
        }
    }else{
	       $temp = array(
                "id" => 0, 
                "c_name" => ""
            );
            ${$root}[] = $temp;
    }
}else if(@$_REQUEST["type"] == "addContract"){

	   
 	$i_purchase0 = $_REQUEST['i_purchase']??null;   
	$i_type_contract0 = $_REQUEST['i_type_contract']??null;   
	
    $contra = "{$i_type_contract0}{$i_purchase0}";
    
    switch ($contra) {
	   case 'สญ.ซ.':  $value = 2;
		  break;
	   case 'สญ.จ.':  $value = 3;
		  break;
	   case 'ซ.':  $value = 4;
		  break;
	   case 'จ.': $value = 5;
		  break; 
    }
    
$dc_cost2_id       = $_REQUEST['dc_cost2_id'] ?? null;
$i_purchase        = $_REQUEST['i_purchase'] ?? null;
$i_type_contract   = $_REQUEST['i_type_contract'] ?? null;
$i_yyyy            = $_REQUEST['i_yyyy'] ?? null;
$i_year            = $_REQUEST['i_year'] ?? null;
$type              = $_REQUEST['type'] ?? null;
$id                = $_REQUEST['id'] ?? null;
$sp_emp_id         = $_REQUEST['sp_emp_id'] ?? null;
$txtsp_emp_idID    = $_REQUEST['txtsp_emp_idID'] ?? null;
$c_contract_code   = $_REQUEST['c_contract_code'] ?? null;
$i_value           = $_REQUEST['i_value'] ?? null;
    

$ivalue	  = intVal($_REQUEST['i_value'])+1; 
$c_contract = $db->GetDataBySQL("select top 1 c_gen from dbo.sp_doc_gen where c_gen = ? ", array($c_contract_code));
	   
if($c_contract){
    echo json_encode(array("success" => true, "msg" => "รายการซ้ำ","debug" => true)); 
    exit();
}
$userid = $db->GetDataBySQL("select top 1 dc_user_id from dbo.dc_user where dc_emp_id = ( select top 1 dc_emp_id from dbo.sp_emp where sp_emp_id =?)", array($sp_emp_id));
//	  echo  "{$userid}"; 
//exit();
$sql = "INSERT INTO EIS_PROCURE..sp_doc_gen (dc_doc_id, ref_id, c_yyyy, i_value, dc_user_create_id, dc_user_create_cost_id, d_create, c_gen, c_date, d_gen_date
) VALUES ({$value}, 0, {$i_year}, {$ivalue}, {$userid},  0, GETDATE(), '{$c_contract_code}',NULL, NULL);";
				$para = $db->QueryParam($sql,array());
                    $ss_id = $db->Fetch($para);
echo json_encode(array("success" => true, "msg" => "ทำรายเรียบร้อย"));
exit;				
}else if($_REQUEST["type"]=="mappingUser"){
$sp_emp_id = $_REQUEST['sp_emp_id'] ?? null;    
$c_contract_code   = $_REQUEST['c_contract_code'] ?? null;

$userid = $db->GetDataBySQL("select top 1 dc_user_id from dbo.dc_user where dc_emp_id = ( select top 1 dc_emp_id from dbo.sp_emp where sp_emp_id =?)", array($sp_emp_id));
$sql = "update EIS_PROCURE..sp_doc_gen  set dc_user_create_id = {$userid} where c_gen = ?";
//echo $c_contract_code;
//echo $sql; exit();
				$para = $db->QueryParam($sql,array($c_contract_code));
                    $ss_id = $db->Fetch($para);
echo json_encode(array("success" => true, "msg" => "ทำรายเรียบร้อย"));
exit;    
    
}  

echo json_encode(array("success" => true, "msg" => "ทำรายเรียบร้อย","debug" => true, $root => ${$root}));
exit;
