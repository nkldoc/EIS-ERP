<?php
include("../../conf/config.php");
include("../../lib/database/DatabaseServer.php");
include("../../lib/date/i_date.class.php");

$db = new DatabaseServer();
$date = new i_date();

function List_QueryParam()
{
	global $db;

	$yearTh = isset($_REQUEST['year_th']) ? intval($_REQUEST['year_th']) : (date('Y') + 543);
	$yearEn = $yearTh - 543;
	$monthIdx = isset($_REQUEST['month_idx']) ? intval($_REQUEST['month_idx']) : -1;
	$staffIds = isset($_REQUEST['staff']) ? $_REQUEST['staff'] : '';
	$strictStaff = !empty($_REQUEST['strict_staff']);
	$dataType = isset($_REQUEST['data_type']) ? $_REQUEST['data_type'] : 'sent';
	$cumulative = !empty($_REQUEST['cumulative']);

	// date_by=protest: กรองตามช่วงวันที่ที่ระบุตรงๆ (เช่นจากกล่อง "ช่วงวันที่สำหรับสรุปยอด Grand Total")
	// โดยยึด "วันที่ทักท้วงจริง" (d_doc_date ของรอบทักท้วง) เป็นตัวกรอง ไม่ใช่วันที่สร้างใบเบิก (a.d_create)
	// เพื่อให้ครอบคลุมเอกสารที่สร้างใบเบิกนอกช่วง/นอกปีงบประมาณที่เลือก แต่ถูกทักท้วงในช่วงวันที่ที่ต้องการ
	// (ตรงกับตรรกะที่ List_CompareProtestRounds ใน List_Report_StatusReply.php ใช้คำนวณ Grand Total)
	// ถ้าไม่ระบุ date_by=protest จะยังคงใช้ปีงบประมาณ/เดือน (year_th, month_idx) แบบเดิมกรองด้วย a.d_create
	$dateBy = isset($_REQUEST['date_by']) ? $_REQUEST['date_by'] : 'create';
	$reqDateStart = isset($_REQUEST['d_date_start']) ? trim($_REQUEST['d_date_start']) : '';
	$reqDateEnd = isset($_REQUEST['d_date_end']) ? trim($_REQUEST['d_date_end']) : '';
	$useProtestDateRange = ($dateBy === 'protest' && $reqDateStart !== '' && $reqDateEnd !== '');

	if ($useProtestDateRange) {
		$startDate = $reqDateStart;
		$endDate = $reqDateEnd;
	} else {
		$startDate = ($yearEn - 1) . "-10-01";
		$endDate = $yearEn . "-09-30";

		if ($monthIdx >= 0) {
			if ($monthIdx <= 2) {
				$m = $monthIdx + 10;
				$y = $yearEn - 1;
			} else {
				$m = $monthIdx - 2;
				$y = $yearEn;
			}
			if (!$cumulative) {
				$startDate = sprintf("%04d-%02d-01", $y, $m);
			}
			$endDate = date("Y-m-t", strtotime(sprintf("%04d-%02d-01", $y, $m)));
		}
	}

	// เงื่อนไขช่วงวันที่หลัก: ปกติกรองด้วยวันที่สร้างใบเบิก (a.d_create) ตามปีงบประมาณ/เดือนที่เลือก
	// แต่ถ้า date_by=protest จะเปลี่ยนไปกรองด้วยการมีรอบทักท้วง (i_status = 3) ที่ d_doc_date อยู่ในช่วงที่ระบุแทน
	// (เอกสารจะติดเงื่อนไขนี้ได้แม้ a.d_create จะอยู่นอกช่วง/นอกปีงบประมาณที่เลือกก็ตาม)
	if ($useProtestDateRange) {
		$mainDateCond = " AND EXISTS (SELECT 1 FROM NMU_EIS..po_working_item pd
                                       WHERE pd.po_working_hdr_id = a.po_working_hdr_id
                                       AND pd.i_status = 3
                                       AND CONVERT(date, pd.d_doc_date) BETWEEN '$startDate' AND '$endDate') ";
	} else {
		$mainDateCond = " AND CONVERT(date,a.d_create) BETWEEN '$startDate' AND '$endDate' ";
	}

	// Staff filter uses sp_emp_id derived from the SAME check period row (chkp)
	// used for display, so filter and display stay consistent
	// หมายเหตุ: เอกสาร "ไม่ระบุ" (sp_emp_id เป็น NULL) ไม่มี checkbox ให้เลือก/ยกเลิกฝั่ง frontend แล้ว
	// จึงต้องนับรวมเสมอไม่ว่าจะเลือกพนักงานคนไหนบ้าง (ISNULL(...,-1) IN (ids...,-1) ทำให้ NULL แมตช์เสมอ)
	$staffCond = "";
	if (!empty($staffIds)) {
		$ids = array_map('intval', explode(',', $staffIds));
		$idsStr = implode(',', $ids);
		if (!empty($idsStr)) {
			// strict_staff=1 (ใช้เมื่อเจาะจงดูรายละเอียดของพนักงานคนเดียวจาก Heatmap): จับคู่เฉพาะ sp_emp_id ที่ตรงกันจริงเท่านั้น
			// ไม่รวมเอกสาร "ไม่ระบุ" (sp_emp_id เป็น NULL เพราะไม่มี sp_check_period_hdr จับคู่ได้) เข้ามาปนในรายการของพนักงานคนนั้น
			// (ต่างจากตัวกรอง checkbox หลายคนของหน้าโดยรวม ที่ยังคงต้องการให้เอกสาร "ไม่ระบุ" ติดมาด้วยเสมอ จึงใช้ ISNULL(...,-1) IN (ids,-1) ตามเดิม)
			if ($strictStaff) {
				$staffCond = " AND (SELECT d.sp_emp_id FROM sp_tor_contract stc
                                 INNER JOIN sp_tor d ON d.tor_id = stc.sp_tor_id
                                 WHERE stc.sp_tor_contract_id = chkp.sp_tor_contract_id) IN ($idsStr) ";
			} else {
				$staffCond = " AND ISNULL((SELECT d.sp_emp_id FROM sp_tor_contract stc
                                 INNER JOIN sp_tor d ON d.tor_id = stc.sp_tor_id
                                 WHERE stc.sp_tor_contract_id = chkp.sp_tor_contract_id), -1) IN ($idsStr, -1) ";
			}
		}
	}

	$typeCond = "";
	if ($dataType === 'reply') {
		// เดิมกรองด้วย aa.d_receive_date IS NOT NULL ซึ่งจะตัดเอกสารที่ถูกทักท้วงแต่ยังค้างแก้ไข (รอบล่าสุดยังไม่ถูกรับคืน) ออกไป
		// เปลี่ยนเป็นเช็คว่าเคยมีรอบทักท้วง (i_status = 3) อย่างน้อย 1 รอบ เพื่อให้ตรงกับความหมาย "เคยถูกทักท้วง"
		$typeCond = " AND EXISTS (SELECT 1 FROM NMU_EIS..po_working_item ti
                                    WHERE ti.po_working_hdr_id = a.po_working_hdr_id AND ti.i_status = 3) ";
	}

	$sql = "
        ;WITH protest_rounds AS (
            SELECT
                pi.po_working_hdr_id
                ,pi.po_working_item_id
                ,pi.d_doc_date
                ,pi.d_receive_date
                ,pi.c_comment
                ,ROW_NUMBER() OVER (PARTITION BY pi.po_working_hdr_id ORDER BY pi.po_working_item_id ASC) AS rn
            FROM NMU_EIS..po_working_item pi
            WHERE pi.i_status = 3
        )
        SELECT
            ROW_NUMBER() OVER (ORDER BY a.d_create DESC) AS row
            ,CONVERT(date,aa.d_receive_date) as d_receive_date
            ,CONVERT(date,aa.d_doc_date) as d_doc_date
            ,CONVERT(date,a.d_create ) as d_create
            ,CONVERT(date,chkp.d_checking_date ) as d_checking_date
            ,CONVERT(date,chkp.d_arrive_date ) as d_arrive_date
            -- วันที่ฝ่ายคลังรับใบขอเบิก (i_sub_status = '2.00')
            ,CONVERT(date, recv.d_doc_date) as d_receive_request_date
            ,isnull(aa.i_status,0) as i_status
            ,b.dc_cost_acc_id
            ,chkp.c_code
            ,(select f_net_total_price from NMU_ERP..sp_check_period_dtl where sp_check_period_hdr_id = chkp.sp_check_period_hdr_id) as f_net_total_price
            ,a.po_working_hdr_id
            ,a.c_code_ref
            ,(select c_code from sp_tor_contract where sp_tor_contract_id = chkp.sp_tor_contract_id) as c_code_contract
            ,(select c_full_name from dc_user where dc_user_id = chkp.dc_user_create_id ) as emp
            ,(Select c_full_name from NMU_DATACENTER..dc_user where dc_user_id = aa.dc_user_create_id ) as po_emp_name
            ,(select c_full_name from nmu..dc_user where dc_user_id =  a.dc_user_create_id ) as emp_tt
            ,(Select inv_name from nmu..dc_creditor where dc_creditor_id = chkp.dc_creditor_id ) as dc_creditor
            ,REPLACE(REPLACE(aa.c_comment, CHAR(13), ''), CHAR(10), ' ') as c_comment
            ,isnull(REPLACE(REPLACE(a.c_comment, CHAR(13), ''), CHAR(10), ' '),'') as c_name
            ,aa.po_working_item_id
            ,pw.i_status as po_working_status
            ,(SELECT COUNT(*) FROM NMU_EIS..po_working_item x
                WHERE x.po_working_hdr_id = a.po_working_hdr_id AND x.i_status = 3) AS protest_round_total
            ,CONVERT(date, r1.d_doc_date) AS round1_doc_date
            ,CONVERT(date, r1.d_receive_date) AS round1_receive_date
            ,REPLACE(REPLACE(r1.c_comment, CHAR(13), ''), CHAR(10), ' ') AS round1_comment
            ,CONVERT(date, r2.d_doc_date) AS round2_doc_date
            ,CONVERT(date, r2.d_receive_date) AS round2_receive_date
            ,REPLACE(REPLACE(r2.c_comment, CHAR(13), ''), CHAR(10), ' ') AS round2_comment
        FROM NMU_EIS..po_working_hdr a
        INNER JOIN NMU_EIS..po_working_dtl b ON a.po_working_hdr_id = b.po_working_hdr_id
        LEFT JOIN protest_rounds r1 ON r1.po_working_hdr_id = a.po_working_hdr_id AND r1.rn = 1
        LEFT JOIN protest_rounds r2 ON r2.po_working_hdr_id = a.po_working_hdr_id AND r2.rn = 2
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
            GROUP BY aa.i_status, aa.po_working_hdr_id
        ) aa ON a.po_working_hdr_id = aa.po_working_hdr_id
        OUTER APPLY (
            SELECT TOP 1
                sch.sp_check_period_hdr_id,
                sch.c_code,
                sch.dc_user_create_id,
                sch.dc_creditor_id,
                sch.sp_tor_contract_id,
                sch.d_checking_date,
                sch.d_arrive_date
            FROM sp_check_period_hdr sch
            WHERE sch.po_working_hdr_id = a.po_working_hdr_id
            ORDER BY sch.sp_check_period_hdr_id DESC
        ) chkp
        LEFT JOIN dbo.sp_withdraw sw ON sw.c_code_ref = a.c_code_ref
        LEFT JOIN dbo.vw_po_working_pdf pw ON pw.c_code_ref = sw.c_code_ref
        -- รับใบขอเบิก (ฝ่ายคลังรับ): po_working_item ที่ i_sub_status = '2.00' ('รับใบขอใบเบิก')
        -- อ้างอิงตามนิยามใน SP_PO_WORKING_TRACK_STATUS (NMU_EIS) เพื่อให้ตัวเลขสอดคล้องกับ Rep_Rep0001
        LEFT JOIN NMU_EIS..po_working_item recv ON recv.po_working_hdr_id = a.po_working_hdr_id AND recv.i_sub_status = '2.00'
        WHERE
            a.i_enable = 1
            AND b.dc_cost_id = '38'
            AND b.dc_cost_acc_id = 77
            $mainDateCond
            $staffCond
            $typeCond
        ORDER BY a.d_create DESC
    ";

	$stmt = $db->QueryParam($sql, array());
	if (@$_REQUEST["show_sql"]) {
		$sql = (@$sqlMain) ? $sqlMain : $sql;
		$arr = (@$arrParam) ? $arrParam : ((@$arrValue) ? $arrValue : array());
		$sql = str_replace('?', '#-#', $sql);
		foreach ($arr as $fld => $value) {
			$sql = preg_replace('/#-#/', "'" . $value . "'", $sql, 1);
		}
		echo $sql;
		exit;
	}
	$data = [];

	if ($stmt) {
		while ($row = $db->Fetch($stmt)) {
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

			$ts_receive_request = 0;
			if ($row['d_receive_request_date'] instanceof DateTime) {
				$ts_receive_request = $row['d_receive_request_date']->getTimestamp();
			} elseif (is_string($row['d_receive_request_date']) && !empty($row['d_receive_request_date'])) {
				$ts_receive_request = strtotime($row['d_receive_request_date']);
			}

			$diff_arrive_check = "-";
			$diff_check_send = "-";
			// ระยะเวลา (จัดทำใบขอเบิก -> รับใบขอเบิก) : "-" หมายถึงฝ่ายคลังยังไม่รับเรื่อง (ค้างอยู่)
			$diff_send_receive = "-";
			if ($ts_arrive > 0 && $ts_checking > 0) {
				$diff_arrive_check = round(($ts_checking - $ts_arrive) / 86400);
			}
			if ($ts_checking > 0 && $ts_create > 0) {
				$diff_check_send = round(($ts_create - $ts_checking) / 86400);
			}
			if ($ts_create > 0 && $ts_receive_request > 0) {
				$diff_send_receive = round(($ts_receive_request - $ts_create) / 86400);
			}

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

			$d_receive_request = $row['d_receive_request_date'];
			if ($d_receive_request instanceof DateTime) {
				$d_receive_request = $d_receive_request->format('d/m/Y');
			} elseif (is_string($d_receive_request) && !empty($d_receive_request) && strpos($d_receive_request, '-') !== false) {
				$d_receive_request = date('d/m/Y', strtotime($d_receive_request));
			}

			foreach ($row as $key => $val) {
				if (is_null($val)) $row[$key] = "";
				if ($val instanceof DateTime) $row[$key] = $val->format('Y-m-d H:i:s');
			}

			// รอบทักท้วงที่ 1 และ 2 (แสดงทุกรอบ ไม่ใช่แค่รอบล่าสุด)
			$fmtRoundDate = function ($val) {
				if ($val instanceof DateTime) return $val->format('d/m/Y');
				if (is_string($val) && $val !== '' && strpos($val, '-') !== false) return date('d/m/Y', strtotime($val));
				return "";
			};
			$round1_doc_date = $fmtRoundDate($row['round1_doc_date']);
			$round1_receive_date = $fmtRoundDate($row['round1_receive_date']);
			$round2_doc_date = $fmtRoundDate($row['round2_doc_date']);
			$round2_receive_date = $fmtRoundDate($row['round2_receive_date']);

			$data[] = [
				'row_num' => $row['row'],
				'po_working_hdr_id' => $row['po_working_hdr_id'],
				'd_create' => $d_create,
				'c_code' => $row['c_code'],
				'f_net_total_price' => $row['f_net_total_price'],
				'c_code_ref' => $row['c_code_ref'],
				'c_code_contract' => $row['c_code_contract'],
				'emp' => $row['emp'], // Creator (ผู้ทำเบิก)
				'po_emp_name' => $row['po_emp_name'], // Reply By / PO Staff
				'emp_tt' => $row['emp_tt'], // Inspector
				'dc_creditor' => $row['dc_creditor'], // ผู้รับจ้าง/คู่ค้า
				'c_name' => $row['c_name'],
				'd_receive_date' => $d_receive,
				// เคยถูกทักท้วง (มีอย่างน้อย 1 รอบ) ไม่ใช่แค่ "รอบล่าสุดถูกรับคืนแล้ว"
				'is_reply' => intval($row['protest_round_total'] ?? 0) > 0,
				'po_working_status' => intval($row['po_working_status'] ?? 0),
				'd_doc_date' => $d_doc,
				'c_comment' => $row['c_comment'],
				'd_checking_date' => $d_checking,
				'd_arrive_date' => $d_arrive,
				// รับใบขอเบิก (ฝ่ายคลังรับ) และระยะเวลาจัดทำใบขอเบิก -> รับใบขอเบิก
				'd_receive_request_date' => $d_receive_request,
				'diff_arrive_check' => $diff_arrive_check,
				'diff_check_send' => $diff_check_send,
				'diff_send_receive' => $diff_send_receive,
				'protest_round_total' => intval($row['protest_round_total'] ?? 0),
				// รอบที่ 1
				'round1_doc_date' => $round1_doc_date,
				'round1_receive_date' => $round1_receive_date,
				'round1_comment' => $row['round1_comment'],
				// รอบที่ 2 (ถ้ามี)
				'round2_doc_date' => $round2_doc_date,
				'round2_receive_date' => $round2_receive_date,
				'round2_comment' => $row['round2_comment']
			];
		}
	}

	// ดึงรายการ "ทุกรอบทักท้วง" (ไม่จำกัดแค่รอบที่ 1-2 เหมือน round1_doc_date/round2_doc_date ด้านบน)
	// ของเอกสารที่ปรากฏใน $data เพื่อให้ฝั่งหน้าเว็บสามารถนับ/กรองรอบทักท้วงตามช่วงวันที่ที่เลือกได้ถูกต้อง
	// ไม่ว่าเอกสารนั้นจะถูกทักท้วงกี่รอบก็ตาม (เดิมมีแค่รอบที่ 1-2 ทำให้เอกสารที่ถูกทักท้วงเกิน 2 รอบ
	// นับรอบที่ 3 ขึ้นไปตกหล่นเวลากรองตามช่วงวันที่)
	if (!empty($data)) {
		$hdrIds = array_values(array_unique(array_map(function ($d) {
			return intval($d['po_working_hdr_id']);
		}, $data)));

		if (!empty($hdrIds)) {
			$hdrIdsStr = implode(',', $hdrIds);
			$sqlRounds = "
                SELECT po_working_hdr_id, po_working_item_id, d_doc_date
                FROM NMU_EIS..po_working_item
                WHERE i_status = 3 AND po_working_hdr_id IN ($hdrIdsStr)
                ORDER BY po_working_hdr_id, po_working_item_id
            ";
			$stmtRounds = $db->QueryParam($sqlRounds, array());
			$roundsByHdr = [];
			if ($stmtRounds) {
				while ($rr = $db->Fetch($stmtRounds)) {
					$hid = intval($rr['po_working_hdr_id']);
					$dDoc = $rr['d_doc_date'];
					$iso = "";
					if ($dDoc instanceof DateTime) {
						$iso = $dDoc->format('Y-m-d');
					} elseif (is_string($dDoc) && !empty($dDoc)) {
						$ts = strtotime($dDoc);
						if ($ts) $iso = date('Y-m-d', $ts);
					}
					if ($iso === "") continue;
					if (!isset($roundsByHdr[$hid])) $roundsByHdr[$hid] = [];
					$roundsByHdr[$hid][] = $iso;
				}
			}
			foreach ($data as &$d) {
				$hid = intval($d['po_working_hdr_id']);
				$d['all_round_dates'] = $roundsByHdr[$hid] ?? [];
			}
			unset($d);
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