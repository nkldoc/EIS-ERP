<?php
include("../conf/configPo.php");
include("../../conf/config.php");
include("../../lib/database/DatabaseServer.php");
include("../../lib/date/i_date.class.php");

$db = new DatabaseServer();
$date = new i_date();

$root = "data";
$data = array();
$con = null;

function List_QueryParam()
{
	global $db, $date, $root, $data, $con, $arr_status;

	$totalCount = 0;

	$con1 = "";
	$con2 = "";

	if ($_REQUEST["dc_user_id"] > 0) {
		$con1 .= " AND c.dc_user_create_id = " . $_REQUEST["dc_user_id"];
		$con2 .= " AND d.dc_user_update_id_cheque = " . $_REQUEST["dc_user_id"];
	}

	if ($_REQUEST["i_status"] > 0) {
		$con1 .= " AND c.i_status = " . $_REQUEST["i_status"];
		if ($_REQUEST["i_status"] != 12) {
			$con2 .= " AND 1 = 0";
		}
	}

	$con1 .= "
		AND CASE
			WHEN c.i_status = 4 THEN
				CASE WHEN parent1.po_working_hdr_id > 0 THEN CONVERT(VARCHAR, parent2.d_inv_date, 120)
				ELSE CONVERT(VARCHAR, b.d_inv_date, 120)
			END ELSE d.d_doc_date END BETWEEN '{$_REQUEST["d_date_start"]}' AND '{$_REQUEST["d_date_end"]}'";
	$con2 .= " AND c.d_doc_date BETWEEN '{$_REQUEST["d_date_start"]}' AND '{$_REQUEST["d_date_end"]}'";

	$sqlMain = "
		SET NOCOUNT ON
		SELECT
			a.po_working_hdr_id
			,CASE
				WHEN c.i_status = 4 THEN
					CASE
						WHEN parent1.po_working_hdr_id > 0 THEN CONVERT(VARCHAR, parent2.d_inv_date, 120)
						ELSE CONVERT(VARCHAR, b.d_inv_date, 120)
					END
				ELSE CONVERT(VARCHAR, d.d_doc_date, 120)
			END AS d_inv_date
			,CONVERT(VARCHAR, c.d_doc_date, 120) AS d_send_date
			,c.dc_user_create_id AS dc_user_id
			,parent1.c_code_ref AS c_code_parent
			,a.c_code_ref AS c_code
			,b.c_approve
			,c.i_status
			,c.c_status
			,CASE
				WHEN c.i_status = 4 THEN
					CASE WHEN parent1.po_working_hdr_id > 0 THEN CONVERT(VARCHAR, parent2.d_inv_date, 120)
					ELSE CONVERT(VARCHAR, b.d_inv_date, 120) END
				ELSE CONVERT(VARCHAR, d.d_doc_date, 120)
			END AS d_receive_date
			,d.i_status AS i_status_before
			,d.c_status AS c_status_before
			,e.c_comment
			,CASE
				WHEN parent2.i_protest IS NOT NULL THEN parent2.i_protest
				WHEN b.i_protest IS NOT NULL THEN b.i_protest
				ELSE NULL
			END AS i_protest
			,CASE
				WHEN parent2.i_protest IS NOT NULL THEN parent3.d_doc_date
				WHEN b.i_protest IS NOT NULL THEN e.d_doc_date
			END AS d_doc_date4
			,CASE
				WHEN b.i_protest IS NOT NULL THEN e.d_receive_date
				WHEN parent2.i_protest IS NOT NULL THEN parent3.d_receive_date
			END AS d_receive_date4
		INTO #tempDataWork
		FROM dbo.po_working_hdr a
			INNER JOIN dbo.po_working_dtl b ON a.po_working_hdr_id = b.po_working_hdr_id
			INNER JOIN dbo.po_working_item c ON a.po_working_hdr_id = c.po_working_hdr_id
			LEFT JOIN dbo.po_working_item d ON a.po_working_hdr_id = d.po_working_hdr_id
				AND CASE
						WHEN c.i_status = 3 THEN (c.i_status - 2) /* ทักท้วง */
						WHEN c.i_status = 4 THEN (c.i_status - 3) /* อนุมัติฏีกา */
						ELSE (c.i_status - 1)
					END = d.i_status
			LEFT JOIN dbo.po_working_item e ON a.po_working_hdr_id = e.po_working_hdr_id AND e.i_status = 3
			LEFT JOIN dbo.po_working_hdr parent1 ON a.parent_id = parent1.po_working_hdr_id
			LEFT JOIN dbo.po_working_dtl parent2 ON a.parent_id = parent2.po_working_hdr_id
			/* ทักท้วงใบเก่า */
			LEFT JOIN dbo.po_working_item parent3 ON a.parent_id = parent3.po_working_hdr_id AND parent3.i_status = 3
		WHERE a.i_enable = 1
			AND c.i_status NOT IN (1,3)
			{$con1};
		
		SELECT
			a.po_working_hdr_id
			,c.d_doc_date AS d_inv_date
			,CONVERT(VARCHAR, d.d_pay_date, 120) AS d_send_date
			,d.dc_user_update_id_cheque AS dc_user_id
			,'' AS c_code_parent
			,a.c_code_ref AS c_code
			,b.c_approve+'<br><font color=red>('+d.c_cheque+')</font>' AS c_approve
			,12 AS i_status
			,'ตัดจ่ายเจ้าหนี้' AS c_status
			,CONVERT(VARCHAR, c.d_doc_date, 120) AS d_receive_date
			,c.i_status AS i_status_before
			,c.c_status AS c_status_before
			,d.c_comment
			,NULL AS i_protest
			,NULL AS d_doc_date4
			,NULL AS d_receive_date4
		INTO #tempDataCheque
		FROM dbo.po_working_hdr a
			INNER JOIN dbo.po_working_dtl b ON a.po_working_hdr_id = b.po_working_hdr_id
				AND b.i_success = 1
			INNER JOIN dbo.po_working_item c ON a.po_working_hdr_id = c.po_working_hdr_id
				AND a.i_status_last = c.i_status
			INNER JOIN dbo.po_working_cheque d ON a.po_working_hdr_id = d.po_working_hdr_id
				AND d.i_status = 1
				AND d.i_cheque = 1
		WHERE a.i_enable = 1
			{$con2};
		
		SELECT * INTO #tempDataM
		FROM (
			SELECT * FROM #tempDataWork
			UNION ALL
			SELECT * FROM #tempDataCheque
		) a;
		
		/* SELECT INSERT TEMP */
		SELECT
			2 AS i_type
			,ROW_NUMBER() OVER (PARTITION BY a.dc_user_id ORDER BY b.c_full_name, DATEDIFF(DAY, a.d_inv_date, a.d_send_date) - (SELECT COUNT(*) FROM dbo.po_holiday_hdr aa INNER JOIN dbo.po_holiday_dtl bb ON aa.po_holiday_hdr_id = bb.po_holiday_hdr_id WHERE aa.i_enable = 1 AND bb.d_holiday BETWEEN a.d_inv_date AND a.d_send_date), a.i_status, a.d_inv_date, a.c_code) AS row
			,a.dc_user_id
			,b.c_full_name
			,a.c_code_parent
			,a.c_code
			,a.c_approve
			,a.i_status
			,a.d_receive_date
			,a.i_status_before
			,a.c_status_before
			,a.d_send_date
			,a.c_status
			,DATEDIFF(DAY, a.d_inv_date, a.d_send_date) - (SELECT COUNT(*) FROM dbo.po_holiday_hdr aa INNER JOIN dbo.po_holiday_dtl bb ON aa.po_holiday_hdr_id = bb.po_holiday_hdr_id WHERE aa.i_enable = 1 AND bb.d_holiday BETWEEN a.d_inv_date AND a.d_send_date) AS i_count
			,CASE
				WHEN a.i_status = 4 THEN a.c_comment
				ELSE NULL
			END AS c_comment
			,a.i_protest
			,DATEDIFF(DAY, a.d_doc_date4, a.d_receive_date4) - (SELECT COUNT(*) FROM dbo.po_holiday_hdr aa INNER JOIN dbo.po_holiday_dtl bb ON aa.po_holiday_hdr_id = bb.po_holiday_hdr_id WHERE aa.i_enable = 1 AND bb.d_holiday BETWEEN a.d_doc_date4 AND a.d_receive_date4) AS i_count_protest
		INTO #tempData
		FROM #tempDataM a
			LEFT JOIN dbo.dc_user b ON a.dc_user_id = b.dc_user_id AND b.i_enable = 1 AND b.i_delete = 2;
		
		SELECT
			1 AS i_type
			,NULL AS row
			,a.dc_user_id
			,a.c_full_name
			,'' AS c_code_parent
			,'' AS c_code
			,'' AS c_approve
			,'' AS i_status
			,'' AS d_receive_date
			,'' AS i_status_before
			,'' AS c_status_before
			,'' AS d_send_date
			,'' AS c_status
			,'' AS i_count
			,'' AS c_comment
			,'' AS i_protest
			,'' AS i_count_protest
		INTO #tempUser
		FROM dbo.dc_user a
			INNER JOIN (SELECT  DISTINCT aa.dc_user_id FROM #tempData aa) b ON a.dc_user_id = b.dc_user_id;
				
		SELECT * FROM #tempUser
		UNION ALL
		SELECT * FROM #tempData
		ORDER BY c_full_name, i_type DESC, row;";

	$arrParam = array();

	$stmt = $db->QueryParam($sqlMain, $arrParam);

	if ($stmt) {
		$arrDay = array("1" => "จ", "2" => "อ", "3" => "พ", "4" => "พฤ", "5" => "ศ", "6" => "ส", "7" => "อา");
		while ($row = $db->Fetch($stmt)) {
			$temp = array(
				"no"									=> $row["row"],
				"i_type"								=> $row["i_type"],
				"c_full_name"							=> "คุณ" . $row["c_full_name"],
				"c_code_parent"							=> $row["c_code_parent"],
				"c_code"								=> $row["c_code"],
				"c_approve"								=> $row["c_approve"],
				"i_status"								=> $row["i_status"],
				"i_status_before"						=> $row["i_status_before"],
				"c_status_before"						=> ($row["i_status_before"] == 1) ? "ฝ่ายคลังรับใบขอเบิก" : $row["c_status_before"],
				"d_receive_date"						=> ($row["d_receive_date"] != "") ? $arrDay[date("N", strtotime($row["d_receive_date"]))] . "<br>" . $date->shot_date_from_db($row["d_receive_date"]) : "",
				"c_status"								=> $row["c_status"],
				"d_send_date"							=> ($row["d_send_date"] != "") ? $arrDay[date("N", strtotime($row["d_send_date"]))] . "<br>" . $date->shot_date_from_db($row["d_send_date"]) : "",
				"i_count"								=> $row["i_count"],
				"c_comment"								=> $row["c_comment"],
				"i_protest"								=> $row["i_protest"],
				"i_count_protest"						=> $row["i_count_protest"],
			);
			${$root}[] = $temp;
		}
	}
	return json_encode(array("debug" => true, "totalCount" => $totalCount, $root => ${$root}));
}
