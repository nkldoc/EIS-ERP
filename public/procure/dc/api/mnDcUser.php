<?php
include("../../conf/config.php");
include("../../lib/database/DatabaseServer.php");
include("../../lib/date/i_date.class.php");
$db = new DatabaseServer();

//TODO
$table 			= "dc_user";
$keyName 		= "dc_user_id";
$table_dtl		= "dc_user_menu";

$mod = isset($_REQUEST['mode']) && !empty($_REQUEST['mode'])?$_REQUEST['mode']:null;
$id = isset($_REQUEST['id']) && !empty($_REQUEST['id'])?$_REQUEST['id']:null;

function fn_save_dc_menu_dtl($db,$dc_user_id,$data_dtl,$fld_dtl,$table_dtl)
{
	$check_detail = true;
	$idx = $_POST['id']??0;
	$menu_hdr_id = $_POST['menu_hdr_id']??0;
	if (  ($dc_user_id>0) && (is_array($data_dtl) && count($data_dtl)>0 ))
	{
		$check_detail = false;
		$arrParamDTL = array();
		$addFieldDTL = "";
		$addValueDTL = "";
		foreach($fld_dtl as $value)
		{
			$addFieldDTL .= ", {$value}";
		}
		foreach($data_dtl as $key => $jObj)
		{
			if ($jObj["i_show"])
			{
				$addValueDTL 	= "(";
				$c_str 			= "";
				foreach($fld_dtl as $value)
				{
					$c_str .= ", ?";
					if (!empty($jObj[$value]))
					{
						$arrParamDTL[] = $jObj[$value];
					}
					else if($value == "dc_user_id")
					{
						$arrParamDTL[] = $dc_user_id;
					}
					else
					{
						$arrParamDTL[] = "0";
					}

				}
				$addValueDTL .= substr($c_str,1).")";

				$sql_dtl = "INSERT INTO {$table_dtl} (".substr($addFieldDTL, 1).") VALUES ".$addValueDTL.";";
				$stmt2 = $db->QueryParam($sql_dtl, $arrParamDTL);
				unset($arrParamDTL);

				if ($stmt2)
					$check_detail = true;
				else{
					$check_detail = false;
					break;
				}
			}
		}

 
	}
	return $check_detail;
}

$mode = $_POST['mode']??null;
$idx = $_POST['id']??0;
$menu_hdr_id = $_POST['menu_hdr_id']??0;

if($mode==="UPDATEMENU" && $idx>0){

	$sql_dtl = "DECLARE @userid as bigint; SET @userid = ?; 
				DECLARE @menuid as bigint; SET @menuid = ?;  
				DELETE FROM dbo.dc_user_menu  where dc_user_id =@userid;   
				INSERT INTO dbo.dc_user_menu ([dc_user_id]
					,[dc_menu_hdr_id]
					,[dc_menu_id]
					,[i_show]
					,[i_read_self]
					,[i_read_cost]
					,[i_read_all]
					,[i_read_overall]
					,[i_per_add]
					,[i_per_update]
					,[i_per_delete])
				SELECT @userid
					,[dc_menu_hdr_id]
					,[dc_menu_id]
					,[i_show]
					,[i_read_self]
					,[i_read_cost]
					,[i_read_all]
					,[i_read_overall]
					,[i_per_add]
					,[i_per_update]
					,[i_per_delete]
				FROM [NMU].[dbo].[dc_menu_dtl] where dc_menu_hdr_id=@menuid;";
	$arrParamDTL = array();				
	$arrParamDTL[]= $idx; //userid
	$arrParamDTL[]= $menu_hdr_id; //menu_hdr_id
  //echo $sql_dtl; print_r($arrParamDTL); exit;
	$stmt = $db->QueryParam($sql_dtl, $arrParamDTL); 
 	if ($stmt)
 	{
 		$db->CommitTran();
 		$re = array(
 				"reval"			=> 0,
 				"success"		=> "Success",
 				"msg"			=> "commit"
 		);
 	}
 	else
 	{
 		$db->RollBackTran();
 		$re = array(
 				"reval"			=> 1,
 				"success"		=> "Error",
 				"msg"			=> "check statement : {$sql}"
 		);
 	}
	echo json_encode($re);
	exit;

} else if($mod=='Save'){
 //print_r($_REQUEST); exit();
	$dc_user_id = $id;
	
	$data 		= $_REQUEST;
	$data["dc_emp_id"] = $data["emp_id"];
	
	if ($data["c_password"] != "")
		$data["c_password"] = md5($data["c_password"]);
	
 	$jsonDtl 	= json_decode(@$data["jsonDtl"],true);

 	$data["i_delete"] 				= DELETE_FALSE; 	
 	$data["dc_user_create_id"] = $_SESSION["user_id"];
 	$data["dc_user_create_cost_id"] = $_SESSION["dc_cost_id"];
 	$data["d_create"] = date("Y-m-d H:i:s");
 	$data["dc_user_update_id"] = $_SESSION["user_id"];
 	$data["dc_user_update_cost_id"] = $_SESSION["dc_cost_id"];
 	$data["d_update"] = date("Y-m-d H:i:s");
 	
 	$fld =  array("dc_emp_id"
					,"dc_cost_id"
					,"c_user_name"
		 			,"c_full_name"
		 			,"c_password"
		 			,"c_comment"
		 			,"i_type_user"
					,"i_enable"
					,"i_delete"
					,"dc_user_create_id"
					,"dc_user_create_cost_id"
					,"d_create"
					,"dc_user_update_id"
					,"dc_user_update_cost_id"
					,"d_update"
 	);
 	
 	$fld_dtl = array("dc_user_id"
 					, "dc_menu_id"
		 			, "i_show"
		 			, "i_read_self"
		 			, "i_read_cost"
		 			, "i_read_all"
		 			, "i_read_overall"
		 			, "i_per_add"
		 			, "i_per_update"
		 			, "i_per_delete"
 	);
 	
 	$db->BeginTran();
 	if ($dc_user_id > 0) // update
 	{
 		$arrParam = array();
 		$upField = "";
 		
 		if ($data["c_password"]=="") 
 		{ 
 			unset($data["c_password"]);
 		}
 		
 		foreach($fld as $value)
 		{
 			if (!empty($data[$value]))
 			{
 				$upField .= ", {$value} = ?";
 				$arrParam[] = $data[$value];
 			}
 		}
 		
 		$sql = "UPDATE {$table}
 		SET ".substr($upField, 1)."
 		WHERE {$keyName} = ?";
 		
 		$arrParam[] = $dc_user_id;
 		$stmt = $db->QueryParam($sql, $arrParam);
 		
 		$sqlDelete = "DELETE FROM {$table_dtl} WHERE $keyName = ?;";
 		$isDelDtl = $db->QueryParam($sqlDelete,array($dc_user_id));
 	}
 	else // insert
 	{
 		$arrParam = array();
 		$addField = "";
 		$addValue = "";
 		$isDelDtl = true;
 		
 		foreach($fld as $value)
 		{
 			if (!empty($data[$value]))
 			{
 				$addField .= ", {$value}";
 				$addValue .= ", ?";
 				$arrParam[] = $data[$value];
 			}
 		}
 		$sql = "INSERT INTO {$table} (".substr($addField, 1).") VALUES (".substr($addValue,1).");";
 		$sql.="SELECT @@IDENTITY as id_hdr";
 		$stmt = $db->QueryParam($sql, $arrParam);
 		if ($stmt)
 		{
 			$next_result = $db->NextResult($stmt);
 			if( $next_result ) {
 				$dd_hdr = $db->Fetch($stmt);
 				$dc_user_id = $dd_hdr["id_hdr"] ;
 					
 			}
 		}
 	}
 	
 	$chkDtl = fn_save_dc_menu_dtl($db,$dc_user_id,$jsonDtl,$fld_dtl,$table_dtl);


 	if ($stmt && $isDelDtl && $chkDtl)
 	{
 		$db->CommitTran();
 		$re = array(
 				"reval"			=> 0,
 				"success"		=> "Success",
 				"msg"			=> "commit"
 		);
 	}
 	else
 	{
 		$db->RollBackTran();
 		$re = array(
 				"reval"			=> 1,
 				"success"		=> "Error",
 				"msg"			=> "check statement : {$sql}"
 		);
 	}
	echo json_encode($re);
	exit;
}else if($mod == "DELETE")
{	
	$dc_user_id = $id;
	$stmtHdr = $db->QueryParam("DELETE FROM {$table} WHERE $keyName = ?;",array($dc_user_id));
	$stmtDtl = $db->QueryParam("DELETE FROM {$table_dtl} WHERE $keyName = ?;",array($dc_user_id));
	if ($stmtHdr && $stmtDtl)
 	{
 		$db->CommitTran();
 		$re = array(
 				"reval"			=> 0,
 				"success"		=> "Success",
 				"msg"			=> "commit"
 		);
 	}
 	else
 	{
 		$db->RollBackTran();
 		$re = array(
 				"reval"			=> 1,
 				"success"		=> "Error",
 				"msg"			=> "check statement : {$sql}"
 		);
 	}
	echo json_encode($re);
	exit;
}else if($mod=='right'){
	$sql = "select dc_menu_id
				, c_name
				, (select  dc_menu_id from dc_menu where REPLACE(c_code, '00', '') =  a.parent_code  and  i_delete=?) as parent_id  
				, i_level
				, cast(_lft as numeric) as _lft
				, (select max(cast(c_code as numeric))+ceiling(99/i_level) from dc_menu where left(c_code, len(REPLACE(a.c_code, '00', ''))) = REPLACE(a.c_code, '00', '')) as _rgt
				, case when (select count(dc_menu_id) from dc_menu where left(REPLACE(c_code, '00', ''), len(REPLACE(c_code, '00', ''))-2) = a.real_code) > 0 then 0 else 1 end as i_is_leaf
				, 1 as i_show
				, 1 as i_read_self
				, 1 as i_read_cost
				, 0 as i_read_all
				, 1 as i_add
				, 1 as i_update
				, 0 as i_delete
			from (select dc_menu_id
					, c_code
					, c_name
					, REPLACE(c_code, '00', '') as real_code
					, left(REPLACE(c_code, '00', ''), len(REPLACE(c_code, '00', ''))-2) as parent_code
					, (len(REPLACE(c_code, '00', ''))/2) as i_level
					, c_code as _lft
					from dc_menu where i_delete=?) a
			order by c_code";
	$stmt = $db->QueryParam($sql, array(DELETE_FALSE,DELETE_FALSE));
	$i = 0;
	$root	= "data";
	while($row =$db->Fetch($stmt))
	{
		$i++;
		$temp = array("_id" 	=> $row["dc_menu_id"],
				"dc_menu_id" 	=> $row["dc_menu_id"],
				"menu" 			=>$row["c_name"],
				"_parent" 		=>$row["parent_id"],
				"_level" 		=>$row["i_level"],
				"_lft" 			=>$row["_lft"],
				"_rgt" 			=>$row["_rgt"],
				"_is_leaf" 		=>$row["i_is_leaf"],
				"i_show" 		=>$row["i_show"],
				"i_read_self" 	=>$row["i_read_self"],
				"i_read_cost" 	=>$row["i_read_cost"],
				"i_read_all" 	=>$row["i_read_all"],
				"i_add" 		=>$row["i_add"],
				"i_update" 		=>$row["i_update"],
				"i_delete" 		=>$row["i_delete"],
				);
		${$root}[] = $temp;
	}
	echo json_encode(array("success"=>true,"total"=>$i,$root=>${$root}));

	return;
	exit();
}else{
		
	
//TODO
/* 	$mode		= $_REQUEST["mode"];
	$table 		= "dc_mon_unit";
	$keyName 	= "dc_mon_unit_id";d
	
	$data = $_REQUEST;
	$data["i_delete"] = DELETE_FALSE;
	$data["dc_user_create_id"] = 1;
	$data["dc_user_create_cost_id"] = 1;
	$data["d_create"] = date("Y-m-d");
	$data["dc_user_update_id"] = 1;
	$data["dc_user_update_cost_id"] = 1;
	$data["d_update"] = date("Y-m-d");
	
	$fld = array("c_code",
				"c_name",
				"f_amount",
				"i_decimal",
				"c_comment",
				"i_enable",
				"i_delete",
				"dc_user_create_id",
				"dc_user_create_cost_id",
				"d_create",
				"dc_user_update_id",
				"dc_user_update_cost_id",
				"d_update");
	
	switch ($mode) {
		case "ADD" : 
			$arrParam = array();		
			$addField = "";
			$addValue = "";
			foreach($fld as $value)
			{
				if (!empty($data[$value]))
				{
					$addField .= ", {$value}";
					$addValue .= ", ?";
					$arrParam[] = $data[$value];
				}
			}
			$sql = "INSERT INTO {$table} (".substr($addField, 1).") VALUES (".substr($addValue,1).")";
			//echo "<hr>$sql<hr>";  print_r($_REQUEST); exit;
		break;
		case "EDIT" :
			$arrParam = array();
			$upField = "";
			foreach($fld as $value)
			{
				if (!empty($data[$value]))
				{
					$upField .= ", {$value} = ?";
					$arrParam[] = $data[$value];
				}
			}
			$sql = "UPDATE {$table} 
						SET ".substr($upField, 1)."
					WHERE {$keyName} = ?";
			
			$arrParam[] = $data["id"];
		break;
		case "DELETE" : 
			$sql = "UPDATE {$table} 
						SET i_delete = ?
					WHERE {$keyName} = ?";
			$arrParam = array(DELETE_TRUE, $data["id"]);
		break;
	}
	
	$db->BeginTran();
	$stmt = $db->QueryParam($sql, $arrParam);
	if ($stmt)
	{
		$db->CommitTran();
		$re = array(
					"reval"			=> 0,
					"success"		=> "Success",
					"msg"			=> "commit"
				);
	}
	else
	{
		$db->RollBackTran();
		$re = array(
					"reval"			=> 1,
					"success"		=> "Error",
					"msg"			=> "check statement : {$sql}"
				);
	}
	
	echo json_encode($re);
	exit; */
	}
?>