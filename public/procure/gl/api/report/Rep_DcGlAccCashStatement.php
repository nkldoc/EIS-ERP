<?php
	include("../../../conf/config.php");
                        
    include("../../conf/configGl.php");
	include("../../../lib/database/DatabaseServer.php");
	include("../../../lib/date/i_date.class.php");
	 
    define("START_YEAR_BG", 2017); //ปีงบประมาณ       
        ###################
	$db 	= new DatabaseServer();
	$date 	= new i_date();
	########################################################################## 
 

    function getLevel($i,$tt,$id,$i_row){
         global $db,$date,$arr_i_source,$arr_i_source_item1,$arr_i_source_item2; 

    $sqlMain	="select a.c_code,a.c_name ,b.i_source ,i_source_item
		from dc_acc a 
		inner join gl_rep_conf_dtl b on b.dc_acc_id =  a.dc_acc_id and b.gl_rep_conf_id=?
		where a.i_group in (1,2,3) and a.i_level in(4,6) Order by a.i_group,c_code,c_name asc";
    
	$arrParam	=   array($id); 
	$stmt           =   $db->QueryParam($sqlMain, $arrParam);
	$c              =   0;
    $str            =   null;
                while($row =$db->Fetch($stmt)) {
				   $str .= "<tr>"
					."<td align='left'>".$row["c_code"]."</td>"  
					."<td align='left'>".$row["c_name"]."</td>" 
					."<td align='left'>".$arr_i_source[$row["i_source"]]."</td>"
					."<td align='left'>".($row["i_source"]==1?$arr_i_source_item1[$row["i_source_item"]]:$arr_i_source_item2[$row["i_source_item"]])."</td>" 	
					."</tr>";
					$c++;
                }
		  
		  $dtl_acc = "<table cellspacing='0' cellpadding='0' width='93%' border='0' style=\"margin-left:7%; border-collapse:collapse;border:none;mso-border-alt:solid windowtext .1pt;mso-padding-alt:0cm 1.0pt 0cm 1.0pt\">
				<tr bgcolor='#EEE'>
					<th width='10%' align='center'><b>รหัสบัญชี</b></th>
					<th width='50%' align='center'><b>รายการ</b></th>
					<th width='20%' align='center'><b>แหล่งที่มาของเงิน</b></th>
                    <th width='20%' align='center'><b>สูตรคำนวณ</b></th>
				</tr>
				{$str}
			</table>";
			
            if($i!=1 && $i!=3) 
                $tt = "{$tt}";
				$tt .= ($c>0)?$dtl_acc:"";		
            if($i==1 || $i==8 || $i==9)$txt = "<div style='font-weight:bold;'>{$tt}</div>";
            else if($i==2 || $i==3 || $i==5 || $i==6) $txt = "<div style='padding-left:10px;'>{$tt}</div>";    
           
		   else $txt = "<div style='padding-left:20px;'>{$tt}</div>";
            
            return $txt;
        }

		
	function headerX($t='',$rd){
		$title= $_REQUEST['titleReport'];
		$tt = isset($t) && $t!=''?true:false;
		switch($t)
		{ 
			case 'excel': $ttt = 'xls'; break; 
			case 'downloadHTML': $ttt = 'html'; break;  
			case 'html': $ttt 	= ''; break;
			default: $ttt='';
		} 
		if($ttt!=''){ //file include is not spacing outer tag php
			header("Content-Type: application/octet-stream");
			header("Content-Transfer-Encoding: binary");
			header('Expires: '.gmdate('D, d M Y H:i:s').' GMT');
			header('Content-Disposition: attachment; filename = "'.$title.' '.date("Y-m-d-H-i-s").'.'.$ttt.'"');
			header('Pragma: no-cache'); 
			echo chr(255).chr(254).iconv("UTF-8", "UTF-16LE//IGNORE", $rd);  
		}else{
			header('Content-Type: text/html; charset=utf-8');
			echo '<style type="text/css"> table { font-size:14px;} body{ padding:0px; margin:5px;padding:2px;  } #footer td{ background-color:#fff;} '
                        . ' a:link {
                                color: #333;
                                text-decoration:none;
                            } 
                            a:visited {
                                color: #333;
                            } 
                            a:hover {
                                color: gray;
                            } 
                            a:active {
                                color: #333;
                            }
                            .Underlined { border-bottom:1px solid #000; }
                            h3.dblUnderlined { border-bottom: 3px double; }
                            </style>';
                        echo '<script>
                               
                              </script>';
			echo $rd;
		}   
	}; //Function



	//iSearch

	$where = "";        
            
	$sql = "select a.gl_dc_activity_id,a.gl_rep_conf_id as id,b.gl_rep_conf_id,a.c_name,a.i_show,a.i_row from gl_rep_conf a
                    left join gl_rep_conf_dtl b on b.gl_rep_conf_id=a.gl_rep_conf_id
                where 1=?
                group by a.gl_dc_activity_id,a.gl_rep_conf_id,b.gl_rep_conf_id,a.c_name,a.i_show,a.i_row 
                order by a.i_row asc";

	$stmt = $db->QueryParam($sql, array(1)); 
	$i = 1;
	$str = ""; 
	while ($data = $db->Fetch($stmt))
	{
 
  
                      
                        
                            $str .= "<tr>"
                                    ."<td align='center' valign='top'>{$data["i_row"]}</td>" //getLevel 
                                    ."<td align='left' valign='top'>".getLevel($data["i_show"],$data["c_name"],$data["id"],$data["i_row"])."</td>" //getLevel 
        
                                    ."</tr>"; 
      
            
 
	}// end while

	if ($str == "")
		$str = "ไม่พบข้อมูล";

	$str = "<table cellspacing='0' cellpadding='0' width='100%' border='0' style=\"border-collapse:collapse;border:none;mso-border-alt:solid windowtext .1pt;mso-padding-alt:0cm 1.0pt 0cm 1.0pt\">
				<tr><th colspan='2'>".CUSTOMER_ALL_COST_NAME."</th></tr>
                <tr><th colspan='2'>{$_REQUEST['titleReport']}</th></tr>
				 
			</table>
			<table cellspacing='0' cellpadding='0' width='100%' border='1' style=\"border-collapse:collapse;border:none;mso-border-alt:solid windowtext .1pt;mso-padding-alt:0cm 1.0pt 0cm 1.0pt\">
				<tr bgcolor='#A5BAD6'>
					<th width='5%' align='center'><b>บรรทัด</b></th> 
					<th width='95%' align='center'><b>รายการ</b></th> 
				</tr>
				{$str}
			</table>
			"; 
	if(isset($_REQUEST['mode'])) echo headerX($_REQUEST['mode'],$str); 			
?>