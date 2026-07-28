<?php
// include("../api/List_RepBudget_Dtl.php");
include('../../lib/tcpdf/vendor/autoload.php');
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

function MultiCellRow($cells, $widths, $height, $data, $align, $line, $pdf)
{
    $x = $pdf->GetX();
    $y = $pdf->GetY();
    $maxheight = 0;
    $w = 0;
    for ($i = 0; $i <= $cells; $i++) {
        if ($i == $cells) {

            $pdf->MultiCell(0, $height, "", 0);
            if ($pdf->GetY() - $y > $maxheight) $maxheight = $pdf->GetY() - $y;
            $pdf->SetXY($x + (0 + $w), $y);
            $w += 0;
        } else {
            $pdf->MultiCell($widths[$i], $height, $data[$i], 0, $align[$i], true);
            if ($pdf->GetY() - $y > $maxheight) $maxheight = $pdf->GetY() - $y;
            $pdf->SetXY($x + ($widths[$i] + $w), $y);
            $w += $widths[$i];
        }
    }
    $w = 0;
    if ($line == 1) {
        $pdf->Line($x, $y, $x, $y + $maxheight);
        for ($i = 0; $i < $cells; $i++) {
            $pdf->Line($x + $widths[$i] + $w, $y, $x + $widths[$i] + $w, $y + $maxheight);
            $w += $widths[$i];
        }
        $pdf->Line($x, $y, $x + $w, $y);
        $pdf->Line($x, $y + $maxheight, $x + $w, $y + $maxheight);
    }
    return $maxheight;
}

function table_row_add($arr_column, $header_size_w)
{
    global $pdf, $header_size_w, $y, $x;
    $column_name = array_column($arr_column, 0);
    $column_align = array_column($arr_column, 1);
    $column_size = array_column($arr_column, 2);
    $sum_column_size = 0;
    foreach ($column_size as $column) if ($column != 'auto') $sum_column_size += $column;
    $column_size[array_search("auto", $column_size)] = $header_size_w - $sum_column_size;
    $pdf->setXY($x, $pdf->getY() + $y);
    $y = MultiCellRow(count($arr_column), $column_size, 6, $column_name, $column_align, 1, $pdf);
}

ob_end_clean();
$pdf = new TCPDF('P', PDF_UNIT, PDF_PAGE_FORMAT, true, 'UTF-8', false);
include('../../lib/tcpdf/tcpdf_function.php');

define('THSarabun_Bold_Italic', TCPDF_FONTS::addTTFfont('../../lib/tcpdf/fonts/THSarabun Bold Italic.ttf', 'TrueTypeUnicode'));
define('THSarabun_Italic', TCPDF_FONTS::addTTFfont('../../lib/tcpdf/fonts/THSarabun Italic.ttf', 'TrueTypeUnicode'));
define('THSarabun_Bold', TCPDF_FONTS::addTTFfont('../../lib/tcpdf/fonts/THSarabun Bold.ttf', 'TrueTypeUnicode'));
define('THSarabun', TCPDF_FONTS::addTTFfont('../../lib/tcpdf/fonts/THSarabun.ttf', 'TrueTypeUnicode'));

// remove default header/footer
$pdf->setPrintHeader(false);
$pdf->setPrintFooter(false);

// set margins
$pdf->SetMargins(0, 0, 0, true);

$pdf->SetFillColor(0, 0, 0, 0);
// $pdf->SetAutoPageBreak(TRUE, PDF_MARGIN_BOTTOM); // set auto page breaks

function table_row_add_me($arr_column, $header_size_w)
{
    global $pdf, $header_size_w, $y, $x;
    $column_name = array_column($arr_column, 0);
    $column_align = array_column($arr_column, 1);
    $column_size = array_column($arr_column, 2);
    $sum_column_size = 0;
    // foreach ($column_size as $column) if ($column != 'auto') $sum_column_size += $column;
    // $column_size[array_search("auto", $column_size)] = $header_size_w - $sum_column_size;
    $pdf->setXY($x, $pdf->getY() + $y);
    $y = MultiCellRow(count($arr_column), $column_size, 6, $column_name, $column_align, 1, $pdf);
    return $y;
}

$caption = "รายละเอียดเงินขอเบิก (รายการทะเบียนคุมงบประมาณ)";

// $data_dtl = json_decode(List_QueryParam(), true);

function changeNumFormat0($val)
{
    if ($val > 0) {
        $val = number_format($val, 2);
    } else if ($val < 0) {
        $val = "<font color=red>(" . number_format(abs($val), 2) . ")</font>";
    } else {
        $val = "0.00";
    }
    return $val;
}

/*************************************************/
/******************** HEADER *********************/
/*************************************************/
$PageOrientation = "P"; // L / P
$pdf->setPageOrientation($PageOrientation, true, 0);
$header_size_w = $PageOrientation == "P" ? 185 : ($PageOrientation == "L" ? 278 : "");
$pdf->AddPage($PageOrientation);

// BgImage('doc_img/50_twi.jpg');
$pdf->SetFillColor(0, 0, 0, 0);
$pdf->setXY(5, 5);

$pdf->SetFont(THSarabun, '', 10);
$pdf->setXY(5, 5);
$pdf->Cell($header_size_w, 6, $pdf->getPage(), 0, 2, 'R');

$pdf->SetFont(THSarabun_Bold, '', 17);
$pdf->setXY(5, 5);
$pdf->setCellHeightRatio(1);
$pdf->Cell($header_size_w, 6, "มหาวิทยาลัยนวมินทราธิราช", 1, 2, 'C');
$pdf->setXY(5, 20);
$pdf->Cell(20, 6, "มหาวิทยาลัยนวมินทราธิราช", 1, 2, 'C');
$pdf->MultiCell(20, 6, "มหาวิทยาลัยนวมินทราธิราช",1, 2);
MultiCellRow(4, ['10','20','30','40'], 6, ['นอน','ข้าวข้าวข้าวข้าวข้าวข้าว','แกง','ข้าว'], ['C','L','R','C'], 1, $pdf);
// $y = MultiCellRow(count($arr_column), $column_size, 6, $column_name, $column_align, 1, $pdf);

// $dc_cost_acc_name = $db->GetDataBySQL("select c_name from " . DB_CENTER . "dc_cost where dc_cost_id = ?", array($_REQUEST["dc_cost_acc_id"]));
// // if (in_array($_REQUEST["dc_expense_budget_type_id"], array(15, 16, 18, 24, 36, 37))) {
// //     $dc_cost_acc_name = "กองทุนของคณะแพทยศาสตร์วชิรพยาบาล";
// // } else if (in_array($_REQUEST["dc_expense_budget_type_id"], array(38, 43, 44))) {
// //     $dc_cost_acc_name = "กองทุนมหาวิทยาลัยนวมินทราธิราช";
// // }
// // $pdf->Cell($header_size_w, 6, $dc_cost_acc_name, 0, 2, 'C');
// $bg_expense_name = "";
// $pdf->Cell($header_size_w, 6, $caption, 0, 2, 'C');
// $pdf->SetFont(THSarabun, '', 13);
// $pdf->SetTextColor(0, 10, 150);
// $pdf->setCellHeightRatio(0.1);
// if (@$_REQUEST["bg_expense_id"] > 0) {
//     $bg_expense_name = $db->GetDataBySQL("SELECT c_code+' '+c_name FROM bg_expense WHERE bg_expense_id = ? AND i_level = ?", array($_REQUEST["bg_expense_id"], $_REQUEST["i_level"]));
//     $bg_expense_name = "เงื่อนไขรายการ Lv{$_REQUEST['i_level']} : " . $bg_expense_name . "";
// }
// $pdf->Cell($header_size_w, 4.8,  $bg_expense_name, 0, 2, 'L');

// // $cond = ["0" => "ทั้งหมด", "2" => "Bulk Payment", "1" => "Bulk (ไม่ผ่านระบบ)"];
// // $pdf->Cell($header_size_w, 4.8, "รูปแบบการโอน : " . $cond[$_REQUEST["i_pay_outside"]], 0, 2, 'L');

// // $cond = ["0" => "ทั้งหมด", "1" => "ระหว่างดำเนินการ", "2" => "โอนสำเร็จ", "3" => "โอนไม่สำเร็จ"];
// // $pdf->Cell($header_size_w, 4.8, "สถานะ : " . $cond[$_REQUEST["i_status_pay"]], 0, 2, 'L');

// $pdf->setCellHeightRatio(1.2);
// $pdf->SetTextColor(0, 0, 0);


// /*************************************************/
// /******************* COLUMN_TABLE ****************/
// /*************************************************/
// $y = 2;
// $x = 5;
// $col_widths =
//     [
//         9,
//         20,
//         12,
//         30,
//         14,
//         16,
//         30,
//         32,
//         19,
//         19,
//         84,
//         // 42,
//     ];
// function column_table()
// {
//     global $pdf, $header_size_w, $y, $x, $col_widths;
//     $pdf->SetFillColor(240, 240, 240);
//     $pdf->SetFont(THSarabun_Bold, '', 11);

//     $arr_column = [
//         ["ลำดับ\n ", "C", $col_widths[0]],
//         ["เลขที่ใบขอเบิก\n ", "C", $col_widths[1]],
//         ["ปีงบ\nประมาณ", "C", $col_widths[2]],
//         ["หน่วยงาน\n ", "C", $col_widths[3]],
//         ["วันที่\nอนุมัติฏีกา", "C", $col_widths[4]],
//         ["เลขที่ฏีกา\n ", "C", $col_widths[5]],
//         ["แหล่งเงิน\n ", "C", $col_widths[6]],
//         ["จ่ายให้\n ", "C", $col_widths[7]],
//         ["จำนวนเงิน\n ", "C", $col_widths[8]],
//         ["จำนวนเงิน\nรับคืน", "C", $col_widths[9]],
//         ["คำอธิบาย\n ", "C", $col_widths[10]],
//         // ["หมายเหตุ\n ", "C", $col_widths[11]],
//     ];
//     table_row_add_me($arr_column, $header_size_w);
// }
// column_table();


// /*************************************************/
// /******************* DATA_TABLE ******************/
// /*************************************************/

// if (!count($data_dtl["data"])) {
//     $pdf->SetFillColor(0, 0, 0, 0);
//     $pdf->SetFont(THSarabun_Bold, '', 18);
//     table_row_add_me([["ไม่มีข้อมูล ", "C", "auto"]], $header_size_w);
// }

// foreach ($data_dtl["data"] as $index => $jObj) {
//     if ($pdf->getY() >= ($PageOrientation == "P" ? 259 : ($PageOrientation == "L" ? 150 : ""))) {
//         $pdf->AddPage($PageOrientation);
//         $pdf->SetFont(THSarabun, '', 10);
//         $pdf->setXY(15, 5);
//         $pdf->Cell($header_size_w, 6, $pdf->getPage(), 0, 2, 'R');
//         $y = 0;
//         $pdf->setY(15);
//         column_table();
//     }

//     if (@$jObj["i_type"] == 1) {
//         $pdf->SetFillColor(0, 0, 0, 0);
//         $pdf->SetFont(THSarabun, '', 10);
//         /***** DATA *****/
//         $arr_dtl_val = [
//             [$jObj["no"], "C", $col_widths[0]],
//             [$jObj["c_code"], "C", $col_widths[1]],
//             [$jObj["i_budget_year_overlap"] + 543, "C", $col_widths[2]],
//             [$jObj["dc_cost_name"], "L", $col_widths[3]],
//             [$jObj["d_approve_date"], "C", $col_widths[4]],
//             [$jObj["c_approve"], "C", $col_widths[5]],
//             [$jObj["dc_expense_budget_type_name"], "L", $col_widths[6]],
//             [$jObj["po_creditor_name"], "L", $col_widths[7]],
//             [changeNumFormat0($jObj["f_total"]), "R", $col_widths[8]],
//             [changeNumFormat0($jObj["f_return"]), "R", $col_widths[9]],
//             [$jObj["po_comment"], "L", $col_widths[10]],
//             // [$jObj["c_comment"], "L", $col_widths[11]],
//         ];
//     } else {
//         $pdf->SetFillColor(202, 202, 202);
//         $pdf->SetFont(THSarabun_Bold, '', 11);
//         /***** SUM *****/
//         if ($jObj["i_type"] == 4) {
//             $arr_dtl_val = [
//                 ["รวม :    " . changeNumFormat0($jObj["f_total"]), "R", '182'],
//                 [changeNumFormat0($jObj["f_return"]), "R", 19],
//                 ["", "R", 84],
//             ];
//         } else {
//             $arr_dtl_val = [
//                 ["รวม :    " . changeNumFormat0($jObj["f_total"]), "R", '182'],
//                 ["", "R", 84 + 19],
//             ];
//         }
//         // if ($_REQUEST["i_status_pay_display"]) $arr_dtl_val[] = ["", "C", 53 + 21];
//     }
//     table_row_add_me($arr_dtl_val, $header_size_w);
// }




// /*************************************************/
// /******************* END *************************/
// /*************************************************/
// $pdf->Output();
$pdf->Output(substr($_SERVER['PATH_INFO'], 1), 'I');
@ob_end_flush();
$pdf->Close();
exit;
