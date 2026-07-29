<?php
include("../../conf/config.php");
include("../../lib/database/DatabaseServer.php");
include("../../lib/date/i_date.class.php");

$db			= new DatabaseServer();
$date 		= new i_date();

$sqlMain = "
	SET NOCOUNT ON
	SELECT
	ROW_NUMBER() OVER(ORDER BY d.d_doc_date,f.c_name, b.c_approve, e.c_code, CASE WHEN c.c_cheque IS NULL THEN 0 ELSE 1 END DESC, c.c_cheque) AS [row]
		,ROW_NUMBER() OVER (PARTITION BY a.po_working_hdr_id ORDER BY d.d_doc_date,f.c_name, b.c_approve, e.c_code, CASE WHEN c.c_cheque IS NULL THEN 0 ELSE 1 END DESC, c.c_cheque) AS i_type
		,CONVERT(VARCHAR, d.d_doc_date, 120) AS d_doc_date
		,f.c_name AS budget_name
		,b.c_approve
		,e.c_code+' : '+e.c_name AS expense_name
		,c.c_creditor
		,c.f_total
		,c.c_cheque
		,c.i_status
	INTO #temp
	FROM dbo.po_working_hdr a
		INNER JOIN dbo.po_working_dtl b ON a.po_working_hdr_id = b.po_working_hdr_id
		INNER JOIN dbo.po_working_cheque c ON a.po_working_hdr_id = c.po_working_hdr_id
		LEFT JOIN dbo.po_working_item d ON a.po_working_hdr_id = d.po_working_hdr_id AND d.i_status = 8
		LEFT JOIN dbo.bg_expense e ON b.bg_expense_id = e.bg_expense_id
		LEFT JOIN dbo.dc_expense_budget_type f ON b.dc_expense_budget_type_id = f.dc_expense_budget_type_id
	WHERE a.i_enable = 1 AND a.po_working_hdr_id = ?
	ORDER BY [row];

	SELECT
		CASE WHEN i_type = 1 THEN d_doc_date ELSE NULL END AS d_doc_date
		,CASE WHEN i_type = 1 THEN budget_name ELSE NULL END AS budget_name
		,CASE WHEN i_type = 1 THEN c_approve ELSE NULL END AS c_approve
		,CASE WHEN i_type = 1 THEN expense_name ELSE NULL END AS expense_name
		,c_creditor
		,f_total
		,c_cheque
		,i_status
	FROM #temp
	ORDER BY [row];";

$arrParam[]	= $_REQUEST["id"];

$stmt = $db->QueryParam($sqlMain, $arrParam);
$tbody = "<tbody>";
$f_total = 0;
if (sqlsrv_has_rows($stmt)) {
	while ($row = $db->Fetch($stmt)) {

		$tbody .= "<tr>";
		$tbody .= "<td align=center nowrap>" . (($row["d_doc_date"] != "") ? $date->shot_date_from_db($row["d_doc_date"]) : "") . "</td>";
		$tbody .= "<td align=center nowrap>" . $row["c_approve"] . "</td>";
		$tbody .= "<td align=left>" . $row["expense_name"] . "</td>";
		$tbody .= "<td align=left nowrap>" . $row["c_creditor"] . "</td>";
		$tbody .= "<td align=right nowrap>" . number_format($row["f_total"], 2) . "</td>";
		$tbody .= "<td align=center nowrap>" . $row["c_cheque"] . "</td>";
		$tbody .= "</tr>";

		$f_total += $row["f_total"];
	}
}

$style = "style='font-weight:bold;'";
// จำนวนเงินขอเบิก
$tbody .= "<tr>";
$tbody .= "<td {$style} align=right colspan=4>จำนวนเงินขอเบิก</td>";
$tbody .= "<td {$style} align=right nowrap>" . number_format($db->GetDataBySQL("SELECT f_total FROM dbo.po_working_dtl WHERE po_working_hdr_id = ?", array($_REQUEST["id"])), 2) . "</td>";
$tbody .= "<td {$style} align=center nowrap></td>";
$tbody .= "</tr>";
// จำนวนรวมเช็ค
$tbody .= "<tr>";
$tbody .= "<td {$style} align=right colspan=4>จำนวนรวมเช็ค</td>";
$tbody .= "<td {$style} align=right nowrap>" . number_format($f_total, 2) . "</td>";
$tbody .= "<td {$style} align=center nowrap></td>";
$tbody .= "</tr>";
$tbody .= "</tbody>";
?>

<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">

<head>
	<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
	<title><?php echo COMPANY_NAME; ?></title>
	<link rel="stylesheet" type="text/css" href="../../js/ext-3.4.0/resources/css/ext-all.css" />
	<link rel="stylesheet" type="text/css" href="../../js/ext-3.4.0/resources/css/xtheme-blue.css" />
	<link rel="stylesheet" type="text/css" href="../../css/icon_all.css" />
	<link rel="stylesheet" type="text/css" href="../../js/ComboCheckBox/css/Ext.ux.form.LovCombo.css" />
	<link rel="stylesheet" type="text/css" href="../../css/report_css.css" />
	<style>
		.table_report thead td,
		.table_report thead th {
			background: #dfe8f6;
		}
	</style>
</head>

<body style="padding: 20px;">
	<table width="100%" class="table_report" border="0" cellspacing="1" cellpadding="0" style="page-break-after: always;">
		<thead valign="top">
			<tr style="height: 26px;">
				<th style="vertical-align:middle;" nowrap>วันที่เขียนเช็ค</th>
				<th style="vertical-align:middle;" nowrap>เลขฏีกา</th>
				<th style="vertical-align:middle;" nowrap>รายจ่ายย่อย</th>
				<th style="vertical-align:middle;" nowrap>จ่ายให้</th>
				<th style="vertical-align:middle;" nowrap>จ่ายสุทธิ</th>
				<th style="vertical-align:middle;" nowrap>เลขที่เช็ค</th>
			</tr>
		</thead>
		<?= $tbody ?>
	</table>
</body>

</html>