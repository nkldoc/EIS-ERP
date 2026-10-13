<?php
function ReadNumber__($number)
{
    $position_call = array("แสน", "หมื่น", "พัน", "ร้อย", "สิบ", "");
    $number_call = array("", "หนึ่ง", "สอง", "สาม", "สี่", "ห้า", "หก", "เจ็ด", "แปด", "เก้า");
    $number = $number + 0;
    $ret = "";
    if ($number == 0) return $ret;
    if ($number > 1000000) {
        $ret .= ReadNumber__(intval($number / 1000000)) . "ล้าน";
        $number = intval(fmod($number, 1000000));
    }

    $divider = 100000;
    $pos = 0;
    while ($number > 0) {
        $d = intval($number / $divider);
        $ret .= (($divider == 10) && ($d == 2)) ? "ยี่" : ((($divider == 10) && ($d == 1)) ? "" : ((($divider == 1) && ($d == 1) && ($ret != "")) ? "เอ็ด" : $number_call[$d]));
        $ret .= ($d ? $position_call[$pos] : "");
        $number = $number % $divider;
        $divider = $divider / 10;
        $pos++;
    }
    return $ret;
}
function changeNumCharTH($amount_number)
{
    $amount_number = number_format($amount_number, 2, ".", "");
    $pt = strpos($amount_number, ".");
    $number = $fraction = "";
    if ($pt === false)
        $number = $amount_number;
    else {
        $number = substr($amount_number, 0, $pt);
        $fraction = substr($amount_number, $pt + 1);
    }

    $ret = "";
    $baht = ReadNumber__($number);
    if ($baht != "")
        $ret .= $baht . "บาท";

    $satang = ReadNumber__($fraction);
    if ($satang != "")
        $ret .=  $satang . "สตางค์";
    else
        $ret .= "ถ้วน";
    return $ret;
}
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

function MultiCellRow($cells, $widths, $height, $data, $align, $line, $pdf, $line_end = false)
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
            @$w2 += @$widths[$i - 1];
            $w += $widths[$i];
            if ($line_end) {
                if ($line_end[$i]) {
                    $pdf->Line($x + $w2, $y + $maxheight, $x + $w, $y + $maxheight);
                }
            }
        }
        $pdf->Line($x, $y, $x + $w, $y);
        if (!$line_end) {
            $pdf->Line($x, $y + $maxheight, $x + $w, $y + $maxheight);
        }
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
    return $y;
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