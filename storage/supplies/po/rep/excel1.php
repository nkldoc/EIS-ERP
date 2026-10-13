<?php
require '../../lib/excel/vendor/autoload.php' ;
require ( './ListRep0001.php' ) ; //data

use PhpOffice\PhpSpreadsheet\Spreadsheet ;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx ;

$json        = ListJson () ;
$arrJson     = json_decode ( $json , true ) ;
$spreadsheet = new Spreadsheet() ;
$sheet       = $spreadsheet -> getActiveSheet () ;
$employees   = $arrJson[ "data" ] ;

$spreadsheet -> getActiveSheet ()
    -> setCellValue ( 'A1' , 'หน่วยงาน' )
    -> setCellValue ( 'B1' , 'ประเภทงบ' )
    -> setCellValue ( 'C1' , 'วัน เดือน ปี/ตรวจรับ ' )
    -> setCellValue ( 'D1' , 'เลขที่/จัดทำใบขอเบิก' )
    -> setCellValue ( 'E1' , 'วัน เดือน ปี/จัดทำใบขอเบิก' )
    -> setCellValue ( 'F1' , 'วัน เดือน ปี/รับใบขอเบิก(คลัง)' )
    -> setCellValue ( 'G1' , 'เลขที่/อนุมัติฎีกา' )
    -> setCellValue ( 'H1' , 'วัน เดือน ปี/อนุมัติฎีกา' )
    -> setCellValue ( 'I1' , 'จ่ายให้' )
    -> setCellValue ( 'J1' , 'รายละเอียด' )
    -> setCellValue ( 'K1' , 'จำนวน' )
    -> setCellValue ( 'L1' , 'จำนวนเงิน' )
    -> setCellValue ( 'M1' , 'หมายเหตุ' )
    -> setCellValue ( 'N1' , 'ผู้ดำเนินการ' )
    -> setCellValue ( 'O1' , 'ผู้ตรวจสอบ' )
;
// cell value
$spreadsheet -> getActiveSheet () -> fromArray ( $employees , null , 'A2' ) ;
$spreadsheet -> getActiveSheet () -> getStyle ( 'A1:G1' ) -> getFont () -> setBold ( true ) ;
foreach ( range ( 'A' , 'P' ) as $columnID ) {
    $spreadsheet -> getActiveSheet () -> getColumnDimension ( $columnID ) -> setAutoSize ( true ) ;
}
$writer = new Xlsx ( $spreadsheet ) ;
header ( 'Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ) ;
header ( 'Content-Disposition: attachment; filename="itoffside.xlsx"' ) ;
$writer -> save ( 'php://output' ) ;


