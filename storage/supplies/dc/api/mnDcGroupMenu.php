<?php
include("../../conf/config.php");
include("../../lib/database/DatabaseServer.php");
$db = new DatabaseServer();

$table 			= "dc_menu_hdr";
$keyName 		= "dc_menu_hdr_id";
$table_dtl		= "dc_menu_dtl";

$mod = isset($_REQUEST['mode']) && !empty($_REQUEST['mode'])?$_REQUEST['mode']:null;
$id = isset($_REQUEST['id']) && !empty($_REQUEST['id'])?$_REQUEST['id']:null;

function fn_save_dc_menu_dtl($db,$dc_menu_hdr_id,$data_dtl,$fld_dtl,$table_dtl)
{
	$check_detail = true;
	if (  ($dc_menu_hdr_id>0) && (is_array($data_dtl) && count($data_dtl)>0 ))
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
				$addValueDTL 	.= ",(";
				$c_str 			= "";
				foreach($fld_dtl as $value)
				{
					$c_str .= ", ?";
					if (!empty($jObj[$value]))
					{
						$arrParamDTL[] = $jObj[$value];
					}
					else if($value == "dc_menu_hdr_id")
					{
						$arrParamDTL[] = $dc_menu_hdr_id;
					}
					else 
					{
						$arrParamDTL[] = "0";
					}
				
				}
				$addValueDTL .= substr($c_str,1).")";
			}
		}

		$addValueDTL	= substr($addValueDTL,1);

		if ($addValueDTL != "")
		{
			$sql_dtl = "INSERT INTO {$table_dtl} (".substr($addFieldDTL, 1).") VALUES ".$addValueDTL.";";
			$stmt2 = $db->QueryParam($sql_dtl, $arrParamDTL);
				
			if ($stmt2)
				$check_detail = true;
		}
	}
	return $check_detail;
}

if($mod=='Save'){
	$dc_menu_hdr_id = $id;
	
	$data 		= $_REQUEST;
 	$jsonDtl 	= json_decode(@$data["jsonDtl"],true);

 	$data["i_delete"] 				= DELETE_FALSE;
 	$data["dc_user_create_id"]		= 1;
 	$data["dc_user_create_cost_id"] = 1;
 	$data["d_create"]				= date("Y-m-d H:i:s");
 	$data["dc_user_update_id"]		= 1;
 	$data["dc_user_update_cost_id"]	= 1;
 	$data["d_update"]				= date("Y-m-d H:i:s");
 	
 	$fld =  array("c_code"
					,"c_name"
					,"c_comment"
					,"i_enable"
					,"i_delete"
					,"dc_user_create_id"
					,"dc_user_create_cost_id"
					,"d_create"
					,"dc_user_update_id"
					,"dc_user_update_cost_id"
					,"d_update"
 	);
 	
 	$fld_dtl = array("dc_menu_hdr_id"
 					, "dc_menu_id"
		 			, "i_show"
		 			, "i_read_self"
		 			, "i_read_cost"
		 			, "i_read_all"
		 			, "i_per_add"
		 			, "i_per_update"
		 			, "i_per_delete"
 	);
 	
 	$db->BeginTran();
 	if ($dc_menu_hdr_id > 0) // update
 	{
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
 		
 		$arrParam[] = $dc_menu_hdr_id;
 		$stmt = $db->QueryParam($sql, $arrParam);
 		
 		$sqlDelete = "DELETE FROM {$table_dtl} WHERE $keyName = ?;";
 		$isDelDtl = $db->QueryParam($sqlDelete,array($dc_menu_hdr_id));
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
 				$dc_menu_hdr_id = $dd_hdr["id_hdr"] ;
 					
 			}
 		}
 	}
 	
 	$chkDtl = fn_save_dc_menu_dtl($db,$dc_menu_hdr_id,$jsonDtl,$fld_dtl,$table_dtl);
 	
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
}
else if($mod == "DELETE")
{	
	$dc_menu_hdr_id = $id;
	$stmtHdr = $db->QueryParam("DELETE FROM {$table} WHERE $keyName = ?;",array($dc_menu_hdr_id));
	$stmtDtl = $db->QueryParam("DELETE FROM {$table_dtl} WHERE $keyName = ?;",array($dc_menu_hdr_id));
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
}
else if($mod=='right'){
	/* */
	
	$max_lenght = $db->GetDataBySQL("SELECT TOP 1 LEN(c_code) FROM dc_menu WHERE i_delete = ?", array(DELETE_FALSE));
	$temp_code = sprintf("%0".$max_lenght."d", 0);
	
	$strReal = "";
	$strParent = "";
	$strLv = "";
	for ($i=0; $i<($max_lenght/2);$i++)
	{
		$str0 = substr($temp_code, 0, ($max_lenght - ($i*2)));
		$strReal .= " WHEN RIGHT(mm.c_code, ".($max_lenght - ($i*2)).") = '".$str0."' then LEFT(mm.c_code, @max_lenght-".($max_lenght - ($i*2)).") ";
		$strParent .= " WHEN RIGHT(mm.c_code, ".($max_lenght - ($i*2)).") = '".$str0."' then LEFT(LEFT(mm.c_code, @max_lenght-(".($max_lenght - ($i*2))."+2))+@temp_code, @max_lenght) ";
		$strLv .= " WHEN RIGHT(mm.c_code, ".($max_lenght - ($i*2)).") = '".$str0."' then (@max_lenght-".($max_lenght - ($i*2)).")/2 ";
	}
	
	$sql = "DECLARE @max_lenght AS INT;
			DECLARE @temp_code AS VARCHAR(".$max_lenght.");
			DECLARE @iDelete AS TINYINT;
			SET @max_lenght = ".$max_lenght.";
			SET @temp_code = '".$temp_code."';
			SET @iDelete = ?;
					
			SELECT dc_menu_id
				, c_name
				, (SELECT dc_menu_id FROM dc_menu WHERE c_code =  a.parent_code AND i_delete=@iDelete) AS parent_id
				, i_level
				, CAST(_lft AS NUMERIC) AS _lft
				, (SELECT MAX(CAST(c_code AS NUMERIC))+CEILING(99/i_level) FROM dc_menu WHERE LEFT(c_code, LEN(a.real_code)) = a.real_code AND i_delete=@iDelete) AS _rgt
				, CASE WHEN (SELECT COUNT(dc_menu_id) FROM dc_menu WHERE LEFT(c_code, LEN(a.real_code)) = a.real_code AND i_delete=@iDelete) > 1 THEN 0 ELSE 1 END AS i_is_leaf
				, i_show
				, i_read_self
				, i_read_cost
				, i_read_all
				, i_per_add
				, i_per_update
				, i_per_delete
			FROM (SELECT mm.dc_menu_id
					, mm.c_code
					, mm.c_name
					, CASE ".$strReal." ELSE mm.c_code END AS real_code
					, CASE ".$strParent." ELSE mm.c_code END AS parent_code
					, CASE ".$strLv." ELSE @max_lenght/2 END AS i_level
					, mm.c_code AS _lft
					, ISNULL(dd.i_show,0) AS i_show
					, ISNULL(dd.i_read_self,0) AS i_read_self
					, ISNULL(dd.i_read_cost,0) AS i_read_cost
					, ISNULL(dd.i_read_all,0) AS i_read_all
					, ISNULL(dd.i_per_add,0) AS i_per_add
					, ISNULL(dd.i_per_update,0) AS i_per_update
					, ISNULL(dd.i_per_delete,0) AS i_per_delete
				FROM dc_menu mm
					LEFT JOIN dc_menu_dtl dd ON mm.dc_menu_id = dd.dc_menu_id AND dd.dc_menu_hdr_id = ?
				WHERE i_delete=@iDelete) a
		ORDER BY c_code";
	
	$stmt = $db->QueryParam($sql, array(DELETE_FALSE, $id));
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
				"i_per_add" 	=>$row["i_per_add"],
				"i_per_update" 	=>$row["i_per_update"],
				"i_per_delete" 	=>$row["i_per_delete"],
				);
		${$root}[] = $temp;
	}
	echo json_encode(array("success"=>true,"hdr_id"=>$_REQUEST['id'],"total"=>$i,$root=>${$root}));
	exit();
}
?>