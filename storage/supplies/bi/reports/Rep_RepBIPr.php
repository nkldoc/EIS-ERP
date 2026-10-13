<?php
include("../api/List_RepBIPr.php");

$s_title = true;
$title = CUSTOMER_NAME_TH;

$caption = "รายงาน สรุปรายเดือนซื้อจ้างพัสดุ";

$c_mm	= sprintf("%02d", $_REQUEST["i_mm"]);
$c_year = $_REQUEST["i_year"]+543; 
$i_budget_year = $_REQUEST["i_year"]+543;

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

//$data_dtl = json_decode(List_QueryParam($_REQUEST['i_mm'],$_REQUEST['i_year']), true); 

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
      
		echo "<div align='center'><strong><img style='padding-top:20px;' src=\"../images/100px.png\" alt=\"Girl in a jacket\"></strong></div>";
		echo "<div align='center'><strong>" . $caption . "</strong></div>";
 		echo "<div align='center' style='padding-bottom:20px;'><strong> เดือน " . $date->l_month_thai[$c_mm] . "  " . $c_year ."</strong></div>";
 		
                
             
                 
                $str = str_replace(";", ",",$_REQUEST['sp_emp_id'], $count);
                $emp_arr = explode(',', $str);
                
                if($emp_arr[0]==0){
                     $sp_emp =  "";
                }else{
                     $sp_emp =  " and a.sp_emp_id in (".$str.") ";
                }
               
//                echo $sp_emp;    
//                exit();
                
                $f1         = json_decode(List_QueryParam($sp_emp,$_REQUEST['i_mm'],$_REQUEST['i_year'])); 
                $sp_emp_id  = 0; 
                $emp = "";
                $str = "";
                $tt         = array("i_product_type2"=>0,"ebidding"=>0,"finding"=>0,"less5"=>0,"more5"=>0,"total"=>0,"percetage"=>0);
                $parArr     = array();
                
                    $i_product_type2 = 0;
                    $ebidding  = 0;
                    $finding  = 0;
                    $less5 = 0;
                    $more5 = 0;
                    $total = 0;
                    $percetage = 0;
                     $i = 0;
            foreach($f1->data as $k=>$v){
                $i++;
 //==========================================================    
             
              $parArr[$v->sp_emp_id][$v->i_groupMenu] = $v->percetage ;   
              
               if($v->sp_emp_id != $sp_emp_id){ 
                    
                    $emp = "สายงาน {$v->c_department} {$v->c_emp}"; 
                    if($tt["percetage"]>0){
                        $empArr[] = $sp_emp_id;
 
                        $empName[$sp_emp_id]["c_emp"] = $c_emp;    
                        
                                    
                                    $str .="<tr><th style='text-indent:5px; background:#eee;vertical-align:middle; width: 150px;' nowrap><b> รวม {$c_emp} </b> </th>"
                                           . "<th style='text-align:center; background:#eee;vertical-align:middle; width: 150px;' nowrap>{$i_product_type2}</th>
						<th style='text-align:center; background:#eee;vertical-align:middle; width: 150px;' nowrap>{$ebidding}</th>
						<th style='text-align:center; background:#eee;vertical-align:middle; width: 150px;' nowrap>{$finding}</th>
						<th style='text-align:center; background:#eee;vertical-align:middle; width: 150px;' nowrap>{$less5}</th>
						<th style='text-align:center; background:#eee;vertical-align:middle; width: 150px;' nowrap>{$more5}</th>
						<th style='text-align:center; background:#eee;vertical-align:middle; width: 150px;' nowrap>{$total}</th> 
						<th style='text-align:center; background:#eee;vertical-align:middle; width: 150px;' nowrap> </th><tr>";          
                                   $str .="<tr><td colspan=8 style='text-indent:5px; background:#eee;vertical-align:middle;height:300px; width: 150px;' nowrap> ".genPie($sp_emp_id)." </td></tr>";            
                        $i_product_type2 =0;
                        $ebidding =0;
                        $finding =0;
                        $less5 =0;
                        $more5 =0;
                        $total =0;
                        $percetage =0;
                                    
                   }
                    
                    $str .='<table width="100%" class="table_report" border="0" cellspacing="1" cellpadding="0">
				<thead valign="top"> 
					<tr>
						<th style="padding:5px;background:#ccc; vertical-align:middle; width: 150px;" nowrap> พนักงาน/สถานะ</th> 
                                                <th style="padding:5px;background:#ccc;vertical-align:middle; width: 150px;" nowrap> ครุภัณฑ์</th>
						<th style="padding:5px;background:#ccc;vertical-align:middle; width: 150px;" nowrap> e-bidding</th>
						<th style="padding:5px;background:#ccc;vertical-align:middle; width: 150px;" nowrap>คัดเลือก</th>
						<th style="padding:5px;background:#ccc;vertical-align:middle; width: 150px;" nowrap>เจาะจงไม่เกิน 5 แสน</th>
						<th style="padding:5px;background:#ccc;vertical-align:middle; width: 150px;" nowrap>เจาะจงมากกว่า 5 แสน</th>
						<th style="padding:5px;background:#ccc;vertical-align:middle; width: 150px;" nowrap>Total</th> 
						<th style="padding:5px;background:#ccc;vertical-align:middle; width: 150px;" nowrap>คิดเป็นเปอร์เซนต์ของงานทั้งหมด</th> 
					</tr>
				</thead> 
			';
                    $str .="<tr><td colspan=8 style='text-indent:5px; background:#eee;vertical-align:middle; width: 150px;' nowrap> สายงาน {$v->c_department} {$v->c_emp} </td></tr>"; 
               
          
                //--------------------------------------------------
                $i_groupMenu    = $v->i_groupMenu;  
                $percetage      = $v->percetage;  
                $sp_emp_id      = $v->sp_emp_id;  
                $c_emp          = $v->c_emp;   
              
               } 
               
               
               $jtxt = " text-indent:15px;";
               $str .="
                    <tr>
                           
                            <td style='{$jtxt} vertical-align:middle; width: 150px;' nowrap> {$v->groupMenu}</td>
                            <td style='text-align:center; vertical-align:middle; width: 150px;' nowrap> {$v->i_product_type2}</td>
                            <td style='text-align:center; vertical-align:middle; width: 150px;' nowrap> {$v->ebidding}</td>
                            <td style='text-align:center; vertical-align:middle; width: 150px;' nowrap> {$v->finding}</td>
                            <td style='text-align:center; vertical-align:middle; width: 150px;' nowrap> {$v->less5}</td> 
                            <td style='text-align:center; vertical-align:middle; width: 150px;' nowrap> {$v->more5}</th> 
                            <td style='text-align:center; vertical-align:middle; width: 150px;' nowrap> {$v->total}</td> 
                            <td style='text-align:center; vertical-align:middle; width: 150px;' nowrap> {$v->percetage}</td> 
                    </tr>";    
                        $i_product_type2 += $v->i_product_type2;
                        $ebidding += $v->ebidding;
                        $finding += $v->finding;
                        $less5 += $v->less5; 
                        $more5 += $v->more5;
                        $total += $v->total;
                        $percetage +=$v->percetage;  
                        
                $tt["i_product_type2"] += $v->i_product_type2;
                $tt["ebidding"] += $v->ebidding;
                $tt["finding"] += $v->finding;
                $tt["less5"] += $v->less5; 
                $tt["more5"] += $v->more5;
                $tt["percetage"] +=$v->percetage;    
                $sp_emp_id = $v->sp_emp_id;     
                
                
} //End Loop i_groupMenu
  
 if($i>0){                       
                    
                        $empName[$sp_emp_id]["c_emp"] = @$c_emp;    
          
                        
 $str .="<tr><th style='text-indent:5px; background:#eee;vertical-align:middle; width: 150px;' nowrap><b> รวม {$c_emp} </b> </th>"
                                           . "<th style='text-align:center; background:#eee;vertical-align:middle; width: 150px;' nowrap>{$i_product_type2}</th>
						<th style='text-align:center; background:#eee;vertical-align:middle; width: 150px;' nowrap>{$ebidding}</th>
						<th style='text-align:center; background:#eee;vertical-align:middle; width: 150px;' nowrap>{$finding}</th>
						<th style='text-align:center; background:#eee;vertical-align:middle; width: 150px;' nowrap>{$less5}</th>
						<th style='text-align:center; background:#eee;vertical-align:middle; width: 150px;' nowrap>{$more5}</th>
						<th style='text-align:center; background:#eee;vertical-align:middle; width: 150px;' nowrap>{$total}</th> 
						<th style='text-align:center; background:#eee;vertical-align:middle; width: 150px;' nowrap> </th><tr>";          
$str .="<tr><td colspan=8 style='text-indent:5px; background:#eee;vertical-align:middle;height:300px; width: 150px;' nowrap> ".genPie($sp_emp_id)." </td></tr>"; 
 }
 
echo $str;
?> 
 </table>
<!--</div>--> 
</body> 
</html>
<script> 
 
<?PHP 
// print_r($parArr); exit();
 
foreach($parArr as $k=>$v){ 
  
// echo $k ." == ".$v[3]."<br>"; 
// exit();
    
        echo 'genScriptPire("'.$k.'","'.$empName[$k]["c_emp"].'", [{ name :"รอดำเนินการ", value:"'.$v[1]
                                    . '"},{ name :"อยู่ระหว่างดำเนินการ", value:"'.$v[2]
                                    . '"},{ name :"รอส่งมอบ",  value:"'.$v[3]
                                    . '"},{ name :"ส่งมอบแล้ว",  value:"'.$v[4]
                                    . '"},{ name :"ตรวจรับแล้ว",  value:"'.$v[5]
                                    . '"},{ name :"ส่งเบิกแล้ว",  value:"'.$v[6]
                                    . '"},{ name :"ยกเลิก",  value:"'.$v[7]
                                    . '"}],[{ name :"รอดำเนินการ", value:"'.$v[1]
                                    . '"},{ name :"อยู่ระหว่างดำเนินการ", value:"'.$v[2]
                                    . '"},{ name :"รอส่งมอบ",  value:"'.$v[3]
                                    . '"},{ name :"ส่งมอบแล้ว",  value:"'.$v[4]
                                    . '"},{ name :"ตรวจรับแล้ว",  value:"'.$v[5]
                                    . '"},{ name :"ส่งเบิกแล้ว",  value:"'.$v[6]
                                    . '"},{ name :"ยกเลิก",  value:"'.$v[7]
                                    . '"}]);'; 
       echo "\n\r"; 
//       exit();
       
}     
 
?>                   
 
</script>