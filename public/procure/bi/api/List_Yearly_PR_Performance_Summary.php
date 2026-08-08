<?php
// API: Yearly PR Performance Summary
// Returns monthly aggregated PR counts by status group (groupMenu) for a given year.

header('Content-Type: application/json; charset=utf-8');

// Ensure config/database is loaded
@include_once("../../conf/config.php");
@include_once("../../lib/database/DatabaseServer.php");

$yearTh = isset($_GET['year']) ? intval($_GET['year']) : intval(date('Y') + 543);

// If year is in Thai era (>= 2400), convert to Gregorian (ปี ค.ศ.)
$yearEn = $yearTh > 2400 ? ($yearTh - 543) : $yearTh;

// Fiscal year is Oct (previous year) - Sep (current year)
$fiscalStartYear = $yearEn - 1; // Oct of previous calendar year
$fiscalEndYear = $yearEn; // Sep of current calendar year

// ===== 6 ส่วนงานที่กำหนด (keyword ตรวจชื่อส่วนงาน) =====
// ใช้ substring match เพื่อรองรับชื่อที่อาจสั้น/ยาวต่างกันใน DB
$sixSectionKeywords = [
    'วิทยาลัยพัฒนาชุมชนเมือง'         => 'วิทยาลัยพัฒนาชุมชนเมือง',
    'พยาบาลศาสตร์เกื้อการุณย์'         => 'คณะพยาบาลศาสตร์เกื้อการุณย์',
    'สำนักงานอธิการบดี'                => 'สำนักงานอธิการบดี',
    'วิทยาลัยพัฒนามหานคร'             => 'วิทยาลัยพัฒนามหานคร',
    'วิทยาศาสตร์และเทคโนโลยีสุขภาพ'   => 'คณะวิทยาศาสตร์และเทคโนโลยีสุขภาพ',
    'สำนักงานสภามหาวิทยาลัย'          => 'สำนักงานสภามหาวิทยาลัย',
];

// ฟังก์ชัน: ตรวจว่าชื่อส่วนงานตรงกับ keyword ใดใน 6 ส่วนงาน
// คืนชื่อ canonical (ที่แสดงใน UI) หรือ null ถ้าไม่ตรง
function matchSixSection(string $sectionName, array $keywords): ?string {
    $lower = mb_strtolower($sectionName, 'UTF-8');
    foreach ($keywords as $kw => $canonical) {
        if (mb_stripos($lower, mb_strtolower($kw, 'UTF-8'), 0, 'UTF-8') !== false) {
            return $canonical;
        }
    }
    return null;
}

$result = [
    'year'         => $yearTh,
    'months'       => [],
    'sections'     => [],
    'groups'       => [],
    'six_sections' => array_values($sixSectionKeywords), // ส่ง canonical names ให้ JS
    'data'         => [],
];

$db = null;
try {
    $db = new DatabaseServer();
} catch (Throwable $e) {
    // If DB connection fails, return empty result to keep UI responsive
    echo json_encode($result, JSON_UNESCAPED_UNICODE);
    exit;
}

$sql = "SELECT yyyy, mm, dc_department_id, ISNULL((SELECT c_name FROM sp_department WHERE dc_department_id = a.dc_department_id), 'ไม่ระบุ') AS department, groupMenu, COUNT(*) AS cnt " .
       "FROM dbo.sp_montyly_resulte a " .
       "WHERE i_product_type = 2 " .
       "AND ((yyyy = ? AND mm >= 10) OR (yyyy = ? AND mm <= 9)) " .
       "GROUP BY yyyy, mm, dc_department_id, groupMenu";

$stmt = $db->QueryParam($sql, [$fiscalStartYear, $fiscalEndYear]);
if ($stmt) {
    $monthSet    = [];
    $sectionSet  = [];
    $groupSet    = [];

    while ($row = $db->Fetch($stmt)) {
        $yyyy = intval($row['yyyy']);
        $mm   = sprintf('%02d', intval($row['mm']));
        $monthKey = sprintf('%04d-%02d', $yyyy, intval($row['mm']));

        $sectionId   = intval($row['dc_department_id']);
        $sectionName = trim($row['department'] ?? 'ไม่ระบุ');
        $group       = trim($row['groupMenu'] ?? 'อื่นๆ');
        $cnt         = intval($row['cnt']);

        // ตรวจว่าอยู่ใน 6 ส่วนงานหรือไม่ และได้ชื่อ canonical
        $canonicalSection = matchSixSection($sectionName, $sixSectionKeywords);
        $isSixSection     = ($canonicalSection !== null);

        $result['data'][] = [
            'month'            => $monthKey,
            'sectionId'        => $sectionId,
            'sectionName'      => $sectionName,
            'sectionCanonical' => $canonicalSection ?? $sectionName, // ชื่อ canonical สำหรับ filter ฝั่ง JS
            'isSixSection'     => $isSixSection,
            'group'            => $group,
            'count'            => $cnt,
        ];

        $monthSet[$monthKey]     = true;
        $sectionSet[$sectionId]  = $sectionName;
        $groupSet[$group]        = true;
    }

    ksort($monthSet);
    ksort($sectionSet);

    // Build month labels as Thai fiscal year (e.g. ต.ค. 67)
    foreach (array_keys($monthSet) as $m) {
        list($yyyy, $mm) = explode('-', $m);
        $thMonths = ['','มกราคม','กุมภาพันธ์','มีนาคม','เมษายน','พฤษภาคม','มิถุนายน','กรกฎาคม','สิงหาคม','กันยายน','ตุลาคม','พฤศจิกายน','ธันวาคม'];
        $label = $thMonths[intval($mm)] ?? $mm;
        $result['months'][] = ['value' => $m, 'label' => $label];
    }

    foreach ($sectionSet as $id => $name) {
        $canonical = matchSixSection($name, $sixSectionKeywords);
        $result['sections'][] = [
            'id'        => $id,
            'name'      => $name,
            'canonical' => $canonical ?? $name,
            'isSix'     => ($canonical !== null),
        ];
    }

    $result['groups'] = array_values(array_keys($groupSet));
    sort($result['groups'], SORT_NATURAL | SORT_FLAG_CASE);
}

echo json_encode($result, JSON_UNESCAPED_UNICODE);