<?php
require '../../lib/excel/vendor/autoload.php' ;

use PhpOffice\PhpSpreadsheet\Spreadsheet ;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;

// mockup data by json file ex. you can use retrive data from db.
$json      = file_get_contents ( './js/employee.json' ) ;
$employees   = json_decode ( $json , true ) ;
$spreadsheet = new Spreadsheet() ;
$sheet       = $spreadsheet -> getActiveSheet () ;
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
$spreadsheet -> getActiveSheet () -> fromArray ( $employees , null , 'A2' ) ;
$spreadsheet -> getActiveSheet () -> getStyle ( 'A1:G1' ) -> getFont () -> setBold ( true ) ;
foreach ( range ( 'A' , 'G' ) as $columnID ) {
    $spreadsheet -> getActiveSheet () -> getColumnDimension ( $columnID ) -> setAutoSize ( true ) ;
}
$writer = new Xlsx ( $spreadsheet ) ;

header ( 'Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ) ;
header ( 'Content-Disposition: attachment; filename="itoffside.xlsx"' ) ;
$writer -> save ( 'php://output' ) ;
