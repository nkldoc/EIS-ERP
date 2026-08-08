<?php
// ===========================================================================
// CRITICAL: Output buffering FIRST - before any code
// ===========================================================================
if (ob_get_level() === 0) ob_start();
error_reporting(0);
ini_set('display_errors', '0');
set_error_handler(function() {}, E_ALL);

// Set JSON header
header('Content-Type: application/json; charset=utf-8');

// Ensure uncaught exceptions produce JSON
try {

// Load includes into temporary buffers
$_tmp = ob_get_level();
// Ensure session stop flag won't kill the script inside config.php
if (!isset($_SESSION) || !is_array($_SESSION)) {
	$_SESSION = array();
}
if (isset($_SESSION['stop'])) unset($_SESSION['stop']);
@include("../../conf/config.php");
while (ob_get_level() > $_tmp) { ob_end_clean(); }
ob_start();

@include("../../lib/database/DatabaseServer.php");
while (ob_get_level() > $_tmp + 1) { ob_end_clean(); }
ob_start();

@include("../../lib/date/i_date.class.php");
while (ob_get_level() > $_tmp + 1) { ob_end_clean(); }

// Initialize database (only when driver and config present)
$db = null;
if (class_exists('DatabaseServer') && function_exists('sqlsrv_connect') && defined('DB_SERVER') && defined('DB_USER')) {
	try {
		$db = @new DatabaseServer();
	} catch (\Throwable $e) {
		// Do not allow DB constructor to echo/die - keep $db null as fallback to mock data
		$db = null;
	}
}

// Build response
$response = ['data' => [], 'year_th' => 0, 'year_en' => 0, 'totalCount' => 0];
$fn = isset($_REQUEST['fn']) ? $_REQUEST['fn'] : '';

if ($fn === 'List_QueryParam') {
	$year_th = isset($_REQUEST['year_th']) ? intval($_REQUEST['year_th']) : (date('Y') + 543);
	$year_en = isset($_REQUEST['year_en']) ? intval($_REQUEST['year_en']) : date('Y');
	
	$data = [];
	$use_mock = true;
	
	// Try database query
	if ($db !== null && method_exists($db, 'QueryParam')) {
		try {
			$sql = "SET NOCOUNT ON
DECLARE @TEMP_SP_BG_BUDGET_SUM TABLE (
    i_year bigint, dc_expense_budget_type_id bigint, dc_cost_acc_id bigint, dc_cost_id bigint, 
    bg_expense_id bigint, f_plan_begin decimal(18,2), f_period_begin decimal(18,2), 
    f_income_begin decimal(18,2), f_plan_transfer decimal(18,2), f_period_transfer decimal(18,2), 
    f_income_transfer decimal(18,2), f_reserve_budget decimal(18,2), f_reserve_budget_long decimal(18,2), 
    f_reserve_budget_income decimal(18,2), f_reserve_budget_income_Finish decimal(18,2), 
    f_reserve_period decimal(18,2), f_reserve_periodincome decimal(18,2), f_reserve_periodfinish decimal(18,2), 
    f_reserve_income decimal(18,2), f_reserve_income_Finish decimal(18,2), f_total_all decimal(18,2), 
    f_return_all decimal(18,2), f_total_cut decimal(18,2), f_return_cut decimal(18,2), 
    f_total_pay decimal(18,2), f_return_pay decimal(18,2), f_plan_total decimal(18,2), 
    f_plan_cut_total decimal(18,2), f_plan_pay_total decimal(18,2), f_period_total decimal(18,2), 
    f_period_cut_total decimal(18,2), f_period_pay_total decimal(18,2), f_income_total decimal(18,2), 
    f_income_cut_total decimal(18,2), f_income_pay_total decimal(18,2)
);
INSERT INTO @TEMP_SP_BG_BUDGET_SUM EXEC " . DB_NMU_EIS . "SP_BG_BUDGET_SUM {$year_en}
SELECT a.dc_expense_budget_type_id, a.dc_cost_acc_id,
       (SELECT c_name FROM " . DB_CENTER . "dc_cost WHERE dc_cost_id = a.dc_cost_acc_id) AS cost_name,
       (SELECT c_name FROM " . DB_CENTER . "dc_expense_budget_type WHERE dc_expense_budget_type_id = a.dc_expense_budget_type_id) AS dc_expense_budget_type,
       a.bg_expense_id,
       (SELECT c_code + ' : ' + c_name FROM NMU_EIS..bg_expense WHERE bg_expense_id = a.bg_expense_id) AS bg_expense,
       -- งบประมาณรวม (ใช้สำหรับ DataView เดิม)
       CASE WHEN a.dc_expense_budget_type_id IN (4,5) THEN SUM(a.f_period_begin) + SUM(a.f_period_transfer)
            ELSE SUM(a.f_plan_begin) + SUM(a.f_plan_transfer) END AS f_plan_begin,
       CASE WHEN a.dc_expense_budget_type_id IN (4,5) THEN SUM(a.f_reserve_period) + SUM(a.f_reserve_periodincome) + SUM(a.f_reserve_periodfinish)
            ELSE SUM(a.f_reserve_budget) + SUM(a.f_reserve_budget_income) + SUM(a.f_reserve_budget_income_Finish) END AS f_reserve_budget,
       -- ===== เงินแผน (A1+A2) - (A3+A4) - (D1-E1) =====
       SUM(a.f_plan_begin) + SUM(a.f_plan_transfer) AS f_plan_total,
       SUM(a.f_reserve_budget) + SUM(a.f_reserve_budget_income) AS f_plan_used,
       SUM(a.f_total_all) - SUM(a.f_return_all) AS f_plan_withdraw,
       (SUM(a.f_plan_begin) + SUM(a.f_plan_transfer))
       - (SUM(a.f_reserve_budget) + SUM(a.f_reserve_budget_income))
       - (SUM(a.f_total_all) - SUM(a.f_return_all)) AS f_plan_remain,
       -- ===== เงินงวด =====
       SUM(a.f_period_begin) + SUM(a.f_period_transfer) AS f_period_total,
       SUM(a.f_reserve_period) + SUM(a.f_reserve_periodincome) AS f_period_used,
       SUM(a.f_total_all) - SUM(a.f_return_all) AS f_period_withdraw,
       (SUM(a.f_period_begin) + SUM(a.f_period_transfer))
       - (SUM(a.f_reserve_period) + SUM(a.f_reserve_periodincome))
       - (SUM(a.f_total_all) - SUM(a.f_return_all)) AS f_period_remain
FROM @TEMP_SP_BG_BUDGET_SUM a
WHERE a.i_year = {$year_en}
GROUP BY a.dc_expense_budget_type_id, a.bg_expense_id, a.dc_cost_acc_id";
			
			$stmt = $db->QueryParam($sql, []);
			if ($stmt && method_exists($db, 'Fetch')) {
				$i = 0;
				while ($row = $db->Fetch($stmt)) {
					$data[] = [
						'no' => ++$i,
						'cost_name' => $row['cost_name'] ?? '',
						'dc_cost_acc_id' => intval($row['dc_cost_acc_id']),
						'c_name' => $row['dc_expense_budget_type'] ?? '',
						'bg_expense' => $row['bg_expense'] ?? '',
						'bg_expense_id' => intval($row['bg_expense_id']),
						'dc_expense_budget_type_id' => intval($row['dc_expense_budget_type_id']),
						'f_plan_begin' => floatval($row['f_plan_begin']),
						'f_reserve_budget' => floatval($row['f_reserve_budget']),
						// เงินแผน
						'f_plan_total'    => floatval($row['f_plan_total']),
						'f_plan_used'     => floatval($row['f_plan_used']),
						'f_plan_withdraw' => floatval($row['f_plan_withdraw']),
						'f_plan_remain'   => floatval($row['f_plan_remain']),
						// เงินงวด
						'f_period_total'    => floatval($row['f_period_total']),
						'f_period_used'     => floatval($row['f_period_used']),
						'f_period_withdraw' => floatval($row['f_period_withdraw']),
						'f_period_remain'   => floatval($row['f_period_remain']),
						'budget_year' => $year_th
					];
				}
				$use_mock = false;
			}
		} catch (Exception $e) {
			$use_mock = true;
		}
	}
	
	// // Use mock data ffff
	// if ($use_mock) {
	// 	$data = [
	// 		['no' => 1, 'cost_name' => 'ส่วนการเงิน', 'dc_cost_acc_id' => 1, 'c_name' => 'เงินรายได้ส่วนงาน', 'bg_expense' => 'BG001 : ค่าอุปกรณ์', 'bg_expense_id' => 1, 'dc_expense_budget_type_id' => 1, 'f_plan_begin' => 1200000, 'f_reserve_budget' => 600000, 'budget_year' => $year_th],
	// 		['no' => 2, 'cost_name' => 'ส่วนการให้', 'dc_cost_acc_id' => 2, 'c_name' => 'เงินบริจาค (นอกงบประมาณ)', 'bg_expense' => 'BG002 : ค่าบำรุงรักษา', 'bg_expense_id' => 2, 'dc_expense_budget_type_id' => 2, 'f_plan_begin' => 700000, 'f_reserve_budget' => 350000, 'budget_year' => $year_th],
	// 		['no' => 3, 'cost_name' => 'ส่วนกองทุน', 'dc_cost_acc_id' => 3, 'c_name' => 'เงินกองทุนมหาวิทยาลัย', 'bg_expense' => 'BG003 : ค่าการศึกษา', 'bg_expense_id' => 3, 'dc_expense_budget_type_id' => 3, 'f_plan_begin' => 950000, 'f_reserve_budget' => 475000, 'budget_year' => $year_th],
	// 	];
	// }
	

	// Allow only these keywords (removed generic 'เงินรายได้' to avoid faculty/hospital items)
	$allowedKeywords = [
		'เงินรายได้ส่วนงาน',
		'เงินบริจาค (นอกงบประมาณ)',
		'เงินกองทุนมหาวิทยาลัย',
		'เงินกองทุนวิจัยมหาวิทยาลัยนวมินทราธิราช',
		'เงินอุดหนุนกทม.',
		'เงินอุดหนุนรัฐบาล',
		'เงินสะสมส่วนงาน'
	];
	// Exclude specific unwanted labels (e.g. 'เงินรายได้คณะแพทย์-โรงพยาบาล')
	// also remove the Bangkok‑subsidy tax variant which should not appear
	$excludePatterns = [
		'เงินรายได้คณะแพทย์',
		'เงินรายได้คณะแพทย์ฯ',
		'เงินรายได้คณะแพทย์-โรงพยาบาล',
		'คณะแพทย์',
		'โรงพยาบาล',
		'กองทุนมหาวิทยาลัย (ภาษี)',
		'เงินบริจาค (นอกงบประมาณ) (ภาษี)',
		'เงินอุดหนุนกทม' . ' (ภาษี)' // tax version of Bangkok subsidy
	];

	// note: the Bangkok subsidy source is now handled dynamically.  we
	// no longer maintain a hard‑coded list of descriptions; every record whose
	// c_name contains "เงินอุดหนุนกทม" will be included automatically.
	// removing the manual keyword list simplifies maintenance and ensures the
	// full set of rows (e.g. 13 items) is returned.

	// For 'เงินอุดหนุนรัฐบาล': match by c_code prefix in bg_expense field
	// key = unique string, 'code' = 12-digit c_code to match prefix of bg_expense
	// 'display' = text used for placeholder row when DB has no data
	// ถ้าขึ้น 0 บาททุกตัว → ดู debug_budget_viewer.html เพื่อตรวจ c_code จริง
	$govAllowedBgKeywords = [
		// Med faculty government grant includes both 030200050000 and 030200050001 variants
		['code'=>'030200020001','display'=>'030200020001 : ค่าบำรุงซ่อมแซมครุภัณฑ์ และทรัพย์สิน'],
		['code'=>'030200050000','display'=>'030200050000 : ค่าจ้างเหมาบริการ'],
		['code'=>'030200050001','display'=>'030200050001 : ค่าจ้างเหมาบริการ'],
		['code'=>'030200100001','display'=>'030200100001 : ค่าจ้างบริการพัฒนาโปรแกรม/ดูแลรักษาเว็บไซต์/อื่นๆ'],
		['code'=>'030200120001','display'=>'030200120001 : ค่าซ่อมแซมอาคารสถานที่'],
		['code'=>'030200190001','display'=>'030200190001 : ค่าซ่อมแซมยานพาหนะ'],
		['code'=>'030300020001','display'=>'030300020001 : ค่าวัสดุไฟฟ้าและวัสดุงานบ้านฯ'],
		['code'=>'030300090001','display'=>'030300090001 : ค่ายาและเวชภัณฑ์ อวัยวะเทียม'],
		['code'=>'050100040001','display'=>'050100040001 : ครุภัณฑ์โรงงาน ไฟฟ้าและวิทยุ งานบ้านงานครัว ก่อสร้างและการเกษตร'],
		['code'=>'050100050001','display'=>'050100050001 : ครุภัณฑ์สำนักงาน'],
		['code'=>'050100060001','display'=>'050100060001 : ครุภัณฑ์โฆษณา เผยแพร่และการศึกษา'],
		['code'=>'070300030001','display'=>'070300030001 : โครงการบริการวิชาการแก่สังคม'],
		['code'=>'030300170001','display'=>'030300170001 : ค่าวัสดุการเรียนวิชาการสอน'],
		['code'=>'030200530001','display'=>'030200530001 : ค่าใช้จ่ายในการจัดกิจกรรม'],
		['code'=>'030200590001','display'=>'030200590001 : ค่าธรรมเนียมผ่านทางพิเศษ'],
		['code'=>'030200680001','display'=>'030200680001 : ค่าจ้างบริการบำรุงรักษาและซ่อมแซมแก้ไขระบบปรับอากาศ'],
		['code'=>'030200710001','display'=>'030200710001 : ค่าจ้างเหมาบริการการบำรุงรักษาหุ่นฝึกปฏิบัติการจำลองสถานะการณ์ช่วยชีวิตขั้นสูง'],
		['code'=>'030200320004','display'=>'030200320004 : ค่าจ้างเหมาบริการบำรุงรักษาหุ่นจำลองสถานะการณ์การทำคลอดขั้นสูง'],
		['code'=>'030200320011','display'=>'030200320011 : ค่าบริการโปรแกรม Adobe'],
		['code'=>'030200320015','display'=>'030200320015 : ค่าจ้างเหมาบริการบำรุงรักษาหุ่นฝึกปฏิบัติการช่วยชีวิตขั้นสูงผู้ใหญ่พร้อมอุปกรณ์จำลองคลื่นไฟฟ้า'],
		['code'=>'030300160002','display'=>'030300160002 : ค่าวัสดุในการผลิตสื่อสารการเรียนการสอน'],
		['code'=>'030300160003','display'=>'030300160003 : ค่าวัสดุโสตทัศนูปกรณ์'],
	];

	// bkkAllowedBgKeywords contains the only Bangkok subsidy descriptions we want
	// to include.  the filter below will check bg_expense against this list rather
	// than allowing every row with "เงินอุดหนุนกทม".
	$bkkAllowedBgKeywords = [
		'ค่าจ้างเหมาดูแลทรัพย์สินและรักษาความปลอดภัย',                     // 030200240001
		'ค่าวัสดุสำนักงาน',                                                      // 030300020001
		'ค่าวัสดุคอมพิวเตอร์',                                                  // 030300030001
		'ค่าวัสดุยานพาหนะ',                                                     // 030300040001
		'ค่าเครื่องแต่งกาย',                                                     // 030300050001
		'ค่าวัสดุไฟฟ้าและวัสดุงานบ้านฯ',                                      // 030300060001
		'ค่าจ้างเหมารถยนต์โดยสาร',                                              // 030200380001
		'ค่าจ้างเหมาป้องกันและกำจัดแมลงปลวก',                                // 030200650001
		'ค่าจ้างบริการบำรุงรักษาและซ่อมแซมแก้ไขลิฟท์และตู้ควบคุมไฟฟ้าฉุกเฉิน', // 030200660001
		'ค่าจ้างเหมาบริการบำรุงรักษษระบบบำบัดน้ำเสีย อาคารการุณยสภา',      // 030200670001
		'ค่าวัสดุในการผลิตสื่อการเรียนการสอน',                                // 030300160002
		'โครงการก่อสร้างหอพักนักศึกษาพยาบาลพร้อมอาคารที่จอดรถ',            // 100100550001
		'ค่าจ้างบริการบำรุงอุปกรณ์ไฟฟ้า'                                       // 030200810001
	];

	// Additional Bangkok-subsidy codes for สำนักงานอธิการบดี ONLY (identified by these c_code prefixes).
	// These are separate from $bkkAllowedBgKeywords (which are for คณะพยาบาลศาสตร์เกื้อการุณย์).
	// Matching is done by c_code prefix on bg_expense, same pattern as $govAllowedBgKeywords.
	$bkkAdminOfficeCodes = [
		['code' => '030300020001', 'display' => '030300020001 : ค่าวัสดุสำนักงาน'],
		['code' => '030300030001', 'display' => '030300030001 : ค่าวัสดุคอมพิวเตอร์'],
		['code' => '030300060001', 'display' => '030300060001 : ค่าวัสดุไฟฟ้าและวัสดุงานบ้านฯ'],
		['code' => '073100010001', 'display' => '073100010001 : ค่าใช้จ่ายในการอบรมหลักสูตรผู้บริหารระดับสูงด้านการพัฒนาผู้นำเมือง'],
		['code' => '073200010001', 'display' => '073200010001 : ค่าใช้จ่ายในการพัฒนาหอสมุดกลาง มหาวิทยาลัยนวมินทราธิราช'],
		['code' => '030300160005', 'display' => '030300160005 : ค่าวัสดุประชาสัมพันธ์'],
		['code' => '073800010002', 'display' => '073800010002 : ค่าใช้จ่ายในการพระราชทานปริญญาบัตรของมหาวิทยาลัยนวมินทราธิราช ประจำปีการศึกษา 2567'],
	];

	// รายการเงินอุดหนุนกทม. เพิ่มเติม เฉพาะวิทยาลัยพัฒนามหานคร (จับคู่ด้วยรหัสนำหน้า 12 หลัก)
	// นอกเหนือจาก $bkkAllowedBgKeywords ที่ครอบคลุม 030300020001, 030300030001, 030300060001, 030200380001 อยู่แล้ว
	$bkkMahanakhonCodes = [
		['code' => '072100010001', 'display' => '072100010001 : โครงการจัดตั้งศูนย์การทดลองของเมือง (City Lab) กรุงเทพมหานคร'],
		['code' => '030200320001', 'display' => '030200320001 : ค่าใช้สอยอื่น ๆ'],
		['code' => '030300160001', 'display' => '030300160001 : ค่าวัสดุอื่นๆ'],
		['code' => '120500010001', 'display' => '120500010001 : เงินช่วยเหลือในการจัดหาเครื่องแต่งกายให้แก่ผู้ปฏิบัติงานในมหาวิทยาลัย'],
		['code' => '140100010001', 'display' => '140100010001 : ค่าใช้จ่ายสำหรับเงินบริจาค'],
		['code' => '030300170001', 'display' => '030300170001 : ค่าวัสดุการเรียนการสอน'],
		['code' => '030200510001', 'display' => '030200510001 : ค่าธรรมเนียมต่างๆ'],
		['code' => '100100020032', 'display' => '100100020032 : โครงการจ้างบริการเครื่องถ่ายเอกสารพร้อมติดตั้ง ระยะเวลาดำเนินการ 6 ปี (งบประมาณปี 2567-2572) วงเงิน 20,725,000 บาท'],
		['code' => '100100020033', 'display' => '100100020033 : โครงการจ้างบริการเครื่องคอมพิวเตอร์ พร้อมระบบปฏิบัติการ และชุดโปรแกรมสำหรับสำนักงาน ระยะ 3 ระยะเวลา 6 ปี (2567-2572) วงเงิน 126,523,000 บาท'],
		['code' => '030200320011', 'display' => '030200320011 : ค่าบริการโปรแกรม Adobe'],
	];

	// รายการเงินอุดหนุนกทม. เพิ่มเติม เฉพาะวิทยาลัยพัฒนาชุมชนเมือง (จับคู่ด้วยรหัสนำหน้า 12 หลัก)
	// นอกเหนือจาก $bkkAllowedBgKeywords ที่ครอบคลุม 030300020001, 030300040001, 030300060001 อยู่แล้ว
	$bkkUrbanCommunityCodes = [
		['code' => '030200040001', 'display' => '030200040001 : ค่าจ้างเหมาทำความสะอาดอาคารฯ'],
		['code' => '030200190001', 'display' => '030200190001 : ค่าซ่อมแซมยานพาหนะ'],
		['code' => '030300110001', 'display' => '030300110001 : ค่าวัสดุอุปกรณ์ฝึกอบรม'],
		['code' => '030300160006', 'display' => '030300160006 : ค่าวัสดุอุปกรณ์ เอกสาร หนังสือ ตำรา วัสดุวิทยาศาสตร์ วัสดุเคมี'],
		['code' => '073800010047', 'display' => '073800010047 : โครงการบริหารจัดการศูนย์ความร่วมมือทางการศึกษาภาษาจีนแห่งประเทศไทย ระหว่างกรุงเทพมหานคร มหาวิทยาลัยนวมินทราธิราช และสถาบันขงจื้อเส้นทางสายไหมทางทะเล'],
	];

	// รายการเงินอุดหนุนกทม. เฉพาะคณะวิทยาศาสตร์และเทคโนโลยีสุขภาพ (จับคู่ด้วยรหัสนำหน้า 12 หลัก)
	// นอกเหนือจาก $bkkAllowedBgKeywords ที่ครอบคลุม 030300020001, 030300030001, 030300060001 อยู่แล้ว
	$bkkHealthSciCodes = [
		['code' => '030300220001', 'display' => '030300220001 : ค่าวัสดุในการจัดการเรียนการสอน Gen-ed'],
		['code' => '030300160006', 'display' => '030300160006 : ค่าวัสดุอุปกรณ์ เอกสาร หนังสือ ตำรา วัสดุวิทยาศาสตร์ วัสดุเคมี'],
	];

	// รายการเงินกองทุนมหาวิทยาลัย เฉพาะสำนักงานอธิการบดี (จับคู่ด้วยรหัสนำหน้า 12 หลัก)
	// แยกออกจากรายการทั่วไปของ เงินกองทุนมหาวิทยาลัย เพื่อไม่ให้ปะปนกับส่วนงานอื่น
	$universityFundAdminCodes = [
		['code' => '072600010001', 'display' => '072600010001 : โครงการมหาวิทยาลัยสีเขียว'],
		['code' => '030200320009', 'display' => '030200320009 : จ้างเหมาบำรุงรักษาระบบเครื่องแม่ข่าย (Server) ระบบเทคโนโลยีสารสนเทศและอุปกรณ์เครือข่ายของมหาวิทยาลัย (Ma Server)'],
		['code' => '073800010029', 'display' => '073800010029 : โครงการประสานความร่วมมือทางวิชาการและสร้างเครือข่ายความร่วมมือทางวิชาการกับสถาบันการศึกษาหน่วยงาน องค์กร ในประเทศและต่างประเทศ'],
	];

	// รายการเงินกองทุนมหาวิทยาลัย เฉพาะส่วนงาน: เงินรายได้ส่วนงาน (จับคู่ด้วยรหัสนำหน้า 12 หลัก)
	// ใช้แทน $departmentRevenueAllowedBgKeywords สำหรับ combination นี้โดยเฉพาะ
	$deptRevenueUniversityFundCodes = [
		'030200020001', // ค่าบำรุงรักษาซ่อมแซมครุภัณฑ์ และทรัพย์สิน
		'030200030001', // เงินสมทบกองทุนประกันสังคม
		'030200050001', // ค่าจ้างเหมาบริการ
		'030200120001', // ค่าซ่อมแซมอาคารสถานที่
		'030200190001', // ค่าซ่อมแซมยานพาหนะ
		'030200320001', // ค่าใช้สอยอื่น ๆ
		'030300020001', // ค่าวัสดุสำนักงาน
		'030300030001', // ค่าวัสดุคอมพิวเตอร์
		'030300040001', // ค่าวัสดุยานพาหนะ
		'030300060001', // ค่าวัสดุไฟฟ้าและวัสดุงานบ้านฯ
		'030300100001', // ค่าวัสดุวิทยาศาสตร์และวัสดุเคมี
		'050100040001', // ครุภัณฑ์โรงงาน ไฟฟ้าและวิทยุ งานบ้านงานครัว ก่อสร้างและการเกษตร
		'050100050001', // ครุภัณฑ์สำนักงาน
		'140100010001', // ค่าใช้จ่ายสำหรับเงินบริจาค
		'100100030008', // โครงการจัดหากล้องวงจรปิดและระบบเครือข่ายไร้สาย
		'100100020032', // โครงการจ้างบริการเครื่องถ่ายเอกสาร
		'100100020033', // โครงการจ้างบริการเครื่องคอมพิวเตอร์ ระยะ 3
		'072000010001', // ค่าใช้จ่ายในการอบรมผู้บริหารระดับสูงด้านการบูรณาการพัฒนากรุงเทพมหานครอย่างยั่งยืน
		'030200610001', // ค่าบริการจัดเก็บเอกสาร
		'072500010001', // โครงการประชุมเชิงปฏิบัติการถ่ายทอดยุทธศาสตร์สู่การปฏิบัติ
		'030200320005', // กิจกรรมประชาสัมพันธ์มหาวิทยาลัย
		'030200770001', // ค่าสอบเทียบเครื่องมือวิทยาศาสตร์
		'030200320007', // ค่าใช้จ่ายรับรองลายเซ็นต์อิเล็กทรอนิกส์
		'030200320010', // จ้างเหมาบริการทดสอบหาช่องโหว่ระบบเครือข่าย
		'030200320011', // ค่าบริการโปรแกรม Adobe
		'030200320012', // ค่าบริการใบรับรองความปลอดภัยทางอิเล็กทรอนิกส์
		'030300160003', // ค่าวัสดุโสตทัศนูปกรณ์
		'030300160004', // ค่าวัสดุสำหรับจัดพิมพ์บัตรพนง.มหาวิทยาลัย/นศ.มหาวิทยาลัย
		'030300160005', // ค่าวัสดุประชาสัมพันธ์
		'030300160008', // ค่าจ้างจัดพิมพ์กระดาษตรามหาวิทยาลัย
		'030300160009', // ค่าหนังสือรายงานประจำปี
		'073800010012', // โครงการประชุมวิชาการ
		'073800010014', // โครงการกิจการนักศึกษา
		'073800010015', // โครงการอนุรักษ์ ทำนุบำรุงศาสนา ศิลปวัฒนธรรม
		'073800010027', // โครงการทดสอบสมรรถนะทางด้านภาษาอังกฤษ
		'073800010028', // โครงการปฐมนิเทศและพัฒนาศักยภาพพนักงานมหาวิทยาลัย
		'073800010039', // โครงการบริการวิชาการแก่สังคม
		'073800010041', // โครงการศูนย์การเรียนรู้และทดสอบความสามารถในการใช้ภาษาจีน
		'041100010001', // ค่าเช่าโดเมนเนม
		'050100990004', // ครุภัณฑ์คอมพิวเตอร์
		'050100990009', // ครุภัณฑ์วิทยาศาสตร์และการแพทย์
		'030200820001', // จ้างตรวจสอบเอกสาร และกระบวนการเพื่อธำรงค์มาตรฐาน ISO/IEC27001
		'074200010001', // ค่าใช้จ่ายในการอบรมหลักสูตรผู้บริหารระดับสูง
		'074300010001', // โครงการส่งเสริมสุขภาพประชาชน
		'100100020060', // โครงการจ้างบริการเครื่องคอมพิวเตอร์ ระยะ 4
		'030200840001', // ค่าบริการ Microsoft office 365 A3 และ Microsoft Window Education License
		'030200850001', // ค่าบริการโปรแกรม Creative Cloud All Apps
		'075100010001', // โครงการฝึกอบรมด้านการประกันคุณภาพการศึกษา
		'075200010001', // โครงการรับการตรวจประเมินมาตรฐานห้องปฏิบัติการ มอก. 17025
	];

	// รายการเงินรายได้ส่วนงาน เฉพาะส่วนงาน: สำนักงานอธิการบดี (จับคู่ด้วยรหัสนำหน้า 12 หลัก)
	$adminOfficeRevenueCodes = [
		'030200020001', // ค่าบำรุงรักษาซ่อมแซมครุภัณฑ์ และทรัพย์สิน
		'030200030001', // เงินสมทบกองทุนประกันสังคม
		'030200050001', // ค่าจ้างเหมาบริการ
		'030200120001', // ค่าซ่อมแซมอาคารสถานที่
		'030200190001', // ค่าซ่อมแซมยานพาหนะ
		'030200320001', // ค่าใช้สอยอื่น ๆ
		'030300020001', // ค่าวัสดุสำนักงาน
		'030300030001', // ค่าวัสดุคอมพิวเตอร์
		'030300040001', // ค่าวัสดุยานพาหนะ
		'030300060001', // ค่าวัสดุไฟฟ้าและวัสดุงานบ้านฯ
		'030300100001', // ค่าวัสดุวิทยาศาสตร์และวัสดุเคมี
		'050100040001', // ครุภัณฑ์โรงงาน ไฟฟ้าและวิทยุ งานบ้านงานครัว ก่อสร้างและการเกษตร
		'050100050001', // ครุภัณฑ์สำนักงาน
		'140100010001', // ค่าใช้จ่ายสำหรับเงินบริจาค
		'100100030008', // โครงการจัดหากล้องวงจรปิดและระบบเครือข่ายไร้สาย
		'100100020032', // โครงการจ้างบริการเครื่องถ่ายเอกสาร
		'100100020033', // โครงการจ้างบริการเครื่องคอมพิวเตอร์ ระยะ 3
		'072000010001', // ค่าใช้จ่ายในการอบรมผู้บริหารระดับสูงด้านการบูรณาการพัฒนากรุงเทพฯ
		'030200610001', // ค่าบริการจัดเก็บเอกสาร
		'072500010001', // โครงการประชุมเชิงปฏิบัติการถ่ายทอดยุทธศาสตร์สู่การปฏิบัติ
		'030200320005', // กิจกรรมประชาสัมพันธ์มหาวิทยาลัย
		'030200770001', // ค่าสอบเทียบเครื่องมือวิทยาศาสตร์
		'030200320007', // ค่าใช้จ่ายรับรองลายเซ็นต์อิเล็กทรอนิกส์
		'030200320010', // จ้างเหมาบริการทดสอบหาช่องโหว่ระบบเครือข่าย
		'030200320011', // ค่าบริการโปรแกรม Adobe
		'030200320012', // ค่าบริการใบรับรองความปลอดภัยทางอิเล็กทรอนิกส์
		'030300160003', // ค่าวัสดุโสตทัศนูปกรณ์
		'030300160004', // ค่าวัสดุสำหรับจัดพิมพ์บัตรพนักงาน/นักศึกษา
		'030300160005', // ค่าวัสดุประชาสัมพันธ์
		'030300160008', // ค่าจ้างจัดพิมพ์กระดาษตรามหาวิทยาลัย
		'030300160009', // ค่าหนังสือรายงานประจำปี
		'073800010012', // โครงการประชุมวิชาการ
		'073800010014', // โครงการกิจการนักศึกษา
		'073800010015', // โครงการอนุรักษ์ ทำนุบำรุงศาสนา ศิลปวัฒนธรรม
		'073800010027', // โครงการทดสอบสมรรถนะทางด้านภาษาอังกฤษ
		'073800010028', // โครงการปฐมนิเทศและพัฒนาศักยภาพพนักงานมหาวิทยาลัย
		'073800010039', // โครงการบริการวิชาการแก่สังคม
		'073800010041', // โครงการศูนย์การเรียนรู้และทดสอบความสามารถในการใช้ภาษาจีน
		'041100010001', // ค่าเช่าโดเมนเนม
		'050100990004', // ครุภัณฑ์คอมพิวเตอร์
		'050100990009', // ครุภัณฑ์วิทยาศาสตร์และการแพทย์
		'030200820001', // จ้างตรวจสอบเอกสารเพื่อธำรงค์มาตรฐาน ISO/IEC27001
		'074200010001', // ค่าใช้จ่ายในการอบรมหลักสูตรผู้บริหารระดับสูง
		'074300010001', // โครงการส่งเสริมสุขภาพประชาชน
		'100100020060', // โครงการจ้างบริการเครื่องคอมพิวเตอร์ ระยะ 4
		'030200840001', // ค่าบริการ Microsoft Office 365 A3 และ Microsoft Window Education License
		'030200850001', // ค่าบริการโปรแกรม Creative Cloud All Apps
		'075100010001', // โครงการฝึกอบรมด้านการประกันคุณภาพการศึกษา
		'075200010001', // โครงการรับการตรวจประเมินมาตรฐานห้องปฏิบัติการ มอก. 17025
	];

	// รายการเงินรายได้ส่วนงาน เฉพาะส่วนงาน: วิทยาลัยพัฒนามหานคร (จับคู่ด้วยรหัสนำหน้า 12 หลัก)
	$mahanakhonRevenueCodes = [
		'030200320001', // ค่าใช้สอยอื่น ๆ
		'030300020001', // ค่าวัสดุสำนักงาน
		'030300030001', // ค่าวัสดุคอมพิวเตอร์
		'030300060001', // ค่าวัสดุไฟฟ้าและวัสดุงานบ้านฯ
		'030300160001', // ค่าวัสดุอื่นๆ
		'120500010001', // เงินช่วยเหลือในการจัดหาเครื่องแต่งกายให้แก่ผู้ปฏิบัติงานในมหาวิทยาลัย
		'140100010001', // ค่าใช้จ่ายสำหรับเงินบริจาค
		'030300170001', // ค่าวัสดุการเรียนการสอน
		'030200380001', // ค่าจ้างเหมารถยนต์โดยสาร
		'030200510001', // ค่าธรรมเนียมต่างๆ
		'100100020032', // โครงการจ้างบริการเครื่องถ่ายเอกสาร
		'100100020033', // โครงการจ้างบริการเครื่องคอมพิวเตอร์ ระยะ 3
		'030200320011', // ค่าบริการโปรแกรม Adobe
	];

	// รายการเงินรายได้ส่วนงาน เฉพาะส่วนงาน: วิทยาลัยพัฒนาชุมชนเมือง (จับคู่ด้วยรหัสนำหน้า 12 หลัก)
	$urbanCommunityRevenueCodes = [
		'030200190001', // ค่าซ่อมแซมยานพาหนะ
		'030200320001', // ค่าใช้สอยอื่น ๆ
		'030300030001', // ค่าวัสดุคอมพิวเตอร์
		'030300160001', // ค่าวัสดุอื่นๆ
		'050100050001', // ครุภัณฑ์สำนักงาน
		'120500010001', // เงินช่วยเหลือในการจัดหาเครื่องแต่งกายให้แก่ผู้ปฏิบัติงานในมหาวิทยาลัย
		'140100010001', // ค่าใช้จ่ายสำหรับเงินบริจาค
		'030200380001', // ค่าจ้างเหมารถยนต์โดยสาร
		'100100020032', // โครงการจ้างบริการเครื่องถ่ายเอกสาร
		'100100020033', // โครงการจ้างบริการเครื่องคอมพิวเตอร์ ระยะ 3
		'030200320011', // ค่าบริการโปรแกรม Adobe
		'030300160006', // ค่าวัสดุอุปกรณ์ เอกสาร หนังสือ ตำรา วัสดุวิทยาศาสตร์ วัสดุเคมี
		'030300160009', // ค่าหนังสือรายงานประจำปี
		'073800010026', // โครงการกิจกรรมพัฒนานักศึกษา
		'073800010043', // โครงการพัฒนานวัตกรรม
	];

	// รายการเงินรายได้ส่วนงาน เฉพาะส่วนงาน: คณะวิทยาศาสตร์และเทคโนโลยีสุขภาพ (จับคู่ด้วยรหัสนำหน้า 12 หลัก)
	$healthSciRevenueCodes = [
		'030200020001', // ค่าบำรุงรักษาซ่อมแซมครุภัณฑ์ และทรัพย์สิน
		'030200320001', // ค่าใช้สอยอื่น ๆ
		'030300020001', // ค่าวัสดุสำนักงาน
		'030300030001', // ค่าวัสดุคอมพิวเตอร์
		'030300060001', // ค่าวัสดุไฟฟ้าและวัสดุงานบ้านฯ
		'030300090001', // ค่ายาและเวชภัณฑ์ อวัยวะเทียม
		'030300100001', // ค่าวัสดุวิทยาศาสตร์และวัสดุเคมี
		'030300110001', // ค่าวัสดุอุปกรณ์ฝึกอบรม
		'050100050001', // ครุภัณฑ์สำนักงาน
		'120500010001', // เงินช่วยเหลือในการจัดหาเครื่องแต่งกายให้แก่ผู้ปฏิบัติงานในมหาวิทยาลัย
		'140100010001', // ค่าใช้จ่ายสำหรับเงินบริจาค
		'050100060002', // ครุภัณฑ์โฆษณา เผยแพร่
		'030300170001', // ค่าวัสดุการเรียนการสอน
		'030200380001', // ค่าจ้างเหมารถยนต์โดยสาร
		'100100020032', // โครงการจ้างบริการเครื่องถ่ายเอกสาร
		'100100020033', // โครงการจ้างบริการเครื่องคอมพิวเตอร์ ระยะ 3
		'030200770001', // ค่าสอบเทียบเครื่องมือวิทยาศาสตร์
	];

	// รายการเงินรายได้ส่วนงาน เฉพาะส่วนงาน: สำนักงานสภามหาวิทยาลัย (จับคู่ด้วยรหัสนำหน้า 12 หลัก)
	$councilOfficeRevenueCodes = [
		'030200320001', // ค่าใช้สอยอื่น ๆ
		'030300020001', // ค่าวัสดุสำนักงาน
		'120500010001', // เงินช่วยเหลือในการจัดหาเครื่องแต่งกายให้แก่ผู้ปฏิบัติงานในมหาวิทยาลัย
		'100100020032', // โครงการจ้างบริการเครื่องถ่ายเอกสารพร้อมติดตั้ง ระยะเวลาดำเนินการ 6 ปี (งบประมาณปี 2567-2572) วงเงิน 20,725,000 บาท
	];

	// For 'เงินรายได้ส่วนงาน' only allow these specific 13 item names (wildcard substring matching)
	$departmentRevenueAllowedBgKeywords = [
		'ค่าใช้สอยอื่นๆ',
		'ค่าวัสดุอื่นๆ',
		'ครุภัณฑ์โรงงาน',  // Wildcard matches both 050100040000 and 050100040001
		'ครุภัณฑ์สำนักงาน',
		'เงินช่วยเหลือในการจัดหาเครื่องแต่งกายให้แก่ผู้ปฏิบัติงาน',
		'ค่าใช้จ่ายสำหรับเงินบริจาค',
		'โครงการจัดหากล้องวงจรปิด',
		'โครงการจ้างบริการเครื่องถ่ายเอกสาร',
		'โครงการจ้างบริการเครื่องคอมพิวเตอร์',
		'ค่าจ้างบริการบำรุงรักษาและซ่อมแซมแก้ไขลิฟท์',
		'โครงการสัมมนาเชิงปฏิบัติการจัดทำแผนคณะพยาบาล',
		'โครงการจ้างบริการระบบสารสนเทศเพื่อการประกันคุณภาพ',
		'โครงการคณะพยาบาลสีเขียว'
	];

	$data = array_values(array_filter($data, function($r) use ($allowedKeywords, $excludePatterns, $bkkAllowedBgKeywords, $bkkAdminOfficeCodes, $bkkMahanakhonCodes, $bkkUrbanCommunityCodes, $bkkHealthSciCodes, $universityFundAdminCodes, $deptRevenueUniversityFundCodes, $adminOfficeRevenueCodes, $mahanakhonRevenueCodes, $urbanCommunityRevenueCodes, $healthSciRevenueCodes, $councilOfficeRevenueCodes, $govAllowedBgKeywords, $departmentRevenueAllowedBgKeywords) {
		$nameRaw = trim($r['c_name'] ?? '');
		$name = mb_strtolower($nameRaw, 'UTF-8');
		if ($name === '') return false;

		// ===== กรองเฉพาะ 6 ส่วนงานที่กำหนด =====
		$costName = trim($r['cost_name'] ?? '');
		$allowedDepts = [
			'พยาบาลศาสตร์เกื้อการุณย์',
			'สำนักงานสภามหาวิทยาลัย',
			'สำนักงานอธิการบดี',
			'วิทยาลัยพัฒนามหานคร',
			'วิทยาลัยพัฒนาชุมชนเมือง',
			'วิทยาศาสตร์และเทคโนโลยีสุขภาพ',
		];
		$deptAllowed = false;
		foreach ($allowedDepts as $dept) {
			if (mb_stripos($costName, $dept, 0, 'UTF-8') !== false) { $deptAllowed = true; break; }
		}
		if (!$deptAllowed) return false;

		// ===== สำนักงานอธิการบดี: แสดงเฉพาะ 4 แหล่งเงินที่กำหนด =====
		if (mb_stripos($costName, 'สำนักงานอธิการบดี', 0, 'UTF-8') !== false) {
			$adminAllowedFunds = [
				'เงินอุดหนุนกทม',
				'เงินสะสมส่วนงาน',
				'เงินกองทุนมหาวิทยาลัย',
				'เงินรายได้ส่วนงาน',
			];
			$fundAllowed = false;
			foreach ($adminAllowedFunds as $fund) {
				if (mb_stripos($name, mb_strtolower($fund, 'UTF-8'), 0, 'UTF-8') !== false) { $fundAllowed = true; break; }
			}
			if (!$fundAllowed) return false;
		}

		// If any exclude pattern matches, skip this row
		foreach ($excludePatterns as $ex) {
			$exLow = mb_strtolower($ex, 'UTF-8');
			if (mb_stripos($name, $exLow, 0, 'UTF-8') !== false) return false;
		}

		foreach ($allowedKeywords as $kw) {
			$kwLow = mb_strtolower($kw, 'UTF-8');
			if (mb_stripos($name, $kwLow, 0, 'UTF-8') !== false) {
				// Special rule: if this is 'เงินรายได้ส่วนงาน' then ensure the bg_expense name
				// contains one of the allowed item names (substring match).
				// กรณีพิเศษ: ถ้า c_name มีทั้ง 'เงินรายได้ส่วนงาน' และ 'เงินกองทุนมหาวิทยาลัย' → ใช้ $deptRevenueUniversityFundCodes (รหัส 12 หลัก)
				// กรณีพิเศษ: ถ้าเป็นสำนักงานอธิการบดี (cost_name มี 'สำนักงานอธิการบดี') → ใช้ $adminOfficeRevenueCodes (รหัส 12 หลัก)
				if (mb_stripos($name, mb_strtolower('เงินรายได้ส่วนงาน', 'UTF-8'), 0, 'UTF-8') !== false) {
					$bg = trim($r['bg_expense'] ?? '');
					if ($bg === '') return false;
					$bgLow = mb_strtolower($bg, 'UTF-8');
					$cNameRaw = trim($r['c_name'] ?? '');
					$costName = trim($r['cost_name'] ?? '');
					// ถ้า c_name เป็น combination เงินรายได้ส่วนงาน + เงินกองทุนมหาวิทยาลัย → ใช้รหัส 12 หลัก
					if (mb_stripos($cNameRaw, 'เงินกองทุนมหาวิทยาลัย', 0, 'UTF-8') !== false) {
						foreach ($deptRevenueUniversityFundCodes as $code) {
							if (strpos($bg, $code) === 0) return true;
						}
						return false;
					}
					// ถ้าเป็นสำนักงานอธิการบดี → ใช้ $adminOfficeRevenueCodes (รหัส 12 หลัก)
					if (mb_stripos($costName, 'สำนักงานอธิการบดี', 0, 'UTF-8') !== false) {
						foreach ($adminOfficeRevenueCodes as $code) {
							if (strpos($bg, $code) === 0) return true;
						}
						return false;
					}
					// ถ้าเป็นวิทยาลัยพัฒนามหานคร → ใช้ $mahanakhonRevenueCodes (รหัส 12 หลัก)
					if (mb_stripos($costName, 'วิทยาลัยพัฒนามหานคร', 0, 'UTF-8') !== false) {
						foreach ($mahanakhonRevenueCodes as $code) {
							if (strpos($bg, $code) === 0) return true;
						}
						return false;
					}
					// ถ้าเป็นวิทยาลัยพัฒนาชุมชนเมือง → ใช้ $urbanCommunityRevenueCodes (รหัส 12 หลัก)
					if (mb_stripos($costName, 'วิทยาลัยพัฒนาชุมชนเมือง', 0, 'UTF-8') !== false) {
						foreach ($urbanCommunityRevenueCodes as $code) {
							if (strpos($bg, $code) === 0) return true;
						}
						return false;
					}
					// ถ้าเป็นคณะวิทยาศาสตร์และเทคโนโลยีสุขภาพ → ใช้ $healthSciRevenueCodes (รหัส 12 หลัก)
					if (mb_stripos($costName, 'วิทยาศาสตร์และเทคโนโลยีสุขภาพ', 0, 'UTF-8') !== false) {
						foreach ($healthSciRevenueCodes as $code) {
							if (strpos($bg, $code) === 0) return true;
						}
						return false;
					}
					// ถ้าเป็นสำนักงานสภามหาวิทยาลัย → ใช้ $councilOfficeRevenueCodes (รหัส 12 หลัก)
					if (mb_stripos($costName, 'สำนักงานสภามหาวิทยาลัย', 0, 'UTF-8') !== false) {
						foreach ($councilOfficeRevenueCodes as $code) {
							if (strpos($bg, $code) === 0) return true;
						}
						return false;
					}
					// กรณีทั่วไป: ใช้ substring match ตามเดิม
					$foundDR = false;
					foreach ($departmentRevenueAllowedBgKeywords as $dr) {
						$drLow = mb_strtolower($dr, 'UTF-8');
						if (mb_stripos($bgLow, $drLow, 0, 'UTF-8') !== false) { $foundDR = true; break; }
					}
					if (! $foundDR) return false;
				}

// Special rule: 'เงินอุดหนุนกทม.' require bg_expense to match one of the
			// allowed Bangkok‑subsidy descriptions.  this ensures only the 13 codes
			// listed above are shown, even if the dataset contains other entries.
			if (mb_stripos($name, mb_strtolower('เงินอุดหนุนกทม', 'UTF-8'), 0, 'UTF-8') !== false) {
				$bg = trim($r['bg_expense'] ?? '');
				$bgLow = mb_strtolower($bg, 'UTF-8');
				$costName = trim($r['cost_name'] ?? '');

				// ===== แยกตาม cost_name (ส่วนงาน) =====

				// คณะพยาบาลศาสตร์เกื้อการุณย์ → ใช้ชื่อ substring match ($bkkAllowedBgKeywords)
				if (mb_stripos($costName, 'พยาบาล', 0, 'UTF-8') !== false) {
					foreach ($bkkAllowedBgKeywords as $bk) {
						if (mb_stripos($bgLow, mb_strtolower($bk, 'UTF-8'), 0, 'UTF-8') !== false) return true;
					}
					return false;
				}

				// สำนักงานอธิการบดี → ใช้รหัส 12 หลัก ($bkkAdminOfficeCodes)
				if (mb_stripos($costName, 'สำนักงานอธิการบดี', 0, 'UTF-8') !== false) {
					foreach ($bkkAdminOfficeCodes as $ac) {
						if (strpos($bg, $ac['code']) === 0) return true;
					}
					return false;
				}

				// วิทยาลัยพัฒนามหานคร → ใช้รหัส 12 หลัก ($bkkMahanakhonCodes) + ชื่อ keyword ที่ตรงกัน
				if (mb_stripos($costName, 'วิทยาลัยพัฒนามหานคร', 0, 'UTF-8') !== false) {
					foreach ($bkkMahanakhonCodes as $mc) {
						if (strpos($bg, $mc['code']) === 0) return true;
					}
					// รายการทั่วไปที่มีอยู่ใน keyword list และตรงกับวิทยาลัยนี้
					$mahanakhonKeywords = ['ค่าวัสดุสำนักงาน', 'ค่าวัสดุคอมพิวเตอร์', 'ค่าวัสดุไฟฟ้าและวัสดุงานบ้าน', 'ค่าจ้างเหมารถยนต์โดยสาร'];
					foreach ($mahanakhonKeywords as $mk) {
						if (mb_stripos($bgLow, mb_strtolower($mk, 'UTF-8'), 0, 'UTF-8') !== false) return true;
					}
					return false;
				}

				// วิทยาลัยพัฒนาชุมชนเมือง → ใช้รหัส 12 หลัก ($bkkUrbanCommunityCodes) + ชื่อ keyword ที่ตรงกัน
				if (mb_stripos($costName, 'วิทยาลัยพัฒนาชุมชนเมือง', 0, 'UTF-8') !== false) {
					foreach ($bkkUrbanCommunityCodes as $uc) {
						if (strpos($bg, $uc['code']) === 0) return true;
					}
					$urbanKeywords = ['ค่าวัสดุสำนักงาน', 'ค่าวัสดุยานพาหนะ', 'ค่าวัสดุไฟฟ้าและวัสดุงานบ้าน'];
					foreach ($urbanKeywords as $uk) {
						if (mb_stripos($bgLow, mb_strtolower($uk, 'UTF-8'), 0, 'UTF-8') !== false) return true;
					}
					return false;
				}

				// คณะวิทยาศาสตร์และเทคโนโลยีสุขภาพ → keyword ทั่วไป + รหัส 12 หลัก ($bkkHealthSciCodes)
				if (mb_stripos($costName, 'วิทยาศาสตร์และเทคโนโลยีสุขภาพ', 0, 'UTF-8') !== false) {
					$healthKeywords = ['ค่าวัสดุสำนักงาน', 'ค่าวัสดุคอมพิวเตอร์', 'ค่าวัสดุไฟฟ้าและวัสดุงานบ้าน'];
					foreach ($healthKeywords as $hk) {
						if (mb_stripos($bgLow, mb_strtolower($hk, 'UTF-8'), 0, 'UTF-8') !== false) return true;
					}
					foreach ($bkkHealthSciCodes as $hc) {
						if (strpos($bg, $hc['code']) === 0) return true;
					}
					return false;
				}

				// ส่วนงานอื่น → ใช้ชื่อ substring match ตามเดิม
				foreach ($bkkAllowedBgKeywords as $bk) {
					if (mb_stripos($bgLow, mb_strtolower($bk, 'UTF-8'), 0, 'UTF-8') !== false) return true;
				}
				return false;
				}

				// Special rule: if this is 'เงินอุดหนุนรัฐบาล' then ensure the bg_expense
				// matches one of the government-specific allowed items. If not present, exclude.
				if (mb_stripos($name, mb_strtolower('เงินอุดหนุนรัฐบาล', 'UTF-8'), 0, 'UTF-8') !== false || mb_stripos($name, mb_strtolower('อุดหนุนรัฐบาล', 'UTF-8'), 0, 'UTF-8') !== false) {
					$bg = trim($r['bg_expense'] ?? '');
					if ($bg === '') return false;
					$foundGov = false;
					foreach ($govAllowedBgKeywords as $gItem) {
						if (strpos($bg, $gItem['code']) === 0) { $foundGov = true; break; }
					}
					if (! $foundGov) return false;
				}

				// Special rule: if this is 'เงินกองทุนมหาวิทยาลัย' → อนุญาตเฉพาะ 3 รายการที่กำหนดใน $universityFundAdminCodes เท่านั้น
				// รายการอื่นทั้งหมด (รวมถึงภาษี) จะถูกบล็อกทั้งหมด
				if (mb_stripos($name, mb_strtolower('เงินกองทุนมหาวิทยาลัย', 'UTF-8'), 0, 'UTF-8') !== false) {
					$bg = trim($r['bg_expense'] ?? '');
					if ($bg === '') return false;
					if (mb_stripos($bg, '(ภาษี)', 0, 'UTF-8') !== false) return false;
					// อนุญาตเฉพาะรหัสที่อยู่ใน $universityFundAdminCodes เท่านั้น
					foreach ($universityFundAdminCodes as $uc) {
						if (strpos($bg, $uc['code']) === 0) return true;
					}
					return false; // บล็อกทุกรายการที่ไม่ได้กำหนดไว้
				}
				return true;
			}
		}
		return false;
	}));

	// always include placeholders for all government grant codes if any gov rows exist
	$hasGov = false;
	foreach ($data as $r) {
		if (mb_stripos(trim($r['c_name'] ?? ''), 'เงินอุดหนุนรัฐบาล', 0, 'UTF-8') !== false) {
			$hasGov = true;
			break;
		}
	}
	if ($hasGov) {
		$present = [];
		foreach ($data as $r) {
			$bg = trim($r['bg_expense'] ?? '');
			foreach ($govAllowedBgKeywords as $g) {
				if (strpos($bg, $g['code']) === 0) {
					$present[$g['code']] = true;
				}
			}
		}
		$refRow = null;
		foreach ($data as $r) {
			if (mb_stripos(trim($r['c_name'] ?? ''), 'เงินอุดหนุนรัฐบาล', 0, 'UTF-8') !== false) {
				$refRow = $r;
				break;
			}
		}
		foreach ($govAllowedBgKeywords as $g) {
			if (!isset($present[$g['code']])) {
				$data[] = [
					'no' => 0,
					'cost_name' => $refRow['cost_name'] ?? '',
					'dc_cost_acc_id' => $refRow['dc_cost_acc_id'] ?? 0,
					'c_name' => 'เงินอุดหนุนรัฐบาล',
					'bg_expense' => $g['display'],
					'bg_expense_id' => 0,
					'dc_expense_budget_type_id' => $refRow['dc_expense_budget_type_id'] ?? 0,
					'f_plan_begin' => 0.0,
					'f_reserve_budget' => 0.0,
					'budget_year' => $year_th
				];
			}
		}
	}

	if (in_array(intval($year_th), $fixedYears, true)) {
		// Build case-insensitive list of data names for substring matching
		$new = [];
		$rowNo = 0;
		foreach ($fixedSources as $fs) {
			$fsLow = mb_strtolower($fs, 'UTF-8');

			// Special expansion: for 'เงินรายได้ส่วนงาน' show all matching items by name (wildcard match)
			// กรณีพิเศษ: ถ้า fs มีทั้ง 'เงินรายได้ส่วนงาน' และ 'เงินกองทุนมหาวิทยาลัย' → ใช้รหัส 12 หลักจาก $deptRevenueUniversityFundCodes
			// กรณีพิเศษ: ถ้าเป็นสำนักงานอธิการบดี → ใช้รหัส 12 หลักจาก $adminOfficeRevenueCodes
			// กรณีพิเศษ: ถ้าเป็นวิทยาลัยพัฒนามหานคร → ใช้รหัส 12 หลักจาก $mahanakhonRevenueCodes
			if (mb_stripos($fsLow, mb_strtolower('เงินรายได้ส่วนงาน', 'UTF-8'), 0, 'UTF-8') !== false) {
				$isUniversityFundCombo = mb_stripos($fsLow, mb_strtolower('เงินกองทุนมหาวิทยาลัย', 'UTF-8'), 0, 'UTF-8') !== false;
				foreach ($data as $row) {
					$bg = trim($row['bg_expense'] ?? '');
					if ($bg === '') continue;
					$bgLow = mb_strtolower($bg, 'UTF-8');
					$costName = trim($row['cost_name'] ?? '');
					$isAdminOffice    = mb_stripos($costName, 'สำนักงานอธิการบดี', 0, 'UTF-8') !== false;
					$isMahanakhon     = mb_stripos($costName, 'วิทยาลัยพัฒนามหานคร', 0, 'UTF-8') !== false;
					$isUrbanCommunity = mb_stripos($costName, 'วิทยาลัยพัฒนาชุมชนเมือง', 0, 'UTF-8') !== false;
					$isHealthSci      = mb_stripos($costName, 'วิทยาศาสตร์และเทคโนโลยีสุขภาพ', 0, 'UTF-8') !== false;
					$isCouncilOffice  = mb_stripos($costName, 'สำนักงานสภามหาวิทยาลัย', 0, 'UTF-8') !== false;
					$found = false;
					if ($isUniversityFundCombo) {
						foreach ($deptRevenueUniversityFundCodes as $code) {
							if (strpos($bg, $code) === 0) { $found = true; break; }
						}
					} elseif ($isAdminOffice) {
						foreach ($adminOfficeRevenueCodes as $code) {
							if (strpos($bg, $code) === 0) { $found = true; break; }
						}
					} elseif ($isMahanakhon) {
						foreach ($mahanakhonRevenueCodes as $code) {
							if (strpos($bg, $code) === 0) { $found = true; break; }
						}
					} elseif ($isUrbanCommunity) {
						foreach ($urbanCommunityRevenueCodes as $code) {
							if (strpos($bg, $code) === 0) { $found = true; break; }
						}
					} elseif ($isHealthSci) {
						foreach ($healthSciRevenueCodes as $code) {
							if (strpos($bg, $code) === 0) { $found = true; break; }
						}
					} elseif ($isCouncilOffice) {
						foreach ($councilOfficeRevenueCodes as $code) {
							if (strpos($bg, $code) === 0) { $found = true; break; }
						}
					} else {
						foreach ($departmentRevenueAllowedBgKeywords as $dr) {
							$drLow = mb_strtolower($dr, 'UTF-8');
							if (mb_stripos($bgLow, $drLow, 0, 'UTF-8') !== false) { $found = true; break; }
						}
					}
					if ($found) {
						$rowNo++;
						$r = $row;
						$r['no'] = $rowNo;
						$r['budget_year'] = $year_th;
						$new[] = $r;
					}
				}
				continue;
			}

// 🔥 Special expansion: สำหรับ "เงินบริจาค (นอกงบประมาณ)"
if (mb_stripos($fsLow, mb_strtolower('เงินบริจาค (นอกงบประมาณ)', 'UTF-8'), 0, 'UTF-8') !== false) {

    foreach ($data as $row) {

        $name = trim($row['c_name'] ?? '');
        if ($name === '') continue;

        if (mb_stripos($name, 'เงินบริจาค (นอกงบประมาณ)', 0, 'UTF-8') !== false) {
            $rowNo++;
            $r = $row;
            $r['no'] = $rowNo;
            $r['budget_year'] = $year_th;
            $new[] = $r;
        }
    }

    continue;
}

			// Special expansion: for 'เงินอุดหนุนกทม.' แยกตาม cost_name (ส่วนงาน) เพื่อไม่ให้ปะปนกัน
			if (mb_stripos($fsLow, mb_strtolower('เงินอุดหนุนกทม', 'UTF-8'), 0, 'UTF-8') !== false) {
				$seenBg = [];
				foreach ($data as $row) {
					if (!isset($row['c_name'])) continue;
					if (mb_stripos($row['c_name'], 'เงินอุดหนุนกทม', 0, 'UTF-8') === false) continue;
					$bg = trim($row['bg_expense'] ?? '');
					$key = mb_strtolower($bg, 'UTF-8');
					if ($bg === '' || isset($seenBg[$key])) continue;
					$bgLow = $key;
					$costName = trim($row['cost_name'] ?? '');
					$allowed = false;

					if (mb_stripos($costName, 'พยาบาล', 0, 'UTF-8') !== false) {
						// คณะพยาบาลฯ → ชื่อ substring
						foreach ($bkkAllowedBgKeywords as $bk) {
							if (mb_stripos($bgLow, mb_strtolower($bk, 'UTF-8'), 0, 'UTF-8') !== false) { $allowed = true; break; }
						}
					} elseif (mb_stripos($costName, 'สำนักงานอธิการบดี', 0, 'UTF-8') !== false) {
						// สำนักงานอธิการบดี → รหัส 12 หลัก
						foreach ($bkkAdminOfficeCodes as $ac) {
							if (strpos($bg, $ac['code']) === 0) { $allowed = true; break; }
						}
					} elseif (mb_stripos($costName, 'วิทยาลัยพัฒนามหานคร', 0, 'UTF-8') !== false) {
						// วิทยาลัยพัฒนามหานคร → รหัส 12 หลัก + keyword เฉพาะ
						foreach ($bkkMahanakhonCodes as $mc) {
							if (strpos($bg, $mc['code']) === 0) { $allowed = true; break; }
						}
						if (!$allowed) {
							$mkw = ['ค่าวัสดุสำนักงาน', 'ค่าวัสดุคอมพิวเตอร์', 'ค่าวัสดุไฟฟ้าและวัสดุงานบ้าน', 'ค่าจ้างเหมารถยนต์โดยสาร'];
							foreach ($mkw as $mk) {
								if (mb_stripos($bgLow, mb_strtolower($mk, 'UTF-8'), 0, 'UTF-8') !== false) { $allowed = true; break; }
							}
						}
					} elseif (mb_stripos($costName, 'วิทยาลัยพัฒนาชุมชนเมือง', 0, 'UTF-8') !== false) {
						// วิทยาลัยพัฒนาชุมชนเมือง → รหัส 12 หลัก + keyword เฉพาะ
						foreach ($bkkUrbanCommunityCodes as $uc) {
							if (strpos($bg, $uc['code']) === 0) { $allowed = true; break; }
						}
						if (!$allowed) {
							$ukw = ['ค่าวัสดุสำนักงาน', 'ค่าวัสดุยานพาหนะ', 'ค่าวัสดุไฟฟ้าและวัสดุงานบ้าน'];
							foreach ($ukw as $uk) {
								if (mb_stripos($bgLow, mb_strtolower($uk, 'UTF-8'), 0, 'UTF-8') !== false) { $allowed = true; break; }
							}
						}
					} else {
						// ส่วนงานอื่น → ชื่อ substring ตามเดิม
						foreach ($bkkAllowedBgKeywords as $bk) {
							if (mb_stripos($bgLow, mb_strtolower($bk, 'UTF-8'), 0, 'UTF-8') !== false) { $allowed = true; break; }
						}
					}

					if (!$allowed) continue;
					$seenBg[$key] = true;
					$rowNo++;
					$r = $row;
					$r['no'] = $rowNo;
					$r['budget_year'] = $year_th;
					$new[] = $r;
				}
				// Placeholder rows สำหรับรหัสที่ยังไม่มีข้อมูลใน DB
				$refRow = null;
				foreach ($data as $row) {
					if (mb_stripos(trim($row['c_name'] ?? ''), 'เงินอุดหนุนกทม', 0, 'UTF-8') !== false) { $refRow = $row; break; }
				}
				foreach ($bkkAdminOfficeCodes as $ac) {
					$found = false;
					foreach ($new as $nr) {
						if (strpos(trim($nr['bg_expense'] ?? ''), $ac['code']) === 0) { $found = true; break; }
					}
					if (!$found) {
						$rowNo++;
						$new[] = ['no' => $rowNo, 'cost_name' => $refRow['cost_name'] ?? '', 'dc_cost_acc_id' => $refRow['dc_cost_acc_id'] ?? 0, 'c_name' => $fs, 'bg_expense' => $ac['display'], 'bg_expense_id' => 0, 'dc_expense_budget_type_id' => $refRow['dc_expense_budget_type_id'] ?? 0, 'f_plan_begin' => 0.0, 'f_reserve_budget' => 0.0, 'budget_year' => $year_th];
					}
				}
				foreach ($bkkMahanakhonCodes as $mc) {
					$found = false;
					foreach ($new as $nr) {
						if (strpos(trim($nr['bg_expense'] ?? ''), $mc['code']) === 0) { $found = true; break; }
					}
					if (!$found) {
						$rowNo++;
						$new[] = ['no' => $rowNo, 'cost_name' => $refRow['cost_name'] ?? '', 'dc_cost_acc_id' => $refRow['dc_cost_acc_id'] ?? 0, 'c_name' => $fs, 'bg_expense' => $mc['display'], 'bg_expense_id' => 0, 'dc_expense_budget_type_id' => $refRow['dc_expense_budget_type_id'] ?? 0, 'f_plan_begin' => 0.0, 'f_reserve_budget' => 0.0, 'budget_year' => $year_th];
					}
				}
				foreach ($bkkUrbanCommunityCodes as $uc) {
					$found = false;
					foreach ($new as $nr) {
						if (strpos(trim($nr['bg_expense'] ?? ''), $uc['code']) === 0) { $found = true; break; }
					}
					if (!$found) {
						$rowNo++;
						$new[] = ['no' => $rowNo, 'cost_name' => $refRow['cost_name'] ?? '', 'dc_cost_acc_id' => $refRow['dc_cost_acc_id'] ?? 0, 'c_name' => $fs, 'bg_expense' => $uc['display'], 'bg_expense_id' => 0, 'dc_expense_budget_type_id' => $refRow['dc_expense_budget_type_id'] ?? 0, 'f_plan_begin' => 0.0, 'f_reserve_budget' => 0.0, 'budget_year' => $year_th];
					}
				}
				continue;
			}
			if (mb_stripos($fsLow, mb_strtolower('เงินอุดหนุนรัฐบาล', 'UTF-8'), 0, 'UTF-8') !== false || mb_stripos($fsLow, mb_strtolower('อุดหนุนรัฐบาล', 'UTF-8'), 0, 'UTF-8') !== false) {
			foreach ($govAllowedBgKeywords as $gItem) {
					$rowNo++;
					$found = null;
					$cCode     = $gItem['code'];
					$gkDisplay = $gItem['display'];
					foreach ($data as $row) {
						$bg = trim($row['bg_expense'] ?? '');
						if ($bg === '') continue;
						$cName = trim($row['c_name'] ?? '');
						if (mb_stripos($cName, 'เงินอุดหนุนรัฐบาล', 0, 'UTF-8') === false) continue;
						if (strpos($bg, $cCode) === 0) { $found = $row; break; }
					}
					if ($found !== null) {
						$r = $found;
						$r['no'] = $rowNo;
						$r['budget_year'] = $year_th;
						$new[] = $r;
					} else {
						$refRow = null;
						foreach ($data as $dr) {
							if (mb_stripos(trim($dr['c_name'] ?? ''), 'เงินอุดหนุนรัฐบาล', 0, 'UTF-8') !== false) {
								$refRow = $dr; break;
							}
						}
						$new[] = [
							'no' => $rowNo,
							'cost_name' => $refRow['cost_name'] ?? '',
							'dc_cost_acc_id' => $refRow['dc_cost_acc_id'] ?? 0,
							'c_name' => $fs,
							'bg_expense' => $gkDisplay,
							'bg_expense_id' => 0,
							'dc_expense_budget_type_id' => $refRow['dc_expense_budget_type_id'] ?? 0,
							'f_plan_begin' => 0.0,
							'f_reserve_budget' => 0.0,
							'budget_year' => $year_th
						];
					}
				}
				continue;
			}

			
			
			// Special expansion: for 'เงินกองทุนมหาวิทยาลัย' include all matching bg_expense items from data, excluding those with '(ภาษี)'
			// พร้อมเพิ่มรายการของสำนักงานอธิการบดีที่กำหนดใน $universityFundAdminCodes
			if (mb_stripos($fsLow, mb_strtolower('เงินกองทุนมหาวิทยาลัย', 'UTF-8'), 0, 'UTF-8') !== false) {
				$seenBgFund = [];
				foreach ($data as $row) {
					$name = trim($row['c_name'] ?? '');
					if ($name === '') continue;
					$nameLow = mb_strtolower($name, 'UTF-8');
					if (mb_stripos($nameLow, $fsLow, 0, 'UTF-8') !== false) {
						$bg = trim($row['bg_expense'] ?? '');
						if (mb_stripos($bg, '(ภาษี)', 0, 'UTF-8') !== false) continue; // ตัดรายการภาษีออก
						// อนุญาตเฉพาะรายการในรายชื่อสำนักงานอธิการบดี (ถ้ามีการกำหนดไว้)
						$isAdminCode = false;
						foreach ($universityFundAdminCodes as $uc) {
							if (strpos($bg, $uc['code']) === 0) { $isAdminCode = true; break; }
						}
						if ($isAdminCode) {
							$key = mb_strtolower($bg, 'UTF-8');
							if (!isset($seenBgFund[$key])) {
								$seenBgFund[$key] = true;
								$rowNo++;
								$r = $row;
								$r['no'] = $rowNo;
								$r['budget_year'] = $year_th;
								$new[] = $r;
							}
						}
					}
				}
				// เพิ่ม placeholder สำหรับรหัสที่ยังไม่มีข้อมูลใน DB
				$refRowFund = null;
				foreach ($data as $row) {
					if (mb_stripos(trim($row['c_name'] ?? ''), 'เงินกองทุนมหาวิทยาลัย', 0, 'UTF-8') !== false) { $refRowFund = $row; break; }
				}
				foreach ($universityFundAdminCodes as $uc) {
					$found = false;
					foreach ($new as $nr) {
						if (strpos(trim($nr['bg_expense'] ?? ''), $uc['code']) === 0) { $found = true; break; }
					}
					if (!$found) {
						$rowNo++;
						$new[] = [
							'no' => $rowNo,
							'cost_name' => $refRowFund['cost_name'] ?? '',
							'dc_cost_acc_id' => $refRowFund['dc_cost_acc_id'] ?? 0,
							'c_name' => $fs,
							'bg_expense' => $uc['display'],
							'bg_expense_id' => 0,
							'dc_expense_budget_type_id' => $refRowFund['dc_expense_budget_type_id'] ?? 0,
							'f_plan_begin' => 0.0,
							'f_reserve_budget' => 0.0,
							'budget_year' => $year_th
						];
					}
				}
				continue;
			}

			// Default: try to find an existing row for this funding source
			$found = null;
			foreach ($data as $row) {
				$name = trim($row['c_name'] ?? '');
				if ($name === '') continue;
				$nameLow = mb_strtolower($name, 'UTF-8');
				if (mb_stripos($nameLow, $fsLow, 0, 'UTF-8') !== false || mb_stripos($fsLow, $nameLow, 0, 'UTF-8') !== false) {
					$found = $row;
					break;
				}
			}
			$rowNo++;
			if ($found !== null) {
				$r = $found;
				$r['no'] = $rowNo;
				$r['budget_year'] = $year_th;
				$new[] = $r;
			} else {
				$new[] = [
					'no' => $rowNo,
					'cost_name' => '',
					'dc_cost_acc_id' => 0,
					'c_name' => $fs,
					'bg_expense' => '',
					'bg_expense_id' => 0,
					'dc_expense_budget_type_id' => 0,
					'f_plan_begin' => 0.0,
					'f_reserve_budget' => 0.0,
					'budget_year' => $year_th
				];
			}
		}
		$data = $new;
	}

	$response = [
		'debug' => true,
		'data' => $data,
		'year_th' => $year_th,
		'year_en' => $year_en,
		'totalCount' => count($data)
	];

} else {
	http_response_code(400);
	$response = ['error' => 'Invalid fn parameter'];
}

// Clean all output and send clean JSON
while (ob_get_level() > 0) { ob_end_clean(); }
echo json_encode($response, JSON_UNESCAPED_UNICODE | JSON_NUMERIC_CHECK);
exit(0);

} catch (\Throwable $e) {
	while (ob_get_level() > 0) { ob_end_clean(); }
	http_response_code(500);
	$errResp = ['error' => $e->getMessage()];
	echo json_encode($errResp, JSON_UNESCAPED_UNICODE);
	exit(0);
}
?>