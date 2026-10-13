<?php
require '../../lib/excel/vendor/autoload.php' ;

use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Style\NumberFormat;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;

// mockup data by json file ex. you can use retrive data from db.
$json      = file_get_contents ( './js/employee.json' ) ;
$employees = json_decode($json, true);

$spreadsheet = new Spreadsheet();
$sheet = $spreadsheet->getActiveSheet();

// header
$spreadsheet -> getActiveSheet ()
    -> setCellValue ( 'A1' , 'รหัสพนักงาน' )
    -> setCellValue ( 'B1' , 'ชื่อ' )
    -> setCellValue ( 'C1' , 'นามสกุล' )
    -> setCellValue ( 'D1' , 'อีเมล์' )
    -> setCellValue ( 'E1' , 'เพศ' )
    -> setCellValue ( 'F1' , 'เงินเดือน' )
    -> setCellValue ( 'G1' , 'เบอร์โทรศัพท์' ) ;

// cell value
$spreadsheet->getActiveSheet()->fromArray($employees, null, 'A2');

// style
$last_row = count($employees) + 1;
$spreadsheet->getActiveSheet()->getStyle('F2:F' . $last_row)
    ->getNumberFormat()
    ->setFormatCode(NumberFormat::FORMAT_NUMBER_COMMA_SEPARATED1);
//format
$spreadsheet->getActiveSheet()->getStyle('G1:G'.$last_row)->getNumberFormat()
    ->setFormatCode('0000000000');
//font weight bol A1 to G1
$spreadsheet->getActiveSheet()->getStyle('A1:G1')->getFont()->setBold(true);

foreach(range('A','G') as $columnID) {
    $spreadsheet->getActiveSheet()->getColumnDimension($columnID)->setAutoSize(true);
}

$writer = new Xlsx ( $spreadsheet ) ;
// save file to server and create link
$writer->save('excel/itoffside.xlsx');
echo '<a href="excel/itoffside.xlsx">Download Excel</a>' ;
// save with browser
//header ( 'Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ) ;
//header ( 'Content-Disposition: attachment; filename="itoffside.xlsx"' ) ;
//$writer -> save ( 'php://output' ) ;
