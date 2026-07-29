<?php
	include("../../conf/config.php");
	include("../../lib/database/DatabaseServer.php");
	include("../../lib/database/apiUtil.php");
	include("../../lib/date/i_date.class.php");
	include("../../lib/mon/mon.class.php");
 
	
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

 if ($_REQUEST['type'] == 'storeBank') {

     ###################  
		$table	= "dc_bank";
		$root	= "data";
		$data	= array();
		/* i_enable	i_main	i_delete	dc_user_create_id	dc_user_create_cost_id	d_create	dc_user_update_id	dc_user_update_cost_id	d_update */
     $sqlTempTable = "select dc_bank_id
		, c_code
		, c_name 
		,(select top 1 c_full_name from dc_user where dc_user_id={$table}.dc_user_create_id) as c_create_name
		,(select top 1 c_name from dc_cost where dc_cost_id={$table}.dc_user_create_cost_id) as c_cost_creat_name
		, convert(varchar, d_create, 120) as d_create
		,(select top 1 c_full_name from dc_user where dc_user_id={$table}.dc_user_update_id) as c_update_name
		,(select top 1 c_name from dc_cost where dc_cost_id={$table}.dc_user_update_cost_id) as c_cost_update_name
		, convert(varchar, d_update, 120) as d_update_dt
		, ROW_NUMBER() OVER (ORDER BY $sort $dir) as row FROM NMU_EIS.dbo.{$table}
		where i_enable = 1";

     if($mode=="SEARCH"){ 
			if(isset($value) && $value !="")
			{ 
				$sqlTempTable .= " and ".$filter." like ?"; 
			}
			$sqlMain		= "select * from ({$sqlTempTable}) a WHERE a.row > ? and a.row <= ?"; 
			$arrParam 		=  array("%{$value}%", $start, $limit); 
			$arrCountParam 	=  array("%{$value}%");
 
		} else
		{
			$sqlMain		= "select * from ({$sqlTempTable}) a WHERE a.row > ? and a.row <= ?"; 
			$arrParam 		= array($start, $limit); 
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
		,(select top 1 c_full_name from dc_user where dc_user_id={$table}.create_id) as c_create_name
		,(select top 1 c_name from dc_cost where dc_cost_id={$table}.create_org_id) as c_cost_creat_name
		, convert(varchar, t_create_dt, 120) as t_create_dt
		,(select top 1 c_full_name from dc_user where dc_user_id={$table}.update_id) as c_update_name
		,(select top 1 c_name from dc_cost where dc_cost_id={$table}.update_org_id) as c_cost_update_name
		, convert(varchar, [d_update_dt], 120) as d_update_dt
		, ROW_NUMBER() OVER (ORDER BY $sort $dir) as row FROM {$table}
		where c_code like 'PJ%' and i_is_success = 1 and dc_bg_type_id = 2  and i_enabled = 1
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
            }
 //storeCoppyPeriod
echo json_encode(array("success"=>true, "debug"=>$debug,"totalCount"=>$totalCount, $root=>(isset(${$root}) && ${$root}!=null)?${$root}:''));
exit;
 
