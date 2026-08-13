<?php
	include("../../conf/config.php");
	include("../../lib/database/DatabaseServer.php");
	include("../../lib/database/apiUtil.php");
	include("../../lib/date/i_date.class.php");
	include("../../lib/mon/mon.class.php");
	include("../conf/configAR.php");	
	
	$db = new DatabaseServer();
	$date 	= new i_date();
	$util	= new apiUtil();
	$mon 	= new mon(); // convert floatval
	############################################################################################################
	$mode	= @$_REQUEST["mode"];
	$filter = @$_REQUEST["filter"];
	$value	= @$_REQUEST["value"];
	$i_read	= @$_REQUEST["i_read"];
 
	###################
	$limit 	= @$_REQUEST["limit"];
	$dir 	= @$_REQUEST["dir"];
	$sort 	= @$_REQUEST["sort"];
	$start 	= @$_REQUEST["start"];
	###################
	if (!$util->get($start)) { 	$start 	= 0; }
	if (!$util->get($limit)) { 	$limit 	= 15; }else{ $limit=($limit+$start); }
	if (!$util->get($dir))	{   $dir 	= "ASC"; }
	if (!$util->get($sort)) {  	$sort 	= "c_code"; }
	################### 
	$root	= "data";
	$debug = ''; 
	$totalCount =0;
	function get($a){ return isset($a) && !empty($a)?$a:null; }

	
 if($_REQUEST['type'] == 'storeCost') { 
		###################   
		$table	= "vw_dc_cost";
		$root	= "data";
		$data	= array();
		
		$sqlTempTable = "select {$table}.dc_cost_id
		, {$table}.c_code
		, {$table}.c_name  
		, {$table}.dc_area_id  
		, (select top 1 c_name from dc_area where dc_area_id={$table}.dc_area_id) as c_area_name 
		
		,(select top 1 c_full_name from dc_user where dc_user_id={$table}.dc_user_create_id) as c_create_name
		,(select top 1 c_name from dc_cost where dc_cost_id={$table}.dc_user_create_cost_id) as c_cost_creat_name
		, convert(varchar, d_create, 120) as d_create
		,(select top 1 c_full_name from dc_user where dc_user_id={$table}.dc_user_update_id) as c_update_name
		,(select top 1 c_name from dc_cost where dc_cost_id={$table}.dc_user_update_cost_id) as c_cost_update_name
		, convert(varchar, [d_update], 120) as d_update
		, ROW_NUMBER() OVER (ORDER BY $sort $dir) as row FROM {$table}
		where i_last = 1 and ISNULL(i_enable,".STATUS_ENABLE.") = ?";

		if($mode=="SEARCH"){
// 			$value = (isset($_REQUEST['query']) && !empty($_REQUEST['query']))?$_REQUEST['query']:$value;
			if(isset($value) && $value !="")
			{ 
				$sqlTempTable .= " and ".$filter." like ?"; 
			}
			$sqlMain		= "select * from ({$sqlTempTable}) a WHERE a.row > ? and a.row <= ?"; 
			$arrParam 		=  array(STATUS_ENABLE, "%{$value}%", $start, $limit); 
			$arrCountParam 	=  array(STATUS_ENABLE, "%{$value}%");
 
		} else
		{
			$sqlMain		= "select * from ({$sqlTempTable}) a WHERE a.row > ? and a.row <= ?"; 
			$arrParam 		= array(STATUS_ENABLE, $start, $limit); 
			$arrCountParam 	= array(STATUS_ENABLE);
		}
 
		$stmt 	= $db->QueryParam($sqlMain, $arrParam);
		$i 		= $start + 1;
		
			if(isset($_REQUEST['all'])){ 
				${$root}[] = array("no" => 0,
						"id" 		=> -1,
						"c_code" 	=> "",
						"c_name" 	=> "ทั้งหมด" 
				);
			}
			
		while($row =$db->Fetch($stmt))
		{
			
			$temp = array("no" => ($i++),
					"id" => $row["dc_cost_id"], 
					"c_area_name" => $row["c_area_name"],
					"dc_area_id" => $row["dc_area_id"],
					"c_code" => $row["c_code"],
					"c_name" => $row["c_name"] 
			);
			${$root}[] = $temp;
		}
		$sqlCount 	= "select count(*) as totalCount from ({$sqlTempTable}) a";
		$totalCount = $db->GetDataBySQL($sqlCount, $arrCountParam);
		$debug		='storeCost >>>';
                
}else if($_REQUEST['type'] == 'vatStore') { //select * from //dc_vat where end_date is null and i_enabled='1'
	
	$sqlMain	= "select dc_vat_id 
						, c_code
						, c_name
						, isnull(f_vat_rate,0) as f_vat_rate 
					from vw_dc_vat
					where isnull(i_enable,".STATUS_DISABLE.") = ?
					order by dc_vat_id
				";
	$arrParam	= array(STATUS_ENABLE); 
	$stmt = $db->QueryParam($sqlMain, $arrParam);
	$i=0;
	if($stmt){
		while($row =$db->Fetch($stmt))
		{   $i++;
			$temp = array("id" => $row["dc_vat_id"]
						, "c_code" => $row["c_code"]
						, "f_vat_rate" => $row["f_vat_rate"] 
						, "c_name" => $row["c_name"]
	
			);
			${$root}[] = $temp;
		}
	}
	$totalCount = $i;
	$debug='vatStore >>>'; 
	
}else if($_REQUEST['type'] == 'dc_unit_type') { //select * from //dc_vat where end_date is null and i_enabled='1'
	
	$sqlMain	= "select dc_unit_type_id 
						, c_code
						, c_name  
					from dc_unit_type
					where isnull(i_enable,".STATUS_DISABLE.") = ?
					order by dc_unit_type_id
				";
	$arrParam	= array(STATUS_ENABLE); 
	$stmt = $db->QueryParam($sqlMain, $arrParam);
	$i=0;
	if($stmt){
		while($row =$db->Fetch($stmt))
		{   $i++;
			$temp = array("id" => $row["dc_unit_type_id"]
						, "c_code" => $row["c_code"] 
						, "c_name" => $row["c_name"]
	
			);
			${$root}[] = $temp;
		}
	}
	$totalCount = $i;
	$debug='dc_unit_type >>>'; 
	
}else if($_REQUEST['type'] == 'closeBillStore') { //select * from //dc_vat where end_date is null and i_enabled='1'
 
	$sqlMain	= "sselect * from ar_close_bill_hdr where i_close_bill=0 and i_is_center=? and bill_yyyy_mm=?";
	$arrParam	= array($_REQUEST['i_is_center'],$_REQUEST['c_yyyy_mm']); 
	$stmt = $db->QueryParam($sqlMain, $arrParam);
	$i=0;
	if($stmt){
		while($row =$db->Fetch($stmt))
		{   $i++;
			$temp = array("id" => $row["ar_close_bill_hdr_id"]
						, "c_code" => $row["c_code"] 
                                                , "bill_yyyy_mm" => $row["bill_yyyy_mm"]
                                                , "i_close_bill" => $row["i_close_bill"]    
						, "i_is_center" => $row["i_is_center"]
	
			);
			${$root}[] = $temp;
		}
	}
	$totalCount = $i;
	$debug='vatStore >>>'; 
	
}else if($_REQUEST['type'] == 'storeAcc') {
 
		$table	= "vw_dc_acc";
		$root	= "data";
		$data	= array();
		$w = "i_last=1";
		$sqlTempTable = "select dc_acc_id
		, c_code
		, c_name 
		,(select top 1 c_full_name from dc_user where dc_user_id={$table}.dc_user_create_id) as c_create_name
		,(select top 1 c_name from dc_acc where dc_acc_id={$table}.dc_user_create_cost_id) as c_cost_creat_name
		, convert(varchar, d_create, 120) as d_create
		,(select top 1 c_full_name from dc_user where dc_user_id={$table}.dc_user_update_id) as c_update_name
		,(select top 1 c_name from dc_acc where dc_acc_id={$table}.dc_user_update_cost_id) as c_cost_update_name
		, convert(varchar, [d_update], 120) as d_update
		, ROW_NUMBER() OVER (ORDER BY $sort $dir) as row FROM {$table}
		where $w and ISNULL(i_enable,".STATUS_DISABLE.") = ?";
 
		if($mode=="SEARCH"){ 
			if(isset($value) && $value !="")
			{ 
				$sqlTempTable .= " and ".$filter." like ?"; 
			}
			$sqlMain		= "select * from ({$sqlTempTable}) a WHERE a.row > ? and a.row <= ?"; 
			$arrParam 		=  array(STATUS_ENABLE, "%{$value}%", $start, $limit); 
			$arrCountParam 	=  array(STATUS_ENABLE, "%{$value}%");
 
		} else
		{
			$sqlMain		= "select * from ({$sqlTempTable}) a WHERE a.row > ? and a.row <= ?"; 
			$arrParam 		= array(STATUS_ENABLE, $start, $limit); 
			$arrCountParam 	= array(STATUS_ENABLE);
		}
 
		$stmt 	= $db->QueryParam($sqlMain, $arrParam);
		$i 		= $start + 1; 
		while($row =$db->Fetch($stmt))
		{
			
			$temp = array("no" => ($i++),
					"id" => $row["dc_acc_id"],
					"c_code" => $row["c_code"],
					"c_name" => $row["c_name"] 
			);
			${$root}[] = $temp;
		}
		$sqlCount 	= "select count(*) as totalCount from ({$sqlTempTable}) a";
		$totalCount = $db->GetDataBySQL($sqlCount, $arrCountParam);
		$debug		='storeAcc >>>';

}else if($_REQUEST['type'] == 'storeCostFormNoOrder') {
 
		###################  
 
		
		$table	= "dc_cost";
		$root	= "data";
		$data	= array();
		
		$sqlTempTable = "select dc_cost_id
		, c_code
		, c_name 
		,(select top 1 c_full_name from dc_user where dc_user_id={$table}.dc_user_create_id) as c_create_name
		,(select top 1 c_name from dc_cost where dc_cost_id={$table}.dc_user_create_cost_id) as c_cost_creat_name
		, convert(varchar, d_create, 120) as d_create
		,(select top 1 c_full_name from dc_user where dc_user_id={$table}.dc_user_update_id) as c_update_name
		,(select top 1 c_name from dc_cost where dc_cost_id={$table}.dc_user_update_cost_id) as c_cost_update_name
		, convert(varchar, [d_update], 120) as d_update
		, ROW_NUMBER() OVER (ORDER BY $sort $dir) as row FROM {$table}
		where i_last=1 and ISNULL(i_enable,".STATUS_ENABLE.") = ?";

		if($mode=="SEARCH"){
 			if(isset($value) && $value !="")
			{ 
				$sqlTempTable .= " and ".$filter." like ?"; 
			}
			$sqlMain		= "select * from ({$sqlTempTable}) a WHERE a.row > ? and a.row <= ?"; 
			$arrParam 		=  array(STATUS_ENABLE, "%{$value}%", $start, $limit); 
			$arrCountParam 	=  array(STATUS_ENABLE, "%{$value}%");
 
		} else
		{
			$sqlMain		= "select * from ({$sqlTempTable}) a WHERE a.row > ? and a.row <= ?"; 
			$arrParam 		= array(STATUS_ENABLE, $start, $limit); 
			$arrCountParam 	= array(STATUS_ENABLE);
		}
 
		$stmt 	= $db->QueryParam($sqlMain, $arrParam);
		$i 		= $start + 1;
		
 
			
		while($row =$db->Fetch($stmt))
		{
			
			$temp = array("no" => ($i++),
					"id" => $row["dc_cost_id"],
					"c_code" => $row["c_code"],
					"c_name" => $row["c_name"] 
			);
			${$root}[] = $temp;
		}
		$sqlCount 	= "select count(*) as totalCount from ({$sqlTempTable}) a";
		$totalCount = $db->GetDataBySQL($sqlCount, $arrCountParam);
		$debug		='storeCostFormNoOrder >>>';

}else if($_REQUEST['type'] == 'storeDebtor') {
 
		###################  
		$table	= "vw_dc_debtor";
		$root	= "data";
		$data	= array(); 
		$sqlTempTable = "select dc_debtor_id
		, c_title
		, c_code
		, c_name
        , c_address
		, c_telephone
		, c_mobile
		, c_fax
		, c_ref_value
		, c_tax_value
		, c_website
		, c_email
		, c_name_inv, c_address_inv, due_bill, condition_pay
 		,(select top 1 c_full_name from dc_user where dc_user_id={$table}.dc_user_create_id) as c_create_name
		,(select top 1 c_name from dc_cost where dc_cost_id={$table}.dc_user_create_cost_id) as c_cost_creat_name
		, convert(varchar, d_create, 120) as d_create
		,(select top 1 c_full_name from dc_user where dc_user_id={$table}.dc_user_update_id) as c_update_name
		,(select top 1 c_name from dc_cost where dc_cost_id={$table}.dc_user_update_cost_id) as c_cost_update_name
		, convert(varchar, [d_update], 120) as d_update
		, ROW_NUMBER() OVER (ORDER BY $sort $dir) as row FROM {$table}
		where ISNULL(i_enable,".STATUS_ENABLE.") = ?";
		/* echo $sqlTempTable; exit; */
		if($mode=="SEARCH"){
			
 			if(isset($value) && $value !="")
			{ 
				$sqlTempTable .= " and ".$filter." like ?"; 
			}
			$sqlMain		= "select * from ({$sqlTempTable}) a WHERE a.row > ? and a.row <= ?"; 
			$arrParam 		=  array(STATUS_ENABLE, "%{$value}%", $start, $limit); 
			$arrCountParam 	=  array(STATUS_ENABLE, "%{$value}%");
 
		} else
		{
			$sqlMain		= "select * from ({$sqlTempTable}) a WHERE a.row > ? and a.row <= ?"; 
			$arrParam 		= array(STATUS_ENABLE, $start, $limit); 
			$arrCountParam 	= array(STATUS_ENABLE);
		}
 
		$stmt 	= $db->QueryParam($sqlMain, $arrParam);
		$i 		= $start + 1;
		
			if(isset($_REQUEST['all'])){ 
				${$root}[] = array("no" => 0,
						"id" 		=> -1,
						"c_code" 	=> "",
						"c_name" 	=> "ทั้งหมด" 
				);
			}
			
		while($row =$db->Fetch($stmt))
		{
			/*, , , , */
			$temp = array("no" => ($i++),
					"id"                    => $row["dc_debtor_id"],
					"c_title"               => $row["c_title"],
					"c_code"                => $row["c_code"],
					"c_name"                => $row["c_name"],
                    "c_address"             => $row["c_address"],
					"c_telephone"           => $row["c_telephone"],
					"c_mobile" 		=> $row["c_mobile"],
					"c_fax" 		=> $row["c_fax"],
					"c_website" 		=> $row["c_website"],
					"c_email" 				=> $row["c_email"],
					"c_name_inv"           	=> $row["c_name_inv"],
					"c_address_inv"       	=> $row["c_address_inv"],
					"due_bill"           	=> $row["due_bill"],
					"condition_pay"         => $row["condition_pay"],
					"c_tax_value"           => $row["c_tax_value"],
                 
					"c_ref_value"           => $row["c_ref_value"] 
			);
			
			${$root}[] = $temp;
		}
		$sqlCount 	= "select count(*) as totalCount from ({$sqlTempTable}) a";
		$totalCount = $db->GetDataBySQL($sqlCount, $arrCountParam);
		$debug		='storeDebtor >>>';
 
}else if($_REQUEST['type'] == 'storeBank') {
 
		###################  
		$table	= "dc_bank";
		$root	= "data";
		$data	= array();
		
		$sqlTempTable = "select dc_bank_id
		, c_code
		, c_name 
		,(select top 1 c_full_name from dc_user where dc_user_id={$table}.dc_user_create_id) as c_create_name
		,(select top 1 c_name from dc_cost where dc_cost_id={$table}.dc_user_create_cost_id) as c_cost_creat_name
		, convert(varchar, d_create, 120) as d_create
		,(select top 1 c_full_name from dc_user where dc_user_id={$table}.dc_user_update_id) as c_update_name
		,(select top 1 c_name from dc_cost where dc_cost_id={$table}.dc_user_update_cost_id) as c_cost_update_name
		, convert(varchar, [d_update], 120) as d_update
		, ROW_NUMBER() OVER (ORDER BY $sort $dir) as row FROM {$table}
		where i_enable = 1 and ISNULL(i_delete,".DELETE_FALSE.") = ?";
		
		if($mode=="SEARCH"){ 
			if(isset($value) && $value !="")
			{ 
				$sqlTempTable .= " and ".$filter." like ?"; 
			}
			$sqlMain		= "select * from ({$sqlTempTable}) a WHERE a.row > ? and a.row <= ?"; 
			$arrParam 		=  array(DELETE_FALSE, "%{$value}%", $start, $limit); 
			$arrCountParam 	=  array(DELETE_FALSE, "%{$value}%");
 
		} else
		{
			$sqlMain		= "select * from ({$sqlTempTable}) a WHERE a.row > ? and a.row <= ?"; 
			$arrParam 		= array(DELETE_FALSE, $start, $limit); 
			$arrCountParam 	= array(DELETE_FALSE);
		}
 
		$stmt 	= $db->QueryParam($sqlMain, $arrParam);
		$i 		= $start + 1;
		

		while($row =$db->Fetch($stmt))
		{
			
			$temp = array("no" => ($i++),
					"id" 		=> $row["dc_bank_id"],
					"c_code" 	=> $row["c_code"],
					"c_name" 	=> $row["c_name"] 
			);
			${$root}[] = $temp;
		}
		$sqlCount 	= "select count(*) as totalCount from ({$sqlTempTable}) a";
		$totalCount = $db->GetDataBySQL($sqlCount, $arrCountParam);
		$debug		='storeBank >>>';
 
 
}else if($_REQUEST['type'] == 'storeBg') {
 
		###################
		$table	= "bg_hdr";
		$root	= "data";
		$data	= array();
		if(isset($_REQUEST['i_year'])){
			$i_year = $_REQUEST['i_year'];
		}else{
			$i_year = date("Y")+543; // Now Buddha
		}
	    
	 
		$sqlTempTable = "select bg_hdr_id
		, c_code
		, c_name 
		,(select top 1 c_full_name from dc_user where dc_user_id={$table}.dc_user_create_id) as c_create_name
		,(select top 1 c_name from dc_cost where dc_cost_id={$table}.dc_user_create_cost_id) as c_cost_creat_name
		, convert(varchar, d_create, 120) as d_create
		,(select top 1 c_full_name from dc_user where dc_user_id={$table}.dc_user_update_id) as c_update_name
		,(select top 1 c_name from dc_cost where dc_cost_id={$table}.dc_user_update_cost_id) as c_cost_update_name
		, convert(varchar, [d_update], 120) as d_update
		, ROW_NUMBER() OVER (ORDER BY $sort $dir) as row FROM {$table}
		where c_code like 'PJ%' and i_is_success = 1 and dc_bg_type_id = 2  and i_enable = 1
		and bg_hdr_id in(
				 select bg_hdr_id from bg_dtl 
					where i_year between ? and ?
					and (i_parent_status in (0,1) or i_parent_status is null))
		";
 
		if($mode=="SEARCH"){ 
			if(isset($value) && $value !="")
			{ 
				$sqlTempTable .= " and ".$filter." like ?"; 
			}
			$sqlMain		= "select * from ({$sqlTempTable}) a WHERE a.row > ? and a.row <= ?"; 
			$arrParam 		=  array($i_year-1,$i_year,"%{$value}%", $start, $limit); 
			$arrCountParam 	=  array($i_year-1,$i_year,"%{$value}%");

		} else
		{
			$sqlMain		= "select * from ({$sqlTempTable}) a WHERE a.row > ? and a.row <= ?"; 
			$arrParam 		= array($i_year-1,$i_year,$start, $limit); 
			$arrCountParam 	= array($i_year-1,$i_year);
		}
 
		$stmt 	= $db->QueryParam($sqlMain, $arrParam);
		$i 		= $start + 1;
		while($row =$db->Fetch($stmt))
		{
			$sql	= $db->GetDataBySQL("select b.c_name as cost_name,c.c_name as obj_name,d.c_name as cap_name,a.*
													from bg_hdr a left join dc_cost b
														on a.dc_cost_id = b.dc_cost_id left join dc_bg_object c
														on a.dc_bg_obj_id = c.dc_bg_obj_id left join dc_bg_capital d
														on a.dc_bg_cap_id = d.dc_bg_cap_id
													where bg_hdr_id =?",array($row["bg_hdr_id"]));	
			$yy		= $db->GetDataBySQL("select min(i_year) as i_year_start
												,max(i_year) as i_year_end 
											from bg_dtl
											where bg_hdr_id = ?",array($row["bg_hdr_id"]));
											
			$f_amount	= number_format($sql["f_begin_amount"],2);
			$f_res		= number_format($sql["f_bg_reserve"],2);
			$sum_bg		= number_format(($sql["f_begin_amount"] + $sql["f_bg_reserve"]),2);
			$obj_name	= (empty($sql["obj_name"]))? "ไม่มีข้อมูล" : $sql["obj_name"];
			$cap_name	= (empty($sql["cap_name"]))? "ไม่มีข้อมูล" : $sql["cap_name"];

 										
			$temp = array("no" => ($i++),
					"id" => $row["bg_hdr_id"],
					"c_code" => $row["c_code"],
					"c_name" => $row["c_name"],
					
					"cost_id" 	=> $sql["dc_cost_id"],
					"cost_name" => $sql["cost_name"],
					"f_amount" 	=> $f_amount,
					"f_res" 	=> $f_res,
					"sum_bg" 	=> $sum_bg, 
					"obj_name" 	=> $obj_name,
					"dc_bg_obj_id" => $sql["dc_bg_obj_id"],
					"dc_bg_cap_id" => $sql["dc_bg_cap_id"], 
					"cap_name" 	=> $cap_name,
					"i_import" 	=> $sql["i_is_import"], 
					"i_start" 	=> $yy["i_year_start"],
					"i_end" 	=> $yy["i_year_end"]
					
			);
			${$root}[] = $temp;
		}
		$sqlCount 	= "select count(*) as totalCount from ({$sqlTempTable}) a";
		$totalCount = $db->GetDataBySQL($sqlCount, $arrCountParam);
		$debug		='storeBg >>>';
}else if($_REQUEST['type'] == 'storeBgDtl') {
 
		###################
		$table	= "bg_dtl";
		$root	= "data";
		$data	= array();
		 
	    
		
	$sqlTempTable = "select bg_dtl_id
		, c_name 
		,(select top 1 c_full_name from dc_user where dc_user_id={$table}.dc_user_create_id) as c_create_name
		,(select top 1 c_name from dc_cost where dc_cost_id={$table}.dc_user_create_cost_id) as c_cost_creat_name
		, convert(varchar, d_create, 120) as d_create
		,(select top 1 c_full_name from dc_user where dc_user_id={$table}.dc_user_update_id) as c_update_name
		,(select top 1 c_name from dc_cost where dc_cost_id={$table}.dc_user_update_cost_id) as c_cost_update_name
		, convert(varchar, [d_update], 120) as d_update
		, ROW_NUMBER() OVER (ORDER BY c_name $dir) as row FROM {$table}
		where  bg_hdr_id = ? and i_year=? and i_is_expense='-1' ";
/*  select bg_dtl_id,c_name from bg_dtl where bg_hdr_id = '$po_hdr[bg_hdr_id]' and i_year='$po_hdr[i_year]' and is_expense='-1' */
		if($mode=="SEARCH"){ 
			if(isset($value) && $value !="")
			{ 
				$sqlTempTable .= " and ".$filter." like ?"; 
			}
			$sqlMain		= "select * from ({$sqlTempTable}) a WHERE a.row > ? and a.row <= ?"; 
			$arrParam 		=  array($_REQUEST['bg_hdr_id'],$_REQUEST['i_year'],"%{$value}%", $start, $limit); 
			$arrCountParam 	=  array($_REQUEST['bg_hdr_id'],$_REQUEST['i_year'],"%{$value}%");

		} else
		{
			$sqlMain		= "select * from ({$sqlTempTable}) a WHERE a.row > ? and a.row <= ?"; 
			$arrParam 		= array($_REQUEST['bg_hdr_id'],$_REQUEST['i_year'],$start, $limit); 
			$arrCountParam 	= array($_REQUEST['bg_hdr_id'],$_REQUEST['i_year'],);
		}

		
		$stmt 	= $db->QueryParam($sqlMain, $arrParam);
		$i 		= $start + 1;
		while($row =$db->Fetch($stmt))
		{
 
 
		$bg	= $db->GetDataBySQL("select a.f_unit_cost,a.bg_hdr_id,b.per_bg_reserve 
								from bg_dtl 
								a inner join bg_hdr b on a.bg_hdr_id=b.bg_hdr_id where a.bg_dtl_id=?"
								,array($row['bg_dtl_id']));
								
		$sum_user_budget	= $db->GetDataBySQL("select isnull(sum(a.f_amt_begin),0) as f_amt_begin 
							from ap_po_dtl a 
							inner join ap_po_hdr b on a.ap_po_hdr_id = b.ap_po_hdr_id 
							where a.bg_dtl_id = ?
							and b.i_enable = 1",array($row['bg_dtl_id']));
		
		
		
	
 

 	$bud_amt			= $bg['f_unit_cost'];
	$per_bg				= (empty($bg['per_bg_reserve']))? 0 : $bg['per_bg_reserve'];
	$amt_res			= $mon->round54(($bud_amt*$per_bg)/100,4);
	$sum_bud			= $bud_amt + $amt_res;
	$sum_user			= $sum_user_budget;
	$balance_budget		= $sum_bud - $sum_user;
 
 										
			$temp = array("no" => ($i++),
					"id" 				=> $row["bg_dtl_id"], 
					"c_name" 			=> $row["c_name"], 
					"amt_budget" 		=> number_format($bud_amt,2),
					"amt_reserve" 		=> number_format($amt_res,2),
					"sum_budget" 		=> number_format($sum_bud,2),
					"sum_user_budget" 	=> number_format($sum_user,2),
					"balance_budget" 	=> number_format($balance_budget,2), 
					"per_bg" 			=> $per_bg,
					"chk_budget" 		=> null,
					"chk_reserve" 		=> null,
					"chk_user_budget" 	=> null 
					
			);
			${$root}[] = $temp;
		}
		$sqlCount 	= "select count(*) as totalCount from ({$sqlTempTable}) a";
		$totalCount = $db->GetDataBySQL($sqlCount, $arrCountParam);
		$debug		='storeBgDtl >>>';
 
 
}else if($_REQUEST['type'] == 'storeApProcessType') {
 
		$sqlMain	= " SELECT ap_process_type_id , c_name
							FROM ap_process_type
						WHERE i_delete = ?
							AND i_enable=? 
						ORDER by c_name";
		$arrParam	= array(DELETE_FALSE, STATUS_ENABLE);
		$stmt = $db->QueryParam($sqlMain, $arrParam);
		if($stmt){
			while($row =$db->Fetch($stmt))
			{
				$temp = array("id" => $row["ap_process_type_id"] ,
						"c_name"=> $row["c_name"]);
				${$root}[] = $temp;
			}
		}
	$debug='storeApProcessType >>>';  
	
}else if($_REQUEST['type'] == 'storeTax') {
	
	$sqlMain	= "select dc_tax_id 
						, c_code
						, c_name
						, isnull(f_tax_rate,0) as f_tax_rate
						, isnull(i_type_whtax,0) as i_type_whtax 
					from dc_tax
					where i_group_tax=? and i_delete =? and i_enable = ?
					order by dc_tax_id
				";
	$arrParam	= array(2,DELETE_FALSE, STATUS_ENABLE); 
	$stmt = $db->QueryParam($sqlMain, $arrParam);
	$i=0;
	if($stmt){
		while($row =$db->Fetch($stmt))
		{   $i++;
			$temp = array("id" => $row["dc_tax_id"]
						, "c_code" => $row["c_code"]
						, "f_tax_rate" => $row["f_tax_rate"]
						, "i_type_whtax" => $row["i_type_whtax"]
						, "c_name" => $row["c_name"]
	
			);
			${$root}[] = $temp;
		}
	}
	$totalCount = $i;
	$debug='storeTax >>>'; 
	
}else if($_REQUEST['type'] == 'storeDcInv') {
	
	$sqlMain	= "select i.dc_inv_type_id 
						, i.c_code
						, i.c_name 
						, u.c_name as dc_unit_type_name
						, u.dc_unit_type_id
					from dc_inv_type i 
					inner join dc_unit_type u on i.dc_unit_type_id=u.dc_unit_type_id 
 
					where i.i_is_last=1 
							and i.i_delete = ? 
							and i.i_enable = ?
					and i.c_code like '".ASSET_INV."%' order by i.c_name asc
				"; 
	$arrParam	= array(DELETE_FALSE, STATUS_ENABLE); 
	$stmt = $db->QueryParam($sqlMain, $arrParam);
	$i=0;
	if($stmt){
		while($row =$db->Fetch($stmt))
		{   $i++;
			$temp = array("id" 					=> $row["dc_inv_type_id"]
						, "c_code" 				=> $row["c_code"]
						, "c_name" 				=> $row["c_name"]   
						, "dc_unit_type_name" 	=> $row["dc_unit_type_name"]   
						, "dc_unit_type_id" 	=> $row["dc_unit_type_id"]   
			);
			${$root}[] = $temp;
		}
	}
	$totalCount = $i;
	$debug='storeDcInv >>>'; 	
}else if($_REQUEST['type'] == 'storeUnitType') {
	
	$sqlMain	= "select dc_unit_type_id 
						, c_code
						, c_name 
					from dc_unit_type
					where i_delete =? and i_enable = ?
					order by c_name
				";
	$arrParam	= array(DELETE_FALSE, STATUS_ENABLE); 
	$stmt = $db->QueryParam($sqlMain, $arrParam);
	$i=0;
	if($stmt){
		while($row =$db->Fetch($stmt))
		{   $i++;
			$temp = array("id" => $row["dc_unit_type_id"]
						, "c_code" => $row["c_code"]
						, "c_name" => $row["c_name"]  
			);
			${$root}[] = $temp;
		}
	}
	$totalCount = $i;
	$debug='storeUnitType >>>'; 	
  
}else if($_REQUEST['type'] == 'storeBgType') {
	$sqlMain	= "SELECT a.dc_bg_type_id , a.c_name
						FROM dc_bg_type a
						WHERE a.i_delete = ?
								AND a.i_enable=?
						ORDER BY a.c_name";
	$arrParam	= array(DELETE_FALSE, STATUS_ENABLE);
	$stmt = $db->QueryParam($sqlMain, $arrParam);
	if($stmt){
		${$root}[] = array("id" => "-1" , "c_name"=> "เลือกทั้งหมด");
		while($row =$db->Fetch($stmt))
		{
			$temp = array("id" => $row["dc_bg_type_id"] , "c_name"=> $row["c_name"]);
			${$root}[] = $temp;
		}
	}
	$debug='storeCapital >>>';

}else if($_REQUEST['type'] == 'storePoContract') {
 		###################  
		$table	= "ap_po_hdr";
		$root	= "data";
		$data	= array();
		$dir2 	= "DESC"; 
		$sort2 	= "c_po_no"; 
	
		$sqlTempTable = "select ap_po_hdr_id
		, c_code
		, c_po_no
		, isnull(c_contract_no,'-') as c_contract_no
		, c_name 
		,(select top 1 c_full_name from dc_user where dc_user_id={$table}.dc_user_create_id) as c_create_name
		,(select top 1 c_name from dc_cost where dc_cost_id={$table}.dc_user_create_cost_id) as c_cost_creat_name
		, convert(varchar, d_create, 120) as d_create
		,(select top 1 c_full_name from dc_user where dc_user_id={$table}.dc_user_update_id) as c_update_name
		,(select top 1 c_name from dc_cost where dc_cost_id={$table}.dc_user_update_cost_id) as c_cost_update_name
		, convert(varchar, [d_update], 120) as d_update
		, ROW_NUMBER() OVER (ORDER BY $sort2 $dir2) as row FROM {$table}
		where ISNULL(i_delete,".DELETE_FALSE.") = ? 
			and ISNULL(i_enable,1) = 1 
			and c_po_no is not null
		";
		
		if($mode=="SEARCH"){ 
			if(isset($value) && $value !="")
			{ 
				$sqlTempTable .= " and ".$filter." like ?"; 
			}
			$sqlMain		= "select * from ({$sqlTempTable}) a WHERE a.row > ? and a.row <= ?"; 
			$arrParam 		=  array(DELETE_FALSE, "%{$value}%", $start, $limit); 
			$arrCountParam 	=  array(DELETE_FALSE, "%{$value}%");
 
		} else
		{
			$sqlMain		= "select * from ({$sqlTempTable}) a WHERE a.row > ? and a.row <= ?"; 
			$arrParam 		= array(DELETE_FALSE, $start, $limit); 
			$arrCountParam 	= array(DELETE_FALSE);
		}
 
		$stmt 	= $db->QueryParam($sqlMain, $arrParam);
		$i 		= $start + 1;
		while($row =$db->Fetch($stmt))
		{
			
			$temp = array("no" => ($i++),
					"id" => $row["ap_po_hdr_id"],
					"c_code" => $row["c_po_no"],
					"c_contract_no" => $row["c_contract_no"],
					"c_name" => $row["c_name"] 
			);
			${$root}[] = $temp;
		}
		$sqlCount 	= "select count(*) as totalCount from ({$sqlTempTable}) a";
		$totalCount = $db->GetDataBySQL($sqlCount, $arrCountParam);
		$debug		='storePoContract >>>';
 
}else if($_REQUEST['type'] == 'dc_accs') {
	// dc_acc
	
	$acc_inv1 = "1108010101";
	$acc_inv2 = "1108010102";
	$ww_acc = " and c_code in ('".$acc_inv1."','".$acc_inv2."')";
	
	$sqlMain	= "SELECT * FROM dc_acc WHERE  i_last=1 AND i_delete = ? and i_enable=1 $ww_acc ORDER BY c_code";
	$arrParam	= array(DELETE_FALSE);
	$stmt = $db->QueryParam($sqlMain, $arrParam);
	if($stmt){
		${$root}[] = array(	"id"		=> '0',
							"c_name"	=> '- เลือกทั้งหมด -');
		while($row =$db->Fetch($stmt))
		{
			$temp = array(	"id"		=> $row["dc_acc_id"],
							"c_name"	=> $row["c_code"].' '.$row["c_name"] );
			${$root}[] = $temp;
		}
	}
} else if($_REQUEST['type'] == 'dc_costs') {
	// dc_cost
	$sqlMain	= "SELECT * FROM dc_cost WHERE i_last=1 AND i_delete = ?  and i_enable=1 ORDER BY c_code";
	$arrParam	= array(DELETE_FALSE);
	$stmt = $db->QueryParam($sqlMain, $arrParam);
	if($stmt){
		${$root}[] = array(	"id"		=> '0',
							"c_name"	=> '- เลือกทั้งหมด -');
		while($row =$db->Fetch($stmt))
		{
			$temp = array(	
							"id"		=> $row["dc_cost_id"],
							"c_name"	=> $row["c_name"]
						);
			${$root}[] = $temp;
		}
	}
}else if($_REQUEST['type'] == 'storePj') {
 
		###################  
		$table	= "pj_hdr";
		$root	= "data";
		$data	= array();
		
		$sqlTempTable = "select pj_hdr_id
		, c_code
		, c_name 
		,(select top 1 c_full_name from dc_user where dc_user_id={$table}.dc_user_create_id) as c_create_name
		,(select top 1 c_name from dc_cost where dc_cost_id={$table}.dc_user_create_cost_id) as c_cost_creat_name
		, convert(varchar, d_create, 120) as d_create
		,(select top 1 c_full_name from dc_user where dc_user_id={$table}.dc_user_update_id) as c_update_name
		,(select top 1 c_name from dc_cost where dc_cost_id={$table}.dc_user_update_cost_id) as c_cost_update_name
		, convert(varchar, [d_update], 120) as d_update
		, ROW_NUMBER() OVER (ORDER BY c_code DESC) as row FROM {$table}
		where c_code!='' and ISNULL(i_enable,".STATUS_ENABLE.") = ?";
		
		if($mode=="SEARCH"){ 
			if(isset($value) && $value !="")
			{ 
				$sqlTempTable .= " and ".$filter." like ?"; 
			}
			$sqlMain		= "select * from ({$sqlTempTable}) a WHERE a.row > ? and a.row <= ?"; 
			$arrParam 		=  array(STATUS_ENABLE, "%{$value}%", $start, $limit); 
			$arrCountParam 	=  array(STATUS_ENABLE, "%{$value}%");
 
		} else
		{
			$sqlMain		= "select * from ({$sqlTempTable}) a WHERE a.row > ? and a.row <= ?"; 
			$arrParam 		= array(STATUS_ENABLE, $start, $limit); 
			$arrCountParam 	= array(STATUS_ENABLE);
		}
 
		$stmt 	= $db->QueryParam($sqlMain, $arrParam);
		$i 		= $start + 1; 
		
		while($row =$db->Fetch($stmt))
		{
			
			$temp = array("no" => ($i++),
					"id" => $row["pj_hdr_id"],
					"c_code" => $row["c_code"],
					"c_name" => $row["c_name"] 
			);
			${$root}[] = $temp;
		}
		$sqlCount 	= "select count(*) as totalCount from ({$sqlTempTable}) a";
		$totalCount = $db->GetDataBySQL($sqlCount, $arrCountParam);
		$debug		='storePj >>>';
}else if($_REQUEST['type'] == 'storePackage') {
 
		###################  
		$table	= "ar_package";
		$root	= "data";
		$data	= array();
		
		$sqlTempTable = "select ar_package_id
		, c_code
		, c_name 
		,(select top 1 c_full_name from dc_user where dc_user_id={$table}.dc_user_create_id) as c_create_name
		,(select top 1 c_name from dc_cost where dc_cost_id={$table}.dc_user_create_cost_id) as c_cost_creat_name
		, convert(varchar, d_create, 120) as d_create
		,(select top 1 c_full_name from dc_user where dc_user_id={$table}.dc_user_update_id) as c_update_name
		,(select top 1 c_name from dc_cost where dc_cost_id={$table}.dc_user_update_cost_id) as c_cost_update_name
		, convert(varchar, [d_update], 120) as d_update
		, ROW_NUMBER() OVER (ORDER BY c_code DESC) as row FROM {$table}
		where c_code!='' and ISNULL(i_enable,".STATUS_ENABLE.") = ?";
		
		if($mode=="SEARCH"){ 
			if(isset($value) && $value !="")
			{ 
				$sqlTempTable .= " and ".$filter." like ?"; 
			}
			$sqlMain		= "select * from ({$sqlTempTable}) a WHERE a.row > ? and a.row <= ?"; 
			$arrParam 		=  array(STATUS_ENABLE, "%{$value}%", $start, $limit); 
			$arrCountParam 	=  array(STATUS_ENABLE, "%{$value}%");
 
		} else
		{
			$sqlMain		= "select * from ({$sqlTempTable}) a WHERE a.row > ? and a.row <= ?"; 
			$arrParam 		= array(STATUS_ENABLE, $start, $limit); 
			$arrCountParam 	= array(STATUS_ENABLE);
		}
 
		$stmt 	= $db->QueryParam($sqlMain, $arrParam);
		$i 		= $start + 1; 
		
		${$root}[] = array("no" => 0,
						"id" 		=> -1,
						"c_code" 	=> "",
						"c_name" 	=> "ไม่ระบุ" 
				);
				
		while($row =$db->Fetch($stmt))
		{
			
			$temp = array("no" => ($i++),
					"id" => $row["ar_package_id"],
					"c_code" => $row["c_code"],
					"c_name" => $row["c_name"] 
			);
			${$root}[] = $temp;
		}
		$sqlCount 	= "select count(*) as totalCount from ({$sqlTempTable}) a";
		$totalCount = $db->GetDataBySQL($sqlCount, $arrCountParam);
		$debug		='storePackage >>>';
}else if($_REQUEST['type'] == 'storeEmpCommit') {
 
		###################  
	
		###################  
		$table	= "vw_dc_comm_cost2";
		$root	= "data";
		$data	= array(); 
		$sqlTempTable = "select dc_comm_id
			, c_code
			, c_name 
			, position
			, i_is_tv
			, i_is_sale_ext
			,(select top 1 c_full_name from dc_user where dc_user_id={$table}.dc_user_create_id) as c_create_name
			,(select top 1 c_name from dc_cost where dc_cost_id={$table}.dc_user_create_cost_id) as c_cost_creat_name
			, convert(varchar, d_create, 120) as d_create
			,(select top 1 c_full_name from dc_user where dc_user_id={$table}.dc_user_update_id) as c_update_name
			,(select top 1 c_name from dc_cost where dc_cost_id={$table}.dc_user_update_cost_id) as c_cost_update_name
			, convert(varchar, [d_update], 120) as d_update
			, ROW_NUMBER() OVER (ORDER BY c_name $dir) as row FROM {$table}
			where 	isnull(i_enable,2)=1 
					and i_is_last= 1
					and i_is_tv = 1
					--and i_is_imc = 0
					and dc_comm_id in (select dc_comm_id from vw_dc_comm where support_status='1')					
					and i_is_sale_ext = ?";
	 
		if($mode=="SEARCH"){ 
			if(isset($value) && $value !="")
			{ 
				$sqlTempTable .= " and ".$filter." like ?"; 
			}
			$sqlMain		= "select * from ({$sqlTempTable}) a WHERE a.row > ? and a.row <= ?"; 
			$arrParam 		=  array(0, "%{$value}%", $start, $limit); 
			$arrCountParam 	=  array(0, "%{$value}%");
 
		} else
		{
			$sqlMain		= "select * from ({$sqlTempTable}) a WHERE a.row > ? and a.row <= ?"; 
			$arrParam 		= array(0, $start, $limit); 
			$arrCountParam 	= array(0);
		}
 
		$stmt 	= $db->QueryParam($sqlMain, $arrParam);
		$i 		= $start + 1;
		 
		while($row =$db->Fetch($stmt))
		{
			
			$temp = array("no" => ($i++),
				"id" 		=> $row["dc_comm_id"],
				"c_code" 	=> $row["c_code"],
				"i_is_tv" 	=> $row["i_is_tv"],
				"i_is_sale_ext" => $row["i_is_sale_ext"],
				"c_name" 	=> $row["c_name"]." ".$row["position"] 
			);
			${$root}[] = $temp;
		}
		$sqlCount 	= "select count(*) as totalCount from ({$sqlTempTable}) a";
		$totalCount = $db->GetDataBySQL($sqlCount, $arrCountParam);
		$debug		='storeEmpCommit >>>';
 
}else if($_REQUEST['type'] == 'storeExtCommit') {
 
		###################  
		$table	= "vw_dc_comm_cost2";
		$root	= "data";
		$data	= array(); 
		$sqlTempTable = "select dc_comm_id
			, c_code
			, c_name 
			, i_is_tv
			, i_is_sale_ext
			, position
			,(select top 1 c_full_name from dc_user where dc_user_id={$table}.dc_user_create_id) as c_create_name
			,(select top 1 c_name from dc_cost where dc_cost_id={$table}.dc_user_create_cost_id) as c_cost_creat_name
			, convert(varchar, d_create, 120) as d_create
			,(select top 1 c_full_name from dc_user where dc_user_id={$table}.dc_user_update_id) as c_update_name
			,(select top 1 c_name from dc_cost where dc_cost_id={$table}.dc_user_update_cost_id) as c_cost_update_name
			, convert(varchar, [d_update], 120) as d_update
			, ROW_NUMBER() OVER (ORDER BY c_name $dir) as row FROM {$table}
			where 	isnull(i_enable,2)=1 
					and i_is_last= 1
					and i_is_tv = 1
					and i_is_imc=0
					and dc_comm_id in (select dc_comm_id from vw_dc_comm where support_status='1')					
					and i_is_sale_ext = ?";
	 
		if($mode=="SEARCH"){ 
			if(isset($value) && $value !="")
			{ 
				$sqlTempTable .= " and ".$filter." like ?"; 
			}
			$sqlMain		= "select * from ({$sqlTempTable}) a WHERE a.row > ? and a.row <= ?"; 
			$arrParam 		=  array(1, "%{$value}%", $start, $limit); 
			$arrCountParam 	=  array(1, "%{$value}%");
 
		} else
		{
			$sqlMain		= "select * from ({$sqlTempTable}) a WHERE a.row > ? and a.row <= ?"; 
			$arrParam 		= array(1, $start, $limit); 
			$arrCountParam 	= array(1);
		}
 
		$stmt 	= $db->QueryParam($sqlMain, $arrParam);
		$i 		= $start + 1;
		 
		while($row =$db->Fetch($stmt))
		{
			
			$temp = array("no" => ($i++),
				"id" 		=> $row["dc_comm_id"],
				"c_code" 	=> $row["c_code"],
				"i_is_tv" 	=> $row["i_is_tv"],
				"i_is_sale_ext" => $row["i_is_sale_ext"],
				"c_name" 	=> $row["c_name"]." ".$row["position"]
			);
			${$root}[] = $temp;
		}
		$sqlCount 	= "select count(*) as totalCount from ({$sqlTempTable}) a";
		$totalCount = $db->GetDataBySQL($sqlCount, $arrCountParam);
		$debug		='storeExtCommit >>>';
}else if($_REQUEST['type'] == 'storeCont') {
 
		###################  
		$table	= "vw_bh_contract";
		$root	= "data";
		$data	= array();
		
		$sqlTempTable = "select bh_contract_id
		, c_code
		, c_name  
		, ROW_NUMBER() OVER (ORDER BY $sort $dir) as row FROM {$table}
		where dc_debtor_id = ?";
		
		if($mode=="SEARCH"){ 
			if(isset($value) && $value !="")
			{ 
				$sqlTempTable .= " and ".$filter." like ?"; 
			}
			$sqlMain		= "select * from ({$sqlTempTable}) a WHERE a.row > ? and a.row <= ?"; 
			$arrParam 		=  array($_REQUEST['id'], "%{$value}%", $start, $limit); 
			$arrCountParam 	=  array($_REQUEST['id'], "%{$value}%");
 
		} else
		{
			$sqlMain		= "select * from ({$sqlTempTable}) a WHERE a.row > ? and a.row <= ?"; 
			$arrParam 		= array($_REQUEST['id'], $start, $limit); 
			$arrCountParam 	= array($_REQUEST['id']);
		}
 
		$stmt 	= $db->QueryParam($sqlMain, $arrParam);
		$i 		= $start + 1;
		 
		while($row =$db->Fetch($stmt))
		{
			
			$temp = array("no" => ($i++),
					"id" => $row["bh_contract_id"],
					"c_code" => $row["c_code"],
					"c_name" => $row["c_name"] 
			);
			${$root}[] = $temp;
		}
		$sqlCount 	= "select count(*) as totalCount from ({$sqlTempTable}) a";
		$totalCount = $db->GetDataBySQL($sqlCount, $arrCountParam);
		$debug		='storeCont >>>';
 
}else if($_REQUEST['type'] == 'storePro') {
 
		###################  vw_dc_product
		$table	= "vw_dc_product";
		$root	= "data";
		$data	= array();
  
		
		$sqlTempTable = "select dc_product_id
			, c_code
			, c_name 
			, ROW_NUMBER() OVER (ORDER BY c_code DESC) as row FROM {$table}
		where isnull(i_enable,0) = ?";
		
		if($mode=="SEARCH"){ 
			if(isset($value) && $value !="")
			{ 
				$sqlTempTable .= " and ".$filter." like ?"; 
			}
			$sqlMain		= "select * from ({$sqlTempTable}) a WHERE a.row > ? and a.row <= ?"; 
			$arrParam 		=  array(STATUS_ENABLE, "%{$value}%", $start, $limit); 
			$arrCountParam 	=  array(STATUS_ENABLE, "%{$value}%");
 
		} else
		{
			$sqlMain		= "select * from ({$sqlTempTable}) a WHERE a.row > ? and a.row <= ?"; 
			$arrParam 		= array(STATUS_ENABLE,$start, $limit); 
			$arrCountParam 	= array(STATUS_ENABLE);
		}
 
		$stmt 	= $db->QueryParam($sqlMain, $arrParam);
		$i 		= $start + 1;
		 
		while($row =$db->Fetch($stmt))
		{
			
			$temp = array("no" => ($i++),
					"id" => $row["dc_product_id"],
					"c_code" => $row["c_code"],
					"c_name" => $row["c_name"] 
			);
			${$root}[] = $temp;
		}
		$sqlCount 	= "select count(*) as totalCount from ({$sqlTempTable}) a";
		$totalCount = $db->GetDataBySQL($sqlCount, $arrCountParam);
		$debug		='storePro >>>';
 
}else if($_REQUEST['type'] == 'storeProNoOrder') {
 
		###################  
		$table	= "vw_product";
		$root	= "data";
		$data	= array(); 
                
		$sqlTempTable = "select dc_product_id
			, c_code
			, c_name  
			, begin_time
			, end_time
			, ROW_NUMBER() OVER (ORDER BY c_name,begin_time,end_time DESC) as row FROM {$table}
		where isnull(i_enabled,0) = ? and i_class_type=? and i_group_type=?";
		
		if($mode=="SEARCH"){ 
			if(isset($value) && $value !="")
			{ 
				$sqlTempTable .= " and ".$filter." like ?"; 
			}
			$sqlMain		= "select * from ({$sqlTempTable}) a WHERE a.row > ? and a.row <= ?"; 
			$arrParam 		=  array(1,1,$_REQUEST['dc_product_type_id'], "%{$value}%", $start, $limit); 
			$arrCountParam 	=  array(1,1,$_REQUEST['i_group_type'], "%{$value}%");
 
		} else
		{
			$sqlMain		= "select * from ({$sqlTempTable}) a WHERE a.row > ? and a.row <= ?"; 
			$arrParam 		= array(1,1,$_REQUEST['dc_product_type_id'], $start, $limit); 
			$arrCountParam 	= array(1,1,$_REQUEST['dc_product_type_id']);
		}
 
		$stmt 	= $db->QueryParam($sqlMain, $arrParam);
		$i 		= $start + 1;
		 
		while($row =$db->Fetch($stmt))
		{
			
			$temp = array("no" => ($i++),
					"id" => $row["dc_product_id"],
					"c_code" => $row["c_code"],
					"c_name" => $row["c_name"] 
			);
			${$root}[] = $temp;
		}
		$sqlCount 	= "select count(*) as totalCount from ({$sqlTempTable}) a";
		$totalCount = $db->GetDataBySQL($sqlCount, $arrCountParam);
		$debug		='storeProNoOrder >>>';
 
}else if($_REQUEST['type'] == 'storeProRo') {
 
		###################  
		$table	= "vw_product";
		$root	= "data";
		$data	= array();
  
		$i_is_barter =(isset($_REQUEST['order_type']) && $_REQUEST['order_type']=='i_is_barter')?"i_is_barter=1 AND":"";
		
		$sqlTempTable = "select dc_product_id
			, c_code
			, c_name  
			, begin_time
			, end_time
			, ROW_NUMBER() OVER (ORDER BY c_name,begin_time,end_time DESC) as row FROM {$table}
		where {$i_is_barter} isnull(i_enabled,0) = ? and i_class_type=?  and i_group_type =? and dc_cost_id=?";
		
		if($mode=="SEARCH"){ 
			if(isset($value) && $value !="")
			{ 
				$sqlTempTable .= " and ".$filter." like ?"; 
			}
			$sqlMain		= "select * from ({$sqlTempTable}) a WHERE a.row > ? and a.row <= ?"; 
			$arrParam 		=  array(1,2,$_REQUEST['i_group_type'],$_REQUEST['dc_cost_id'], "%{$value}%", $start, $limit); 
			$arrCountParam 	=  array(1,2,$_REQUEST['i_group_type'],$_REQUEST['dc_cost_id'], "%{$value}%");
 
		} else
		{
			$sqlMain		= "select * from ({$sqlTempTable}) a WHERE a.row > ? and a.row <= ?"; 
			$arrParam 		= array(1,2,$_REQUEST['i_group_type'],$_REQUEST['dc_cost_id'], $start, $limit); 
			$arrCountParam 	= array(1,2,$_REQUEST['i_group_type'],$_REQUEST['dc_cost_id']);
		}
 
		$stmt 	= $db->QueryParam($sqlMain, $arrParam);
		$i 		= $start + 1;
		 
		while($row =$db->Fetch($stmt))
		{
			
			$temp = array("no" => ($i++),
					"id" => $row["dc_product_id"],
					"c_code" => $row["c_code"],
					"c_name" => $row["c_name"] 
			);
			${$root}[] = $temp;
		}
		$sqlCount 	= "select count(*) as totalCount from ({$sqlTempTable}) a";
		$totalCount = $db->GetDataBySQL($sqlCount, $arrCountParam);
		$debug		='storeProRo >>>';
}else if($_REQUEST['type'] == 'storeProRoPart') {
 
		###################  
		$table	= "vw_product";
		$root	= "data";
		$data	= array();
  
		//$i_is_barter =(isset($_REQUEST['order_type']) && $_REQUEST['order_type']=='i_is_barter')?"i_is_barter=1 AND":"";
		//and i_group_type ='1' and region_type !='1' 
		$sqlTempTable = "select dc_product_id
			, c_code
			, c_name  
			, begin_time
			, end_time
			, ROW_NUMBER() OVER (ORDER BY c_name,begin_time,end_time DESC) as row FROM {$table}
		where isnull(i_enabled,2) = ? and i_class_type=? and i_group_type =? and region_type !=1 ";
		
		if($mode=="SEARCH"){ 
			if(isset($value) && $value !="")
			{ 
				$sqlTempTable .= " and ".$filter." like ?"; 
			}
			$sqlMain		= "select * from ({$sqlTempTable}) a WHERE a.row > ? and a.row <= ?"; 
			$arrParam 		=  array(1,2,$_REQUEST['i_group_type'], "%{$value}%", $start, $limit); 
			$arrCountParam 	=  array(1,2,$_REQUEST['i_group_type'], "%{$value}%");
 
		} else
		{
			$sqlMain		= "select * from ({$sqlTempTable}) a WHERE a.row > ? and a.row <= ?"; 
			$arrParam 		= array(1,2,$_REQUEST['i_group_type'], $start, $limit); 
			$arrCountParam 	= array(1,2,$_REQUEST['i_group_type']);
		}
 
		$stmt 	= $db->QueryParam($sqlMain, $arrParam);
		$i 		= $start + 1;
		 
		while($row =$db->Fetch($stmt))
		{
			
			$temp = array("no" => ($i++),
					"id" => $row["dc_product_id"],
					"c_code" => $row["c_code"],
					"c_name" => $row["c_name"] 
			);
			${$root}[] = $temp;
		}
		$sqlCount 	= "select count(*) as totalCount from ({$sqlTempTable}) a";
		$totalCount = $db->GetDataBySQL($sqlCount, $arrCountParam);
		$debug		='storeProRoPart >>>';
 
}else if($_REQUEST['type'] == 'storeSoCnt') {
 
		###################  
		$table	= "vw_ar_adjust_order";
		$root	= "data";
		$data	= array();
   
		$sqlTempTable = "select ar_so_hdr_id
			, c_code
			, c_name 
			, ROW_NUMBER() OVER (ORDER BY c_code DESC) as row FROM {$table}
		where isnull(i_enable,2)=1 and i_class_type=2 and i_type_region=1 and dc_cost_id =?";
		
		if($mode=="SEARCH"){ 
			if(isset($value) && $value !="")
			{ 
				$sqlTempTable .= " and ".$filter." like ?"; 
			}
			$sqlMain		= "select * from ({$sqlTempTable}) a WHERE a.row > ? and a.row <= ?"; 
			$arrParam 		=  array($_REQUEST['dc_cost_id'], "%{$value}%", $start, $limit); 
			$arrCountParam          =  array($_REQUEST['dc_cost_id'], "%{$value}%");
 
		} else
		{
			$sqlMain		= "select * from ({$sqlTempTable}) a WHERE a.row > ? and a.row <= ?"; 
			$arrParam 		= array($_REQUEST['dc_cost_id'], $start, $limit); 
			$arrCountParam          = array($_REQUEST['dc_cost_id']);
		}
 
		$stmt 	= $db->QueryParam($sqlMain, $arrParam);
		$i 		= $start + 1;
		 
		while($row =$db->Fetch($stmt))
		{
			
			$temp = array("no" => ($i++),
					"id" => $row["ar_so_hdr_id"],
					"c_code" => $row["c_code"],
					"c_name" => $row["c_name"] 
			);
			${$root}[] = $temp;
		}
		$sqlCount 	= "select count(*) as totalCount from ({$sqlTempTable}) a";
		$totalCount = $db->GetDataBySQL($sqlCount, $arrCountParam);
		$debug		='storeSoCnt >>>';
 
}else if($_REQUEST['type'] == 'storeSoCntPart') {
 
		###################  
		$table	= "vw_ar_adjust_order";
		$root	= "data";
		$data	= array();
   
		$sqlTempTable = "select ar_so_hdr_id
			, c_code
			, c_name 
			, ROW_NUMBER() OVER (ORDER BY c_code DESC) as row FROM {$table}
		where isnull(i_enable,2)=".STATUS_ENABLE
                                ." and i_class_type=".AR_CLASS_TYPE_RADIO
                                ." and i_type_region=".AR_PROCUT_TYPE_REGION
                                ." and dc_cost_id =?";
		
		if($mode=="SEARCH"){ 
			if(isset($value) && $value !="")
			{ 
				$sqlTempTable .= " and ".$filter." like ?"; 
			}
			$sqlMain		= "select * from ({$sqlTempTable}) a WHERE a.row > ? and a.row <= ?"; 
			$arrParam 		=  array($_REQUEST['dc_cost_id'], "%{$value}%", $start, $limit); 
			$arrCountParam          =  array($_REQUEST['dc_cost_id'], "%{$value}%");
 
		} else
		{
			$sqlMain		= "select * from ({$sqlTempTable}) a WHERE a.row > ? and a.row <= ?"; 
			$arrParam 		= array($_REQUEST['dc_cost_id'], $start, $limit); 
			$arrCountParam          = array($_REQUEST['dc_cost_id']);
		}
 
		$stmt 	= $db->QueryParam($sqlMain, $arrParam);
		$i 		= $start + 1;
		 
		while($row =$db->Fetch($stmt))
		{
			
			$temp = array("no" => ($i++),
					"id" => $row["ar_so_hdr_id"],
					"c_code" => $row["c_code"],
					"c_name" => $row["c_name"] 
			);
			${$root}[] = $temp;
		}
		$sqlCount 	= "select count(*) as totalCount from ({$sqlTempTable}) a";
		$totalCount = $db->GetDataBySQL($sqlCount, $arrCountParam);
		$debug		='storeSoCntPart >>>';
 
}else if($_REQUEST['type'] == 'typeProductStore') {
 
	$sqlMain = "select distinct t.dc_product_type_id
                            ,t.c_code
                            ,t.c_name
                    from ar_so_hdr h 
                    inner join ar_so_dtl d on d.ar_so_hdr_id=h.ar_so_hdr_id
                    inner join dc_product p on p.dc_product_id=d.dc_product_id
                    inner join dc_product_type t on t.dc_product_type_id=p.dc_product_type_id
                    where  h.ar_so_hdr_id=? and d.i_enable=1
                    and d.ar_so_dtl_id not in(
						select f.ar_so_dtl_id from ar_bill_invoice_dtl f
						inner join ar_bill_invoice_hdr h on h.ar_bill_invoice_hdr_id=f.ar_bill_invoice_hdr_id 
						where isnull(h.c_code,'0') !='0' and isnull(h.i_enable,2)=1  
					)";
        
	$arrParam	= array($_REQUEST['ar_so_hdr_id']); 
	$stmt = $db->QueryParam($sqlMain, $arrParam);
	$i=0;
        ${$root}[] = array("id" => -1,
                            "c_code" 	=> "",
                            "c_name" 	=> "-- กรุณาเลือกประเภทรายได้ --" 
            );
	if($stmt){
		while($row =$db->Fetch($stmt))
		{   $i++;
			$temp = array("id" => $row["dc_product_type_id"]
						, "c_code" => $row["c_code"] 
						, "c_name" => $row["c_name"]
	
			);
			${$root}[] = $temp;
		}
	}
	$totalCount = $i;
	$debug='typeProductStore >>>'; 
	
}else if($_REQUEST['type'] == 'typeProductClassStore') {
 
	$sqlMain = "select distinct t.dc_product_class_id
                            ,t.c_code
                            ,t.c_name
                    from dc_product_class t
		  where t.i_enable=? Order by t.c_code";
        
	$arrParam	= array(1); 
	$stmt = $db->QueryParam($sqlMain, $arrParam);
	$i=0;
        ${$root}[] = array("id" => -1,
                            "c_code" 	=> "",
                            "c_name" 	=> "-- กรุณาเลือกหมวดรายได้ --" 
            );
	if($stmt){
		while($row =$db->Fetch($stmt))
		{   $i++;
			$temp = array("id" => $row["dc_product_class_id"]
						, "c_code" => $row["c_code"] 
						, "c_name" => $row["c_name"]
	
			);
			${$root}[] = $temp;
		}
	}
	
	$totalCount = $i;
	$debug='typeProductClassStore >>>'; 
	
}else if($_REQUEST['type'] == 'storeProType') {
  
		###################  
		$table	= "dc_product_group";
		$root	= "data";
		$data	= array();
   
		$sqlTempTable = "SELECT b.c_name, b.c_code, 
                        {$table}.c_name AS c_name1, 
                        c.c_name AS c_name2, 
                        b.dc_product_type_id, 
                        b.i_is_comm,  
                        b.i_class_type,
                        b.region_type 
                    , ROW_NUMBER() OVER (ORDER BY b.c_code ASC) as row     
                    FROM {$table} 
                    INNER JOIN dc_product_type b ON {$table}.dc_product_group_id = b.dc_product_group_id
                    INNER JOIN dc_product_class c ON {$table}.dc_product_class_id = c.dc_product_class_id
                    WHERE b.i_enable=? ";
		
		if($mode=="SEARCH"){ 
			if(isset($value) && $value !="")
			{ 
				$sqlTempTable .= " and b.".$filter." like ?"; 
			}
			$sqlMain		= "select * from ({$sqlTempTable}) a WHERE a.row > ? and a.row <= ?"; 
			$arrParam 		=  array(STATUS_ENABLE, "%{$value}%", $start, $limit); 
			$arrCountParam          =  array(STATUS_ENABLE, "%{$value}%");
// echo $sqlMain; print_R($arrParam);
		} else
		{
			$sqlMain		= "select * from ({$sqlTempTable}) a WHERE a.row > ? and a.row <= ?"; 
			$arrParam 		= array(STATUS_ENABLE, $start, $limit); 
			$arrCountParam          = array(STATUS_ENABLE);
		}
 
		$stmt 	= $db->QueryParam($sqlMain, $arrParam);
		$i 		= $start + 1;
		if(isset($_REQUEST['all'])){ 
				${$root}[] = array("no" => 0,
						"id" 		=> -1,
						"c_code" 	=> "",
						"c_name" 	=> "ทั้งหมด" 
				);
			}
			 
		while($row =$db->Fetch($stmt))
		{
			
			$temp = array("no" => ($i++),
					"id" => $row["dc_product_type_id"],
					"c_code" => $row["c_code"],
					"c_name" => $row["c_name1"]." ".$row["c_name"] 
			);
			${$root}[] = $temp;
		}
		$sqlCount 	= "select count(*) as totalCount from ({$sqlTempTable}) a";
		$totalCount = $db->GetDataBySQL($sqlCount, $arrCountParam);
		$debug		='storeProType >>>';
}else if($_REQUEST['type'] == 'DcPeriod') {
 
	$sqlMain = "select dc_period_id
					, c_name
				from vw_dc_period t
				where t.i_enable=? Order by t.c_name";
        
	$arrParam	= array(1); 
	$stmt = $db->QueryParam($sqlMain, $arrParam);
	$i=0;
        ${$root}[] = array("id" => -1,
                            "c_name" 	=> "-- กรุณาเลือกรอบ --" 
            );
	if($stmt){
		while($row =$db->Fetch($stmt))
		{   
			$i++;
			$temp = array("id" => $row["dc_period_id"]
						, "c_name" => $row["c_name"]
			);
			${$root}[] = $temp;
		}
	}
	
	$totalCount = $i;
	$debug='DcPeriod >>>'; 
}else if($_REQUEST['type'] == 'DcReceivePoint') {
 
	$sqlMain = "select dc_receive_point_id
					, c_name
				from vw_dc_receive_point t
				where t.i_enable=? Order by t.c_name";
        
	$arrParam	= array(1); 
	$stmt = $db->QueryParam($sqlMain, $arrParam);
	$i=0;
        ${$root}[] = array("id" => -1,
                            "c_name" 	=> "-- กรุณาเลือกจุดรับเงิน --" 
            );
	if($stmt){
		while($row =$db->Fetch($stmt))
		{   
			$i++;
			$temp = array("id" => $row["dc_receive_point_id"]
						, "c_name" => $row["c_name"]
			);
			${$root}[] = $temp;
		}
	}
	
	$totalCount = $i;
	$debug='DcReceivePoint >>>'; 
}
echo json_encode(array("success"=>true, "debug"=>$debug,"totalCount"=>$totalCount, $root=>(isset(${$root}) && ${$root}!=null)?${$root}:''));
exit;
?>
