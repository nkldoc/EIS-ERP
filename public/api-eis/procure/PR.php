<?php
/**
 * PR export API
 *
 * POST /api-eis/PR
 * Content-Type: application/json
 * { "i_PR_YEAR": 2026 }
 */

require_once __DIR__ . '/conf/config.php';
require_once __DIR__ . '/lib/database/DatabaseServer.php';

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

function prApiResponse($statusCode, array $payload)
{
    http_response_code($statusCode);
    echo json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_PRESERVE_ZERO_FRACTION);
    exit;
}

if (($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS') {
    http_response_code(204);
    exit;
}

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    header('Allow: POST, OPTIONS');
    prApiResponse(405, array(
        'success' => false,
        'message' => 'Only POST requests are supported.'
    ));
}

$request = json_decode(file_get_contents('php://input'), true);
if (!is_array($request) || json_last_error() !== JSON_ERROR_NONE) {
    prApiResponse(400, array(
        'success' => false,
        'message' => 'Request body must be valid JSON.'
    ));
}

if (!array_key_exists('i_PR_YEAR', $request)
    || filter_var($request['i_PR_YEAR'], FILTER_VALIDATE_INT) === false) {
    prApiResponse(422, array(
        'success' => false,
        'message' => 'i_PR_YEAR must be an integer Gregorian year.'
    ));
}

$prYear = (int) $request['i_PR_YEAR'];
if ($prYear < 1900 || $prYear > 2200) {
    prApiResponse(422, array(
        'success' => false,
        'message' => 'i_PR_YEAR is outside the accepted range.'
    ));
}

/* Fields and order intentionally match the CheckList exportExcel output. */
$sql = 'SELECT
            a.c_code,
            a.d_doc_ref,
            a.c_name,
            contract.c_code AS code,
            creditor.c_name AS dc_creditor_name,
            creditor.c_tax_number_imp,
            a.f_total_amt,
            contract.f_total_amt AS f_total_contract,
            cost.c_name AS dc_cost_idTxt,
            subCost.c_name_th AS dc_sub_cost,
            typeStatus.c_name AS c_type_name,
            statusHdr.c_name AS c_name_status,
            CONVERT(VARCHAR(19), a.d_tor_date, 120) AS d_tor_date,
            CONVERT(VARCHAR(19), a.d_doc_date, 120) AS d_doc_date,
            CONVERT(VARCHAR(19), a.d_create, 120) AS d_create
        FROM dbo.sp_tor a
        OUTER APPLY (
            SELECT TOP 1 c_code, f_total_amt, dc_creditor_id
            FROM dbo.sp_tor_contract
            WHERE sp_tor_id = a.tor_id
        ) contract
        LEFT JOIN NMU.dbo.dc_creditor creditor
            ON creditor.dc_creditor_id = contract.dc_creditor_id
        LEFT JOIN NMU_DATACENTER.dbo.dc_cost cost
            ON cost.dc_cost_id = a.dc_cost_id
        LEFT JOIN NMU_DATACENTER.dbo.dc_sub_cost subCost
            ON subCost.dc_sub_cost_id = a.dc_sub_cost_id
        LEFT JOIN dbo.sp_type_status typeStatus
            ON typeStatus.sp_type_status_id = a.tor_type_id
        LEFT JOIN dbo.sp_status_hdr statusHdr
            ON statusHdr.sp_status_hdr_id = a.tor_status_id
        WHERE ISNULL(a.i_type_bg, 0) <> 3
          AND ISNULL(a.i_is_notor, 0) <> 1
          AND a.i_pr_year = ?
        ORDER BY a.d_update DESC, a.i_edit DESC, a.tor_id DESC';

$db = new DatabaseServer();
$stmt = $db->QueryParam($sql, array($prYear));
$rows = array();
while ($row = $db->Fetch($stmt)) {
    $rows[] = $row;
}

prApiResponse(200, array(
    'success' => true,
    'i_PR_YEAR' => $prYear,
    'totalCount' => count($rows),
    'data' => $rows
));
