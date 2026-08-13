<?php
include("../../conf/config.php");
include("../../lib/database/DatabaseServer.php");
include("../../lib/database/apiUtil.php");
include("../../lib/date/i_date.class.php");
include("../../lib/mon/mon.class.php"); 
include("../conf/configAR.php");
###################
$db 	= new DatabaseServer();
$mon 	= new mon(); // convert floatval
$date 	= new i_date();
$util	= new apiUtil();
############################################################################################################
$mode	= @$_REQUEST["mode"];
$filter = @$_REQUEST["filter"];
$value	= @$_REQUEST["value"];
$i_read	= @$_REQUEST["i_read"];
###################
$table	= "ar_so_hdr";
$root	= "data";
$data	= array();
###################
$limit 	= @$_REQUEST["limit"];
$dir 	= @$_REQUEST["dir"];
$sort 	= @$_REQUEST["sort"];
$start 	= @$_REQUEST["start"]; 
###################
if (!$util->get($start)) { 	$start 	= 0; }
if (!$util->get($limit)) { 	$limit 	= 20; }else{ $limit=($limit+$start); }
if (!$util->get($dir))	{   $dir 	= "ASC"; }
if (!$util->get($sort)) {  	$sort 	= "ar_so_hdr_id DESC,dc_debtor_id"; }
###################

	 
	$arr_status = array(null=>"ยังไม่ออกเลข SO",1=>"ออกเลข SO",2=>"",3=>"สมบูรณ์(เต็มใบ)",4=>"สมบูรณ์(ยกเลิกบางส่วน)");
	$wh 	= null;
 
	if(isset($_REQUEST['mode']) && $_REQUEST['mode']=="SEARCH")
	{ 
			$d_begin_dateID = substr(@$_REQUEST["d_begin_dateID"],0,10);
			$d_end_dateID 	= substr(@$_REQUEST["d_end_dateID"],0,10);

			$wh .=" ISNULL(i_is_status,0) =1 AND ISNULL(i_enable,".STATUS_DISABLE.") != ".STATUS_DISABLE." and d_doc_date between ? and ?";
			
			$arrParam[] 	= $d_begin_dateID;
			$arrCountParam[]= $d_begin_dateID;
			
			$arrParam[] 	= $d_end_dateID;
			$arrCountParam[]= $d_end_dateID; 
			$value = @$_REQUEST['value'];
					
			if($value!=''){
						
						if($_REQUEST['filter']=='debtor_name'){
							$wh .=" and dc_debtor_id in (select dc_debtor_id from dc_debtor where c_name like ?)";
							$arrParam[] ="%{$value}%";	
							$arrCountParam[] = "%{$value}%";
						}else{
							$wh .=" and ".$_REQUEST['filter']." like ?";
							$arrParam[] ="%{$value}%";	
							$arrCountParam[] = "%{$value}%"; 
						} 	
			}

	}else{ 

			$wh = " ISNULL(i_is_status,0) =1 AND ISNULL(i_enable,".STATUS_DISABLE.") != ?";
			$arrParam[] 		= STATUS_DISABLE;
			$arrCountParam[]	= STATUS_DISABLE;		
	} 
 
	$sqlTempTable = "select {$table}_id 
                            ,(select top 1 c_name from dc_cost where dc_cost_id={$table}.dc_cost_id) as c_cost_name 
                            ,(select top 1 c_code from dc_cost where dc_cost_id={$table}.dc_cost_id) as c_cost_code 
                            , dc_cost_id
                            ,(select top 1 c_name from dc_debtor where dc_debtor_id={$table}.dc_debtor_id) as c_debtor_name
                            ,(select top 1 c_code from dc_debtor where dc_debtor_id={$table}.dc_debtor_id) as c_debtor_code
                            ,(select top 1 c_tax_value from dc_debtor where dc_debtor_id={$table}.dc_debtor_id) as c_tax_value
                            ,(select top 1 c_address from dc_debtor where dc_debtor_id={$table}.dc_debtor_id) as c_address
                            ,(select top 1 c_telephone from dc_debtor where dc_debtor_id={$table}.dc_debtor_id) as c_telephone
                            ,(select top 1 c_mobile from dc_debtor where dc_debtor_id={$table}.dc_debtor_id) as c_mobile
                            ,(select top 1 c_email from dc_debtor where dc_debtor_id={$table}.dc_debtor_id) as c_email
							, dc_debtor_id  
                            , c_name
                            , isnull(c_code,0) as c_code 
                            , c_comment
							,(select top 1 dc_area_id from dc_cost where dc_cost_id={$table}.dc_cost_id) as dc_area_id 
                            , i_enable
							, i_is_status 
                            , c_po_no
							, c_remark
							,(select sum(f_total_cost) from ar_so_dtl where i_billing is null and ar_so_hdr_id={$table}.ar_so_hdr_id)as f_total_cost
                            , convert(varchar, d_doc_date, 120) as d_doc_date  
                            ,(select top 1 c_full_name from dc_user where dc_user_id={$table}.dc_user_create_id) as c_create_name
                            ,(select top 1 c_name from dc_cost where dc_cost_id={$table}.dc_user_create_cost_id) as c_cost_creat_name
                            , convert(varchar, d_create, 120) as d_create
                            ,(select top 1 c_full_name from dc_user where dc_user_id={$table}.dc_user_update_id) as c_update_name
                            ,(select top 1 c_name from dc_cost where dc_cost_id={$table}.dc_user_update_cost_id) as c_cost_update_name
                            , convert(varchar, d_update, 120) as d_update 
                    , ROW_NUMBER() OVER (ORDER BY $sort $dir) as row FROM {$table} 
                    where {$wh} ".$util->viewAcc($i_read);

$sqlMain	= "select *
				, (select top 1 c_name_inv from dc_debtor where dc_debtor_id=a.dc_debtor_id) as c_name_inv
				, (select top 1 c_address_inv from dc_debtor where dc_debtor_id=a.dc_debtor_id) as c_address_inv
				, (select top 1 due_bill from dc_debtor where dc_debtor_id=a.dc_debtor_id) as due_bill
				, (select top 1 condition_pay from dc_debtor where dc_debtor_id=a.dc_debtor_id) as condition_pay
				, (select top 1 c_name from dc_area where dc_area_id=a.dc_area_id) as c_area_name  
				from ({$sqlTempTable}) a WHERE a.row > ? and a.row <= ?";
$arrParam[] = $start;
$arrParam[] = $limit;
 
$stmt = $db->QueryParam($sqlMain, $arrParam);
$i = $start + 1;
       
while($row =$db->Fetch($stmt))				
{
	
        $row["c_code"] = ($row["c_code"]!='')?$row["c_code"]:0;
        $chkPerEdit = ($row["c_code"])?1:0;
        $chkPerDel  = ($row["c_code"])?1:0;    

	$temp = array("no" => ($i++), 
                    "id" 		=> $row["{$table}_id"],
                    "ar_so_hdr_id"      => $row["{$table}_id"],
                    "c_code" 		=> $row["c_code"],
                    "c_name" 		=> $row["c_name"], 
  
                    "delID"  => ($chkPerEdit)?'':'<img src="../images/icons/document_delete.gif" style="cursor:pointer"/>',
                    "editID" => ($chkPerDel)?'':'<img src="../images/icons/document_edit.gif" style="cursor:pointer"/>',	
 
                    "c_cost_name" 				=> $row["c_cost_name"]?$row["c_cost_name"]:"<span style='color:red'>ไม่มีข้อมูลรหัส[".$row["dc_cost_id"]."]</span>", 
                    "dc_cost_id" 				=> $row["dc_cost_id"], 
					"txtdc_cost_idID" 			=> $row["c_cost_name"]?$row["c_cost_code"]." ".$row["c_cost_name"]:"ไม่มีข้อมูลรหัส  ".$row["dc_cost_id"]."",
                    "dc_area_id"				=> $row["dc_area_id"],
					"c_area_name"				=> $row["c_area_name"], 
					"is_status"					=> $row["i_is_status"],
                    "txtdc_debtor_idID" 		=> $row["c_debtor_name"]?$row["c_debtor_code"]." ".$row["c_debtor_name"]:"ไม่มีข้อมูลรหัส  ".$row["dc_debtor_id"]."", //frm
                    "c_debtor_name" 			=> $row["c_debtor_name"]?$row["c_debtor_name"]:"<span style='color:red'>ไม่มีข้อมูลรหัส[".$row["dc_debtor_id"]."]</span>", //grid				
                    "dc_debtor_id" 				=> $row["dc_debtor_id"], 
					"c_tax_value" 				=> $row["c_tax_value"], 
					"c_address" 				=> $row["c_address"], 
					"c_telephone" 				=> $row["c_telephone"], 
					"c_mobile" 					=> $row["c_mobile"], 
					"c_email" 					=> $row["c_email"], 
					 "c_name_inv" 				=> $row["c_name_inv"], 
					 "c_address_inv" 			=> $row["c_address_inv"],
					 "due_bill" 				=> $row["due_bill"],
					 "condition_pay"			=> $row["condition_pay"],
					 
					"f_total_cost_float" 		=> $row["f_total_cost"],
					"f_total_cost" 				=> number_format($row["f_total_cost"],2), 
					"c_status" 					=> $arr_status[$row["i_is_status"]], 
                    "c_po_no" 					=> $row["c_po_no"], 
                    "c_comment" 				=> $row["c_comment"],
                    "i_enable" 					=> $row["i_enable"],  
                    "d_doc_date" 				=> $date->extDateBuddha($row["d_doc_date"]), 
                    "dc_user_create_id" 		=> $row["c_create_name"],
                    "dc_user_create_cost_id" 	=> $row["c_cost_creat_name"],
                    "d_create" 					=> $date->extDateBuddha($row["d_create"]),
                    "dc_user_update_id" 		=> $row["c_update_name"],
                    "dc_user_update_cost_id" 	=> $row["c_cost_update_name"],
                    "d_update" 					=> $date->extDateBuddha($row["d_update"])
            );
	if($row["f_total_cost"]>0) ${$root}[] = $temp;
}
$sqlCount = "select count(*) as totalCount from ({$sqlTempTable}) a";
$totalCount = $db->GetDataBySQL($sqlCount, $arrCountParam);
echo json_encode(array("success"=>"success","totalCount"=>$totalCount,$root=>${$root}));

function get($a){ return isset($a) && !empty($a)?$a:null; }
?>