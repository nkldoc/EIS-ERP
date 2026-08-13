<?php
include("../../conf/config.php");
include("../../lib/database/DatabaseServer.php");
include("../../lib/database/apiUtil.php");
include("../../lib/date/i_date.class.php"); 
include("../../dc/conf/config_dc.php");
include("../conf/configAR.php");

$db 	= new DatabaseServer();
$date 	= new i_date();
$util	= new apiUtil();

if($_REQUEST["type"] == "cnt") {
	$root		= "data";
	$data		= array();
	
	$mode	= @$_REQUEST["mode"];
	$status	= @$_REQUEST["status"];
	$filter	= @$_REQUEST["filter"];
	$value	= @$_REQUEST["value"];
	$i_read	= @$_REQUEST["i_read"];
	
	$limit 	= @$_REQUEST["limit"];
	$start 	= @$_REQUEST["start"];
	
	$con	= null;
	
	if (!$util->get($start)) { 	$start 	= 0; }
	if (!$util->get($limit)) { 	$limit 	= 20; }else{ $limit=($limit+$start); }
	
	switch($i_read) {
		case 1:		$con = " AND a.dc_user_create_id= ".$_SESSION["user_id"]; break;
		case 2:		$con = " AND a.dc_user_create_cost_id=".$_SESSION["dc_cost_id"]; break;
		default:	$con = "";
	}
	
	if($mode == "SEARCH") {
		if($status > 0) { $con	.= "AND a.i_enable = ".$status; }
		if($value != "") { $con	.= " AND a.".$filter." LIKE '%$value%' "; }
		if($_REQUEST["tax_customer_id"] > 0)
			{ $con	.= " AND a.dc_tax_customer_id = ".$_REQUEST["tax_customer_id"]." "; }
	}
	$con	.= " AND a.i_is_debtor IN (".AR_CONTACT_PERSONAL_TYPE1.",".AR_CONTACT_PERSONAL_TYPE2.") ";
	
	$sqlTempTable = "	SELECT
							ROW_NUMBER() OVER (ORDER BY a.c_name ASC) AS numrow,
							a.dc_cnt_id,
							a.dc_cnt_type_id,
							c.c_name AS dc_cnt_type_name,
							a.dc_acc_id,
							a.dc_acc_id_cred,
							a.dc_tax_customer_id,
							b.c_name AS dc_tax_customer_name, 
							a.dc_cost_id,
							a.dc_title_id,
							a.c_old_code,
							a.c_code,
							a.c_name,
							a.c_surname,
							a.c_address,
							a.c_telephone,
							a.c_mobile,
							a.c_fax,
							a.c_website,
							a.c_email,
							a.c_tax_value,
							a.dc_bank_id,
							a.dc_bank_branch_id,
							a.c_bank_no,
							a.dc_ref_type_id,
							a.c_ref_value,
							a.i_is_debtor,
							a.i_group_cnt,
							a.i_is_creditor,
							a.i_is_agency,
							a.f_debt_amount,
							a.f_credit_amount,
							a.parent_id,
							a.order_id,
							a.i_is_fixed,
							a.c_comment,
							a.i_company_pay_tax,
							a.i_enable,
							a.i_is_ins,
							a.due_bill,
							a.dc_cost_old_id,
							a.i_tax_fix,
							a.dc_tax_id,
							a.f_dec_rate,
							a.f_tax_reduce,
							a.dc_disc_type_id,
							a.dc_bank_acc_dfl_id,
							a.i_key_later,
							a.c_name_inv,
							a.c_address_inv,
							a.c_add_bank1,
							a.c_add_bank2,
							a.c_add_bank3,
							a.c_add_bank4,
							a.c_address_inv2,
							a.cnt_type,
							a.title_name,
							a.dc_bank_acc,
							a.f_cnt_tax,
							a.dc_tax_name,
							a.i_dec_person,
							a.i_credit_card,
							a.c_credit_name,
							a.i_daily_worker,
							a.i_branch,
							a.c_branch,
							a.i_delete,
							(SELECT bb.c_name FROM dc_user aa LEFT JOIN dc_emp bb ON aa.dc_emp_id = bb.dc_emp_id WHERE aa.dc_user_id = a.dc_user_create_id) AS dc_user_create,
							(SELECT c_name FROM dc_cost aa WHERE dc_cost_id = a.dc_user_create_cost_id) AS dc_user_create_cost,
							convert(VARCHAR, a.d_create, 120) AS d_create,
							(SELECT bb.c_name FROM dc_user aa LEFT JOIN dc_emp bb ON aa.dc_emp_id = bb.dc_emp_id WHERE aa.dc_user_id = a.dc_user_update_id) AS dc_user_update,
							(SELECT c_name FROM dc_cost aa WHERE dc_cost_id = a.dc_user_update_cost_id) AS dc_user_update_cost,
							convert(VARCHAR, a.d_update, 120) AS d_update
						FROM dc_cnt a LEFT JOIN dc_tax_customer b ON a.dc_tax_customer_id = b.dc_tax_customer_id
							LEFT JOIN dc_cnt_type c ON a.dc_cnt_type_id = c.dc_cnt_type_id
						WHERE a.i_delete = 2
						$con";
	
	$sqlMain = "SELECT * FROM ({$sqlTempTable}) a WHERE a.numrow > ? AND a.numrow <= ?";
	
	$arrParam[]	= $start;
	$arrParam[]	= $limit;
	
	$stmt = $db->QueryParam($sqlMain, $arrParam);
	while($row =$db->Fetch($stmt))				
	{
		$temp = array(	"no"						=> $row["numrow"],
						"id"						=> $row["dc_cnt_id"],
						"dc_cnt_type_id"			=> $row["dc_cnt_type_id"],
						"dc_cnt_type_name"			=> $row["dc_cnt_type_name"],
						"dc_acc_id"					=> $row["dc_acc_id"],
						"dc_acc_id_cred"			=> $row["dc_acc_id_cred"],
						"dc_tax_customer_id"		=> $row["dc_tax_customer_id"],
						"dc_tax_customer_name"		=> $row["dc_tax_customer_name"],
						"dc_cost_id"				=> $row["dc_cost_id"],
						"dc_title_id"				=> $row["dc_title_id"],
						"c_old_code"				=> $row["c_old_code"],
						"c_code"					=> $row["c_code"],
						"c_name"					=> $row["c_name"],
						"c_surname"					=> $row["c_surname"],
						"c_address"					=> $row["c_address"],
						"c_telephone"				=> $row["c_telephone"],
						"c_mobile"					=> $row["c_mobile"],
						"c_fax"						=> $row["c_fax"],
						"c_website"					=> $row["c_website"],
						"c_email"					=> $row["c_email"],
						"c_tax_value"				=> $row["c_tax_value"],
						"dc_bank_id"				=> $row["dc_bank_id"],
						"dc_bank_branch_id"			=> $row["dc_bank_branch_id"],
						"c_bank_no"					=> $row["c_bank_no"],
						"dc_ref_type_id"			=> $row["dc_ref_type_id"],
						"c_ref_value"				=> $row["c_ref_value"],
						"i_is_debtor"				=> $row["i_is_debtor"],
						"i_group_cnt"				=> $row["i_group_cnt"],
						"i_is_creditor"				=> $row["i_is_creditor"],
						"i_is_agency"				=> $row["i_is_agency"],
						"f_debt_amount"				=> $row["f_debt_amount"],
						"f_credit_amount"			=> $row["f_credit_amount"],
						"parent_id"					=> $row["parent_id"],
						"order_id"					=> $row["order_id"],
						"i_is_fixed"				=> $row["i_is_fixed"],
						"c_comment"					=> $row["c_comment"],
						"i_company_pay_tax"			=> $row["i_company_pay_tax"],
						"i_enable"					=> $row["i_enable"],
						"i_is_ins"					=> $row["i_is_ins"],
						"due_bill"					=> $row["due_bill"],
						"dc_cost_old_id"			=> $row["dc_cost_old_id"],
						"i_tax_fix"					=> $row["i_tax_fix"],
						"dc_tax_id"					=> $row["dc_tax_id"],
						"f_dec_rate"				=> $row["f_dec_rate"],
						"f_tax_reduce"				=> $row["f_tax_reduce"],
						"dc_disc_type_id"			=> $row["dc_disc_type_id"],
						"dc_bank_acc_dfl_id"		=> $row["dc_bank_acc_dfl_id"],
						"i_key_later"				=> $row["i_key_later"],
						"c_name_inv"				=> $row["c_name_inv"],
						"c_address_inv"				=> $row["c_address_inv"],
						"c_add_bank1"				=> $row["c_add_bank1"],
						"c_add_bank2"				=> $row["c_add_bank2"],
						"c_add_bank3"				=> $row["c_add_bank3"],
						"c_add_bank4"				=> $row["c_add_bank4"],
						"c_address_inv2"			=> $row["c_address_inv2"],
						"cnt_type"					=> $row["cnt_type"],
						"title_name"				=> $row["title_name"],
						"dc_bank_acc"				=> $row["dc_bank_acc"],
						"f_cnt_tax"					=> $row["f_cnt_tax"],
						"dc_tax_name"				=> $row["dc_tax_name"],
						"i_dec_person"				=> $row["i_dec_person"],
						"i_credit_card"				=> $row["i_credit_card"],
						"c_credit_name"				=> $row["c_credit_name"],
						"i_daily_worker"			=> $row["i_daily_worker"],
						"i_branch"					=> $row["i_branch"],
						"branch_name"				=> ($row["i_branch"] == 2)? @$CONF_I_BRANCH[@$row["i_branch"]]." ".@$row["branch_name"] : @$CONF_I_BRANCH[@$row["i_branch"]],
						"c_branch"					=> $row["c_branch"],
						"i_delete"					=> $row["i_delete"],
						"dc_user_create_id"			=> "{$row["dc_user_create"]}",
						"dc_user_create_cost_id"	=> "{$row["dc_user_create_cost"]}",
						"d_create"					=> $date->extDateBuddha($row["d_create"]),
						"dc_user_update_id"			=> $row["dc_user_update"],
						"dc_user_update_cost_id"	=> $row["dc_user_update_cost"],
						"d_update"					=> $date->extDateBuddha($row["d_update"]) );
		
		${$root}[] = $temp;
	}
	$sqlCount = "SELECT COUNT(*) AS totalCount FROM ({$sqlTempTable}) a";
	
	$totalCount = $db->GetDataBySQL($sqlCount, $arrParam);
	echo json_encode(array("debug"=>true, "totalCount"=>$totalCount, $root=>${$root}));
} else if ($_REQUEST["type"] == "bank") {	
	$root		= "data";
	$data		= array();

	$con	= null;	
	$con	.= " AND a.dc_cnt_id = ".$_REQUEST["id"]." ";
	$con	.= " AND a.i_type = ".DC_BANK_ACC_TYPE_CNT." ";
	$sqlTempTable = "	SELECT
							ROW_NUMBER() OVER (ORDER BY a.c_name ASC) AS numrow,
							a.dc_bank_acc_id,
							a.dc_bank_deposit_type_id,
							(SELECT aa.c_name FROM dc_bank_deposit_type aa WHERE aa.dc_bank_deposit_type_id = a.dc_bank_deposit_type_id) as dc_bank_deposit_type_name,
							a.dc_bank_id,
							(SELECT aa.c_name FROM dc_bank aa WHERE aa.dc_bank_id = a.dc_bank_id) as dc_bank_name,
							a.dc_bank_branch_id,
							(SELECT aa.c_name FROM dc_bank_branch aa WHERE aa.dc_bank_branch_id = a.dc_bank_branch_id) as dc_bank_branch_name,
							a.dc_acc_id,
							(SELECT aa.c_name FROM dc_acc aa WHERE aa.dc_acc_id = a.dc_acc_id) as dc_acc_name,
							a.dc_cnt_id,
							a.dc_emp_id,
							a.dc_area_id,
							(SELECT aa.c_name FROM dc_business_area aa WHERE aa.dc_area_id = a.dc_area_id) as dc_area_name,
							a.c_code,
							a.c_name,
							a.i_main,
							a.c_comment,
							a.i_enable,
							a.i_delete,
							a.i_type,
							a.i_trans_acc_tb,
							(SELECT bb.c_name FROM dc_user aa LEFT JOIN dc_emp bb ON aa.dc_emp_id = bb.dc_emp_id WHERE aa.dc_user_id = a.dc_user_create_id) AS dc_user_create,
							(SELECT c_name FROM dc_cost aa WHERE dc_cost_id = a.dc_user_create_cost_id) AS dc_user_create_cost,
							convert(VARCHAR, a.d_create, 120) AS d_create,
							(SELECT bb.c_name FROM dc_user aa LEFT JOIN dc_emp bb ON aa.dc_emp_id = bb.dc_emp_id WHERE aa.dc_user_id = a.dc_user_update_id) AS dc_user_update,
							(SELECT c_name FROM dc_cost aa WHERE dc_cost_id = a.dc_user_update_cost_id) AS dc_user_update_cost,
							convert(VARCHAR, a.d_update, 120) AS d_update
						FROM dc_bank_acc a
						WHERE a.i_delete = 2 $con";
	
	$sqlMain = "SELECT * FROM ({$sqlTempTable}) a ORDER BY a.numrow";
	$arrParam[]	= null;
	
	$stmt = $db->QueryParam($sqlMain, $arrParam);
	while($row =$db->Fetch($stmt))				
	{
		$temp = array(	"bank_no"						=> "{$row["numrow"]}",
						"bank_id"						=> "{$row["dc_bank_acc_id"]}",
						"bank_dc_bank_deposit_type_id"	=> "{$row["dc_bank_deposit_type_id"]}",
						"bank_dc_bank_deposit_type_name"=> "{$row["dc_bank_deposit_type_name"]}",
						"bank_dc_bank_id"				=> "{$row["dc_bank_id"]}",
						"bank_dc_bank_name"				=> "{$row["dc_bank_name"]}",
						"bank_dc_bank_branch_id"		=> "{$row["dc_bank_branch_id"]}",
						"bank_dc_bank_branch_name"		=> "{$row["dc_bank_branch_name"]}",
						"bank_dc_acc_id"				=> "{$row["dc_acc_id"]}",
						"bank_dc_acc_name"				=> "{$row["dc_acc_name"]}",
						"bank_dc_cnt_id"				=> "{$row["dc_cnt_id"]}",
						"bank_dc_emp_id"				=> "{$row["dc_emp_id"]}",
						"bank_dc_area_id"				=> "{$row["dc_area_id"]}",
						"bank_dc_area_name"				=> "{$row["dc_area_name"]}",
						"bank_c_code"					=> "{$row["c_code"]}",
						"bank_c_name"					=> "{$row["c_name"]}",
						"bank_i_main"					=> "{$row["i_main"]}",
						"bank_c_comment"				=> "{$row["c_comment"]}",
						"bank_i_enable"					=> "{$row["i_enable"]}",
						"bank_i_delete"					=> "{$row["i_delete"]}",
						"bank_i_type"					=> "{$row["i_type"]}",			
						"bank_i_trans_acc_tb"			=> "{$row["i_trans_acc_tb"]}",
						"bank_dc_user_create_id"		=> "{$row["dc_user_create"]}",
						"bank_dc_user_create_cost_id"	=> "{$row["dc_user_create_cost"]}",
						"bank_d_create"					=> "{$date->extDateBuddha($row["d_create"])}",
						"bank_dc_user_update_id"		=> "{$row["dc_user_update"]}",
						"bank_dc_user_update_cost_id"	=> "{$row["dc_user_update_cost"]}",
						"bank_d_update"					=> "{$date->extDateBuddha($row["d_update"])}" );
	
		${$root}[] = $temp;
	}
	$sqlCount = "SELECT COUNT(*) AS totalCount FROM ({$sqlTempTable}) a";
	
	$totalCount = $db->GetDataBySQL($sqlCount, $arrParam);
	echo json_encode(array("debug"=>true, "totalCount"=>$totalCount, $root=>${$root}));
}
?>