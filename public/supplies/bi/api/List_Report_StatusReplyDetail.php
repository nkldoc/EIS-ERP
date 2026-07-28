<?php
include("../../conf/config.php");
include("../../lib/database/DatabaseServer.php");
include("../../lib/date/i_date.class.php");

$db = new DatabaseServer();
$date = new i_date();

function List_QueryParam()
{
	global $db;

	// Parameters
	$yearTh = isset($_REQUEST['year_th']) ? intval($_REQUEST['year_th']) : (date('Y') + 543);
	$yearEn = $yearTh - 543;
	$monthIdx = isset($_REQUEST['month_idx']) ? intval($_REQUEST['month_idx']) : -1; // 0-11, -1 for all
	$staffIds = isset($_REQUEST['staff']) ? $_REQUEST['staff'] : ''; // Comma separated
	$dataType = isset($_REQUEST['data_type']) ? $_REQUEST['data_type'] : 'sent'; // 'sent' or 'reply'

	// Calculate Date Range
	$startDate = ($yearEn - 1) . "-10-01";
	$endDate = $yearEn . "-09-30";

	if ($monthIdx >= 0) {
		// Map month_idx (0=Oct, ..., 11=Sep) to actual Month/Year
		if ($monthIdx <= 2) { // 0, 1, 2 => Oct, Nov, Dec of Previous Year
			$m = $monthIdx + 10;
			$y = $yearEn - 1;
		} else { // 3..11 => Jan..Sep of Current Year
			$m = $monthIdx - 2;
			$y = $yearEn;
		}

		$startDate = sprintf("%04d-%02d-01", $y, $m);
		$endDate = date("Y-m-t", strtotime($startDate));
	}

	// Staff Filter Condition
	$staffCond = "";
	if (!empty($staffIds)) {
		// Sanitize IDs
		$ids = array_map('intval', explode(',', $staffIds));
		$idsStr = implode(',', $ids);
		if (!empty($idsStr)) {
			$staffCond = " AND d.sp_emp_id IN ($idsStr) ";
		}
	}

	// Type Filter Condition (Sent vs Reply)
	// If 'reply', we only show items that have a reply date (d_receive_date IS NOT NULL)
	// If 'sent', we show ALL items (user request implies Sent includes everything, Reply is a subset)
	$typeCond = "";
	if ($dataType === 'reply') {
		$typeCond = " AND aa.d_receive_date IS NOT NULL ";
	}

	$sql = "
        SELECT
            ROW_NUMBER() OVER (ORDER BY a.d_create DESC) AS row
            ,CONVERT(date,aa.d_receive_date) as d_receive_date
            ,CONVERT(date,aa.d_doc_date) as d_doc_date
            ,CONVERT(date,a.d_create ) as d_create
            ,CONVERT(date,b.d_checking_date ) as d_checking_date
            ,CONVERT(date,b.d_arrive_date ) as d_arrive_date
            ,isnull(aa.i_status,0) as i_status
            ,b.c_code
			,(select f_net_total_price from NMU_ERP..sp_check_period_dtl where sp_check_period_hdr_id = b.sp_check_period_hdr_id) as f_net_total_price
            ,a.po_working_hdr_id
            ,a.c_code_ref
            ,(select c_full_name from dc_user where dc_user_id =  b.dc_user_create_id ) as emp
            ,(Select c_full_name from NMU_DATACENTER..dc_user where dc_user_id = aa.dc_user_create_id ) as po_emp_name
            ,(select c_full_name from nmu..dc_user where dc_user_id =  a.dc_user_create_id ) as emp_tt
            ,(Select inv_name from nmu..dc_creditor where dc_creditor_id = b.dc_creditor_id ) as dc_creditor
            ,REPLACE(REPLACE(aa.c_comment, CHAR(13), ''), CHAR(10), ' ') as c_comment
            ,isnull(REPLACE(REPLACE(a.c_comment, CHAR(13), ''), CHAR(10), ' '),'') as c_name
            ,aa.po_working_item_id
        FROM NMU_EIS..po_working_hdr a
        LEFT JOIN ( 
            SELECT
                aa.po_working_hdr_id
                ,aa.i_status
                ,isnull((select top 1 c_comment from NMU_EIS..po_working_item where po_working_item_id = max(aa.po_working_item_id) ),'-') as c_comment
                ,(select top 1 po_working_item_id from NMU_EIS..po_working_item where po_working_item_id = max(aa.po_working_item_id)) as po_working_item_id
                ,(select top 1 CONVERT(date,d_doc_date) from NMU_EIS..po_working_item where po_working_item_id = max(aa.po_working_item_id)) as d_doc_date
                ,(select top 1 CONVERT(date,d_receive_date) from NMU_EIS..po_working_item where po_working_item_id = max(aa.po_working_item_id)) as d_receive_date
                ,(select top 1 dc_user_create_id from NMU_EIS..po_working_item where po_working_item_id = max(aa.po_working_item_id)) as dc_user_create_id
            FROM NMU_EIS..po_working_item aa
            WHERE aa.i_status = 3
            GROUP BY
                aa.i_status,
                aa.po_working_hdr_id
        ) aa ON a.po_working_hdr_id = aa.po_working_hdr_id AND a.i_enable = 1
        LEFT JOIN sp_check_period_hdr b ON b.po_working_hdr_id = a.po_working_hdr_id
        LEFT JOIN sp_tor_contract c ON b.sp_tor_contract_id = c.sp_tor_contract_id
        LEFT JOIN sp_tor d ON d.tor_id = c.sp_tor_id
        WHERE
            d.dc_cost_id = 38
            AND CONVERT(date,a.d_create) BETWEEN '$startDate' AND '$endDate'
            $staffCond
            $typeCond
        ORDER BY a.d_create DESC
    ";

	$stmt = $db->QueryParam($sql, array());
	if (@$_REQUEST["show_sql"]) {
		/******echo sql******/
		$sql = (@$sqlMain) ? $sqlMain : $sql;
		$arr = (@$arrParam) ? $arrParam : ((@$arrValue) ? $arrValue : array());

		$sql = str_replace('?', '#-#', $sql);
		foreach ($arr as $fld => $value) {
			$sql = preg_replace('/#-#/', "'" . $value . "'", $sql, 1);
		}
		echo $sql;
		exit;
		/********************/
	}
	$data = [];

	if ($stmt) {
		while ($row = $db->Fetch($stmt)) {
			// Handle Dates
			// 1. Get Calculation Diffs
			$ts_create = 0;
			if ($row['d_create'] instanceof DateTime) {
				$ts_create = $row['d_create']->getTimestamp();
			} elseif (is_string($row['d_create']) && !empty($row['d_create'])) {
				$ts_create = strtotime($row['d_create']);
			}

			$ts_checking = 0;
			if ($row['d_checking_date'] instanceof DateTime) {
				$ts_checking = $row['d_checking_date']->getTimestamp();
			} elseif (is_string($row['d_checking_date']) && !empty($row['d_checking_date'])) {
				$ts_checking = strtotime($row['d_checking_date']);
			}

			$ts_arrive = 0;
			if ($row['d_arrive_date'] instanceof DateTime) {
				$ts_arrive = $row['d_arrive_date']->getTimestamp();
			} elseif (is_string($row['d_arrive_date']) && !empty($row['d_arrive_date'])) {
				$ts_arrive = strtotime($row['d_arrive_date']);
			}

			$diff_arrive_check = "-";
			$diff_check_send = "-";

			if ($ts_arrive > 0 && $ts_checking > 0) {
				// Round to days
				$diff_arrive_check = round(($ts_checking - $ts_arrive) / 86400);
			}
			if ($ts_checking > 0 && $ts_create > 0) {
				$diff_check_send = round(($ts_create - $ts_checking) / 86400);
			}

			// 2. Format Dates for Display
			$d_create = $row['d_create'];
			if ($d_create instanceof DateTime) {
				$d_create = $d_create->format('d/m/Y');
			} elseif (is_string($d_create) && !empty($d_create) && strpos($d_create, '-') !== false) {
				$d_create = date('d/m/Y', strtotime($d_create));
			}

			$d_receive = $row['d_receive_date'];
			if ($d_receive instanceof DateTime) {
				$d_receive = $d_receive->format('d/m/Y');
			} elseif (is_string($d_receive) && !empty($d_receive) && strpos($d_receive, '-') !== false) {
				$d_receive = date('d/m/Y', strtotime($d_receive));
			}

			$d_doc = $row['d_doc_date'];
			if ($d_doc instanceof DateTime) {
				$d_doc = $d_doc->format('d/m/Y');
			} elseif (is_string($d_doc) && !empty($d_doc) && strpos($d_doc, '-') !== false) {
				$d_doc = date('d/m/Y', strtotime($d_doc));
			}

			$d_checking = $row['d_checking_date'];
			if ($d_checking instanceof DateTime) {
				$d_checking = $d_checking->format('d/m/Y');
			} elseif (is_string($d_checking) && !empty($d_checking) && strpos($d_checking, '-') !== false) {
				$d_checking = date('d/m/Y', strtotime($d_checking));
			}

			$d_arrive = $row['d_arrive_date'];
			if ($d_arrive instanceof DateTime) {
				$d_arrive = $d_arrive->format('d/m/Y');
			} elseif (is_string($d_arrive) && !empty($d_arrive) && strpos($d_arrive, '-') !== false) {
				$d_arrive = date('d/m/Y', strtotime($d_arrive));
			}

			// Handle NULLs for JSON (for other fields)
			foreach ($row as $key => $val) {
				if (is_null($val)) $row[$key] = "";
				if ($val instanceof DateTime) $row[$key] = $val->format('Y-m-d H:i:s'); // Default fallback for unused fields
			}

			$data[] = [
				'row_num' => $row['row'],
				'd_create' => $d_create,
				'c_code' => $row['c_code'],
				'f_net_total_price' => $row['f_net_total_price'],
				'c_code_ref' => $row['c_code_ref'],
				'emp' => $row['emp'], // Creator
				'po_emp_name' => $row['po_emp_name'], // Reply By / PO Staff
				'emp_tt' => $row['emp_tt'], // Inspector
				'dc_creditor' => $row['dc_creditor'],
				'c_name' => $row['c_name'], // Description
				'd_receive_date' => $d_receive,
				'is_reply' => !empty($row['d_receive_date']),
				'd_doc_date' => $d_doc,
				'c_comment' => $row['c_comment'],
				'd_checking_date' => $d_checking,
				'd_arrive_date' => $d_arrive,
				'diff_arrive_check' => $diff_arrive_check,
				'diff_check_send' => $diff_check_send
			];
		}
	}

	header('Content-Type: application/json; charset=utf-8');
	echo json_encode(["success" => true, "data" => $data], JSON_UNESCAPED_UNICODE);
}

$fn = $_REQUEST['fn'] ?? '';
if ($fn === 'List_QueryParam') {
	List_QueryParam();
} else {
	header('Content-Type: application/json; charset=utf-8');
	echo json_encode(['success' => false, 'message' => 'invalid fn']);
}
