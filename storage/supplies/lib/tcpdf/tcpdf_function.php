<?php

function Text($x, $y, $s, $a = null)
{
    global $pdf;
    $pdf->SetXY($x, $y);
    // $pdf->Write(0, $s);
    $pdf->Cell(0, 0, $s, 0, 1, $a ? $a : 'L');
}
function ScalePage($p = null)
{
    global $pdf;
    if ($p == 'L') {
        $pdf->SetLineWidth(0.1);
        $pdf->SetDrawColor(220, 220, 220, 220);
        $pdf->SetFont(THSarabun, '', 8.5);
        for ($i = 5; $i < 300; $i += 5) {
            Text(0, $i - 3, $i);
            $pdf->Line(4, $i, 500, $i);

            Text($i - 1, 2.5, $i);
            $pdf->Line($i, 4, $i, 500);
        }
    } else {
        $pdf->SetLineWidth(0.1);
        $pdf->SetDrawColor(220, 220, 220, 220);
        $pdf->SetFont(THSarabun, '', 8.5);
        for ($i = 5; $i < 300; $i += 5) {
            Text(0, $i - 2, $i);
            $pdf->Line(4, $i, 500, $i);

            Text($i - 2, 0, $i);
            $pdf->Line($i, 4, $i, 500);
        }
    }
}
function BgImage($image_file)
{
    global $pdf;
    $pdf->Image($image_file, 0, 0, $pdf->getPageWidth(), $pdf->getPageHeight(), '', '', '', false, 300, '', false, false, 0, 'page', false, false);
}
