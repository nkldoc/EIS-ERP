<?php
 include("../../conf/config.php");
 include("../../lib/database/DatabaseServer.php");
 include("../../lib/database/apiUtil.php");
 include("../../lib/date/i_date.class.php");
 include("../../lib/export/exportUtil.php");
 $db = new DatabaseServer();
 $date = new i_date();
 $util = new apiUtil();
 $root = "datas";
 $data = $util->mnUser($_REQUEST);
 $con = null;

 function List_QueryParam() {
     global $db, $date, $data, $root, $con;


     $totalCount = 0;
     $sp_emp_id = $data["sp_emp_id"] ?? null;
     $d_date_start = $data['d_date_start'] ?? null;
     $d_date_end = $data['d_date_end'] ?? null;


     $con = null;
     if ($sp_emp_id > 0) {
         $con = " AND a.sp_emp_id = " . $sp_emp_id;
     }

     $sqlMain = "SELECT a.c_code
                        , a.c_name
                        , e.c_code as c_status_code, e.c_name as c_status_name
                        , (select c_name from sp_department where dc_department_id=a.dc_department_id) as c_department
                        , c.c_name as c_emp
                        , b.d_create
                        , b.c_comment
                        , (select c_name from dc_cost where dc_cost_id =a.dc_cost2_id) as c_cost2
                        , convert(varchar(10), b.d_create, 120) as d_addsing_tor
                        , ROW_NUMBER() OVER (ORDER BY a.tor_id DESC) AS row
                    FROM sp_tor a
                        inner join sp_tor_emp b on b.sp_tor_id=a.tor_id
                        inner join sp_emp c on c.sp_emp_id = a.sp_emp_id
                        inner join sp_status_hdr e on e.sp_status_hdr_id=b.sp_status_hdr_id
                        WHERE b.i_is_active = ? {$con}
                         AND b.d_create between convert(datetime,?) AND convert(datetime,?)
                    ORDER BY row;
                ";

     $stmt = $db->QueryParam($sqlMain, array(1, $d_date_start." 00:00:00", $d_date_end." 23:59:59"));

     if ($stmt) {
         while ($row = $db->Fetch($stmt)) {
             $totalCount = intVal($row["row"]);
             $temp = array(
                 "no" => intVal($row["row"]),
                 "c_code" => $row["c_code"],
                 "c_name" => $row["c_name"],
                 "c_status_code" => $row["c_status_code"],
                 "c_cost2" => $row["c_cost2"],
                 "c_status_name" => $row["c_status_name"],
                 "c_department" => $row["c_department"],
                 "c_emp" => $row["c_emp"],
                 "c_comment" => $row["c_comment"],
                 "d_addsing_tor" => $row["d_addsing_tor"],
             );
             ${$root}[] = $temp;
         }
     }
     if ($totalCount > 0) {
         return json_encode(array("debug" => true, "totalCount" => $totalCount, "datas" => ${$root}));
     } else{
         return json_encode(array("debug" => true, "totalCount" =>0, "datas" => null));
     }
 }

//END  List_QueryParam
 $c_emp_name = $data['c_emp_name'] ?? null;

 $export = new exportUtil();
 $s_title = true;
 $title = CUSTOMER_NAME_TH;
 $caption = "รายงานผู้ปฏิบัติงานตาม PR";

 if ($data["type"] == "excel") {

     header('Content-Type: application/vnd.ms-excel');
     header('Content-Disposition: inline; filename="sp_emp_tor-' . date('Ymd-H:i:s') . '.xls"');
     header('Expires: 0');
     header('Cache-Control: must-revalidate, post-check=0, pre-check=0');
     header('Pragma: public');
 }
 $tbody = "";
 $table = "";
 $style = "";
 $data_dtl = json_decode(List_QueryParam(), true);
 if ($data_dtl["totalCount"] > 0) {

     foreach ($data_dtl["datas"] as $index => $jObj) {

         $tbody .= "<tr $style>";
         $tbody .= "<td align='center' nowrap>" . $jObj["no"] . "</td>";
         $tbody .= "<td>" . $jObj["c_code"] . "</td>";
         $tbody .= "<td>" . $jObj["c_name"] . "</td>";
         $tbody.= "<td style='mso-number-format:\@;' nowrap>".  $jObj["c_cost2"] . "</td>";
         $tbody.= "<td style='mso-number-format:\@;' nowrap>".  $jObj["c_department"] . "</td>";         
         $tbody .= "<td style='mso-number-format:\@;' nowrap>" . $jObj["c_emp"] . "</td>";
         $tbody .= "<td style='mso-number-format:\@;' nowrap>" . $jObj["c_status_code"]." ".$jObj["c_status_name"] . "</td>";
         $tbody .= "<td align=center style='mso-number-format:\@;' nowrap>" . $jObj["d_addsing_tor"] . "</td>";
         $tbody .= "<td nowrap>" . $jObj["c_comment"] . "</td>";
         $tbody .= "</tr>";
     }

 }
   $table .= "<div style='page-break-after: always;'>
                    <div align='center'><strong>{$title}</strong></div>
                    <div align='center'><strong>{$caption}</strong></div>
                    <div align='center'><strong>วันที่ " . $date->shot_date_from_db($data["d_date_start"]) . " ถึงวันที่ : " . $date->shot_date_from_db($data["d_date_end"]) . "</strong></div>
                    <div style='position: relative; font-size: 11px; margin: 5px 10px;'>
                        <div style='position: relative; left: 2px;'>พนักงาน {$c_emp_name}</div>
                    </div>
                    <table class='table_report' width='100%' border='0' cellspacing='1' cellpadding='0'>
                        <thead valign='top'>
                            <tr>
                                <th style='vertical-align:middle;' rowspan=2 nowrap>ลำดับที่</th>
                                <th style='vertical-align:middle;' rowspan=2 nowrap>เลขที่ PR</th>
                                <th style='vertical-align:middle;' rowspan=2 nowrap>รายการ ซื้อจ้าง PR</th>
                                <th style='vertical-align:middle;' rowspan=2 nowrap>หน่วยงานเจ้าของเรื่อง</th>
                                <th style='vertical-align:middle;' rowspan=2 nowrap>สายงาน</th>
                                <th style='vertical-align:middle;' rowspan=2 nowrap>พนักงานผู้รับมอบ</th>
                                <th style='vertical-align:middle;' colspan=2 nowrap>รับมอบงาน</th>
                                <th style='vertical-align:middle;' rowspan=2 nowrap>หมายเหตุ</th>
                            </tr>
                            <tr>
                                <th style='vertical-align:middle;' nowrap>สถานะเมนู</th>
                                <th style='vertical-align:middle;' nowrap>วันที่</th>
                            </tr>
                        </thead>
                        <tbody>
                        {$tbody}
                        </tbody>
                    </table><br>
                </div>";
?>
<html>
    <head>
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
        <title><?php echo COMPANY_NAME; ?></title>
        <link rel="stylesheet" type="text/css" href="../../css/report_css.css" />
    </head>
    <body>
<?= $table; ?>
    </body>

</html>
<script src="../../js/jquery/3.4.1/jquery.min.js"></script>
<script src="../../css/report.js"></script>