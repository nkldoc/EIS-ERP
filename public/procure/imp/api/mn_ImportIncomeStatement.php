<?php
include("../../conf/config.php");
include("../../lib/database/DatabaseServer.php");
include("../../lib/date/i_date.class.php");

$db		= new DatabaseServer();
$date 	= new i_date();

$root		= "data";
$data		= array();

$mode		= $_REQUEST["mode"];
$arrParam	= array();
$addField	= null;
$addValue	= null;
$arrValue	= array();

switch ( $mode ) {
	
	case "SAVE_STATEMENT" :
	
		$table	= "imp_receive_statement";
		
		$sql		= "DELETE {$table} WHERE imp_receive_hdr_id = ".$_REQUEST["hdr_id"]." and paidby = '".$_REQUEST["paidby"]."'; ";
		$para		= $db->QueryParam($sql, array());
		if($para) {
	
			$data_dtl	= json_decode(@$_REQUEST["data"], true);
			if(is_array($data_dtl) && count($data_dtl) > 0) {
				foreach($data_dtl as $index => $jObj) {

					$data["imp_receive_hdr_id"]		= $_REQUEST["hdr_id"];
					$data["paidby"]					= $_REQUEST["paidby"];
					$data["i_no"]					= $jObj["i_no"];
					$data["c_payin_no"]				= $jObj["c_payin_no"];
					$data["d_payin"]				= $jObj["d_payin"];
					$data["f_amount"]				= ($jObj["f_amount"] == "")? '0' : $jObj["f_amount"]; // Default value 0
					$data["c_comment"]				= $jObj["c_comment"];
	
					foreach($data as $fld => $val) {
						$arrValue[] = ($val != "")? $val : NULL;
						$addField .= ", {$fld}";
						$addValue .= ", ?";
					}
	
					$sql .= "INSERT INTO {$table} (".substr($addField, 1).") VALUES (".substr($addValue,1).");";
	
					// ============== //
					$addField	= null;
					$addValue	= null;
					unset ($data);
					// ============== //
				}
				$para	= $db->QueryParam($sql, $arrValue);
				
				// ============== //
				$addField	= null;
				$addValue	= null;
				unset ($data);
				unset ($arrValue);
				// ============== //
				
				if($para) {
					$re = array("id"		=> $_REQUEST["hdr_id"],
								"success"	=> true );
				} else {
					$re = array("success"	=> false );
				}
				echo json_encode($re);
				exit;
			}
		}

	break;
}
echo json_encode($re);
exit;
?>