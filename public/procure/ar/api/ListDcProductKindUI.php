<?php
include("../../conf/config.php");
include("../../lib/database/DatabaseServer.php");
include("../../lib/database/apiUtil.php");
include("../../lib/date/i_date.class.php");

###################
$db 	= new DatabaseServer();
$date 	= new i_date();
$util	= new apiUtil();
//print_r($_REQUEST);
############################################################################################################
$dc_product_kind_id = isset($_REQUEST['id']) && $_REQUEST['id']>0?$_REQUEST['id']:0;
$mode = isset($_REQUEST['mode'])?$_REQUEST['mode']:"";
################### 
$root	= "data";
$data = array();
################### 

switch ($mode)
{
	case "listGrid" :	
		$sql = "select a.dc_product_type_id
					, a.c_code 
					, a.c_name	
					, case when isnull(b.dc_product_type_id , 0) > 0 then 1 else 0 end i_chk
				from dc_product_type a
				left join dc_product_kind_dtl b on a.dc_product_type_id = b.dc_product_type_id and b.dc_product_kind_id = ?
				where a.i_delete = ? and a.i_enable = ? 
				order by i_chk desc, a.c_code";
		$arrParam = array($dc_product_kind_id, DELETE_FALSE, STATUS_ENABLE);
	
		$stmt = $db->QueryParam($sql, $arrParam);
		$i = 0;
		while($row =$db->Fetch($stmt))
		{
			$temp = array(
					"id" => $row["dc_product_type_id"],
					"c_code" => $row["c_code"],
					"c_name" => $row["c_name"],
					"i_chk" => $row["i_chk"]
			);
			${$root}[] = $temp;
			$i++;
		}
	break;
	default:
		${$root} = array();
		$i = 0;
	break;
}


echo json_encode(array("debug"=>true,"totalCount"=>$i,$root=>${$root}));


function get($a){ return isset($a) && !empty($a)?$a:null; }
?>