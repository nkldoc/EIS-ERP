<?php
include("../../lib/database/DatabaseServer.php");
include("../../lib/database/apiUtil.php");

$db		= new DatabaseServer();
$util	= new apiUtil();

$root	= "data";
$data	= array();
$con	= null;

if ($_REQUEST["type"] == "dc_cost") {

	$sqlMain	= "
		SELECT * FROM NMU.dbo.dc_cost
		WHERE i_last = 1 AND i_enable = 1 AND i_delete = 2
			AND c_code LIKE '04%'
		ORDER BY c_code";
	$arrParam	= array(STATUS_ENABLE, 1);
	$stmt = $db->QueryParam($sqlMain, $arrParam);
	if ($stmt) {

		if (@$_REQUEST["all"] == "all") {
			${$root}[] = array(
				"id"		=> "0",
				"c_code"	=> "",
				"c_name"	=> "- เลือกทั้งหมด -"
			);
		}

		while ($row = $db->Fetch($stmt)) {
			$temp = array(
				"id"		=> "{$row["dc_cost_id"]}",
				"c_name"	=> $row["c_code"] . " : " . $row["c_name"]
			);
			${$root}[] = $temp;
		}
	}
} else if ($_REQUEST["type"] == "po_user") {
	$sqlMain	= "select a.dc_user_id,a.c_full_name from NMU.dbo.dc_user a 
	inner join NMU.dbo.dc_user_menu b on b.dc_user_id=a.dc_user_id
	where b.dc_menu_id =(SELECT dc_menu_id FROM dc_menu where c_filelocation='po-RegPo')
	AND a.i_enable = ?
	group by a.dc_user_id,a.c_full_name
	ORDER BY a.c_full_name";
	$arrParam	= array(STATUS_ENABLE);
	$stmt = $db->QueryParam($sqlMain, $arrParam);
	if ($stmt) {
		$all = true;
		if ($all == "all") {
			${$root}[] = array(
				"id"		=> 0,
				"c_name"	=> "- เลือกผู้ทำรายการ-"
			);
		}

		while ($row = $db->Fetch($stmt)) {
			$temp = array(
				"id"		=> "{$row["dc_user_id"]}",
				"c_name"	=> "{$row["c_full_name"]}"
			);
			${$root}[] = $temp;
		}
	}
} else if ($_REQUEST["type"] == "po_creditor_transfer") {
	$sqlMain	= "SELECT * FROM dbo.po_creditor WHERE i_enable = ? ORDER BY c_name";
	$arrParam	= array(STATUS_ENABLE);
	$stmt = $db->QueryParam($sqlMain, $arrParam);
	if ($stmt) {
		$all = false;
		if ($all == "all") {
			${$root}[] = array(
				"id"		=> 0,
				"c_name"	=> "- กรุณาเลือก -"
			);
		}

		while ($row = $db->Fetch($stmt)) {
			$temp = array(
				"id"		=> "{$row["po_creditor_id"]}",
				"c_name"	=> "{$row["c_name"]}"
			);
			${$root}[] = $temp;
		}
	}
} else if ($_REQUEST["type"] == "dc_creditor") {
	$sqlMain	= "SELECT * FROM dc_creditor WHERE i_enable = ? AND i_delete = 2 AND i_key = 1";
	$arrParam	= array(STATUS_ENABLE);
	$stmt = $db->QueryParam($sqlMain, $arrParam);
	if ($stmt) {
		$all = false;
		if ($all == "all") {
			${$root}[] = array(
				"id"		=> 0,
				"c_name"	=> "- กรุณาเลือก -"
			);
		}

		while ($row = $db->Fetch($stmt)) {
			$temp = array(
				"id"		=> "{$row["dc_creditor_id"]}",
				"c_name"	=> "{$row["c_name"]}"
			);
			${$root}[] = $temp;
		}
	}
} else if ($_REQUEST["type"] == "dc_creditor_po") {

	$where_dc_creditor_id = "" ; 
    if  (@$_REQUEST["dc_creditor_id"] >0 ){
        $where_dc_creditor_id =" and a.dc_creditor_id = " .  $_REQUEST["dc_creditor_id"];
    } 
	// ($_REQUEST['dc_creditor_id'] > 0) {
	// 	""
	// } else {

	// }

	$sqlMain = "
		SELECT 
			a.dc_creditor_id
			,ISNULL(b.po_creditor_id,0) AS po_creditor_id 
			,a.c_name
			,a.c_tax_number_imp
			,a.dc_tax_customer_id
		FROM NMU.dbo.dc_creditor a
		LEFT JOIN NMU.dbo.po_creditor b ON a.c_name = b.c_name AND b.i_enable=1 AND b.i_delete=2 AND b.c_name IS NOT NULL
		WHERE a.i_enable = ? AND a.i_delete = 2 AND a.i_key = 1 ".$where_dc_creditor_id.
		" ORDER BY a.c_name";
	$arrParam	= array(STATUS_ENABLE);
	$stmt = $db->QueryParam($sqlMain, $arrParam);
	if ($stmt) {
		$all = false;
		if ($all == "all") {
			${$root}[] = array(
				"id"					=> 0,
				"po_creditor_id"		=> 0,
				"c_tax_number_imp"		=> "",
				"c_name"				=> "- กรุณาเลือก -"
			);
		}

		while ($row = $db->Fetch($stmt)) {
			$temp = array(
				"id"                    => "{$row["dc_creditor_id"]}",
				"po_creditor_id"        => "{$row["po_creditor_id"]}",
				"c_tax_number_imp"      => "{$row["c_tax_number_imp"]}",
				"dc_tax_customer_id"    => "{$row["dc_tax_customer_id"]}",
				"c_name"                => "{$row["c_name"]}"
			);
			${$root}[] = $temp;
		}
	}
} else if ($_REQUEST["type"] == "dc_creditor_po_transfer") {
	$sqlMain = "
		SELECT 
			a.dc_creditor_id
			,ISNULL(b.po_creditor_id,0) AS po_creditor_id 
			,a.c_name
			,a.c_tax_number_imp
		FROM NMU.dbo.dc_creditor a
		LEFT JOIN NMU.dbo.po_creditor b ON a.c_name = b.c_name AND b.i_enable=1 AND b.i_delete=2 AND b.c_name IS NOT NULL
		WHERE a.i_enable = ? AND a.i_delete = 2 AND a.i_key = 1
		ORDER BY a.c_name";
	$arrParam	= array(STATUS_ENABLE);
	$stmt = $db->QueryParam($sqlMain, $arrParam);
	if ($stmt) {
		$all = false;
		if ($all == "all") {
			${$root}[] = array(
				"id"					=> 0,
				"po_creditor_id"		=> 0,
				"c_tax_number_imp" 		=> "",
				"c_name"				=> "- กรุณาเลือก -"
			);
		}

		while ($row = $db->Fetch($stmt)) {
			$temp = array(
				"id"                => "{$row["dc_creditor_id"]}",
				"po_creditor_id"    => "{$row["po_creditor_id"]}",
				"c_tax_number_imp"  => "{$row["c_tax_number_imp"]}",
				"c_name"            => "{$row["c_name"]}"
			);
			${$root}[] = $temp;
		}
	}
} else if ($_REQUEST["type"] == "po_creditor") {
	$sqlMain	= "SELECT * FROM dbo.po_creditor WHERE i_enable = ? ORDER BY c_name";
	$arrParam	= array(STATUS_ENABLE);
	$stmt = $db->QueryParam($sqlMain, $arrParam);
	if ($stmt) {
		$all = false;
		if ($all == "all") {
			${$root}[] = array(
				"id"		=> 0,
				"c_name"	=> "- กรุณาเลือก -"
			);
		}

		while ($row = $db->Fetch($stmt)) {
			$temp = array(
				"id"		=> "{$row["po_creditor_id"]}",
				"c_name"	=> "{$row["c_name"]}"
			);
			${$root}[] = $temp;
		}
	}
} else if ($_REQUEST["type"] == "dc_acc") {
	$sqlMain	= "SELECT * FROM dc_acc WHERE i_last=1 AND i_level = 6 AND i_enable = 1 AND i_delete = 2 ORDER BY c_code;";
	$arrParam	= array(STATUS_ENABLE);
	$stmt = $db->QueryParam($sqlMain, $arrParam);
	if ($stmt) {
		$all = false;
		if ($all == "all") {
			${$root}[] = array(
				"id"		=> 0,
				"c_name"	=> "- กรุณาเลือก -"
			);
		}

		while ($row = $db->Fetch($stmt)) {
			$temp = array(
				"id"		=> "{$row["dc_acc_id"]}",
				"c_name"	=> $row["c_code"] . ' : ' . $row["c_name"]
			);
			${$root}[] = $temp;
		}
	}
} else if ($_REQUEST["type"] == "dc_acc_expense") {
	$sqlMain	= "
		SELECT 
			c.dc_acc_id
			,c.c_code
			,c.c_name
		FROM NMU.dbo.gl_sp_bg_hdr a 
		INNER JOIN NMU.dbo.gl_sp_bg_dtl b ON a.gl_sp_bg_hdr_id = b.gl_sp_bg_hdr_id
		INNER JOIN NMU.dbo.dc_acc c ON b.dc_acc_id = c.dc_acc_id AND c.i_enable = 1 AND c.i_delete = 2
		WHERE a.i_enable = 1 AND a.i_delete = 2  AND b.i_type_dr_cr = 1 AND a.bg_expense_id = ?";
	$arrParam	= array();
	$arrParam[]	= @$_REQUEST["bg_expense_id"] ? $_REQUEST["bg_expense_id"] : 0;
	$stmt = $db->QueryParam($sqlMain, $arrParam);
	if ($stmt) {
		while ($row = $db->Fetch($stmt)) {
			$temp = array(
				"id"		=> "{$row["dc_acc_id"]}",
				"c_name"	=> $row["c_code"] . ' : ' . $row["c_name"]
			);
			${$root}[] = $temp;
		}
	}
} else if ($_REQUEST["type"] == "dc_expense_budget_type") {

	$sqlMain	= "SELECT * FROM dbo.dc_expense_budget_type WHERE i_enable = ? AND i_delete = 2 AND dc_expense_budget_type_id != 34 ORDER BY c_name";
	$arrParam	= array(STATUS_ENABLE);
	$stmt = $db->QueryParam($sqlMain, $arrParam);
	if ($stmt) {

		if (@$_REQUEST["all"] == "all") {
			${$root}[] = array(
				"id"		=> "0",
				"c_name"	=> "- เลือกทั้งหมด -"
			);
		}

		while ($row = $db->Fetch($stmt)) {
			$temp = array(
				"id"		=> "{$row["dc_expense_budget_type_id"]}",
				"c_name"	=> "{$row["c_name"]}"
			);
			${$root}[] = $temp;
		}
	}
} else if ($_REQUEST["type"] == "bg_expense") {
	$con = '';
	if (@$_REQUEST['mode10']) {
		$con .= " AND LEFT(c_code,2) = '10'";
	}
	$sqlMain	= "SELECT * FROM ".DB_NMU_EIS."bg_expense WHERE i_last = 1 and i_enable = ? {$con} ORDER BY c_code_tree";
	$arrParam	= array(STATUS_ENABLE);
	$stmt = $db->QueryParam($sqlMain, $arrParam);
	if ($stmt) {

		if (@$_REQUEST["all"] == "all") {
			${$root}[] = array(
				"id"		=> "0",
				"c_name"	=> "- เลือกทั้งหมด -"
			);
		}

		while ($row = $db->Fetch($stmt)) {
			$temp = array(
				"id"					=> "{$row["bg_expense_id"]}",
				"c_name"				=> $row["c_code"] . " : " . $row["c_name"],
				"c_name_excel"			=> $row["c_name"]
			);
			${$root}[] = $temp;
		}
	}
} else if ($_REQUEST["type"] == "bg_expense_expire") {

	$sqlMain = "
		SELECT
			a.bg_expense_id
			,b.c_code AS c_group_code
			,b.c_name AS c_group_name
			,a.c_code
			,a.c_name
		FROM ".DB_NMU_EIS."bg_expense a
			INNER JOIN ".DB_NMU_EIS."bg_expense b ON LEFT(a.c_code_tree,2) = LEFT(b.c_code_tree,2) AND b.i_enable = 1 AND b.i_level = 1
		WHERE a.i_last = 1 AND a.i_delete = 2 AND a.i_enable = ? and isnull(a.i_expire,0) != 1
		ORDER BY a.c_code;";
	$arrParam = array(STATUS_ENABLE);
	$stmt = $db->QueryParam($sqlMain, $arrParam);
	if ($stmt) {

		if (@$_REQUEST["all"] == "all") {
			${$root}[] = array(
				"id"		=> "0",
				"c_name"	=> "- เลือกทั้งหมด -"
			);
		}

		while ($row = $db->Fetch($stmt)) {
			$temp = array(
				"id"					=> "{$row["bg_expense_id"]}",
				"c_name"				=> $row["c_code"] . " : " . $row["c_name"],
				"c_name_excel"			=> $row["c_name"]
			);
			${$root}[] = $temp;
		}
	}
} else if ($_REQUEST["type"] == "po_emp") {

	$sqlMain	= "SELECT * FROM NMU.dbo.po_emp WHERE i_enable = ? AND i_delete = 2 ORDER BY c_name";
	$arrParam	= array(STATUS_ENABLE);
	$stmt = $db->QueryParam($sqlMain, $arrParam);
	if ($stmt) {

		if (@$_REQUEST["all"] == "all") {
			${$root}[] = array(
				"id"		=> "0",
				"c_name"	=> "- เลือกทั้งหมด -"
			);
		}

		while ($row = $db->Fetch($stmt)) {
			$temp = array(
				"id"					=> "{$row["po_emp_id"]}",
				"c_name"				=> $row["c_name"],

			);
			${$root}[] = $temp;
		}
	}
} else if ($_REQUEST["type"] == "po_user_permission") {

	$sqlMain = "
		SELECT * FROM NMU.dbo.dc_user a
			INNER JOIN NMU.dbo.po_user_permission b ON a.dc_user_id = b.dc_user_id AND b.i_approve = 1
		WHERE a.i_enable = ? AND a.i_delete = 2 ORDER BY a.c_full_name";
	$arrParam	= array(STATUS_ENABLE);
	$stmt = $db->QueryParam($sqlMain, $arrParam);
	if ($stmt) {

		if (@$_REQUEST["all"] == "all") {
			${$root}[] = array(
				"id"		=> "0",
				"c_name"	=> "- เลือกทั้งหมด -"
			);
		}

		while ($row = $db->Fetch($stmt)) {
			$temp = array(
				"id"					=> "{$row["dc_user_id"]}",
				"c_name"				=> $row["c_full_name"],

			);
			${$root}[] = $temp;
		}
	}
} else if ($_REQUEST["type"] == "dc_bank_acc_creditor") {

	$sqlMain = "
		SELECT
			a.dc_bank_acc_creditor_id
			, a.c_code + ' | ' + a.c_name  + ' | ' + b.c_name AS c_name_full
			, a.c_code
			, a.c_name AS c_name_bank_acc
			, b.c_name AS c_name_bank
		FROM NMU.dbo.dc_bank_acc_creditor a
		INNER JOIN NMU.dbo.dc_bank b ON a.dc_bank_id = b.dc_bank_id
		WHERE 
			a.i_enable = 1
			AND a.i_delete = 2
			AND a.dc_creditor_id = ?
		ORDER BY a.i_main DESC";

	$arrParam	= array();
	$arrParam[] = @$_REQUEST['dc_creditor_id'] ? $_REQUEST['dc_creditor_id'] : 0;
	$stmt = $db->QueryParam($sqlMain, $arrParam);
	if ($stmt) {
		$temp = array(
			"id"							=>	0,
			"c_name_full"					=>	"- ไม่ระบุ -",
			"c_code"						=>	"-",
			"c_name_bank_acc"				=>	"-",
			"c_name_bank"					=>	"-",
		);
		${$root}[] = $temp;
		while ($row = $db->Fetch($stmt)) {
			$temp = array(
				"id"							=>	$row["dc_bank_acc_creditor_id"],
				"c_name_full"					=>	$row["c_name_full"],
				"c_code"						=>	$row["c_code"],
				"c_name_bank_acc"				=>	$row["c_name_bank_acc"],
				"c_name_bank"					=>	$row["c_name_bank"],
			);
			${$root}[] = $temp;
		}
	}
} else if ($_REQUEST["type"] == "dc_tax_customer") {

	$sqlMain = "
		SELECT  
			a.dc_tax_customer_id
			,a.c_name
			,a.i_is_type
			,a.i_dec_person
			,a.i_type_tax

			,b.dc_tax_income_id
			,b.c_name as c_name_tax_income
		FROM NMU.dbo.dc_tax_customer a
		LEFT JOIN NMU.dbo.dc_tax_income b ON a.dc_tax_income_id = b.dc_tax_income_id
		WHERE 
			a.i_enable = 1 
			AND a.i_delete = 2";

	$arrParam	= array();
	$stmt = $db->QueryParam($sqlMain, $arrParam);
	if ($stmt) {
		while ($row = $db->Fetch($stmt)) {
			$temp = array(
				"id"                    =>	$row["dc_tax_customer_id"],
				"c_name"                =>	$row["c_name"],
				"i_is_type"             =>	$row["i_is_type"],
				"i_dec_person"          =>	$row["i_dec_person"],
				"i_type_tax"            =>	$row["i_type_tax"],
				"dc_tax_income_id"      =>	$row["dc_tax_income_id"],
				"c_name_tax_income"     =>	$row["c_name_tax_income"],
			);
			${$root}[] = $temp;
		}
	}
} else if ($_REQUEST["type"] == "dc_province") {

	$sqlMain = "
		SELECT  
			dc_province_id		
			,c_province_thai
		FROM NMU.dbo.dc_province 
		WHERE 
			i_enable = 1 
			AND i_delete = 2
		ORDER BY dc_province_id";

	$arrParam	= array();
	$stmt = $db->QueryParam($sqlMain, $arrParam);
	if ($stmt) {
		while ($row = $db->Fetch($stmt)) {
			$temp = array(
				"id"                =>	$row["dc_province_id"],
				"c_name"            =>	$row["c_province_thai"],
			);
			${$root}[] = $temp;
		}
	}
} else if ($_REQUEST["type"] == "dc_district") {
	$con = @$_REQUEST["dc_province_id"] > 0 ? " AND dc_province_id =" . $_REQUEST["dc_province_id"] : "";

	$sqlMain = "
		SELECT  
			dc_district_id		
			,c_district_thai_short
		FROM NMU.dbo.dc_district 
		WHERE 
			i_enable = 1 
			AND i_delete = 2
			{$con}
		ORDER BY dc_district_id";

	$arrParam	= array();
	$stmt = $db->QueryParam($sqlMain, $arrParam);
	if ($stmt) {
		while ($row = $db->Fetch($stmt)) {
			$temp = array(
				"id"                =>	$row["dc_district_id"],
				"c_name"            =>	$row["c_district_thai_short"],
			);
			${$root}[] = $temp;
		}
	}
} else if ($_REQUEST["type"] == "dc_tambon") {
	$con = @$_REQUEST["dc_district_id"] > 0 ? " AND dc_district_id =" . $_REQUEST["dc_district_id"] : "";

	$sqlMain = "
		SELECT  
			dc_tambon_id		
			,c_tambon_thai_short
			,c_post_code_all
		FROM NMU.dbo.dc_tambon 
		WHERE 
			i_enable = 1 
			AND i_delete = 2
			{$con}
		ORDER BY dc_tambon_id";

	$arrParam	= array();
	$stmt = $db->QueryParam($sqlMain, $arrParam);
	if ($stmt) {
		while ($row = $db->Fetch($stmt)) {
			$temp = array(
				"id"                    =>	$row["dc_tambon_id"],
				"c_name"                =>	$row["c_tambon_thai_short"],
				"c_post_code_all"       =>	$row["c_post_code_all"],
			);
			${$root}[] = $temp;
		}
	}
} else if ($_REQUEST["type"] == "dc_title") {

	$sqlMain = "
		SELECT  
			dc_title_id
			,c_name
		FROM NMU.dbo.dc_title 
		WHERE 
			i_enable = 1 
			AND i_delete = 2
			AND dc_title_id != 1
		ORDER BY dc_title_id";

	$arrParam	= array();
	$stmt = $db->QueryParam($sqlMain, $arrParam);
	if ($stmt) {
		while ($row = $db->Fetch($stmt)) {
			$temp = array(
				"id"                    =>	$row["dc_title_id"],
				"c_name"                =>	$row["c_name"],
			);
			${$root}[] = $temp;
		}
	}
} else if ($_REQUEST["type"] == "CREDITOR_TAXDATA") {

	$sqlMain = "
		select top 1
			dc_creditor_id
			,isnull(a.c_tax_number_imp,'') as c_tax_number_imp
			,a.dc_tax_customer_id
			,isnull((select top 1 c_name from NMU..dc_tax_customer aa where aa.dc_tax_customer_id = a.dc_tax_customer_id),'') as c_name_tax_customer
			,isnull((select top 1 (select top 1 c_name from NMU..dc_tax_income aaa where aaa.dc_tax_income_id = aa.dc_tax_income_id) from NMU..dc_tax_customer aa where aa.dc_tax_customer_id = a.dc_tax_customer_id),'')as c_name_tax_income
			,isnull(a.tax_c_title,'') as tax_c_title
			,isnull(a.tax_c_name,'') as tax_c_name
			,isnull(a.tax_c_middle_name,'') as tax_c_middle_name
			,isnull(a.tax_c_last_name,'') as tax_c_last_name
			,isnull(a.tax_c_branch,'') as tax_c_branch
			,isnull(a.tax_c_bldg,'') as tax_c_bldg
			,isnull(a.tax_c_room_no,'') as tax_c_room_no
			,isnull(a.tax_c_floor,'') as tax_c_floor
			,isnull(a.tax_c_village,'') as tax_c_village
			,isnull(a.tax_c_house_no,'') as tax_c_house_no
			,isnull(a.tax_c_village_no,'') as tax_c_village_no
			,isnull(a.tax_c_lane,'') as tax_c_lane
			,isnull(a.tax_c_road,'') as tax_c_road
			,isnull(a.tax_c_province,'') as tax_c_province
			,isnull(a.tax_c_district,'') as tax_c_district
			,isnull(a.tax_c_tambon,'') as tax_c_tambon
			,isnull(a.tax_c_post_code,'') as tax_c_post_code
			,isnull(a.dc_tambon_id,'') as dc_tambon_id
			,isnull(a.c_email,'') as c_email
			,isnull(a.c_tele_imp,'') as c_tele_imp

			,b.dc_tambon_id
			,b.dc_district_id
			,b.dc_province_id
			,b.c_post_code_all
		from NMU.dbo.dc_creditor a
		left join NMU.dbo.dc_tambon b on a.dc_tambon_id = b.dc_tambon_id
		where dc_creditor_id  = ?";

	$arrParam	= array();
	$arrParam[]	= $_REQUEST["dc_creditor_id"];

	$stmt = $db->QueryParam($sqlMain, $arrParam);
	if ($stmt) {
		while ($row = $db->Fetch($stmt)) {
			$temp = array(
				"id"					=>	$row["dc_creditor_id"],
				"c_tax_number_imp"		=>	$row["c_tax_number_imp"],
				"c_name_tax_customer"	=>	$row["c_name_tax_customer"],
				"c_name_tax_income"		=>	$row["c_name_tax_income"],
				"dc_tax_customer_id"	=>	$row["dc_tax_customer_id"],
				"tax_c_title"			=>	$row["tax_c_title"],
				"tax_c_name"			=>	$row["tax_c_name"],
				"tax_c_middle_name"		=>	$row["tax_c_middle_name"],
				"tax_c_last_name"		=>	$row["tax_c_last_name"],
				"tax_c_branch"			=>	$row["tax_c_branch"],
				"tax_c_bldg"			=>	$row["tax_c_bldg"],
				"tax_c_room_no"			=>	$row["tax_c_room_no"],
				"tax_c_floor"			=>	$row["tax_c_floor"],
				"tax_c_village"			=>	$row["tax_c_village"],
				"tax_c_house_no"		=>	$row["tax_c_house_no"],
				"tax_c_village_no"		=>	$row["tax_c_village_no"],
				"tax_c_lane"			=>	$row["tax_c_lane"],
				"tax_c_road"			=>	$row["tax_c_road"],
				"tax_c_province"		=>	$row["tax_c_province"],
				"tax_c_district"		=>	$row["tax_c_district"],
				"tax_c_tambon"			=>	$row["tax_c_tambon"],
				"tax_c_post_code"		=>	$row["tax_c_post_code"],
				"dc_tambon_id"			=>	$row["dc_tambon_id"],
				"c_email"				=>	$row["c_email"],
				"c_tele_imp"			=>	$row["c_tele_imp"],
				
				"dc_tambon_id"			=>	$row["dc_tambon_id"],
				"dc_district_id"		=>	$row["dc_district_id"],
				"dc_province_id"		=>	$row["dc_province_id"],
				"c_post_code_all"		=>	$row["c_post_code_all"],
			);
			${$root}[] = $temp;
		}
	}
}

echo json_encode(array("debug" => true, $root => ${$root}));
exit;
