<?php
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
	// $type = $_REQUEST["type"] ?? 0;
	// $start = $_REQUEST["start"] ?? 0;
	// $i_tor_type = $_REQUEST["chart"] ?? 0;
	// $year_en = ($_REQUEST["year_en"] > 0) ?   " AND  a.i_pr_year =  {$_REQUEST["year_en"]}" : '';
	// print_r($_REQUEST);
	// exit;
	$detailMap = [];

	$sqlMain = "SET NOCOUNT ON 
						    select
							a.c_name,
							a.emp_code as c_code,
							b.c_name as department
							from NMU_ERP..sp_emp a  
							inner join NMU_ERP..sp_department  b on a.dc_department_id = b.dc_department_id
							where a.dc_department_id > 0  and a.i_enable = 1
							order by  b.dc_department_id
						
";
	$stmt = $db->QueryParam($sqlMain, array());
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
	if ($stmt) {
		$no = 0;
		while ($row = $db->Fetch($stmt)) {
			// $sp_tor_id = $row['pr_id'];
			$f_amt = 0;
			$temp = array(
				"i_type"                            => 1,
				"no"                                => ++$no,
				"c_code"                            => $row["c_code"],
				"c_name"                            => $row["c_name"],
				"department"                         => $row["department"],
			);
			${$root}[]	= $temp;
		}
	}

	return json_encode(array("debug" => true, "totalCount" => $totalCount, $root => ${$root}));
}
