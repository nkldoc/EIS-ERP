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

function subCheque($str, $search, $int = 0, $num = 0)
{

	$dd		= array();
	$ii		= strpos($str, $search, $int);

	if ($ii !== false) {
		$num++;

		$sss	= subCheque($str, $search, $ii + 1, $num);
		return $sss;
	} else {

		$first			= "";
		$list			= explode($search, $str);

		foreach ($list as $val) {
			if ($first === "") {
				$first		= $val;
				$convert	= $val;
			} else {
				$convert	= substr($first, 0, - (strlen($val))) . $val;
			}
			$cheque[]	= $convert;
		}
		$dd["num"]			= $num;
		$dd["cheque"]		= $cheque;

		return $dd;
	}
	return false;
}

switch ($mode) {

	case "SAVE_DTL":

		// ========================= add dtl ========================= //
		$Arr	= json_decode($_REQUEST["data"], true);
		$impDtl	= json_decode($_REQUEST["impDtl"], true);

		// DEL DATA OLD
		foreach ($impDtl as $ss) {
			$db->QueryParam("DELETE " . $_REQUEST["table"] . "_dtl_cheque WHERE " . $_REQUEST["table"] . "_dtl_id = ?;", array($ss[$_REQUEST["table"] . "_dtl_id"]));
		}

		foreach ($Arr as $fld) {
			// ================== INSERT DTL ================== //
			$data["" . $_REQUEST["table"] . "_dtl_id"]			= $fld["" . $_REQUEST["table"] . "_dtl_id"];
			$data["" . $_REQUEST["table"] . "_hdr_id"]			= $_REQUEST["id"];
			$data["dc_cheque_id"]							= $fld["dc_cheque_id"];
			$data["c_creditor"]								= null;
			$data["c_comment"]								= null;
			$data["d_cheque"]								= $fld["d_cheque"];
			$data["f_cheque"]								= $fld["f_cheque"];

			foreach ($data as $fld => $value) {
				$arrValue[]	= ($value != "") ? $value : null;
				$addField	.= ", {$fld}";
				$addValue	.= ", ?";
			}

			$sql	= "INSERT INTO " . $_REQUEST["table"] . "_dtl_cheque (" . substr($addField, 1) . ") VALUES (" . substr($addValue, 1) . ");";
			$db->QueryParam($sql, $arrValue);

			// ============== //
			$addField	= null;
			$addValue	= null;
			unset($data);
			unset($arrValue);
			// ============== //

			$re	= array("success" => true, "" . $_REQUEST["table"] . "_hdr_id" => $_REQUEST["id"]);
		}
		// =========================================================== //

		echo json_encode($re);
		exit;
		break;

	case "ImportCheque":

		$msg		= "";

		$ArrDtl		= array(); // มีเช็คมากกว่า 2 ใบ
		$ArrDup		= array(); // ซ้ำกับในระบบ

		$tableHdr	= $_REQUEST["table"] . "_hdr";
		$HdrPk		= $_REQUEST["table"] . "_hdr_id";
		$tableDtl	= $_REQUEST["table"] . "_dtl";
		$DtlPk		= $_REQUEST["table"] . "_dtl_id";

		$sql	= "
			SELECT
				b.{$DtlPk}
				,a.{$HdrPk}
				,COUNT(b.imp_expense_vsn_dtl_id) OVER (PARTITION BY b.imp_expense_vsn_dtl_id) AS count_cheque_row
				,a.dc_bank_acc_company_id_source
				,d.c_cheque
				,c.c_bank_name
				,c.c_code
				,b.i_cal_gl
				,b." . (($_REQUEST["table"] == "imp_expense") ? "d_pay" : "d_cheque") . " AS d_cheque
				," . (($_REQUEST["table"] == "imp_expense") ? "b.f_total" : "b.f_inv") . " AS f_inv
				,b.f_tax_personal
				," . (($_REQUEST["table"] == "imp_expense") ? "b.f_tax_personal + b.f_tax_corporate" : "0") . " AS f_tax
			FROM
				{$tableHdr} a
			INNER JOIN {$tableDtl} b ON a.{$HdrPk} = b.{$HdrPk}
				LEFT JOIN vw_dc_bank_acc_company_full c ON a.dc_bank_acc_company_id_source = c.dc_bank_acc_company_id
				LEFT JOIN tb_cheque_vsn d ON b.imp_expense_vsn_dtl_id = d.imp_expense_vsn_dtl_id
			WHERE a.i_enable = " . STATUS_ENABLE . " AND a.{$HdrPk} = {$_REQUEST["id"]};";

		$stmt = $db->QueryParam($sql, array());

		if (sqlsrv_has_rows($stmt)) {

			// delete cheque load new
			$db->QueryParam("DELETE {$tableDtl}_cheque WHERE {$HdrPk} = ? AND i_status != 2;", array($_REQUEST["id"]));

			while ($row = $db->Fetch($stmt)) {
				$orCheque	= subCheque(str_replace(" ", "", $row["c_cheque"]), "-");
				$andCheque	= subCheque(str_replace(" ", "", $row["c_cheque"]), ",");

				if ($orCheque["num"] > 0) { // มีเช็ค > 2 ใบ = or
					$ArrDtl[$row["{$tableDtl}_id"]]	= $row["{$tableDtl}_id"];
				} else if ($andCheque["num"] > 1) { // มีเช็ค > 2 ใบ = and
					$ArrDtl[$row["{$tableDtl}_id"]]	= $row["{$tableDtl}_id"];
				} else { //มีเช็ค <= 2 ใบ

					foreach ($andCheque["cheque"] as $ii => $val) {
						$cheque	= $db->GetDataBySQL(
							"SELECT
								c.{$DtlPk}
							FROM dbo.{$tableHdr} a
								INNER JOIN dbo.{$tableDtl} b ON a.{$HdrPk} = b.{$HdrPk}
								INNER JOIN dbo.{$tableDtl}_cheque c ON b.{$DtlPk} = c.{$DtlPk}
								INNER JOIN dbo.dc_cheque d ON c.dc_cheque_id = d.dc_cheque_id
							WHERE a.{$HdrPk} = {$_REQUEST["id"]}
								AND c.i_status = 2
								AND d.c_cheque = '{$val}';",
							array()
						);

						if ($cheque) { // มีรายการเช็คที่ยกเลิก
							$msg	.= "เคยมีรายการเลขที่เช็คถูกยกเลิก <b><font color=red>{$val}</font></b><br>";
						} else {
							$dc_cheque_id	= $db->GetDataBySQL(
								"SELECT
									dc_cheque_id
								FROM dc_cheque
								WHERE dc_bank_acc_company_id = {$row["dc_bank_acc_company_id_source"]}
									AND c_cheque = '{$val}'
									AND i_enable = " . STATUS_ENABLE . "
									AND i_delete = " . DELETE_FALSE . ";",
								array()
							);

							if ($dc_cheque_id > 0) {
								$ArrDup[$row["{$tableDtl}_id"]]	= $row["{$tableDtl}_id"];
							} else {

								// ==================== INSERT DC_CHEQUE ===================== //
								$data["dc_bank_acc_company_id"]			= $row["dc_bank_acc_company_id_source"];
								$data["c_cheque"]						= $val;
								$data["c_show"]							= $val . " " . $row["c_bank_name"] . " :: " . $row["c_code"];
								$data["d_gen"]							= date("Y-m-d H:i:s");
								$data["f_money"]						= "0";
								$data["c_comment"]						= "โหลดเช็คค่าใช้จ่าย";
								$data["i_status"]						= 1;
								$data["i_enable"]						= STATUS_ENABLE;
								$data["i_delete"]						= DELETE_FALSE;
								$data["dc_user_create_id"]				= $_SESSION["user_id"];
								$data["dc_user_create_cost_id"]			= $_SESSION["dc_cost_id"];
								$data["d_create"]						= date("Y-m-d H:i:s");
								$data["dc_user_update_id"]				= $_SESSION["user_id"];
								$data["dc_user_update_cost_id"]			= $_SESSION["dc_cost_id"];
								$data["d_update"]						= date("Y-m-d H:i:s");

								foreach ($data as $fld => $value) {
									$arrValue[]	= ($value != "") ? $value : null;
									$addField	.= ", {$fld}";
									$addValue	.= ", ?";
								}

								$sql	= "INSERT INTO dc_cheque (" . substr($addField, 1) . ") VALUES (" . substr($addValue, 1) . ");";
								$db->QueryParam($sql, $arrValue);

								// ============== //
								$addField	= null;
								$addValue	= null;
								unset($data);
								unset($arrValue);
								// ============== //
								// =========================================================== //
							}

							// ================== INSERT EXPENSE_CHEQUE ================== //

							// ถ้าจ่ายให้บริษัท = 2 ต้องหักเงิน จำนวนขอเบิกทั้งสิ้น - ภาษีเงินได้นิติบุคคล
							$row["f_inv"] = ($row["i_cal_gl"] == 2) ? $row["f_inv"] - $row["f_tax_personal"] : $row["f_inv"];

							$data[$DtlPk]					= $row[$DtlPk];
							$data[$HdrPk]					= $row[$HdrPk];
							$data["dc_cheque_id"]			= $db->GetDataBySQL("SELECT dc_cheque_id FROM dc_cheque WHERE dc_bank_acc_company_id = {$row["dc_bank_acc_company_id_source"]} AND c_cheque = '{$val}' AND i_enable = " . STATUS_ENABLE . " AND i_delete = " . DELETE_FALSE . ";", array());
							$data["c_comment"]				= "โหลดเช็คค่าใช้จ่าย";
							$data["d_cheque"]				= $row["d_cheque"];
							$data["f_cheque"]				= ($row["count_cheque_row"] > 1) ? 0 : ($ii == 0) ? $row["f_inv"] : $row["f_tax"];

							foreach ($data as $fld => $value) {
								$arrValue[]	= ($value != "") ? $value : null;
								$addField	.= ", {$fld}";
								$addValue	.= ", ?";
							}

							$sql	= "INSERT INTO {$tableDtl}_cheque (" . substr($addField, 1) . ") VALUES (" . substr($addValue, 1) . ");";
							$db->QueryParam($sql, $arrValue);

							// ============== //
							$addField	= null;
							$addValue	= null;
							unset($data);
							unset($arrValue);
							// ============== //
							// =========================================================== //
						}
					}
				}
			}
			$data["dc_user_update_id_cheque"]			= $_SESSION["user_id"];
			$data["dc_user_update_cost_id_cheque"]		= $_SESSION["dc_cost_id"];
			$data["d_update_cheque"]					= date("Y-m-d H:i:s");

			foreach ($data as $fld => $value) {
				$arrValue[]	= ($value != "") ? $value : null;
				$addField	.= ", {$fld} = ?";
			}

			$arrValue[] = $_REQUEST["id"];

			$sql		= "UPDATE {$tableHdr} SET " . substr($addField, 1) . " WHERE {$HdrPk} = ?";
			$para		= $db->QueryParam($sql, $arrValue);

			// ============== //
			$addField	= null;
			$addValue	= null;
			unset($data);
			unset($arrValue);
			// ============== //
		}

		$msgDtl	= "";
		$msgDup	= "";
		if (count($ArrDtl) > 0 || count($ArrDup) > 0) {

			foreach ($ArrDtl as $val) {
				$msgDtl	.= ($msgDtl == "") ? $val : "," . $val;
			}
			foreach ($ArrDup as $val) {
				$msgDup	.= ($msgDup == "") ? $val : "," . $val;
			}

			// if ($msgDtl != "") {
			// 	$msg .= "มีเช็คมากกว่า 2 ใบ<br>" . $msgDtl . "<br>";
			// }
			// if ($msgDup != "") {
			// 	$msg .= "ซ้ำกับในระบบ<br>" . $msgDup . "<br>";
			// }
		}

		// ========================= add dtl ========================= //
		// =========================================================== //
		$re	= array("success" => true, $HdrPk => $_REQUEST["id"], "msg" => $msg);
		break;

	case "SAVE_CHEQUE":

		if ($_REQUEST["table"] == "imp_expense_vsn") {
			$sql = "DELETE imp_expense_vsn_dtl_cheque WHERE i_status != 2 AND imp_expense_vsn_dtl_id = " . $_REQUEST["dtl_id"];
			$para		= $db->QueryParam($sql, array());
			if ($para) {

				$data_dtl	= json_decode(@$_REQUEST["data"], true);

				$d_cheque	= $db->GetDataBySQL("SELECT CONVERT(VARCHAR, a.d_cheque, 120) AS d_cheque FROM dbo.imp_expense_vsn_dtl a WHERE a.imp_expense_vsn_dtl_id = ?;", array($_REQUEST["dtl_id"]));
				foreach ($data_dtl as $index => $jObj) {

					$data["imp_expense_vsn_dtl_id"]			= $_REQUEST["dtl_id"];
					$data["imp_expense_vsn_hdr_id"]			= $_REQUEST["hdr_id"];
					$data["dc_cheque_id"]					= $jObj["dc_cheque_id"];
					$data["d_cheque"]						= $d_cheque;
					$data["f_cheque"]						= ($jObj["f_cheque"] == "") ? '0' : $jObj["f_cheque"]; // Default value 0

					foreach ($data as $fld => $val) {
						$arrValue[] = ($val != "") ? $val : null;
						$addField .= ", {$fld}";
						$addValue .= ", ?";
					}

					$sql .= "INSERT INTO imp_expense_vsn_dtl_cheque (" . substr($addField, 1) . ") VALUES (" . substr($addValue, 1) . ");";

					// ============== //
					$addField	= null;
					$addValue	= null;
					unset($data);
					// ============== //
				}

				$para	= $db->QueryParam($sql, $arrValue);

				// ============== //
				$addField	= null;
				$addValue	= null;
				unset($data);
				unset($arrValue);
				// ============== //

				$data["dc_user_update_id_cheque"]			= $_SESSION["user_id"];
				$data["dc_user_update_cost_id_cheque"]		= $_SESSION["dc_cost_id"];
				$data["d_update_cheque"]					= date("Y-m-d H:i:s");

				foreach ($data as $fld => $value) {
					$arrValue[]	= ($value != "") ? $value : null;
					$addField	.= ", {$fld} = ?";
				}

				$arrValue[] = $_REQUEST["hdr_id"];
				$sql		= "UPDATE imp_expense_vsn_hdr SET " . substr($addField, 1) . " WHERE imp_expense_vsn_hdr_id = ?;";
				$para		= $db->QueryParam($sql, $arrValue);

				// ============== //
				$addField	= null;
				$addValue	= null;
				unset($data);
				unset($arrValue);
				// ============== //

				if ($para) {
					$re = array(
						"id"		=> $_REQUEST["hdr_id"],
						"success"	=> true
					);
				} else {
					$re = array("success"	=> false);
				}
			}
		}
		echo json_encode($re);
		exit;

		break;
}
echo json_encode($re);
exit;
