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

if ($_REQUEST["type"] == "bill") {
	// เรียกเก็บ
	$ip_server = "http://202.29.154.208:3000/api/api_fin_arinvs";
	$field	= "lastdate";
	$table	= "ar_bill";
	$EXEC	= "SP_MOVE_TEMP_BILL_API";
	$SP		= "SP_AR_API_BILL_EPHIS";
} else if ($_REQUEST["type"] == "bill_cancel") {
	// ยกเลิกเรียกเก็บ
	$ip_server = "http://202.29.154.208:3000/api/api_fin_arinv_cancels";
	$field = "canceldate";
	$table	= "ar_bill_cancel";
	$EXEC	= "SP_MOVE_TEMP_BILL_CANCEL_API";
	$SP		= "SP_AR_API_BILL_CANCEL_EPHIS";
} else if ($_REQUEST["type"] == "cut") {
	// ตัดชำระ
	$ip_server = "http://202.29.154.208:3000/api/api_fin_arcuts";
	// $field	= "lastdate";
	$field	= "cutdate";
	$table	= "ar_cut";
	$EXEC	= "SP_MOVE_TEMP_CUT_API";
	$SP		= "SP_AR_API_CUT_EPHIS";
} else if ($_REQUEST["type"] == "cut_cancel") {
	// ยกเลิกตัดชำระ
	$ip_server = "http://202.29.154.208:3000/api/api_fin_arcut_cancels";
	$field	= "canceldate";
	$table	= "ar_cut_cancel";
	$EXEC	= "SP_MOVE_TEMP_CUT_CANCEL_API";
	$SP		= "SP_AR_API_CUT_CANCEL_EPHIS";
} else if ($_REQUEST["type"] == "receipt") {
	// ออกใบเสร็จ
	$ip_server = "http://202.29.154.208:3000/api/api_fin_rcpts";
	$field	= "rcptdate";
	$table	= "ar_receipt";
	$EXEC	= "SP_MOVE_TEMP_RECEIPT_API";
	$SP		= "SP_AR_API_RECEIPT_EPHIS";
}

function GetDataApi($obj)
{
	$headers = @get_headers($obj["url"], 1);

	// save data temp
	if ($headers[0] === "HTTP/1.1 200 OK") {
		$stream = @file_get_contents($obj["url"]);
		if ($stream) { // check stream
			$data = json_decode($stream, true);
			if ($_REQUEST["type"] == "bill") {
				// เรียกเก็บ
				$re = ar_bill_temp($data);
			} else if ($_REQUEST["type"] == "bill_cancel") {
				// ยกเลิกเรียกเก็บ
				$re = ar_bill_cancel_temp($data);
			} else if ($_REQUEST["type"] == "cut") {
				// ตัดชำระ
				$re = ar_cut_temp($data);
			} else if ($_REQUEST["type"] == "cut_cancel") {
				// ยกเลิกตัดชำระ
				$re = ar_cut_cancel_temp($data);
			} else if ($_REQUEST["type"] == "receipt") {
				// ออกใบเสร็จ
				$re = ar_receipt_temp($data);
			} else {
				return array(
					"success"					=> false,
				);
			}

			if ($re["success"] == true) {
				return array("success" => true);
			} else {
				return array(
					"success"					=> false,
					"msg"						=> "บันทึก temp ไม่ได้"
				);
			}
		} else {
			print_R($stream);
		}
	} else {
		return array(
			"success"					=> false,
			"msg"						=> "ไม่สามารถเชื่อมต่อ API ได้"
		);
	}
}

function moveDataApi($arr)
{
	global $db, $field, $EXEC, $SP, $table;

	$sql = "";

	// MOVE TEMP TO API
	foreach ($arr as $struct) {
		try {
			$sql = "
	        BEGIN TRANSACTION;
	        EXEC dbo.{$EXEC}
	            '{$struct["d_action_date"]}',
	            '{$field}',
	            '{$struct["url"]}';
	        COMMIT TRANSACTION;";
			$db->QueryParam($sql, array());
		} catch (Exception $e) {
			print_R($e);
			exit;
		}
	}

	// api to nmu ar hdr dtl
	$sql = "
		DECLARE @table VARCHAR(255) = '{$table}_api';
		DECLARE @date_start DATETIME = '{$_REQUEST["d_start"]} 00:00:00.000';
		DECLARE @date_end DATETIME = '{$_REQUEST["d_end"]} 23:59:59.000';
		DECLARE @field VARCHAR(50) = '{$field}';
		
		BEGIN TRANSACTION;
		BEGIN TRY
			EXEC dbo.SP_AR_MASTER_DATA @table,@field, @date_start, @date_end;
			EXEC dbo.{$SP} @field, @date_start, @date_end;
		END TRY
		BEGIN CATCH
			SELECT
				ERROR_NUMBER() AS ErrorNumber
				,ERROR_SEVERITY() AS ErrorSeverity
				,ERROR_STATE() AS ErrorState
				,ERROR_PROCEDURE() AS ErrorProcedure
				,ERROR_LINE() AS ErrorLine
				,ERROR_MESSAGE() AS ErrorMessage;
			IF @@TRANCOUNT > 0  
				ROLLBACK TRANSACTION;
		END CATCH;
		
		IF @@TRANCOUNT > 0  
			COMMIT TRANSACTION;";
	$db->QueryParam($sql, array());
	return true;
}

// เรียกเก็บ
function ar_bill_temp($obj)
{
	global $db;

	$arrParam    = array();
	$addField    = null;
	$addValue    = null;
	$arrValue    = array();

	// ใช้ชื่อฟิลด์เหมือน api
	try {
		foreach ($obj as $row) {
			// ============== //
			$addField    = null;
			$addValue    = null;
			unset($data);
			unset($arrValue);
			// ============== // 

			$data["glcode"]             = $row["glcode"];
			$data["glcode_name"]        = $row["glcode_name"];
			$data["pttype"]             = $row["pttype"];
			$data["pttype_name"]        = $row["pttype_name"];
			$data["claimlct"]           = $row["claimlct"];
			$data["claimlct_name"]      = $row["claimlct_name"];
			$data["hn"]                 = $row["hn"];
			$data["an"]                 = $row["an"];
			$data["pt_dspname"]         = $row["pt_dspname"];
			$data["vstdate"]            = ($row["vstdate"] != "") ? date("Y-m-d H:i:s", strtotime($row["vstdate"])) : "";
			$data["vsttime"]            = ($row["vsttime"] != "") ? (string)sprintf("%06d%", $row["vsttime"], "") : "";
			$data["indate"]             = ($row["indate"] != "") ? date("Y-m-d H:i:s", strtotime($row["indate"])) : "";
			$data["intime"]             = ($row["intime"] != "") ? (string)sprintf("%06d%", $row["intime"], "") : "";
			$data["invno"]              = $row["invno"];
			$data["invdate"]            = ($row["invdate"] != "") ? date("Y-m-d H:i:s", strtotime($row["invdate"])) : "";
			$data["invtime"]            = ($row["invtime"] != "") ? (string)sprintf("%06d%", $row["invtime"], "") : "";
			$data["incamt"]             = $row["incamt"];
			$data["invamt"]             = $row["invamt"];
			$data["rcptamt"]            = $row["rcptamt"];
			$data["dchdate"]            = ($row["dchdate"] != "") ? date("Y-m-d H:i:s", strtotime($row["dchdate"])) : "";
			$data["dchtime"]            = ($row["dchtime"] != "") ? (string)sprintf("%06d%", $row["dchtime"], "") : "";
			$data["lastdate"]           = ($row["lastdate"] != "") ? date("Y-m-d H:i:s", strtotime($row["lastdate"])) : "";
			$data["laststf"]	        = $row["laststf"];
			$data["lastname"]           = $row["lastname"];

			foreach ($data as $fld => $value) {
				$addValue .= ($value != "") ? ", '" . $value . "'" : ", null";
				$addField .= ", {$fld}";
			}

			$sql = "
                SET NOCOUNT ON
                INSERT INTO dbo.ar_bill_temp (" . substr($addField, 1) . ") VALUES (" . substr($addValue, 1) . ");
                SELECT @@IDENTITY as id;";

			$db->QueryParam($sql, array());
		}

		$re = array(
			"success"                    => true,
			"msg"                        => ""
		);
	} catch (Exception $e) {
		$re = array(
			"success"                    => false,
			"msg"                        => "error"
		);
	}

	return $re;
}

// ยกเลิกเรียกเก็บ
function ar_bill_cancel_temp($obj)
{
	global $db;

	$arrParam    = array();
	$addField    = null;
	$addValue    = null;
	$arrValue    = array();

	// ใช้ชื่อฟิลด์เหมือน api
	try {
		foreach ($obj as $row) {
			// ============== //
			$addField    = null;
			$addValue    = null;
			unset($data);
			unset($arrValue);
			// ============== // 

			$data["glcode"]             = $row["glcode"];
			$data["glcode_name"]        = $row["glcode_name"];
			$data["pttype"]             = $row["pttype"];
			$data["pttype_name"]        = $row["pttype_name"];
			$data["claimlct"]           = $row["claimlct"];
			$data["claimlct_name"]      = $row["claimlct_name"];
			$data["hn"]                 = $row["hn"];
			$data["an"]                 = $row["an"];
			$data["pt_dspname"]         = $row["pt_dspname"];
			$data["vstdate"]            = ($row["vstdate"] != "") ? date("Y-m-d H:i:s", strtotime($row["vstdate"])) : "";
			$data["vsttime"]            = ($row["vsttime"] != "") ? (string)sprintf("%06d%", $row["vsttime"], "") : "";
			$data["indate"]             = ($row["indate"] != "") ? date("Y-m-d H:i:s", strtotime($row["indate"])) : "";
			$data["intime"]             = ($row["intime"] != "") ? (string)sprintf("%06d%", $row["intime"], "") : "";
			$data["invno"]              = $row["invno"];
			$data["invdate"]            = ($row["invdate"] != "") ? date("Y-m-d H:i:s", strtotime($row["invdate"])) : "";
			$data["invtime"]            = ($row["invtime"] != "") ? (string)sprintf("%06d%", $row["invtime"], "") : "";
			$data["incamt"]             = $row["incamt"];
			$data["invamt"]             = $row["invamt"];
			$data["rcptamt"]            = $row["rcptamt"];
			$data["dchdate"]            = ($row["dchdate"] != "") ? date("Y-m-d H:i:s", strtotime($row["dchdate"])) : "";
			$data["dchtime"]            = ($row["dchtime"] != "") ? (string)sprintf("%06d%", $row["dchtime"], "") : "";
			$data["lastdate"]           = ($row["lastdate"] != "") ? date("Y-m-d H:i:s", strtotime($row["lastdate"])) : "";
			$data["laststf"]	        = $row["laststf"];
			$data["lastname"]           = $row["lastname"];
			$data["canceldate"]         = ($row["canceldate"] != "") ? date("Y-m-d H:i:s", strtotime($row["canceldate"])) : "";
			$data["cancelstf"]	        = $row["cancelstf"];
			$data["cancelname"]         = $row["cancelname"];

			foreach ($data as $fld => $value) {
				$addValue .= ($value != "") ? ", '" . $value . "'" : ", null";
				$addField .= ", {$fld}";
			}

			$sql = "
                SET NOCOUNT ON
                INSERT INTO dbo.ar_bill_cancel_temp (" . substr($addField, 1) . ") VALUES (" . substr($addValue, 1) . ");
                SELECT @@IDENTITY as id;";

			$db->QueryParam($sql, array());
		}

		$re = array(
			"success"                    => true,
			"msg"                        => ""
		);
	} catch (Exception $e) {
		$re = array(
			"success"                    => false,
			"msg"                        => "error"
		);
	}

	return $re;
}

// ตัดชำระ
function ar_cut_temp($obj)
{
	global $db;

	$arrParam    = array();
	$addField    = null;
	$addValue    = null;
	$arrValue    = array();

	// ใช้ชื่อฟิลด์เหมือน api
	try {
		foreach ($obj as $row) {

			// ============== //
			$addField    = null;
			$addValue    = null;
			unset($data);
			unset($arrValue);
			// ============== // 

			$data["glcode"]             = $row["glcode"];
			$data["glcode_name"]        = $row["glcode_name"];
			$data["pttype"]             = $row["pttype"];
			$data["pttype_name"]        = $row["pttype_name"];
			$data["claimlct"]           = $row["claimlct"];
			$data["claimlct_name"]      = $row["claimlct_name"];
			$data["hn"]                 = $row["hn"];
			$data["an"]                 = $row["an"];
			$data["pt_dspname"]         = $row["pt_dspname"];
			$data["vstdate"]            = ($row["vstdate"] != "") ? date("Y-m-d H:i:s", strtotime($row["vstdate"])) : "";
			$data["vsttime"]            = ($row["vsttime"] != "") ? (string)sprintf("%06d%", $row["vsttime"], "") : "";
			$data["indate"]             = ($row["indate"] != "") ? date("Y-m-d H:i:s", strtotime($row["indate"])) : "";
			$data["intime"]             = ($row["intime"] != "") ? (string)sprintf("%06d%", $row["intime"], "") : "";
			$data["invno"]              = $row["invno"];
			$data["invdate"]            = ($row["invdate"] != "") ? date("Y-m-d H:i:s", strtotime($row["invdate"])) : "";
			$data["invtime"]            = ($row["invtime"] != "") ? (string)sprintf("%06d%", $row["invtime"], "") : "";
			// $data["incamt"]             = $row["incamt"];
			$data["invamt"]             = $row["invamt"];
			// $data["rcptamt"]            = $row["rcptamt"];
			$data["dchdate"]            = ($row["dchdate"] != "") ? date("Y-m-d H:i:s", strtotime($row["dchdate"])) : "";
			$data["dchtime"]            = ($row["dchtime"] != "") ? (string)sprintf("%06d%", $row["dchtime"], "") : "";
			$data["cutno"]         		= $row["cutno"];
			$data["cutdate"]         	= ($row["cutdate"] != "") ? date("Y-m-d H:i:s", strtotime($row["cutdate"])) : "";
			$data["cuttime"]            = ($row["cuttime"] != "") ? (string)sprintf("%06d%", $row["cuttime"], "") : "";
			$data["cutamt"]         	= $row["cutamt"];
			$data["cutstf"]         	= $row["cutstf"];
			$data["cutname"]         	= $row["cutname"];
			$data["lastdate"]           = ($row["lastdate"] != "") ? date("Y-m-d H:i:s", strtotime($row["lastdate"])) : "";
			$data["laststf"]            = $row["laststf"];
			$data["lastname"]           = $row["lastname"];

			foreach ($data as $fld => $value) {
				$addValue .= ($value != "") ? ", '" . $value . "'" : ", null";
				$addField .= ", {$fld}";
			}

			$sql = "
                SET NOCOUNT ON
                INSERT INTO dbo.ar_cut_temp (" . substr($addField, 1) . ") VALUES (" . substr($addValue, 1) . ");
                SELECT @@IDENTITY as id;";

			$db->QueryParam($sql, array());
		}

		$re = array(
			"success"                    => true,
			"msg"                        => ""
		);
	} catch (Exception $e) {
		$re = array(
			"success"                    => false,
			"msg"                        => "error"
		);
	}

	return $re;
}

// ยกเลิกตัดชำระ
function ar_cut_cancel_temp($obj)
{
	global $db;

	$arrParam    = array();
	$addField    = null;
	$addValue    = null;
	$arrValue    = array();

	// ใช้ชื่อฟิลด์เหมือน api
	try {
		foreach ($obj as $row) {

			// ============== //
			$addField    = null;
			$addValue    = null;
			unset($data);
			unset($arrValue);
			// ============== // 

			$data["glcode"]             = $row["glcode"];
			$data["glcode_name"]        = $row["glcode_name"];
			$data["pttype"]             = $row["pttype"];
			$data["pttype_name"]        = $row["pttype_name"];
			$data["claimlct"]           = $row["claimlct"];
			$data["claimlct_name"]      = $row["claimlct_name"];
			$data["hn"]                 = $row["hn"];
			$data["an"]                 = $row["an"];
			$data["pt_dspname"]         = $row["pt_dspname"];
			$data["vstdate"]            = ($row["vstdate"] != "") ? date("Y-m-d H:i:s", strtotime($row["vstdate"])) : "";
			$data["vsttime"]            = ($row["vsttime"] != "") ? (string)sprintf("%06d%", $row["vsttime"], "") : "";
			$data["indate"]             = ($row["indate"] != "") ? date("Y-m-d H:i:s", strtotime($row["indate"])) : "";
			$data["intime"]             = ($row["intime"] != "") ? (string)sprintf("%06d%", $row["intime"], "") : "";
			$data["invno"]              = $row["invno"];
			$data["invdate"]            = ($row["invdate"] != "") ? date("Y-m-d H:i:s", strtotime($row["invdate"])) : "";
			$data["invtime"]            = ($row["invtime"] != "") ? (string)sprintf("%06d%", $row["invtime"], "") : "";
			// $data["incamt"]             = $row["incamt"];
			$data["invamt"]             = $row["invamt"];
			// $data["rcptamt"]            = $row["rcptamt"];
			$data["dchdate"]            = ($row["dchdate"] != "") ? date("Y-m-d H:i:s", strtotime($row["dchdate"])) : "";
			$data["dchtime"]            = ($row["dchtime"] != "") ? (string)sprintf("%06d%", $row["dchtime"], "") : "";
			$data["cutno"]         		= $row["cutno"];
			$data["cutdate"]         	= ($row["cutdate"] != "") ? date("Y-m-d H:i:s", strtotime($row["cutdate"])) : "";
			$data["cuttime"]            = ($row["cuttime"] != "") ? (string)sprintf("%06d%", $row["cuttime"], "") : "";
			$data["cutamt"]         	= $row["cutamt"];
			$data["cutstf"]         	= $row["cutstf"];
			$data["cutname"]         	= $row["cutname"];
			// $data["lastdate"]           = ($row["lastdate"] != "") ? date("Y-m-d H:i:s", strtotime($row["lastdate"])) : "";
			// $data["laststf"]            = $row["laststf"];
			// $data["lastname"]           = $row["lastname"];
			$data["canceldate"]         = ($row["canceldate"] != "") ? date("Y-m-d H:i:s", strtotime($row["canceldate"])) : "";
			$data["cancelstf"]	        = $row["cancelstf"];
			$data["cancelname"]         = $row["cancelname"];

			foreach ($data as $fld => $value) {
				$addValue .= ($value != "") ? ", '" . $value . "'" : ", null";
				$addField .= ", {$fld}";
			}

			$sql = "
                SET NOCOUNT ON
                INSERT INTO dbo.ar_cut_cancel_temp (" . substr($addField, 1) . ") VALUES (" . substr($addValue, 1) . ");
                SELECT @@IDENTITY as id;";

			$db->QueryParam($sql, array());
		}

		$re = array(
			"success"                    => true,
			"msg"                        => ""
		);
	} catch (Exception $e) {
		$re = array(
			"success"                    => false,
			"msg"                        => "error"
		);
	}

	return $re;
}

// ออกใบเสร็จ
function ar_receipt_temp($obj)
{
	global $db;

	$arrParam    = array();
	$addField    = null;
	$addValue    = null;
	$arrValue    = array();

	// ใช้ชื่อฟิลด์เหมือน api
	try {
		foreach ($obj as $row) {

			// ============== //
			$addField    = null;
			$addValue    = null;
			unset($data);
			unset($arrValue);
			// ============== // 

			$data["glcode"]             = $row["glcode"];
			$data["glcode_name"]        = $row["glcode_name"];
			$data["pttype"]             = $row["pttype"];
			$data["pttype_name"]        = $row["pttype_name"];
			$data["claimlct"]           = $row["claimlct"];
			$data["claimlct_name"]      = $row["claimlct_name"];
			$data["hn"]                 = $row["hn"];
			$data["an"]                 = $row["an"];
			$data["pt_dspname"]         = $row["pt_dspname"];
			$data["vstdate"]            = ($row["vstdate"] != "") ? date("Y-m-d H:i:s", strtotime($row["vstdate"])) : "";
			$data["vsttime"]            = ($row["vsttime"] != "") ? (string)sprintf("%06d%", $row["vsttime"], "") : "";
			$data["indate"]             = ($row["indate"] != "") ? date("Y-m-d H:i:s", strtotime($row["indate"])) : "";
			$data["intime"]             = ($row["intime"] != "") ? (string)sprintf("%06d%", $row["intime"], "") : "";
			$data["invno"]              = $row["invno"];
			$data["invdate"]            = ($row["invdate"] != "") ? date("Y-m-d H:i:s", strtotime($row["invdate"])) : "";
			$data["invtime"]            = ($row["invtime"] != "") ? (string)sprintf("%06d%", $row["invtime"], "") : "";
			// $data["incamt"]             = $row["incamt"];
			$data["invamt"]             = $row["invamt"];
			// $data["rcptamt"]            = $row["rcptamt"];
			$data["dchdate"]            = ($row["dchdate"] != "") ? date("Y-m-d H:i:s", strtotime($row["dchdate"])) : "";
			$data["dchtime"]            = ($row["dchtime"] != "") ? (string)sprintf("%06d%", $row["dchtime"], "") : "";
			$data["cutno"]         		= $row["cutno"];
			$data["cutdate"]         	= ($row["cutdate"] != "") ? date("Y-m-d H:i:s", strtotime($row["cutdate"])) : "";
			$data["cuttime"]            = ($row["cuttime"] != "") ? (string)sprintf("%06d%", $row["cuttime"], "") : "";
			$data["cutamt"]         	= $row["cutamt"];
			$data["cutstf"]         	= $row["cutstf"];
			$data["rcptno"]         	= $row["rcptno"];
			$data["rcptdate"]           = ($row["rcptdate"] != "") ? date("Y-m-d H:i:s", strtotime($row["rcptdate"])) : "";
			// $data["rcpttime"]           = ($row["rcpttime"] != "") ? (string)sprintf("%06d%", $row["rcpttime"], "") : "";
			$data["rcptstf"]            = $row["rcptstf"];
			$data["rcptname"]           = $row["rcptname"];

			foreach ($data as $fld => $value) {
				$addValue .= ($value != "") ? ", '" . $value . "'" : ", null";
				$addField .= ", {$fld}";
			}

			$sql = "
                SET NOCOUNT ON
                INSERT INTO dbo.ar_receipt_temp (" . substr($addField, 1) . ") VALUES (" . substr($addValue, 1) . ");
                SELECT @@IDENTITY as id;";

			$db->QueryParam($sql, array());
		}

		$re = array(
			"success"                    => true,
			"msg"                        => ""
		);
	} catch (Exception $e) {
		$re = array(
			"success"                    => false,
			"msg"                        => "error"
		);
	}

	return $re;
}

switch ($mode) {

	case "LOAD_API":

		$msg	= "";

		$d_start    = $_REQUEST["d_start"];
		$d_end      = $_REQUEST["d_end"];

		$d_start_run    = new DateTime($d_start);
		$d_end_run      = new DateTime($d_end);

		for ($date = $d_start_run; $date <= $d_end_run; $date->modify("+1 day")) {
			$url = "{$ip_server}?filter={%22where%22:%20{%22{$field}%22:%20{%22between%22:%20[%22{$date->format("Y-m-d")}T00:00:00.000Z%22,%22{$date->format("Y-m-d")}T23:59:59.000Z%22]}}}";
			$arr[] = array(
				"url"           => $url,
				"d_action_date" => $date->format("Y-m-d"),
			);
		}

		if (!empty($arr)) {
			foreach ($arr as $obj) {
				$i_success_approve = $db->GetDataBySQL("SELECT i_success_approve FROM dbo.{$table}_log WHERE CONVERT(DATE, d_action_date) = CONVERT(DATE,'{$obj["d_action_date"]}');", array());
				if ($i_success_approve != 1) {
					$sql = "";
					$sql .= "DELETE dbo.{$table}_api WHERE {$field} BETWEEN '{$obj["d_action_date"]} 00:00:00.000' AND '{$obj["d_action_date"]} 23:59:59.000';";
					$sql .= "DELETE dbo.{$table}_temp WHERE {$field} BETWEEN '{$obj["d_action_date"]} 00:00:00.000' AND '{$obj["d_action_date"]} 23:59:59.000';";
					$db->QueryParam($sql, array());
				}

				if ($i_success_approve != 1) {
					$data = GetDataApi($obj);
					if ($data["success"] == false) { // ไม่สมบูรณ์
						echo json_encode($data);
						exit;
					}
				}
			}
		} else {
			echo json_encode(array("success" => false, "msg" => "parameter ไม่ถูกต้อง"));
			exit;
		}

		if (moveDataApi($arr)) {
			$sql = "DELETE dbo.{$table}_temp WHERE {$field} BETWEEN '{$_REQUEST["d_start"]} 00:00:00.000' AND '{$_REQUEST["d_end"]} 23:59:59.000';";
			$db->QueryParam($sql, array());

			$re = array(
				"success"					=> true,
				"msg"						=> ""
			);
		} else {
			$re = array(
				"success"                    => false,
				"msg"                        => "ไม่สามารถย้ายข้อมูล TEMP ได้"
			);
		}

		break;
}
echo json_encode($re);
exit;
