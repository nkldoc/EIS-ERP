<?php
include("../../conf/config.php");
include("../../lib/database/DatabaseServer.php");
include("../../lib/date/i_date.class.php");
include("../../lib/export/ArrayToXlsx.php");


$db = new DatabaseServer();
$date = new i_date();

$root = "data";
$data = array();
$con = null;
$DB_NAME = "";//"NMU_ASSET..";

function List_QueryParam()
{
	global $db, $date, $root, $data, $con, $arr_status;
	$DB_NAME = 'NMU_ERP..';

    $mm_start = ($_REQUEST['mm_start'] > '09' ? $_REQUEST['i_year'] - 1 : $_REQUEST['i_year']) . $_REQUEST['mm_start'];
	$mm_end = ($_REQUEST['mm_end'] > '09' ? $_REQUEST['i_year'] - 1 : $_REQUEST['i_year']) . $_REQUEST['mm_end'];
	$sqlMain = "
		SET NOCOUNT ON
		DECLARE @c_yyyy_m1 AS VARCHAR(10) = {$mm_start};
		DECLARE @c_yyyy_m2 AS VARCHAR(10) = {$mm_end};



		/*หายอดยกมา*/
		SELECT a.am_asset_hdr_id
		, CASE WHEN b.max_ym = @c_yyyy_m1 THEN a.f_depre_begin ELSE a.f_depre_after END AS f_depre_after
		INTO #temp_begin
		FROM {$DB_NAME} am_tran_depre a
		INNER JOIN
		(SELECT
		am_asset_hdr_id, MAX(c_yyyy_mm) AS max_ym
		FROM {$DB_NAME} am_tran_depre WHERE c_yyyy_mm <= @c_yyyy_m1
		GROUP BY am_asset_hdr_id) b ON a.am_asset_hdr_id = b.am_asset_hdr_id AND a.c_yyyy_mm = b.max_ym;

		/*ค่าเสื่อมแต่หละเดือน*/
		SELECT am_asset_hdr_id
		, SUM(f_depre) AS f_depre
		INTO #temp_depre
		FROM {$DB_NAME} am_tran_depre td
		WHERE c_yyyy_mm BETWEEN @c_yyyy_m1 AND @c_yyyy_m2
		GROUP BY am_asset_hdr_id;


		SELECT
		isnull(c.c_name,'--ไม่ระบุหมวด--') AS c_name --'ชื่อหมวด'
		,sum(ISNULL(tb.f_depre_after, b.f_depre_begin)) as f_begin--'ค่าเสื่อมสะสมยกมา'
		, sum(case when b.dc_expense_budget_type_id =1 then td.f_depre else 0.00 end) as s1--'เงินรายได้คณะแพทย์ฯ-การศึกษา'
		, sum(case when b.dc_expense_budget_type_id =2 then td.f_depre else 0.00 end) as s2--'เงินรายได้คณะแพทย์ฯ-โรงพยาบาล'
		, sum(case when b.dc_expense_budget_type_id =3 then td.f_depre else 0.00 end) as s3--'เงินรายได้โรงพยาบาล + การศึกษา'
		, sum(case when b.dc_expense_budget_type_id =4 then td.f_depre else 0.00 end) as s4--'เงินอุดหนุนกทม.'
		, sum(case when b.dc_expense_budget_type_id =5 then td.f_depre else 0.00 end)  as s5--'เงินอุดหนุนรัฐบาล'
		, sum(case when b.dc_expense_budget_type_id =6 then td.f_depre else 0.00 end)  as s6--'เงินกองทุนอนุรักษ์พลังงาน (ค่าสนับสนุนที่ปรึกษา)'
		, sum(case when b.dc_expense_budget_type_id =7 then td.f_depre else 0.00 end)  as s7--'เงินกองทุนอนุรักษ์พลังงาน (ค่าสนับสนุนการลงทุน)'
		, sum(case when b.dc_expense_budget_type_id =8 then td.f_depre else 0.00 end)  as s8--'เงินสะสมคณะแพทย์ฯ'
		, sum(case when b.dc_expense_budget_type_id =9 then td.f_depre else 0.00 end)  as s9--'เงินรายได้คณะแพทย์ฯ-โรงพยาบาล (V-Net)'
		, sum(case when b.dc_expense_budget_type_id =10 then td.f_depre else 0.00 end) as s10--'เงินบริจาค'
		, sum(case when b.dc_expense_budget_type_id =11 then td.f_depre else 0.00 end) as s11--'เงินกู้เดนมาร์ก'
		, sum(case when b.dc_expense_budget_type_id =12 then td.f_depre else 0.00 end) as s12--'เงินสมทบก่อสร้าง--'
		, sum(case when b.dc_expense_budget_type_id =13 then td.f_depre else 0.00 end) as s13--'เงินบริจาค (พระราชทาน)--'
		, sum(case when b.dc_expense_budget_type_id =14 then td.f_depre else 0.00 end) as s14--'รับโอนจากส่วนงานอื่น--'
		, sum(case when b.dc_expense_budget_type_id =15 then td.f_depre else 0.00 end) as s15--'เงินกองทุนเพื่อพัฒนาการศึกษาคณะแพทยศาสตร์วชิรพยาบาล--'
		, sum(case when b.dc_expense_budget_type_id =16 then td.f_depre else 0.00 end) as s16--'เงินกองทุนพัฒนาคณะแพทยศาสตร์วชิรพยาบาล--'
		, sum(case when b.dc_expense_budget_type_id =17 then td.f_depre else 0.00 end) as s17--'เงินทดรองจ่ายคณะแพทยศาสตร์วชิรพยาบาล--'
		, sum(case when b.dc_expense_budget_type_id =18 then td.f_depre else 0.00 end) as s18--'เงินกองทุนเพื่อพัฒนาอาคารสถานที่คณะแพทยศาสตร์วชิรพยาบาล--'
		, sum(case when b.dc_expense_budget_type_id =19 then td.f_depre else 0.00 end) as s19--'เงินฝากนอกงบประมาณ-วพบ.--'
		, sum(case when b.dc_expense_budget_type_id =20 then td.f_depre else 0.00 end) as s20--'เงินยืมคณะแพทยศาสตร์วชิรพยาบาล--'
		, sum(case when b.dc_expense_budget_type_id =21 then td.f_depre else 0.00 end) as s21--'พักเงินสมทบประกันสังคมและเงินค้ำประกันฯ--'
		, sum(case when b.dc_expense_budget_type_id =22 then td.f_depre else 0.00 end) as s22--'บัญชีพักเงินสมทบประกันสังคมและประกันสัญญา--'
		, sum(case when b.dc_expense_budget_type_id =23 then td.f_depre else 0.00 end) as s23--'บัญชีพักเงินสมทบประกันสังคมและประกันสัญญา--'
		, sum(case when b.dc_expense_budget_type_id =24 then td.f_depre else 0.00 end) as s24--'เงินกองทุนสนับสนุนการวิจัยคณะแพทยศาสตร์วชิรพยาบาล--'
		, sum(case when b.dc_expense_budget_type_id =25 then td.f_depre else 0.00 end) as s25--'เงินบริจาคคณะแพทยศาสตร์วชิรพยาบาล--'
		, sum(case when b.dc_expense_budget_type_id =26 then td.f_depre else 0.00 end) as s26--'บัญชีพักภาษีหัก ณ ที่จ่าย ฯ --'
		, sum(case when b.dc_expense_budget_type_id =27 then td.f_depre else 0.00 end) as s27--'เงินรายได้คณะแพทยศาสตร์วชิรพยาบาล - รพ. (ถอนคืน)--'
		, sum(case when b.dc_expense_budget_type_id =28 then td.f_depre else 0.00 end) as s28--'เงินรายได้คณะแพทยศาสตร์วชิรพยาบาล (เงินรับโอนจากแหล่งเงินภายนอก)--'
		, sum(case when b.dc_expense_budget_type_id =29 then td.f_depre else 0.00 end) as s29--'เงินรายได้คณะแพทยศาสตร์วชิรพยาบาล - การศึกษา (ถอนคืน)--'
		, sum(case when b.dc_expense_budget_type_id =30 then td.f_depre else 0.00 end) as s30--'เงินบริจาค (นอกงบประมาณ)--'
		, sum(case when b.dc_expense_budget_type_id =31 then td.f_depre else 0.00 end) as s31--'สนง.คณะกรรมการดิจิทัลเพื่อเศรษฐกิจและสังคมแห่งชาติ--'
		, sum(case when b.dc_expense_budget_type_id =32 then td.f_depre else 0.00 end) as s32--'เงินอุดหนุนรัฐบาล (ถอน)--'
		, sum(case when b.dc_expense_budget_type_id =33 then td.f_depre else 0.00 end) as s33--'เงินอุดหนุนกทม. (ถอน)--'
		, sum(case when b.dc_expense_budget_type_id =34 then td.f_depre else 0.00 end) as s34--'-ไม่ระบุแหล่งเงิน---'
		, sum(case when b.dc_expense_budget_type_id =35 then td.f_depre else 0.00 end) as s35--'เงินบริจาค (นอกงบประมาณ) (ถอนคืน)--'
		FROM {$DB_NAME} am_asset_hdr b
			INNER JOIN {$DB_NAME} am_mode_acc c  on b.am_mode_id = c.am_mode_id
			LEFT JOIN #temp_begin tb ON b.am_asset_hdr_id = tb.am_asset_hdr_id
			LEFT JOIN #temp_depre td ON b.am_asset_hdr_id = td.am_asset_hdr_id
		WHERE CAST(YEAR(b.d_receive_date) AS VARCHAR(4))+RIGHT('0'+CAST(MONTH(b.d_receive_date) AS VARCHAR(2)) , 2) <= @c_yyyy_m2
		group BY  c.c_name;
	";

	$arrParam[]	= null;

	$stmt = $db->QueryParam($sqlMain, $arrParam);

	if ($_REQUEST["type"] != "excel2007") {
		if ($stmt) {
			$on = 0;
			$f_begin = 0;
			$f_s[] = null;
			for ($i = 1; $i <= 35; ++$i) {
				$f_s[$i] = 0;
			}

			while ($row = $db->Fetch($stmt)) {
				$f_begin +=	$row["f_begin"];
				for ($i = 1; $i <= 35; ++$i) {
					$f_s[$i] += $row["s" . $i];
				}

				// $f_unit_cost += $row["f_unit_cost"];
				// $f_depre_begin += $row["f_depre_begin"];
				// $f_depre += $row["f_depre"];
				// $f_mm_sum += $row["f_mm_sum"];

				$temp = array(
					"no"                =>	++$on,
					"i_type"            =>	'1',
					"c_name"		=>	$row["c_name"],
					"f_begin"		=>	$row["f_begin"],
					"s1"			=>	$row["s1"],
					"s2"			=>	$row["s2"],
					"s3"			=>	$row["s3"],
					"s4"			=>	$row["s4"],
					"s5"			=>	$row["s5"],
					"s6"			=>	$row["s6"],
					"s7"			=>	$row["s7"],
					"s8"			=>	$row["s8"],
					"s9"			=>	$row["s9"],
					"s10"			=>	$row["s10"],
					"s11"			=>	$row["s11"],
					"s12"			=>	$row["s12"],
					"s13"			=>	$row["s13"],
					"s14"			=>	$row["s14"],
					"s15"			=>	$row["s15"],
					"s16"			=>	$row["s16"],
					"s17"			=>	$row["s17"],
					"s18"			=>	$row["s18"],
					"s19"			=>	$row["s19"],
					"s20"			=>	$row["s20"],
					"s21"			=>	$row["s21"],
					"s22"			=>	$row["s22"],
					"s23"			=>	$row["s23"],
					"s24"			=>	$row["s24"],
					"s25"			=>	$row["s25"],
					"s26"			=>	$row["s26"],
					"s27"			=>	$row["s27"],
					"s28"			=>	$row["s28"],
					"s29"			=>	$row["s29"],
					"s30"			=>	$row["s30"],
					"s31"			=>	$row["s31"],
					"s32"			=>	$row["s32"],
					"s33"			=>	$row["s33"],
					"s34"			=>	$row["s34"],
					"s35"			=>	$row["s35"],
				);
				${$root}[]	= $temp;
			}
			$temp = array(
				"i_type"            => '2',
				"c_name"    => 'รวมทั้งสิ้น :',
				"f_begin"		=>	$f_begin,
				"s1"			=>	$f_s["1"],
				"s2"			=>	$f_s["2"],
				"s3"			=>	$f_s["3"],
				"s4"			=>	$f_s["4"],
				"s5"			=>	$f_s["5"],
				"s6"			=>	$f_s["6"],
				"s7"			=>	$f_s["7"],
				"s8"			=>	$f_s["8"],
				"s9"			=>	$f_s["9"],
				"s10"			=>	$f_s["10"],
				"s11"			=>	$f_s["11"],
				"s12"			=>	$f_s["12"],
				"s13"			=>	$f_s["13"],
				"s14"			=>	$f_s["14"],
				"s15"			=>	$f_s["15"],
				"s16"			=>	$f_s["16"],
				"s17"			=>	$f_s["17"],
				"s18"			=>	$f_s["18"],
				"s19"			=>	$f_s["19"],
				"s20"			=>	$f_s["20"],
				"s21"			=>	$f_s["21"],
				"s22"			=>	$f_s["22"],
				"s23"			=>	$f_s["23"],
				"s24"			=>	$f_s["24"],
				"s25"			=>	$f_s["25"],
				"s26"			=>	$f_s["26"],
				"s27"			=>	$f_s["27"],
				"s28"			=>	$f_s["28"],
				"s29"			=>	$f_s["29"],
				"s30"			=>	$f_s["30"],
				"s31"			=>	$f_s["31"],
				"s32"			=>	$f_s["32"],
				"s33"			=>	$f_s["33"],
				"s34"			=>	$f_s["34"],
				"s35"			=>	$f_s["35"],
			);
			${$root}[]	= $temp;
		}
		return json_encode(array("debug" => true,  $root => ${$root}));
	} else {
		if ($stmt) {


			$columns[] = "ลำดับ";
			$columns[] = "เลขเอกสารอ้างอิง";
			$columns[] = "เลขที่ GX";
			$columns[] = "รหัสสินทรัพย์";
			$columns[] = "ชื่อสินทรัพย์";
			$columns[] = "หมวดบัญชีสินทรัพย์";
			$columns[] = "ชื่อบัญชี";
			$columns[] = "แหล่งเงิน";
			$columns[] = "อายุการใช้งาน";
			$columns[] = "วันที่รับ";
			$columns[] = "ราคาทุน";
			$columns[] = "ค่าเสื่อมสะสมยกมา";
			$columns[] = "ค่าเสื่อมประจำเดือน";
			$columns[] = "ค่าเสื่อมสะสมยกไป";
			${$root}[] = $columns;
			$on = 0;
			$f_unit_cost = 0;
			$f_depre_begin = 0;
			$f_depre = 0;
			$f_mm_sum = 0;
			while ($row = $db->Fetch($stmt)) {
				$f_unit_cost += $row['f_unit_cost'];
				$f_depre += $row['f_depre'];
				$f_depre_begin += $row['f_depre_begin'];
				$f_mm_sum += $row['f_mm_sum'];

				$temp = array(
					"no"                =>	++$on,
					"c_ref_doc"			=>	$row["c_ref_doc"],
					"gx_code"			=>	$row["gx_code"],
					"c_code"			=>	$row["c_code"],
					"c_name"			=>	$row["c_name"],
					"am_mode_name"		=>	$row["am_mode_name"],
					"acc_name"			=>	$row["acc_name"],
					"budget_source"		=>	$row["budget_source"],
					"i_period_year"		=>	$row["i_period_year"],
					"d_receive_date"    => ($row["d_receive_date"] != "") ? $date->shot_date_from_db($row["d_receive_date"]) : "",
					"f_unit_cost"     =>	$row["f_unit_cost"]  == '' ? '0.00' : $row["f_unit_cost"],
					"f_depre_begin"     =>	$row["f_depre_begin"]  == '' ? '0.00' : $row["f_depre_begin"],
					"f_depre"     =>	$row["f_depre"]  == '' ? '0.00' : $row["f_depre"],
					"f_mm_sum"     =>	$row["f_mm_sum"]  == '' ? '0.00' : $row["f_mm_sum"],
				);
				// foreach ($mm_arr as $value) {
				// 	$temp[$value] = $row[$value] == '' ? '0.00' : $row[$value];
				// }
				// $temp["f_mm_sum"] = $row["f_mm_sum"] == '' ? '0.00' : $row["f_mm_sum"];

				${$root}[]	= $temp;
			}
			$temp = array(
				"no"                => "รวมทั้งสิ้น",
				"c_ref_doc"			=>	'',
				"gx_code"			=>	'',
				"c_code"			=>  '',
				"c_name"			=>  '',
				"am_mode_name"		=>	'',
				"acc_name"			=>	'',
				"budget_source"		=>	'',
				"i_period_year"		=>	'',
				"d_receive_date"    => 	'',
				"f_unit_cost"       =>  $f_unit_cost == '' ? '0.00' : $f_unit_cost,
				"f_depre_begin"     =>  $f_depre_begin == '' ? '0.00' : $f_depre_begin,
				"f_depre"     =>  $f_depre == '' ? '0.00' : $f_depre,
				"f_mm_sum"     =>  $f_mm_sum == '' ? '0.00' : $f_mm_sum,

			);
			// ${$root}[]	= $temp;
		}
		$xlsx = new ArrToXlsx();
		$xlsx->ArrToXlsx(${$root}, "รายงานครุภัณฑ์");
	}
}
