<?php

require_once __DIR__ . '/mPDF/vendor/autoload.php';

 $url           = 'http://' . $_SERVER['HTTP_HOST'] . '/supplies/' . $_REQUEST['locat'] . '.php?id=' . $_REQUEST['id'];  /* gl/preview/Pre_GlTranHdr */
 $file_pdf_name = $_REQUEST['GX_CODE'].".pdf";
 libxml_use_internal_errors(true);
 
$d = new DOMDocument;
$mock = new DOMDocument;
$d->loadHTML(file_get_contents($url)); 

$xpath = new DomXPath($d);
// $body = $d->getElementsByTagName('div')->item(2);
$pageList = $xpath->query("//div[@class='page']");
$AllPage = $pageList->length;

for($i = 0 ; $AllPage > $i ; $i++){
    $page = $pageList->item($i);
    foreach ($page->childNodes as $child) {
        $mock->appendChild($mock->importNode($child, true));
    } 
}



$stylesheet = '
  address, 
  caption,
  cite,
  code,
  dfn,
  em,
  strong,
  th,
  caption,
  thead th {
    text-align: center;
  }
  .table_report {
    font-size: 10px;
    color: #000;
  } /* ขนาดฟ้อนต์ตาราง */
  .table_report thead td,
  .table_report thead th {
    /* หัวตาราง */
    background: #f4f4f5;
    color: #000;
  }
  .table_report {
    border-collapse: collapse;
  }
  .table_report thead td,
  .table_report thead th,
  .table_report tbody td,
  .table_report tbody th {
    border: 1px solid #e0e0e0;
  }
  .table_report tbody td,
  .table_report tbody th {
    padding: 1px 4px;
  }
  .table_report .active,
  .table_report tbody tr:hover {
    background-color: #ececec !important;
  }
  .text-overflow {
    display: block;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    border: 0px;
  }
  
  .outer {
    display: flex;
    flex-flow: column;
    height: 100%;
  }
  
  .table-overflow {
    position: relative;
    overflow: auto;
  }
  
  .class-sticky {
    position: sticky;
    top: 0;
  }
  * {
    margin: 0;
    padding: 0;

    font-size: 10px;
    box-sizing: border-box;
    -moz-box-sizing: border-box;
}


body {

    font-size: 10px;
    padding: 0;
    margin: 0;
    color: #000000;
    background: #fff;
}

.page {
    min-height: 21cm;
    width: 29.7cm;
    /* height: 21cm; */
    /* size: A4; */
    size: A4 landscape;
    padding: 2cm;
    margin: 1cm auto;
    border: 1px solid #eee;
}

.headTitle {
    font-size: 11px;
    font-weight: bold;
    text-transform: uppercase;
}';

$mpdf = new \Mpdf\Mpdf([ 
    'default_font' => 'thsarabunup',
    'format' => 'A4-L',
]);
$mpdf->WriteHTML($stylesheet, 1);
$mpdf->WriteHTML(utf8_encode($mock->saveHTML()), 2); 
$mpdf->Output($file_pdf_name, 'I');
