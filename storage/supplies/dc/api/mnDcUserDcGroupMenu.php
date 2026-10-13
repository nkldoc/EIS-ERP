<?php
include("../../conf/config.php");
include("../../lib/database/DatabaseServer.php");
$db = new DatabaseServer();

$table 			= "dc_menu_hdr";
$keyName 		= "dc_menu_hdr_id";
$table_dtl		= "dc_menu_dtl";

$mod = isset($_REQUEST['mode']) && !empty($_REQUEST['mode'])?$_REQUEST['mode']:null;
$id = isset($_REQUEST['id']) && !empty($_REQUEST['id'])?$_REQUEST['id']:null;
$groupId = isset($_REQUEST['groupId']) && !empty($_REQUEST['groupId'])?$_REQUEST['groupId']:null;
$saveGroupMenu =  $_REQUEST['saveGroupMenu']??false;
$dc_user_manu_load = isset($_REQUEST['dc_user_manu_load']) && !empty($_REQUEST['dc_user_manu_load'])?$_REQUEST['dc_user_manu_load']:null;
 
if($saveGroupMenu){
	//print_r($_POST); exit();
    $root	= "data";
		$idx = $_POST['dc_user_id']??0;
		$menu_hdr_id = $_POST['groupId']??0;  //  
 
	 $arrParamDTL1 = array(); 
	 $arrParamDTL1[]= $menu_hdr_id; //menu_hdr_id
	 $arrParamDTL1[]= $idx; //userid
	//echo $sql_dtl; print_r($arrParamDTL); exit;

	 $stmt = $db->QueryParam("update dbo.dc_user set dc_menu_hdr_id=? where dc_user_id=?", $arrParamDTL1); 
	 echo json_encode(array("success"=>true,"hdr_id"=>$menu_hdr_id,"total"=>1,$root=>null));
	 exit();
	 }else if($mod=='right'){
 
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
	
	if ($groupId > 0)
	{
		$strTableRight = "left join dc_menu_dtl dd on mm.dc_menu_id = dd.dc_menu_id and dd.dc_menu_hdr_id = ?";
		$id = $groupId;
	}
	else if ($dc_user_manu_load > 0){
		$strTableRight = "left join dc_user_menu dd on mm.dc_menu_id = dd.dc_menu_id and dd.dc_user_id = ?";
		$id = $dc_user_manu_load;
	}
	else 
		$strTableRight = "left join dc_user_menu dd on mm.dc_menu_id = dd.dc_menu_id and dd.dc_user_id = ?";

	$sql = "DECLARE @max_lenght AS INT;
			DECLARE @temp_code AS VARCHAR(".$max_lenght.");
			DECLARE @iDelete AS TINYINT;
			SET @max_lenght = ".$max_lenght.";
			SET @temp_code = '".$temp_code."';
			SET @iDelete = ?;
			
			select dc_menu_id
				, c_name
				, (SELECT dc_menu_id FROM dc_menu WHERE c_code =  a.parent_code AND i_delete=@iDelete) AS parent_id
				, i_level
				, CAST(_lft AS bigint) AS _lft
				, (SELECT MAX(CAST(c_code AS bigint))+CEILING(99/i_level) FROM dc_menu WHERE LEFT(c_code, LEN(a.real_code)) = a.real_code AND i_delete=@iDelete) AS _rgt
				, CASE WHEN (SELECT COUNT(dc_menu_id) FROM dc_menu WHERE LEFT(c_code, LEN(a.real_code)) = a.real_code AND i_delete=@iDelete) > 1 THEN 0 ELSE 1 END AS i_is_leaf
				, i_show
				, i_read_self
				, i_read_cost
				, i_read_all
				, i_per_add
				, i_per_update
				, i_per_delete
			from (select mm.dc_menu_id
				, mm.c_code
				, mm.c_name
				, CASE ".$strReal." ELSE mm.c_code END AS real_code
				, CASE ".$strParent." ELSE mm.c_code END AS parent_code
				, CASE ".$strLv." ELSE @max_lenght/2 END AS i_level
				, mm.c_code as _lft
				, isnull(dd.i_show,0) as i_show
				, isnull(dd.i_read_self,0) as i_read_self
				, isnull(dd.i_read_cost,0) as i_read_cost
				, isnull(dd.i_read_all,0) as i_read_all
				, isnull(dd.i_per_add,0) as i_per_add
				, isnull(dd.i_per_update,0) as i_per_update
				, isnull(dd.i_per_delete,0) as i_per_delete
				from dc_menu mm
					{$strTableRight}
				where i_delete=@iDelete AND i_enable = 1) a
		order by c_code";

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
	echo json_encode(array("success"=>true,"hdr_id"=>@$_REQUEST['id'],"total"=>$i,$root=>${$root}));
	exit();
}
?>