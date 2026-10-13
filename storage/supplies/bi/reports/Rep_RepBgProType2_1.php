<?php
include("../api/List_RepBgProType2_1.php");

$s_title = true;
$title = CUSTOMER_NAME_TH;

$caption = "รายงาน สรุปรายเดือนซื้อครุภัณฑ์ ตามแหล่งเงิน";

$c_mm	= sprintf("%02d", date('m'));
$c_year = date('Y')+543; 
$i_budget_year = date('Y')+543;

function changeNumFormat($val, $digit)
{
	if ($val > 0) {
		$val = number_format($val, $digit);
	} else if ($val < 0) {
		$val = "(" . number_format(abs($val), $digit) . ")";
	} else if ($val == "") {
		$val = "";
	} else {
		$val = "-";
	}
	return $val;
}
 
function genPie($emp_id){ 
    
                    return <<<EOF
                           <div class="row" style="height:100%; width:100%">\n
                                    <div class="col-md-12">\n
                                            <div class="x_panel">\n
                                                <div id="pie-bill-{$emp_id}" class="hv-full"></div>\n
                                            </div>\n
                                    </div>\n
                            </div>\n              
                    EOF; 
 }

?>
<html> 
<head>
	<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
	<link rel="shortcut icon" href="../../images/favicon.ico" type="image/x-icon">
	<link rel="icon" href="../../images/favicon.ico" type="image/x-icon">
	<title><?php echo COMPANY_NAME; ?></title>
	<link rel="stylesheet" type="text/css" href="../../css/bootstrap.min.css" />
	<link rel="stylesheet" type="text/css" href="../../css/dashboard.css" />
	<link rel="stylesheet" type="text/css" href="../../css/report_css.css" />
        
        <script src="../../js/jquery/3.4.1/jquery.min.js"></script>
        <script src="../../js/echarts/echarts.js"></script>
        <script src="../../js/echarts/macarons.js"></script>
        <script>
         function genScriptPire(id,title,legend_pieTotal,dataTotal){

            return echarts.init(document.getElementById("pie-bill-"+id), "macarons").setOption({
                   title: {
                           text: title+" สรุปรายเดือนซื้อจ้างพัสดุ",
                           left: "center",
                           textStyle: {
                                   fontSize: 12,
                                   lineHeight: 20
                           },
                   },
                   tooltip: {
                           trigger: "item",
                           formatter: "{a} <br/>{b} : {c} ({d})"
                   },
                   legend: {
                           bottom: 5,
                           data: legend_pieTotal,
                           orient: 'vertical',
                           left: 'right',
                           formatter: function(params) {
                                   var pos = legend_pieTotal.map(function(e) {
                                           return e.name;
                                   }).indexOf(params);
                                   return legend_pieTotal[pos]["name"] + " : " + legend_pieTotal[pos]["value"] + " %";
                           },
                   },
                   series: [{
                           name: "ภาพรวมทั้งหมด",
                           type: "pie",
                           radius: "50%",
                           selectedMode: "single",
                           // label: {
                           // 	position: 'inner'
                           // },
                           emphasis: {
                                   itemStyle: {
                                           shadowBlur: 10,
                                           shadowOffsetX: 0,
                                           shadowColor: "rgba(0, 0, 0, 0.5)"
                                   }
                           },
                           data: dataTotal
                   }]
           });  
          } 
        </script>
</head> 
<body>
	<!--<div style="background-color:#FFFFFF;">-->
		<?PHP 
      
//		echo "<div align='center'><strong><img style='padding-top:20px;' src=\"../images/100px.png\" alt=\"Girl in a jacket\"></strong></div>";
//		echo "<div align='center'><strong>" . $caption . "</strong></div>";
// 		echo "<div align='center' style='padding-bottom:20px;'><strong> เดือน " . $date->l_month_thai[$c_mm] . "  " . $c_year ."</strong></div>";
 		
                
               $dc_expense_budget_type_id = $_REQUEST['dc_expense_budget_type_id']??null;
                 
                $str = str_replace(";", ",",$dc_expense_budget_type_id, $count);
                $emp_arr = explode(',', $str);
                
                if($emp_arr[0]==0){
                     $sp_emp =  "";
                }else{
                     $sp_emp =  " and a.dc_expense_budget_type_id in (".$str.") ";
                }
 
                $f1         = json_decode(List_QueryParam(1,sprintf("%02d", date('m')),date('Y'))); 
     
                $emp = "";
              
                $tt         = array("i_product_type2"=>0,"ebidding"=>0,"finding"=>0,"less5"=>0,"more5"=>0,"total"=>0,"percetage"=>0);
                $parArr     = array();
                
       
 //==========================================================    
  
                    
                    $str .='<table width="100%" class="table_report" border="0" cellspacing="1" cellpadding="0">
				<thead valign="top"> 
					<tr>
						<th style="padding:5px;background:#ccc; vertical-align:middle; width: 150px;" nowrap>แหล่งเงิน</th> 
                                                <th style="padding:5px;background:#ccc;vertical-align:middle; width: 150px;" nowrap>รอดำเนินการ</th>
						<th style="padding:5px;background:#ccc;vertical-align:middle; width: 150px;" nowrap>อยู่ระหว่างดำเนินการ</th>
                                                <th style="padding:5px;background:#ccc;vertical-align:middle; width: 150px;" nowrap>รอส่งมอบ</th>
						<th style="padding:5px;background:#ccc;vertical-align:middle; width: 150px;" nowrap>ส่งมอบแล้ว</th>
						<th style="padding:5px;background:#ccc;vertical-align:middle; width: 150px;" nowrap>ตรวจรับแล้ว</th>
						<th style="padding:5px;background:#ccc;vertical-align:middle; width: 150px;" nowrap>ส่งเบิกแล้ว</th>
						<th style="padding:5px;background:#ccc;vertical-align:middle; width: 150px;" nowrap>ยกเลิก</th>
						<th style="padding:5px;background:#ccc;vertical-align:middle; width: 150px;" nowrap>อื่นๆ</th>
						<th style="padding:5px;background:#ccc;vertical-align:middle; width: 150px;" nowrap>Total</th> 
						<th style="padding:5px;background:#ccc;vertical-align:middle; width: 150px;" nowrap>คิดเป็นเปอร์เซนต์ของงานทั้งหมด</th> 
					</tr>
				</thead> 
			';
//                    $str .="<tr><td colspan=8 style='text-indent:5px; background:#eee;vertical-align:middle; width: 150px;' nowrap> สายงาน {$v->c_department} {$v->c_emp} </td></tr>"; 
               
          
                //--------------------------------------------------

 
              
            $i=0;
            $arrPerName = array();
            $arrPer = array();
                $i_groupMenu1 = 0;
                $i_groupMenu2 = 0; 
                $i_groupMenu3 = 0;
                $i_groupMenu4 = 0;
                $i_groupMenu5 = 0;
                $i_groupMenu6 = 0;
                $i_groupMenu7 = 0; 
                $i_groupMenu8 = 0;
            foreach($f1->data as $k=>$v){
                $i++;          
               
               $jtxt = " text-indent:15px;";
               $str .="
                    <tr>
                           
                            <td style='{$jtxt} vertical-align:middle; width: 150px;' nowrap> {$v->c_bg_name}</td>
                            <td style='text-align:center; vertical-align:middle; width: 150px;' nowrap> {$v->i_groupMenu1}</td>
                            <td style='text-align:center; vertical-align:middle; width: 150px;' nowrap> {$v->i_groupMenu2}</td>
                            <td style='text-align:center; vertical-align:middle; width: 150px;' nowrap> {$v->i_groupMenu3}</td>
                            <td style='text-align:center; vertical-align:middle; width: 150px;' nowrap> {$v->i_groupMenu4}</td> 
                            <td style='text-align:center; vertical-align:middle; width: 150px;' nowrap> {$v->i_groupMenu5}</th> 
                            <td style='text-align:center; vertical-align:middle; width: 150px;' nowrap> {$v->i_groupMenu6}</th> 
                            <td style='text-align:center; vertical-align:middle; width: 150px;' nowrap> {$v->i_groupMenu7}</th> 
                            <td style='text-align:center; vertical-align:middle; width: 150px;' nowrap> {$v->i_groupMenu8}</th> 
                            <td style='text-align:center; vertical-align:middle; width: 150px;' nowrap> {$v->total}</td> 
                            <td style='text-align:center; vertical-align:middle; width: 150px;' nowrap> {$v->percetage}</td> 
                    </tr>";    
         
                $arrPer[$v->dc_expense_budget_type_id] = $v->percetage;
                $arrPerName[$v->dc_expense_budget_type_id] = $v->c_bg_name;
                
                $i_groupMenu1 += $v->i_groupMenu1;  
                $i_groupMenu2 += $v->i_groupMenu2;  
                $i_groupMenu3 += $v->i_groupMenu3;  
                $i_groupMenu4 += $v->i_groupMenu4;  
                $i_groupMenu5 += $v->i_groupMenu5;  
                $i_groupMenu6 += $v->i_groupMenu6;  
                $i_groupMenu7 += $v->i_groupMenu7;  
                $i_groupMenu8 += $v->i_groupMenu8;    
} //End Loop i_groupMenu
                      
                    
        
$str  ="<tr><td colspan=8 style='text-indent:5px; background:#eee;vertical-align:middle;height:300px; width: 150px;' nowrap> ".genPie('7')." </td></tr>"; 
  
 
echo $str;
 
$dtl    = "";
$line   = 0; 

foreach($arrPer as $k =>$v){
    $dtl .="\n";
    if($line>0){
        $dtl .= ",{name:\"".$arrPerName[$k]."\",value:\"".$v."\"}";
    }else{ 
        $dtl .= "{name:\"".$arrPerName[$k]."\",value:\"".$v."\"}";  
    }
    
     $line++;
}
 

?> 
 </table>
<!--</div>--> 
</body> 
</html>
<script> 
 
<?PHP  
  echo 'genScriptPire("7","ภาพรวมการเงินจากแหล่งเงิน", ['.$dtl.'],['.$dtl.']);';  
?>                   
 
  
</script>