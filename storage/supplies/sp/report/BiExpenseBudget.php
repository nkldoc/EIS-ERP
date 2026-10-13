<?php
include("../api/List_BiExpenseBudget.php");

include("../../lib/export/exportUtil.php");

$export = new exportUtil();

$s_title = true;
$title = CUSTOMER_NAME_TH;

$caption = "รายงานการจองงบประมาณคงเหลือ";

if ($_REQUEST["type"] == "excel") {
    $export->headerExcel($caption);
}
// bg_expense_id
$name = "";

// $no = $jObj["no"];

// $for_id = explode(";", $_REQUEST["bg_expense_id_lv{$_REQUEST["i_expense"]}"]);
// if (!in_array("0", $for_id)) {
//     $in = "";
//     foreach ($for_id as $val) {
//         $in .= ($in == "") ? $val : ", " . $val;
//     }
//     $stmt = $db->QueryParam("SELECT c_name FROM  NMU.dbo.bg_expense WHERE bg_expense_id IN (" . $in . ")", array());

//     if ($stmt) {
//         $i_c_name = 0;
//         while ($row = $db->Fetch($stmt)) {
//             if ($i_c_name <= 10) {
//                 $name .= ($name == "") ? $row["c_name"] : ", " . $row["c_name"];
//             }
//             $i_c_name++;
//         }
//         $name .= $i_c_name > 10 ? ', ...(' . ($i_c_name - 10) . ')' : '';
//     }
// } else {
    // $name = "เลือกทั้งหมด";
// }
$dc_expense_budget_type_name1 = explode(";",$_REQUEST["dc_expense_budget_type_id"])[0]; 
$dc_expense_budget_type_name2 = explode(";",$_REQUEST["dc_expense_budget_type_id"])[1]??null; 
$dc_expense_budget_type_name3 = explode(";",$_REQUEST["dc_expense_budget_type_id"])[2]??null; 
$expense_budget_type_name1 = $db->GetDataBySQL("SELECT c_name FROM dc_expense_budget_type WHERE dc_expense_budget_type_id = {$dc_expense_budget_type_name1}",array($dc_expense_budget_type_name1 ));
if($dc_expense_budget_type_name2 != null){
	$expense_budget_type_name2 = $db->GetDataBySQL("SELECT c_name FROM dc_expense_budget_type WHERE dc_expense_budget_type_id = {$dc_expense_budget_type_name2}",array($dc_expense_budget_type_name2 ));
}
if($dc_expense_budget_type_name3 != null){
	$expense_budget_type_name3 = $db->GetDataBySQL("SELECT c_name FROM dc_expense_budget_type WHERE dc_expense_budget_type_id = {$dc_expense_budget_type_name3}",array($dc_expense_budget_type_name3 ));
}


$for_id = explode(";", $_REQUEST["dc_expense_budget_type_id"]);
if (!in_array("0", $for_id)) {
    $in = "";
    foreach ($for_id as $val) {
        $in .= ($in == "") ? $val : ", " . $val;
    }
    $stmt = $db->QueryParam("SELECT c_name FROM  NMU.dbo.dc_expense_budget_type WHERE dc_expense_budget_type_id IN (" . $in . ")", array());

    if ($stmt) {
        $i_c_name = 0;
        while ($row = $db->Fetch($stmt)) {
            if ($i_c_name <= 10) {
                $name .= ($name == "") ? $row["c_name"] : ", " . $row["c_name"];
            }
            $i_c_name++;
        }
        $name .= $i_c_name > 10 ? ', ...(' . ($i_c_name - 10) . ')' : '';
    }
} else {
    $name = "เลือกทั้งหมด";
}
// $for_id = explode(";", $_REQUEST["bg_expense_id_lv4"]);
$bg_expense1 = $for_id[0];
$bg_expense2 = @$for_id[1];
$bg_expense3 = @$for_id[2];
// }
$bg_expense_col2 = null ; 
$bg_expense_col3 = null ; 
$bg_expense_name2 =null;
$bg_expense_name3 =null;

function changeNumFormat($val)
{
    if ($val > 0) {
        $val = number_format($val, 2);
    } else if ($val < 0) {
        $val = "<font color=red>(" . number_format(abs($val), 2) . ")</font>";
    } else {
        $val = "-";
    }
    return $val;
}
$data_dtl = json_decode(List_QueryParam(), true);

if (is_array($data_dtl) && count($data_dtl["data"]) > 0) {
	$tbody = "<tbody>";
	foreach ($data_dtl["data"] as $index => $jObj) {
        // if ($bg_expense1 > 0) {
            $bg_expense_name1 = $jObj["c_name"];
            // $budget_name = "แหล่งเงิน : <font color='blue'>" . $budget_type . "</font>";
        // }
		$no = $jObj["no"];
		$f_budget_income = changeNumFormat($jObj["f_budget_income"]);
		$f_budget_income_reserve = changeNumFormat($jObj["f_budget_income_reserve"]);
		$f_budget_income_reserve_contract = changeNumFormat($jObj["f_budget_income_reserve_contract"]);
		$f_reserve_budget_income = changeNumFormat($jObj["f_reserve_budget_income"]);
		$f_budget_income_withdrawing = changeNumFormat($jObj["f_budget_income_withdrawing"]);
		$f_budget_income_withdraw = changeNumFormat($jObj["f_budget_income_withdraw"]);
		$f_budget_income_remaining = changeNumFormat($jObj["f_budget_income_remaining"]);

		$f_budget_bangkok = changeNumFormat($jObj["f_budget_bangkok"]);
		$f_budget_bangkok_reserve = changeNumFormat($jObj["f_budget_bangkok_reserve"]);
		$f_budget_bangkok_reserve_contract = changeNumFormat($jObj["f_budget_bangkok_reserve_contract"]);
		$f_budget_bangkok_withdrawing = changeNumFormat($jObj["f_budget_bangkok_withdrawing"]);
		$f_reserve_budget_income_bangkok = changeNumFormat($jObj["f_reserve_budget_income_bangkok"]);
		$f_budget_bangkok_withdraw = changeNumFormat($jObj["f_budget_bangkok_withdraw"]);
		$f_budget_bangkok_remaining = changeNumFormat($jObj["f_budget_bangkok_remaining"]);

		$f_budget_government = changeNumFormat($jObj["f_budget_government"]);
		$f_budget_government_reserve = changeNumFormat($jObj["f_budget_government_reserve"]);
		$f_budget_government_reserve_contract = changeNumFormat($jObj["f_budget_government_reserve_contract"]);
		$f_reserve_budget_income_government = changeNumFormat($jObj["f_reserve_budget_income_government"]);
		$f_budget_government_withdrawing = changeNumFormat($jObj["f_budget_government_withdrawing"]);
		$f_budget_government_withdraw = changeNumFormat($jObj["f_budget_government_withdraw"]);
		$f_budget_government_remaining = changeNumFormat($jObj["f_budget_government_remaining"]);


		if ($jObj["i_type"] == 1) {
			$style = "";
			$c_sub = "";
			$i_level = "4";
			$para = "";
			$para .= $_SERVER["QUERY_STRING"];
			$para .= "&i_level= 4 ";
			$para .= "&bg_expense_id={$jObj["bg_expense_id"]}";
			// $para .= "&bg_expense_id={$_REQUEST["bg_expense_id_lv4"]}";
			$para .= "&dc_cost_id={$_REQUEST["dc_cost_id"]}";
			// $para .= "&d_date_start1={$_REQUEST["d_date_start1"]}";
			// $para .= "&d_date_end1={$_REQUEST["d_date_end1"]}";
			// $para .= "&d_date_start2={$_REQUEST["d_date_start2"]}";
			// $para .= "&d_date_end2={$_REQUEST["d_date_end2"]}";
			$para .= "&i_year={$_REQUEST["i_year"]}";

			$para .= "&i_success=1";

			for ($i = 1; $i < $jObj["i_level"]; $i++) {
				$c_sub .= "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;";
			}

				$no = $jObj["no"];
				// $c_name = "<b>" . $jObj["c_name"] . "</b>";
				$f_budget_income = "<b>" . $f_budget_income . "</b>";
				$f_budget_income_reserve = "<b>" . $f_budget_income_reserve . "</b>";
				$f_budget_income_reserve_contract = "<b>" . $f_budget_income_reserve_contract . "</b>";
				$f_reserve_budget_income = "<b>" . $f_reserve_budget_income . "</b>";
				$f_budget_income_withdrawing = "<b>" . $f_budget_income_withdrawing . "</b>";
				$f_budget_income_withdraw = "<b>" . $f_budget_income_withdraw . "</b>";
				$f_budget_income_remaining = "<b>" . $f_budget_income_remaining . "</b>";

				$f_budget_bangkok = "<b>" . $f_budget_bangkok . "</b>";
				$f_budget_bangkok_reserve = "<b>" . $f_budget_bangkok_reserve . "</b>";
				$f_budget_bangkok_reserve_contract = "<b>" . $f_budget_bangkok_reserve_contract . "</b>";
				$f_reserve_budget_income_bangkok = "<b>" . $f_reserve_budget_income_bangkok . "</b>";
				$f_budget_bangkok_withdrawing = "<b>" . $f_budget_bangkok_withdrawing . "</b>";
				$f_budget_bangkok_withdraw = "<b>" . $f_budget_bangkok_withdraw . "</b>";
				$f_budget_bangkok_remaining = "<b>" . $f_budget_bangkok_remaining . "</b>";

				$f_budget_government = "<b>" . $f_budget_government . "</b>";
				$f_budget_government_reserve = "<b>" . $f_budget_government_reserve . "</b>";
				$f_budget_government_reserve_contract = "<b>" . $f_budget_government_reserve_contract . "</b>";
				$f_reserve_budget_income_government = "<b>" . $f_reserve_budget_income_government . "</b>";
				$f_budget_government_withdrawing = "<b>" . $f_budget_government_withdrawing . "</b>";
				$f_budget_government_withdraw = "<b>" . $f_budget_government_withdraw . "</b>";
				$f_budget_government_remaining = "<b>" . $f_budget_government_remaining . "</b>";


			// } else {
				// $no = "";
				// $c_name = $c_sub . "- " . $jObj["c_name"];
			// }

			// GEN TBODY
			$tbody .= "<tr>";
			$tbody .= "<td style='left: 0px; position: sticky; background: #FFFFFF; border-collapse: separate;" . $style . "' align='center'>" . $no . "</td>";
			$tbody .= "<td style='left: 40px; position: sticky; background: #FFFFFF; border-collapse: separate; mso-number-format:\@;" . $style . "' align='center'>" . $jObj["c_code"] . "</td>";
			$tbody .= "<td style='" . $style . "'nowrap>" . $jObj["c_name"] . "</td>";
			// $tbody .= "<td style='" . $style . "' align='right'>" . $f_budget_income  . "</td>";
			$tbody .= "<td style='" . $style . "' align='right'>" . $f_budget_income  . "</td>";
			$tbody .= "<td style='" . $style . "' align='right'><a href='./Rep_Budget_Pr.php?{$para}&i_type_bg=1&dc_expense_budget_type={$dc_expense_budget_type_name1}' target='Rep_RepBudgetControl_DTL'>" . $f_budget_income_reserve . "</a></td>";
			$tbody .= "<td style='" . $style . "' align='right'><a href='./Rep_Budget_Pr.php?{$para}&i_type_bg=2&dc_expense_budget_type={$dc_expense_budget_type_name1}' target='Rep_RepBudgetControl_DTL1'>" . $f_budget_income_reserve_contract . "</a></td>";
			// $tbody .= "<td style='" . $style . "' align='right'>" . $f_budget_income_reserve  . "</td>"; 
			// $tbody .= "<td style='" . $style . "' align='right'>" . $f_budget_income_reserve_contract  . "</td>"; 
			// $tbody .= "<td style='" . $style . "' align='right'><a href='./Rep_Budget_Pr.php?{$para}&i_type_bg=4&dc_expense_budget_type={$dc_expense_budget_type_name1}' target='Rep_RepBudgetControl_DTL2'>" . $f_budget_income_withdrawing . "</a></td>";
			$tbody .= "<td style='" . $style . "' align='right'>" . $f_reserve_budget_income  . "</td>"; 
			$tbody .= "<td style='" . $style . "' align='right'>" . $f_budget_income_withdrawing  . "</td>"; 
			// $tbody .= "<td style='" . $style . "' align='right'>" . $f_budget_income_withdraw  . "</td>"; 
			$tbody .= "<td style='" . $style . "' align='right'><a href='./Rep_Budget_Pr.php?{$para}&i_type_bg=3&dc_expense_budget_type={$dc_expense_budget_type_name1}' target='Rep_RepBudgetControl_DTL3'>" . $f_budget_income_withdraw . "</a></td>";
			$tbody .= "<td style='" . $style . "' align='right'>" . $f_budget_income_remaining  . "</td>"; 
			// // if($jObj["i_level"] == 4){
			// }
			if ($dc_expense_budget_type_name2 != null) {
				$tbody .= "<td style='" . $style . "' align='right'>" . $f_budget_bangkok  . "</td>";
				$tbody .= "<td style='" . $style . "' align='right'><a href='./Rep_Budget_Pr.php?{$para}&i_type_bg=1&dc_expense_budget_type={$dc_expense_budget_type_name2}' target='Rep_RepBudgetControl_DTL'>" . $f_budget_bangkok_reserve . "</a></td>";
				$tbody .= "<td style='" . $style . "' align='right'><a href='./Rep_Budget_Pr.php?{$para}&i_type_bg=2&dc_expense_budget_type={$dc_expense_budget_type_name2}' target='Rep_RepBudgetControl_DTL'>" . $f_budget_bangkok_reserve_contract . "</a></td>";

				// $tbody .= "<td style='" . $style . "' align='right'>" . $f_budget_bangkok_reserve  . "</td>"; 
				// $tbody .= "<td style='" . $style . "' align='right'>" . $f_budget_bangkok_reserve_contract  . "</td>"; 
				$tbody .= "<td style='" . $style . "' align='right'>" . $f_reserve_budget_income_bangkok  . "</td>"; 
				$tbody .= "<td style='" . $style . "' align='right'>" . $f_budget_bangkok_withdrawing  . "</td>"; 
				// $tbody .= "<td style='" . $style . "' align='right'>" . $f_budget_bangkok_withdraw  . "</td>"; 
				$tbody .= "<td style='" . $style . "' align='right'><a href='./Rep_Budget_Pr.php?{$para}&i_type_bg=3&dc_expense_budget_type={$dc_expense_budget_type_name2}' target='Rep_RepBudgetControl_DTL'>" . $f_budget_bangkok_withdraw . "</a></td>";
				$tbody .= "<td style='" . $style . "' align='right'>" . $f_budget_bangkok_remaining  . "</td>"; 
			}
			if ($dc_expense_budget_type_name3 != null) {
				$tbody .= "<td style='" . $style . "' align='right'>" . $f_budget_government  . "</td>";
				$tbody .= "<td style='" . $style . "' align='right'><a href='./Rep_Budget_Pr.php?{$para}&i_type_bg=1&dc_expense_budget_type={$dc_expense_budget_type_name3}' target='Rep_RepBudgetControl_DTL'>" . $f_budget_government_reserve . "</a></td>";
				$tbody .= "<td style='" . $style . "' align='right'><a href='./Rep_Budget_Pr.php?{$para}&i_type_bg=2&dc_expense_budget_type={$dc_expense_budget_type_name3}' target='Rep_RepBudgetControl_DTL'>" . $f_budget_government_reserve_contract . "</a></td>";

				// $tbody .= "<td style='" . $style . "' align='right'>" . $f_budget_government_reserve  . "</td>"; 
				// $tbody .= "<td style='" . $style . "' align='right'>" . $f_budget_government_reserve_contract  . "</td>"; 
				$tbody .= "<td style='" . $style . "' align='right'>" . $f_reserve_budget_income_government  . "</td>"; 
				$tbody .= "<td style='" . $style . "' align='right'>" . $f_budget_government_withdrawing  . "</td>"; 
				// $tbody .= "<td style='" . $style . "' align='right'>" . $f_budget_government_withdraw  . "</td>"; 
				$tbody .= "<td style='" . $style . "' align='right'><a href='./Rep_Budget_Pr.php?{$para}&i_type_bg=3&dc_expense_budget_type={$dc_expense_budget_type_name3}' target='Rep_RepBudgetControl_DTL'>" . $f_budget_government_withdraw . "</a></td>";
				$tbody .= "<td style='" . $style . "' align='right'>" . $f_budget_government_remaining  . "</td>"; 
			}
			$tbody .= "</tr>";
		} else {
			$style = "text-align:right; background-color:#EEE;";
			$tbody .= "<tr>";
			$tbody .= "<td style='" . $style . "' colspan=3 align='right'><b>" . $jObj["c_name"] . "</b></td>";

			$tbody .= "<td style='" . $style . "' align='right'>" . $f_budget_income  . "</td>";
			$tbody .= "<td style='" . $style . "' align='right'>" . $f_budget_income_reserve  . "</td>"; 
			$tbody .= "<td style='" . $style . "' align='right'>" . $f_budget_income_reserve_contract  . "</td>"; 
			$tbody .= "<td style='" . $style . "' align='right'>" . $f_reserve_budget_income  . "</td>"; 
			$tbody .= "<td style='" . $style . "' align='right'>" . $f_budget_income_withdrawing  . "</td>"; 
			$tbody .= "<td style='" . $style . "' align='right'>" . $f_budget_income_withdraw  . "</td>"; 
			$tbody .= "<td style='" . $style . "' align='right'>" . $f_budget_income_remaining  . "</td>"; 
			if ($dc_expense_budget_type_name2 != null) {
				$tbody .= "<td style='" . $style . "' align='right'>" . $f_budget_bangkok  . "</td>";
				$tbody .= "<td style='" . $style . "' align='right'>" . $f_budget_bangkok_reserve  . "</td>"; 
				$tbody .= "<td style='" . $style . "' align='right'>" . $f_budget_bangkok_reserve_contract  . "</td>"; 
				$tbody .= "<td style='" . $style . "' align='right'>" . $f_reserve_budget_income_bangkok  . "</td>"; 
				$tbody .= "<td style='" . $style . "' align='right'>" . $f_budget_bangkok_withdrawing  . "</td>"; 
				$tbody .= "<td style='" . $style . "' align='right'>" . $f_budget_bangkok_withdraw  . "</td>"; 
				$tbody .= "<td style='" . $style . "' align='right'>" . $f_budget_bangkok_remaining  . "</td>"; 
			}
			if ($dc_expense_budget_type_name3 != null) {
				$tbody .= "<td style='" . $style . "' align='right'>" . $f_budget_government  . "</td>";
				$tbody .= "<td style='" . $style . "' align='right'>" . $f_budget_government_reserve  . "</td>"; 
				$tbody .= "<td style='" . $style . "' align='right'>" . $f_budget_government_reserve_contract  . "</td>"; 
				$tbody .= "<td style='" . $style . "' align='right'>" . $f_reserve_budget_income_government  . "</td>"; 
				$tbody .= "<td style='" . $style . "' align='right'>" . $f_budget_government_withdrawing  . "</td>"; 
				$tbody .= "<td style='" . $style . "' align='right'>" . $f_budget_government_withdraw  . "</td>"; 
				$tbody .= "<td style='" . $style . "' align='right'>" . $f_budget_government_remaining  . "</td>"; 
			}
			$tbody .= "</tr>";
		}
	}
	$tbody .= "</tbody>";
} else {
	$tbody = "<tbody><tr><td align='center' colspan=14>ไม่มีข้อมูล</td></tr></tbody>";
}
?>
<html>

<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <title><?php echo COMPANY_NAME; ?></title>
    <link rel="stylesheet" type="text/css" href="../../css/bootstrap.min.css" />
    <link rel="stylesheet" type="text/css" href="../../css/report_css.css" />
    <link rel="stylesheet" type="text/css" href="../../css/dashboard.css" />
</head>
<style>
    .ol1 {
        background-color: #E1F5D8;
    }

    .ol2 {
        background-color: #F5F3D8;
    }

    .loader {
        border: 4px solid #E7E7E7;
        border-radius: 50%;
        border-top: 4px solid #3498db;
        width: 12px;
        height: 12px;
        -webkit-animation: spin 1s linear infinite;
        /* Safari */
        animation: spin 1s linear infinite;
    }
</style>

<body>
    <div style="background-color:#FFFFFF;">
        <?php
        // if ($s_title == true)
        //     echo "<div align='center'><strong></strong></div>";
        // echo "<div align='center'><strong>" . $title . "</strong></div>";
        // echo "<div align='center'><strong>" . $caption . "</strong></div>";
        // echo "<div align='center'><strong> ประจำปีงบประมาณ " .  ($_REQUEST['i_year'] + 543) . "</strong></div>";
        
        if ($s_title == true)
			echo "<div align='center'><strong>" . $title . "</strong></div>";

			$name_bg = "";
			$for_id = explode(";", $_REQUEST["dc_expense_budget_type_id"]);
			if (!in_array("0", $for_id)) {
				$in = "";
				foreach ($for_id as $val) {
					$in .= ($in == "") ? $val : ", " . $val;
				}
				$stmt = $db->QueryParam("SELECT c_name FROM dc_expense_budget_type WHERE dc_expense_budget_type_id IN (" . $in . ")", array());
	
				if ($stmt) {
					$i_c_name = 0;
					while ($row = $db->Fetch($stmt)) {
						if ($i_c_name <= 10) {
							$name_bg .= ($name_bg == "") ? $row["c_name"] : ", " . $row["c_name"];
						}
						$i_c_name++;
					}
					$name_bg .= $i_c_name > 10 ? ', ...(' . ($i_c_name - 10) . ')' : '';
				}
			} else {
				$name_bg = "เลือกทั้งหมด";
			}
			$dc_expense_budget_type_name = "แหล่งเงิน Lv{$_REQUEST["i_expense"]} : <font color='blue'>{$name_bg}</font>";
	
		// echo ($name_bg);

		$name = "";
		// $for_id = explode(";", $_REQUEST["bg_expense_id_lv{$_REQUEST["i_expense"]}"]);
		// if (!in_array("0", $for_id)) {
		// 	$in = "";
		// 	foreach ($for_id as $val) {
		// 		$in .= ($in == "") ? $val : ", " . $val;
		// 	}
		// 	$stmt = $db->QueryParam("SELECT c_name FROM NMU.dbo.bg_expense WHERE bg_expense_id IN (" . $in . ")", array());

		// 	if ($stmt) {
		// 		$i_c_name = 0;
		// 		while ($row = $db->Fetch($stmt)) {
		// 			if ($i_c_name <= 10) {
		// 				$name .= ($name == "") ? $row["c_name"] : ", " . $row["c_name"];
		// 			}
		// 			$i_c_name++;
		// 		}
		// 		$name .= $i_c_name > 10 ? ', ...(' . ($i_c_name - 10) . ')' : '';
		// 	}
		// } else {
		// 	$name = "เลือกทั้งหมด";
		// }
		$expense_name = "รายจ่าย Lv{$_REQUEST["i_expense"]} : <font color='blue'>{$name}</font>";

		echo "<div align='center'><strong>" . $caption . "</strong></div>";
        ?>
        <div style="position: relative; font-size: 11px; margin: 5px 10px;">
            <div style='position: relative; left: 2px;'>แหล่งเงิน :  <font color='blue'><?= $name_bg ?>  </font></div>
            <!-- <div style='position: relative; left: 2px;'>หมวดค่าใช้จ่าย :  <font color='blue'><?= $name ?>  </font></div> -->

		</div>
        <div class="table-overflow">
			<table width="100%" class="table_report" border="0" cellspacing="1" cellpadding="0">
				<thead valign="top">
					<tr>
						<th style="left: 0px; position: sticky; z-index: 2; vertical-align:middle;  background: #E9E9E9; mso-number-format:\@;" rowspan="2" nowrap>ลำดับที่</th>
						<th style="left: 40px; position: sticky; z-index: 2; vertical-align:middle;  background: #E9E9E9; mso-number-format:\@;" rowspan="2" nowrap>รหัส</th>
						<th style="vertical-align:middle; background: #E9E9E9; mso-number-format:\@;" rowspan="2" nowrap>รายการ</th>
						<?php
						// if ($_REQUEST["view_budget"] == 1) {
								echo '<th style="vertical-align:middle; mso-number-format:\@; background:#FCE4D6;" rowspan="1" colspan=7 nowrap><b>'.$expense_budget_type_name1.'</b></th>';
							// }
						if ($dc_expense_budget_type_name2 >0  ) {
							echo '<th style="vertical-align:middle; mso-number-format:\@; background:#D9E1F2;" rowspan="1" colspan=7  nowrap><b>'.$expense_budget_type_name2.'</b></th>';
						}
						if ($dc_expense_budget_type_name3>0) {
							echo '<th style="vertical-align:middle; mso-number-format:\@; background:#E2EFDA;" rowspan="1" colspan=7 nowrap><b>'.$expense_budget_type_name3.'</b></th>';
						}
						?>
					</tr>
					<tr>
						<?php
						// if ($_REQUEST["view_budget"] == 1) {
							echo 
							'<th style="vertical-align:middle; mso-number-format:\@; background:#FCE4D6;" rowspan="1" nowrap>&nbsp;บัญชีจัดสรรสุทธิ&nbsp;<br></th>'.
							'<th style="vertical-align:middle; mso-number-format:\@; background:#FCE4D6;" rowspan="1" nowrap>&nbsp;เงินจองงบประมาณ&nbsp;<br></th>'.
							'<th style="vertical-align:middle; mso-number-format:\@; background:#FCE4D6;" rowspan="1" nowrap>&nbsp;จองสัญญา&nbsp;<br></th>'.
							'<th style="vertical-align:middle; mso-number-format:\@; background:#FCE4D6;" rowspan="1" nowrap>&nbsp;ตรวจรับ&nbsp;<br></th>'.
							'<th style="vertical-align:middle; mso-number-format:\@; background:#FCE4D6;" rowspan="1" nowrap>&nbsp;รอเบิก&nbsp;<br></th>'.
							'<th style="vertical-align:middle; mso-number-format:\@; background:#FCE4D6;" rowspan="1" nowrap>&nbsp;ทำเบิกแล้ว&nbsp;<br></th>'.
							'<th style="vertical-align:middle; mso-number-format:\@; background:#FCE4D6;" rowspan="1" nowrap>&nbsp;คงเหลือ&nbsp;<br></th>'
							;
						// }
						if ($dc_expense_budget_type_name2 !=  null) {
							echo 
							'<th style="vertical-align:middle; mso-number-format:\@; background:#D9E1F2;" rowspan="1" nowrap>&nbsp;บัญชีจัดสรรสุทธิ&nbsp;<br></th>'.
							'<th style="vertical-align:middle; mso-number-format:\@; background:#D9E1F2;" rowspan="1" nowrap>&nbsp;เงินจองงบประมาณ&nbsp;<br></th>'.
							'<th style="vertical-align:middle; mso-number-format:\@; background:#D9E1F2;" rowspan="1" nowrap>&nbsp;จองสัญญา&nbsp;<br></th>'.
							'<th style="vertical-align:middle; mso-number-format:\@; background:#D9E1F2;" rowspan="1" nowrap>&nbsp;ตรวจรับ&nbsp;<br></th>'.
							'<th style="vertical-align:middle; mso-number-format:\@; background:#D9E1F2;" rowspan="1" nowrap>&nbsp;รอเบิก&nbsp;<br></th>'.
							'<th style="vertical-align:middle; mso-number-format:\@; background:#D9E1F2;" rowspan="1" nowrap>&nbsp;ทำเบิกแล้ว&nbsp;<br></th>'.
							'<th style="vertical-align:middle; mso-number-format:\@; background:#D9E1F2;" rowspan="1" nowrap>&nbsp;คงเหลือ&nbsp;<br></th>'
							;}
							if ($dc_expense_budget_type_name3  !=  null) {
								echo 
							'<th style="vertical-align:middle; mso-number-format:\@; background:#E2EFDA;" rowspan="1" nowrap>&nbsp;บัญชีจัดสรรสุทธิ&nbsp;<br></th>'.
							'<th style="vertical-align:middle; mso-number-format:\@; background:#E2EFDA;" rowspan="1" nowrap>&nbsp;เงินจองงบประมาณ&nbsp;<br></th>'.
							'<th style="vertical-align:middle; mso-number-format:\@; background:#E2EFDA;" rowspan="1" nowrap>&nbsp;จองสัญญา&nbsp;<br></th>'.
							'<th style="vertical-align:middle; mso-number-format:\@; background:#E2EFDA;" rowspan="1" nowrap>&nbsp;ตรวจรับ&nbsp;<br></th>'.
							'<th style="vertical-align:middle; mso-number-format:\@; background:#E2EFDA;" rowspan="1" nowrap>&nbsp;รอเบิก&nbsp;<br></th>'.
							'<th style="vertical-align:middle; mso-number-format:\@; background:#E2EFDA;" rowspan="1" nowrap>&nbsp;ทำเบิกแล้ว&nbsp;<br></th>'.
							'<th style="vertical-align:middle; mso-number-format:\@; background:#E2EFDA;" rowspan="1" nowrap>&nbsp;คงเหลือ&nbsp;<br></th>';
						}
						?>
					</tr>
				</thead>
				<?= $tbody ?>
			</table>
		</div>
        </div>
    </div>
    <div id="bar-analysis" class="div-c"></div>
	</body>

</html>
<script src="../../js/jquery/3.4.1/jquery.min.js"></script>
<script src="../../css/report.js"></script>